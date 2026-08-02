<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * 'cleaning' never really meant "cleaning businesses only" - it meant
     * "any provider that needs an address collected," which just happened
     * to be every provider at the time. Now that Provider::business_niche
     * exists to name the actual industry, 'cleaning' as a value here was
     * confusing alongside it. Renamed to 'regular' (paired with
     * 'appointment'): providers that need an address vs. providers that
     * don't. No behavior changes - every existing row keeps its meaning,
     * just under a clearer name.
     */
    public function up(): void
    {
        DB::table('providers')->where('business_type', 'cleaning')->update(['business_type' => 'regular']);

        DB::statement("ALTER TABLE providers ALTER business_type SET DEFAULT 'regular'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement("ALTER TABLE providers ALTER business_type SET DEFAULT 'cleaning'");

        DB::table('providers')->where('business_type', 'regular')->update(['business_type' => 'cleaning']);
    }
};
