<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\StoryScene;

class StoryScenePublishController extends Controller
{
    /**
     * Return the oldest processed-but-not-yet-posted scene, for an external
     * system to pull and post to Instagram.
     */
    public function next()
    {
        $scene = StoryScene::where('is_processed', true)
            ->where('is_posted', false)
            ->orderBy('id')
            ->first();

        if (! $scene) {
            return response()->json([
                'success' => false,
                'message' => 'No unposted scenes available.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'uuid' => $scene->uuid,
            'image' => $scene->image_url,
            'caption' => $scene->caption,
            'scene' => $scene->scene,
            'posted_url' => route('story-scenes.mark-posted', ['uuid' => $scene->uuid]),
        ]);
    }

    /**
     * Mark a scene as posted, identified by its uuid.
     */
    public function markPosted(string $uuid)
    {
        $scene = StoryScene::where('uuid', $uuid)->first();

        if (! $scene) {
            return response()->json([
                'success' => false,
                'error' => 'Scene not found.',
            ], 404);
        }

        $scene->update(['is_posted' => true]);

        return response()->json([
            'success' => true,
            'uuid' => $scene->uuid,
            'is_posted' => true,
        ]);
    }
}
