import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import MShell from '@/components/m-shell';
import { csrfToken } from '@/lib/csrf';

export default function MVerifier() {
    const [input, setInput] = useState('');
    const [verdict, setVerdict] = useState<{ valid: boolean; name?: string; biosure?: string; reason?: string } | null>(null);
    const [pending, setPending] = useState<number>(() => {
        try {
            return (JSON.parse(localStorage.getItem('verify_outbox') ?? '[]') as unknown[]).length;
        } catch {
            return 0;
        }
    });

    async function verify() {
        const res = await fetch('/verify/offline/check', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Accept: 'application/json', 'X-CSRF-TOKEN': csrfToken() },
            body: JSON.stringify({ token: input.trim(), verifier_ref: 'm-verifier' }),
        });
        setVerdict(await res.json());
        if (!navigator.onLine) {
            try {
                const q = JSON.parse(localStorage.getItem('verify_outbox') ?? '[]') as unknown[];
                localStorage.setItem('verify_outbox', JSON.stringify(q));
                setPending(q.length);
            } catch {
                /* ignore */
            }
        }
    }

    async function sync() {
        const q = JSON.parse(localStorage.getItem('verify_outbox') ?? '[]') as { token: string; result: string; at: string }[];
        const res = await fetch('/verify/outbox/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Accept: 'application/json', 'X-CSRF-TOKEN': csrfToken() },
            body: JSON.stringify({ events: q }),
        });
        if (res.ok) {
            localStorage.setItem('verify_outbox', '[]');
            setPending(0);
        }
    }

    return (
        <MShell tab="verify">
            <p className="text-xs text-[#14201B]/50">{navigator.onLine ? 'Online' : 'OFFLINE — snapshot mode'}</p>
            <h1 className="mt-1 text-2xl font-bold">Scan credential</h1>
            <div className="mt-4 rounded-2xl bg-[#0E2A26] p-5 text-white">
                <Label className="text-white/70">QR token (camera scan stub — paste or type)</Label>
                <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="mt-2 min-h-[48px] border-white/20 bg-white/10 font-mono text-white"
                    placeholder="paste token"
                />
                <label className="mt-3 block text-sm text-white/70">
                    …or upload a scan image (stub)
                    <Input type="file" accept="image/*" capture="environment" className="mt-1 border-white/20 bg-white/10 text-white" />
                </label>
                <Button onClick={verify} disabled={!input.trim()} className="mt-4 min-h-[52px] w-full bg-[#2FD6A3] text-lg font-bold text-[#0E2A26] hover:brightness-110 disabled:opacity-40">
                    Verify
                </Button>
            </div>
            {verdict && (
                <div className={`mt-4 rounded-2xl p-6 text-center ${verdict.valid ? 'bg-[#2FD6A3]' : 'bg-red-600'} text-[#0E2A26]`}>
                    <p className="text-4xl font-black">{verdict.valid ? 'VALID' : 'INVALID'}</p>
                    {verdict.name && <p className="mt-1 font-semibold">{verdict.name}</p>}
                    {verdict.biosure && <p className="font-mono">{verdict.biosure}</p>}
                    {verdict.reason && <p className="mt-1 text-sm">{verdict.reason}</p>}
                </div>
            )}
            {pending > 0 && (
                <div className="mt-4 rounded-2xl bg-white p-4 text-sm shadow-sm">
                    <p>{pending} check(s) queued for sync</p>
                    <Button onClick={sync} size="sm" variant="outline" className="mt-2">Sync now</Button>
                </div>
            )}
        </MShell>
    );
}
