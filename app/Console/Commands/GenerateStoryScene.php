<?php

namespace App\Console\Commands;

use App\Models\StoryScene;
use App\Services\StorySceneGeneratorService;
use Illuminate\Console\Command;

class GenerateStoryScene extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'ai:generate-scene {count=10 : how many new scenes to generate this run}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Generate the next batch of scenes in the influencer storyline (using OpenAI + past scene memory) and store them';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $count = (int) $this->argument('count');
        $service = new StorySceneGeneratorService();

        for ($i = 0; $i < $count; $i++) {
            try {
                $result = $service->generateNext();

                $record = StoryScene::create([
                    'scene' => $result['scene'],
                    'caption' => $result['caption'],
                    'is_processed' => false,
                    'is_posted' => false,
                ]);

                $this->info('[' . ($i + 1) . "/{$count}] Scene #{$record->id} created:");
                $this->line($result['scene']);
                $this->comment('Caption: ' . $result['caption']);
            } catch (\Throwable $e) {
                $this->error('[' . ($i + 1) . "/{$count}] Failed: {$e->getMessage()}");
            }
        }

        return self::SUCCESS;
    }
}
