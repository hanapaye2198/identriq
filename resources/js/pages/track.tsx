import { Head, Link, router } from '@inertiajs/react';
import {
    Activity,
    AlertCircle,
    ArrowLeft,
    Calendar,
    Check,
    CheckCircle2,
    Clock,
    Copy,
    CreditCard,
    ExternalLink,
    FileCheck,
    FileText,
    Fingerprint,
    Loader2,
    MapPin,
    Phone,
    Printer,
    QrCode,
    RefreshCw,
    Search,
    Shield,
    ShieldAlert,
    ShieldCheck,
    Sparkles,
    Truck,
    User,
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface TimelineItem {
    stage: string;
    at: string | null;
    done: boolean;
}

interface Result {
    registrant: {
        id?: number;
        mobile: string;
        status: string;
        created_at?: string;
        demographic?: {
            full_name?: string;
            date_of_birth?: string;
            gender?: string;
            province?: string;
            district?: string;
        } | null;
        appointments: {
            id?: number;
            slot_at: string;
            status: string;
            qr_token?: string;
            center?: {
                id?: number;
                name: string;
                province?: string;
                location?: string;
            };
        }[];
        identity?: {
            id?: number;
            biosure_id_number: string | null;
            status: string;
            card_personalized_at?: string | null;
            delivered_at?: string | null;
            delivered_channel?: string | null;
        } | null;
        notifications: {
            title: string;
            body: string;
            sent_at: string | null;
        }[];
    };
    timeline: TimelineItem[];
}

interface TrackProps {
    result: Result | null;
}

export default function Track({ result }: TrackProps) {
    const [lookupMode, setLookupMode] = useState<'mobile' | 'token'>('mobile');
    const [mobile, setMobile] = useState('');
    const [qrToken, setQrToken] = useState('');
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState(false);
    const [lookupError, setLookupError] = useState<string | null>(null);

    const handleLookup = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        setLookupError(null);

        const payload: { mobile?: string; qr_token?: string } = {};
        if (lookupMode === 'mobile') {
            if (!mobile.trim()) {
                setLookupError('Please enter your registered mobile number.');
                return;
            }
            payload.mobile = mobile.trim();
        } else {
            if (!qrToken.trim()) {
                setLookupError('Please enter your appointment QR token or BioSure ID.');
                return;
            }
            payload.qr_token = qrToken.trim();
        }

        setLoading(true);
        router.post('/track/lookup', payload, {
            preserveScroll: true,
            onError: (errors) => {
                setLoading(false);
                setLookupError(
                    errors.lookup ||
                        'No registration record found matching your query. Please double check the details and try again.'
                );
            },
            onFinish: () => setLoading(false),
        });
    };

    const handleCopyId = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // Helper to calculate stage progress
    const stages = [
        {
            key: 'registered',
            label: 'Application Received',
            shortDesc: 'Pre-registration submitted online',
            icon: FileCheck,
        },
        {
            key: 'validating',
            label: 'Biometric Enrollment',
            shortDesc: 'Fingerprints, face & iris captured',
            icon: Fingerprint,
        },
        {
            key: 'approved',
            label: 'ABIS Clearance',
            shortDesc: 'Automated deduplication verified',
            icon: ShieldCheck,
        },
        {
            key: 'personalized',
            label: 'Smart Card Personalized',
            shortDesc: 'Laser-engraved with secure chip',
            icon: CreditCard,
        },
        {
            key: 'delivered',
            label: 'In Citizen Possession',
            shortDesc: 'Dispatched & verified active',
            icon: Truck,
        },
    ];

    // Find current active stage index
    const timeline = result?.timeline || [];
    let completedCount = 0;
    timeline.forEach((t) => {
        if (t.done) completedCount++;
    });

    const isFailed = result?.registrant?.status === 'failed' || result?.registrant?.identity?.status === 'failed';
    const isRework = result?.registrant?.status === 'rework';
    const progressPercent = Math.min(Math.round((completedCount / stages.length) * 100), 100);

    // Get current appointment if any
    const latestAppointment = result?.registrant?.appointments?.[0];
    const biosureId = result?.registrant?.identity?.biosure_id_number;
    const citizenName = result?.registrant?.demographic?.full_name || 'Registered Citizen';

    return (
        <div className="min-h-screen bg-[#F8FAFC] text-[#0F2644]">
            <Head title="Track Application Status · IDENTRIQ" />

            {/* Sovereign Masthead */}
            <header className="border-b border-white/10 bg-[#071324] px-4 py-2 text-xs text-white/75 sm:px-8">
                <div className="mx-auto flex max-w-5xl items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="flex size-4 items-center justify-center rounded-full bg-[#0052CC] text-[9px] font-bold text-white">
                            ★
                        </span>
                        <span className="font-semibold text-white">Independent State of Papua New Guinea</span>
                        <span className="text-white/30">·</span>
                        <span className="hidden sm:inline">National Civil Identity Operations Center</span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-[#5EA4FF]">
                        <Shield className="size-3.5" />
                        <span>BioSure Verification Gateway</span>
                    </div>
                </div>
            </header>

            {/* Sub-header Navigation */}
            <div className="border-b border-slate-200 bg-white px-4 py-4 sm:px-8">
                <div className="mx-auto flex max-w-5xl items-center justify-between">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 transition hover:text-[#0052CC]"
                    >
                        <ArrowLeft className="size-3.5" />
                        <span>Return to National Portal</span>
                    </Link>

                    <div className="flex items-center gap-3">
                        <Link
                            href="/centers"
                            className="text-xs font-semibold text-slate-600 hover:text-[#0052CC] transition"
                        >
                            Find Enrollment Centers
                        </Link>
                        <span className="text-slate-300">·</span>
                        <Link
                            href="/prereg"
                            className="text-xs font-bold text-[#0052CC] hover:underline"
                        >
                            New Pre-Registration
                        </Link>
                    </div>
                </div>
            </div>

            <main className="mx-auto max-w-5xl px-4 py-8 sm:px-8">
                {/* Search / Lookup Box */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
                    <div className="max-w-xl">
                        <div className="inline-flex items-center gap-2 rounded-full bg-[#0052CC]/10 px-3 py-1 text-xs font-bold text-[#0052CC]">
                            <Search className="size-3.5" />
                            <span>National Identity Tracking</span>
                        </div>
                        <h1 className="mt-2 text-2xl font-black tracking-tight text-[#0F2644] sm:text-3xl">
                            Track Your Application Status
                        </h1>
                        <p className="mt-1 text-xs text-slate-500">
                            Check real-time progress of your civil registration, ABIS biometric verification, and BioSure ID smart card delivery.
                        </p>
                    </div>

                    {/* Mode Tabs */}
                    <div className="mt-6 flex max-w-md items-center rounded-xl bg-slate-100 p-1 border border-slate-200">
                        <button
                            type="button"
                            onClick={() => {
                                setLookupMode('mobile');
                                setLookupError(null);
                            }}
                            className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2 text-xs font-bold transition cursor-pointer ${
                                lookupMode === 'mobile'
                                    ? 'bg-white text-[#0052CC] shadow-xs'
                                    : 'text-slate-600 hover:text-slate-900'
                            }`}
                        >
                            <Phone className="size-3.5" />
                            <span>Registered Mobile</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setLookupMode('token');
                                setLookupError(null);
                            }}
                            className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2 text-xs font-bold transition cursor-pointer ${
                                lookupMode === 'token'
                                    ? 'bg-white text-[#0052CC] shadow-xs'
                                    : 'text-slate-600 hover:text-slate-900'
                            }`}
                        >
                            <QrCode className="size-3.5" />
                            <span>Appointment QR / ID</span>
                        </button>
                    </div>

                    {/* Form Input */}
                    <form onSubmit={handleLookup} className="mt-4">
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 max-w-xl">
                            <div className="relative flex-1">
                                {lookupMode === 'mobile' ? (
                                    <>
                                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                                            <Phone className="size-4" />
                                        </div>
                                        <Input
                                            type="tel"
                                            value={mobile}
                                            onChange={(e) => setMobile(e.target.value)}
                                            placeholder="e.g. +675 7123 4567 or 71234567"
                                            className="h-11 pl-10 text-sm border-slate-200 focus:border-[#0052CC] focus:ring-[#0052CC]"
                                            autoFocus
                                        />
                                    </>
                                ) : (
                                    <>
                                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                                            <QrCode className="size-4" />
                                        </div>
                                        <Input
                                            type="text"
                                            value={qrToken}
                                            onChange={(e) => setQrToken(e.target.value)}
                                            placeholder="e.g. PNG-2026-000001 or appointment token"
                                            className="h-11 pl-10 text-sm border-slate-200 focus:border-[#0052CC] focus:ring-[#0052CC]"
                                            autoFocus
                                        />
                                    </>
                                )}
                            </div>

                            <Button
                                type="submit"
                                disabled={loading}
                                className="h-11 gap-2 rounded-xl bg-[#0052CC] px-6 text-sm font-bold text-white shadow-xs transition hover:bg-[#0047B3] active:scale-95 cursor-pointer"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="size-4 animate-spin" />
                                        <span>Searching...</span>
                                    </>
                                ) : (
                                    <>
                                        <Search className="size-4" />
                                        <span>Check Status</span>
                                    </>
                                )}
                            </Button>
                        </div>

                        {/* Error Message */}
                        {lookupError && (
                            <div className="mt-3 flex items-center gap-2 text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-200 rounded-lg p-2.5 max-w-xl">
                                <AlertCircle className="size-4 shrink-0 text-rose-600" />
                                <span>{lookupError}</span>
                            </div>
                        )}

                        <div className="mt-3 text-[11px] text-slate-400">
                            * Enter the mobile phone number specified during enrollment or your 6-digit confirmation booking reference.
                        </div>
                    </form>
                </div>

                {/* When Result is Available: Rich Status Bar & Dossier Cockpit */}
                {result && (
                    <div className="mt-8 space-y-6">
                        {/* 1. Main Status Banner Card */}
                        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                            <div className="border-b border-slate-100 bg-[#0B192C] px-6 py-5 text-white">
                                <div className="flex flex-wrap items-center justify-between gap-4">
                                    <div className="flex items-center gap-3">
                                        <div className="flex size-11 items-center justify-center rounded-xl bg-[#0052CC] text-white shadow-xs">
                                            <Shield className="size-6" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h2 className="text-lg font-black tracking-tight text-white">
                                                    {citizenName}
                                                </h2>
                                                <span className="rounded-md border border-white/20 bg-white/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#5EA4FF]">
                                                    {result.registrant.demographic?.province || 'Papua New Guinea'}
                                                </span>
                                            </div>
                                            <p className="text-xs text-slate-300">
                                                Mobile: {result.registrant.mobile}
                                                {result.registrant.id && ` · Registrant ID #${result.registrant.id}`}
                                            </p>
                                        </div>
                                    </div>

                                    {/* BioSure ID Badge */}
                                    {biosureId ? (
                                        <div className="flex items-center gap-2 rounded-xl border border-[#C9A227]/40 bg-[#C9A227]/15 px-3.5 py-2">
                                            <div>
                                                <div className="text-[10px] font-bold uppercase tracking-wider text-[#C9A227]">
                                                    Official BioSure ID
                                                </div>
                                                <div className="font-mono text-base font-black tracking-wider text-white">
                                                    {biosureId}
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => handleCopyId(biosureId)}
                                                className="rounded-lg p-1.5 text-slate-300 hover:bg-white/10 hover:text-white transition cursor-pointer"
                                                title="Copy BioSure ID"
                                            >
                                                {copied ? (
                                                    <Check className="size-4 text-emerald-400" />
                                                ) : (
                                                    <Copy className="size-4" />
                                                )}
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2 rounded-xl bg-white/10 px-3 py-1.5 text-xs font-semibold text-slate-300">
                                            <Clock className="size-3.5 text-[#5EA4FF]" />
                                            <span>
                                                Status:{' '}
                                                <strong className="text-white uppercase font-bold">
                                                    {result.registrant.status}
                                                </strong>
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* 2. Horizontal Status Progress Bar */}
                            <div className="p-6 sm:p-8">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                            Lifecycle Status Progression
                                        </h3>
                                        <p className="mt-0.5 text-sm font-extrabold text-[#0F2644]">
                                            {progressPercent === 100
                                                ? 'Identity Verified & Card In Possession'
                                                : isFailed
                                                  ? 'Validation Flagged for Administrative Review'
                                                  : isRework
                                                    ? 'Biometric Re-capture Required at Station'
                                                    : `Application Pipeline: ${progressPercent}% Completed`}
                                        </p>
                                    </div>

                                    <div className="text-right">
                                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 border border-emerald-200">
                                            <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                            Active Record
                                        </span>
                                    </div>
                                </div>

                                {/* Multi-Stage Horizontal Stepper */}
                                <div className="mt-8 relative">
                                    {/* Connecting Progress Track Line */}
                                    <div className="absolute top-5 left-6 right-6 hidden h-1 bg-slate-200 sm:block -z-0">
                                        <div
                                            className="h-full bg-[#0052CC] transition-all duration-700"
                                            style={{
                                                width: `${Math.max(
                                                    0,
                                                    ((completedCount - 1) / (stages.length - 1)) * 100
                                                )}%`,
                                            }}
                                        ></div>
                                    </div>

                                    {/* Step Nodes Grid */}
                                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-5 sm:gap-2">
                                        {stages.map((stage, idx) => {
                                            const item = timeline.find((t) => t.stage === stage.key);
                                            const isDone = Boolean(item?.done);
                                            const isCurrent =
                                                !isDone &&
                                                (idx === 0 ||
                                                    Boolean(
                                                        timeline.find(
                                                            (t) => t.stage === stages[idx - 1]?.key
                                                        )?.done
                                                    ));
                                            const Icon = stage.icon;

                                            return (
                                                <div
                                                    key={stage.key}
                                                    className="relative flex flex-row items-center gap-3 sm:flex-col sm:text-center z-10"
                                                >
                                                    {/* Node Circle */}
                                                    <div
                                                        className={`flex size-10 shrink-0 items-center justify-center rounded-full transition-all duration-300 ${
                                                            isDone
                                                                ? 'bg-[#0052CC] text-white shadow-md ring-4 ring-[#0052CC]/15'
                                                                : isCurrent
                                                                  ? 'bg-white border-2 border-[#0052CC] text-[#0052CC] shadow-md ring-4 ring-[#0052CC]/20'
                                                                  : 'bg-white border-2 border-slate-200 text-slate-400'
                                                        }`}
                                                    >
                                                        {isDone ? (
                                                            <Check className="size-5 stroke-[2.5]" />
                                                        ) : (
                                                            <Icon className="size-4" />
                                                        )}
                                                    </div>

                                                    {/* Step Label & Description */}
                                                    <div className="min-w-0 flex-1 sm:mt-2">
                                                        <div className="flex items-center gap-1.5 sm:justify-center">
                                                            <span
                                                                className={`text-xs font-bold ${
                                                                    isDone
                                                                        ? 'text-[#0F2644]'
                                                                        : isCurrent
                                                                          ? 'text-[#0052CC]'
                                                                          : 'text-slate-400'
                                                                }`}
                                                            >
                                                                {stage.label}
                                                            </span>
                                                        </div>
                                                        <p className="mt-0.5 text-[11px] text-slate-500 line-clamp-2">
                                                            {stage.shortDesc}
                                                        </p>
                                                        {item?.at && (
                                                            <div className="mt-1 flex items-center gap-1 text-[10px] font-semibold text-slate-400 sm:justify-center">
                                                                <Calendar className="size-3" />
                                                                <span>
                                                                    {new Date(item.at).toLocaleDateString('en-US', {
                                                                        month: 'short',
                                                                        day: 'numeric',
                                                                        year: 'numeric',
                                                                    })}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 3. Operational Cards Grid: Appointment + Physical Smart Card Mock */}
                        <div className="grid gap-6 md:grid-cols-2">
                            {/* Card Left: Appointment or Enrollment Station Detail */}
                            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
                                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                    <div className="flex items-center gap-2">
                                        <div className="flex size-7 items-center justify-center rounded-lg bg-[#0052CC]/10 text-[#0052CC]">
                                            <MapPin className="size-4" />
                                        </div>
                                        <h4 className="text-sm font-bold text-[#0F2644]">
                                            Biometric Capture Center
                                        </h4>
                                    </div>
                                    <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600 uppercase">
                                        {latestAppointment?.status || 'Scheduled'}
                                    </span>
                                </div>

                                <div className="mt-4 space-y-3 text-xs">
                                    <div>
                                        <span className="text-slate-400 text-[11px]">Assigned Center:</span>
                                        <div className="font-bold text-slate-800 text-sm">
                                            {latestAppointment?.center?.name || 'Waigani Central Registry Node'}
                                        </div>
                                        <div className="text-slate-500 text-[11px] mt-0.5">
                                            {latestAppointment?.center?.location || 'Kumul Avenue, Waigani, NCD'}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                                        <div>
                                            <span className="text-slate-400 text-[11px]">Appointment Slot:</span>
                                            <div className="font-semibold text-slate-800">
                                                {latestAppointment?.slot_at
                                                    ? new Date(latestAppointment.slot_at).toLocaleString('en-US', {
                                                          month: 'short',
                                                          day: 'numeric',
                                                          hour: '2-digit',
                                                          minute: '2-digit',
                                                      })
                                                    : 'Walk-in Accredited'}
                                            </div>
                                        </div>

                                        <div>
                                            <span className="text-slate-400 text-[11px]">Fast-Track Pass:</span>
                                            <div className="font-mono font-bold text-[#0052CC]">
                                                {latestAppointment?.qr_token
                                                    ? latestAppointment.qr_token.slice(0, 12) + '...'
                                                    : 'TOKEN VERIFIED'}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="rounded-xl bg-slate-50 p-3 border border-slate-100 text-[11px] text-slate-600 flex items-start gap-2">
                                        <Sparkles className="size-4 text-[#0052CC] shrink-0 mt-0.5" />
                                        <span>
                                            Please present your National Pre-Registration QR Pass on your mobile device or printed slip when arriving at the biometric desk.
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Card Right: Smart Card Personalization Status & Silhouette */}
                            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col justify-between">
                                <div>
                                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                        <div className="flex items-center gap-2">
                                            <div className="flex size-7 items-center justify-center rounded-lg bg-[#0052CC]/10 text-[#0052CC]">
                                                <CreditCard className="size-4" />
                                            </div>
                                            <h4 className="text-sm font-bold text-[#0F2644]">
                                                BioSure Smart Card
                                            </h4>
                                        </div>
                                        <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                                            ISO 7816 / ICAO 9303
                                        </span>
                                    </div>

                                    {/* Physical Card Silhouette Mini Mock */}
                                    <div className="mt-4 rounded-xl border border-slate-200 bg-linear-to-tr from-[#0B192C] via-[#0F2644] to-[#1E3E62] p-4 text-white shadow-sm">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div className="size-4 rounded-full bg-[#C9A227] text-black font-bold flex items-center justify-center text-[9px]">
                                                    ★
                                                </div>
                                                <span className="text-[10px] font-black tracking-widest text-[#5EA4FF] uppercase">
                                                    BIOSURE NATIONAL ID
                                                </span>
                                            </div>
                                            <span className="font-mono text-[9px] text-white/50">PNG GOV</span>
                                        </div>

                                        <div className="mt-4 flex items-center gap-3">
                                            <div className="size-10 rounded-lg bg-white/10 flex items-center justify-center text-white/80 border border-white/20">
                                                <User className="size-6 text-slate-300" />
                                            </div>
                                            <div>
                                                <div className="text-xs font-bold text-white tracking-wide">
                                                    {citizenName}
                                                </div>
                                                <div className="font-mono text-[11px] font-bold text-[#C9A227] mt-0.5">
                                                    {biosureId || 'PENDING ABIS CLEARANCE'}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-2 text-[9px] text-white/60">
                                            <span>Issued: {new Date().getFullYear()}</span>
                                            <span>Zero-Trust Cryptographic Core</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-4 flex items-center justify-between gap-3 pt-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => window.print()}
                                        className="h-9 gap-1.5 text-xs font-semibold text-slate-700 cursor-pointer"
                                    >
                                        <Printer className="size-3.5" />
                                        <span>Print Tracking Slip</span>
                                    </Button>

                                    <Button
                                        size="sm"
                                        onClick={() => {
                                            router.visit('/track');
                                        }}
                                        className="h-9 gap-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-bold cursor-pointer"
                                    >
                                        <RefreshCw className="size-3.5" />
                                        <span>New Query</span>
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* 4. Official System Notifications & SMS Logs */}
                        {result.registrant.notifications && result.registrant.notifications.length > 0 && (
                            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
                                <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                                    <div className="flex size-7 items-center justify-center rounded-lg bg-[#0052CC]/10 text-[#0052CC]">
                                        <Clock className="size-4" />
                                    </div>
                                    <h4 className="text-sm font-bold text-[#0F2644]">
                                        Official SMS & Automated Notifications
                                    </h4>
                                </div>

                                <div className="mt-4 space-y-2.5">
                                    {result.registrant.notifications.map((n, i) => (
                                        <div
                                            key={i}
                                            className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-xl bg-slate-50 p-3.5 border border-slate-100"
                                        >
                                            <div>
                                                <div className="text-xs font-bold text-slate-800">{n.title}</div>
                                                <div className="text-xs text-slate-600 mt-0.5">{n.body}</div>
                                            </div>
                                            {n.sent_at && (
                                                <span className="shrink-0 text-[10px] font-medium text-slate-400">
                                                    {new Date(n.sent_at).toLocaleString('en-US', {
                                                        month: 'short',
                                                        day: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                    })}
                                                </span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}
