import { router } from '@inertiajs/react';
import { Activity, Bell, QrCode, Share2, ShieldCheck, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import NationalIdCard, {
    NationalIdCardBack,
} from '@/components/national-id-card';
import { Button } from '@/components/ui/button';
import MShell from '@/components/m-shell';
import ActivityView from '@/components/wallet/activity-view';
import AppointmentSlip from '@/components/wallet/appointment-slip';
import { formatDateTime } from '@/components/wallet/datetime';
import SettingsView from '@/components/wallet/settings-view';
import SharePresenter from '@/components/wallet/share-presenter';
import ShareView from '@/components/wallet/share-view';
import { MINIMAL_SHARE, maskId } from '@/components/wallet/share-scope';
import {
    useGetPendingConsentQuery,
    useGetQrSvgQuery,
    useGetTimelineQuery,
    useGetWalletIdentityQuery,
    useReportLostMutation,
} from '@/lib/api';
import { useAppSelector } from '@/lib/redux-hooks';

type View = 'home' | 'share' | 'activity' | 'settings';

const VIEWS: { id: View; label: string }[] = [
    { id: 'home', label: 'Home' },
    { id: 'share', label: 'Share' },
    { id: 'activity', label: 'Activity' },
    { id: 'settings', label: 'Settings' },
];

const SEEN_KEY = 'wallet_notifications_seen_at';

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

/** Lifecycle pill (spec §3.1): mint `Approved & Active` · amber `Validating` · teal `Card Dispatched`. */
function StatusChip({ state, status }: { state: string; status?: string }) {
    let label: string | null = null;
    let tone = 'bg-black/5 text-[#14201B]/60';

    if (state === 'active') {
        if (status === 'issued') {
            // Approved + card personalized but not yet delivered.
            label = 'Card Dispatched';
            tone = 'bg-teal-100 text-teal-800';
        } else {
            label = 'Approved & Active';
            tone = 'bg-[#2FD6A3]/25 text-[#0E6B52]';
        }
    } else if (state === 'pending') {
        label = 'Validating';
        tone = 'bg-amber-100 text-amber-800';
    } else if (state === 'suspended') {
        label = 'Suspended';
        tone = 'bg-red-100 text-red-700';
    } else if (state === 'revoked') {
        label = 'Revoked';
        tone = 'bg-red-100 text-red-700';
    } else if (state === 'failed') {
        label = 'Failed';
        tone = 'bg-red-100 text-red-700';
    } else if (state === 'not_issued') {
        label = 'Not issued';
    }

    if (!label) return null;

    return (
        <span
            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${tone}`}
        >
            {label}
        </span>
    );
}

export default function MWallet() {
    const token = useAppSelector((s) => s.wallet.token);
    const [view, setView] = useState<View>('home');
    const [fields, setFields] = useState<string[]>(() => [...MINIMAL_SHARE]);
    const [presetId, setPresetId] = useState('bank');
    const [flipped, setFlipped] = useState(false);
    const [revealedId, setRevealedId] = useState(false);
    const [presenting, setPresenting] = useState(false);
    const [showBell, setShowBell] = useState(false);
    const [seenAt, setSeenAt] = useState<string | null>(() =>
        typeof window === 'undefined' ? null : localStorage.getItem(SEEN_KEY),
    );
    const [confirmingLost, setConfirmingLost] = useState(false);
    const [reportNote, setReportNote] = useState('');
    const [replacementNote, setReplacementNote] = useState('');

    const skip = !token;
    const identity = useGetWalletIdentityQuery(undefined, { skip });
    const cardQr = useGetQrSvgQuery(undefined, { skip });
    const timelineQuery = useGetTimelineQuery(undefined, { skip });
    const pendingQuery = useGetPendingConsentQuery(undefined, {
        skip,
        pollingInterval: 5000,
    });
    const [reportLost, reportState] = useReportLostMutation();

    useEffect(() => {
        if (!token) router.visit('/m');
    }, [token]);

    if (!token) return null;

    const card = identity.data ?? null;
    const qrSvg = cardQr.data?.svg ?? '';
    const stages = timelineQuery.data?.timeline ?? [];
    const notifications = timelineQuery.data?.notifications ?? [];
    const request = pendingQuery.data?.request ?? null;
    const maskedId = card?.biosure_id_number
        ? maskId(card.biosure_id_number)
        : null;
    // Card front/back show the masked ID until the holder taps to reveal it.
    const displayId = card?.biosure_id_number
        ? revealedId
            ? card.biosure_id_number
            : maskId(card.biosure_id_number)
        : 'PENDING PERSONALIZATION';
    const unreadCount = notifications.filter((notification) => {
        if (notification.read_at) return false;
        if (!seenAt) return true;
        const at = notification.sent_at ?? notification.created_at;
        return at ? new Date(at).getTime() > new Date(seenAt).getTime() : true;
    }).length;

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

    function toggleBell() {
        if (showBell) {
            setShowBell(false);
            return;
        }
        setShowBell(true);
        const now = new Date().toISOString();
        localStorage.setItem(SEEN_KEY, now);
        setSeenAt(now);
    }

    function showQr() {
        if (fields.length === 0) {
            // An empty scope would fall back to the legacy full-disclosure QR —
            // send the user to pick fields instead.
            setView('share');
            return;
        }
        setPresenting(true);
    }

    function retry() {
        void identity.refetch();
        void cardQr.refetch();
        void timelineQuery.refetch();
    }

    async function reportLostNow() {
        setReportNote('');
        try {
            await reportLost().unwrap();
            setConfirmingLost(false);
        } catch {
            setReportNote(
                "Couldn't reach the server — check your connection and try again.",
            );
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
                    {card && (
                        <StatusChip
                            state={card.credential_state}
                            status={card.status}
                        />
                    )}
                </div>
                <button
                    type="button"
                    onClick={toggleBell}
                    aria-label={
                        unreadCount > 0
                            ? `Notifications — ${unreadCount} unread`
                            : 'Notifications'
                    }
                    className="relative flex size-10 items-center justify-center rounded-full bg-white shadow-sm"
                >
                    <Bell className="size-5" />
                    {unreadCount > 0 && (
                        <span className="absolute top-2.5 right-2.5 size-2 rounded-full bg-[#B4232A]" />
                    )}
                </button>
            </div>

            {showBell && (
                <div className="mt-3 rounded-2xl bg-white p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                        <h2 className="font-semibold">Notifications</h2>
                        <button
                            type="button"
                            onClick={() => setShowBell(false)}
                            aria-label="Close notifications"
                            className="flex size-8 items-center justify-center rounded-full bg-[#14201B]/5"
                        >
                            <X className="size-4" />
                        </button>
                    </div>
                    {notifications.length === 0 ? (
                        <p className="mt-2 text-sm text-[#14201B]/50">
                            Nothing here yet — booking and ID updates will show
                            up.
                        </p>
                    ) : (
                        <ul className="mt-2 divide-y divide-black/5">
                            {notifications.slice(0, 8).map((notification) => (
                                <li key={notification.id} className="py-2.5">
                                    <p className="text-sm font-semibold">
                                        {notification.title}
                                    </p>
                                    {notification.body && (
                                        <p className="mt-0.5 text-xs text-[#14201B]/60">
                                            {notification.body}
                                        </p>
                                    )}
                                    <p className="mt-0.5 text-[11px] text-[#14201B]/40">
                                        {formatDateTime(
                                            notification.sent_at ??
                                                notification.created_at,
                                        )}
                                    </p>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}

            {request && view !== 'activity' && (
                <button
                    type="button"
                    onClick={() => setView('activity')}
                    className="mt-3 flex w-full items-center gap-3 rounded-2xl bg-amber-50 p-3.5 text-left ring-1 ring-amber-200"
                >
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-800">
                        <ShieldCheck className="size-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                        <span className="block text-sm font-semibold text-amber-900">
                            {request.verifier_name} wants to verify you
                        </span>
                        <span className="block text-xs text-amber-800/70">
                            Review and answer before it expires
                        </span>
                    </span>
                </button>
            )}

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
                                : 'This credential was revoked by the registry.'}
                        </p>
                        {card.credential_state === 'suspended' && (
                            <>
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
                            </>
                        )}
                    </div>
                )}

            <div className="mt-4 flex rounded-xl bg-[#14201B]/5 p-1">
                {VIEWS.map((item) => (
                    <button
                        key={item.id}
                        type="button"
                        aria-current={view === item.id ? 'page' : undefined}
                        onClick={() => setView(item.id)}
                        className={`relative flex-1 rounded-lg px-2 py-2 text-xs font-semibold ${
                            view === item.id
                                ? 'bg-white shadow-sm'
                                : 'text-[#14201B]/50'
                        }`}
                    >
                        {item.label}
                        {item.id === 'activity' && request && (
                            <span className="absolute top-1.5 right-2 size-1.5 rounded-full bg-amber-500" />
                        )}
                    </button>
                ))}
            </div>

            {view === 'share' && (
                <ShareView
                    fields={fields}
                    presetId={presetId}
                    onFieldsChange={setFields}
                    onPresetChange={setPresetId}
                    onPresent={() => setPresenting(true)}
                />
            )}

            {view === 'activity' && <ActivityView request={request} />}

            {view === 'settings' && <SettingsView />}

            {view === 'home' && (
                <>
                    {card ? (
                        <>
                            <div className="mt-4">
                                {!flipped ? (
                                    <NationalIdCard
                                        fullName={card.full_name ?? undefined}
                                        idNumber={displayId}
                                        onIdNumberClick={
                                            card.biosure_id_number
                                                ? () =>
                                                      setRevealedId(
                                                          (shown) => !shown,
                                                      )
                                                : undefined
                                        }
                                        idNumberHint={
                                            card.biosure_id_number
                                                ? revealedId
                                                    ? 'Tap to hide'
                                                    : 'Tap to reveal'
                                                : undefined
                                        }
                                        dateOfBirth={
                                            formatCardDate(card.dob) ?? '—'
                                        }
                                        sex={
                                            card.gender
                                                ? card.gender
                                                      .charAt(0)
                                                      .toUpperCase()
                                                : '—'
                                        }
                                        province={card.province ?? '—'}
                                        expiryDate={cardExpiry}
                                        signatureName={titleCaseName(
                                            card.full_name ??
                                                'Registered citizen',
                                        )}
                                        photoSrc={card.photo_url || null}
                                        qrSvg={qrSvg || null}
                                    />
                                ) : (
                                    <NationalIdCardBack
                                        fullName={card.full_name ?? undefined}
                                        idNumber={displayId}
                                        dateOfBirth={card.dob ?? undefined}
                                        sex={
                                            card.gender
                                                ? card.gender
                                                      .charAt(0)
                                                      .toUpperCase()
                                                : 'M'
                                        }
                                        expiryDate={cardExpiry}
                                        qrSvg={qrSvg || null}
                                        qrToken={card.qr_token}
                                        mobile={card.mobile}
                                        status={card.status}
                                    />
                                )}
                            </div>
                            <button
                                type="button"
                                onClick={() => setFlipped(!flipped)}
                                aria-label={
                                    flipped
                                        ? 'Show card front'
                                        : 'Show card back'
                                }
                                className="mx-auto mt-2 block text-xs text-[#14201B]/50 underline-offset-4 hover:underline"
                            >
                                {flipped ? 'Show card front' : 'Show card back'}
                            </button>
                        </>
                    ) : identity.isError ? (
                        <div className="mt-4 rounded-2xl bg-white p-5 text-center shadow-sm">
                            <p className="font-semibold">
                                Couldn't load your ID
                            </p>
                            <p className="mt-1 text-sm text-[#14201B]/60">
                                Check your connection and try again.
                            </p>
                            <Button
                                variant="outline"
                                className="mt-3 min-h-[44px]"
                                onClick={retry}
                            >
                                Retry
                            </Button>
                        </div>
                    ) : (
                        <div className="mt-4 aspect-[1.586] w-full animate-pulse rounded-2xl bg-white/70 ring-1 ring-black/10" />
                    )}

                    <div className="mt-4 grid grid-cols-3 gap-2">
                        <button
                            type="button"
                            onClick={showQr}
                            className="flex min-h-[72px] flex-col items-center justify-center gap-1.5 rounded-2xl bg-white text-xs font-semibold shadow-sm active:scale-[0.98]"
                        >
                            <QrCode className="size-5 text-[#0E2A26]" />
                            Show QR
                        </button>
                        <button
                            type="button"
                            onClick={() => setView('share')}
                            className="flex min-h-[72px] flex-col items-center justify-center gap-1.5 rounded-2xl bg-white text-xs font-semibold shadow-sm active:scale-[0.98]"
                        >
                            <Share2 className="size-5 text-[#0E2A26]" />
                            Share
                        </button>
                        <button
                            type="button"
                            onClick={() => setView('activity')}
                            className="flex min-h-[72px] flex-col items-center justify-center gap-1.5 rounded-2xl bg-white text-xs font-semibold shadow-sm active:scale-[0.98]"
                        >
                            <Activity className="size-5 text-[#0E2A26]" />
                            Activity
                        </button>
                    </div>

                    {card?.appointment && (
                        <AppointmentSlip appointment={card.appointment} />
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
                                        Verifiers will see INVALID after their
                                        next sync. You can request a replacement
                                        afterwards.
                                    </p>
                                    <div className="mt-3 flex gap-2">
                                        <Button
                                            onClick={() => void reportLostNow()}
                                            disabled={reportState.isLoading}
                                            className="min-h-[44px] bg-red-700 text-white hover:bg-red-800 disabled:opacity-50"
                                        >
                                            {reportState.isLoading
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

                    <div className="mt-4 rounded-2xl bg-white p-5 shadow-sm">
                        <h2 className="font-semibold">Status</h2>
                        {stages.length === 0 ? (
                            <p className="mt-2 text-sm text-[#14201B]/50">
                                Timeline unavailable offline.
                            </p>
                        ) : (
                            <ol className="mt-2 space-y-2">
                                {stages.map((stage) => (
                                    <li
                                        key={stage.stage}
                                        className="flex items-center gap-2 text-sm"
                                    >
                                        <span
                                            className={`flex size-5 items-center justify-center rounded-full text-xs font-bold ${stage.done ? 'bg-[#2FD6A3] text-[#0E2A26]' : 'bg-[#14201B]/10'}`}
                                        >
                                            {stage.done ? '✓' : '·'}
                                        </span>
                                        <span className="capitalize">
                                            {stage.stage}
                                        </span>
                                    </li>
                                ))}
                            </ol>
                        )}
                    </div>

                    <Button
                        onClick={() => router.visit('/m/verify')}
                        variant="outline"
                        className="mt-4 min-h-[48px] w-full"
                    >
                        Switch to Verifier →
                    </Button>
                </>
            )}

            <SharePresenter
                open={presenting}
                fields={fields}
                maskedId={maskedId}
                onClose={() => setPresenting(false)}
            />
        </MShell>
    );
}
