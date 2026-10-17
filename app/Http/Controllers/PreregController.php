<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use App\Models\Registrant;
use App\Models\RegistrationCenter;
use Endroid\QrCode\QrCode;
use Endroid\QrCode\Writer\SvgWriter;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class PreregController extends Controller
{
    public const STANDARD_SLOTS = [
        ['label' => '8:00 – 8:20 AM', 'time24' => '08:00'],
        ['label' => '8:20 – 8:40 AM', 'time24' => '08:20'],
        ['label' => '8:40 – 9:00 AM', 'time24' => '08:40'],
        ['label' => '9:00 – 9:20 AM', 'time24' => '09:00'],
        ['label' => '9:20 – 9:40 AM', 'time24' => '09:20'],
        ['label' => '9:40 – 10:00 AM', 'time24' => '09:40'],
        ['label' => '10:00 – 10:20 AM', 'time24' => '10:00'],
        ['label' => '10:20 – 10:40 AM', 'time24' => '10:20'],
        ['label' => '10:40 – 11:00 AM', 'time24' => '10:40'],
        ['label' => '11:00 – 11:20 AM', 'time24' => '11:00'],
        ['label' => '11:20 – 11:40 AM', 'time24' => '11:20'],
        ['label' => '11:40 – 12:00 PM', 'time24' => '11:40'],
        ['label' => '1:00 – 1:20 PM', 'time24' => '13:00'],
        ['label' => '1:20 – 1:40 PM', 'time24' => '13:20'],
        ['label' => '1:40 – 2:00 PM', 'time24' => '13:40'],
        ['label' => '2:00 – 2:20 PM', 'time24' => '14:00'],
        ['label' => '2:20 – 2:40 PM', 'time24' => '14:20'],
        ['label' => '2:40 – 3:00 PM', 'time24' => '14:40'],
        ['label' => '3:00 – 3:20 PM', 'time24' => '15:00'],
        ['label' => '3:20 – 3:40 PM', 'time24' => '15:20'],
        ['label' => '3:40 – 4:00 PM', 'time24' => '15:40'],
        ['label' => '4:00 – 4:20 PM', 'time24' => '16:00'],
        ['label' => '4:20 – 4:40 PM', 'time24' => '16:20'],
        ['label' => '4:40 – 5:00 PM', 'time24' => '16:40'],
    ];
    private function current(Request $request): ?Registrant
    {
        $id = $request->session()->get('prereg_id');
        if (! $id) {
            return null;
        }

        $model = Registrant::find($id);

        return $model instanceof Registrant ? $model : null;
    }

    public function show(Request $request, int $step = 1): Response
    {
        $step = max(1, min(10, $step));
        $draft = $this->current($request)?->load('demographic', 'documents', 'appointments.center');

        if ($step === 10 && $draft && $draft->appointments->isNotEmpty()) {
            $appointment = $draft->appointments->last();
            $qr = (new SvgWriter)->write(new QrCode(url('/verify/offline?token='.$appointment->qr_token)));

            return Inertia::render('confirmation', [
                'appointment' => $appointment,
                'qrSvg' => $qr->getString(),
                'checklist' => ['Printed or phone confirmation', 'Identity document (original)', 'Address document (original)'],
            ]);
        }

        $slotData = null;
        if ($step === 9) {
            $centerId = $request->integer('center') ?: (RegistrationCenter::where('is_active', true)->first()?->id ?? 1);
            $tomorrow = Carbon::now()->addDay()->toDateString();
            $slotData = $this->buildSlotData($centerId, $request->input('date', $tomorrow), $tomorrow, 7);
        }

        return Inertia::render('prereg', [
            'step' => $step,
            'draft' => $draft,
            'demoOtp' => app()->isLocal() ? $request->session()->get('demo_otp') : null,
            'centers' => RegistrationCenter::where('is_active', true)->get(),
            'initialSlotData' => $slotData,
        ]);
    }

    public function language(Request $request): RedirectResponse
    {
        $data = $request->validate(['language' => 'required|in:en']);

        $registrant = $this->current($request) ?? new Registrant;
        $registrant->fill(['language' => $data['language'], 'mobile' => $registrant->mobile ?? 'pending-'.Str::random(8)]);
        $registrant->save();
        $request->session()->put('prereg_id', $registrant->id);

        return redirect()->route('prereg', ['step' => 2]);
    }

    public function captcha(Request $request): JsonResponse
    {
        $code = strtoupper(Str::random(5));
        $request->session()->put('captcha', $code);

        return response()->json(['challenge' => $code]);
    }

    public function mobile(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'mobile' => ['required', 'regex:/^\+675\d{7}$/'],
            'captcha' => 'required|string',
        ]);

        if (strtoupper($data['captcha']) !== $request->session()->get('captcha')) {
            return back()->withErrors(['captcha' => 'CAPTCHA did not match. Try again.']);
        }

        $registrant = Registrant::firstOrCreate(
            ['mobile' => $data['mobile']],
            ['language' => 'en', 'status' => 'draft']
        );
        $request->session()->put('prereg_id', $registrant->id);

        $code = (string) random_int(100000, 999999);
        Cache::put("otp:{$data['mobile']}", $code, now()->addMinutes(5));
        Cache::put("otp_throttle:{$data['mobile']}", true, now()->addSeconds(60));
        $request->session()->put('demo_otp', $code);

        return redirect()->route('prereg', ['step' => 3])->with('otp_sent', true);
    }

    public function resend(Request $request): RedirectResponse
    {
        $registrant = $this->current($request);
        abort_if(! $registrant || str_starts_with($registrant->mobile, 'pending-'), 422);

        if (Cache::has("otp_throttle:{$registrant->mobile}")) {
            return back()->withErrors(['otp' => 'Wait 60 seconds before resending.']);
        }

        $code = (string) random_int(100000, 999999);
        Cache::put("otp:{$registrant->mobile}", $code, now()->addMinutes(5));
        Cache::put("otp_throttle:{$registrant->mobile}", true, now()->addSeconds(60));
        $request->session()->put('demo_otp', $code);

        return redirect()->route('prereg', ['step' => 3])->with('otp_sent', true);
    }

    public function verifyOtp(Request $request): RedirectResponse
    {
        $data = $request->validate(['otp' => 'required|digits:6']);
        $registrant = $this->current($request);
        abort_if(! $registrant, 422);

        if (Cache::get("otp:{$registrant->mobile}") !== $data['otp']) {
            return back()->withErrors(['otp' => 'Incorrect or expired code.']);
        }

        $registrant->update(['mobile_verified_at' => now(), 'status' => 'verified']);
        Cache::forget("otp:{$registrant->mobile}");
        $request->session()->forget('demo_otp');

        return redirect()->route('prereg', ['step' => 4]);
    }

    public function consent(Request $request): RedirectResponse
    {
        $request->validate(['accept' => 'required|accepted']);
        $registrant = $this->current($request);
        abort_if(! $registrant, 422);

        $registrant->update([
            'consent_version' => config('identriq.consent_version', 'v1'),
            'consent_accepted_at' => now(),
            'status' => 'consented',
        ]);

        return redirect()->route('prereg', ['step' => 5]);
    }

    public function demographics(Request $request): RedirectResponse
    {
        $hasFull = ! empty($request->input('full_name'));

        $data = $request->validate([
            'given_name' => $hasFull ? 'nullable|string|max:80' : 'required|string|max:80',
            'family_name' => $hasFull ? 'nullable|string|max:80' : 'required|string|max:80',
            'middle_name' => 'nullable|string|max:80',
            'other_names' => 'nullable|string|max:120',
            'full_name' => 'nullable|string|max:160',
            'dob' => 'required|date|before:-16 years',
            'gender' => 'nullable|in:male,female,other',
            'sex' => 'nullable|in:male,female,other',
            'nationality' => 'nullable|string|max:80',
            'marital_status' => 'nullable|string|max:60',
            'mobile' => 'nullable|string|max:30',
            'email' => 'nullable|email|max:120',
            'province' => 'nullable|string|max:80',
            'district' => 'nullable|string|max:80',
            'llg' => 'nullable|string|max:80',
            'ward' => 'nullable|string|max:80',
            'village' => 'nullable|string|max:80',
            'residential_address' => 'nullable|string|max:255',
            'address_line' => 'nullable|string|max:255',
            'postal_code' => 'nullable|string|max:30',
        ]);

        $registrant = $this->current($request);
        abort_if(! $registrant, 422);

        // Derive full_name if given/family provided
        if (! empty($data['given_name']) && ! empty($data['family_name'])) {
            $middle = ! empty($data['middle_name']) ? ' '.$data['middle_name'] : '';
            $data['full_name'] = trim($data['given_name'].$middle.' '.$data['family_name']);
        } elseif (! empty($data['full_name'])) {
            $parts = explode(' ', $data['full_name'], 2);
            $data['given_name'] = $data['given_name'] ?? $parts[0];
            $data['family_name'] = $data['family_name'] ?? ($parts[1] ?? $parts[0]);
        }

        // Harmonize gender / sex
        $data['gender'] = $data['sex'] ?? $data['gender'] ?? 'female';
        unset($data['sex']);

        // Harmonize residential_address / address_line
        $address = $data['residential_address'] ?? $data['address_line'] ?? '';
        $data['residential_address'] = $address;
        $data['address_line'] = $address;

        $data['nationality'] = $data['nationality'] ?? 'Papua New Guinean';

        $registrant->demographic()->updateOrCreate(['registrant_id' => $registrant->id], $data);
        $registrant->update(['status' => 'demographics']);

        return redirect()->route('prereg', ['step' => 6]);
    }

    public function documents(Request $request): RedirectResponse
    {
        $registrant = $this->current($request);
        abort_if(! $registrant, 422);

        // Batch upload / update from Supporting Documents form
        if ($request->hasFile('primary_file') || $request->hasFile('secondary_file') || $request->hasFile('address_file') || $request->boolean('batch_mode')) {
            $request->validate([
                'primary_file' => 'nullable|file|mimes:jpg,jpeg,png,pdf|max:5120',
                'secondary_file' => 'nullable|file|mimes:jpg,jpeg,png,pdf|max:5120',
                'address_file' => 'nullable|file|mimes:jpg,jpeg,png,pdf|max:5120',
                'primary_doc_type' => 'nullable|string|max:80',
                'secondary_doc_type' => 'nullable|string|max:80',
                'address_doc_type' => 'nullable|string|max:80',
                'primary_ref_number' => 'nullable|string|max:80',
                'secondary_ref_number' => 'nullable|string|max:80',
                'address_ref_number' => 'nullable|string|max:80',
            ]);

            $existingPrimary = $registrant->documents()->whereIn('category', ['identity', 'primary_id'])->first();
            if ($request->hasFile('primary_file')) {
                $path = $request->file('primary_file')->store('prereg', 'public');
                $registrant->documents()->create([
                    'category' => 'identity',
                    'doc_type' => $request->input('primary_doc_type', 'birth_certificate'),
                    'ref_number' => $request->input('primary_ref_number'),
                    'path' => $path,
                    'mime' => $request->file('primary_file')->getClientMimeType(),
                    'size' => $request->file('primary_file')->getSize(),
                ]);
            } elseif ($existingPrimary) {
                if ($request->filled('primary_ref_number')) {
                    $existingPrimary->ref_number = $request->input('primary_ref_number');
                }
                if ($request->filled('primary_doc_type')) {
                    $existingPrimary->doc_type = $request->input('primary_doc_type');
                }
                $existingPrimary->save();
            }

            $existingSecondary = $registrant->documents()->whereIn('category', ['identity', 'secondary_id'])->skip(1)->first();
            if ($request->hasFile('secondary_file')) {
                $path = $request->file('secondary_file')->store('prereg', 'public');
                $registrant->documents()->create([
                    'category' => 'identity',
                    'doc_type' => $request->input('secondary_doc_type', 'employment_id'),
                    'ref_number' => $request->input('secondary_ref_number'),
                    'path' => $path,
                    'mime' => $request->file('secondary_file')->getClientMimeType(),
                    'size' => $request->file('secondary_file')->getSize(),
                ]);
            } elseif ($existingSecondary) {
                if ($request->filled('secondary_ref_number')) {
                    $existingSecondary->ref_number = $request->input('secondary_ref_number');
                }
                if ($request->filled('secondary_doc_type')) {
                    $existingSecondary->doc_type = $request->input('secondary_doc_type');
                }
                $existingSecondary->save();
            }

            $existingAddress = $registrant->documents()->whereIn('category', ['address', 'proof_of_address'])->first();
            if ($request->hasFile('address_file')) {
                $path = $request->file('address_file')->store('prereg', 'public');
                $registrant->documents()->create([
                    'category' => 'address',
                    'doc_type' => $request->input('address_doc_type', 'utility_bill'),
                    'ref_number' => $request->input('address_ref_number'),
                    'path' => $path,
                    'mime' => $request->file('address_file')->getClientMimeType(),
                    'size' => $request->file('address_file')->getSize(),
                ]);
            } elseif ($existingAddress) {
                if ($request->filled('address_ref_number')) {
                    $existingAddress->ref_number = $request->input('address_ref_number');
                }
                if ($request->filled('address_doc_type')) {
                    $existingAddress->doc_type = $request->input('address_doc_type');
                }
                $existingAddress->save();
            }

            $registrant->update(['status' => 'documents']);

            return redirect()->route('prereg', ['step' => 7]);
        }

        // Single file upload
        $data = $request->validate([
            'category' => 'required|string|in:identity,address,primary_id,secondary_id,proof_of_address',
            'doc_type' => 'required|string|max:80',
            'ref_number' => 'nullable|string|max:80',
            'file' => 'required|file|mimes:jpg,jpeg,png,pdf|max:10240',
        ]);

        $category = match ($data['category']) {
            'primary_id', 'secondary_id' => 'identity',
            'proof_of_address' => 'address',
            default => $data['category'],
        };

        $path = $request->file('file')->store('prereg', 'public');

        $registrant->documents()->create([
            'category' => $category,
            'doc_type' => $data['doc_type'],
            'ref_number' => $data['ref_number'] ?? null,
            'path' => $path,
            'mime' => $request->file('file')->getClientMimeType(),
            'size' => $request->file('file')->getSize(),
        ]);
        $registrant->update(['status' => 'documents']);

        return back();
    }

    public function confirm(Request $request): RedirectResponse
    {
        $registrant = $this->current($request);
        abort_if(! $registrant, 422);
        $registrant->load('demographic', 'documents', 'appointments');
        abort_unless($registrant->demographic && $registrant->documents->count() >= 1, 422);

        $registrant->update(['status' => 'reviewed']);

        return redirect()->route('prereg', ['step' => 8]);
    }

    public function book(Request $request): Response
    {
        $data = $request->validate([
            'center_id' => 'required|exists:registration_centers,id',
            'slot_at' => 'required|date|after:now',
        ]);
        $registrant = $this->current($request);
        abort_if(! $registrant, 422);

        $center = RegistrationCenter::findOrFail($data['center_id']);
        abort_if(! $center instanceof RegistrationCenter || ! $center->is_active, 422);

        $dayCount = Appointment::where('center_id', $center->id)
            ->whereDate('slot_at', $data['slot_at'])
            ->where('status', '!=', 'cancelled')
            ->count();
        abort_if($dayCount >= $center->daily_capacity, 422, 'Day is fully booked.');

        $slotCapacity = max(2, (int) ceil($center->daily_capacity / 24));
        $slotCount = Appointment::where('center_id', $center->id)
            ->where('slot_at', $data['slot_at'])
            ->where('status', '!=', 'cancelled')
            ->count();
        abort_if($slotCount >= $slotCapacity, 422, 'This specific time slot is fully booked. Please select another time slot.');

        $appointment = Appointment::create([
            'registrant_id' => $registrant->id,
            'center_id' => $center->id,
            'slot_at' => $data['slot_at'],
            'qr_token' => Str::random(32),
            'status' => 'booked',
        ]);
        $registrant->update(['status' => 'booked']);

        $qr = (new SvgWriter)->write(new QrCode(url('/verify/offline?token='.$appointment->qr_token)));

        return Inertia::render('confirmation', [
            'appointment' => $appointment->load('center'),
            'qrSvg' => $qr->getString(),
            'checklist' => ['Printed or phone confirmation', 'Identity document (original)', 'Address document (original)'],
        ]);
    }

    public function slots(Request $request): JsonResponse
    {
        $centerId = $request->integer('center_id') ?: 1;
        $tomorrow = Carbon::now()->addDay()->toDateString();
        $date = $request->input('date', $tomorrow);
        $days = min(14, max(1, $request->integer('days', 7)));
        $startDate = $request->input('start_date', $tomorrow);

        $data = $this->buildSlotData($centerId, $date, $startDate, $days);

        return response()->json($data);
    }

    public function buildSlotData(int $centerId, string $date, string $startDate, int $days = 7): array
    {
        $center = RegistrationCenter::find($centerId) ?? RegistrationCenter::where('is_active', true)->first();
        $dailyCapacity = $center?->daily_capacity ?: 50;
        $slotCapacity = max(2, (int) ceil($dailyCapacity / 24));

        $start = Carbon::parse($startDate)->startOfDay();
        $calendar = [];
        for ($i = 0; $i < $days; $i++) {
            $cur = $start->copy()->addDays($i);
            $curDateStr = $cur->toDateString();

            $dayBookings = $center ? Appointment::where('center_id', $center->id)
                ->whereDate('slot_at', $curDateStr)
                ->where('status', '!=', 'cancelled')
                ->count() : 0;

            $availableDaily = max(0, $dailyCapacity - $dayBookings);

            $calendar[] = [
                'dateStr' => $curDateStr,
                'dayName' => $cur->format('D'),
                'formattedDate' => $cur->format('M j, Y'),
                'slotsCount' => $availableDaily,
                'isFull' => $availableDaily <= 0,
            ];
        }

        $selectedAppointments = $center ? Appointment::where('center_id', $center->id)
            ->whereDate('slot_at', $date)
            ->where('status', '!=', 'cancelled')
            ->get(['slot_at']) : collect();

        $bookedSlots = [];
        foreach ($selectedAppointments as $app) {
            $t = Carbon::parse($app->slot_at)->format('H:i');
            $bookedSlots[$t] = ($bookedSlots[$t] ?? 0) + 1;
        }

        $slots = [];
        foreach (self::STANDARD_SLOTS as $slot) {
            $t24 = $slot['time24'];
            $bookedCount = $bookedSlots[$t24] ?? 0;
            $remaining = max(0, $slotCapacity - $bookedCount);

            $slots[] = [
                'label' => $slot['label'],
                'time24' => $t24,
                'total' => $slotCapacity,
                'booked' => $bookedCount,
                'available' => $remaining,
                'isFull' => $remaining <= 0,
            ];
        }

        return [
            'center_id' => $center?->id ?? $centerId,
            'selected_date' => $date,
            'daily_capacity' => $dailyCapacity,
            'slot_capacity' => $slotCapacity,
            'calendar' => $calendar,
            'slots' => $slots,
        ];
    }
}
