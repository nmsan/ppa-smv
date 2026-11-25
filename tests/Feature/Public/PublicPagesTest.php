<?php

use App\Content\ContentTypes;
use App\Support\SiteContent;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->artisan('content:import');
    $this->artisan('supporters:import-lists');
});

dataset('public pages', [
    'home' => ['/', 'public/home', 'home'],
    'history' => ['/college/history', 'public/college/history', 'history'],
    'principals' => ['/college/principals', 'public/college/principals', 'content'],
    'goals' => ['/association/goals', 'public/association/goals', 'goals'],
    'office bearers' => ['/association/office-bearers', 'public/association/office-bearers', 'content'],
    'membership' => ['/membership', 'public/membership', 'membership'],
    'projects' => ['/projects', 'public/projects/index', 'projects'],
    'sponsors' => ['/projects/sponsors', 'public/projects/sponsors', 'sponsors'],
    'donors' => ['/projects/donors', 'public/projects/donors', 'donors'],
    'news' => ['/news', 'public/news/index', 'items'],
    'contact' => ['/contact', 'public/contact', 'bank'],
]);

it('renders each public page for visitors', function (string $url, string $component, string $prop) {
    $this->get($url)
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component($component)
            ->has($prop)
            ->where('site.email', 'sncppa@gmail.com'));
})->with('public pages');

it('shows the 2026/2027 office bearers from the old site', function () {
    $this->get('/association/office-bearers')->assertInertia(fn (Assert $page) => $page
        ->where('content.terms.0.term', '2026/2027')
        ->where('content.terms.0.officers.1.people.0.name', 'Mr. Duminda Thilakarathne')
        ->has('content.terms.0.committee', 19));
});

it('lists all 29 principals plus the army period', function () {
    $this->get('/college/principals')->assertInertia(fn (Assert $page) => $page->has('content.principals', 30));
});

it('rejects content keys that could escape the content folder', function () {
    SiteContent::get('../.env');
})->throws(InvalidArgumentException::class);

it('shows all 11 goals with their text', function () {
    $this->get('/association/goals')->assertInertia(fn (Assert $page) => $page
        ->has('goals.items', 11)
        ->where('goals.items.0.marker', 'අ')
        ->where('goals.items', fn ($items) => collect($items)->every(fn ($i) => mb_strlen($i['text']) > 20)));
});

it('has no empty text anywhere in the site content', function () {
    $empty = [];
    foreach (glob(resource_path('content/*.json')) as $file) {
        $content = json_decode(file_get_contents($file), true);
        array_walk_recursive(
            $content,
            function ($value, $key) use (&$empty, $file) {
                if (is_string($value) && trim($value) === '') {
                    $empty[] = basename($file).": {$key}";
                }
            },
        );
    }

    expect($empty)->toBe([]);
});

it('tells each page where it is edited', function (string $url, string $component, string $prop) {
    $this->get($url)->assertInertia(function (Assert $page) {
        $props = $page->toArray()['props'];
        expect(isset($props['editLink']['href']) || ContentTypes::exists($props['editContent'] ?? ''))->toBeTrue();
    });
})->with('public pages');

it('opens each project on its own page', function () {
    $project = SiteContent::get('projects')['items'][1];

    $this->get("/projects/{$project['slug']}")
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('public/projects/show')
            ->where('project.slug', $project['slug'])
            ->where('project.title', $project['title'])
            ->has('others', 2)
            ->has('bank')
            ->where('editLink.href', "/admin/content/projects/{$project['slug']}/edit"));
});

it('returns 404 for an unknown project', function () {
    $this->get('/projects/01JZZZZZZZZZZZZZZZZZZZZZZZ')->assertNotFound();
});

it('opens each news post on its own page', function () {
    $item = SiteContent::get('news')['items'][1];

    $this->get("/news/{$item['slug']}")
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('public/news/show')
            ->where('item.slug', $item['slug'])
            ->where('item.title', $item['title'])
            ->where('item.body', $item['body'])
            ->where('others', fn ($others) => collect($others)->doesntContain('slug', $item['slug']))
            ->where('editLink.href', "/admin/content/news/{$item['slug']}/edit"));
});

it('returns 404 for an unknown news post', function () {
    $this->get('/news/01JZZZZZZZZZZZZZZZZZZZZZZZ')->assertNotFound();
});

it('shows the hero banner and live giving and batch figures on the home page', function () {
    $this->get('/')->assertInertia(fn (Assert $page) => $page
        ->where('home.hero.headline', '80 Years of Pride.')
        ->has('giving.raised_cents')
        ->has('giving.supporters')
        ->has('giving.shown')
        ->where('giving.raised_cents', fn ($cents) => $cents > 0)
        ->has('batches'));
});
