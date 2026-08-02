<?php

namespace App\Http\Controllers;

use App\Models\PageVisit;
use App\Models\Provider;
use App\Models\Staff;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class BookingWizardController extends Controller
{
    /**
     * Case-insensitive substrings that flag a request as an automated
     * crawler rather than a real visitor — deliberately conservative
     * (search-engine/SEO bots only), so a link-preview bot from a
     * messaging app (which still signals a real person shared the link)
     * isn't filtered out.
     */
    private const BOT_USER_AGENT_MARKERS = [
        'bot', 'spider', 'crawl', 'slurp', 'ahrefs', 'semrush', 'mj12bot',
        'dotbot', 'petalbot', 'bytespider', 'yandex', 'baiduspider',
    ];

    public function show(Request $request, $slug)
    {
        $provider = Provider::where('slug', $slug)->firstOrFail();

        $this->logVisit($request, $provider);

        $completedCleanings = $provider->bookings()->count();

        // staff_id is only honored for a provider deliberately flagged into
        // staff scheduling, and only when it names one of their own staff.
        $staffId = null;
        if ($provider->uses_staff_scheduling && $request->filled('staff_id')) {
            $staffId = Staff::where('id', $request->staff_id)
                ->where('provider_id', $provider->id)
                ->value('id');
        }

        if ($staffId && $provider->availabilities()->where('staff_id', $staffId)->exists()) {
            // This staff member has their own schedule — use it exclusively.
            $availabilityQuery = $provider->availabilities()->where('staff_id', $staffId);
        } else {
            // No staff_id, or this staff member hasn't been given their own
            // hours yet — same provider-wide (staff_id null) rows as always.
            $availabilityQuery = $provider->availabilities()->whereNull('staff_id');
        }

        $availability = $availabilityQuery
            ->orderBy('day_of_week')
            ->orderBy('start_time')
            ->get()
            ->map(fn ($availability) => [
                'day_of_week' => $availability->day_of_week,
                'start_time' => substr($availability->start_time, 0, 5),
                'end_time' => substr($availability->end_time, 0, 5),
            ]);

        // A specific staff member's own holidays block their calendar in
        // addition to the whole-business blocked dates; "any available"
        // (no staff_id) only sees whole-business closures, since that path
        // doesn't know which staff member would actually take the job.
        $blockedDates = $provider->blockedDates()
            ->where('date', '>=', today())
            ->when($staffId, fn ($query) => $query->where(fn ($q) => $q->whereNull('staff_id')->orWhere('staff_id', $staffId)))
            ->when(! $staffId, fn ($query) => $query->whereNull('staff_id'))
            ->orderBy('date')
            ->pluck('date')
            ->map->toDateString();

        // Active staff, only for a provider flagged into staff scheduling —
        // this stays an empty array (no picker renders) for every provider
        // without the flag, which today is all of them.
        $staff = $provider->uses_staff_scheduling
            ? $provider->staff()->where('is_active', true)->orderBy('name')->get(['id', 'name'])
            : [];

        return Inertia::render('Booking/Index', [
            'availability' => $availability,
            'blockedDates' => $blockedDates,
            'staff' => $staff,
            'provider' => [
                'id' => $provider->id,
                'name' => $provider->name,
                'slug' => $provider->slug,
                'business_type' => $provider->business_type,
                'business_niche' => $provider->business_niche,
                'etransfer_email' => $provider->etransfer_email,
                'logo_url' => $provider->logo_path ? url(Storage::url($provider->logo_path)).'?v='.Storage::disk('public')->lastModified($provider->logo_path) : null,
                'cover_image_url' => $provider->cover_image_path ? url(Storage::url($provider->cover_image_path)).'?v='.Storage::disk('public')->lastModified($provider->cover_image_path) : asset('images/default-cover.jpg'),
                'tagline' => $provider->tagline,
                'rating' => $provider->rating ? (float) $provider->rating : null,
                'completed_cleanings_count' => $completedCleanings > 0 ? $completedCleanings : null,
                'years_in_business' => $provider->years_in_business,
                'brand_color' => $provider->brand_color,
                'is_insured' => $provider->is_insured,
                'is_background_checked' => $provider->is_background_checked,
                'has_satisfaction_guarantee' => $provider->has_satisfaction_guarantee,
            ]
        ]);
    }

    /**
     * Records one row per real page load. Skips Inertia partial reloads
     * (the staff-picker's ?staff_id= refetch hits this same action, but
     * that's the same visitor switching an option, not a new visit) and
     * requests from an obvious crawler.
     */
    private function logVisit(Request $request, Provider $provider): void
    {
        if ($request->header('X-Inertia')) {
            return;
        }

        if ($this->isLikelyBot($request->userAgent())) {
            return;
        }

        PageVisit::create([
            'provider_id' => $provider->id,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'referrer' => $request->header('referer'),
            'visited_at' => now(),
        ]);
    }

    private function isLikelyBot(?string $userAgent): bool
    {
        if (! $userAgent) {
            return false;
        }

        $userAgent = strtolower($userAgent);

        foreach (self::BOT_USER_AGENT_MARKERS as $marker) {
            if (str_contains($userAgent, $marker)) {
                return true;
            }
        }

        return false;
    }
}
