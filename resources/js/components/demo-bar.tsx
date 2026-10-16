import { useState } from 'react';
import { router } from '@inertiajs/react';
import { setRole, type DemoRole } from '@/lib/demo-slice';
import { useAppDispatch, useAppSelector } from '@/lib/redux-hooks';

const ROLES: { role: DemoRole; home: string }[] = [
    { role: 'guest', home: '/' },
    { role: 'staff', home: '/staff' },
    { role: 'admin', home: '/admin/validation' },
    { role: 'verifier', home: '/verify/offline' },
];

function csrfToken(): string {
    return (
        document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')
            ?.content ?? ''
    );
}

export default function DemoBar() {
    const dispatch = useAppDispatch();
    const role = useAppSelector((s) => s.demo.role);
    const [resetting, setResetting] = useState(false);

    async function resetDemo() {
        if (resetting || !window.confirm('Reset demo data to seeds?')) return;
        setResetting(true);
        try {
            await fetch('/demo/reset', {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': csrfToken(),
                    Accept: 'application/json',
                },
            });
            window.location.reload();
        } finally {
            setResetting(false);
        }
    }

    return (
        <div className="flex h-9 items-center gap-2 bg-[#0A1C1A] px-3 text-[11px] font-medium text-white/75">
            <span className="inline-block size-2 animate-pulse rounded-full bg-amber-400" />
            <span>Demo mode · integrations simulated</span>
            <span className="mx-1 text-white/25">|</span>
            <div className="flex items-center gap-1">
                {ROLES.map(({ role: r, home }) => (
                    <button
                        key={r}
                        type="button"
                        onClick={() => {
                            dispatch(setRole(r));
                            router.visit(home);
                        }}
                        className={`rounded-full px-2 py-0.5 capitalize ${
                            role === r
                                ? 'bg-[#2FD6A3] text-[#0E2A26]'
                                : 'text-white/60 hover:text-white'
                        }`}
                    >
                        {r}
                    </button>
                ))}
            </div>
            <button
                type="button"
                onClick={resetDemo}
                disabled={resetting}
                className="ml-auto rounded px-2 py-0.5 text-white/60 hover:text-white disabled:opacity-50"
            >
                {resetting ? 'Resetting…' : 'Reset demo'}
            </button>
        </div>
    );
}
