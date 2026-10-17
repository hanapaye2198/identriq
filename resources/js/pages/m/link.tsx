import { router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import MShell from '@/components/m-shell';
import { setToken } from '@/lib/wallet-slice';
import { useAppDispatch, useAppSelector } from '@/lib/redux-hooks';

export default function MLink() {
    const dispatch = useAppDispatch();
    const token = useAppSelector((s) => s.wallet.token);
    const [mobile, setMobile] = useState('+675');
    const [otp, setOtp] = useState('');
    const [demoCode, setDemoCode] = useState<string | null>(null);
    const [error, setError] = useState('');

    async function sendCode() {
        setError('');
        const res = await fetch('/api/mobile/otp', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
            },
            body: JSON.stringify({ mobile }),
        });
        if (!res.ok) {
            setError('Unknown mobile number.');
            return;
        }
        setDemoCode((await res.json()).demo_code ?? null);
    }

    async function link() {
        setError('');
        const res = await fetch('/api/mobile/link', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
            },
            body: JSON.stringify({ mobile, otp }),
        });
        if (!res.ok) {
            setError('Incorrect or expired code.');
            return;
        }
        dispatch(setToken((await res.json()).token));
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
            <div className="mt-4 grid gap-3 rounded-2xl bg-white p-5 shadow-sm">
                <div>
                    <Label>Mobile number</Label>
                    <Input
                        value={mobile}
                        onChange={(e) => setMobile(e.target.value)}
                        inputMode="tel"
                        className="mt-1 min-h-[48px] font-mono"
                    />
                </div>
                <Button
                    onClick={sendCode}
                    variant="outline"
                    className="min-h-[48px]"
                >
                    Send code
                </Button>
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
                    <Input
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        maxLength={6}
                        inputMode="numeric"
                        className="mt-1 min-h-[48px] text-center font-mono text-xl tracking-widest"
                    />
                </div>
                {error && <p className="text-sm text-red-600">{error}</p>}
                <Button
                    onClick={link}
                    disabled={otp.length !== 6}
                    className="min-h-[48px] bg-[#2FD6A3] font-semibold text-[#0E2A26] hover:brightness-110 disabled:opacity-40"
                >
                    Open wallet
                </Button>
            </div>
        </MShell>
    );
}
