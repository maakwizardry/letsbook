<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use RuntimeException;

class OpenAIImageService
{
    /**
     * Generate an image from a prompt using OpenAI's gpt-image-1 model.
     * If $referenceImagePath is given, uses the images/edits endpoint so the
     * output keeps the same face/identity as that reference photo.
     * Saves the decoded image to storage/app/public/generated-ai-girls.
     *
     * @return array{image_url: string, disk_path: string, response: array}
     */
    public function generate(string $prompt, ?string $referenceImagePath = null): array
    {
        $apiKey = config('services.openai.key');

        if (! $apiKey) {
            throw new RuntimeException('OpenAI API key is not configured.');
        }

        $request = Http::withToken($apiKey)->timeout(120);

        if ($referenceImagePath) {
            $response = $request
                ->attach('image', file_get_contents($referenceImagePath), 'reference.png')
                ->post('https://api.openai.com/v1/images/edits', [
                    'model' => 'gpt-image-1',
                    'prompt' => $prompt,
                    'size' => '1024x1024',
                ]);
        } else {
            $response = $request->post('https://api.openai.com/v1/images/generations', [
                'model' => 'gpt-image-1',
                'prompt' => $prompt,
                'n' => 1,
                'size' => '1024x1024',
            ]);
        }

        if ($response->failed()) {
            throw new RuntimeException('OpenAI API request failed: ' . $response->body());
        }

        $imageBase64 = $response->json('data.0.b64_json');

        if (! $imageBase64) {
            throw new RuntimeException('No image returned by OpenAI.');
        }

        $diskPath = 'generated-ai-girls/ai-girl-' . Str::uuid() . '.png';

        Storage::disk('public')->put($diskPath, base64_decode($imageBase64));

        // Drop the (large) base64 payload before returning; the decoded image is already on disk.
        $responseBody = $response->json();
        unset($responseBody['data'][0]['b64_json']);

        return [
            'image_url' => Storage::disk('public')->url($diskPath),
            'disk_path' => $diskPath,
            'response' => $responseBody,
        ];
    }
}
