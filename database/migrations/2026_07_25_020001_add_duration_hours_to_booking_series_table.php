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
        Schema::table('booking_series', function (Blueprint $table) {
            $table->unsignedTinyInteger('duration_hours')->default(1)->after('starts_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('booking_series', function (Blueprint $table) {
            $table->dropColumn('duration_hours');
        });
    }
};
