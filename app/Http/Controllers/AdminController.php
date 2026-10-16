<?php

namespace App\Http\Controllers;

use App\Models\AuthEvent;
use App\Models\Identity;
use App\Models\Registrant;
use App\Models\RegistrationCenter;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class AdminController extends Controller
{
    public function queue(): Response
    {
        return Inertia::render('admin/validation', [
            'cases' => Registrant::with('demographic', 'documents', 'identity')
                ->whereIn('status', ['validating', 'rework'])
                ->orderBy('updated_at')
                ->get(),
        ]);
    }

    public function review(Registrant $registrant): Response
    {
        return Inertia::render('admin/validation', [
            'cases' => Registrant::with('demographic', 'documents', 'identity')
                ->whereIn('status', ['validating', 'rework'])
                ->orderBy('updated_at')
                ->get(),
            'active' => $registrant->load('demographic', 'documents', 'identity', 'appointments.center'),
            'matches' => $this->candidates($registrant),
        ]);
    }

    /** @return array<int, array<string, mixed>> */
    private function candidates(Registrant $registrant): array
    {
        if (! $registrant->demographic) {
            return [];
        }
        $first = explode(' ', $registrant->demographic->full_name)[0];

        return Registrant::with('demographic')
            ->where('id', '!=', $registrant->id)
            ->whereHas('demographic', fn ($q) => $q
                ->where('dob', $registrant->demographic->dob)
                ->where('full_name', 'like', $first.'%'))
            ->limit(5)->get()
            ->map(fn ($r) => ['id' => $r->id, 'name' => $r->demographic->full_name, 'dob' => $r->demographic->dob, 'score' => 87])
            ->all();
    }

    public function decide(Request $request, Registrant $registrant): RedirectResponse
    {
        $data = $request->validate([
            'decision' => 'required|in:approved,failed',
            'reason' => 'nullable|string|max:500',
        ]);

        $identity = Identity::firstOrCreate(['registrant_id' => $registrant->id], ['status' => 'pending']);
        $identity->update([
            'status' => $data['decision'],
            'failure_reason' => $data['decision'] === 'failed' ? ($data['reason'] ?? 'Rejected at review.') : null,
        ]);
        $registrant->update(['status' => $data['decision']]);

        return back();
    }

    public function merge(Request $request, Registrant $registrant): RedirectResponse
    {
        $data = $request->validate(['loser_id' => 'required|exists:registrants,id']);
        $loser = Registrant::findOrFail($data['loser_id']);
        abort_if(! $loser instanceof Registrant, 422);

        $loser->update(['status' => 'failed']);
        Identity::firstOrCreate(['registrant_id' => $loser->id], ['status' => 'pending'])
            ->update(['status' => 'failed', 'failure_reason' => "Merged into registrant #{$registrant->id} as duplicate."]);

        return back();
    }

    public function advance(): RedirectResponse
    {
        $advanced = 0;
        foreach (Identity::where('status', 'pending')->with('registrant.demographic')->get() as $identity) {
            if (empty($this->candidates($identity->registrant))) {
                $identity->update(['status' => 'approved']);
                $identity->registrant->update(['status' => 'approved']);
                $advanced++;
            }
        }

        return back()->with('advanced', $advanced);
    }

    public function issuance(): Response
    {
        return Inertia::render('admin/issuance', [
            'identities' => Identity::with('registrant.demographic')
                ->where('status', 'approved')->orderBy('updated_at')->get(),
        ]);
    }

    public function issue(Identity $identity): RedirectResponse
    {
        if (! $identity->biosure_id_number) {
            $identity->update([
                'biosure_id_number' => 'PNG-'.now()->format('Y').'-'.str_pad((string) $identity->id, 6, '0', STR_PAD_LEFT),
                'card_personalized_at' => now(),
            ]);
            $identity->registrant->update(['status' => 'issued']);
        }

        return back();
    }

    public function deliver(Request $request, Identity $identity): RedirectResponse
    {
        $data = $request->validate(['channel' => 'required|string|max:120']);
        $identity->update(['delivered_at' => now(), 'delivered_channel' => $data['channel']]);
        $identity->registrant->update(['status' => 'delivered']);

        return back();
    }

    public function master(): Response
    {
        return Inertia::render('admin/master', [
            'centers' => RegistrationCenter::all(),
        ]);
    }

    public function updateCenter(Request $request, RegistrationCenter $center): RedirectResponse
    {
        $data = $request->validate([
            'name' => 'sometimes|string|max:120',
            'daily_capacity' => 'sometimes|integer|min:1|max:1000',
            'is_active' => 'sometimes|boolean',
        ]);
        $center->update($data);

        return back();
    }

    public function storeCenter(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name' => 'required|string|max:120',
            'province' => 'required|string|max:80',
            'location' => 'required|string|max:255',
            'daily_capacity' => 'required|integer|min:1|max:1000',
        ]);
        RegistrationCenter::create($data + ['is_active' => true]);

        return back();
    }

    public function audit(): Response
    {
        $funnel = [
            'submitted' => Registrant::whereIn('status', ['validating', 'approved', 'failed', 'issued', 'delivered'])->count(),
            'approved' => Identity::where('status', 'approved')->count(),
            'issued' => Identity::whereNotNull('card_personalized_at')->count(),
            'delivered' => Identity::whereNotNull('delivered_at')->count(),
        ];

        return Inertia::render('admin/audit', [
            'events' => AuthEvent::with('identity.registrant.demographic')->latest()->limit(50)->get(),
            'funnel' => $funnel,
        ]);
    }

    public function export(): StreamedResponse
    {
        $rows = Registrant::with('demographic', 'identity')->get();

        return response()->streamDownload(function () use ($rows) {
            $out = fopen('php://output', 'w');
            if (! $out) {
                return;
            }
            fputcsv($out, ['id', 'name', 'mobile', 'status', 'biosure_id_number']);
            foreach ($rows as $r) {
                fputcsv($out, [$r->id, $r->demographic?->full_name, $r->mobile, $r->status, $r->identity?->biosure_id_number]);
            }
            fclose($out);
        }, 'identriq-registrations.csv', ['Content-Type' => 'text/csv']);
    }
}
