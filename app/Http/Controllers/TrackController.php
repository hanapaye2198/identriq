<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use App\Models\Identity;
use App\Models\Registrant;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TrackController extends Controller
{
    public function index(Request $request): Response
    {
        // If user wants a fresh search, clear any prereg session cache
        if ($request->boolean('reset') || $request->has('new')) {
            $request->session()->forget('prereg_id');

            return Inertia::render('track', ['result' => null]);
        }

        // If query parameters provided via GET (e.g. /track?mobile=... or /track?token=...)
        if ($request->filled('mobile') || $request->filled('qr_token') || $request->filled('token')) {
            $registrant = $this->findRegistrant(
                $request->input('mobile'),
                $request->input('qr_token', $request->input('token'))
            );
            if ($registrant) {
                return $this->renderResult($registrant);
            }
        }

        // If user just completed pre-registration, auto-display their application tracking!
        $preregId = $request->session()->get('prereg_id');
        if ($preregId) {
            $registrant = Registrant::find($preregId);
            if ($registrant && $registrant->appointments()->exists()) {
                return $this->renderResult($registrant);
            }
        }

        return Inertia::render('track', ['result' => null]);
    }

    public function lookup(Request $request): Response|RedirectResponse
    {
        $data = $request->validate([
            'mobile' => 'nullable|string',
            'qr_token' => 'nullable|string',
        ]);

        if (empty($data['mobile']) && empty($data['qr_token'])) {
            return redirect()->route('track');
        }

        $registrant = $this->findRegistrant($data['mobile'] ?? null, $data['qr_token'] ?? null);

        if (! $registrant) {
            if ($request->header('X-Inertia')) {
                return back()->withErrors([
                    'lookup' => 'No registration record found matching your query. Please double check the details and try again.',
                ]);
            }

            abort(404, 'No registration found.');
        }

        return $this->renderResult($registrant);
    }

    protected function findRegistrant(?string $mobile, ?string $token): ?Registrant
    {
        if (! empty($token)) {
            $cleanToken = trim($token);

            // 1. Direct match on qr_token
            $appointment = Appointment::where('qr_token', $cleanToken)->first();
            if ($appointment?->registrant) {
                return $appointment->registrant;
            }

            // 2. Formatted ref number IDQ-YYYY-MMDD-NNNNNN -> extract trailing numeric ID
            if (preg_match('/IDQ.*-(\d+)$/i', $cleanToken, $m)) {
                $id = (int) $m[1];
                $app = Appointment::find($id);
                if ($app?->registrant) {
                    return $app->registrant;
                }
                $reg = Registrant::find($id);
                if ($reg) {
                    return $reg;
                }
            }

            // 3. Match appointment or registrant by numeric ID
            if (is_numeric($cleanToken)) {
                $id = (int) $cleanToken;
                $app = Appointment::find($id);
                if ($app?->registrant) {
                    return $app->registrant;
                }
                $reg = Registrant::find($id);
                if ($reg) {
                    return $reg;
                }
            }

            // 4. BioSure ID number on Identity
            $reg = Registrant::whereHas('identity', fn ($q) => $q->where('biosure_id_number', $cleanToken))->first();
            if ($reg) {
                return $reg;
            }

            // 5. Match QR signature on Identity
            $reg = Registrant::whereHas('identity', fn ($q) => $q->where('qr_signature', $cleanToken))->first();
            if ($reg) {
                return $reg;
            }
        }

        if (! empty($mobile)) {
            $input = trim($mobile);
            $digits = preg_replace('/\D/', '', $input);

            $candidates = [
                $input,
                preg_replace('/\s+/', '', $input),
            ];

            if (! empty($digits)) {
                $candidates[] = $digits;
                $candidates[] = '+'.$digits;
                if (str_starts_with($digits, '675')) {
                    $candidates[] = substr($digits, 3);
                    $candidates[] = '+'.$digits;
                } else {
                    $candidates[] = '+675'.$digits;
                }
            }

            $candidates = array_unique(array_filter($candidates));

            // Search by exact match across candidates
            $reg = Registrant::whereIn('mobile', $candidates)->first();
            if ($reg) {
                return $reg;
            }

            // Search in demographics table
            $reg = Registrant::whereHas('demographic', function ($q) use ($candidates, $digits) {
                $q->whereIn('mobile', $candidates);
                if (strlen($digits) >= 7) {
                    $q->orWhere('mobile', 'like', "%{$digits}%");
                }
            })->first();
            if ($reg) {
                return $reg;
            }

            // Fallback substring search on registrant mobile if at least 7 digits
            if (strlen($digits) >= 7) {
                $reg = Registrant::where('mobile', 'like', "%{$digits}%")->first();
                if ($reg) {
                    return $reg;
                }
            }
        }

        return null;
    }

    protected function renderResult(Registrant $registrant): Response
    {
        $registrant->load('demographic', 'documents', 'appointments.center', 'identity.authEvents', 'notifications');

        $timeline = [
            ['stage' => 'registered', 'at' => $registrant->created_at, 'done' => true],
            ['stage' => 'validating', 'at' => null, 'done' => in_array($registrant->status, ['validating', 'approved', 'failed', 'issued', 'delivered'], true)],
            ['stage' => $registrant->identity?->status === 'failed' ? 'failed' : 'approved', 'at' => $registrant->identity?->updated_at, 'done' => (bool) $registrant->identity],
            ['stage' => 'personalized', 'at' => $registrant->identity?->card_personalized_at, 'done' => (bool) $registrant->identity?->card_personalized_at],
            ['stage' => 'delivered', 'at' => $registrant->identity?->delivered_at, 'done' => (bool) $registrant->identity?->delivered_at],
        ];

        return Inertia::render('track', [
            'result' => [
                'registrant' => $registrant,
                'timeline' => $timeline,
            ],
        ]);
    }
}
