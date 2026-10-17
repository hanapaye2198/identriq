import { Globe, ShieldCheck, WifiOff } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    useDecideConsentMutation,
    useGetActivityQuery,
    useGetWalletIdentityQuery,
    useSimulateConsentMutation,
    type ActivityEvent,
    type PendingConsent,
} from '@/lib/api';
import { formatDateTime } from './datetime';
import { describeFields } from './share-scope';

type Filter = 'all' | 'shared' | 'denied';

const FILTERS: { id: Filter; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'shared', label: 'Shared' },
    { id: 'denied', label: 'Denied' },
];

/** Seconds until a consent request expires, ticking while pending. */
function useCountdown(expiresAt: string | null | undefined): number {
    const [now, setNow] = useState(() => Date.now());

    useEffect(() => {
        if (!expiresAt) return;
        setNow(Date.now());
        const timer = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(timer);
    }, [expiresAt]);

    if (!expiresAt) return 0;
    return Math.max(
        0,
        Math.floor((new Date(expiresAt).getTime() - now) / 1000),
    );
}

/**
 * W6 + W7 — the consent inbox and the check history, one surface. Decisions
 * land in Activity themselves: Allow/Deny writes an AuthEvent server-side.
 */
export default function ActivityView({
    request,
}: {
    request: PendingConsent | null;
}) {
    const { data, isLoading } = useGetActivityQuery();
    const identity = useGetWalletIdentityQuery();
    const [decide, decideState] = useDecideConsentMutation();
    const [simulate, simulateState] = useSimulateConsentMutation();
    const [filter, setFilter] = useState<Filter>('all');
    const [expanded, setExpanded] = useState<number | null>(null);
    const [notice, setNotice] = useState('');
    const secondsLeft = useCountdown(request?.expires_at);

    const events = (data?.events ?? []).filter((event) => {
        if (filter === 'shared') {
            return event.result === 'valid' || event.result === 'allowed';
        }
        if (filter === 'denied') {
            return event.result === 'invalid' || event.result === 'denied';
        }
        return true;
    });

    async function answer(allow: boolean) {
        if (!request) return;
        setNotice('');
        try {
            await decide({ id: request.id, allow }).unwrap();
        } catch {
            setNotice('That request is no longer available.');
        }
    }

    async function runSimulate() {
        const query =
            identity.data?.biosure_id_number ?? identity.data?.qr_token;
        if (!query) return;
        setNotice('');
        try {
            await simulate({
                query,
                verifier_name: 'Demo Pacific Bank',
                purpose: 'Account opening',
                fields: 'name,photo,over18',
            }).unwrap();
        } catch {
            setNotice('Could not create the demo request — try again.');
        }
    }

    const canSimulate = Boolean(
        identity.data?.biosure_id_number ?? identity.data?.qr_token,
    );

    return (
        <div className="mt-4 space-y-4">
            {request && (
                <section className="rounded-2xl bg-amber-50 p-4 ring-1 ring-amber-200">
                    <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-bold tracking-widest text-amber-700 uppercase">
                            Consent request
                        </p>
                        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800">
                            {secondsLeft > 0
                                ? `expires in ${Math.floor(secondsLeft / 60)}:${String(secondsLeft % 60).padStart(2, '0')}`
                                : 'expires now'}
                        </span>
                    </div>
                    <p className="mt-2 text-sm text-[#14201B]">
                        <strong>{request.verifier_name}</strong> wants to verify
                        you for{' '}
                        <strong>{request.purpose ?? 'their records'}</strong>.
                    </p>
                    <p className="mt-1 text-xs text-[#14201B]/60">
                        They will see:{' '}
                        {describeFields(request.fields ?? []).join(' · ') ||
                            '—'}
                    </p>
                    <div className="mt-3 grid grid-cols-2 gap-2">
                        <Button
                            type="button"
                            onClick={() => void answer(true)}
                            disabled={decideState.isLoading}
                            className="min-h-[44px] bg-[#0E2A26] font-semibold text-white hover:bg-[#0E2A26]/90 disabled:opacity-40"
                        >
                            Allow once
                        </Button>
                        <Button
                            type="button"
                            onClick={() => void answer(false)}
                            disabled={decideState.isLoading}
                            variant="outline"
                            className="min-h-[44px] border-[#B4232A]/30 font-semibold text-[#B4232A] disabled:opacity-40"
                        >
                            Deny
                        </Button>
                    </div>
                    <p className="mt-2 text-[11px] text-[#14201B]/50">
                        Decisions are logged below · the verifier sees the
                        result live.
                    </p>
                </section>
            )}

            {notice && (
                <p className="rounded-xl bg-[#B4232A]/10 px-3 py-2 text-sm text-[#B4232A]">
                    {notice}
                </p>
            )}

            <section className="rounded-2xl bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between gap-2">
                    <h2 className="font-semibold">Activity</h2>
                    <div className="flex rounded-lg bg-[#14201B]/5 p-0.5">
                        {FILTERS.map((option) => (
                            <button
                                key={option.id}
                                type="button"
                                onClick={() => setFilter(option.id)}
                                className={`rounded-md px-2.5 py-1 text-xs font-semibold ${
                                    filter === option.id
                                        ? 'bg-white shadow-sm'
                                        : 'text-[#14201B]/50'
                                }`}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>
                </div>
                <p className="mt-0.5 text-xs text-[#14201B]/50">
                    Who checked your ID, when, and what was shown.
                </p>

                {isLoading ? (
                    <p className="mt-4 text-sm text-[#14201B]/50">Loading…</p>
                ) : events.length === 0 ? (
                    <p className="mt-4 rounded-xl bg-[#14201B]/5 p-4 text-sm text-[#14201B]/60">
                        {filter === 'all'
                            ? 'No checks yet — verification checks and consent decisions will appear here.'
                            : `No ${filter} entries yet.`}
                    </p>
                ) : (
                    <ul className="mt-2 divide-y divide-black/5">
                        {events.map((event) => (
                            <EventRow
                                key={event.id}
                                event={event}
                                open={expanded === event.id}
                                onToggle={() =>
                                    setExpanded(
                                        expanded === event.id ? null : event.id,
                                    )
                                }
                            />
                        ))}
                    </ul>
                )}
            </section>

            <section className="rounded-2xl border border-dashed border-[#14201B]/15 p-4">
                <p className="text-xs font-bold tracking-widest text-[#14201B]/40 uppercase">
                    Demo control
                </p>
                <p className="mt-1 text-xs text-[#14201B]/55">
                    Rehearse the consent story without a second window — the
                    wallet asks itself, exactly like the verifier page would.
                </p>
                <Button
                    type="button"
                    onClick={() => void runSimulate()}
                    disabled={!canSimulate || simulateState.isLoading}
                    variant="outline"
                    className="mt-2 min-h-[44px] w-full text-xs font-semibold disabled:opacity-40"
                >
                    {simulateState.isLoading
                        ? 'Requesting…'
                        : 'Simulate an incoming consent request'}
                </Button>
            </section>
        </div>
    );
}

function EventRow({
    event,
    open,
    onToggle,
}: {
    event: ActivityEvent;
    open: boolean;
    onToggle: () => void;
}) {
    const labels = describeFields(event.fields ?? []);
    const isDenied = event.result === 'invalid' || event.result === 'denied';
    const isConsent = event.mode === 'consent';

    return (
        <li>
            <button
                type="button"
                onClick={onToggle}
                className="flex w-full items-center gap-3 py-3 text-left"
            >
                <span
                    className={`flex size-9 shrink-0 items-center justify-center rounded-full ${
                        isConsent
                            ? 'bg-[#2FD6A3]/20 text-[#0E6B52]'
                            : 'bg-[#0E2A26]/10 text-[#0E2A26]'
                    }`}
                >
                    {isConsent ? (
                        <ShieldCheck className="size-4" />
                    ) : event.offline ? (
                        <WifiOff className="size-4" />
                    ) : (
                        <Globe className="size-4" />
                    )}
                </span>
                <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold">
                        {event.verifier ??
                            (isConsent ? 'Consent decision' : 'ID check')}
                    </span>
                    <span className="block text-xs text-[#14201B]/50">
                        {isConsent
                            ? 'Consent'
                            : event.offline
                              ? 'Offline check'
                              : 'Online check'}{' '}
                        · {formatDateTime(event.at)}
                    </span>
                </span>
                <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                        isDenied
                            ? 'bg-[#B4232A]/10 text-[#B4232A]'
                            : 'bg-[#2FD6A3]/20 text-[#0E6B52]'
                    }`}
                >
                    {event.result}
                </span>
            </button>
            {open && (
                <dl className="mb-3 space-y-1.5 rounded-xl bg-[#14201B]/5 p-3 text-xs">
                    <Detail
                        label="When"
                        value={formatDateTime(event.checked_at ?? event.at)}
                    />
                    <Detail
                        label="Channel"
                        value={
                            isConsent
                                ? 'Consent request'
                                : event.offline
                                  ? 'Offline QR'
                                  : 'Online check'
                        }
                    />
                    {event.purpose && (
                        <Detail label="Purpose" value={event.purpose} />
                    )}
                    {event.verifier && (
                        <Detail label="Verifier" value={event.verifier} />
                    )}
                    <Detail
                        label="Fields shared"
                        value={
                            labels.length > 0
                                ? labels.join(' · ')
                                : 'None recorded'
                        }
                    />
                    {event.state && (
                        <Detail label="Credential" value={event.state} />
                    )}
                    {event.reason && (
                        <Detail label="Note" value={event.reason} />
                    )}
                </dl>
            )}
        </li>
    );
}

function Detail({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex gap-2">
            <dt className="w-28 shrink-0 text-[#14201B]/45">{label}</dt>
            <dd className="min-w-0 flex-1">{value}</dd>
        </div>
    );
}
