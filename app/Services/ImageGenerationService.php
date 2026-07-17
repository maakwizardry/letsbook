<?php

namespace App\Services;

use App\Models\ImageGeneration;
use Illuminate\Support\Facades\Storage;

class ImageGenerationService
{
    /**
     * Generate an image, persist the generation, and return the record.
     * $scene is the only caller-controlled input — the character identity is fixed.
     *
     * The first generation for a given provider becomes that provider's locked-in
     * "reference face" (storage/app/public/character-reference/{provider}.png).
     * Every subsequent call feeds that photo back into the API so the output
     * keeps the same face instead of being re-imagined from text each time.
     */
    public function generate(?string $scene = null, string $provider = 'openai'): ImageGeneration
    {
        $scene = $scene ?: $this->loadPrompt('default-scene.txt');
        $cameraAngle = $this->randomCameraAngle();
        $background = $this->randomBackground();
        $prompt = $this->loadPrompt('character-profile.txt')
            . "\n\nScene:\n" . $scene
            . "\n\nCamera angle for THIS photo (follow exactly):\n" . $cameraAngle
            . "\n\nBackground/setting for THIS photo (follow exactly):\n" . $background
            . "\n\nCRITICAL INSTRUCTION — read carefully:\n"
            . "The attached reference image exists for ONE purpose only: to preserve her face and identity. "
            . "It is NOT a composition, pose, camera-angle, lighting, or background reference. "
            . "Completely ignore the reference image's framing, cropping, pose, camera angle, lighting, and background. "
            . "Treat this as a brand new, unrelated photo from a different day, different location, and different moment in her life — "
            . "only the face should carry over. "
            . "The camera angle and background specified above must be followed exactly and must look nothing like the reference image's composition. "
            . "The background must be a fully realistic, detailed real-world environment matching the description above — not a plain, blank, or single-color studio backdrop. "
            . 'Add a touch of creative flair and confident, stylish energy — a bit more editorial and eye-catching than a plain snapshot, while staying photorealistic and natural.';

        $referenceDiskPath = 'character-reference/' . $provider . '.png';
        $hasReference = Storage::disk('public')->exists($referenceDiskPath);
        $referenceFullPath = $hasReference ? Storage::disk('public')->path($referenceDiskPath) : null;

        $result = match ($provider) {
            'openai' => (new OpenAIImageService())->generate($prompt, $referenceFullPath),
            'gemini' => (new GeminiImageService())->generate($prompt, $referenceFullPath),
            default => throw new \InvalidArgumentException("Unsupported image generation provider: {$provider}"),
        };

        if (! $hasReference) {
            Storage::disk('public')->copy($result['disk_path'], $referenceDiskPath);
        }

        return ImageGeneration::create([
            'prompt' => $prompt,
            'provider' => $provider,
            'response' => $result['response'],
            'image_url' => $result['image_url'],
        ]);
    }

    private function randomCameraAngle(): string
    {
        $angles = array_filter(array_map('trim', explode("\n", $this->loadPrompt('camera-angles.txt'))));

        return $angles[array_rand($angles)];
    }

    private function randomBackground(): string
    {
        $backgrounds = array_filter(array_map('trim', explode("\n", $this->loadPrompt('backgrounds.txt'))));

        return $backgrounds[array_rand($backgrounds)];
    }

    private function loadPrompt(string $filename): string
    {
        return trim(file_get_contents(resource_path('prompts/' . $filename)));
    }
}
