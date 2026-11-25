<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('content_entries', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->string('type')->index();
            $table->json('data');
            $table->integer('position')->default(0);
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index(['type', 'position']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('content_entries');
    }
};
