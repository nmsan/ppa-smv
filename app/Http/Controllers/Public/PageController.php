<?php

namespace App\Http\Controllers\Public;

use App\Application\Ports\SupporterReadModel;
use App\Http\Controllers\Controller;
use App\Support\SiteContent;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Public website pages. Plain content: no use-case layer (see docs/adr/0001).
 * "editContent" names the content type behind each page, so editors get an
 * "Edit this page" button.
 */
class PageController extends Controller
{
    public function home(): Response
    {
        $news = SiteContent::get('news')['items'];

        return Inertia::render('public/home', ['editContent' => 'home',
            'home' => SiteContent::get('home'),
            'message' => SiteContent::get('principals')['message'],
            'events' => array_values(array_filter(
                $news,
                fn ($n) => $n['type'] === 'event' && $n['date'] >= now()->toDateString(),
            )),
            'news' => array_values(array_filter($news, fn ($n) => $n['type'] === 'news')),
            'projects' => SiteContent::get('projects')['items'],
        ]);
    }

    public function history(): Response
    {
        return Inertia::render('public/college/history', ['editContent' => 'history', 'history' => SiteContent::get('history')]);
    }

    public function principals(): Response
    {
        return Inertia::render('public/college/principals', ['editContent' => 'principals', 'content' => SiteContent::get('principals')]);
    }

    public function goals(): Response
    {
        return Inertia::render('public/association/goals', ['editContent' => 'goals', 'goals' => SiteContent::get('goals')]);
    }

    public function officeBearers(): Response
    {
        return Inertia::render('public/association/office-bearers', ['editContent' => 'office-bearers', 'content' => SiteContent::get('office-bearers')]);
    }

    public function membership(): Response
    {
        return Inertia::render('public/membership', ['editContent' => 'membership', 'membership' => SiteContent::get('membership')]);
    }

    public function projects(): Response
    {
        return Inertia::render('public/projects/index', ['editContent' => 'projects',
            'projects' => SiteContent::get('projects')['items'],
            'bank' => SiteContent::get('site')['bank'],
        ]);
    }

    public function project(string $project): Response
    {
        $projects = SiteContent::get('projects')['items'];
        $current = collect($projects)->firstWhere('slug', $project) ?? abort(404);

        return Inertia::render('public/projects/show', [
            'editLink' => ['href' => "/admin/content/projects/{$project}/edit", 'roles' => ['super-admin', 'content-editor'], 'label' => 'Edit this project'],
            'project' => $current,
            'others' => array_values(array_filter($projects, fn ($p) => $p['slug'] !== $project)),
            'bank' => SiteContent::get('site')['bank'],
        ]);
    }

    public function sponsors(SupporterReadModel $board): Response
    {
        return Inertia::render('public/projects/sponsors', [
            // Sponsors are managed as accounts by the treasurer, not as page content.
            'editLink' => ['href' => '/admin/supporters', 'roles' => ['super-admin', 'treasurer'], 'label' => 'Manage supporters'],
            'sponsors' => $board->publicBoard('sponsorship'),
            'bank' => SiteContent::get('site')['bank'],
        ]);
    }

    public function donors(SupporterReadModel $board): Response
    {
        return Inertia::render('public/projects/donors', [
            // Donors are supporter accounts managed by the treasurer, like sponsors.
            'editLink' => ['href' => '/admin/supporters', 'roles' => ['super-admin', 'treasurer'], 'label' => 'Manage supporters'],
            'donors' => $board->publicBoard('donation'),
            'bank' => SiteContent::get('site')['bank'],
        ]);
    }

    public function news(): Response
    {
        return Inertia::render('public/news/index', ['editContent' => 'news', 'items' => SiteContent::get('news')['items']]);
    }

    public function newsItem(string $item): Response
    {
        $items = SiteContent::get('news')['items'];
        $current = collect($items)->firstWhere('slug', $item) ?? abort(404);

        return Inertia::render('public/news/show', [
            'editLink' => ['href' => "/admin/content/news/{$item}/edit", 'roles' => ['super-admin', 'content-editor'], 'label' => 'Edit this post'],
            'item' => $current,
            'others' => array_slice(array_values(array_filter($items, fn ($n) => $n['slug'] !== $item)), 0, 4),
        ]);
    }

    public function contact(): Response
    {
        return Inertia::render('public/contact', ['editContent' => 'site', 'bank' => SiteContent::get('site')['bank']]);
    }
}
