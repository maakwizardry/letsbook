<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->unsignedInteger('reminder_minutes_before')->nullable()->after('notes');
            $table->timestamp('remind_at')->nullable()->after('reminder_minutes_before');
            $table->timestamp('reminder_sent_at')->nullable()->after('remind_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->dropColumn(['reminder_minutes_before', 'remind_at', 'reminder_sent_at']);
        });
    }
};
