<?php

use App\Support\SiteContent;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->artisan('content:import');
    $this->artisan('supporters:import-lists');
});

it('renders link-preview tags for a news post', function () {
    $post = SiteContent::get('news')['items'][0];

    $html = $this->get("/news/{$post['slug']}")->assertOk()->getContent();

    expect($html)
        ->toContain('<meta property="og:title" content="'.e($post['title']).'">')
        ->toContain('<meta property="og:url" content="'.url("/news/{$post['slug']}").'">')
        ->toContain('<meta property="og:image" content="'.url($post['image']).'">')
        ->toContain('<meta name="twitter:card" content="summary_large_image">')
        ->toContain('<meta property="og:type" content="article">');
});

it('renders link-preview tags for a project and passes them to the share buttons', function () {
    $project = SiteContent::get('projects')['items'][0];
    $url = url("/projects/{$project['slug']}");

    $response = $this->get("/projects/{$project['slug']}")->assertOk();

    expect($response->getContent())
        ->toContain('<meta property="og:title" content="'.e($project['title']).'">')
        ->toContain('<meta property="og:image" content="'.url($project['image']).'">');

    $response->assertInertia(fn (Assert $page) => $page
        ->where('share.url', $url)
        ->where('share.title', $project['title'])
        ->where('share.description', fn ($d) => $d !== '' && mb_strlen($d) <= 203));
});

it('falls back to the site name and crest on other pages', function () {
    expect($this->get('/contact')->getContent())
        ->toContain('<meta property="og:title" content="'.e(config('app.name')).'">')
        ->toContain('<meta property="og:image" content="'.url('/images/brand/logo.png').'">');
});
