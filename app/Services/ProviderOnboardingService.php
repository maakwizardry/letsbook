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
     * Onboard a provider who has actually agreed to sign up: find-or-create
     * a real account by name (reusing the placeholder record from a prior
     * cold-outreach `create()` call if one exists), then return a welcome
     * message with a link to set their own password — for you to send
     * yourself, same as the cold-outreach message. Never overwrites an
     * existing provider's password — only a freshly created record gets a
     * random, unusable one.
     *
     * The link uses a dedicated, non-expiring invitation token (see
     * `invitation_token` on the Provider model) rather than Laravel's
     * built-in password-reset broker, which times out after an hour — that
     * short expiry is appropriate for "I forgot my password" but not for an
     * invite link a provider might not get around to for a few days.
     */
    public function onboard(string $name, string $email): array
    {
        $provider = $this->findByName($name);

        if ($provider) {
            if ($provider->email !== $email) {
                $provider->update(['email' => $email]);
            }
        } else {
            $slug = Str::slug($name) ?: Str::random(8);
            $uniqueSlug = $slug;
            for ($i = 2; Provider::where('slug', $uniqueSlug)->exists(); $i++) {
                $uniqueSlug = "{$slug}-{$i}";
            }

            $provider = Provider::create([
                'name' => $name,
                'email' => $email,
                'password' => Str::random(40),
                'slug' => $uniqueSlug,
            ]);

            $provider->seedDefaultCatalog();
        }

        $token = Str::random(64);
        $provider->forceFill(['invitation_token' => $token])->save();

        $resetUrl = route('password.create', ['token' => $token, 'email' => $provider->email]);

        return [
            'provider' => $provider,
            'message' => $this->onboardMessage($provider, $resetUrl),
        ];
    }

    /**
     * Build the welcome message for a provider who has agreed to sign up,
     * with a link to set their own password.
     */
    protected function onboardMessage(Provider $provider, string $resetUrl): string
    {
        $greetingName = Str::before($provider->name, ' ');
        $bookingUrl = route('provider.booking', $provider->slug);

        return <<<MSG
        Hey {$greetingName}! Your LetsBook dashboard is ready.

        Click the link below to set your password and get started:
        {$resetUrl}

        Once you're in, you'll be able to see your bookings, manage your schedule, and share your booking page with customers:
        {$bookingUrl}

        Any questions at all, just reply and I'll help out!
        MSG;
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
