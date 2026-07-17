<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Provider;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class ProviderInvitationController extends Controller
{
    /**
     * Show the "create a new password" page for a provider onboarding
     * invitation link. Uses the same page/UI as a password reset, but the
     * underlying token (see `store()`) never expires — appropriate for an
     * invite a provider might not get around to for a few days, unlike a
     * "forgot password" reset which should stay short-lived.
     */
    public function create(Request $request): Response
    {
        return Inertia::render('auth/create-password', [
            'email' => $request->email,
            'token' => $request->route('token'),
        ]);
    }

    /**
     * Set the provider's password from a non-expiring invitation token.
     * The token is single-use: it's cleared as soon as it's successfully
     * used, so the link can't be replayed afterward.
     *
     * @throws ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'token' => 'required|string',
            'email' => 'required|email',
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        $provider = Provider::where('email', $validated['email'])->first();

        if (! $provider || ! $provider->invitation_token || ! Hash::check($validated['token'], $provider->invitation_token)) {
            throw ValidationException::withMessages([
                'email' => ['This invitation link is invalid or has already been used.'],
            ]);
        }

        $provider->forceFill([
            'password' => Hash::make($validated['password']),
            'remember_token' => Str::random(60),
            'invitation_token' => null,
        ])->save();

        event(new PasswordReset($provider));

        Auth::login($provider);

        return to_route('dashboard');
    }
}
