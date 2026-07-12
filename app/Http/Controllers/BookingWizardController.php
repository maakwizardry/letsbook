<?php

namespace App\Http\Controllers;

use App\Models\Provider;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class BookingWizardController extends Controller
{
    public function show($slug)
    {
        $provider = Provider::where('slug', $slug)->firstOrFail();

        $completedCleanings = $provider->bookings()->count();

        return Inertia::render('Booking/Index', [
            'provider' => [
                'id' => $provider->id,
                'name' => $provider->name,
                'slug' => $provider->slug,
                'etransfer_email' => $provider->etransfer_email,
                'logo_url' => $provider->logo_path ? Storage::url($provider->logo_path) : null,
                'cover_image_url' => $provider->cover_image_path ? Storage::url($provider->cover_image_path) : null,
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
