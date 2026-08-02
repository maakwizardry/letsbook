<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Marks a real onboarded client vs. a prospect/placeholder/test
     * account. Defaults false for every existing and new provider — not
     * set automatically by anything yet, only via forceFill() when
     * explicitly marking a provider as a real client.
     */
    public function up(): void
    {
        Schema::table('providers', function (Blueprint $table) {
            $table->boolean('is_client')->default(false)->after('business_niche');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('providers', function (Blueprint $table) {
            $table->dropColumn('is_client');
        });
    }
};
