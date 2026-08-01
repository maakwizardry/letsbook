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
        Schema::table('providers', function (Blueprint $table) {
            // Defaults to false for every provider, existing and new. This
            // is the single switch that will gate all staff-aware
            // scheduling behavior (availability, overlap checks, wizard
            // staff selection) once that logic is built — as long as it's
            // false, staff_id is meant to be ignored everywhere and a
            // provider behaves exactly as it does today. Off by default,
            // turned on per-provider deliberately (no self-serve toggle).
            $table->boolean('uses_staff_scheduling')->default(false)->after('notifications_enabled');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('providers', function (Blueprint $table) {
            $table->dropColumn('uses_staff_scheduling');
        });
    }
};
