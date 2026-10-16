import { router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import MShell from '@/components/m-shell';
import { setToken } from '@/lib/wallet-slice';
import { useAppDispatch, useAppSelector } from '@/lib/redux-hooks';

interface Card {
    full_name: string;
    dob: string;
    mobile: string;
    status: string;
    biosure_id_number: string | null;
    qr_token: string | null;
}

export default function MWallet() {
    const dispatch = useAppDispatch();
    const token = useAppSelector((s) => s.wallet.token);
    const [card, setCard] = useState<Card | null>(null);
    const [flipped, setFlipped] = useState(false);
    const [qrSvg, setQrSvg] = useState('');
    const [timeline, setTimeline] = useState<{ stage: string; at: string | null; done: boolean }[]>([]);

    useEffect(() => {
        if (!token) {
            router.visit('/m');
            return;
        }
        const h = { Authorization: `Bearer ${token}`, Accept: 'application/json' };
        fetch('/api/me/identity', { headers: h }).then((r) => (r.ok ? r.json() : null)).then(setCard);
        fetch('/api/me/qr-svg', { headers: h }).then((r) => (r.ok ? r.json() : null)).then((j) => setQrSvg(j?.svg ?? ''));
        fetch('/api/me/timeline', { headers: h }).then((r) => (r.ok ? r.json() : null)).then((j) => setTimeline(j?.timeline ?? []));
    }, [token]);

    if (!token) return null;

    return (
        <MShell tab="wallet">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">My ID</h1>
                <button
                    type="button"
                    onClick={() => { dispatch(setToken(null)); router.visit('/m'); }}
                    className="text-sm text-[#14201B]/60 underline"
                >
                    Unlink
                </button>
            </div>

            <button
                type="button"
                onClick={() => setFlipped(!flipped)}
                aria-label={flipped ? 'Show card front' : 'Show card back'}
                className="mt-4 w-full rounded-2xl bg-[#0E2A26] p-5 text-left text-white shadow-lg transition-transform duration-200 active:scale-[0.99]"
            >
                {!flipped ? (
                    <div>
                        <p className="text-xs tracking-widest text-[#2FD6A3]">IDENTRIQ · PNG NATIONAL ID</p>
                        <p className="mt-3 text-xl font-bold">{card?.full_name ?? '…'}</p>
                        <p className="mt-1 font-mono text-[#C9A227]">{card?.biosure_id_number ?? 'pending issuance'}</p>
                        <p className="mt-3 text-xs text-white/60">Tap to flip · {card?.status ?? ''}</p>
                    </div>
                ) : (
                    <div>
                        <p className="text-xs tracking-widest text-[#2FD6A3]">CARD BACK</p>
                        <p className="mt-3 text-sm">DOB: <span className="font-mono">{card?.dob ?? '—'}</span></p>
                        <p className="mt-1 text-sm">Mobile: <span className="font-mono">{card?.mobile ?? '—'}</span></p>
                        <p className="mt-1 font-mono text-xs break-all text-white/50">{card?.qr_token ?? ''}</p>
                    </div>
                )}
            </button>

            <div className="mt-4 rounded-2xl bg-white p-5 text-center shadow-sm">
                <h2 className="font-semibold">Present QR</h2>
                {qrSvg ? (
                    <div className="mx-auto mt-2 w-52 bg-white p-2 [&>svg]:h-auto [&>svg]:w-full" dangerouslySetInnerHTML={{ __html: qrSvg }} />
                ) : (
                    <p className="mt-2 text-sm text-[#14201B]/50">No QR yet — complete booking on the web portal.</p>
                )}
            </div>

            <div className="mt-4 rounded-2xl bg-white p-5 shadow-sm">
                <h2 className="font-semibold">Status</h2>
                <ol className="mt-2 space-y-2">
                    {timeline.map((t) => (
                        <li key={t.stage} className="flex items-center gap-2 text-sm">
                            <span className={`flex size-5 items-center justify-center rounded-full text-xs font-bold ${t.done ? 'bg-[#2FD6A3] text-[#0E2A26]' : 'bg-[#14201B]/10'}`}>
                                {t.done ? '✓' : '·'}
                            </span>
                            <span className="capitalize">{t.stage}</span>
                        </li>
                    ))}
                </ol>
            </div>

            <Button onClick={() => router.visit('/m/verify')} variant="outline" className="mt-4 min-h-[48px] w-full">
                Switch to Verifier →
            </Button>
        </MShell>
    );
}
