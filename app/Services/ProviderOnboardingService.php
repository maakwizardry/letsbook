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
     * returning it alongside three outreach message variants pointing them
     * to their new booking page.
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
            'messages' => $this->messagesFor($provider),
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
     * Build the three outreach message variants for an existing provider,
     * pointing them to their booking page.
     */
    public function messagesFor(Provider $provider): array
    {
        return $this->outreachMessages($provider->name, route('provider.booking', $provider->slug));
    }

    /**
     * Build three cold-outreach variants for a newly created provider, all
     * in the same warm, conversational tone but each opening the
     * conversation from a different angle, so the best fit can be picked
     * per prospect (and so reply rates reveal which angle converts):
     *
     * 1. Warm intro — closest to a friendly note: names the pain, shares
     *    the page as something made for them, asks for their thoughts.
     * 2. Conversation starter — opens by asking how they handle bookings
     *    today before revealing the page, so the message invites a reply
     *    rather than just a click.
     * 3. Open book — the only variant that mentions the one-time $99,
     *    framed softly as "no subscriptions"; price stays out of the other
     *    two because the first message's job is to start a conversation.
     *
     * Every variant links the live demo page — seeing their own business
     * on a real page is the strongest hook.
     *
     * Each entry is ['label' => ..., 'message' => ...].
     */
    protected function outreachMessages(string $name, string $url): array
    {
        $greetingName = Str::before($name, ' ');

        $warmIntro = <<<MSG
        Hey {$greetingName}! I came across your cleaning business and had an idea I wanted to share with you.

        I know handling bookings through Facebook messages and texts can get messy — customers asking about prices, availability, what time works. So I put together a booking page for your business, just so you can see what it could look like:

        {$url}

        Customers can pick a service, add their address, and choose a time that suits you — all the details in one place instead of scattered across chats.

        No pressure at all — I'd just love to hear what you think!
        MSG;

        $conversationStarter = <<<MSG
        Hey {$greetingName}! Hope business is going well. Quick question — how are you handling bookings at the moment? Mostly through Facebook messages and texts?

        I've been talking with a few cleaning businesses lately, and the back-and-forth about prices, availability, and addresses keeps coming up as the most annoying part of the job.

        I actually put together a booking page for your business where customers fill in all of that themselves and just pick a time — here it is if you'd like a look:

        {$url}

        Curious what you think!
        MSG;

        $openBook = <<<MSG
        Hey {$greetingName}! I make simple booking pages for cleaning businesses, and I went ahead and made one for yours so you could see it for real instead of me just describing it:

        {$url}

        Customers pick a service, add their address, and choose a time that works for you — no more chasing details over messages.

        And just so you have the full picture: if you find it useful, it's a one-time \$99 to keep — no subscriptions or monthly fees, I'm not a fan of those either. If it's not for you, no worries at all.

        Would love your feedback either way!
        MSG;

        return [
            ['label' => 'Warm intro — friendly note, no price', 'message' => $warmIntro],
            ['label' => 'Conversation starter — question first, no price', 'message' => $conversationStarter],
            ['label' => 'Open book — honest offer, mentions the one-time $99', 'message' => $openBook],
        ];
    }
}
