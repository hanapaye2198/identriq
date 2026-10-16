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
    public function queue(Request $request): Response
    {
        $date = $request->query('date', now()->toDateString());

        return Inertia::render('staff/queue', [
            'date' => $date,
            'centers' => RegistrationCenter::where('is_active', true)->get(),
            'appointments' => Appointment::with('registrant.demographic', 'center')
                ->whereDate('slot_at', $date)
                ->orderBy('slot_at')
                ->get(),
            'search' => $request->query('q', ''),
            'results' => $request->query('q')
                ? Registrant::with('demographic', 'appointments')
                    ->where('mobile', 'like', '%'.$request->query('q').'%')
                    ->orWhereHas('demographic', fn ($q) => $q->where('full_name', 'like', '%'.$request->query('q').'%'))
                    ->limit(20)->get()
                : [],
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

    public function rework(): Response
    {
        return Inertia::render('staff/queue', [
            'date' => now()->toDateString(),
            'centers' => RegistrationCenter::where('is_active', true)->get(),
            'appointments' => Appointment::with('registrant.demographic', 'center')
                ->where('status', 'rework')->orderBy('slot_at')->get(),
            'search' => '',
            'results' => [],
            'filter' => 'rework',
        ]);
    }

    public function setup(): Response
    {
        return Inertia::render('staff/setup', [
            'centers' => RegistrationCenter::all(),
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
