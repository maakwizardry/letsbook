<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\ImageGenerationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class ImageGenerationController extends Controller
{
    public function generate(Request $request, string $provider = 'openai')
    {
        $validated = $request->validate([
            'scene' => 'nullable|string',
        ]);

        try {
            $generation = (new ImageGenerationService())->generate($validated['scene'] ?? null, $provider);

            return response()->json([
                'success' => true,
                'provider' => $generation->provider,
                'image_url' => $generation->image_url,
                'id' => $generation->id,
            ]);
        } catch (\Throwable $e) {
            Log::error('Image generation failed', ['message' => $e->getMessage()]);

            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
