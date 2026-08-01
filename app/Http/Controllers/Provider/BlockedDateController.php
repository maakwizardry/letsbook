<?php

namespace App\Http\Controllers\Provider;

use App\Http\Controllers\Controller;
use App\Models\BlockedDate;
use App\Models\Staff;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class BlockedDateController extends Controller
{
    public function store(Request $request): RedirectResponse
    {
        // staff_id only takes effect for a provider flagged into staff
        // scheduling, and only for a staff member that's actually theirs —
        // same gating pattern as everywhere else staff_id is accepted.
        // Omitted (or ignored), this is a provider-wide blocked date,
        // exactly like every blocked date created before this option
        // existed.
        $staffId = null;
        if ($request->user()->uses_staff_scheduling && $request->filled('staff_id')) {
            $staffId = Staff::where('id', $request->staff_id)
                ->where('provider_id', $request->user()->id)
                ->value('id');
        }

        $validated = $request->validate([
            'date' => [
                'required',
                'date',
                'after_or_equal:today',
                Rule::unique('blocked_dates', 'date')
                    ->where('provider_id', $request->user()->id)
                    ->where(fn ($query) => $staffId ? $query->where('staff_id', $staffId) : $query->whereNull('staff_id')),
            ],
            'reason' => ['nullable', 'string', 'max:255'],
        ]);

        $request->user()->blockedDates()->create([...$validated, 'staff_id' => $staffId]);

        return back();
    }

    public function destroy(Request $request, BlockedDate $blockedDate): RedirectResponse
    {
        abort_if($blockedDate->provider_id !== $request->user()->id, 403);

        $blockedDate->delete();

        return back();
    }
}
