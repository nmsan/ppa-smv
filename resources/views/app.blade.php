<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        @php($meta = ($meta ?? null) ?: \App\Support\ShareMeta::defaults())
        <title inertia>{{ $meta['title'] === config('app.name') ? $meta['title'] : $meta['title'].' - '.config('app.name') }}</title>

        {{-- Link previews on Facebook, WhatsApp, X and others (crawlers don't run JavaScript). --}}
        <meta name="description" content="{{ $meta['description'] }}">
        <meta property="og:site_name" content="{{ $meta['site_name'] }}">
        <meta property="og:type" content="{{ $meta['type'] }}">
        <meta property="og:title" content="{{ $meta['title'] }}">
        <meta property="og:description" content="{{ $meta['description'] }}">
        <meta property="og:url" content="{{ $meta['url'] ?? url()->current() }}">
        <meta property="og:image" content="{{ \App\Support\ShareMeta::absolute($meta['image']) }}">
        <meta property="og:image:alt" content="{{ $meta['title'] }}">
        @if ($meta['published'])
            <meta property="article:published_time" content="{{ $meta['published'] }}">
        @endif
        <meta name="twitter:card" content="summary_large_image">
        <meta name="twitter:title" content="{{ $meta['title'] }}">
        <meta name="twitter:description" content="{{ $meta['description'] }}">
        <meta name="twitter:image" content="{{ \App\Support\ShareMeta::absolute($meta['image']) }}">
        <link rel="canonical" href="{{ $meta['url'] ?? url()->current() }}">

        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=plus-jakarta-sans:400,500,600,700,800|noto-sans-sinhala:400,500,600,700" rel="stylesheet" />

        @routes
        @viteReactRefresh
        @vite(['resources/js/app.tsx', "resources/js/pages/{$page['component']}.tsx"])
        @inertiaHead
    </head>
    <body class="font-sans antialiased">
        @inertia
    </body>
</html>
