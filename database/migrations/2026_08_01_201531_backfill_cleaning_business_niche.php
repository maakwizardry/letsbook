<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * Wizard copy now comes purely from business_niche - business_type no
     * longer factors into which wording is shown, only whether the address
     * step appears. Every 'regular' provider without a niche yet is a
     * cleaning business (the only 'regular' niche in use), so backfilling
     * business_niche='cleaning' for them keeps their wizard copy exactly
     * as it is today. Providers already on business_type='appointment'
     * with no niche are left alone - defaulting them to 'cleaning' would
     * show cleaning-flavored copy on a business that doesn't collect an
     * address, which would be actively wrong.
     */
    public function up(): void
    {
        DB::table('providers')
            ->where('business_type', 'regular')
            ->whereNull('business_niche')
            ->update(['business_niche' => 'cleaning']);

        DB::statement("ALTER TABLE providers ALTER business_niche SET DEFAULT 'cleaning'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement('ALTER TABLE providers ALTER business_niche DROP DEFAULT');

        DB::table('providers')
            ->where('business_type', 'regular')
            ->where('business_niche', 'cleaning')
            ->update(['business_niche' => null]);
    }
};
