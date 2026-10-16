<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use App\Models\Document;
use App\Models\Identity;
use App\Models\Registrant;
use App\Models\RegistrationCenter;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class StaffController extends Controller
{
    private function getStats(?int $centerId = null): array
    {
        $todayStr = now()->toDateString();
        $base = Appointment::query();
        if ($centerId) {
            $base->where('center_id', $centerId);
        }

        return [
            'today_count' => (clone $base)->whereDate('slot_at', $todayStr)->whereIn('status', ['booked', 'checked-in'])->count(),
            'checked_in_count' => (clone $base)->where('status', 'checked-in')->count(),
            'rework_count' => (clone $base)->where('status', 'rework')->count(),
            'total_active' => (clone $base)->whereIn('status', ['booked', 'checked-in', 'rework'])->count(),
        ];
    }

    public function queue(Request $request): Response
    {
        $date = $request->query('date', 'all');
        $centerId = $request->query('center_id');
        $centerId = ($centerId && $centerId !== 'all') ? (int) $centerId : null;
        $q = trim((string) $request->query('q', ''));
        $filter = $request->query('filter', 'queue');

        $query = Appointment::with('registrant.demographic', 'center');

        if ($filter === 'rework') {
            $query->where('status', 'rework');
        } elseif ($date && $date !== 'all') {
            $query->whereDate('slot_at', $date);
        }

        if ($centerId) {
            $query->where('center_id', $centerId);
        }

        if ($q !== '') {
            $query->where(function ($sub) use ($q) {
                $sub->where('qr_token', 'like', "%{$q}%")
                    ->orWhere('id', $q)
                    ->orWhereHas('registrant', function ($r) use ($q) {
                        $r->where('mobile', 'like', "%{$q}%")
                            ->orWhereHas('demographic', function ($d) use ($q) {
                                $d->where('full_name', 'like', "%{$q}%")
                                    ->orWhere('given_name', 'like', "%{$q}%")
                                    ->orWhere('family_name', 'like', "%{$q}%");
                            });
                    });
            });
        }

        $appointments = $query->orderBy('slot_at', 'asc')->get();

        return Inertia::render('staff/queue', [
            'date' => $date,
            'selectedCenterId' => $centerId,
            'centers' => RegistrationCenter::where('is_active', true)->get(),
            'appointments' => $appointments,
            'search' => $q,
            'filter' => $filter,
            'stats' => $this->getStats($centerId),
        ]);
    }

    public function checkin(Appointment $appointment): RedirectResponse
    {
        $appointment->update(['status' => 'checked-in']);
        $appointment->registrant->update(['status' => 'checked-in']);

        return redirect()->route('staff.capture', $appointment);
    }

    public function walkin(Request $request): RedirectResponse
    {
        if (!str_starts_with($request->input('mobile', ''), '+675') && preg_match('/^\d{7}$/', $request->input('mobile', ''))) {
            $request->merge(['mobile' => '+675' . $request->input('mobile')]);
        }

        $data = $request->validate([
            'full_name' => 'required|string|max:120',
            'mobile' => ['required', 'regex:/^\+675\d{7}$/'],
            'center_id' => 'required|exists:registration_centers,id',
        ]);

        $registrant = Registrant::firstOrCreate(['mobile' => $data['mobile']], [
            'language' => 'en', 'status' => 'checked-in',
        ]);
        $registrant->demographic()->updateOrCreate(
            ['registrant_id' => $registrant->id],
            ['full_name' => $data['full_name'], 'dob' => '1990-01-01', 'gender' => 'other', 'nationality' => 'Papua New Guinean']
        );

        $appointment = Appointment::create([
            'registrant_id' => $registrant->id,
            'center_id' => $data['center_id'],
            'slot_at' => now(),
            'qr_token' => Str::random(32),
            'status' => 'checked-in',
        ]);

        return redirect()->route('staff.capture', $appointment);
    }

    public function capture(Appointment $appointment): Response
    {
        return Inertia::render('staff/capture', [
            'appointment' => $appointment->load('registrant.demographic', 'registrant.documents', 'center'),
        ]);
    }

    public function submit(Request $request, Appointment $appointment): RedirectResponse
    {
        $data = $request->validate([
            'photo' => 'nullable|file|mimes:jpg,jpeg,png|max:10240',
            'fingerprint_ref' => 'nullable|string|max:120',
            'iris_ref' => 'nullable|string|max:120',
            'documents' => 'nullable|array',
            'documents.*.status' => 'in:accepted,rejected',
            'documents.*.note' => 'nullable|string|max:500',
            'attest' => 'required|accepted',
        ]);

        $registrant = $appointment->registrant;

        if ($request->hasFile('photo')) {
            $request->file('photo')->store('capture', 'public');
        }

        $rejected = 0;
        foreach ($data['documents'] ?? [] as $id => $doc) {
            $document = Document::where('id', $id)->where('registrant_id', $registrant->id)->first();
            if (! $document) {
                continue;
            }
            $document->update([
                'verified_status' => $doc['status'],
                'verified_note' => $doc['note'] ?? null,
            ]);
            if ($doc['status'] === 'rejected') {
                $rejected++;
            }
        }

        if ($rejected > 0) {
            $registrant->update(['status' => 'rework']);
            $appointment->update(['status' => 'rework']);

            return redirect()->route('staff.queue')->with('rework', true);
        }

        $registrant->update(['status' => 'validating']);
        $appointment->update(['status' => 'completed']);
        Identity::firstOrCreate(['registrant_id' => $registrant->id], ['status' => 'pending']);

        return redirect()->route('staff.queue')->with('submitted', true);
    }

    public function rework(Request $request): Response
    {
        $centerId = $request->query('center_id');
        $centerId = ($centerId && $centerId !== 'all') ? (int) $centerId : null;

        $query = Appointment::with('registrant.demographic', 'center')->where('status', 'rework');
        if ($centerId) {
            $query->where('center_id', $centerId);
        }

        return Inertia::render('staff/queue', [
            'date' => 'all',
            'selectedCenterId' => $centerId,
            'centers' => RegistrationCenter::where('is_active', true)->get(),
            'appointments' => $query->orderBy('slot_at')->get(),
            'search' => '',
            'filter' => 'rework',
            'stats' => $this->getStats($centerId),
        ]);
    }

    public function setup(): Response
    {
        return Inertia::render('staff/setup', [
            'centers' => RegistrationCenter::all(),
            'stats' => $this->getStats(),
        ]);
    }

    public function updateSetup(Request $request, RegistrationCenter $center): RedirectResponse
    {
        $data = $request->validate([
            'daily_capacity' => 'required|integer|min:1|max:1000',
            'opening_hours' => 'nullable|array',
            'is_active' => 'nullable|boolean',
        ]);

        $center->update([
            'daily_capacity' => $data['daily_capacity'],
            'opening_hours' => $data['opening_hours'] ?? $center->opening_hours,
            'is_active' => $data['is_active'] ?? $center->is_active,
        ]);

        return back();
    }
}
