<?php

namespace App\Http\Controllers\Provider;

use App\Http\Controllers\Controller;
use App\Models\BookingSeries;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class BookingSeriesController extends Controller
{
    /**
     * Stop generating further occurrences for a series. Non-destructive:
     * already-generated future Booking rows are left as-is — the provider
     * can cancel any of those individually via the existing status control
     * if she wants to.
     */
    public function stop(Request $request, BookingSeries $bookingSeries): RedirectResponse
    {
        abort_if($bookingSeries->provider_id !== $request->user()->id, 403);

        $bookingSeries->update(['is_active' => false]);

        return back();
    }
}
