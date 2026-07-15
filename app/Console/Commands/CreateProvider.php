<?php

namespace App\Console\Commands;

use App\Services\ProviderOnboardingService;
use Illuminate\Console\Command;

class CreateProvider extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:create-provider {names* : One or more business names}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Create providers from business names with a dummy email and password';

    /**
     * Execute the console command.
     */
    public function handle(ProviderOnboardingService $onboarding)
    {
        foreach ($this->argument('names') as $name) {
            $result = $onboarding->create($name);

            $this->info("Created provider \"{$name}\" ({$result['provider']->email})");
            $this->newLine();
            $this->line($result['message']);
            $this->newLine();
        }
    }
}
