<?php

use App\Domain\Access\Role;
use App\Infrastructure\Persistence\Eloquent\Models\MemberModel;
use App\Models\User;
use Database\Seeders\RoleSeeder;
use Inertia\Testing\AssertableInertia;

beforeEach(fn () => $this->seed(RoleSeeder::class));

function listMember(array $attrs): MemberModel
{
    static $n = 0;
    $n++;

    return MemberModel::query()->create([
        'full_name' => "Member {$n}", 'category' => 'annual', 'status' => 'active', 'source' => 'register',
        'applied_at' => now(), 'batch_key' => 2000, ...$attrs,
    ]);
}

function secretary(): User
{
    $u = User::factory()->create();
    $u->assignRole(Role::MembershipSecretary->value);

    return $u;
}

it('pages through members on the server, in membership-number order', function () {
    foreach (range(1, 30) as $i) {
        listMember(['membership_number' => "M-{$i}"]);
    }

    $this->actingAs(secretary())->get('/admin/members?page=2')
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $p) => $p->component('admin/members/index')
            ->where('members.total', 30)
            ->where('members.page', 2)
            ->where('members.last_page', 2)
            ->has('members.data', 5)
            ->where('members.data.0.number', 'M-26'));
});

it('filters by status, category, batch and country, and searches by name or number', function () {
    listMember(['full_name' => 'Kasun Perera', 'membership_number' => 'M-120', 'country' => 'Japan']);
    listMember(['full_name' => 'Nimal Silva', 'membership_number' => 'M-121', 'status' => 'approved', 'category' => 'life', 'batch_key' => 2010]);
    listMember(['full_name' => 'Sunil Fernando', 'membership_number' => 'M-5']);

    $names = fn (string $qs) => collect($this->actingAs(secretary())->get("/admin/members?{$qs}")->viewData('page')['props']['members']['data'])->pluck('name')->all();

    expect($names('search=kasun'))->toBe(['Kasun Perera'])
        ->and($names('search=120'))->toBe(['Kasun Perera'])
        ->and($names('status=approved'))->toBe(['Nimal Silva'])
        ->and($names('category=life&batch=2010'))->toBe(['Nimal Silva'])
        ->and($names('country=Japan'))->toBe(['Kasun Perera'])
        ->and($names('sort=name&direction=desc'))->toBe(['Sunil Fernando', 'Nimal Silva', 'Kasun Perera']);
});

it('shows a batch representative only their own batch, whatever batch they ask for', function () {
    $rep = User::factory()->create();
    $rep->assignRole(Role::BatchRepresentative->value);
    listMember(['user_id' => $rep->id, 'full_name' => 'Rep', 'batch_key' => 2017]);
    listMember(['full_name' => 'Same batch', 'batch_key' => 2017]);
    listMember(['full_name' => 'Other batch', 'batch_key' => 1990]);

    $this->actingAs($rep)->get('/admin/members?batch=1990')
        ->assertOk()
        ->assertInertia(fn (AssertableInertia $p) => $p->where('lockedBatch', 2017)->where('members.total', 2));
});

it('never sends the NIC, rejects bad filters and blocks people without a reviewing role', function () {
    listMember(['nic' => '199812345678', 'membership_number' => 'M-1']);

    $this->actingAs(secretary())->get('/admin/members')
        ->assertInertia(fn (AssertableInertia $p) => $p->missing('members.data.0.nic'));
    $this->actingAs(secretary())->get('/admin/members?per_page=5000')->assertSessionHasErrors('per_page');
    $this->actingAs(User::factory()->create())->get('/admin/members')->assertForbidden();
});
