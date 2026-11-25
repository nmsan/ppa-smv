<?php

use App\Models\ContentEntry;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/** The bank account moved from "Best donors" to "Contact us" in the content editor. */
return new class extends Migration
{
    public function up(): void
    {
        DB::transaction(function () {
            $donors = ContentEntry::query()->where('type', 'donors')->first();
            $site = ContentEntry::query()->where('type', 'site')->first();

            if (! $donors || ! $site || ! isset($donors->data['bank'])) {
                return;
            }

            $site->update(['data' => $site->data + ['bank' => $donors->data['bank']]]);
            $donors->update(['data' => array_diff_key($donors->data, ['bank' => true])]);
        });
    }

    public function down(): void
    {
        DB::transaction(function () {
            $donors = ContentEntry::query()->where('type', 'donors')->first();
            $site = ContentEntry::query()->where('type', 'site')->first();

            if (! $donors || ! $site || ! isset($site->data['bank'])) {
                return;
            }

            $donors->update(['data' => $donors->data + ['bank' => $site->data['bank']]]);
            $site->update(['data' => array_diff_key($site->data, ['bank' => true])]);
        });
    }
};
