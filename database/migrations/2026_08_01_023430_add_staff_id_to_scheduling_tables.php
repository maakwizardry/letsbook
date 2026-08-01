<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * staff_id is nullable everywhere it's added: null means "belongs to
     * the provider as a whole, no specific staff member" — the meaning
     * every existing row already has. No existing provider has any Staff
     * rows yet, so this changes nothing about how their availability,
     * blocked dates, or bookings behave.
     */
    public function up(): void
    {
        Schema::table('availabilities', function (Blueprint $table) {
            $table->foreignId('staff_id')->nullable()->after('provider_id')->constrained('staff')->nullOnDelete();
        });

        Schema::table('blocked_dates', function (Blueprint $table) {
            $table->foreignId('staff_id')->nullable()->after('provider_id')->constrained('staff')->nullOnDelete();
        });

        Schema::table('bookings', function (Blueprint $table) {
            $table->foreignId('staff_id')->nullable()->after('provider_id')->constrained('staff')->nullOnDelete();
        });

        Schema::table('booking_series', function (Blueprint $table) {
            $table->foreignId('staff_id')->nullable()->after('provider_id')->constrained('staff')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('booking_series', function (Blueprint $table) {
            $table->dropConstrainedForeignId('staff_id');
        });

        Schema::table('bookings', function (Blueprint $table) {
            $table->dropConstrainedForeignId('staff_id');
        });

        Schema::table('blocked_dates', function (Blueprint $table) {
            $table->dropConstrainedForeignId('staff_id');
        });

        Schema::table('availabilities', function (Blueprint $table) {
            $table->dropConstrainedForeignId('staff_id');
        });
    }
};
