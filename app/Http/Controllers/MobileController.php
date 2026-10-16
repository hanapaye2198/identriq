<?php

namespace App\Http\Controllers;

use App\Models\Registrant;
use Endroid\QrCode\QrCode;
use Endroid\QrCode\Writer\SvgWriter;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MobileController extends Controller
{
    public function otp(Request $request): JsonResponse
    {
        $data = $request->validate(['mobile' => 'required|string']);
        abort_unless(Registrant::where('mobile', $data['mobile'])->exists(), 404);

        $code = (string) random_int(100000, 999999);
        cache()->put("otp:{$data['mobile']}", $code, now()->addMinutes(5));

        return response()->json(['sent' => true, 'demo_code' => app()->isLocal() ? $code : null]);
    }

    public function link(Request $request): JsonResponse
    {
        $data = $request->validate([
            'mobile' => 'required|string',
            'otp' => 'required|digits:6',
        ]);

        $registrant = Registrant::where('mobile', $data['mobile'])->first();
        abort_if(! $registrant, 404, 'No registration found.');
        abort_unless(cache()->get("otp:{$data['mobile']}") === $data['otp'], 422, 'Incorrect or expired code.');

        $registrant->update(['mobile_verified_at' => now()]);

        return response()->json([
            'token' => $registrant->createToken('wallet')->plainTextToken,
            'registrant_id' => $registrant->id,
        ]);
    }

    public function identity(Request $request): JsonResponse
    {
        /** @var Registrant $registrant */
        $registrant = $request->user();
        $registrant->load('demographic', 'appointments', 'identity');

        return response()->json([
            'full_name' => $registrant->demographic?->full_name,
            'dob' => $registrant->demographic?->dob,
            'mobile' => $registrant->mobile,
            'status' => $registrant->status,
            'biosure_id_number' => $registrant->identity?->biosure_id_number,
            'qr_token' => $registrant->appointments->first()?->qr_token,
        ]);
    }

    public function qrPayload(Request $request): JsonResponse
    {
        /** @var Registrant $registrant */
        $registrant = $request->user();
        $token = $registrant->appointments()->latest()->first()?->qr_token;
        abort_if(! $token, 404, 'No appointment QR available.');

        $issuedAt = now()->toISOString();

        return response()->json([
            'token' => $token,
            'issued_at' => $issuedAt,
            'sig' => hash_hmac('sha256', $token.'|'.$issuedAt, config('app.key')),
        ]);
    }

    public function qrSvg(Request $request): JsonResponse
    {
        /** @var Registrant $registrant */
        $registrant = $request->user();
        $token = $registrant->appointments()->latest()->first()?->qr_token;
        abort_if(! $token, 404, 'No appointment QR available.');

        $svg = (new SvgWriter)->write(new QrCode(url('/verify/offline?token='.$token)));

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
}
