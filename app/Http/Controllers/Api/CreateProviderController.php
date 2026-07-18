<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\ProviderOnboardingService;
use Illuminate\Http\Request;

class CreateProviderController extends Controller
{
    public function store(Request $request, ProviderOnboardingService $onboarding)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
        ]);

        if ($existing = $onboarding->findByName($validated['name'])) {
            $variants = $onboarding->messagesFor($existing);

            return response()->json([
                'message' => 'Provider already exists',
                'provider' => $existing,
                'outreach_messages' => $variants,
                // Back-compat for consumers of the old single-message shape.
                'outreach_message' => $variants[0]['message'],
            ], 409);
        }

        $result = $onboarding->create($validated['name']);

        return response()->json([
            'provider' => $result['provider'],
            'messages' => $result['messages'],
            // Back-compat for consumers of the old single-message shape.
            'message' => $result['messages'][0]['message'],
        ], 201);
    }

    public function onboard(Request $request, ProviderOnboardingService $onboarding)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email',
        ]);

        $result = $onboarding->onboard($validated['name'], $validated['email']);

        return response()->json([
            'provider' => $result['provider'],
            'message' => $result['message'],
        ], 201);
    }
}
