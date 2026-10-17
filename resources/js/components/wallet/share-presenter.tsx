import { X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useGetQrSvgQuery } from '@/lib/api';
import { useAppSelector } from '@/lib/redux-hooks';
import { describeFields } from './share-scope';

interface SharePresenterProps {
    open: boolean;
    fields: string[];
    maskedId?: string | null;
    onClose: () => void;
}

interface WakeLockLike {
    release: () => Promise<void>;
}

const VALID_SECONDS = 60;

/**
 * W4 — full-screen presenter. The QR is valid for 60 seconds and rotates
 * automatically; a guarded Wake Lock keeps the screen on while presenting.
 */
export default function SharePresenter({
    open,
    fields,
    maskedId,
    onClose,
}: SharePresenterProps) {
    const token = useAppSelector((state) => state.wallet.token);
    const shareCode = fields.join(',');
    const { data, isFetching, refetch } = useGetQrSvgQuery(
        { fields: shareCode },
        { skip: !open || !token || shareCode.length === 0 },
    );
    const [secondsLeft, setSecondsLeft] = useState(VALID_SECONDS);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (!open) return;
        setSecondsLeft(VALID_SECONDS);
        setCopied(false);
        const timer = setInterval(
            () => setSecondsLeft((seconds) => Math.max(0, seconds - 1)),
            1000,
        );
        return () => clearInterval(timer);
    }, [open]);

    // Fetch a fresh code every time the presenter opens…
    useEffect(() => {
        if (open) void refetch();
    }, [open, refetch]);

    // …and rotate it when the 60 seconds run out.
    useEffect(() => {
        if (!open || secondsLeft > 0) return;
        void refetch();
        setSecondsLeft(VALID_SECONDS);
    }, [open, secondsLeft, refetch]);

    // Guarded Wake Lock — unsupported browsers simply continue without it.
    useEffect(() => {
        if (!open) return;
        const wakeLock = (
            navigator as Navigator & {
                wakeLock?: {
                    request: (type: 'screen') => Promise<WakeLockLike>;
                };
            }
        ).wakeLock;
        let sentinel: WakeLockLike | null = null;
        let cancelled = false;

        wakeLock
            ?.request('screen')
            .then((lock) => {
                if (cancelled) void lock.release();
                else sentinel = lock;
            })
            .catch(() => {
                // Denied or unsupported — the demo continues without it.
            });

        return () => {
            cancelled = true;
            void sentinel?.release();
        };
    }, [open]);

    useEffect(() => {
        if (!open) return;
        function onKey(event: KeyboardEvent) {
            if (event.key === 'Escape') onClose();
        }
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [open, onClose]);

    if (!open) return null;

    const svg = data?.svg ?? '';
    const pasteCode = token ? `${token}|share=${shareCode}` : '';
    const labels = describeFields(fields);

    async function copyCode() {
        try {
            await navigator.clipboard.writeText(pasteCode);
            setCopied(true);
        } catch {
            // Clipboard unavailable (insecure context) — the code stays on
            // screen for manual entry.
        }
    }

    return (
        <div
            className="fixed inset-0 z-50 overflow-y-auto bg-[#0E2A26] text-white"
            role="dialog"
            aria-label="Present ID QR code"
        >
            <div className="mx-auto flex min-h-dvh w-full max-w-[430px] flex-col px-5 py-6">
                <div className="flex items-start justify-between gap-3">
                    <div>
                        <p className="text-xs font-semibold tracking-widest text-white/50 uppercase">
                            Presenting ID
                        </p>
                        <p className="mt-0.5 text-sm text-white/80">
                            Refreshes in {secondsLeft}s — QR rotates every 60s
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close presenter"
                        className="flex size-10 items-center justify-center rounded-full bg-white/10"
                    >
                        <X className="size-5" />
                    </button>
                </div>

                <div className="mt-4 rounded-3xl bg-white p-4 text-[#14201B] shadow-2xl">
                    {svg ? (
                        <div
                            className="mx-auto max-w-[320px] [&_svg]:h-auto [&_svg]:w-full"
                            dangerouslySetInnerHTML={{ __html: svg }}
                        />
                    ) : (
                        <div className="mx-auto aspect-square max-w-[320px] animate-pulse rounded-2xl bg-black/5" />
                    )}
                    <div className="mt-3 flex items-center justify-center gap-2">
                        <span className="rounded-full bg-[#2FD6A3]/20 px-2.5 py-1 text-xs font-semibold text-[#0E6B52]">
                            Works offline
                        </span>
                        <span className="rounded-full bg-[#14201B]/5 px-2.5 py-1 text-xs font-semibold text-[#14201B]/60">
                            {isFetching
                                ? 'Refreshing…'
                                : `${secondsLeft}s left`}
                        </span>
                    </div>
                </div>

                <div className="mt-4 text-center">
                    <p className="text-sm font-semibold">
                        {labels.join(' · ') || '—'}
                    </p>
                    {maskedId && (
                        <p className="mt-1 font-mono text-sm tracking-[0.2em] text-white/70">
                            {maskedId}
                        </p>
                    )}
                    <p className="mt-2 text-xs text-white/50">
                        Screenshots expire — this QR rotates every 60 seconds.
                    </p>
                </div>

                <div className="mt-auto pt-6">
                    <p className="text-xs text-white/50">
                        No camera? Verifier types this code instead:
                    </p>
                    <div className="mt-1.5 flex items-center gap-2 rounded-xl bg-white/10 p-2.5">
                        <code className="min-w-0 flex-1 truncate font-mono text-xs text-white/90">
                            {pasteCode}
                        </code>
                        <button
                            type="button"
                            onClick={copyCode}
                            className="rounded-lg bg-white/15 px-3 py-1.5 text-xs font-semibold"
                        >
                            {copied ? 'Copied' : 'Copy'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
