<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;

class ResetCharacterReference extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'ai:reset-reference {provider=openai : openai or gemini}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Delete the locked-in reference face for a provider; the next generation will create a new one';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $provider = $this->argument('provider');
        $path = 'character-reference/' . $provider . '.png';

        if (Storage::disk('public')->exists($path)) {
            Storage::disk('public')->delete($path);
            $this->info("Deleted reference face for {$provider}. Next generation will create a new one.");
        } else {
            $this->info("No reference face exists for {$provider} yet.");
        }

        return self::SUCCESS;
    }
}
