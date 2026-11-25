<?php

namespace App\Support;

use App\Content\ContentTypes;
use App\Models\ContentEntry;
use InvalidArgumentException;

/**
 * The public website's content, as edited by the committee in /admin/content.
 *
 * Singles return their data; collections return ['items' => [...]], each item
 * with a "slug" (its id). Initial content is imported from resources/content
 * with `php artisan content:import`.
 */
final class SiteContent
{
    /** @var array<string, array<string, mixed>> */
    private static array $cache = [];

    /** @return array<string, mixed> */
    public static function get(string $key): array
    {
        if (! preg_match('/^[a-z0-9-]+$/', $key) || ! ContentTypes::exists($key)) {
            throw new InvalidArgumentException("Invalid content key: {$key}");
        }

        return self::$cache[$key] ??= ContentTypes::isCollection($key)
            ? ['items' => ContentEntry::query()
                ->where('type', $key)
                ->orderBy('position')
                ->get()
                ->map(fn (ContentEntry $e) => ['slug' => $e->id] + $e->data)
                ->all()]
            : (ContentEntry::query()->where('type', $key)->first()?->data ?? []);
    }

    public static function flush(): void
    {
        self::$cache = [];
    }
}
