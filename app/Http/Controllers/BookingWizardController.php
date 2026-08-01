<?php

namespace App\Http\Controllers;

use App\Models\Provider;
use App\Models\Staff;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class BookingWizardController extends Controller
{
    public function show(Request $request, $slug)
    {
        $provider = Provider::where('slug', $slug)->firstOrFail();

        $completedCleanings = $provider->bookings()->count();

        // staff_id is only honored for a provider deliberately flagged into
        // staff scheduling — there's no staff-picker UI yet, so no real
        // request sends this today and every provider keeps seeing exactly
        // the provider-wide schedule they always have.
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

        $blockedDates = $provider->blockedDates()->where('date', '>=', today())->orderBy('date')->pluck('date')->map->toDateString();

        return Inertia::render('Booking/Index', [
            'availability' => $availability,
            'blockedDates' => $blockedDates,
            'provider' => [
                'id' => $provider->id,
                'name' => $provider->name,
                'slug' => $provider->slug,
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
}
