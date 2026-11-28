<?php

use App\Domain\Access\Role;
use App\Infrastructure\Persistence\Eloquent\Models\MemberModel;
use App\Infrastructure\Persistence\Mappers\MemberMapper;
use App\Models\User;
use Database\Seeders\RoleSeeder;

beforeEach(fn () => $this->seed(RoleSeeder::class));

function userWithRole(Role $role): User
{
    $u = User::factory()->create();
    $u->assignRole($role->value);

    return $u;
}

$newMember = [
    'full_name' => '  Kamal   Perera ', 'email' => 'Kamal@Example.test', 'phone' => '077 123 4567', 'whatsapp' => '',
    'nic' => '851234567v', 'ol_year' => '', 'al_year' => 1985, 'country' => 'Sri Lanka', 'gender' => 'male',
    'admission_number' => '', 'category' => 'life', 'give_number' => true,
];

it('lets the secretary add a member with the next membership number', function () use ($newMember) {
    MemberModel::query()->create([
        'membership_number' => 'M-150', 'full_name' => 'Someone', 'category' => 'annual', 'status' => 'active',
        'source' => 'register', 'applied_at' => now(),
    ]);
    $secretary = userWithRole(Role::MembershipSecretary);

    $this->actingAs($secretary)->post('/admin/members', $newMember)
        ->assertSessionHasNoErrors()
        ->assertRedirect()
        ->assertSessionHas('success', 'Kamal Perera is added as M-151. The treasurer can now record their fee.');

    $m = MemberModel::query()->where('full_name', 'Kamal Perera')->sole();
    expect($m->membership_number)->toBe('M-151')
        ->and($m->status)->toBe('approved')
        ->and($m->source)->toBe('secretary')
        ->and($m->email)->toBe('kamal@example.test')
        ->and($m->phone)->toBe('0771234567')
        ->and($m->nic)->toBe('851234567V')
        ->and($m->batch_key)->toBe(1985)
        ->and($m->fee_cents)->toBe(1500000)
        ->and($m->approved_by)->toBe($secretary->id)
        ->and($m->user_id)->toBeNull();
});

it('shows a member the secretary added in the treasurer\'s awaiting-payment list', function () use ($newMember) {
    $this->actingAs(userWithRole(Role::SuperAdmin))->post('/admin/members', $newMember)->assertSessionHasNoErrors();

    $this->actingAs(userWithRole(Role::Treasurer))->get('/admin/membership/payments')
        ->assertInertia(fn ($page) => $page->where('awaiting.0.name', 'Kamal Perera'));
});

it('sends the member to Applicants when no number is given now', function () use ($newMember) {
    $this->actingAs(userWithRole(Role::MembershipSecretary))
        ->post('/admin/members', [...$newMember, 'give_number' => false, 'nic' => '', 'category' => 'honorary'])
        ->assertSessionHasNoErrors();

    $m = MemberModel::query()->where('full_name', 'Kamal Perera')->sole();
    expect($m->membership_number)->toBeNull()
        ->and($m->status)->toBe('applied')
        ->and($m->fee_cents)->toBeNull()
        ->and($m->nic)->toBeNull();
});

it('lets the person claim the record later with their own account', function () use ($newMember) {
    $this->actingAs(userWithRole(Role::MembershipSecretary))->post('/admin/members', $newMember)->assertSessionHasNoErrors();
    $person = User::factory()->create();

    $this->actingAs($person)->post('/my-membership/claim', ['membership_number' => 'M-1', 'phone' => '0771234567', 'nic' => ''])
        ->assertSessionHasNoErrors();

    expect(MemberModel::query()->where('full_name', 'Kamal Perera')->value('user_id'))->toBe($person->id);
});

it('needs a name and a batch year and refuses a NIC already on file', function () use ($newMember) {
    MemberModel::query()->create([
        'membership_number' => 'M-150', 'full_name' => 'Someone', 'nic' => '851234567V', 'nic_hash' => MemberMapper::nicHash('851234567V'),
        'category' => 'annual', 'status' => 'active', 'source' => 'register', 'applied_at' => now(),
    ]);
    $secretary = userWithRole(Role::MembershipSecretary);

    $this->actingAs($secretary)->post('/admin/members', [...$newMember, 'full_name' => '', 'al_year' => ''])
        ->assertSessionHasErrors(['full_name', 'ol_year', 'al_year']);
    $this->actingAs($secretary)->post('/admin/members', $newMember)->assertSessionHasErrors('form');

    expect(MemberModel::query()->count())->toBe(1);
});

it('keeps batch representatives and treasurers from adding members', function () use ($newMember) {
    $this->actingAs(userWithRole(Role::BatchRepresentative))->post('/admin/members', $newMember)->assertForbidden();
    $this->actingAs(userWithRole(Role::Treasurer))->post('/admin/members', $newMember)->assertForbidden();

    expect(MemberModel::query()->count())->toBe(0);
});
