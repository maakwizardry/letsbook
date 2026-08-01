<?php

namespace App\Http\Controllers\Provider;

use App\Http\Controllers\Controller;
use App\Models\Staff;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class StaffController extends Controller
{
    /**
     * Every action here 403s for a provider that hasn't been deliberately
     * flagged into staff scheduling (Provider::uses_staff_scheduling) —
     * there's no self-serve way to flip that flag, so this page and its
     * actions stay unreachable for every provider unless it's turned on
     * for them first. Same gate as Api\Provider\StaffController.
     */
    private function ensureStaffSchedulingEnabled(Request $request): void
    {
        abort_unless($request->user()->uses_staff_scheduling, 403, 'Staff scheduling is not enabled for this account.');
    }

    public function index(Request $request): Response
    {
        $this->ensureStaffSchedulingEnabled($request);

        $staff = $request->user()->staff()->orderBy('name')->get()->map(function (Staff $staff) {
            $ownSchedule = $staff->availabilities()->orderBy('day_of_week')->orderBy('start_time')->get();

            return [
                'id' => $staff->id,
                'name' => $staff->name,
                'is_active' => $staff->is_active,
                'usesOwnSchedule' => $ownSchedule->isNotEmpty(),
                'schedule' => $ownSchedule->map(fn ($a) => [
                    'id' => $a->id,
                    'day_of_week' => $a->day_of_week,
                    'start_time' => substr($a->start_time, 0, 5),
                    'end_time' => substr($a->end_time, 0, 5),
                ]),
                'blockedDates' => $staff->blockedDates()->orderBy('date')->get()->map(fn ($b) => [
                    'id' => $b->id,
                    'date' => $b->date->toDateString(),
                    'reason' => $b->reason,
                ]),
            ];
        });

        $providerSchedule = $request->user()->availabilities()
            ->whereNull('staff_id')
            ->orderBy('day_of_week')
            ->orderBy('start_time')
            ->get()
            ->map(fn ($a) => [
                'day_of_week' => $a->day_of_week,
                'start_time' => substr($a->start_time, 0, 5),
                'end_time' => substr($a->end_time, 0, 5),
            ]);

        return Inertia::render('staff', [
            'staff' => $staff,
            'providerSchedule' => $providerSchedule,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $this->ensureStaffSchedulingEnabled($request);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
        ]);

        $request->user()->staff()->create($validated);

        return back();
    }

    public function update(Request $request, $id): RedirectResponse
    {
        $this->ensureStaffSchedulingEnabled($request);

        $staff = Staff::where('provider_id', $request->user()->id)->findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'is_active' => 'sometimes|boolean',
        ]);

        $staff->update($validated);

        return back();
    }

    public function destroy(Request $request, $id): RedirectResponse
    {
        $this->ensureStaffSchedulingEnabled($request);

        $staff = Staff::where('provider_id', $request->user()->id)->findOrFail($id);
        $staff->delete();

        return back();
    }

    /**
     * Replaces just this staff member's own schedule (their rows only,
     * scoped by staff_id) — never touches the provider-wide rows the main
     * Availability page manages, so this can't interfere with the
     * provider's default calendar or any other staff member's hours.
     */
    public function updateAvailability(Request $request, $id): RedirectResponse
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

        return back();
    }
}
