import { router } from '@inertiajs/react';
import { REGEXP_ONLY_DIGITS } from 'input-otp';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSeparator,
    InputOTPSlot,
} from '@/components/ui/input-otp';
import { Label } from '@/components/ui/label';
import MShell from '@/components/m-shell';
import { api } from '@/lib/api';
import { setToken } from '@/lib/wallet-slice';
import { useAppDispatch, useAppSelector } from '@/lib/redux-hooks';

/** Spec §2.1 — link by registered mobile number or appointment QR code. */
type LinkMode = 'mobile' | 'token';

const MODES: { id: LinkMode; label: string }[] = [
    { id: 'mobile', label: 'Mobile number' },
    { id: 'token', label: 'Appointment code' },
];

export default function MLink() {
    const dispatch = useAppDispatch();
    const token = useAppSelector((s) => s.wallet.token);
    const [mode, setMode] = useState<LinkMode>('mobile');
    const [mobile, setMobile] = useState('+675');
    const [appointmentCode, setAppointmentCode] = useState('');
    const [mobileHint, setMobileHint] = useState<string | null>(null);
    const [otp, setOtp] = useState('');
    const [demoCode, setDemoCode] = useState<string | null>(null);
    const [error, setError] = useState('');
    const [sending, setSending] = useState(false);
    const [cooldown, setCooldown] = useState(0);

    // Tick the resend cooldown down once per second (mobile spec §2.1: 60 s).
    useEffect(() => {
        if (cooldown <= 0) return;
        const timer = window.setTimeout(() => setCooldown(cooldown - 1), 1000);
        return () => window.clearTimeout(timer);
    }, [cooldown]);

    function switchMode(next: LinkMode) {
        if (next === mode) return;
        setMode(next);
        setError('');
        setMobileHint(null);
        setDemoCode(null);
        setOtp('');
    }

    /** The identifier half of a link request — mobile number or QR token. */
    function identifier() {
        return mode === 'mobile'
            ? { mobile }
            : { token: appointmentCode.trim() };
    }

    async function sendCode() {
        setError('');
        setSending(true);
        try {
            const res = await fetch('/api/mobile/otp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                body: JSON.stringify(identifier()),
            });
            if (!res.ok) {
                if (res.status === 429) {
                    setError(
                        'Too many attempts — wait a minute and try again.',
                    );
                } else {
                    setError(
                        mode === 'token'
                            ? "We couldn't find that appointment code."
                            : 'Unknown mobile number.',
                    );
                }
                return;
            }
            const body = (await res.json()) as {
                demo_code?: string | null;
                mobile_hint?: string | null;
            };
            setDemoCode(body.demo_code ?? null);
            setMobileHint(body.mobile_hint ?? null);
            setCooldown(60);
        } catch {
            setError(
                "Couldn't reach the server — check your connection and try again.",
            );
        } finally {
            setSending(false);
        }
    }

    async function link() {
        if (otp.length !== 6) return;
        setError('');
        const res = await fetch('/api/mobile/link', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
            },
            body: JSON.stringify({ ...identifier(), otp }),
        });
        if (!res.ok) {
            setError(
                res.status === 429
                    ? 'Too many attempts — wait a minute and try again.'
                    : 'Incorrect or expired code.',
            );
            return;
        }
        const body = (await res.json()) as { token?: string | null };
        // A fresh link means a fresh identity — drop cached API data so the
        // wallet never shows the previous citizen's card.
        dispatch(api.util.resetApiState());
        dispatch(setToken(body.token ?? null));
    }

    // Navigation is a side effect — run it after render, not during.
    useEffect(() => {
        if (token) {
            router.visit('/m/wallet');
        }
    }, [token]);

    if (token) {
        return null;
    }

    return (
        <MShell tab="wallet">
            <h1 className="text-2xl font-bold">Link your ID</h1>
            <p className="mt-1 text-sm text-[#14201B]/60">
                Sign in to your IDENTRIQ wallet.
            </p>
            <form
                className="mt-4 grid gap-3 rounded-2xl bg-white p-5 shadow-sm"
                onSubmit={(event) => {
                    // Enter submits the code — same as tapping "Open wallet".
                    event.preventDefault();
                    void link();
                }}
            >
                <div className="grid grid-cols-2 gap-1 rounded-xl bg-[#14201B]/5 p-1">
                    {MODES.map((item) => (
                        <button
                            key={item.id}
                            type="button"
                            onClick={() => switchMode(item.id)}
                            aria-pressed={mode === item.id}
                            className={`min-h-[44px] rounded-lg text-sm font-semibold transition ${
                                mode === item.id
                                    ? 'bg-white shadow-sm'
                                    : 'text-[#14201B]/60'
                            }`}
                        >
                            {item.label}
                        </button>
                    ))}
                </div>

                {mode === 'mobile' ? (
                    <div>
                        <Label>Mobile number</Label>
                        <Input
                            value={mobile}
                            onChange={(e) => setMobile(e.target.value)}
                            inputMode="tel"
                            className="mt-1 min-h-[48px] font-mono"
                        />
                    </div>
                ) : (
                    <div>
                        <Label>Appointment code</Label>
                        <Input
                            value={appointmentCode}
                            onChange={(e) => setAppointmentCode(e.target.value)}
                            placeholder="Paste the code or QR link"
                            className="mt-1 min-h-[48px] font-mono text-sm"
                        />
                        <p className="mt-1 text-xs text-[#14201B]/50">
                            Printed under the QR code on your pre-registration
                            confirmation.
                        </p>
                    </div>
                )}

                <Button
                    type="button"
                    onClick={() => void sendCode()}
                    disabled={
                        sending ||
                        cooldown > 0 ||
                        (mode === 'token' &&
                            appointmentCode.trim().length === 0)
                    }
                    variant="outline"
                    className="min-h-[48px]"
                >
                    {sending
                        ? 'Sending…'
                        : cooldown > 0
                          ? `Resend in ${cooldown}s`
                          : 'Send code'}
                </Button>

                {mobileHint && (
                    <p className="text-sm text-[#14201B]/70">
                        Code sent to{' '}
                        <strong className="font-mono">{mobileHint}</strong>
                    </p>
                )}

                {demoCode && (
                    <p className="rounded-lg bg-slate-100 p-3 text-sm">
                        Demo code:{' '}
                        <strong className="font-mono text-lg tracking-widest">
                            {demoCode}
                        </strong>
                    </p>
                )}

                <div>
                    <Label>6-digit code</Label>
                    <div className="mt-1 flex justify-center">
                        <InputOTP
                            maxLength={6}
                            value={otp}
                            onChange={setOtp}
                            pattern={REGEXP_ONLY_DIGITS}
                            inputMode="numeric"
                            aria-label="6-digit code"
                        >
                            <InputOTPGroup>
                                {[0, 1, 2].map((index) => (
                                    <InputOTPSlot
                                        key={index}
                                        index={index}
                                        className="size-11 text-lg"
                                    />
                                ))}
                            </InputOTPGroup>
                            <InputOTPSeparator />
                            <InputOTPGroup>
                                {[3, 4, 5].map((index) => (
                                    <InputOTPSlot
                                        key={index}
                                        index={index}
                                        className="size-11 text-lg"
                                    />
                                ))}
                            </InputOTPGroup>
                        </InputOTP>
                    </div>
                </div>

                {error && <p className="text-sm text-red-600">{error}</p>}

                <Button
                    type="submit"
                    disabled={otp.length !== 6}
                    className="min-h-[48px] bg-[#2FD6A3] font-semibold text-[#0E2A26] hover:brightness-110 disabled:opacity-40"
                >
                    Open wallet
                </Button>
            </form>
        </MShell>
    );
}
