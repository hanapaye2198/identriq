<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use App\Models\AuthEvent;
use App\Models\ConsentRequest;
use App\Models\Registrant;
use App\Support\ShareScope;
use Endroid\QrCode\QrCode;
use Endroid\QrCode\Writer\SvgWriter;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MobileController extends Controller
{
    public function otp(Request $request): JsonResponse
    {
        $data = $request->validate([
            'mobile' => 'required_without:token|string',
            'token' => 'required_without:mobile|string',
        ]);

        $registrant = $this->resolveTarget($data);
        abort_unless($registrant, 404);

        $code = (string) random_int(100000, 999999);
        cache()->put("otp:{$registrant->mobile}", $code, now()->addMinutes(5));

        return response()->json([
            'sent' => true,
            'demo_code' => app()->isLocal() ? $code : null,
            'mobile_hint' => $this->maskMobile($registrant->mobile),
        ]);
    }

    public function link(Request $request): JsonResponse
    {
        $data = $request->validate([
            'mobile' => 'required_without:token|string',
            'token' => 'required_without:mobile|string',
            'otp' => 'required|digits:6',
        ]);

        $registrant = $this->resolveTarget($data);
        abort_if(! $registrant, 404, 'No registration found.');
        abort_unless(cache()->get("otp:{$registrant->mobile}") === $data['otp'], 422, 'Incorrect or expired code.');
        // Single-use: a successfully linked OTP can never be replayed.
        cache()->forget("otp:{$registrant->mobile}");

        $registrant->update(['mobile_verified_at' => now()]);

        return response()->json([
            'token' => $registrant->createToken('wallet')->plainTextToken,
            'registrant_id' => $registrant->id,
        ]);
    }

    public function unlink(Request $request): JsonResponse
    {
        /** @var Registrant $registrant */
        $registrant = $request->user();
        $registrant->currentAccessToken()?->delete();
        auth()->forgetGuards();

        return response()->json(['revoked' => true]);
    }

    public function reportLost(Request $request): JsonResponse
    {
        /** @var Registrant $registrant */
        $registrant = $request->user();
        $identity = $registrant->identity;

        abort_if(! $identity, 422, 'No issued credential to suspend.');

        if (! $identity->suspended_at && ! $identity->revoked_at) {
            $identity->update(['suspended_at' => now()]);

            $registrant->notifications()->create([
                'channel' => 'sms',
                'title' => 'ID suspended',
                'body' => 'Your IDENTRIQ ID was suspended after a lost/stolen report. Request a replacement to get back online.',
                'sent_at' => now(),
            ]);
        }

        return response()->json(['state' => $identity->fresh()->credentialState()]);
    }

    public function identity(Request $request): JsonResponse
    {
        /** @var Registrant $registrant */
        $registrant = $request->user();
        $registrant->load('demographic', 'appointments.center', 'identity');
        $appointment = $registrant->appointments->sortByDesc('created_at')->first();

        return response()->json([
            'full_name' => $registrant->demographic?->full_name,
            'dob' => $registrant->demographic?->dob,
            'gender' => $registrant->demographic?->gender,
            'mobile' => $registrant->mobile,
            'status' => $registrant->status,
            'credential_state' => $registrant->identity?->credentialState() ?? 'not_issued',
            'biosure_id_number' => $registrant->identity?->biosure_id_number,
            'card_personalized_at' => $registrant->identity?->card_personalized_at,
            'qr_token' => $registrant->appointments->first()?->qr_token,
            'photo_url' => $registrant->demographic?->photo_url,
            'province' => $registrant->demographic?->province,
            'appointment' => $appointment ? [
                'center' => $appointment->center?->name,
                'center_location' => $appointment->center?->location,
                'center_province' => $appointment->center?->province,
                'slot_at' => $appointment->slot_at?->toISOString(),
                'reference' => $appointment->qr_token,
                'status' => $appointment->status,
            ] : null,
        ]);
    }

    public function qrPayload(Request $request): JsonResponse
    {
        $data = $request->validate(['fields' => 'nullable|string|max:255']);

        /** @var Registrant $registrant */
        $registrant = $request->user();
        $token = $registrant->appointments()->latest()->first()?->qr_token;
        abort_if(! $token, 404, 'No appointment QR available.');

        $share = ShareScope::parse($data['fields'] ?? null);
        $issuedAt = now()->toISOString();

        return response()->json([
            'token' => $token,
            'issued_at' => $issuedAt,
            'share' => $share,
            'sig' => hash_hmac('sha256', $token.'|'.$issuedAt.'|'.implode(',', $share ?? []), config('app.key')),
        ]);
    }

    public function qrSvg(Request $request): JsonResponse
    {
        $data = $request->validate(['fields' => 'nullable|string|max:255']);

        /** @var Registrant $registrant */
        $registrant = $request->user();
        $token = $registrant->appointments()->latest()->first()?->qr_token;
        abort_if(! $token, 404, 'No appointment QR available.');

        $share = ShareScope::parse($data['fields'] ?? null);
        $url = url('/verify/offline?token='.$token.($share ? '&share='.implode(',', $share) : ''));

        $svg = (new SvgWriter)->write(new QrCode($url));

        return response()->json(['svg' => $svg->getString()]);
    }

    public function timeline(Request $request): JsonResponse
    {
        /** @var Registrant $registrant */
        $registrant = $request->user();
        $registrant->load('identity', 'notifications');

        $timeline = [
            ['stage' => 'registered', 'at' => $registrant->created_at, 'done' => true],
            ['stage' => 'validating', 'at' => null, 'done' => in_array($registrant->status, ['validating', 'approved', 'failed', 'issued', 'delivered'], true)],
            ['stage' => $registrant->identity?->status === 'failed' ? 'failed' : 'approved', 'at' => $registrant->identity?->updated_at, 'done' => (bool) $registrant->identity],
            ['stage' => 'personalized', 'at' => $registrant->identity?->card_personalized_at, 'done' => (bool) $registrant->identity?->card_personalized_at],
            ['stage' => 'delivered', 'at' => $registrant->identity?->delivered_at, 'done' => (bool) $registrant->identity?->delivered_at],
        ];

        return response()->json([
            'timeline' => $timeline,
            'notifications' => $registrant->notifications,
        ]);
    }

    public function consentPending(Request $request): JsonResponse
    {
        /** @var Registrant $registrant */
        $registrant = $request->user();
        $identity = $registrant->identity;

        if (! $identity) {
            return response()->json(['request' => null]);
        }

        // Lazily expire stale requests so the wallet never wakes on a dead timer.
        $identity->consentRequests()
            ->where('status', 'pending')
            ->where('expires_at', '<', now())
            ->update(['status' => 'expired']);

        $pending = $identity->consentRequests()
            ->where('status', 'pending')
            ->latest('id')
            ->first();

        return response()->json([
            'request' => $pending ? [
                'id' => $pending->id,
                'verifier_name' => $pending->verifier_name,
                'purpose' => $pending->purpose,
                'fields' => $pending->fields,
                'expires_at' => $pending->expires_at->toISOString(),
            ] : null,
        ]);
    }

    public function consentDecide(Request $request, ConsentRequest $consent): JsonResponse
    {
        /** @var Registrant $registrant */
        $registrant = $request->user();
        $data = $request->validate(['allow' => 'required|boolean']);

        $identity = $registrant->identity;
        abort_if(! $identity || $consent->identity_id !== $identity->id, 404);
        abort_unless($consent->status === 'pending', 422, 'This request is no longer pending.');

        if ($consent->expires_at?->isPast()) {
            $consent->update(['status' => 'expired']);
            abort(422, 'This request has expired.');
        }

        $consent->update([
            'status' => $data['allow'] ? 'allowed' : 'denied',
            'decided_at' => now(),
        ]);

        AuthEvent::create([
            'identity_id' => $identity->id,
            'mode' => 'consent',
            'result' => $data['allow'] ? 'allowed' : 'denied',
            'verifier_ref' => $consent->verifier_name,
            'metadata' => [
                'verifier' => $consent->verifier_name,
                'purpose' => $consent->purpose,
                'fields' => $consent->fields,
            ],
        ]);

        return response()->json([
            'status' => $consent->status,
            'decided_at' => $consent->decided_at->toISOString(),
        ]);
    }

    public function activity(Request $request): JsonResponse
    {
        /** @var Registrant $registrant */
        $registrant = $request->user();
        $identity = $registrant->identity;

        if (! $identity) {
            return response()->json(['events' => []]);
        }

        $events = $identity->authEvents()
            ->latest('id')
            ->limit(50)
            ->get()
            ->map(fn (AuthEvent $event) => [
                'id' => $event->id,
                'at' => $event->created_at?->toISOString(),
                'mode' => $event->mode,
                'result' => $event->result,
                'verifier' => $event->metadata['verifier'] ?? $event->verifier_ref,
                'purpose' => $event->metadata['purpose'] ?? null,
                'reason' => $event->metadata['reason'] ?? null,
                'state' => $event->metadata['state'] ?? null,
                'fields' => $event->metadata['fields'] ?? null,
                'checked_at' => $event->metadata['checked_at'] ?? null,
                'offline' => str_starts_with($event->mode, 'offline'),
            ]);

        return response()->json(['events' => $events]);
    }

    public function devices(Request $request): JsonResponse
    {
        /** @var Registrant $registrant */
        $registrant = $request->user();
        $currentId = $registrant->currentAccessToken()?->id;

        $devices = $registrant->tokens()
            ->orderByDesc('id')
            ->get()
            ->map(fn ($token) => [
                'id' => $token->id,
                'name' => $token->name,
                'created_at' => $token->created_at?->toISOString(),
                'last_used_at' => $token->last_used_at?->toISOString(),
                'current' => $token->id === $currentId,
            ]);

        return response()->json(['devices' => $devices]);
    }

    public function deviceRemove(Request $request, int $device): JsonResponse
    {
        /** @var Registrant $registrant */
        $registrant = $request->user();
        $token = $registrant->tokens()->find($device);
        abort_if(! $token, 404, 'Device not found.');

        $wasCurrent = $token->id === $registrant->currentAccessToken()?->id;
        $token->delete();

        if ($wasCurrent) {
            auth()->forgetGuards();
        }

        return response()->json(['removed' => true, 'current' => $wasCurrent]);
    }

    /**
     * Resolve the registrant a link request is about: by registered mobile
     * number, or by the appointment QR token from pre-registration
     * (mobile spec §2.1, options A and B).
     *
     * @param  array{mobile?: string|null, token?: string|null}  $data
     */
    private function resolveTarget(array $data): ?Registrant
    {
        if (! empty($data['token'])) {
            return Appointment::where('qr_token', $this->normalizeToken($data['token']))
                ->first()
                ?->registrant;
        }

        return Registrant::where('mobile', $data['mobile'] ?? '')->first();
    }

    /** Reduce a pasted QR link or wallet share code to its bare token. */
    private function normalizeToken(string $raw): string
    {
        $raw = trim($raw);

        if (preg_match('/[?&]token=([^&\s]+)/', $raw, $matches)) {
            return urldecode($matches[1]);
        }

        // Wallet share codes append `|share=…`; keep only the token half.
        return trim(explode('|', $raw)[0]);
    }

    /** "+6757000013" → "+675 ••• 013" for the "code sent to" hint. */
    private function maskMobile(string $mobile): string
    {
        return strlen($mobile) > 7
            ? substr($mobile, 0, 4).' ••• '.substr($mobile, -3)
            : $mobile;
    }
}
