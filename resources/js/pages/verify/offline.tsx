import { Head } from '@inertiajs/react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { csrfToken } from '@/lib/csrf';

interface SnapshotRow {
    token: string;
    name: string | null;
    biosure: string | null;
}

interface Queued {
    token: string;
    result: 'valid' | 'invalid';
    at: string;
}

function loadOutbox(): Queued[] {
    try {
        return JSON.parse(localStorage.getItem('verify_outbox') ?? '[]') as Queued[];
    } catch {
        return [];
    }
}

export default function Offline({ token, snapshot }: { token: string; snapshot: SnapshotRow[] }) {
    const [input, setInput] = useState(token);
    const [verdict, setVerdict] = useState<{ valid: boolean; name?: string; biosure?: string; reason?: string; offline?: boolean } | null>(null);
    const [outbox, setOutbox] = useState<Queued[]>(loadOutbox);
    const [online, setOnline] = useState(navigator.onLine);

    function queue(tokenValue: string, result: 'valid' | 'invalid') {
        const next = [...loadOutbox(), { token: tokenValue, result, at: new Date().toISOString() }];
        localStorage.setItem('verify_outbox', JSON.stringify(next));
        setOutbox(next);
    }

    async function verify() {
        const row = snapshot.find((s) => s.token === input.trim());
        if (!navigator.onLine) {
            const ok = !!row?.biosure;
            setVerdict({ valid: ok, name: row?.name ?? undefined, biosure: row?.biosure ?? undefined, reason: ok ? undefined : 'Unknown token (offline snapshot).', offline: true });
            queue(input.trim(), ok ? 'valid' : 'invalid');
            return;
        }
        try {
            const res = await fetch('/verify/offline/check', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Accept: 'application/json', 'X-CSRF-TOKEN': csrfToken() },
                body: JSON.stringify({ token: input.trim(), verifier_ref: 'web-offline' }),
            });
            setVerdict(await res.json());
        } catch {
            setOnline(false);
            const ok = !!row?.biosure;
            setVerdict({ valid: ok, offline: true });
            queue(input.trim(), ok ? 'valid' : 'invalid');
        }
    }

    async function sync() {
        const pending = loadOutbox();
        const res = await fetch('/verify/outbox/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Accept: 'application/json', 'X-CSRF-TOKEN': csrfToken() },
            body: JSON.stringify({ events: pending }),
        });
        const j = await res.json();
        if (typeof j.synced === 'number') {
            localStorage.setItem('verify_outbox', '[]');
            setOutbox([]);
        }
    }

    return (
        <>
            <Head title="Offline verify" />
            <div className="min-h-screen bg-[#0E2A26] px-4 py-10 text-white sm:px-8">
                <div className="mx-auto max-w-lg text-center">
                    <p className="text-sm text-white/60">
                        {online ? 'Online' : 'OFFLINE — verifying from on-device snapshot, zero network calls'}
                    </p>
                    <h1 className="mt-2 text-3xl font-bold">Verify credential</h1>
                    <div className="mt-6 rounded-2xl bg-white p-5 text-[#14201B]">
                        <Label>QR token</Label>
                        <Input value={input} onChange={(e) => setInput(e.target.value)} className="mt-1 font-mono" placeholder="paste or scan token" />
                        <Button onClick={verify} className="mt-3 w-full bg-[#2FD6A3] text-lg font-bold text-[#0E2A26] hover:brightness-110">
                            Verify
                        </Button>
                    </div>
                    {verdict && (
                        <div className={`mt-4 rounded-2xl p-6 ${verdict.valid ? 'bg-[#2FD6A3]' : 'bg-red-600'} text-[#0E2A26]`}>
                            <p className="text-4xl font-black">{verdict.valid ? 'VALID' : 'INVALID'}</p>
                            {verdict.name && <p className="mt-1 font-semibold">{verdict.name}</p>}
                            {verdict.biosure && <p className="font-mono">{verdict.biosure}</p>}
                            {verdict.reason && <p className="mt-1 text-sm">{verdict.reason}</p>}
                            {verdict.offline && <p className="mt-1 text-xs opacity-70">Checked offline · queued for sync</p>}
                        </div>
                    )}
                    {outbox.length > 0 && (
                        <div className="mt-4 rounded-2xl bg-white/10 p-4 text-sm">
                            <p>{outbox.length} check(s) queued for sync</p>
                            <Button onClick={sync} size="sm" variant="outline" className="mt-2 text-white">
                                Sync now
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
