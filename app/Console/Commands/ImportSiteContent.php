<?php

namespace App\Console\Commands;

use App\Content\ContentSchema;
use App\Content\ContentTypes;
use App\Models\ContentEntry;
use App\Support\SiteContent;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;

/**
 * Loads resources/content/*.json (taken from the old site) into the database.
 * Types that already have content are skipped, so editors' work is never lost.
 */
class ImportSiteContent extends Command
{
    protected $signature = 'content:import {--force : Replace content that already exists}';

    protected $description = 'Import the starting website content from resources/content';

    public function handle(): int
    {
        foreach (ContentTypes::all() as $type => $definition) {
            $path = resource_path("content/{$type}.json");
            if (! File::exists($path)) {
                $this->warn("{$type}: no file, skipped");

                continue;
            }

            $exists = ContentEntry::query()->where('type', $type)->exists();
            if ($exists && ! $this->option('force')) {
                $this->line("{$type}: already has content, skipped");

                continue;
            }

            $json = json_decode(File::get($path), true, flags: JSON_THROW_ON_ERROR);
            $records = $definition['kind'] === 'collection' ? $json['items'] : [$json];

            DB::transaction(function () use ($type, $records, $definition) {
                ContentEntry::query()->where('type', $type)->delete();
                foreach (array_values($records) as $position => $record) {
                    ContentEntry::query()->create([
                        'type' => $type,
                        'data' => ContentSchema::clean($definition['fields'], $record),
                        'position' => $position,
                    ]);
                }
            });

            $this->info("{$type}: imported ".count($records));
        }

        SiteContent::flush();

        return self::SUCCESS;
    }
}
