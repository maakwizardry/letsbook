<?php

namespace App\Console\Commands;

use App\Models\StoryScene;
use App\Services\ImageGenerationService;
use Illuminate\Console\Command;

class GenerateScenes extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'ai:generate-scenes {provider=openai : openai or gemini} {count=10 : how many unprocessed story scenes to turn into images}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Pick unprocessed story_scenes rows, generate an image for each, and store the result back on the row';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $provider = $this->argument('provider');
        $count = (int) $this->argument('count');

        $storyScenes = StoryScene::where('is_processed', false)
            ->orderBy('id')
            ->limit($count)
            ->get();

        if ($storyScenes->isEmpty()) {
            $this->info('No unprocessed scenes found.');

            return self::SUCCESS;
        }

        $service = new ImageGenerationService();
        $total = $storyScenes->count();

        foreach ($storyScenes as $i => $storyScene) {
            $this->info('[' . ($i + 1) . "/{$total}] Scene #{$storyScene->id}: {$storyScene->scene}");

            try {
                $generation = $service->generate($storyScene->scene, $provider);

                $storyScene->update([
                    'image_url' => $generation->image_url,
                    'is_processed' => true,
                    'is_posted' => false,
                ]);

                $this->line("  -> {$generation->image_url}");
            } catch (\Throwable $e) {
                $this->error("  -> failed: {$e->getMessage()}");
            }
        }

        return self::SUCCESS;
    }
}
