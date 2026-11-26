<?php

use App\Models\ContentEntry;
use App\Support\SiteContent;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->artisan('content:import');
    $this->migration = require database_path('migrations/2026_11_26_120000_add_senadhi_2026_news_posts.php');
});

function newsTitles(): array
{
    SiteContent::flush();

    return array_column(SiteContent::get('news')['items'], 'title');
}

it('adds the Senadhi 2026 posts after the event on a site that already has news', function () {
    $this->migration->down();
    expect(newsTitles())->toHaveCount(3);

    $this->migration->up();

    $titles = newsTitles();
    expect($titles)->toHaveCount(7)
        ->and($titles[1])->toContain('කණ්ඩායම් ලියාපදිංචිය')
        ->and($titles[3])->toBe('සේනාදි අභියෝගතා කුසලානය රථ පෙළපාලියකින් එළිදැක්වේ')
        ->and($titles[5])->toBe("Prime Minister's visit");
});

it('does not add the posts twice', function () {
    $this->migration->up();

    expect(newsTitles())->toHaveCount(7);
});

it('leaves an event that editors have changed alone', function () {
    $this->migration->down();
    $event = ContentEntry::query()->where('type', 'news')->orderBy('position')->first();
    $event->update(['data' => ['body' => ['Edited by the committee.']] + $event->data]);

    $this->migration->up();

    expect($event->fresh()->data['body'])->toBe(['Edited by the committee.']);
});

it('shows a news post with its extra photos', function () {
    $parade = collect(SiteContent::get('news')['items'])->firstWhere('title', 'සේනාදි අභියෝගතා කුසලානය රථ පෙළපාලියකින් එළිදැක්වේ');

    $this->get("/news/{$parade['slug']}")->assertInertia(fn (Assert $page) => $page
        ->component('public/news/show')
        ->has('item.gallery', 4)
        ->where('item.gallery.0.image', '/images/news/senadhi-trophy-parade-2.jpg'));
});
