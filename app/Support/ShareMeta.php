<?php

namespace App\Support;

use Illuminate\Support\Str;

/**
 * Open Graph / Twitter card tags for a public page, so a link shared on
 * Facebook, WhatsApp, X and others shows a title, summary and photo.
 *
 * Crawlers do not run JavaScript, so these are rendered into the HTML by
 * app.blade.php (and also passed to the page for its share buttons).
 */
final class ShareMeta
{
    /**
     * @param  list<string|null>  $text  Candidate description text; the first non-empty one is used.
     * @return array{title: string, description: string, image: string, url: string, type: string, site_name: string, published: ?string}
     */
    public static function make(string $title, array $text, ?string $image, string $type = 'article', ?string $published = null): array
    {
        $description = collect($text)
            ->map(fn ($t) => trim(preg_replace('/\s+/u', ' ', strip_tags((string) $t))))
            ->first(fn ($t) => $t !== '') ?? self::defaults()['description'];

        return [
            'title' => $title,
            'description' => Str::limit($description, 200),
            'image' => self::absolute($image ?: self::defaults()['image']),
            'url' => url()->current(),
            'type' => $type,
            'site_name' => config('app.name'),
            'published' => $published,
        ];
    }

    /** Tags for pages that do not set their own. */
    public static function defaults(): array
    {
        return [
            'title' => config('app.name'),
            'description' => "Senanayake Central College (National School), Madampe – Past Pupils' Association.",
            'image' => '/images/brand/logo.png',
            'type' => 'website',
            'site_name' => config('app.name'),
            'published' => null,
        ];
    }

    public static function absolute(string $path): string
    {
        return Str::startsWith($path, ['http://', 'https://']) ? $path : url($path);
    }
}
