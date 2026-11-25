<?php

use App\Domain\Access\Role;
use App\Infrastructure\Persistence\Eloquent\Models\ContributionModel;
use App\Infrastructure\Persistence\Eloquent\Models\FundraisingEventModel;
use App\Infrastructure\Persistence\Eloquent\Models\MemberModel;
use App\Infrastructure\Persistence\Eloquent\Models\SupporterModel;
use App\Models\User;
use Database\Seeders\RoleSeeder;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->seed(RoleSeeder::class);
    $this->artisan('content:import');
    $this->artisan('members:import-register', ['file' => dirname(__DIR__, 2).'/fixtures/register-sample.csv']);
    $this->treasurer = User::factory()->create(['name' => 'Mangala Treasurer']);
    $this->treasurer->assignRole(Role::Treasurer->value);
});

function newSupporter(array $data = []): SupporterModel
{
    $data += ['name' => 'Lanka Hardware', 'kind' => 'business', 'show_publicly' => true];
    test()->actingAs(test()->treasurer)->post('/admin/supporters', $data);

    // Created through a membership number, the name comes from the member.
    return $data['name'] !== ''
        ? SupporterModel::query()->where('name', $data['name'])->firstOrFail()
        : SupporterModel::query()->whereNotNull('member_id')->orderByDesc('id')->firstOrFail();
}

function give(SupporterModel $s, array $data): void
{
    test()->post("/admin/supporters/{$s->id}/contributions", $data + ['type' => 'sponsorship', 'received_on' => '2026-03-01', 'event_id' => '']);
}

it('adds up one sponsor across several events', function () {
    $s = newSupporter();
    give($s, ['amount' => '100,000', 'event_id' => 'new', 'new_event' => 'Wayo with Sena 2026']);
    $event = FundraisingEventModel::query()->where('name', 'Wayo with Sena 2026')->firstOrFail();
    give($s, ['amount' => '25000.50', 'event_id' => 'new', 'new_event' => 'Cricket Trophy 2026', 'received_on' => '2026-06-01']);
    give($s, ['amount' => 'Rs. 50,000', 'event_id' => $event->id, 'received_on' => '2026-07-01']);

    $this->get("/admin/supporters/{$s->id}")->assertInertia(fn (Assert $page) => $page
        ->where('account.total_cents', 17500050)
        ->where('account.by_event.0.name', 'Wayo with Sena 2026')
        ->where('account.by_event.0.count', 2));

    $this->get('/projects/sponsors')->assertInertia(fn (Assert $page) => $page
        ->where('sponsors.0.name', 'Lanka Hardware')
        ->where('sponsors.0.total_cents', 17500050)
        ->has('sponsors.0.events', 2));
});

it('keeps sponsorships and donations on their own public pages', function () {
    $s = newSupporter(['name' => 'Well Wisher', 'kind' => 'individual']);
    give($s, ['amount' => '10,000', 'type' => 'sponsorship']);
    give($s, ['amount' => '4,000', 'type' => 'donation']);

    $this->get('/projects/sponsors')->assertInertia(fn (Assert $page) => $page->where('sponsors.0.total_cents', 1000000));
    $this->get('/projects/donors')->assertInertia(fn (Assert $page) => $page->where('donors.0.total_cents', 400000)->where('donors.0.events.0.name', 'General donation'));
});

it('links a donor to their membership, showing their batch and their giving', function () {
    $member = MemberModel::query()->where('membership_number', 'M-002')->firstOrFail();
    $user = User::factory()->create();
    $member->update(['user_id' => $user->id]);

    $s = newSupporter(['name' => '', 'kind' => 'individual', 'membership_number' => 'm-2']);
    expect($s->member_id)->toBe($member->id)->and($s->name)->toBe('Test Person Two');
    give($s, ['amount' => '100,000', 'type' => 'donation']);

    $this->get('/projects/donors')->assertInertia(fn (Assert $page) => $page->where('donors.0.note', 'A/L 2017'));
    $this->actingAs($user)->get('/my-membership')->assertInertia(fn (Assert $page) => $page->where('giving.donation_cents', 10000000)->where('giving.count', 1));
});

