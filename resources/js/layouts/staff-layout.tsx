import { Link, router, usePage } from '@inertiajs/react';
import {
    AlertTriangle,
    ChevronLeft,
    ChevronRight,
    ExternalLink,
    MapPin,
    Settings,
    ShieldCheck,
    UserCheck,
    Users,
    X,
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export interface StaffStats {
    today_count: number;
    checked_in_count: number;
    rework_count: number;
    total_active: number;
}

interface WalkinCenter {
    id: number;
    name: string;
}

interface StaffLayoutProps {
    children: React.ReactNode;
    stats?: StaffStats;
    currentCenterName?: string;
    centers?: WalkinCenter[];
}

export default function StaffLayout({
    children,
    stats = { today_count: 0, checked_in_count: 0, rework_count: 0, total_active: 0 },
    currentCenterName = 'Waigani Registration Center',
    centers = [],
}: StaffLayoutProps) {
    const { url } = usePage();
    const [collapsed, setCollapsed] = useState(false);

    // Walk-in intake lives in the layout so the action is identical on every staff page.
    const [showWalkin, setShowWalkin] = useState(false);
    const [wName, setWName] = useState('');
    const [wMobile, setWMobile] = useState('+675');
    const [wCenter, setWCenter] = useState(centers[0]?.id ?? 1);
    const [walkinError, setWalkinError] = useState<string | null>(null);

    const isQueue = url.startsWith('/staff') && !url.startsWith('/staff/setup');
    const isCapture = url.startsWith('/staff/capture');
    const isSetup = url.startsWith('/staff/setup');

    function openWalkin() {
        const preferred = centers.find((c) => c.name === currentCenterName) ?? centers[0];
        setWCenter(preferred?.id ?? 1);
        setWalkinError(null);
        setShowWalkin(true);
    }

    function submitWalkin(e: React.FormEvent) {
        e.preventDefault();
        setWalkinError(null);

        // Normalize mobile
        let mobile = wMobile.trim();
        if (!mobile.startsWith('+675') && /^\d{7}$/.test(mobile)) {
            mobile = '+675' + mobile;
        }

        if (!wName.trim()) {
            setWalkinError('Please enter applicant full name.');
            return;
        }
        if (!/^\+675\d{7}$/.test(mobile)) {
            setWalkinError('Mobile must be in PNG format (+675 followed by 7 digits, e.g. +6757123456).');
            return;
        }

        router.post(
            '/staff/walkin',
            {
                full_name: wName.trim(),
                mobile: mobile,
                center_id: wCenter,
            },
            {
                onError: (errors) => {
                    const first = Object.values(errors)[0];
                    setWalkinError(typeof first === 'string' ? first : 'Walk-in registration failed.');
                },
                onSuccess: () => {
                    setShowWalkin(false);
                    setWName('');
                    setWMobile('+675');
                },
            }
        );
    }

    return (
        <div className="flex min-h-screen bg-[#F4F6F9] text-[#0F2644]">
            {/* Sidebar */}
            <aside
                className={`sticky top-0 z-40 flex h-screen shrink-0 flex-col border-r border-slate-200 bg-white transition-all duration-300 ${
                    collapsed ? 'w-20' : 'w-68'
                }`}
            >
                {/* Brand Header */}
                <div className="flex h-16 items-center justify-between border-b border-slate-200 px-4">
                    {!collapsed && (
                        <div className="flex items-center gap-3 overflow-hidden">
                            <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#0052CC] font-bold text-white shadow-xs">
                                IQ
                            </div>
                            <div className="truncate">
                                <h2 className="text-sm font-bold tracking-tight text-[#0F2644]">IDENTRIQ STAFF</h2>
                                <p className="text-[11px] font-medium text-slate-500">Biometric Desk Station</p>
                            </div>
                        </div>
                    )}
                    {collapsed && (
                        <div className="mx-auto flex size-9 items-center justify-center rounded-xl bg-[#0052CC] font-bold text-white shadow-xs">
                            IQ
                        </div>
                    )}
                    <button
                        type="button"
                        onClick={() => setCollapsed(!collapsed)}
                        className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                    >
                        {collapsed ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}
                    </button>
                </div>

                {/* Active Center Indicator */}
                {!collapsed && (
                    <div className="border-b border-slate-100 bg-[#F8FAFC] p-3.5">
                        <div className="flex items-center gap-2 text-xs font-semibold text-[#0052CC]">
                            <MapPin className="size-3.5 shrink-0" />
                            <span className="truncate">{currentCenterName}</span>
                        </div>
                        <div className="mt-1 flex items-center gap-1.5">
                            <span className="inline-block size-2 rounded-full bg-emerald-500 ring-2 ring-emerald-500/20" />
                            <span className="text-[11px] font-medium text-slate-500">Station Active · Counter 01</span>
                        </div>
                    </div>
                )}

                {/* Navigation Links */}
                <nav className="flex-1 space-y-1 overflow-y-auto p-3">
                    <Link
                        href="/staff"
                        className={`group flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                            isQueue
                                ? 'bg-[#0052CC] text-white shadow-xs'
                                : 'text-slate-700 hover:bg-slate-100 hover:text-[#0052CC]'
                        }`}
                        title="Live Enrolment Queue"
                    >
                        <div className="flex items-center gap-3">
                            <Users className={`size-4.5 shrink-0 ${isQueue ? 'text-white' : 'text-slate-500 group-hover:text-[#0052CC]'}`} />
                            {!collapsed && <span>Live Queue</span>}
                        </div>
                        {!collapsed && (stats.today_count > 0 || stats.rework_count > 0) && (
                            <span className="flex items-center gap-1">
                                {stats.rework_count > 0 && (
                                    <span
                                        className={`flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-bold ${
                                            isQueue ? 'bg-amber-400/25 text-amber-50' : 'bg-amber-100 text-amber-800'
                                        }`}
                                        title={`${stats.rework_count} flagged for rework`}
                                    >
                                        <AlertTriangle className="size-3" />
                                        {stats.rework_count}
                                    </span>
                                )}
                                {stats.today_count > 0 && (
                                    <span
                                        className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                                            isQueue ? 'bg-white/20 text-white' : 'bg-blue-50 text-[#0052CC]'
                                        }`}
                                    >
                                        {stats.today_count}
                                    </span>
                                )}
                            </span>
                        )}
                    </Link>

                    {/* Live Capture is a sub-state of the queue — not a separate destination. */}
                    {isCapture && !collapsed && (
                        <div className="ml-5 flex items-center gap-2 border-l-2 border-[#0052CC]/25 py-1.5 pl-3 text-xs font-semibold text-[#0052CC]">
                            <span className="relative flex size-2">
                                <span className="absolute inline-flex size-full animate-ping rounded-full bg-[#0052CC] opacity-60" />
                                <span className="relative inline-flex size-2 rounded-full bg-[#0052CC]" />
                            </span>
                            <span>Capture in progress…</span>
                        </div>
                    )}

                    <Link
                        href="/staff/setup"
                        className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                            isSetup
                                ? 'bg-[#0052CC] text-white shadow-xs'
                                : 'text-slate-700 hover:bg-slate-100 hover:text-[#0052CC]'
                        }`}
                        title="Center Capacity & Operations"
                    >
                        <Settings className={`size-4.5 shrink-0 ${isSetup ? 'text-white' : 'text-slate-500 group-hover:text-[#0052CC]'}`} />
                        {!collapsed && <span>Center Setup</span>}
                    </Link>

                    <Link
                        href="/verify/offline"
                        className="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-[#0052CC]"
                        title="Offline Check-In / Token Verifier"
                    >
                        <ShieldCheck className="size-4.5 shrink-0 text-slate-500 group-hover:text-[#0052CC]" />
                        {!collapsed && <span>Offline Verifier</span>}
                    </Link>
                </nav>

                {/* Walk-in Citizen — always available while a desk counter is selected */}
                {centers.length > 0 && !collapsed && (
                    <div className="p-3">
                        <button
                            type="button"
                            onClick={openWalkin}
                            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0052CC] px-4 py-2.5 text-sm font-semibold text-white shadow-xs transition hover:bg-[#0047B3] active:scale-[0.99]"
                        >
                            <span>+ Walk-in Citizen</span>
                        </button>
                    </div>
                )}

                {/* Bottom Footer Info */}
                <div className="border-t border-slate-200 p-3 text-xs text-slate-500">
                    {!collapsed && (
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Link
                                    href="/track"
                                    className="inline-flex items-center gap-1 font-medium text-slate-600 hover:text-[#0052CC]"
                                >
                                    <span>Track Portal</span>
                                    <ExternalLink className="size-3" />
                                </Link>
                                <Link
                                    href="/"
                                    className="inline-flex items-center gap-1 font-medium text-slate-600 hover:text-[#0052CC]"
                                >
                                    <span>Home</span>
                                    <ExternalLink className="size-3" />
                                </Link>
                            </div>
                            <p className="text-[10px] text-slate-400">IDENTRIQ Civic Biometrics v1.0</p>
                        </div>
                    )}
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto">
                {children}
            </main>

            {/* Walk-in Citizen Modal — owned by the layout, available on every staff page */}
            {showWalkin && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
                    <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                            <div>
                                <h3 className="text-lg font-bold text-[#0F2644]">Walk-In Citizen Intake</h3>
                                <p className="text-xs text-slate-500">Register an unscheduled citizen at this desk counter.</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowWalkin(false)}
                                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                            >
                                <X className="size-4.5" />
                            </button>
                        </div>

                        {walkinError && (
                            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-700">
                                {walkinError}
                            </div>
                        )}

                        <form onSubmit={submitWalkin} className="mt-4 space-y-4">
                            <div>
                                <Label className="text-xs font-semibold text-[#0F2644]">Citizen Full Name</Label>
                                <Input
                                    value={wName}
                                    onChange={(e) => setWName(e.target.value)}
                                    placeholder="e.g. John Kila"
                                    className="mt-1 h-11 border-slate-300 font-medium text-sm"
                                    required
                                />
                            </div>

                            <div>
                                <Label className="text-xs font-semibold text-[#0F2644]">
                                    Mobile Number <span className="text-slate-400">(PNG 7-digit)</span>
                                </Label>
                                <div className="mt-1 flex items-center gap-2">
                                    <Input
                                        value={wMobile}
                                        onChange={(e) => setWMobile(e.target.value)}
                                        placeholder="+6757123456"
                                        className="h-11 border-slate-300 font-mono text-sm"
                                        required
                                    />
                                </div>
                                <p className="mt-1 text-[11px] text-slate-500">
                                    Format: +675 followed by 7 digits (e.g., +6757123456).
                                </p>
                            </div>

                            <div>
                                <Label className="text-xs font-semibold text-[#0F2644]">Desk Counter Center</Label>
                                <select
                                    value={wCenter}
                                    onChange={(e) => setWCenter(Number(e.target.value))}
                                    className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm font-medium text-[#0F2644]"
                                >
                                    {centers.map((c) => (
                                        <option key={c.id} value={c.id}>
                                            {c.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-3">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setShowWalkin(false)}
                                    className="h-11 border-slate-300 font-semibold text-slate-700 hover:bg-slate-50"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    className="h-11 gap-2 rounded-xl bg-[#0052CC] px-6 font-semibold text-white shadow-xs hover:bg-[#0047B3]"
                                >
                                    <UserCheck className="size-4" />
                                    <span>Check In &amp; Proceed →</span>
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
