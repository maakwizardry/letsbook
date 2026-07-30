<?php

namespace App\Http\Controllers\Provider;

use App\Http\Controllers\Controller;
use App\Models\BlockedDate;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class BlockedDateController extends Controller
{
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'date' => [
                'required',
                'date',
                'after_or_equal:today',
                Rule::unique('blocked_dates', 'date')->where('provider_id', $request->user()->id),
            ],
            'reason' => ['nullable', 'string', 'max:255'],
        ]);

        $request->user()->blockedDates()->create($validated);

        return back();
    }

    public function destroy(Request $request, BlockedDate $blockedDate): RedirectResponse
    {
        abort_if($blockedDate->provider_id !== $request->user()->id, 403);

        $blockedDate->delete();

        return back();
    }
}
