<?php

use App\Domain\Access\Role;
use App\Infrastructure\Persistence\Eloquent\Models\MemberModel;
use App\Infrastructure\Persistence\Mappers\MemberMapper;
use App\Models\User;
use Database\Seeders\RoleSeeder;
use Spatie\Activitylog\Models\Activity;

beforeEach(fn () => $this->seed(RoleSeeder::class));

function editableMember(array $attrs = []): MemberModel
{
    return MemberModel::query()->create([
        'membership_number' => 'M-150', 'full_name' => 'Old Name', 'email' => 'old@example.test', 'phone' => '0771234567',
        'nic' => '199812345678', 'nic_hash' => MemberMapper::nicHash('199812345678'), 'ol_year' => 2014, 'al_year' => 2017,
        'batch_key' => 2017, 'category' => 'annual', 'status' => 'active', 'source' => 'register', 'applied_at' => now(), ...$attrs,
    ]);
}

function withRole(Role $role): User
{
    $u = User::factory()->create();
    $u->assignRole($role->value);

    return $u;
}

$changes = [
    'full_name' => '  New   Name ', 'email' => 'New@Example.test', 'phone' => '077 999 8888', 'whatsapp' => '',
    'nic' => '', 'ol_year' => 2015, 'al_year' => 2018, 'country' => 'Japan', 'gender' => 'male',
    'admission_number' => 'A-12', 'category' => 'annual',
];

it('lets the secretary correct a locked record, keeping the NIC when none is typed', function () use ($changes) {
    $m = editableMember();

    $this->actingAs(withRole(Role::MembershipSecretary))->put("/admin/members/{$m->id}", $changes)->assertSessionHasNoErrors()->assertRedirect();

    $m->refresh();
    expect($m->full_name)->toBe('New Name')
        ->and($m->email)->toBe('new@example.test')
        ->and($m->phone)->toBe('0779998888')
        ->and($m->batch_key)->toBe(2018)
        ->and($m->country)->toBe('Japan')
        ->and($m->admission_number)->toBe('A-12')
        ->and($m->nic)->toBe('199812345678')
        ->and($m->status)->toBe('active')
        ->and($m->membership_number)->toBe('M-150');

    $log = Activity::query()->where('log_name', 'members')->latest('id')->first();
    expect($log->attribute_changes['attributes'])->toHaveKey('full_name')->not->toHaveKey('nic')->not->toHaveKey('nic_hash');
});

it('replaces or removes the NIC and refuses one that belongs to someone else', function () use ($changes) {
    $m = editableMember();
    editableMember(['membership_number' => 'M-151', 'nic' => '200012345678', 'nic_hash' => MemberMapper::nicHash('200012345678')]);
    $secretary = withRole(Role::MembershipSecretary);

    $this->actingAs($secretary)->put("/admin/members/{$m->id}", [...$changes, 'nic' => '200012345678'])->assertSessionHasErrors('form');

    $this->actingAs($secretary)->put("/admin/members/{$m->id}", [...$changes, 'nic' => '851234567v'])->assertSessionHasNoErrors();
    expect($m->refresh()->nic)->toBe('851234567V');

    $this->actingAs($secretary)->put("/admin/members/{$m->id}", [...$changes, 'clear_nic' => true])->assertSessionHasNoErrors();
    expect($m->refresh()->nic)->toBeNull()->and($m->nic_hash)->toBeNull();
});

it("moves the fee to the new plan's when the plan changes", function () use ($changes) {
    $m = editableMember(['fee_cents' => 100000]);

    $this->actingAs(withRole(Role::SuperAdmin))->put("/admin/members/{$m->id}", [...$changes, 'category' => 'life'])->assertSessionHasNoErrors();
    expect($m->refresh()->category)->toBe('life')->and($m->fee_cents)->toBe(1500000);

    $this->actingAs(withRole(Role::SuperAdmin))->put("/admin/members/{$m->id}", [...$changes, 'category' => 'honorary'])->assertSessionHasNoErrors();
    expect($m->refresh()->category)->toBe('honorary')->and($m->fee_cents)->toBeNull();
});

it('sends the edit form everything but the NIC', function () {
    $m = editableMember();

    $this->actingAs(withRole(Role::MembershipSecretary))->getJson("/admin/members/{$m->id}")
        ->assertOk()
        ->assertJson(['full_name' => 'Old Name', 'has_nic' => true, 'al_year' => 2017])
        ->assertJsonMissingPath('nic');
});

it('validates input and keeps batch representatives and others out', function () use ($changes) {
    $m = editableMember();

    $this->actingAs(withRole(Role::MembershipSecretary))->put("/admin/members/{$m->id}", [...$changes, 'full_name' => '', 'phone' => '12'])
        ->assertSessionHasErrors(['full_name', 'phone']);
    $this->actingAs(withRole(Role::MembershipSecretary))->put("/admin/members/{$m->id}", [...$changes, 'ol_year' => 2010, 'al_year' => 2018])
        ->assertSessionHasErrors('form');

    $this->actingAs(withRole(Role::BatchRepresentative))->put("/admin/members/{$m->id}", $changes)->assertForbidden();
    $this->actingAs(withRole(Role::Treasurer))->put("/admin/members/{$m->id}", $changes)->assertForbidden();
    expect($m->refresh()->full_name)->toBe('Old Name');
});
