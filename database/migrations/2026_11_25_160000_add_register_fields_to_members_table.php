<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Members imported from the old Google Sheet register often lack an email,
 * phone, NIC or batch year, so those become optional, and a few register
 * details are kept. Address, date of birth and other personal details from
 * the sheet are deliberately not imported.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('members', function (Blueprint $table) {
            $table->string('email')->nullable()->change();
            $table->string('phone')->nullable()->change();
            $table->text('nic')->nullable()->change();
            $table->string('nic_hash', 64)->nullable()->change();
            $table->unsignedSmallInteger('batch_key')->nullable()->change();

            $table->string('source')->default('application')->index()->after('id'); // application | register
            $table->string('gender', 10)->nullable()->after('full_name');
            $table->string('whatsapp')->nullable()->after('phone');
            $table->string('country')->nullable()->index()->after('whatsapp');
            $table->string('admission_number')->nullable()->after('country');
            $table->string('joined_via')->nullable()->after('admission_number'); // paper | google-form | online
            $table->string('fee_2024')->nullable()->after('joined_via');         // how the 2024 fee was recorded
        });
    }

    public function down(): void
    {
        Schema::table('members', function (Blueprint $table) {
            $table->dropColumn(['source', 'gender', 'whatsapp', 'country', 'admission_number', 'joined_via', 'fee_2024']);
        });
    }
};
