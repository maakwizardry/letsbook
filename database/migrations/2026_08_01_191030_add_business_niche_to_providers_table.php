<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Freeform, not an enum like business_type: business_type controls
     * behavior (does the wizard collect an address), business_niche only
     * controls wording (does it say "treatment" or "cut"). Nullable and
     * unset for every existing provider, so it changes nothing on its own —
     * copy falls back to a generic appointment/cleaning wording until a
     * niche has been given its own tailored copy in code.
     */
    public function up(): void
    {
        Schema::table('providers', function (Blueprint $table) {
            $table->string('business_niche')->nullable()->after('business_type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('providers', function (Blueprint $table) {
            $table->dropColumn('business_niche');
        });
    }
};
