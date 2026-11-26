<?php

use App\Domain\Access\Role;
use App\Infrastructure\Persistence\Eloquent\Models\MemberModel;
use App\Infrastructure\Persistence\Eloquent\Models\SupporterModel;
use App\Models\User;
use Database\Seeders\RoleSeeder;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia;

beforeEach(fn () => Storage::fake('public'));

it('uploads a profile photo and shares its url with the page', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->post('/settings/profile/avatar', ['avatar' => UploadedFile::fake()->image('me.jpg', 300, 300)])
        ->assertSessionHasNoErrors()
        ->assertRedirect('/settings/profile');

    $user->refresh();
    expect($user->avatar_path)->toStartWith('avatars/');
    Storage::disk('public')->assertExists($user->avatar_path);

    $this->actingAs($user)->get('/settings/profile')
        ->assertInertia(fn (AssertableInertia $p) => $p->where('auth.user.avatar', Storage::disk('public')->url($user->avatar_path))
            ->missing('auth.user.avatar_path'));
});

it('replaces the old file when a new photo is uploaded', function () {
    $user = User::factory()->create();
    $this->actingAs($user)->post('/settings/profile/avatar', ['avatar' => UploadedFile::fake()->image('a.png', 200, 200)]);
    $first = $user->refresh()->avatar_path;

    $this->actingAs($user)->post('/settings/profile/avatar', ['avatar' => UploadedFile::fake()->image('b.png', 200, 200)]);

    Storage::disk('public')->assertMissing($first);
    Storage::disk('public')->assertExists($user->refresh()->avatar_path);
});

it('rejects files that are not images or are too large', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->post('/settings/profile/avatar', ['avatar' => UploadedFile::fake()->create('cv.pdf', 100, 'application/pdf')])
        ->assertSessionHasErrors('avatar');

    $this->actingAs($user)
        ->post('/settings/profile/avatar', ['avatar' => UploadedFile::fake()->image('big.jpg', 300, 300)->size(3000)])
        ->assertSessionHasErrors('avatar');

    expect($user->refresh()->avatar_path)->toBeNull();
});

it('removes the profile photo', function () {
    $user = User::factory()->create();
    $this->actingAs($user)->post('/settings/profile/avatar', ['avatar' => UploadedFile::fake()->image('me.jpg', 200, 200)]);
    $path = $user->refresh()->avatar_path;

    $this->actingAs($user)->delete('/settings/profile/avatar')->assertRedirect('/settings/profile');

    expect($user->refresh()->avatar_path)->toBeNull();
    Storage::disk('public')->assertMissing($path);
});

it('shows the linked account photo in the admin member list', function () {
    $this->seed(RoleSeeder::class);
    $admin = User::factory()->create();
    $admin->assignRole(Role::MembershipSecretary->value);

    $withPhoto = User::factory()->create(['avatar_path' => 'avatars/kasun.jpg']);
    MemberModel::query()->create(['full_name' => 'Kasun Perera', 'membership_number' => 'M-1', 'category' => 'annual', 'status' => 'active', 'source' => 'register', 'applied_at' => now(), 'user_id' => $withPhoto->id]);
    MemberModel::query()->create(['full_name' => 'Nimal Silva', 'membership_number' => 'M-2', 'category' => 'annual', 'status' => 'active', 'source' => 'register', 'applied_at' => now()]);

    $this->actingAs($admin)->get('/admin/members')
        ->assertInertia(fn (AssertableInertia $p) => $p
            ->where('members.data.0.name', 'Kasun Perera')
            ->where('members.data.0.avatar', Storage::disk('public')->url('avatars/kasun.jpg'))
            ->where('members.data.1.avatar', null));
});

it('shows a linked member\'s photo on the admin supporter pages', function () {
    $this->seed(RoleSeeder::class);
    $treasurer = User::factory()->create();
    $treasurer->assignRole(Role::Treasurer->value);

    $account = User::factory()->create(['avatar_path' => 'avatars/kasun.jpg']);
    $member = MemberModel::query()->create(['full_name' => 'Kasun Perera', 'membership_number' => 'M-1', 'category' => 'annual', 'status' => 'active', 'source' => 'register', 'applied_at' => now(), 'user_id' => $account->id]);
    $linked = SupporterModel::query()->create(['name' => 'Kasun Perera', 'kind' => 'individual', 'member_id' => $member->id, 'show_publicly' => true]);
    SupporterModel::query()->create(['name' => 'Lanka Hardware', 'kind' => 'business', 'show_publicly' => true]);
    $url = Storage::disk('public')->url('avatars/kasun.jpg');

    $this->actingAs($treasurer)->get('/admin/supporters')
        ->assertInertia(fn (AssertableInertia $p) => $p
            ->where('supporters', fn ($rows) => collect($rows)->pluck('avatar', 'name')->all() === ['Kasun Perera' => $url, 'Lanka Hardware' => null]));

    $this->actingAs($treasurer)->get("/admin/supporters/{$linked->id}")
        ->assertInertia(fn (AssertableInertia $p) => $p->where('account.member.avatar', $url));
});

it('shows a linked member\'s photo on the public sponsors and donors pages', function () {
    $this->seed(RoleSeeder::class);
    $this->artisan('content:import');

    $account = User::factory()->create(['avatar_path' => 'avatars/kasun.jpg']);
    $member = MemberModel::query()->create(['full_name' => 'Kasun Perera', 'membership_number' => 'M-1', 'category' => 'annual', 'status' => 'active', 'source' => 'register', 'applied_at' => now(), 'user_id' => $account->id]);
    $person = SupporterModel::query()->create(['name' => 'Kasun Perera', 'kind' => 'individual', 'member_id' => $member->id, 'show_publicly' => true]);
    $business = SupporterModel::query()->create(['name' => 'Lanka Hardware', 'kind' => 'business', 'show_publicly' => true]);
    foreach ([[$person, 'donation', 500000], [$person, 'sponsorship', 100000], [$business, 'sponsorship', 900000]] as [$s, $type, $cents]) {
        $s->contributions()->create(['type' => $type, 'amount_cents' => $cents, 'received_on' => '2026-03-01']);
    }
    $url = Storage::disk('public')->url('avatars/kasun.jpg');

    $this->get('/projects/donors')->assertInertia(fn (AssertableInertia $p) => $p->where('donors.0.name', 'Kasun Perera')->where('donors.0.avatar', $url));
    $this->get('/projects/sponsors')->assertInertia(fn (AssertableInertia $p) => $p
        ->where('sponsors.0.name', 'Lanka Hardware')->where('sponsors.0.avatar', null)
        ->where('sponsors.1.avatar', $url));
});
