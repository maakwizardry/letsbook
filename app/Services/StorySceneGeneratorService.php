<?php

namespace App\Services;

use App\Models\StoryScene;
use Illuminate\Support\Facades\Http;
use RuntimeException;

class StorySceneGeneratorService
{
    // How many recent scenes to feed back in as memory/context.
    private const MEMORY_LIMIT = 20;

    /**
     * Write the next scene (+ Instagram caption) in the ongoing storyline,
     * using recent past scenes as memory.
     *
     * @return array{scene: string, caption: string}
     */
    public function generateNext(): array
    {
        $apiKey = config('services.openai.key');

        if (! $apiKey) {
            throw new RuntimeException('OpenAI API key is not configured.');
        }

        $persona = trim(file_get_contents(resource_path('prompts/story-persona.txt')));

        $pastScenes = StoryScene::orderByDesc('id')
            ->limit(self::MEMORY_LIMIT)
            ->pluck('scene')
            ->reverse()
            ->values();

        if ($pastScenes->isEmpty()) {
            $memoryBlock = 'This is the very first scene in her story — there is no prior history yet. Introduce her into a natural everyday moment.';
        } else {
            $numbered = $pastScenes->map(fn ($scene, $i) => ($i + 1) . ". {$scene}")->implode("\n\n");
            $memoryBlock = "Previous scenes so far, oldest to newest:\n\n{$numbered}";
        }

        $response = Http::withToken($apiKey)
            ->timeout(60)
            ->post('https://api.openai.com/v1/chat/completions', [
                'model' => 'gpt-4o-mini',
                'temperature' => 1,
                'response_format' => ['type' => 'json_object'],
                'messages' => [
                    ['role' => 'system', 'content' => $persona],
                    ['role' => 'user', 'content' => $memoryBlock . "\n\nWrite the next scene and caption now, continuing naturally from the history above."],
                ],
            ]);

        if ($response->failed()) {
            throw new RuntimeException('OpenAI chat request failed: ' . $response->body());
        }

        $content = trim((string) $response->json('choices.0.message.content'));
        $parsed = json_decode($content, true);

        if (! is_array($parsed) || empty($parsed['scene']) || empty($parsed['caption'])) {
            throw new RuntimeException('OpenAI returned an unexpected response: ' . $content);
        }

        return [
            'scene' => trim($parsed['scene']),
            'caption' => trim($parsed['caption']),
        ];
    }
}
