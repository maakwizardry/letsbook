<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Provider;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    /**
     * Show the registration page.
     */
    public function create(): Response
    {
        return Inertia::render('auth/register');
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:'.Provider::class,
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        $slug = Str::slug($request->name) ?: Str::random(8);
        $uniqueSlug = $slug;
        for ($i = 2; Provider::where('slug', $uniqueSlug)->exists(); $i++) {
            $uniqueSlug = "{$slug}-{$i}";
        }

        $provider = DB::transaction(function () use ($request, $uniqueSlug) {
            $provider = Provider::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => $request->password,
                'slug' => $uniqueSlug,
            ]);

            $provider->seedDefaultCatalog();

            return $provider;
        });

        event(new Registered($provider));

        Auth::login($provider);

        return to_route('dashboard');
    }
}
