import { Head } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { csrfToken, jsonHeaders } from '@/lib/csrf';

interface ConsentState {
    id: number;
    status: string;
    expires_at: string;
}

export default function Online() {
    const [query, setQuery] = useState('');
    const [purpose, setPurpose] = useState('Account opening');
    const [result, setResult] = useState<{
        name_masked: string;
        biosure: string;
        status: string;
    } | null>(null);
    const [error, setError] = useState('');
    const [photo, setPhoto] = useState<File | null>(null);
    const [identityId, setIdentityId] = useState('');
    const [score, setScore] = useState<{ score: number; pass: boolean } | null>(
        null,
    );
    const [verifierName, setVerifierName] = useState('Demo Bank eKYC');
    const [consent, setConsent] = useState<ConsentState | null>(null);
    const [consentError, setConsentError] = useState('');
    const [now, setNow] = useState(() => Date.now());

    const consentId = consent?.id ?? null;
    const consentStatus = consent?.status ?? null;

    // Keep the "expires in n" countdown ticking while the wallet decides.
    useEffect(() => {
        if (consentStatus !== 'pending') return;
        setNow(Date.now());
        const timer = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(timer);
    }, [consentStatus]);

    // Poll the wallet's decision every 3 seconds until it answers.
    useEffect(() => {
        if (consentId === null || consentStatus !== 'pending') return;
        const requestId = consentId;
        const timer = setInterval(async () => {
            try {
                const res = await fetch(`/verify/online/consent/${requestId}`, {
                    headers: { Accept: 'application/json' },
                });
                if (!res.ok) return;
                const body = (await res.json()) as {
                    status: string;
                    decided_at: string | null;
                    expires_at: string;
                };
                setConsent((prev) =>
                    prev && prev.id === requestId ? { ...prev, ...body } : prev,
                );
            } catch {
                // Transient hiccup — the next tick retries.
            }
        }, 3000);
        return () => clearInterval(timer);
    }, [consentId, consentStatus]);

    const secondsLeft = consent
        ? Math.max(
              0,
              Math.floor((new Date(consent.expires_at).getTime() - now) / 1000),
          )
        : 0;

    async function lookup() {
        setError('');
        const res = await fetch('/verify/online/lookup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                'X-CSRF-TOKEN': csrfToken(),
            },
            body: JSON.stringify({ query, purpose }),
        });
        if (res.status === 429) {
            setError('Rate limited — slow down.');
            return;
        }
        if (!res.ok) {
            setError('No identity found.');
            return;
        }
        setResult(await res.json());
    }

    async function requestConsent() {
        setConsentError('');
        const res = await fetch('/verify/online/consent', {
            method: 'POST',
            headers: jsonHeaders(),
            body: JSON.stringify({
                query,
                verifier_name: verifierName,
                purpose,
                fields: 'name,photo,over18',
            }),
        });
        if (res.status === 429) {
            setConsentError('Rate limited — slow down.');
            return;
        }
        if (!res.ok) {
            setConsentError('No identity found for that number.');
            return;
        }
        setConsent((await res.json()) as ConsentState);
    }

    async function match() {
        if (!photo || !identityId) return;
        const fd = new FormData();
        fd.append('identity_id', identityId);
        fd.append('photo', photo);
        const res = await fetch('/verify/online/biometric', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'X-CSRF-TOKEN': csrfToken(),
            },
            body: fd,
        });
        if (res.ok) setScore(await res.json());
    }

    return (
        <>
            <Head title="Online verify" />
            <div className="min-h-screen bg-[#F7F5EF] px-4 py-10 text-[#14201B] sm:px-8">
                <div className="mx-auto max-w-2xl">
                    <h1 className="text-3xl font-bold">Online verification</h1>
                    <div className="mt-4 rounded-xl bg-white p-5 shadow-sm">
                        <h2 className="font-semibold">eKYC lookup</h2>
                        <div className="mt-3 grid gap-3 sm:grid-cols-2">
                            <div>
                                <Label>BIOSURE number or QR token</Label>
                                <Input
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    className="font-mono"
                                />
                            </div>
                            <div>
                                <Label>Purpose (logged)</Label>
                                <Input
                                    value={purpose}
                                    onChange={(e) => setPurpose(e.target.value)}
                                />
                            </div>
                        </div>
                        <Button
                            onClick={lookup}
                            className="mt-3 bg-[#2FD6A3] text-[#0E2A26] hover:brightness-110"
                        >
                            Look up
                        </Button>
                        {error && (
                            <p className="mt-2 text-sm text-red-600">{error}</p>
                        )}
                        {result && (
                            <div className="mt-3 rounded-lg bg-[#14201B]/5 p-3 text-sm">
                                <p>
                                    <strong>{result.name_masked}</strong>
                                </p>
                                <p className="font-mono">
                                    {result.biosure} · {result.status}
                                </p>
                            </div>
                        )}
                    </div>
                    <div className="mt-4 rounded-xl bg-white p-5 shadow-sm">
                        <h2 className="font-semibold">Request consent</h2>
                        <p className="mt-1 text-xs text-[#14201B]/50">
                            Asks the citizen's wallet to approve name, photo and
                            18+ status. This panel updates itself when they
                            answer.
                        </p>
                        <div className="mt-3 grid gap-3 sm:grid-cols-2">
                            <div>
                                <Label>
                                    Verifier name (shown to the citizen)
                                </Label>
                                <Input
                                    value={verifierName}
                                    onChange={(e) =>
                                        setVerifierName(e.target.value)
                                    }
                                />
                            </div>
                            <div>
                                <Label>Purpose (logged)</Label>
                                <Input
                                    value={purpose}
                                    onChange={(e) => setPurpose(e.target.value)}
                                />
                            </div>
                        </div>
                        <Button
                            onClick={requestConsent}
                            disabled={!query || !verifierName}
                            className="mt-3 bg-[#0E2A26] text-white disabled:opacity-40"
                        >
                            Send request
                        </Button>
                        {consentError && (
                            <p className="mt-2 text-sm text-red-600">
                                {consentError}
                            </p>
                        )}
                        {consent && (
                            <div className="mt-3 rounded-lg bg-[#14201B]/5 p-3 text-sm">
                                {consent.status === 'pending' &&
                                    secondsLeft > 0 && (
                                        <p>
                                            Waiting for the wallet…{' '}
                                            <span className="text-[#14201B]/50">
                                                expires in{' '}
                                                {Math.floor(secondsLeft / 60)}:
                                                {String(
                                                    secondsLeft % 60,
                                                ).padStart(2, '0')}
                                            </span>
                                        </p>
                                    )}
                                {(consent.status === 'expired' ||
                                    (consent.status === 'pending' &&
                                        secondsLeft === 0)) && (
                                    <p className="text-red-700">
                                        Expired — send a new request.
                                    </p>
                                )}
                                {consent.status === 'allowed' && (
                                    <p className="font-semibold text-[#0E6B52]">
                                        ✓ Allowed — the citizen approved this
                                        request.
                                    </p>
                                )}
                                {consent.status === 'denied' && (
                                    <p className="font-semibold text-red-700">
                                        ✗ Denied by the citizen.
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                    <div className="mt-4 rounded-xl bg-white p-5 shadow-sm">
                        <h2 className="font-semibold">
                            Biometric match (stub)
                        </h2>
                        <div className="mt-3 grid gap-3 sm:grid-cols-3">
                            <div>
                                <Label>Identity ID</Label>
                                <Input
                                    value={identityId}
                                    onChange={(e) =>
                                        setIdentityId(e.target.value)
                                    }
                                    inputMode="numeric"
                                />
                            </div>
                            <div className="sm:col-span-2">
                                <Label>Live photo</Label>
                                <Input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) =>
                                        setPhoto(e.target.files?.[0] ?? null)
                                    }
                                />
                            </div>
                        </div>
                        <Button
                            onClick={match}
                            disabled={!photo || !identityId}
                            className="mt-3 bg-[#0E2A26] text-white disabled:opacity-40"
                        >
                            Match
                        </Button>
                        {score && (
                            <div className="mt-3">
                                <div className="h-3 overflow-hidden rounded-full bg-[#14201B]/10">
                                    <div
                                        className={`h-full ${score.pass ? 'bg-[#2FD6A3]' : 'bg-red-500'}`}
                                        style={{ width: `${score.score}%` }}
                                    />
                                </div>
                                <p className="mt-1 text-sm">
                                    {score.score}% —{' '}
                                    {score.pass ? 'PASS' : 'FAIL'}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
