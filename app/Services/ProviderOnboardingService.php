<?php

namespace App\Services;

use App\Models\Provider;
use Illuminate\Support\Str;

class ProviderOnboardingService
{
    /**
     * Find an existing provider by name (case-insensitive exact match).
     */
    public function findByName(string $name): ?Provider
    {
        return Provider::whereRaw('LOWER(name) = ?', [strtolower($name)])->first();
    }

    /**
     * Create a provider with a dummy email/password and a starter catalog,
     * returning it alongside the outreach message pointing them to their
     * new booking page.
     */
    public function create(string $name, ?string $externalUrl = null): array
    {
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
            'external_url' => $externalUrl,
        ]);

        $provider->seedDefaultCatalog();

        return [
            'provider' => $provider,
            'message' => $this->messageFor($provider),
        ];
    }

    /**
     * Build the outreach message for an existing provider, pointing them to
     * their booking page.
     */
    public function messageFor(Provider $provider): string
    {
        return $this->outreachMessage($provider->name, route('provider.booking', $provider->slug));
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
