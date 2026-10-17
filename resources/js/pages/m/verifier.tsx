import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import MShell from '@/components/m-shell';
import { describeFields, SHARE_FIELDS } from '@/components/wallet/share-scope';
import { csrfToken } from '@/lib/csrf';

const PURPOSES = ['Bank onboarding', 'SIM registration', 'Police check'];

interface Credential {
    token: string;
    name: string | null;
    biosure: string | null;
    state: string;
    issued_at: string | null;
}

interface ListsCache {
    credentials: Credential[];
    syncedAt: string;
}

interface QueuedCheck {
    token: string;
    result: 'valid' | 'invalid';
    at: string;
    purpose: string;
    reason?: string;
    fields?: string[];
}

interface Verdict {
    valid: boolean;
    title: string;
    name?: string;
    id?: string;
    reason?: string;
    warning?: string;
    purpose?: string;
    share?: string[];
    at: string;
}

interface HistoryEntry {
    id: string;
    at: string;
    token: string;
    valid: boolean;
    title: string;
    name?: string;
    holderId?: string;
    purpose: string;
    share?: string[];
    synced: boolean;
}

const HISTORY_LIMIT = 50;

const VERIFIER_VIEWS: { id: 'scan' | 'history'; label: string }[] = [
    { id: 'scan', label: 'Scan' },
    { id: 'history', label: 'History' },
];

type HistoryFilter = 'all' | 'valid' | 'invalid' | 'pending';

const HISTORY_FILTERS: { id: HistoryFilter; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'valid', label: 'Valid' },
    { id: 'invalid', label: 'Invalid' },
    { id: 'pending', label: 'Pending sync' },
];

function loadJson<T>(key: string, fallback: T): T {
    try {
        const raw = localStorage.getItem(key);

        return raw ? (JSON.parse(raw) as T) : fallback;
    } catch {
        return fallback;
    }
}

function loadLists(): ListsCache | null {
    const parsed = loadJson<ListsCache | null>('verify_lists', null);

    if (
        parsed &&
        Array.isArray(parsed.credentials) &&
        typeof parsed.syncedAt === 'string'
    ) {
        return parsed;
    }

    return null;
}

function saveLists(lists: ListsCache | null) {
    if (lists) {
        localStorage.setItem('verify_lists', JSON.stringify(lists));
    } else {
        localStorage.removeItem('verify_lists');
    }
}

function loadOutbox(): QueuedCheck[] {
    const parsed = loadJson<QueuedCheck[]>('verify_outbox', []);

    return Array.isArray(parsed) ? parsed : [];
}

function saveOutbox(queue: QueuedCheck[]) {
    localStorage.setItem('verify_outbox', JSON.stringify(queue));
}

/**
 * M2c offline-first exception, documented on purpose: the verifier's own
 * device keeps the audit log for every verdict it computed — including
 * tampered / not-issued codes that never reach the server. Entries flip to
 * `synced` once the outbox has been delivered, and the whole log clears on
 * "Reset device".
 */
function loadHistory(): HistoryEntry[] {
    const parsed = loadJson<HistoryEntry[]>('verify_history', []);

    return Array.isArray(parsed) ? parsed : [];
}

function saveHistory(entries: HistoryEntry[]) {
    localStorage.setItem('verify_history', JSON.stringify(entries));
}

