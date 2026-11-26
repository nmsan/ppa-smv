<?php

use App\Domain\Access\Role;
use App\Models\User;
use Database\Seeders\RoleSeeder;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->seed(RoleSeeder::class);
});

function accountFor(?Role $role): User
{
    $user = User::factory()->create();
    if ($role) {
        $user->assignRole($role->value);
    }

    return $user;
}

it('sends members, applicants and committee members to My account instead of the dashboard', function (?Role $role) {
    $this->actingAs(accountFor($role))
        ->get('/dashboard')
        ->assertRedirect(route('my-membership', absolute: false));
})->with([
    'applicant without a role' => [null],
    'member' => [Role::Member],
    'committee member' => [Role::CommitteeMember],
]);

it('lets office bearers into the admin portal', function (Role $role) {
    $this->actingAs(accountFor($role))->get('/dashboard')->assertOk();
})->with(fn () => Role::adminPortal());

it('lands a member on My account after logging in', function () {
    $user = accountFor(Role::Member);

    $this->post('/login', ['email' => $user->email, 'password' => 'password'])
        ->assertRedirect(route('dashboard', absolute: false));

    $this->get('/dashboard')->assertRedirect(route('my-membership', absolute: false));
    $this->get('/my-membership')->assertOk()->assertInertia(fn (Assert $page) => $page
        ->component('member/my-membership')
        ->where('auth.adminPortal', false));
});

it('keeps members out of admin pages', function () {
    $this->actingAs(accountFor(Role::Member))->get('/admin/members')->assertForbidden();
});

it('tells the pages whether to offer the admin portal', function () {
    $this->actingAs(accountFor(Role::Treasurer))
        ->get('/my-membership')
        ->assertInertia(fn (Assert $page) => $page->where('auth.adminPortal', true));
});

it('shows profile and password settings to members', function (string $url) {
    $this->actingAs(accountFor(Role::Member))->get($url)->assertOk();
})->with(['/settings/profile', '/settings/password']);
