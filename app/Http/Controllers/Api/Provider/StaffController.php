<?php

namespace App\Http\Controllers\Api\Provider;

use App\Http\Controllers\Controller;
use App\Models\Staff;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class StaffController extends Controller
{
    /**
     * Every action here 403s for a provider that hasn't been deliberately
     * flagged into staff scheduling (Provider::uses_staff_scheduling) —
     * there's no self-serve way to flip that flag, so this endpoint stays
     * unreachable for every provider unless it's turned on for them first.
     */
    private function ensureStaffSchedulingEnabled(Request $request): void
    {
        abort_unless($request->user()->uses_staff_scheduling, 403, 'Staff scheduling is not enabled for this account.');
    }

    public function index(Request $request)
    {
        $this->ensureStaffSchedulingEnabled($request);

        return response()->json($request->user()->staff()->get());
    }

    public function store(Request $request)
    {
        $this->ensureStaffSchedulingEnabled($request);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'is_active' => 'sometimes|boolean',
        ]);

        $staff = $request->user()->staff()->create($validated);

        return response()->json($staff, 201);
    }

    public function update(Request $request, $id)
    {
        $this->ensureStaffSchedulingEnabled($request);

        $staff = Staff::where('provider_id', $request->user()->id)->findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'is_active' => 'sometimes|boolean',
        ]);

        $staff->update($validated);

        return response()->json($staff);
    }

    public function destroy(Request $request, $id)
    {
        $this->ensureStaffSchedulingEnabled($request);

        $staff = Staff::where('provider_id', $request->user()->id)->findOrFail($id);
        $staff->delete();

        return response()->json(null, 204);
    }

    /**
     * A staff member's own working hours. Falls back to the provider's
     * shared calendar (the rows with staff_id null, i.e. everything that
     * exists today) when this staff member hasn't been given their own
     * schedule yet, so a newly created staff member is immediately bookable
     * during the provider's normal hours instead of appearing to have none.
     */
    public function availability(Request $request, $id)
    {
        $this->ensureStaffSchedulingEnabled($request);

        $staff = Staff::where('provider_id', $request->user()->id)->findOrFail($id);

        $ownSchedule = $staff->availabilities()->orderBy('day_of_week')->orderBy('start_time')->get();
        $schedule = $ownSchedule->isNotEmpty()
            ? $ownSchedule
            : $request->user()->availabilities()->whereNull('staff_id')->orderBy('day_of_week')->orderBy('start_time')->get();

        return response()->json([
            'source' => $ownSchedule->isNotEmpty() ? 'staff' : 'provider_default',
            'schedule' => $schedule->map(fn ($availability) => [
                'id' => $availability->id,
                'day_of_week' => $availability->day_of_week,
                'start_time' => substr($availability->start_time, 0, 5),
                'end_time' => substr($availability->end_time, 0, 5),
            ]),
        ]);
    }

    /**
     * Replaces just this staff member's own schedule (their rows only,
     * scoped by staff_id) — never touches the provider-wide rows the
     * existing dashboard schedule editor manages, so this can't interfere
     * with the current single-calendar behavior.
     */
    public function updateAvailability(Request $request, $id)
    {
        $this->ensureStaffSchedulingEnabled($request);

        $staff = Staff::where('provider_id', $request->user()->id)->findOrFail($id);

        $validated = $request->validate([
            'schedule' => 'present|array',
            'schedule.*.day_of_week' => 'required|integer|min:0|max:6',
            'schedule.*.start_time' => 'required|date_format:H:i',
            'schedule.*.end_time' => 'required|date_format:H:i|after:schedule.*.start_time',
        ]);

        DB::transaction(function () use ($request, $staff, $validated) {
            $staff->availabilities()->delete();

            $rows = collect($validated['schedule'])->map(fn ($range) => [
                'provider_id' => $request->user()->id,
                'staff_id' => $staff->id,
                'day_of_week' => $range['day_of_week'],
                'start_time' => $range['start_time'],
                'end_time' => $range['end_time'],
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            if ($rows->isNotEmpty()) {
                DB::table('availabilities')->insert($rows->all());
            }
        });

        return response()->json(['status' => 'ok']);
    }
}
