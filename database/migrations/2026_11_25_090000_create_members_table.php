<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('members', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignId('user_id')->nullable()->unique()->constrained()->nullOnDelete();
            $table->string('membership_number')->nullable()->unique();
            $table->string('full_name');
            $table->string('email');
            $table->string('phone');
            $table->text('nic');                       // encrypted at rest
            $table->string('nic_hash', 64)->unique();  // keyed hash for duplicate checks
            $table->unsignedSmallInteger('ol_year')->nullable();
            $table->unsignedSmallInteger('al_year')->nullable();
            $table->unsignedSmallInteger('batch_key')->index();
            $table->string('category');
            $table->string('status')->index();
            $table->timestamp('applied_at');
            $table->timestamp('approved_at')->nullable();
            $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->string('rejection_reason')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('members');
    }
};
