<?php

use App\Domain\Access\Role;
use App\Models\ContentEntry;
use App\Models\User;
use App\Support\SiteContent;
use Database\Seeders\RoleSeeder;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->seed(RoleSeeder::class);
    $this->artisan('content:import');
    $this->editor = User::factory()->create(['name' => 'Nimal Editor']);
    $this->editor->assignRole(Role::ContentEditor->value);
});

afterEach(fn () => SiteContent::flush());

function goalsData(): array
{
    return ContentEntry::query()->where('type', 'goals')->first()->data;
}

it('shows content editors every editable part of the site', function () {
    $this->actingAs($this->editor)->get('/admin/content')
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('admin/content/index')->has('types', 9));
});

it('keeps everyone else out of the content editor', function () {
    $member = User::factory()->create();
    $member->assignRole(Role::Member->value);

    $this->actingAs($member)->get('/admin/content')->assertForbidden();
    $this->actingAs($member)->put('/admin/content/goals', ['data' => goalsData()])->assertForbidden();
    auth()->logout();
    $this->get('/admin/content')->assertRedirect('/login');
});

it('lets an editor change a page, shows it publicly and records who did it', function () {
    $data = goalsData();
    $data['items'][0]['text'] = 'Updated goal text for the association members.';

    $this->actingAs($this->editor)->put('/admin/content/goals', ['data' => $data])->assertSessionHasNoErrors();
    SiteContent::flush();

    $this->get('/association/goals')->assertInertia(fn (Assert $page) => $page
        ->where('goals.items.0.text', 'Updated goal text for the association members.')
        ->has('goals.items', 11));

    $activity = DB::table('activity_log')->where('log_name', 'content')->latest('id')->first();
    expect($activity->causer_id)->toBe($this->editor->id);
});

it('rejects a page with a required field left empty, naming the field', function () {
    $data = goalsData();
    $data['items'][2]['text'] = '';

    $this->actingAs($this->editor)->put('/admin/content/goals', ['data' => $data])
        ->assertSessionHasErrors(['data.items.2.text' => 'The Goal field is required.']);

    expect(goalsData()['items'][2]['text'])->not->toBe('');
});

it('only accepts images that were uploaded to the site', function () {
    $data = ContentEntry::query()->where('type', 'history')->first()->data;
    $data['founder']['image'] = 'https://evil.example/x.jpg';

    $this->actingAs($this->editor)->put('/admin/content/history', ['data' => $data])
        ->assertSessionHasErrors('data.founder.image');
});

it('adds an upcoming event with an uploaded poster and shows it on the home page', function () {
    Storage::fake('public');

    $path = $this->actingAs($this->editor)
        ->postJson('/admin/content/uploads', ['image' => UploadedFile::fake()->image('poster.jpg', 800, 1200)])
        ->assertOk()
        ->json('path');
    expect($path)->toStartWith('/storage/content/');
    Storage::disk('public')->assertExists(str_replace('/storage/', '', $path));

    $this->post('/admin/content/news/entries', ['data' => [
        'type' => 'event',
        'title' => 'Annual get-together',
        'date' => now()->addMonth()->toDateString(),
        'deadline' => null,
        'image' => $path,
        'body' => ['All past pupils are welcome.', ''],
        'gallery' => [],
    ]])->assertRedirect('/admin/content/news');

    SiteContent::flush();
    $this->get('/')->assertInertia(fn (Assert $page) => $page
        ->where('events', fn ($events) => collect($events)->contains('title', 'Annual get-together')));

    $saved = ContentEntry::query()->where('type', 'news')->orderBy('position')->first();
    expect($saved->data['title'])->toBe('Annual get-together')
        ->and($saved->data['body'])->toBe(['All past pupils are welcome.']);
});

it('refuses files that are not images', function () {
    $this->actingAs($this->editor)
        ->postJson('/admin/content/uploads', ['image' => UploadedFile::fake()->create('virus.php', 10, 'application/x-php')])
        ->assertUnprocessable();
});

it('deletes and reorders news', function () {
    $entries = ContentEntry::query()->where('type', 'news')->orderBy('position')->get();

    $this->actingAs($this->editor)->post("/admin/content/news/{$entries[1]->id}/move", ['direction' => 'up']);
    expect(ContentEntry::query()->where('type', 'news')->orderBy('position')->first()->id)->toBe($entries[1]->id);

    $this->delete("/admin/content/news/{$entries[0]->id}")->assertRedirect('/admin/content/news');
    expect(ContentEntry::query()->where('type', 'news')->count())->toBe($entries->count() - 1);
});

it('returns 404 for unknown content types and wrong entry types', function () {
    $project = ContentEntry::query()->where('type', 'projects')->first();

    $this->actingAs($this->editor)->get('/admin/content/passwords')->assertNotFound();
    $this->get("/admin/content/news/{$project->id}/edit")->assertNotFound();
});

it('never overwrites editors\' work when the import runs again', function () {
    $data = goalsData();
    $data['intro'] = 'Edited by the committee.';
    $this->actingAs($this->editor)->put('/admin/content/goals', ['data' => $data]);

    $this->artisan('content:import');

    expect(goalsData()['intro'])->toBe('Edited by the committee.');
});

it('edits the whole Contact page, bank account included, from Contact us', function () {
    $site = ContentEntry::query()->where('type', 'site')->first()->data;
    $site['bank']['account_number'] = '9999 00 11 22';
    $site['contacts'][1]['phone'] = '077 000 0000';

    $this->actingAs($this->editor)->put('/admin/content/site', ['data' => $site])->assertSessionHasNoErrors();
    SiteContent::flush();

    $this->get('/contact')->assertInertia(fn (Assert $page) => $page
        ->where('bank.account_number', '9999 00 11 22')
        ->where('site.contacts.1.phone', '077 000 0000'));
    $this->get('/projects/donors')->assertInertia(fn (Assert $page) => $page->where('bank.account_number', '9999 00 11 22'));
    $this->get('/projects')->assertInertia(fn (Assert $page) => $page->where('bank.account_number', '9999 00 11 22'));
});
