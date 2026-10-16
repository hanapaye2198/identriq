<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use App\Models\Registrant;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TrackController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('track');
    }

    public function lookup(Request $request): Response
    {
        $data = $request->validate([
            'mobile' => 'nullable|string',
            'qr_token' => 'nullable|string',
        ]);

        $registrant = null;
        if (! empty($data['qr_token'])) {
            $appointment = Appointment::where('qr_token', $data['qr_token'])->first();
            $registrant = $appointment?->registrant;
        } elseif (! empty($data['mobile'])) {
            $registrant = Registrant::where('mobile', $data['mobile'])->first();
        }
        abort_if(! $registrant, 404, 'No registration found.');

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
