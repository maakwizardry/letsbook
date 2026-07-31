<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class BusinessController extends Controller
{
    /**
     * The fixed set of brand colors a provider can choose from — kept as
     * presets (not a free color picker) so every color is guaranteed to
     * have safe contrast with the white text used on `bg-primary` elements
     * throughout the dashboard.
     */
    public const BRAND_COLORS = ['#0284c7', '#059669', '#7c3aed', '#e11d48', '#d97706'];

    /**
     * Show the provider's business settings page.
     */
    public function edit(Request $request): Response
    {
        $provider = $request->user();

        return Inertia::render('settings/business', [
            'name' => $provider->name,
            'cover_image_url' => $provider->cover_image_path
                ? url(Storage::url($provider->cover_image_path)).'?v='.Storage::disk('public')->lastModified($provider->cover_image_path)
                : null,
            'notifications_enabled' => $provider->notifications_enabled,
            'brand_color' => $provider->brand_color,
        ]);
    }

    /**
     * Update the provider's business name.
     */
    public function updateName(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
        ]);

        $request->user()->update($validated);

        return back();
    }

    /**
     * Update the provider's booking-page cover photo.
     */
    public function updatePhoto(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'photo' => ['required', 'image', 'mimes:jpg,jpeg,png,webp,gif', 'max:8192'],
        ]);

        $path = $validated['photo']->store('covers', 'public');

        $request->user()->update(['cover_image_path' => $path]);

        return back();
    }

    /**
     * Update whether the provider's customers receive automated emails.
     */
    public function updateNotifications(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'notifications_enabled' => ['required', 'boolean'],
        ]);

        $request->user()->update($validated);

        return back();
    }

    /**
     * Update the provider's dashboard accent color.
     */
    public function updateBrandColor(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'brand_color' => ['required', 'string', Rule::in(self::BRAND_COLORS)],
        ]);

        $request->user()->update($validated);

        return back();
    }
}
