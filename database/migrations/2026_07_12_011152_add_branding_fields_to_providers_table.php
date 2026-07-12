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
            $table->string('logo_path')->nullable()->after('name');
            $table->string('tagline')->nullable()->after('logo_path');
            $table->decimal('rating', 2, 1)->nullable()->after('tagline');
            $table->unsignedSmallInteger('years_in_business')->nullable()->after('rating');
            $table->string('brand_color')->nullable()->after('years_in_business');
            $table->boolean('is_insured')->default(true)->after('brand_color');
            $table->boolean('is_background_checked')->default(true)->after('is_insured');
            $table->boolean('has_satisfaction_guarantee')->default(true)->after('is_background_checked');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('providers', function (Blueprint $table) {
            $table->dropColumn([
                'logo_path',
                'tagline',
                'rating',
                'years_in_business',
                'brand_color',
                'is_insured',
                'is_background_checked',
                'has_satisfaction_guarantee',
            ]);
        });
    }
};
