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
            // Defaults to 'cleaning' for every provider, existing and new —
            // the vertical every current provider already is. This is the
            // switch future work (address requirement, wizard/dashboard
            // terminology) will read; nothing reads it yet, so adding it
            // changes no behavior on its own.
            $table->string('business_type')->default('cleaning')->after('uses_staff_scheduling');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('providers', function (Blueprint $table) {
            $table->dropColumn('business_type');
        });
    }
};
