import { Link, usePage } from '@inertiajs/react';
import {
    AlertTriangle,
    ChevronLeft,
    ChevronRight,
    ExternalLink,
    MapPin,
    QrCode,
    Settings,
    ShieldCheck,
    Users,
} from 'lucide-react';
import { useState } from 'react';

export interface StaffStats {
    today_count: number;
    checked_in_count: number;
    rework_count: number;
    total_active: number;
}

interface StaffLayoutProps {
    children: React.ReactNode;
    title?: string;
    stats?: StaffStats;
    currentCenterName?: string;
    onOpenWalkin?: () => void;
}

export default function StaffLayout({
    children,
    stats = { today_count: 0, checked_in_count: 0, rework_count: 0, total_active: 0 },
    currentCenterName = 'Waigani Registration Center',
    onOpenWalkin,
}: StaffLayoutProps) {
    const { url } = usePage();
    const [collapsed, setCollapsed] = useState(false);

    const isQueue = url.startsWith('/staff') && !url.startsWith('/staff/rework') && !url.startsWith('/staff/setup') && !url.startsWith('/staff/capture');
    const isRework = url.startsWith('/staff/rework');
    const isSetup = url.startsWith('/staff/setup');
    const isCapture = url.startsWith('/staff/capture');

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
                            isQueue && !isRework
                                ? 'bg-[#0052CC] text-white shadow-xs'
                                : 'text-slate-700 hover:bg-slate-100 hover:text-[#0052CC]'
                        }`}
                        title="Live Enrolment Queue"
                    >
                        <div className="flex items-center gap-3">
                            <Users className={`size-4.5 shrink-0 ${isQueue && !isRework ? 'text-white' : 'text-slate-500 group-hover:text-[#0052CC]'}`} />
                            {!collapsed && <span>Live Queue</span>}
                        </div>
                        {!collapsed && stats.today_count > 0 && (
                            <span
                                className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                                    isQueue && !isRework ? 'bg-white/20 text-white' : 'bg-blue-50 text-[#0052CC]'
                                }`}
                            >
                                {stats.today_count}
                            </span>
                        )}
                    </Link>

                    <Link
                        href="/staff/rework"
                        className={`group flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                            isRework
                                ? 'bg-amber-600 text-white shadow-xs'
                                : 'text-slate-700 hover:bg-slate-100 hover:text-amber-700'
                        }`}
                        title="Rework Queue"
                    >
                        <div className="flex items-center gap-3">
                            <AlertTriangle className={`size-4.5 shrink-0 ${isRework ? 'text-white' : 'text-slate-500 group-hover:text-amber-600'}`} />
                            {!collapsed && <span>Rework Desk</span>}
                        </div>
                        {!collapsed && stats.rework_count > 0 && (
                            <span
                                className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                                    isRework ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-800'
                                }`}
                            >
                                {stats.rework_count}
                            </span>
                        )}
                    </Link>

                    {isCapture && (
                        <div
                            className="flex items-center gap-3 rounded-xl bg-blue-50 px-3 py-2.5 text-sm font-semibold text-[#0052CC]"
                            title="Active Capture Session"
                        >
                            <QrCode className="size-4.5 shrink-0 text-[#0052CC]" />
                            {!collapsed && <span>Live Capture</span>}
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

                {/* Walk-in Call to Action in Sidebar */}
                {onOpenWalkin && !collapsed && (
                    <div className="p-3">
                        <button
                            type="button"
                            onClick={onOpenWalkin}
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
        </div>
    );
}
