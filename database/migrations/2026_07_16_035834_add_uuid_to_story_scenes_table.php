<?php

use App\Models\StoryScene;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('story_scenes', function (Blueprint $table) {
            $table->uuid('uuid')->nullable()->after('id');
        });

        StoryScene::whereNull('uuid')->each(function (StoryScene $storyScene) {
            $storyScene->update(['uuid' => (string) Str::uuid()]);
        });

        Schema::table('story_scenes', function (Blueprint $table) {
            $table->unique('uuid');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('story_scenes', function (Blueprint $table) {
            $table->dropColumn('uuid');
        });
    }
};
