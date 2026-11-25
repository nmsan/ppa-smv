<?php

use App\Models\ContentEntry;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * The home page slider became a single editorial banner ("hero"). Existing
 * content gets the default banner; the old slides are kept so down() can
 * restore the editor exactly as it was.
 */
return new class extends Migration
{
    private const HERO = [
        'headline' => '80 Years of Pride.',
        'text' => "Eight decades of past pupils from Senanayake Central College (National School), Madampe. Reconnect with your batch, back the school's next chapter, and carry its light forward.",
        'image' => '/images/hero/main-building-lit.jpg',
        'caption' => 'The main building, lit for the 80th year',
    ];

    public function up(): void
    {
        DB::transaction(function () {
            $home = ContentEntry::query()->where('type', 'home')->first();

            if (! $home || isset($home->data['hero'])) {
                return;
            }

            $home->update(['data' => ['hero' => self::HERO] + $home->data]);
        });
    }

    public function down(): void
    {
        DB::transaction(function () {
            $home = ContentEntry::query()->where('type', 'home')->first();

            if (! $home || ! isset($home->data['hero'])) {
                return;
            }

            $home->update(['data' => array_diff_key($home->data, ['hero' => true])]);
        });
    }
};
