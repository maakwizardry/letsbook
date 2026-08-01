<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * The original (provider_id, date) unique constraint predates staff_id
     * and would block a staff member from having their own holiday on a
     * date the provider (or another staff member) already has blocked.
     * Widening it to (provider_id, staff_id, date) is safe today: every
     * existing row has staff_id null, and the old constraint already
     * guaranteed at most one row per (provider_id, date), so nothing
     * currently violates the new, more permissive constraint.
     */
    public function up(): void
    {
        // Add the new index before dropping the old one: provider_id's
        // foreign key is backed by the old composite unique index (there's
        // no plain index on provider_id alone), so dropping it first would
        // fail with "needed in a foreign key constraint". The new index
        // also leads with provider_id, so it can take over that role.
        Schema::table('blocked_dates', function (Blueprint $table) {
            $table->unique(['provider_id', 'staff_id', 'date']);
        });

        Schema::table('blocked_dates', function (Blueprint $table) {
            $table->dropUnique(['provider_id', 'date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('blocked_dates', function (Blueprint $table) {
            $table->unique(['provider_id', 'date']);
        });

        Schema::table('blocked_dates', function (Blueprint $table) {
            $table->dropUnique(['provider_id', 'staff_id', 'date']);
        });
    }
};
