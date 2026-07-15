<?php

namespace App\Console\Commands;

use App\Models\Provider;
use Illuminate\Console\Command;
use Illuminate\Support\Str;

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
    public function handle()
    {
        foreach ($this->argument('names') as $name) {
            $slug = Str::slug($name) ?: Str::random(8);
            $uniqueSlug = $slug;
            for ($i = 2; Provider::where('slug', $uniqueSlug)->exists(); $i++) {
                $uniqueSlug = "{$slug}-{$i}";
            }

            $provider = Provider::create([
                'name' => $name,
                'email' => "{$uniqueSlug}@example.com",
                'password' => 'password',
                'slug' => $uniqueSlug,
            ]);

            $provider->seedDefaultCatalog();

            $this->info("Created provider \"{$name}\" ({$provider->email})");
            $this->newLine();
            $this->line($this->outreachMessage($name, route('provider.booking', $provider->slug)));
            $this->newLine();
        }
    }

    /**
     * Build the outreach message sent to a newly created provider,
     * pointing them to their custom booking page.
     */
    protected function outreachMessage(string $name, string $url): string
    {
        $greetingName = Str::before($name, ' ');

        return <<<MSG
        Hey {$greetingName}! I know most cleaning businesses handle bookings through Facebook messages and texts, which can become a headache when customers are asking about availability, prices, and scheduling.

        I went ahead and created a booking page for your business so you can see a simpler way.

        Here's your page:
        {$url}

        Customers can book directly, add their address, and choose a time that works for you — without all the back-and-forth.

        If you like it, you can keep it for a one-time \$99 payment. No monthly fees.

        Would love your feedback!
        MSG;
    }
}
