<?php

namespace App\Http\Controllers\Api\Provider;

use App\Http\Controllers\Controller;
use App\Models\Staff;
use Illuminate\Http\Request;

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
}
