<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use App\Models\AuthEvent;
use App\Models\Identity;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class VerifyController extends Controller
{
    public function offline(Request $request): Response
    {
        // Demo trade-off, intentionally kept (decision D3, 2026-10-17): the
        // snapshot ships to the client unauthenticated so the offline demo works
        // without a login. It exposes token/name/BioSure pairs to anyone opening
        // this page — fine for the local demo; revisit (auth + signed payloads)
        // before any public deployment.
        return Inertia::render('verify/offline', [
            'token' => $request->query('token', ''),
            'snapshot' => Appointment::with('registrant.demographic', 'registrant.identity')
                ->where('status', '!=', 'cancelled')
                ->get()
                ->map(fn ($a) => [
                    'token' => $a->qr_token,
                    'name' => $a->registrant->demographic?->full_name,
                    'biosure' => $a->registrant->identity?->biosure_id_number,
                    'state' => $a->registrant->identity?->credentialState() ?? 'not_issued',
                ]),
        ]);
    }

    public function check(Request $request): JsonResponse
    {
        $data = $request->validate(['token' => 'required|string']);
        $appointment = Appointment::with('registrant.demographic', 'registrant.identity')
            ->where('qr_token', $data['token'])->first();

        if (! $appointment || ! $appointment->registrant->identity) {
            return response()->json([
                'valid' => false,
                'state' => 'not_issued',
                'reason' => 'Unknown token or identity not issued.',
            ]);
        }

        $identity = $appointment->registrant->identity;
        $state = $identity->credentialState();
        $valid = $state === 'active';
        $reason = match ($state) {
            'suspended' => 'Credential suspended — reported lost or stolen.',
            'revoked' => 'Credential revoked by IDENTRIQ.',
            'pending' => 'Credential not yet issued.',
            'failed' => 'Credential application failed.',
            default => null,
        };

        AuthEvent::create([
            'identity_id' => $identity->id,
            'mode' => 'offline_qr',
            'result' => $valid ? 'valid' : 'invalid',
            'verifier_ref' => $request->input('verifier_ref', 'web-offline'),
            'metadata' => array_filter([
                'state' => $state,
                'reason' => $reason,
            ]),
        ]);

        return response()->json([
            'valid' => $valid,
            'state' => $state,
            'name' => $appointment->registrant->demographic?->full_name,
            'biosure' => $identity->biosure_id_number,
            'reason' => $reason,
        ]);
    }

    public function syncOutbox(Request $request): JsonResponse
    {
        $data = $request->validate([
            'events' => 'required|array',
            'events.*.token' => 'required|string',
            'events.*.result' => 'required|in:valid,invalid',
            'events.*.at' => 'nullable|date',
            'events.*.purpose' => 'nullable|string|max:100',
            'events.*.reason' => 'nullable|string|max:255',
        ]);

        $synced = 0;
        foreach ($data['events'] as $event) {
            $appointment = Appointment::where('qr_token', $event['token'])->first();
            if ($appointment?->registrant->identity) {
                AuthEvent::create([
                    'identity_id' => $appointment->registrant->identity->id,
                    'mode' => 'offline_qr',
                    'result' => $event['result'],
                    'verifier_ref' => 'outbox-sync',
                    'metadata' => array_filter([
                        'checked_at' => $event['at'] ?? null,
                        'purpose' => $event['purpose'] ?? null,
                        'reason' => $event['reason'] ?? null,
                    ]),
                ]);
                $synced++;
            }
        }

        return response()->json(['synced' => $synced]);
    }

    public function snapshot(): JsonResponse
    {
        // Powers the mobile authenticator's on-device trust / revocation lists.
        // Same demo trade-off as offline() (decision D3): unauthenticated read
        // model (token/name/BIOSURE/state) so the offline demo works without a
        // login; revisit before any public deployment.
        $credentials = Appointment::with('registrant.demographic', 'registrant.identity')
            ->where('status', '!=', 'cancelled')
            ->whereHas('registrant.identity')
            ->get()
            ->map(fn ($a) => [
                'token' => $a->qr_token,
                'name' => $a->registrant->demographic?->full_name,
                'biosure' => $a->registrant->identity?->biosure_id_number,
                'state' => $a->registrant->identity?->credentialState() ?? 'not_issued',
                'issued_at' => $a->registrant->identity?->card_personalized_at?->toISOString(),
            ])
            ->values();

        return response()->json([
            'generated_at' => now()->toISOString(),
            'credentials' => $credentials,
        ]);
    }

    public function online(): Response
    {
        return Inertia::render('verify/online');
    }

    public function lookup(Request $request): JsonResponse
    {
        $data = $request->validate([
            'query' => 'required|string',
            'purpose' => 'required|string|max:255',
        ]);

        $identity = Identity::with('registrant.demographic')
            ->where('biosure_id_number', $data['query'])
            ->orWhereHas('registrant.appointments', fn ($q) => $q->where('qr_token', $data['query']))
            ->first();
        abort_if(! $identity, 404, 'No identity found.');

        AuthEvent::create([
            'identity_id' => $identity->id,
            'mode' => 'online_ekyc',
            'result' => 'valid',
            'verifier_ref' => $request->ip(),
            'metadata' => ['purpose' => $data['purpose']],
        ]);

        $name = $identity->registrant->demographic->full_name ?? '';
        $parts = explode(' ', $name);

        return response()->json([
            'name_masked' => count($parts) > 1
                ? $parts[0].' '.str_repeat('•', 4).' '.end($parts)
                : str_repeat('•', 6),
            'biosure' => $identity->biosure_id_number,
            'status' => $identity->status,
        ]);
    }

    public function biometric(Request $request): JsonResponse
    {
        $data = $request->validate([
            'identity_id' => 'required|exists:identities,id',
            'photo' => 'required|file|mimes:jpg,jpeg,png|max:10240',
        ]);

        $score = 70 + (crc32($data['identity_id'].$request->file('photo')->getSize()) % 29);
        $pass = $score >= 80;

        AuthEvent::create([
            'identity_id' => $data['identity_id'],
            'mode' => 'online_biometric',
            'result' => $pass ? 'valid' : 'invalid',
            'verifier_ref' => $request->ip(),
            'metadata' => ['score' => $score],
        ]);

        return response()->json(['score' => $score, 'pass' => $pass]);
    }
}
