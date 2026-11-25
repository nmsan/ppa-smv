<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Supporter accounts: sponsors and donors, who may also be members; the events
 * and projects the association raises money for; and every contribution as its
 * own ledger line. Contributions are never edited or deleted: a mistake is
 * voided with a reason and stays visible.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('supporters', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->string('name');
            $table->string('kind')->default('business');                  // business | individual
            $table->foreignUlid('member_id')->nullable()->unique()->constrained('members')->nullOnDelete();
            $table->string('contact_name')->nullable();
            $table->string('phone')->nullable();
            $table->string('email')->nullable();
            $table->string('public_note')->nullable();                     // shown publicly, e.g. "A/L 1996"
            $table->text('notes')->nullable();                             // committee only
            $table->boolean('show_publicly')->default(true);
            $table->timestamps();
        });

        Schema::create('fundraising_events', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->string('name')->unique();
            $table->date('held_on')->nullable();
            $table->timestamps();
        });

        Schema::create('contributions', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('supporter_id')->constrained('supporters')->restrictOnDelete();
            $table->string('type')->index();                               // sponsorship | donation
            $table->foreignUlid('event_id')->nullable()->constrained('fundraising_events')->restrictOnDelete();
            $table->bigInteger('amount_cents');
            $table->date('received_on')->nullable();                       // null only for imported records
            $table->string('reference')->nullable();                       // receipt or cheque number
            $table->string('note')->nullable();
            $table->foreignId('recorded_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('voided_at')->nullable();
            $table->foreignId('voided_by')->nullable()->constrained('users')->nullOnDelete();
            $table->string('void_reason')->nullable();
            $table->timestamps();

            $table->index(['supporter_id', 'voided_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('contributions');
        Schema::dropIfExists('fundraising_events');
        Schema::dropIfExists('supporters');
    }
};
