<?php

use App\Domain\Access\Role;
use App\Infrastructure\Persistence\Eloquent\Models\MemberModel;
use App\Infrastructure\Persistence\Eloquent\Models\MembershipPaymentModel;
use App\Infrastructure\Persistence\Eloquent\Models\MembershipPlanModel;
use App\Models\User;
use Database\Seeders\RoleSeeder;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->seed(RoleSeeder::class);
    $this->artisan('content:import');

    $this->treasurer = User::factory()->create();
    $this->treasurer->assignRole(Role::Treasurer->value);
    $this->secretary = User::factory()->create();
    $this->secretary->assignRole(Role::MembershipSecretary->value);
});

/** A past pupil asks to join on a plan; returns their member id. */
function requestMembership(string $category, string $nic = '199812345678'): string
{
    $user = User::factory()->create();
    test()->actingAs($user)->post('/my-membership/apply', [
        'full_name' => 'Kasun Perera', 'email' => 'kasun@example.test', 'phone' => '0771234567', 'nic' => $nic,
        'al_year' => 2017, 'category' => $category,
    ])->assertSessionHasNoErrors();

    // By account, not by time: two requests in the same second would otherwise be ambiguous.
    return MemberModel::query()->where('user_id', $user->id)->value('id');
}

it('starts with the annual and life fees the Membership page already showed', function () {
    expect(MembershipPlanModel::query()->orderBy('position')->pluck('fee_cents', 'category')->all())
        ->toBe(['annual' => 100000, 'life' => 1500000]);
});

it('shows the treasurer\'s plans on the public Membership page', function () {
    $this->get('/membership')->assertInertia(fn (Assert $page) => $page
        ->has('plans', 2)
        ->where('plans.0.category', 'annual')
        ->where('plans.0.feeCents', 100000)
        ->where('plans.1.recurring', false));
});

it('keeps the fee agreed when someone asks for life membership', function () {
    $id = requestMembership('life');

    $row = MemberModel::query()->find($id);
    expect($row->category)->toBe('life')->and($row->fee_cents)->toBe(1500000)->and($row->status)->toBe('applied');
});

it('needs a plan to be chosen', function () {
    $this->actingAs(User::factory()->create())->post('/my-membership/apply', [
        'full_name' => 'Kasun Perera', 'email' => 'kasun@example.test', 'phone' => '0771234567', 'nic' => '199812345678', 'al_year' => 2017,
    ])->assertSessionHasErrors('category');
});

it('lets the treasurer change a fee without changing requests already made', function () {
    $before = requestMembership('annual');

    $this->actingAs($this->treasurer)->put('/admin/membership/plans/annual', [
        'name' => 'Annual member', 'name_si' => 'ස්ථිර සාමාජික', 'fee' => '1500', 'active' => true,
    ])->assertSessionHasNoErrors();

    $after = requestMembership('annual', '200012345678');

    expect(MemberModel::query()->find($before)->fee_cents)->toBe(100000)
        ->and(MemberModel::query()->find($after)->fee_cents)->toBe(150000);
});

it('stops requests for a plan the treasurer has switched off, and hides it from the public', function () {
    $this->actingAs($this->treasurer)->put('/admin/membership/plans/life', [
        'name' => 'Life member', 'fee' => '15000', 'active' => false,
    ])->assertSessionHasNoErrors();

    $this->get('/membership')->assertInertia(fn (Assert $page) => $page->has('plans', 1));

    $this->actingAs(User::factory()->create())->post('/my-membership/apply', [
        'full_name' => 'Kasun Perera', 'email' => 'kasun@example.test', 'phone' => '0771234567', 'nic' => '199812345678',
        'al_year' => 2017, 'category' => 'life',
    ])->assertSessionHasErrors('form');
});

it('lets the committee approve a life request as annual, with the annual fee', function () {
    $id = requestMembership('life');

    $this->actingAs($this->secretary)->post("/admin/applicants/{$id}/approve", ['category' => 'annual'])->assertSessionHasNoErrors();

    $row = MemberModel::query()->find($id);
    expect($row->status)->toBe('approved')->and($row->category)->toBe('annual')->and($row->fee_cents)->toBe(100000);
});

it('lists approved members waiting for an office bearer to collect the fee', function () {
    $id = requestMembership('annual');
    $this->actingAs($this->secretary)->post("/admin/applicants/{$id}/approve");

    $this->actingAs($this->treasurer)->get('/admin/membership/payments')->assertInertia(fn (Assert $page) => $page
        ->has('awaiting', 1)
        ->where('awaiting.0.id', $id)
        ->where('awaiting.0.fee_cents', 100000)
        ->has('channels', 4));
});

it('makes the membership active when the treasurer records the collected fee', function () {
    $id = requestMembership('annual');
    $this->actingAs($this->secretary)->post("/admin/applicants/{$id}/approve");

    $this->actingAs($this->treasurer)->post("/admin/membership/payments/{$id}", [
        'amount' => '1000', 'channel' => 'bank_transfer', 'received_on' => now()->toDateString(), 'reference' => 'BOC slip 4471',
    ])->assertSessionHasNoErrors();

    $payment = MembershipPaymentModel::query()->sole();
    expect(MemberModel::query()->find($id)->status)->toBe('active')
        ->and($payment->amount_cents)->toBe(100000)
        ->and($payment->channel)->toBe('bank_transfer')
        ->and($payment->recorded_by)->toBe($this->treasurer->id);

    $this->get('/admin/membership/payments')->assertInertia(fn (Assert $page) => $page->has('awaiting', 0)->has('recent', 1));
});

it('refuses a payment before the request is approved', function () {
    $id = requestMembership('annual');

    $this->actingAs($this->treasurer)->post("/admin/membership/payments/{$id}", [
        'amount' => '1000', 'channel' => 'cash', 'received_on' => now()->toDateString(),
    ])->assertSessionHasErrors('form');

    expect(MembershipPaymentModel::query()->count())->toBe(0);
});

it('refuses a payment dated in the future', function () {
    $id = requestMembership('annual');
    $this->actingAs($this->secretary)->post("/admin/applicants/{$id}/approve");

    $this->actingAs($this->treasurer)->post("/admin/membership/payments/{$id}", [
        'amount' => '1000', 'channel' => 'cash', 'received_on' => now()->addDay()->toDateString(),
    ])->assertSessionHasErrors('received_on');
});

it('keeps fees and payments to the treasurer', function () {
    $this->actingAs($this->secretary)->get('/admin/membership/plans')->assertForbidden();
    $this->actingAs($this->secretary)->get('/admin/membership/payments')->assertForbidden();
    $this->actingAs($this->secretary)->put('/admin/membership/plans/annual', ['name' => 'X', 'fee' => '1', 'active' => true])->assertForbidden();
});
