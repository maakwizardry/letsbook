<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class BusinessController extends Controller
{
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
}