function historyId(): string {
    if (
        typeof crypto !== 'undefined' &&
        typeof crypto.randomUUID === 'function'
    ) {
        return crypto.randomUUID();
    }

    return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * Wallet share codes arrive as `<token>|share=name,over18,…` (W4 presenter).
 * A bare token keeps the legacy full-disclosure behaviour; a carried scope is
 * sanitized against the whitelist so an altered code can never smuggle
 * unknown fields into the outbox that syncs server-side.
 */
function parseScanned(raw: string): { token: string; share: string[] | null } {
    const [head, ...rest] = raw.trim().split('|');
    let share: string[] | null = null;

    for (const part of rest) {
        const [key, ...value] = part.split('=');

        if (key.trim() === 'share') {
            const fields = value
                .join('=')
                .split(',')
                .map((field) => field.trim())
                .filter((field) =>
                    (SHARE_FIELDS as readonly string[]).includes(field),
                );

            share = fields.length > 0 ? fields : null;
        }
    }

    return { token: head.trim(), share };
}

function formatWhen(iso: string): string {
    const t = Date.parse(iso);

    if (Number.isNaN(t)) return '';

    return new Date(t).toLocaleString(undefined, {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
    });
}

function shortToken(token: string): string {
    if (token.length <= 12) return token;

    return `${token.slice(0, 6)}…${token.slice(-4)}`;
}

function maskId(biosure: string | null): string | undefined {
    if (!biosure) return undefined;

    return `•••• ${biosure.slice(-4)}`;
}

function hoursSince(iso: string): number | null {
    const t = Date.parse(iso);

    if (Number.isNaN(t)) return null;

    return Math.max(0, (Date.now() - t) / 3_600_000);
}

function ageLabel(hours: number | null): string {
    if (hours === null) return 'never synced';
    if (hours < 1 / 60) return 'just now';
    if (hours < 1) return `${Math.max(1, Math.round(hours * 60))} min ago`;
    if (hours < 48) return `${Math.round(hours)} h ago`;

    return `${Math.round(hours / 24)} d ago`;
}

type Tone = 'green' | 'amber' | 'red' | 'gray';

function toneFor(hours: number | null): Tone {
    if (hours === null) return 'gray';
    if (hours < 24) return 'green';
    if (hours <= 72) return 'amber';

    return 'red';
}

const TONE_CLASS: Record<Tone, string> = {
    green: 'bg-[#2FD6A3]/25 text-[#0E6B52]',
    amber: 'bg-amber-100 text-amber-900',
    red: 'bg-red-100 text-red-700',
    gray: 'bg-black/5 text-[#14201B]/50',
};

const TOKEN_FORMAT = /^[A-Za-z0-9]{8,64}$/;

async function fetchLists(): Promise<ListsCache> {
    const res = await fetch('/verify/snapshot', {
        headers: { Accept: 'application/json' },
    });

    if (!res.ok) throw new Error(`snapshot ${res.status}`);

    const data = (await res.json()) as {
        credentials?: Credential[];
        generated_at?: string;
    };

    return {
        credentials: Array.isArray(data.credentials) ? data.credentials : [],
        syncedAt:
            typeof data.generated_at === 'string'
                ? data.generated_at
                : new Date().toISOString(),
    };
}

/**
 * Local-first verdict — every branch is decided from the cached lists so the
 * exact same outcome works with no connection. Unknown states fail closed to
 * "not issued" until a sync brings the authoritative state to the device.
 */
function evaluate(
    token: string,
    lists: ListsCache,
    revocationAge: number | null,
    share: string[] | null = null,
): Verdict {
    const at = new Date().toISOString();

    if (!TOKEN_FORMAT.test(token)) {
        return {
            valid: false,
            title: 'Tampered',
            reason: "This code doesn't match the format IDENTRIQ issues — treat it as altered.",
            at,
        };
    }

    const cred = lists.credentials.find((c) => c.token === token);

    if (!cred) {
        return {
            valid: false,
            title: 'Not issued by IDENTRIQ',
            reason: 'No credential on this device matches this code.',
            at,
        };
    }

    if (cred.state === 'revoked') {
        return {
            valid: false,
            title: 'Revoked',
            reason: 'The holder reported this credential compromised; IDENTRIQ revoked it.',
            at,
        };
    }

    if (cred.state === 'suspended') {
        return {
            valid: false,
            title: 'Suspended',
            reason: 'Reported lost or stolen. A replacement is pending.',
            at,
        };
    }

    if (cred.state === 'pending' || cred.state === 'failed') {
        return {
            valid: false,
            title: 'Not issued by IDENTRIQ',
            reason:
                cred.state === 'pending'
                    ? 'The application is still in progress — no credential has been issued yet.'
                    : 'The application failed validation — no credential was issued.',
            at,
        };
    }

    if (cred.issued_at) {
        const expiry = new Date(cred.issued_at);

        if (!Number.isNaN(expiry.getTime())) {
            expiry.setFullYear(expiry.getFullYear() + 10);

            if (expiry.getTime() < Date.now()) {
                return {
                    valid: false,
                    title: 'Expired QR',
                    reason: 'This credential is past its 10-year validity window.',
                    at,
                };
            }
        }
    }

    const warning =
        revocationAge === null
            ? 'Revocations are not on this device yet — treat VALID as unconfirmed.'
            : revocationAge > 72
              ? 'Cannot confirm revocations (over 72 h old) — treat VALID as unconfirmed.'
              : revocationAge >= 24
                ? 'Revocations may be missing — this list is over 24 h old.'
                : undefined;

    // Scoped share (W5): only disclose what the holder's code carried. No
    // scope means the legacy full disclosure — name plus a masked ID.
    const showName = share === null || share.includes('name');
    const showFullId = share !== null && share.includes('id');
    const showMaskedId = share === null || share.includes('id_masked');

    return {
        valid: true,
        title: 'VALID',
        name: showName ? (cred.name ?? undefined) : undefined,
        id: showFullId
            ? (cred.biosure ?? undefined)
            : showMaskedId
              ? maskId(cred.biosure)
              : undefined,
        share: share ?? undefined,
        warning,
        at,
    };
}

export default function MVerifier() {
    const [input, setInput] = useState('');
    const [view, setView] = useState<'scan' | 'history'>('scan');
    const [filter, setFilter] = useState<HistoryFilter>('all');
    const [verdict, setVerdict] = useState<Verdict | null>(null);
    const [notice, setNotice] = useState('');
    const [syncNote, setSyncNote] = useState('');
    const [online, setOnline] = useState(() => navigator.onLine);
    const [lists, setLists] = useState<ListsCache | null>(loadLists);
    const [history, setHistory] = useState<HistoryEntry[]>(loadHistory);
    const [pending, setPending] = useState(() => loadOutbox().length);
    const [syncBusy, setSyncBusy] = useState(false);
    const [purpose, setPurpose] = useState<string>(() => {
        try {
            return localStorage.getItem('verify_purpose') ?? PURPOSES[0];
        } catch {
            return PURPOSES[0];
        }
    });
    const [ageOverride, setAgeOverride] = useState<number | null>(() => {
        const v = loadJson<unknown>('verify_revocation_age_override', null);

        return typeof v === 'number' ? v : null;
    });

    const trustAge = lists ? hoursSince(lists.syncedAt) : null;
    const revAge = ageOverride !== null ? ageOverride : trustAge;
    const revOverridden = ageOverride !== null;

    const historyPending = history.filter((entry) => !entry.synced).length;
    const filteredHistory = history.filter((entry) => {
        if (filter === 'valid') return entry.valid;
        if (filter === 'invalid') return !entry.valid;
        if (filter === 'pending') return !entry.synced;

        return true;
    });

    useEffect(() => {
        const goOnline = () => setOnline(true);
        const goOffline = () => setOnline(false);
        window.addEventListener('online', goOnline);
        window.addEventListener('offline', goOffline);

        // First run only: provision the device with lists while online.
        // Afterwards lists refresh ONLY on an explicit Sync press, so checks
        // stay honestly stale until the verifier chooses to sync.
        if (navigator.onLine && !loadLists()) {
            void fetchLists()
                .then((next) => {
                    saveLists(next);
                    setLists(next);
                })
                .catch(() => {});
        }

        return () => {
            window.removeEventListener('online', goOnline);
            window.removeEventListener('offline', goOffline);
        };
    }, []);

    function record(token: string, result: Verdict) {
        // A scope is audit metadata only for successful disclosures — an
        // invalid verdict never shared anything.
        const fields =
            result.valid && result.share?.length ? result.share : undefined;

        const entry: QueuedCheck = {
            token,
            result: result.valid ? 'valid' : 'invalid',
            at: result.at,
            purpose: result.purpose ?? purpose,
        };

        if (!result.valid) {
            entry.reason = result.title;
        }

        if (fields) {
            entry.fields = fields;
        }

        const outbox = [...loadOutbox(), entry];
        saveOutbox(outbox);
        setPending(outbox.length);

        const historyEntry: HistoryEntry = {
            id: historyId(),
            at: result.at,
            token,
            valid: result.valid,
            title: result.title,
            name: result.name,
            holderId: result.id,
            purpose: entry.purpose,
            share: fields,
            synced: false,
        };

        const nextHistory = [historyEntry, ...loadHistory()].slice(
            0,
            HISTORY_LIMIT,
        );
        saveHistory(nextHistory);
        setHistory(nextHistory);
    }

    function verify() {
        const { token, share } = parseScanned(input);

        if (!token) return;

        setNotice('');
        setSyncNote('');

        if (!lists) {
            setVerdict(null);
            setNotice(
                'No credential list on this device yet. While online, press Sync now once — after that, checks work with no connection.',
            );
            return;
        }

        const result: Verdict = {
            ...evaluate(token, lists, revAge, share),
            purpose,
        };
        setVerdict(result);
        record(token, result);
    }

    async function sync() {
        if (syncBusy) return;

        setSyncBusy(true);
        setSyncNote('');

        try {
            const events = loadOutbox();
            let pushed = 0;

            if (events.length > 0) {
                const res = await fetch('/verify/outbox/sync', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Accept: 'application/json',
                        'X-CSRF-TOKEN': csrfToken(),
                    },
                    body: JSON.stringify({ events }),
                });

                if (!res.ok) throw new Error(`sync ${res.status}`);

                const body = (await res.json()) as { synced?: number };
                pushed = body.synced ?? events.length;
                saveOutbox([]);
                setPending(0);

                // The server accepted the batch — flip the local audit log.
                const flushed = loadHistory().map((entry) =>
                    entry.synced ? entry : { ...entry, synced: true },
                );
                saveHistory(flushed);
                setHistory(flushed);
            }

            const next = await fetchLists();
            saveLists(next);
            setLists(next);
            setOnline(true);
            setSyncNote(
                pushed > 0
                    ? `Synced — ${pushed} queued check${pushed === 1 ? '' : 's'} sent, ${next.credentials.length} credentials on device.`
                    : `Synced — ${next.credentials.length} credential${next.credentials.length === 1 ? '' : 's'} on device.`,
            );
        } catch {
            setSyncNote("Couldn't sync — check your connection and try again.");
        } finally {
            setSyncBusy(false);
        }
    }

    function choosePurpose(p: string) {
        setPurpose(p);
        try {
            localStorage.setItem('verify_purpose', p);
        } catch {
            // Storage unavailable — the chip still applies to this session.
        }
    }

    function applyAgeOverride(value: number | null) {
        setAgeOverride(value);
        try {
            if (value === null) {
                localStorage.removeItem('verify_revocation_age_override');
            } else {
                localStorage.setItem(
                    'verify_revocation_age_override',
                    JSON.stringify(value),
                );
            }
        } catch {
            // Storage unavailable — the override still applies this session.
        }
    }

    function resetDevice() {
        try {
            localStorage.removeItem('verify_lists');
            localStorage.removeItem('verify_outbox');
            localStorage.removeItem('verify_history');
            localStorage.removeItem('verify_revocation_age_override');
        } catch {
            // Storage unavailable — state below still resets.
        }
        setLists(null);
        setPending(0);
        setHistory([]);
        setAgeOverride(null);
        setVerdict(null);
        setNotice(
            'Device lists, outbox and history cleared — press Sync now (while online) to provision again.',
        );
    }

    return (
        <MShell tab="verify">
            <p className="text-xs text-[#14201B]/50">
                {online
                    ? 'Online — press Sync now to refresh lists and send queued checks'
                    : 'OFFLINE — checks still work with the lists already on this device'}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[11px] font-medium">
                <span
                    className={`rounded-full px-2 py-1 ${TONE_CLASS[toneFor(trustAge)]}`}
                >
                    Trust {ageLabel(trustAge)}
                </span>
                <span
                    className={`rounded-full px-2 py-1 ${TONE_CLASS[toneFor(revAge)]}`}
                >
                    Revocations {ageLabel(revAge)}
                    {revOverridden ? ' (demo)' : ''}
                </span>
                <span
                    className={`rounded-full px-2 py-1 ${TONE_CLASS[pending > 0 ? 'amber' : 'gray']}`}
                >
                    {pending} queued
                </span>
            </div>

            <div className="mt-3 flex rounded-xl bg-[#14201B]/5 p-1">
                {VERIFIER_VIEWS.map((item) => (
                    <button
                        key={item.id}
                        type="button"
                        aria-current={view === item.id ? 'page' : undefined}
                        onClick={() => setView(item.id)}
                        className={`relative flex-1 rounded-lg px-2 py-2 text-xs font-semibold ${view === item.id ? 'bg-white shadow-sm' : 'text-[#14201B]/50'}`}
                    >
                        {item.label}
                        {item.id === 'history' && historyPending > 0 && (
                            <span className="absolute top-1.5 right-2 size-1.5 rounded-full bg-amber-500" />
                        )}
                    </button>
                ))}
            </div>

            <h1 className="mt-2 text-2xl font-bold">
                {view === 'scan' ? 'Scan credential' : 'Check history'}
            </h1>

            {view === 'scan' ? (
                <>
                    <div className="mt-3">
                        <p className="text-xs text-[#14201B]/50">
                            Purpose (recorded with every check)
                        </p>
                        <div className="mt-1 flex flex-wrap gap-1.5">
                            {PURPOSES.map((p) => (
                                <button
                                    key={p}
                                    type="button"
                                    onClick={() => choosePurpose(p)}
                                    className={`rounded-full px-3 py-1.5 text-xs font-semibold ${purpose === p ? 'bg-[#0E2A26] text-white' : 'bg-white text-[#14201B]/60 ring-1 ring-black/10'}`}
                                >
                                    {p}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="mt-3 rounded-2xl bg-[#0E2A26] p-5 text-white">
                        <Label className="text-white/70">
                            QR token or share code (camera scan stub — paste or
                            type)
                        </Label>
                        <Input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            className="mt-2 min-h-[48px] border-white/20 bg-white/10 font-mono text-white"
                            placeholder="token or token|share=…"
                        />
                        <label className="mt-3 block text-sm text-white/70">
                            …or upload a scan image (stub)
                            <Input
                                type="file"
                                accept="image/*"
                                capture="environment"
                                className="mt-1 border-white/20 bg-white/10 text-white"
                            />
                        </label>
                        <Button
                            onClick={verify}
                            disabled={!input.trim()}
                            className="mt-4 min-h-[52px] w-full bg-[#2FD6A3] text-lg font-bold text-[#0E2A26] hover:brightness-110 disabled:opacity-40"
                        >
                            Verify
                        </Button>
                    </div>

                    {verdict && (
                        <div
                            className={`mt-4 rounded-2xl p-6 ${verdict.valid ? 'bg-[#2FD6A3] text-[#0E2A26]' : 'bg-red-600 text-white'}`}
                        >
                            <p className="text-4xl font-black">
                                {verdict.valid ? 'VALID' : 'INVALID'}
                            </p>
                            {verdict.valid ? (
                                <>
                                    {verdict.name && (
                                        <p className="mt-1 font-semibold">
                                            {verdict.name}
                                        </p>
                                    )}
                                    {verdict.id && (
                                        <p className="font-mono text-sm">
                                            {verdict.id}
                                        </p>
                                    )}
                                    {verdict.share &&
                                        verdict.share.length > 0 && (
                                            <p className="mt-1 text-xs font-semibold opacity-80">
                                                Shared by holder:{' '}
                                                {describeFields(
                                                    verdict.share,
                                                ).join(' · ')}
                                            </p>
                                        )}
                                    <p className="mt-2 text-xs opacity-80">
                                        {verdict.purpose} · checked offline with
                                        local lists ·{' '}
                                        {new Date(
                                            verdict.at,
                                        ).toLocaleTimeString()}
                                    </p>
                                    {verdict.warning && (
                                        <p className="mt-3 rounded-xl bg-amber-100 p-2 text-xs font-medium text-amber-900">
                                            {verdict.warning}
                                        </p>
                                    )}
                                </>
                            ) : (
                                <>
                                    <p className="mt-1 font-semibold">
                                        {verdict.title}
                                    </p>
                                    {verdict.reason && (
                                        <p className="mt-1 text-sm opacity-90">
                                            {verdict.reason}
                                        </p>
                                    )}
                                    <p className="mt-2 text-xs opacity-80">
                                        Checked offline with local lists ·{' '}
                                        {new Date(
                                            verdict.at,
                                        ).toLocaleTimeString()}
                                    </p>
                                </>
                            )}
                        </div>
                    )}

                    {notice && (
                        <div className="mt-4 rounded-2xl bg-amber-100 p-4 text-sm text-amber-900">
                            {notice}
                        </div>
                    )}
                </>
            ) : (
                <div className="mt-3">
                    <div className="flex flex-wrap gap-1.5">
                        {HISTORY_FILTERS.map((item) => (
                            <button
                                key={item.id}
                                type="button"
                                onClick={() => setFilter(item.id)}
                                className={`rounded-full px-3 py-1.5 text-xs font-semibold ${filter === item.id ? 'bg-[#0E2A26] text-white' : 'bg-white text-[#14201B]/60 ring-1 ring-black/10'}`}
                            >
                                {item.label}
                            </button>
                        ))}
                    </div>
                    <p className="mt-2 text-xs text-[#14201B]/50">
                        {history.length === 0
                            ? 'No checks yet — verify a code on the Scan tab first.'
                            : `Kept on this device only · ${history.length} check${history.length === 1 ? '' : 's'}${historyPending > 0 ? ` · ${historyPending} pending sync` : ''}`}
                    </p>
                    <ul className="mt-2 space-y-2">
                        {filteredHistory.length === 0 ? (
                            <li className="rounded-2xl bg-white p-5 text-sm text-[#14201B]/50 shadow-sm">
                                No checks match this filter.
                            </li>
                        ) : (
                            filteredHistory.map((entry) => (
                                <li
                                    key={entry.id}
                                    className="rounded-2xl bg-white p-4 shadow-sm"
                                >
                                    <div className="flex items-baseline justify-between gap-2">
                                        <span
                                            className={`text-sm font-bold ${entry.valid ? 'text-[#0E6B52]' : 'text-red-700'}`}
                                        >
                                            {entry.valid
                                                ? 'VALID'
                                                : entry.title}
                                        </span>
                                        <span className="text-[11px] text-[#14201B]/45">
                                            {formatWhen(entry.at)}
                                        </span>
                                    </div>
                                    {entry.valid && entry.name && (
                                        <p className="mt-0.5 text-sm font-semibold">
                                            {entry.name}
                                        </p>
                                    )}
                                    {entry.valid && entry.holderId && (
                                        <p className="font-mono text-xs text-[#14201B]/70">
                                            {entry.holderId}
                                        </p>
                                    )}
                                    {entry.share && entry.share.length > 0 && (
                                        <p className="mt-1 text-xs text-[#14201B]/60">
                                            Shared:{' '}
                                            {describeFields(entry.share).join(
                                                ' · ',
                                            )}
                                        </p>
                                    )}
                                    <div className="mt-1.5 flex items-center justify-between gap-2">
                                        <span className="truncate text-[11px] text-[#14201B]/45">
                                            {entry.purpose} ·{' '}
                                            {shortToken(entry.token)}
                                        </span>
                                        <span
                                            className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ${entry.synced ? TONE_CLASS.green : TONE_CLASS.amber}`}
                                        >
                                            {entry.synced
                                                ? 'Synced'
                                                : 'Pending sync'}
                                        </span>
                                    </div>
                                </li>
                            ))
                        )}
                    </ul>
                </div>
            )}

            <div className="mt-4 rounded-2xl bg-white p-5 shadow-sm">
                <h2 className="font-semibold">Sync status</h2>
                <ul className="mt-2 space-y-1 text-sm">
                    <li className="flex items-center justify-between">
                        <span>Trust list</span>
                        <span
                            className={`rounded-full px-2 py-0.5 text-xs font-medium ${TONE_CLASS[toneFor(trustAge)]}`}
                        >
                            {ageLabel(trustAge)}
                        </span>
                    </li>
                    <li className="flex items-center justify-between">
                        <span>
                            Revocations
                            {revOverridden && (
                                <em className="text-[#14201B]/40">
                                    {' '}
                                    · demo override
                                </em>
                            )}
                        </span>
                        <span
                            className={`rounded-full px-2 py-0.5 text-xs font-medium ${TONE_CLASS[toneFor(revAge)]}`}
                        >
                            {ageLabel(revAge)}
                        </span>
                    </li>
                    <li className="flex items-center justify-between">
                        <span>Outbox</span>
                        <span className="text-xs text-[#14201B]/60">
                            {pending} check{pending === 1 ? '' : 's'} queued
                        </span>
                    </li>
                </ul>
                <p className="mt-3 text-xs text-[#14201B]/50">
                    Rules — under 24 h: green · 24–72 h: amber, revocations may
                    be missing · over 72 h: red, treat VALID as unconfirmed.
                </p>
                <Button
                    onClick={sync}
                    disabled={syncBusy}
                    className="mt-3 min-h-[48px] w-full bg-[#0E2A26] text-white hover:brightness-110 disabled:opacity-40"
                >
                    {syncBusy ? 'Syncing…' : 'Sync now'}
                </Button>
                {syncNote && (
                    <p className="mt-2 text-sm text-[#14201B]/70">{syncNote}</p>
                )}

                <div className="mt-4 border-t border-black/5 pt-3">
                    <p className="text-[11px] tracking-wide text-[#14201B]/40 uppercase">
                        Demo controls
                    </p>
                    <p className="mt-1 text-xs text-[#14201B]/50">
                        Simulate revocation age:
                    </p>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                        {[0, 30, 80].map((h) => (
                            <button
                                key={h}
                                type="button"
                                onClick={() => applyAgeOverride(h)}
                                className={`rounded-full px-3 py-1 text-xs font-semibold ${ageOverride === h ? 'bg-[#0E2A26] text-white' : 'bg-black/5 text-[#14201B]/60'}`}
                            >
                                {h} h
                            </button>
                        ))}
                        <button
                            type="button"
                            onClick={() => applyAgeOverride(null)}
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${ageOverride === null ? 'bg-[#0E2A26] text-white' : 'bg-black/5 text-[#14201B]/60'}`}
                        >
                            Real
                        </button>
                        <button
                            type="button"
                            onClick={resetDevice}
                            className="rounded-full px-3 py-1 text-xs font-semibold text-red-700 ring-1 ring-red-200"
                        >
                            Reset device
                        </button>
                    </div>
                </div>
            </div>
        </MShell>
    );
}
