<?php

namespace App\Http\Controllers;

use App\Services\OpenAIImageService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class AIGirlController extends Controller
{
    // Hardcoded character profile
    private const CHARACTER_NAME = 'Emma';
    private const CHARACTER_APPEARANCE = [
        '24 years old',
        'long brown hair',
        'hazel eyes',
        'natural makeup',
        'realistic skin texture',
        'slim athletic body',
        'luxury casual fashion style',
    ];

    public function generate(Request $request)
    {
        $validated = $request->validate([
            'scene' => 'required|string|max:255',
            'outfit' => 'required|string|max:255',
            'provider' => 'nullable|string|in:gemini,openai',
        ]);

        $provider = $validated['provider'] ?? 'gemini';
        $prompt = $this->buildPrompt($validated['scene'], $validated['outfit']);

        if ($provider === 'openai') {
            return $this->generateWithOpenAI($prompt);
        }

        return $this->generateWithGemini($prompt);
    }

    private function generateWithOpenAI(string $prompt)
    {
        try {
            $result = (new OpenAIImageService())->generate($prompt);

            return response()->json([
                'success' => true,
                'provider' => 'openai',
                'image_url' => $result['image_url'],
            ]);
        } catch (\Throwable $e) {
            Log::error('OpenAI image generation failed', ['message' => $e->getMessage()]);

            return response()->json([
                'success' => false,
                'provider' => 'openai',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    private function generateWithGemini(string $prompt)
    {
        $apiKey = config('services.gemini.key');

        if (! $apiKey) {
            return response()->json([
                'success' => false,
                'error' => 'Gemini API key is not configured.',
            ], 500);
        }

        try {
            $response = Http::withHeaders([
                'Content-Type' => 'application/json',
            ])->post(
                'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=' . $apiKey,
                [
                    'contents' => [
                        [
                            'parts' => [
                                ['text' => $prompt],
                            ],
                        ],
                    ],
                ]
            );

            if ($response->failed()) {
                Log::error('Gemini image generation failed', ['body' => $response->body()]);

                return response()->json([
                    'success' => false,
                    'error' => 'Gemini API request failed.',
                    'details' => $response->json(),
                ], $response->status());
            }

            $parts = $response->json('candidates.0.content.parts', []);

            $imageBase64 = null;
            foreach ($parts as $part) {
                if (isset($part['inlineData']['data'])) {
                    $imageBase64 = $part['inlineData']['data'];
                    break;
                }
            }

            if (! $imageBase64) {
                return response()->json([
                    'success' => false,
                    'error' => 'No image returned by Gemini.',
                    'details' => $response->json(),
                ], 502);
            }

            return response()->json([
                'success' => true,
                'image' => $imageBase64,
                'prompt' => $prompt,
            ]);
        } catch (\Throwable $e) {
            Log::error('Gemini image generation exception', ['message' => $e->getMessage()]);

            return response()->json([
                'success' => false,
                'error' => 'Unexpected error calling Gemini API.',
            ], 500);
        }
    }

    private function buildPrompt(string $scene, string $outfit): string
    {
        return sprintf(
            "Create a realistic Instagram photo of %s.\n" .
            "Keep the exact same face and identity.\n" .
            "%s.\n" .
            "Scene: %s.\n" .
            "Outfit: %s.\n" .
            'Photorealistic iPhone camera style.',
            self::CHARACTER_NAME,
            implode(".\n", array_map('ucfirst', self::CHARACTER_APPEARANCE)),
            $scene,
            $outfit
        );
    }
}
