import { router } from '@inertiajs/react';
import { Smartphone } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    api,
    useGetDevicesQuery,
    useRemoveDeviceMutation,
    useUnlinkMutation,
} from '@/lib/api';
import { useAppDispatch } from '@/lib/redux-hooks';
import { setToken } from '@/lib/wallet-slice';
import { formatDay } from './datetime';

const VERIFY_KEYS = [
    'verify_lists',
    'verify_purpose',
    'verify_revocation_age_override',
    'verify_outbox',
];

const LANGUAGES = [
    { id: 'en', label: 'English', note: 'Current' },
    { id: 'tpi', label: 'Tok Pisin', note: 'Preview' },
    { id: 'ho', label: 'Hiri Motu', note: 'Preview' },
];

/** W11 — languages, linked devices, privacy summary and demo reset. */
export default function SettingsView() {
    const dispatch = useAppDispatch();
    const { data, isLoading } = useGetDevicesQuery();
    const [removeDevice, removeState] = useRemoveDeviceMutation();
    const [unlink] = useUnlinkMutation();
    const [confirmDevice, setConfirmDevice] = useState<number | null>(null);
    const [confirmReset, setConfirmReset] = useState(false);
    const [language, setLanguage] = useState('en');
    const [notice, setNotice] = useState('');
    const [leaving, setLeaving] = useState(false);

    const devices = data?.devices ?? [];

    function leaveToLink() {
        dispatch(setToken(null));
        dispatch(api.util.resetApiState());
        router.visit('/m');
    }

    async function remove(id: number) {
        setNotice('');
        try {
            const result = await removeDevice(id).unwrap();
            setConfirmDevice(null);
            if (result.current) leaveToLink();
        } catch {
            setNotice('Could not remove that device — try again.');
        }
    }

    async function unlinkPhone() {
        if (leaving) return;
        setLeaving(true);
        // Fire-and-forget revoke: local sign-out proceeds even if offline.
        await unlink()
            .unwrap()
            .catch(() => {});
        leaveToLink();
    }

    async function resetDemo() {
        if (leaving) return;
        setLeaving(true);
        await unlink()
            .unwrap()
            .catch(() => {});
        VERIFY_KEYS.forEach((key) => localStorage.removeItem(key));
        localStorage.removeItem('wallet_notifications_seen_at');
        leaveToLink();
    }

    return (
        <div className="mt-4 space-y-4">
            <section className="rounded-2xl bg-white p-4 shadow-sm">
                <h2 className="font-semibold">Language</h2>
                <p className="mt-0.5 text-xs text-[#14201B]/50">
                    Demo build — the interface stays in English for now.
                </p>
                <ul className="mt-2 divide-y divide-black/5">
                    {LANGUAGES.map((option) => (
                        <li key={option.id}>
                            <button
                                type="button"
                                onClick={() => {
                                    setLanguage(option.id);
                                    setNotice(
                                        'Demo build: labels stay in English.',
                                    );
                                }}
                                className="flex min-h-[44px] w-full items-center justify-between"
                            >
                                <span className="text-sm">{option.label}</span>
                                <span className="flex items-center gap-2 text-xs text-[#14201B]/40">
                                    {option.note}
                                    {language === option.id && (
                                        <span className="size-2 rounded-full bg-[#0E2A26]" />
                                    )}
                                </span>
                            </button>
                        </li>
                    ))}
                </ul>
            </section>

            <section className="rounded-2xl bg-white p-4 shadow-sm">
                <h2 className="font-semibold">Linked devices</h2>
                <p className="mt-0.5 text-xs text-[#14201B]/50">
                    Phones that can open this wallet. Remove any you don't
                    recognise.
                </p>
                {isLoading ? (
                    <p className="mt-3 text-sm text-[#14201B]/50">Loading…</p>
                ) : devices.length === 0 ? (
                    <p className="mt-3 text-sm text-[#14201B]/50">
                        No linked devices.
                    </p>
                ) : (
                    <ul className="mt-2 divide-y divide-black/5">
                        {devices.map((device) => (
                            <li
                                key={device.id}
                                className="flex items-center gap-3 py-3"
                            >
                                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#0E2A26]/10">
                                    <Smartphone className="size-4" />
                                </span>
                                <span className="min-w-0 flex-1">
                                    <span className="block truncate text-sm font-semibold">
                                        {device.name ?? 'Wallet device'}
                                        {device.current ? ' · this phone' : ''}
                                    </span>
                                    <span className="block text-xs text-[#14201B]/50">
                                        Added {formatDay(device.created_at)} ·
                                        last used{' '}
                                        {device.last_used_at
                                            ? formatDay(device.last_used_at)
                                            : 'never'}
                                    </span>
                                </span>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="min-h-[36px] text-xs"
                                    disabled={removeState.isLoading || leaving}
                                    onClick={() =>
                                        confirmDevice === device.id
                                            ? void remove(device.id)
                                            : setConfirmDevice(device.id)
                                    }
                                >
                                    {confirmDevice === device.id
                                        ? 'Confirm'
                                        : 'Remove'}
                                </Button>
                            </li>
                        ))}
                    </ul>
                )}
            </section>

            <section className="rounded-2xl bg-white p-4 shadow-sm">
                <h2 className="font-semibold">Privacy</h2>
                <ul className="mt-2 space-y-2 text-sm text-[#14201B]/70">
                    <li>· Your ID stays on this phone until you present it.</li>
                    <li>
                        · Every share asks you first — nothing is shared
                        silently.
                    </li>
                    <li>
                        · Checks and consent decisions are logged in Activity.
                    </li>
                    <li>
                        · Losing the phone? Report it lost on the home screen to
                        suspend the credential.
                    </li>
                </ul>
            </section>

            <section className="rounded-2xl bg-white p-4 shadow-sm">
                <h2 className="font-semibold">Demo data</h2>
                <p className="mt-0.5 text-xs text-[#14201B]/50">
                    Clears the wallet link, verifier lists and outbox stored in
                    this browser.
                </p>
                <div className="mt-3 space-y-2">
                    <Button
                        type="button"
                        variant="outline"
                        className="min-h-[44px] w-full text-sm"
                        disabled={leaving}
                        onClick={() => void unlinkPhone()}
                    >
                        Unlink this phone
                    </Button>
                    <Button
                        type="button"
                        onClick={() =>
                            confirmReset
                                ? void resetDemo()
                                : setConfirmReset(true)
                        }
                        disabled={leaving}
                        className={`min-h-[44px] w-full text-sm font-semibold ${
                            confirmReset
                                ? 'bg-[#B4232A] text-white hover:bg-[#B4232A]/90'
                                : 'bg-[#14201B]/10 text-[#14201B] hover:bg-[#14201B]/15'
                        }`}
                    >
                        {confirmReset
                            ? 'Tap again to reset everything'
                            : 'Reset demo data on this device'}
                    </Button>
                </div>
                <p className="mt-3 text-[11px] text-[#14201B]/40">
                    IDENTRIQ demo · simulated data only
                </p>
            </section>

            {notice && (
                <p className="rounded-xl bg-[#14201B]/5 px-3 py-2 text-xs text-[#14201B]/60">
                    {notice}
                </p>
            )}
        </div>
    );
}
