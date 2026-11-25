<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

/**
 * Membership fees move from website text into the database so the treasurer
 * manages them, each request keeps the fee agreed at the time, and fees
 * collected by office bearers are recorded against the member.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('membership_plans', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->string('category')->unique();   // annual | life
            $table->string('name');
            $table->string('name_si')->nullable();
            $table->unsignedBigInteger('fee_cents');
            $table->boolean('active')->default(true);
            $table->unsignedSmallInteger('position')->default(0);
            $table->timestamps();
        });

        Schema::table('members', function (Blueprint $table) {
            $table->unsignedBigInteger('fee_cents')->nullable()->after('category');
        });

        Schema::create('membership_payments', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('member_id')->constrained('members')->restrictOnDelete();
            $table->string('category');
            $table->unsignedBigInteger('amount_cents');
            $table->string('channel');               // cash | bank_transfer | cheque | other
            $table->date('received_on');
            $table->string('reference')->nullable();
            $table->string('note')->nullable();
            $table->foreignId('recorded_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->index(['member_id', 'received_on']);
        });

        // Start from the fees already shown on the Membership page (Rs. 1,000 a year, Rs. 15,000 for life).
        $fees = collect(json_decode((string) DB::table('content_entries')->where('type', 'membership')->value('data'), true)['fees'] ?? []);
        $fee = function (string $category, int $fallbackRupees) use ($fees): array {
            $row = $fees->first(fn ($f) => $category === 'life' ? preg_match('/life|one/i', $f['name'].' '.$f['period']) : ! preg_match('/life|one/i', $f['name'].' '.$f['period']));
            // "Rs. 1,000.00" → 1000.0 (match the number itself, so the dot in "Rs." is not read as a decimal point)
            $rupees = $row && preg_match('/\d[\d,]*(\.\d+)?/', $row['amount'], $m) ? (float) str_replace(',', '', $m[0]) : $fallbackRupees;

            return ['name' => $row['name'] ?? null, 'name_si' => $row['sinhala'] ?? null, 'fee_cents' => (int) round(($rupees ?: $fallbackRupees) * 100)];
        };

        $now = now();
        foreach ([['annual', 'Annual member', 'ස්ථිර සාමාජික', 1000, 1], ['life', 'Life member', 'යාවජීව සාමාජික', 15000, 2]] as [$category, $name, $nameSi, $rupees, $position]) {
            $found = $fee($category, $rupees);
            DB::table('membership_plans')->insert([
                'id' => (string) Str::ulid(),
                'category' => $category,
                'name' => $found['name'] ?? $name,
                'name_si' => $found['name_si'] ?? $nameSi,
                'fee_cents' => $found['fee_cents'],
                'active' => true,
                'position' => $position,
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('membership_payments');
        Schema::table('members', fn (Blueprint $table) => $table->dropColumn('fee_cents'));
        Schema::dropIfExists('membership_plans');
    }
};