it('links and unlinks an existing donor, one account per member', function () {
    $s = newSupporter(['name' => 'Kasun', 'kind' => 'individual']);
    $this->put("/admin/supporters/{$s->id}/member", ['membership_number' => 'M-002'])->assertSessionHasNoErrors();
    expect($s->fresh()->member_id)->not->toBeNull();

    $other = newSupporter(['name' => 'Someone Else', 'kind' => 'individual']);
    $this->put("/admin/supporters/{$other->id}/member", ['membership_number' => 'M-002'])->assertSessionHasErrors('form');
    $this->post('/admin/supporters', ['name' => '', 'kind' => 'individual', 'membership_number' => 'M-002'])->assertSessionHasErrors('form');
    $this->put("/admin/supporters/{$s->id}/member", ['membership_number' => 'M-999'])->assertSessionHasErrors('form');

    $this->put("/admin/supporters/{$s->id}/member", ['membership_number' => null]);
    expect($s->fresh()->member_id)->toBeNull();
});

it('stops voided contributions counting but keeps them in the history', function () {
    $s = newSupporter();
    give($s, ['amount' => '10,000']);
    give($s, ['amount' => '10,000']);
    $duplicate = ContributionModel::query()->latest('id')->first();

    $this->post("/admin/supporters/contributions/{$duplicate->id}/void", ['reason' => 'Entered twice'])->assertSessionHasNoErrors();

    $this->get("/admin/supporters/{$s->id}")->assertInertia(fn (Assert $page) => $page
        ->where('account.total_cents', 1000000)
        ->has('account.contributions', 2));
    $this->post("/admin/supporters/contributions/{$duplicate->id}/void", ['reason' => 'Again'])->assertSessionHasErrors('form');
});

it('refuses amounts it cannot read and dates in the future', function () {
    $s = newSupporter();
    give($s, ['amount' => 'about 10k']);
    $this->assertNotNull(session('errors')?->get('amount'));
    give($s, ['amount' => '10,000', 'received_on' => now()->addDays(3)->toDateString()]);
    expect(ContributionModel::query()->count())->toBe(0);
});

it('does not create the same supporter twice', function () {
    newSupporter();
    $this->post('/admin/supporters', ['name' => 'lanka hardware', 'kind' => 'business'])->assertSessionHasErrors('form');
    expect(SupporterModel::query()->count())->toBe(1);
});

it('keeps hidden supporters off the public pages but in the accounts', function () {
    $s = newSupporter(['name' => 'Quiet Donor', 'kind' => 'individual']);
    give($s, ['amount' => '5,000', 'type' => 'donation']);
    $this->put("/admin/supporters/{$s->id}", ['name' => 'Quiet Donor', 'kind' => 'individual', 'show_publicly' => false]);

    $this->get('/projects/donors')->assertInertia(fn (Assert $page) => $page->where('donors', fn ($rows) => ! collect($rows)->contains('name', 'Quiet Donor')));
    $this->get('/admin/supporters')->assertInertia(fn (Assert $page) => $page->where('supporters.0.name', 'Quiet Donor'));
});

it('lets only the treasurer and super admins into supporter accounts', function (?Role $role, int $status) {
    $user = User::factory()->create();
    if ($role) {
        $user->assignRole($role->value);
    }

    $this->actingAs($user)->get('/admin/supporters')->assertStatus($status);
})->with([
    'treasurer' => [Role::Treasurer, 200],
    'super admin' => [Role::SuperAdmin, 200],
    'content editor' => [Role::ContentEditor, 403],
    'secretary' => [Role::MembershipSecretary, 403],
    'member' => [Role::Member, 403],
]);

it('sends the old sponsors address to supporters', function () {
    $this->actingAs($this->treasurer)->get('/admin/sponsors')->assertRedirect('/admin/supporters');
});

it('moves both old lists into accounts once, keeping their totals', function () {
    $this->artisan('supporters:import-lists')
        ->expectsOutputToContain('sponsors: 10 contributions for 10 supporters across 3 events')
        ->expectsOutputToContain('donors: 9 contributions for 9 supporters');
    $this->artisan('supporters:import-lists')->expectsOutputToContain('already imported');

    expect(ContributionModel::query()->where('type', 'sponsorship')->sum('amount_cents'))->toBe(138000000)
        ->and(ContributionModel::query()->where('type', 'donation')->sum('amount_cents'))->toBe(100000000)
        ->and(SupporterModel::query()->where('public_note', 'A/L 1996')->count())->toBe(1);
});
