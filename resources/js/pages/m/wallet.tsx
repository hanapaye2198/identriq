import { router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import NationalIdCard, {
    NationalIdCardBack,
} from '@/components/national-id-card';
import { Button } from '@/components/ui/button';
import MShell from '@/components/m-shell';
import { setToken } from '@/lib/wallet-slice';
import { useAppDispatch, useAppSelector } from '@/lib/redux-hooks';

interface Card {
    full_name: string;
    dob: string;
    gender?: string | null;
    mobile: string;
    status: string;
    credential_state: string;
    biosure_id_number: string | null;
    card_personalized_at?: string | null;
    qr_token: string | null;
}

/**
 * "1988-04-14" → "14 APR 1988"; unparseable values pass through untouched.
 * Plain dates are formatted as calendar dates and full timestamps (the API
 * serializes dates as UTC instants) render in PNG local time, so the printed
 * day never shifts a day early.
 */
function formatCardDate(
    value: string | Date | null | undefined,
): string | undefined {
    if (!value) return undefined;

    let date: Date;
    let timeZone: string | undefined;
    if (value instanceof Date) {
        date = value;
    } else {
        const plain = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
        if (plain) {
            date = new Date(
                Date.UTC(
                    Number(plain[1]),
                    Number(plain[2]) - 1,
                    Number(plain[3]),
                ),
            );
            timeZone = 'UTC';
        } else {
            date = new Date(value);
            timeZone = 'Pacific/Port_Moresby';
        }
    }

    if (Number.isNaN(date.getTime())) {
        return typeof value === 'string' ? value : undefined;
    }

    return date
        .toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            timeZone,
        })
        .toUpperCase();
}

/** "MARY KILA" → "Mary Kila" for the handwriting signature line. */
function titleCaseName(name: string): string {
    return name
        .toLowerCase()
        .split(' ')
        .map((word) =>
            word ? word.charAt(0).toUpperCase() + word.slice(1) : word,
        )
        .join(' ');
}

