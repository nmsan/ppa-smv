<?php

use App\Domain\Access\Role;
use App\Infrastructure\Persistence\Eloquent\Models\MemberModel;
use App\Models\ContentEntry;
use App\Models\User;
use Database\Seeders\RoleSeeder;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->seed(RoleSeeder::class);
    $this->artisan('content:import');
    $this->artisan('members:import-register', ['file' => dirname(__DIR__, 2).'/fixtures/register-sample.csv']);
});

function userWith(?Role $role): User
{
    $user = User::factory()->create();
    if ($role) {
        $user->assignRole($role->value);
    }

    return $user;
}

it('shows super admins every section, with numbers from the imported register', function () {
    $this->actingAs(userWith(Role::SuperAdmin))->get('/dashboard')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('dashboard')
            ->where('dashboard.membership.totals.members', 6)
            ->where('dashboard.membership.totals.pending', 1)
            ->where('dashboard.membership.completeness.overseas', 1)
            ->where('dashboard.membership.by_batch', fn ($rows) => collect($rows)->firstWhere('year', 2017)['count'] === 1)
            ->where('dashboard.membership.without_representative_total', 5)
            ->has('dashboard.website')
            ->has('dashboard.roles')
            ->has('dashboard.events'));
});

it('shows content editors the website section but no membership numbers', function () {
    $this->actingAs(userWith(Role::ContentEditor))->get('/dashboard')
        ->assertInertia(fn (Assert $page) => $page
            ->has('dashboard.website')
            ->missing('dashboard.membership')
            ->missing('dashboard.roles'));
});

it('shows ordinary members only their own membership and events', function () {
    $user = userWith(Role::Member);
    MemberModel::query()->where('membership_number', 'M-002')->update(['user_id' => $user->id]);

    $this->actingAs($user)->get('/dashboard')
        ->assertInertia(fn (Assert $page) => $page
            ->where('dashboard.me.number', 'M-002')
            ->where('dashboard.me.batch', 2017)
            ->missing('dashboard.membership')
            ->missing('dashboard.website')
            ->missing('dashboard.activity'));
});

it('limits batch representatives to their own batch', function () {
    $rep = userWith(Role::BatchRepresentative);
    MemberModel::query()->where('membership_number', 'M-002')->update(['user_id' => $rep->id]);

    $this->actingAs($rep)->get('/dashboard')
        ->assertInertia(fn (Assert $page) => $page
            ->where('dashboard.membership.scope', 'A/L 2017 batch')
            ->where('dashboard.membership.totals.members', 1)
            ->where('dashboard.membership.without_representative', fn ($rows) => ! collect($rows)->contains('year', 2017)));
});

it('lists content edits in the activity feed with who made them', function () {
    $editor = userWith(Role::ContentEditor);
    $goals = ContentEntry::query()->where('type', 'goals')->first();
    $this->actingAs($editor)->put('/admin/content/goals', ['data' => $goals->data]);
    $data = $goals->data;
    $data['intro'] .= ' Edited.';
    $this->put('/admin/content/goals', ['data' => $data]);

    $this->get('/dashboard')->assertInertia(fn (Assert $page) => $page
        ->where('dashboard.activity.0.who', $editor->name)
        ->where('dashboard.activity.0.what', 'updated Goals and objectives'));
});
