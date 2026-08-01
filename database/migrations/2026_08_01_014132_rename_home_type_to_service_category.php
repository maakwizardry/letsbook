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
        Schema::rename('home_types', 'service_categories');

        Schema::table('service_items', function (Blueprint $table) {
            $table->renameColumn('home_type_id', 'service_category_id');
        });

        Schema::table('bookings', function (Blueprint $table) {
            $table->renameColumn('home_type_id', 'service_category_id');
        });

        Schema::table('booking_series', function (Blueprint $table) {
            $table->renameColumn('home_type_id', 'service_category_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('booking_series', function (Blueprint $table) {
            $table->renameColumn('service_category_id', 'home_type_id');
        });

        Schema::table('bookings', function (Blueprint $table) {
            $table->renameColumn('service_category_id', 'home_type_id');
        });

        Schema::table('service_items', function (Blueprint $table) {
            $table->renameColumn('service_category_id', 'home_type_id');
        });

        Schema::rename('service_categories', 'home_types');
    }
};