function StatusChip({ state }: { state: string }) {
    const labels: Record<string, string> = {
        active: 'Active',
        suspended: 'Suspended',
        revoked: 'Revoked',
        pending: 'Pending',
        failed: 'Failed',
        not_issued: 'Not issued',
    };
    const tones: Record<string, string> = {
        active: 'bg-[#2FD6A3]/25 text-[#0E6B52]',
        suspended: 'bg-red-100 text-red-700',
        revoked: 'bg-red-100 text-red-700',
        failed: 'bg-red-100 text-red-700',
        pending: 'bg-amber-100 text-amber-800',
        not_issued: 'bg-black/5 text-[#14201B]/60',
    };
    const label = labels[state];

    if (!label) return null;

    return (
        <span
            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${tones[state] ?? 'bg-black/5 text-[#14201B]/60'}`}
        >
            {label}
        </span>
    );
}

export default function MWallet() {
    const dispatch = useAppDispatch();
    const token = useAppSelector((s) => s.wallet.token);
    const [card, setCard] = useState<Card | null>(null);
    const [flipped, setFlipped] = useState(false);
    const [qrSvg, setQrSvg] = useState('');
    const [timeline, setTimeline] = useState<
        { stage: string; at: string | null; done: boolean }[]
    >([]);
    const [loadError, setLoadError] = useState(false);
    const [reloadKey, setReloadKey] = useState(0);
    const [confirmingLost, setConfirmingLost] = useState(false);
    const [reportBusy, setReportBusy] = useState(false);
    const [reportNote, setReportNote] = useState('');
    const [replacementNote, setReplacementNote] = useState('');

    useEffect(() => {
        if (!token) {
            router.visit('/m');
            return;
        }
        const h = {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
        };
        let cancelled = false;

        void (async () => {
            try {
                const res = await fetch('/api/me/identity', { headers: h });
                if (!res.ok) {
                    throw new Error(`identity ${res.status}`);
                }
                const identity = (await res.json()) as Card;
                if (!cancelled) {
                    setCard(identity);
                    setLoadError(false);
                }
            } catch {
                // Offline or the request failed: surface a retryable state
                // instead of an eternal skeleton.
                if (!cancelled) {
                    setLoadError(true);
                }
            }
        })();

        void fetch('/api/me/qr-svg', { headers: h })
            .then((r) => (r.ok ? r.json() : null))
            .then((j) => {
                if (!cancelled) {
                    setQrSvg(j?.svg ?? '');
                }
            })
            .catch(() => {});
        void fetch('/api/me/timeline', { headers: h })
            .then((r) => (r.ok ? r.json() : null))
            .then((j) => {
                if (!cancelled) {
                    setTimeline(j?.timeline ?? []);
                }
            })
            .catch(() => {});

        return () => {
            cancelled = true;
        };
    }, [token, reloadKey]);

    if (!token) return null;

    const personalizedAt = card?.card_personalized_at
        ? new Date(card.card_personalized_at)
        : null;
    const cardExpiry = personalizedAt
        ? formatCardDate(
              new Date(
                  personalizedAt.getFullYear() + 10,
                  personalizedAt.getMonth(),
                  personalizedAt.getDate(),
              ),
          )
        : undefined;

    async function reportLost() {
        if (!token || reportBusy) return;

        setReportBusy(true);
        setReportNote('');

        try {
            const res = await fetch('/api/mobile/report-lost', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: 'application/json',
                },
            });
            const body = (await res.json().catch(() => null)) as {
                state?: string;
            } | null;

            if (!res.ok) {
                throw new Error(`report-lost ${res.status}`);
            }

            setCard((prev) =>
                prev
                    ? { ...prev, credential_state: body?.state ?? 'suspended' }
                    : prev,
            );
            setConfirmingLost(false);
        } catch {
            setReportNote(
                "Couldn't reach the server — check your connection and try again.",
            );
        } finally {
            setReportBusy(false);
        }
    }

    function requestReplacement() {
        setReplacementNote(
            'Replacement request recorded (demo) — bring a police report to a registration center.',
        );
    }

    return (
        <MShell tab="wallet">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-bold">My ID</h1>
                    {card && <StatusChip state={card.credential_state} />}
                </div>
                <button
                    type="button"
                    onClick={() => {
                        const activeToken = token;
                        dispatch(setToken(null));
                        if (activeToken) {
                            // Fire-and-forget revoke so the token cannot be
                            // reused; local sign-out proceeds even if offline.
                            void fetch('/api/mobile/unlink', {
                                method: 'POST',
                                headers: {
                                    Authorization: `Bearer ${activeToken}`,
                                    Accept: 'application/json',
                                },
                            }).catch(() => {});
                        }
                        router.visit('/m');
                    }}
                    className="text-sm text-[#14201B]/60 underline"
                >
                    Unlink
                </button>
            </div>

            {card &&
                (card.credential_state === 'suspended' ||
                    card.credential_state === 'revoked') && (
                    <div className="mt-4 rounded-2xl bg-red-50 p-4 ring-1 ring-red-200">
                        <p className="font-semibold text-red-800">
                            {card.credential_state === 'suspended'
                                ? 'ID suspended'
                                : 'ID revoked'}
                        </p>
                        <p className="mt-1 text-sm text-red-700">
                            {card.credential_state === 'suspended'
                                ? 'You reported this ID lost or stolen. Verifiers will see INVALID after their next sync.'
                                : 'This credential was revoked by IDENTRIQ. Verifiers will see INVALID after their next sync.'}
                        </p>
                        <Button
                            variant="outline"
                            size="sm"
                            className="mt-3 min-h-[40px]"
                            onClick={requestReplacement}
                        >
                            Request replacement
                        </Button>
                        {replacementNote && (
                            <p className="mt-2 text-xs text-red-700/80">
                                {replacementNote}
                            </p>
                        )}
                    </div>
                )}

            {card ? (
                <>
                    <button
                        type="button"
                        onClick={() => setFlipped(!flipped)}
                        aria-label={
                            flipped ? 'Show card front' : 'Show card back'
                        }
                        className="mt-4 block w-full rounded-2xl text-left transition-transform duration-200 active:scale-[0.99]"
                    >
                        {!flipped ? (
                            <NationalIdCard
                                fullName={card.full_name}
                                idNumber={
                                    card.biosure_id_number ??
                                    'PENDING PERSONALIZATION'
                                }
                                dateOfBirth={formatCardDate(card.dob) ?? '—'}
                                sex={
                                    card.gender
                                        ? card.gender.charAt(0).toUpperCase()
                                        : '—'
                                }
                                expiryDate={cardExpiry}
                                signatureName={titleCaseName(card.full_name)}
                                qrSvg={qrSvg || null}
                            />
                        ) : (
                            <NationalIdCardBack
                                fullName={card.full_name}
                                idNumber={
                                    card.biosure_id_number ??
                                    'PENDING PERSONALIZATION'
                                }
                                dateOfBirth={card.dob}
                                sex={
                                    card.gender
                                        ? card.gender.charAt(0).toUpperCase()
                                        : 'M'
                                }
                                expiryDate={cardExpiry}
                                qrSvg={qrSvg || null}
                                qrToken={card.qr_token}
                                mobile={card.mobile}
                                status={card.status}
                            />
                        )}
                    </button>
                    <p className="mt-2 text-center text-xs text-[#14201B]/50">
                        Tap card to flip
                    </p>
                </>
            ) : loadError ? (
                <div className="mt-4 rounded-2xl bg-white p-5 text-center shadow-sm">
                    <p className="font-semibold">Couldn't load your ID</p>
                    <p className="mt-1 text-sm text-[#14201B]/60">
                        Check your connection and try again.
                    </p>
                    <Button
                        variant="outline"
                        className="mt-3 min-h-[44px]"
                        onClick={() => {
                            setLoadError(false);
                            setReloadKey((k) => k + 1);
                        }}
                    >
                        Retry
                    </Button>
                </div>
            ) : (
                <div className="mt-4 aspect-[1.586] w-full animate-pulse rounded-2xl bg-white/70 ring-1 ring-black/10" />
            )}

            {card && card.credential_state === 'active' && (
                <div className="mt-4 text-center">
                    {!confirmingLost ? (
                        <button
                            type="button"
                            onClick={() => setConfirmingLost(true)}
                            className="text-sm text-red-700 underline"
                        >
                            Report lost or stolen
                        </button>
                    ) : (
                        <div className="rounded-2xl bg-red-50 p-4 text-left ring-1 ring-red-200">
                            <p className="font-semibold text-red-800">
                                Suspend this ID?
                            </p>
                            <p className="mt-1 text-sm text-red-700">
                                Verifiers will see INVALID after their next
                                sync. You can request a replacement afterwards.
                            </p>
                            <div className="mt-3 flex gap-2">
                                <Button
                                    onClick={reportLost}
                                    disabled={reportBusy}
                                    className="min-h-[44px] bg-red-700 text-white hover:bg-red-800 disabled:opacity-50"
                                >
                                    {reportBusy
                                        ? 'Suspending…'
                                        : 'Yes, suspend my ID'}
                                </Button>
                                <Button
                                    variant="outline"
                                    className="min-h-[44px]"
                                    onClick={() => {
                                        setConfirmingLost(false);
                                        setReportNote('');
                                    }}
                                >
                                    Cancel
                                </Button>
                            </div>
                            {reportNote && (
                                <p className="mt-2 text-sm text-red-700">
                                    {reportNote}
                                </p>
                            )}
                        </div>
                    )}
                </div>
            )}

            <div className="mt-4 rounded-2xl bg-white p-5 text-center shadow-sm">
                <h2 className="font-semibold">Present QR</h2>
                {qrSvg ? (
                    <div
                        className="mx-auto mt-2 w-52 bg-white p-2 [&>svg]:h-auto [&>svg]:w-full"
                        dangerouslySetInnerHTML={{ __html: qrSvg }}
                    />
                ) : (
                    <p className="mt-2 text-sm text-[#14201B]/50">
                        No QR yet — complete booking on the web portal.
                    </p>
                )}
            </div>

            <div className="mt-4 rounded-2xl bg-white p-5 shadow-sm">
                <h2 className="font-semibold">Status</h2>
                <ol className="mt-2 space-y-2">
                    {timeline.map((t) => (
                        <li
                            key={t.stage}
                            className="flex items-center gap-2 text-sm"
                        >
                            <span
                                className={`flex size-5 items-center justify-center rounded-full text-xs font-bold ${t.done ? 'bg-[#2FD6A3] text-[#0E2A26]' : 'bg-[#14201B]/10'}`}
                            >
                                {t.done ? '✓' : '·'}
                            </span>
                            <span className="capitalize">{t.stage}</span>
                        </li>
                    ))}
                </ol>
            </div>

            <Button
                onClick={() => router.visit('/m/verify')}
                variant="outline"
                className="mt-4 min-h-[48px] w-full"
            >
                Switch to Verifier →
            </Button>
        </MShell>
    );
}
