<?php

use App\Domain\Access\Role;
use App\Infrastructure\Persistence\Eloquent\Models\MemberModel;
use App\Models\User;
use Database\Seeders\RoleSeeder;
use Inertia\Testing\AssertableInertia;

beforeEach(fn () => $this->seed(RoleSeeder::class));

$application = [
    'full_name' => 'Kasun Perera',
    'email' => 'kasun@example.test',
    'phone' => '0771234567',
    'nic' => '199812345678',
    'ol_year' => 2014,
    'al_year' => 2017,
];

it('lets a signed-in past pupil apply, storing the NIC encrypted', function () use ($application) {
    $user = User::factory()->create();

    $this->actingAs($user)->post('/my-membership/apply', $application)->assertRedirect('/my-membership');

    $row = MemberModel::query()->firstOrFail();
    expect($row->status)->toBe('applied')
        ->and($row->batch_key)->toBe(2017)
        ->and($row->getRawOriginal('nic'))->not->toBe('199812345678')
        ->and($row->nic)->toBe('199812345678');
});

it('rejects an invalid NIC and phone', function () use ($application) {
    $this->actingAs(User::factory()->create())
        ->post('/my-membership/apply', [...$application, 'nic' => '123', 'phone' => '12345'])
        ->assertSessionHasErrors(['nic', 'phone']);
});

it('lets the batch representative approve and continues legacy numbering', function () use ($application) {
    MemberModel::query()->create([
        'membership_number' => 'M-270', 'full_name' => 'Legacy Member', 'email' => 'legacy@example.test',
        'phone' => '0770000000', 'nic' => '197012345678', 'nic_hash' => 'legacy', 'ol_year' => 1987, 'al_year' => 1990,
        'batch_key' => 1990, 'category' => 'annual', 'status' => 'active', 'applied_at' => now(),
    ]);

    $applicant = User::factory()->create();
    $this->actingAs($applicant)->post('/my-membership/apply', $application);
    $id = MemberModel::query()->where('status', 'applied')->value('id');

    $rep = User::factory()->create();
    $rep->assignRole(Role::BatchRepresentative->value);
    MemberModel::query()->create([
        'user_id' => $rep->id, 'membership_number' => 'M-100', 'full_name' => 'Rep', 'email' => 'rep@example.test',
        'phone' => '0771111111', 'nic' => '199011111111', 'nic_hash' => 'rep', 'ol_year' => 2014, 'al_year' => 2017,
        'batch_key' => 2017, 'category' => 'annual', 'status' => 'active', 'applied_at' => now(),
    ]);

    $this->actingAs($rep)->get('/admin/applicants')->assertOk();
    $this->actingAs($rep)->post("/admin/applicants/{$id}/approve")->assertRedirect();

    expect(MemberModel::query()->find($id)->membership_number)->toBe('M-271');
});

it('blocks people without a reviewing role from the admin area', function () {
    $this->actingAs(User::factory()->create())->get('/admin/applicants')->assertForbidden();
});

it('shows the membership number the next approval will get', function () {
    $secretary = User::factory()->create();
    $secretary->assignRole(Role::MembershipSecretary->value);

    $this->actingAs($secretary)->get('/admin/applicants')
        ->assertInertia(fn (AssertableInertia $page) => $page->where('nextNumber', 'M-001'));
});
