<?php

namespace App\Http\Controllers;

use App\Models\Provider;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BookingWizardController extends Controller
{
    public function show($slug)
    {
        $provider = Provider::where('slug', $slug)->firstOrFail();
        
        return Inertia::render('Booking/Index', [
            'provider' => [
                'id' => $provider->id,
                'name' => $provider->name,
                'slug' => $provider->slug,
            ]
        ]);
    }
}
