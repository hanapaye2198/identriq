import { Link, router, usePage } from '@inertiajs/react';
import {
    Activity,
    Building2,
    CheckCircle2,
    CreditCard,
    ExternalLink,
    FileCheck,
    Layers,
    Shield,
    Sparkles,
    UserCheck,
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

export interface AdminStats {
    validating_count: number;
    approved_count: number;
    issued_count: number;
    centers_count: number;
    events_count: number;
}

interface AdminLayoutProps {
    children: React.ReactNode;
    title?: string;
    stats?: AdminStats;
    actions?: React.ReactNode;
}

export default function AdminLayout({
    children,
    title,
    stats = {
        validating_count: 0,
        approved_count: 0,
        issued_count: 0,
        centers_count: 0,
        events_count: 0,
    },
    actions,
}: AdminLayoutProps) {
    const { url } = usePage();
    const [advancing, setAdvancing] = useState(false);

    const isValidation = url.startsWith('/admin/validation');
    const isIssuance = url.startsWith('/admin/issuance');
    const isMaster = url.startsWith('/admin/master');
    const isAudit = url.startsWith('/admin/audit');

    const handleAdvance = () => {
        setAdvancing(true);
        router.post(
            '/admin/advance',
            {},
            {
                onFinish: () => setAdvancing(false),
            }
        );
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] text-[#0F2644]">
            {/* Top Tier: Sovereign Government Agency Masthead */}
            <div className="border-b border-white/10 bg-[#071324] px-4 py-1.5 text-xs text-white/75 sm:px-8">
                <div className="mx-auto flex max-w-7xl items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="flex size-4 items-center justify-center rounded-full bg-[#0052CC] text-[9px] font-bold text-white">
                            ★
                        </span>
                        <span className="font-semibold text-white">Independent State of Papua New Guinea</span>
                        <span className="text-white/30">·</span>
                        <span className="hidden sm:inline">National Civil Identity Operations Center</span>
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-white/60">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-2 py-0.5 font-medium text-emerald-400 border border-emerald-500/30">
                            <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                            Zero-Trust Enclave Active
                        </span>
                        <span className="hidden md:inline font-mono text-[10px] bg-white/10 px-1.5 py-0.5 rounded text-[#5EA4FF]">
                            CLEARANCE L3
                        </span>
                    </div>
                </div>
            </div>

            {/* Main Navigation Bar */}
            <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0B192C] px-4 py-3 text-white shadow-md sm:px-8">
                <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4">
                    {/* Brand Badge */}
                    <div className="flex items-center gap-3">
                        <Link href="/admin/validation" className="flex items-center gap-2.5 transition hover:opacity-90">
                            <div className="flex size-9 items-center justify-center rounded-xl bg-[#0052CC] font-bold text-white shadow-xs">
                                <Shield className="size-5" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="text-base font-black tracking-tight text-white">IDENTRIQ</span>
                                    <span className="rounded-md border border-[#0052CC]/50 bg-[#0052CC]/25 px-2 py-0.5 text-[10px] font-bold tracking-wider text-[#5EA4FF] uppercase">
                                        Admin Ops
                                    </span>
                                </div>
                                <p className="text-[10px] font-medium text-slate-400">Civil & Biometric Registry</p>
                            </div>
                        </Link>
                    </div>

                    {/* 4 Pillars Navigation Tabs */}
                    <nav className="flex items-center gap-1.5 overflow-x-auto rounded-xl bg-white/5 p-1 border border-white/10">
                        <Link
                            href="/admin/validation"
                            className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold transition ${
                                isValidation
                                    ? 'bg-[#0052CC] text-white shadow-xs'
                                    : 'text-slate-300 hover:bg-white/10 hover:text-white'
                            }`}
                        >
                            <FileCheck className="size-4" />
                            <span>Validation & ABIS</span>
                            {stats.validating_count > 0 && (
                                <span
                                    className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                                        isValidation ? 'bg-white text-[#0052CC]' : 'bg-[#0052CC] text-white'
                                    }`}
                                >
                                    {stats.validating_count}
                                </span>
                            )}
                        </Link>

                        <Link
                            href="/admin/issuance"
                            className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold transition ${
                                isIssuance
                                    ? 'bg-[#0052CC] text-white shadow-xs'
                                    : 'text-slate-300 hover:bg-white/10 hover:text-white'
                            }`}
                        >
                            <CreditCard className="size-4" />
                            <span>Issuance & Cards</span>
                            {stats.approved_count > 0 && (
                                <span
                                    className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                                        isIssuance ? 'bg-white text-[#0052CC]' : 'bg-emerald-500 text-white'
                                    }`}
                                >
                                    {stats.approved_count}
                                </span>
                            )}
                        </Link>

                        <Link
                            href="/admin/master"
                            className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold transition ${
                                isMaster
                                    ? 'bg-[#0052CC] text-white shadow-xs'
                                    : 'text-slate-300 hover:bg-white/10 hover:text-white'
                            }`}
                        >
                            <Building2 className="size-4" />
                            <span>Center Registry</span>
                            <span
                                className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                                    isMaster ? 'bg-white text-[#0052CC]' : 'bg-white/20 text-slate-300'
                                }`}
                            >
                                {stats.centers_count}
                            </span>
                        </Link>

                        <Link
                            href="/admin/audit"
                            className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold transition ${
                                isAudit
                                    ? 'bg-[#0052CC] text-white shadow-xs'
                                    : 'text-slate-300 hover:bg-white/10 hover:text-white'
                            }`}
                        >
                            <Activity className="size-4" />
                            <span>Audit & Funnel</span>
                        </Link>
                    </nav>

                    {/* Quick Sovereign Actions */}
                    <div className="flex items-center gap-2">
                        <Button
                            onClick={handleAdvance}
                            disabled={advancing}
                            size="sm"
                            className="h-9 gap-1.5 rounded-lg border border-white/20 bg-white/10 px-3 text-xs font-semibold text-white transition hover:bg-white/20 active:scale-95"
                            title="Auto-approve all cases that passed ABIS and have zero duplicate match candidates"
                        >
                            <Sparkles className="size-3.5 text-[#5EA4FF]" />
                            <span className="hidden sm:inline">Advance Clean</span>
                        </Button>

                        <Link
                            href="/staff"
                            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-white/20 bg-[#0052CC]/80 px-3 text-xs font-semibold text-white transition hover:bg-[#0052CC] active:scale-95"
                        >
                            <UserCheck className="size-3.5" />
                            <span className="hidden md:inline">Staff Desk</span>
                        </Link>

                        <Link
                            href="/"
                            className="inline-flex size-9 items-center justify-center rounded-lg border border-white/10 text-slate-400 hover:bg-white/10 hover:text-white transition"
                            title="Back to Public Portal"
                        >
                            <ExternalLink className="size-4" />
                        </Link>
                    </div>
                </div>
            </header>

            {/* Sub-header Bar (Title & Context Actions) */}
            {(title || actions) && (
                <div className="border-b border-slate-200 bg-white px-4 py-4 sm:px-8">
                    <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4">
                        {title && (
                            <div>
                                <h1 className="text-xl font-bold tracking-tight text-[#0F2644] sm:text-2xl">{title}</h1>
                                <p className="text-xs text-slate-500">
                                    Autonomous biometric validation, ABIS deduplication, and card personalization
                                </p>
                            </div>
                        )}
                        {actions && <div className="flex items-center gap-2.5">{actions}</div>}
                    </div>
                </div>
            )}

            {/* Main Page Workspace */}
            <main className="mx-auto max-w-7xl px-4 py-6 sm:px-8">{children}</main>
        </div>
    );
}
