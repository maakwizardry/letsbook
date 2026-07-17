<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use RuntimeException;

class GeminiImageService
{
    /**
     * Generate an image from a prompt using Gemini's image generation model (Nano Banana).
     * If $referenceImagePath is given, it's sent alongside the prompt so Gemini
     * conditions on that photo and keeps the same face/identity.
     * Saves the decoded image to storage/app/public/generated-ai-girls.
     *
     * @return array{image_url: string, disk_path: string, response: array}
     */
    public function generate(string $prompt, ?string $referenceImagePath = null): array
    {
        $apiKey = config('services.gemini.key');

        if (! $apiKey) {
            throw new RuntimeException('Gemini API key is not configured.');
        }

        $parts = [];

        if ($referenceImagePath) {
            $parts[] = [
                'inlineData' => [
                    'mimeType' => 'image/png',
                    'data' => base64_encode(file_get_contents($referenceImagePath)),
                ],
            ];
        }

        $parts[] = ['text' => $prompt];

        $response = Http::withHeaders([
            'Content-Type' => 'application/json',
        ])
            ->timeout(120)
            ->post(
                'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=' . $apiKey,
                [
                    'contents' => [
                        ['parts' => $parts],
                    ],
                ]
            );

        if ($response->failed()) {
            throw new RuntimeException('Gemini API request failed: ' . $response->body());
        }

        $responseParts = $response->json('candidates.0.content.parts', []);

        $imageBase64 = null;
        foreach ($responseParts as $part) {
            if (isset($part['inlineData']['data'])) {
                $imageBase64 = $part['inlineData']['data'];
                break;
            }
        }

        if (! $imageBase64) {
            throw new RuntimeException('No image returned by Gemini.');
        }

        $diskPath = 'generated-ai-girls/ai-girl-' . Str::uuid() . '.png';

        Storage::disk('public')->put($diskPath, base64_decode($imageBase64));

        // Drop the (large) inline base64 payload before returning; the decoded image is already on disk.
        $responseBody = $response->json();
        if (isset($responseBody['candidates'][0]['content']['parts'])) {
            foreach ($responseBody['candidates'][0]['content']['parts'] as $i => $part) {
                if (isset($part['inlineData']['data'])) {
                    unset($responseBody['candidates'][0]['content']['parts'][$i]['inlineData']['data']);
                }
            }
        }

        return [
            'image_url' => Storage::disk('public')->url($diskPath),
            'disk_path' => $diskPath,
            'response' => $responseBody,
        ];
    }
}
