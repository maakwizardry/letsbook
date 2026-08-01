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
        Schema::table('service_items', function (Blueprint $table) {
            // Defaults to 1 hour to match the flat 1-hour assumption every
            // booking has made until now — every existing row backfills to
            // this value automatically, so no existing provider's booking
            // duration changes because of this column's existence.
            $table->unsignedTinyInteger('duration_hours')->default(1)->after('is_active');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('service_items', function (Blueprint $table) {
            $table->dropColumn('duration_hours');
        });
    }
};
