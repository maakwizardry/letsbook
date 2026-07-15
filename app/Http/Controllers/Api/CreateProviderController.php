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
            return response()->json([
                'message' => 'Provider already exists',
                'provider' => $existing,
                'outreach_message' => $onboarding->messageFor($existing),
            ], 409);
        }

        $result = $onboarding->create($validated['name']);

        return response()->json([
            'provider' => $result['provider'],
            'message' => $result['message'],
        ], 201);
    }
}
