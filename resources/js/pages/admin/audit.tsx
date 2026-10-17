import { Head } from '@inertiajs/react';
import {
    Activity,
    ArrowRight,
    CheckCircle2,
    Clock,
    CreditCard,
    Download,
    Eye,
    FileSpreadsheet,
    FileText,
    Filter,
    Fingerprint,
    QrCode,
    Search,
    Shield,
    ShieldAlert,
    ShieldCheck,
    Truck,
    Users,
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AdminLayout, { AdminStats } from '@/layouts/admin-layout';

interface AuthEventRecord {
    id: number;
    mode: string;
    result: string;
    verifier_ref: string | null;
    created_at: string;
    identity?: {
        biosure_id_number?: string | null;
        registrant?: {
            id?: number;
            demographic?: {
                full_name?: string;
                province?: string;
            } | null;
        } | null;
    } | null;
}

interface AuditProps {
    events: AuthEventRecord[];
    funnel: {
        submitted: number;
        approved: number;
        issued: number;
        delivered: number;
    };
    stats: AdminStats;
}

export default function Audit({ events = [], funnel, stats }: AuditProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [modeFilter, setModeFilter] = useState<string>('all');
    const [resultFilter, setResultFilter] = useState<'all' | 'success' | 'failed'>('all');

    const submitted = funnel.submitted || 0;
    const approved = funnel.approved || 0;
    const issued = funnel.issued || 0;
    const delivered = funnel.delivered || 0;

    const approvalRate = submitted > 0 ? Math.round((approved / submitted) * 100) : 100;
    const personalizationRate = approved > 0 ? Math.round((issued / approved) * 100) : 0;
    const deliveryRate = issued > 0 ? Math.round((delivered / issued) * 100) : 0;

    const filteredEvents = events.filter((e) => {
        const citizenName =
            e.identity?.registrant?.demographic?.full_name?.toLowerCase() || '';
        const idNumber = e.identity?.biosure_id_number?.toLowerCase() || '';
        const ref = e.verifier_ref?.toLowerCase() || '';
        const mode = e.mode?.toLowerCase() || '';

        const matchesSearch =
            citizenName.includes(searchQuery.toLowerCase()) ||
            idNumber.includes(searchQuery.toLowerCase()) ||
            ref.includes(searchQuery.toLowerCase()) ||
            mode.includes(searchQuery.toLowerCase());

        const matchesMode =
            modeFilter === 'all' ? true : e.mode?.toLowerCase().includes(modeFilter.toLowerCase());

        const matchesResult =
            resultFilter === 'all'
                ? true
                : resultFilter === 'success'
                  ? e.result?.toLowerCase() === 'success'
                  : e.result?.toLowerCase() !== 'success';

        return matchesSearch && matchesMode && matchesResult;
    });

    const getModeIcon = (mode: string) => {
        const m = mode.toLowerCase();
        if (m.includes('finger') || m.includes('bio')) {
            return <Fingerprint className="size-4 text-[#0052CC]" />;
        }
        if (m.includes('qr') || m.includes('code')) {
            return <QrCode className="size-4 text-purple-600" />;
        }
        return <ShieldCheck className="size-4 text-emerald-600" />;
    };

    return (
        <AdminLayout
            title="National Identity Funnel & Verification Audit"
            stats={stats}
            actions={
                <a
                    href="/admin/export.csv"
                    download="identriq-registrations.csv"
                    className="inline-flex h-9 items-center gap-2 rounded-lg bg-[#0052CC] px-4 text-xs font-bold text-white shadow-xs transition hover:bg-[#0047B3] active:scale-95"
                >
                    <Download className="size-4" />
                    <span>Export Audit CSV</span>
                </a>
            }
        >
            <Head title="Audit & Pipeline Funnel · IDENTRIQ Admin" />

            {/* Sovereign National Pipeline Funnel */}
            <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="flex size-6 items-center justify-center rounded-md bg-[#0052CC]/10 text-[#0052CC]">
                                <Activity className="size-3.5" />
                            </span>
                            <h2 className="text-base font-bold text-[#0F2644]">
                                End-to-End Enrollment & Issuance Funnel
                            </h2>
                        </div>
                        <p className="mt-0.5 text-xs text-slate-500">
                            Real-time conversion progression from biometric capture to citizen card possession
                        </p>
                    </div>

                    <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-1.5 border border-slate-200 text-xs">
                        <Clock className="size-3.5 text-slate-400" />
                        <span className="font-medium text-slate-600">Updated: Just now</span>
                    </div>
                </div>

                {/* 4 Pipeline Stages */}
                <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {/* Stage 1: Submitted */}
                    <div className="relative rounded-xl border border-slate-200 bg-slate-50/60 p-4">
                        <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                            <span>Stage 1 · Submitted</span>
                            <Users className="size-4 text-[#0052CC]" />
                        </div>
                        <div className="mt-3 text-2xl font-black text-[#0F2644]">
                            {submitted.toLocaleString()}
                        </div>
                        <div className="mt-1 text-[11px] text-slate-500">
                            Pre-registered & biometrics taken
                        </div>
                        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
                            <div className="h-full bg-[#0052CC] w-full"></div>
                        </div>
                        <div className="mt-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Baseline Ingestion
                        </div>
                    </div>

                    {/* Stage 2: ABIS Approved */}
                    <div className="relative rounded-xl border border-slate-200 bg-slate-50/60 p-4">
                        <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                            <span>Stage 2 · ABIS Validated</span>
                            <CheckCircle2 className="size-4 text-emerald-600" />
                        </div>
                        <div className="mt-3 text-2xl font-black text-emerald-600">
                            {approved.toLocaleString()}
                        </div>
                        <div className="mt-1 text-[11px] text-slate-500">
                            Deduplication cleared
                        </div>
                        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
                            <div
                                className="h-full bg-emerald-500 transition-all duration-500"
                                style={{ width: `${Math.min(approvalRate, 100)}%` }}
                            ></div>
                        </div>
                        <div className="mt-2 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                            {approvalRate}% Pass-through
                        </div>
                    </div>

                    {/* Stage 3: Card Personalized */}
                    <div className="relative rounded-xl border border-slate-200 bg-slate-50/60 p-4">
                        <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                            <span>Stage 3 · Personalized</span>
                            <CreditCard className="size-4 text-[#0052CC]" />
                        </div>
                        <div className="mt-3 text-2xl font-black text-[#0052CC]">
                            {issued.toLocaleString()}
                        </div>
                        <div className="mt-1 text-[11px] text-slate-500">
                            BioSure ID laser-engraved
                        </div>
                        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
                            <div
                                className="h-full bg-[#0052CC] transition-all duration-500"
                                style={{ width: `${Math.min(personalizationRate, 100)}%` }}
                            ></div>
                        </div>
                        <div className="mt-2 text-[10px] font-bold uppercase tracking-wider text-[#0052CC]">
                            {personalizationRate}% Personalized
                        </div>
                    </div>

                    {/* Stage 4: Delivered */}
                    <div className="relative rounded-xl border border-slate-200 bg-slate-50/60 p-4">
                        <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                            <span>Stage 4 · In Citizen Hand</span>
                            <Truck className="size-4 text-[#C9A227]" />
                        </div>
                        <div className="mt-3 text-2xl font-black text-slate-800">
                            {delivered.toLocaleString()}
                        </div>
                        <div className="mt-1 text-[11px] text-slate-500">
                            Confirmed courier / pickup
                        </div>
                        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
                            <div
                                className="h-full bg-[#C9A227] transition-all duration-500"
                                style={{ width: `${Math.min(deliveryRate, 100)}%` }}
                            ></div>
                        </div>
                        <div className="mt-2 text-[10px] font-bold uppercase tracking-wider text-amber-700">
                            {deliveryRate}% Possession Rate
                        </div>
                    </div>
                </div>
            </div>

            {/* Authentication and Verification Audit Stream */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="flex size-6 items-center justify-center rounded-md bg-[#0052CC]/10 text-[#0052CC]">
                                <Shield className="size-3.5" />
                            </span>
                            <h3 className="text-base font-bold text-[#0F2644]">
                                Field Verification Audit Trail
                            </h3>
                        </div>
                        <p className="mt-0.5 text-xs text-slate-500">
                            Forensic log of biometric matches, offline QR signatures, and agency verifications
                        </p>
                    </div>

                    <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                        {filteredEvents.length} events logged
                    </span>
                </div>

                {/* Filter & Search Bar */}
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-1 items-center gap-2 min-w-[240px] rounded-lg border border-slate-200 px-3 py-1.5">
                        <Search className="size-4 text-slate-400" />
                        <Input
                            placeholder="Filter by citizen name, BioSure ID, or verifier reference..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="h-7 border-none bg-transparent p-0 text-xs shadow-none focus-visible:ring-0"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="text-xs text-slate-400 hover:text-slate-600"
                            >
                                Clear
                            </button>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Mode Filter */}
                        <select
                            value={modeFilter}
                            onChange={(e) => setModeFilter(e.target.value)}
                            className="h-9 rounded-lg border border-slate-200 bg-slate-50 px-3 text-xs font-medium text-slate-700 focus:outline-hidden"
                        >
                            <option value="all">All Verification Modes</option>
                            <option value="biometric">Biometric Only</option>
                            <option value="qr">QR Code / Offline</option>
                        </select>

                        {/* Result Filter */}
                        <div className="flex items-center rounded-lg bg-slate-100 p-0.5 border border-slate-200 text-xs">
                            <button
                                onClick={() => setResultFilter('all')}
                                className={`rounded-md px-2.5 py-1 font-medium transition ${
                                    resultFilter === 'all'
                                        ? 'bg-white text-slate-900 shadow-xs'
                                        : 'text-slate-600 hover:text-slate-900'
                                }`}
                            >
                                All
                            </button>
                            <button
                                onClick={() => setResultFilter('success')}
                                className={`rounded-md px-2.5 py-1 font-medium transition ${
                                    resultFilter === 'success'
                                        ? 'bg-white text-emerald-700 shadow-xs'
                                        : 'text-slate-600 hover:text-slate-900'
                                }`}
                            >
                                Success
                            </button>
                            <button
                                onClick={() => setResultFilter('failed')}
                                className={`rounded-md px-2.5 py-1 font-medium transition ${
                                    resultFilter === 'failed'
                                        ? 'bg-white text-rose-700 shadow-xs'
                                        : 'text-slate-600 hover:text-slate-900'
                                }`}
                            >
                                Denied
                            </button>
                        </div>
                    </div>
                </div>

                {/* Audit Table */}
                <div className="mt-4 overflow-hidden rounded-xl border border-slate-200">
                    <table className="w-full text-left text-xs">
                        <thead className="border-b border-slate-200 bg-slate-50 font-semibold text-slate-600">
                            <tr>
                                <th className="px-4 py-3">Result</th>
                                <th className="px-4 py-3">Citizen Dossier</th>
                                <th className="px-4 py-3">Verification Mode</th>
                                <th className="px-4 py-3">Verifier / Agency Ref</th>
                                <th className="px-4 py-3">Timestamp</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredEvents.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="py-12 text-center text-slate-400">
                                        <ShieldAlert className="mx-auto size-8 text-slate-300" />
                                        <p className="mt-2 text-sm font-semibold text-slate-600">
                                            No Verification Events Found
                                        </p>
                                        <p className="text-xs text-slate-400">
                                            Verification logs are recorded when field agents or biometric turnstiles query identity status.
                                        </p>
                                    </td>
                                </tr>
                            ) : (
                                filteredEvents.map((e) => {
                                    const isSuccess = e.result?.toLowerCase() === 'success';
                                    const name =
                                        e.identity?.registrant?.demographic?.full_name || 'Citizen Record';
                                    const bioId =
                                        e.identity?.biosure_id_number ||
                                        (e.identity?.registrant?.id
                                            ? `REG #${e.identity.registrant.id}`
                                            : 'Identity Node');

                                    return (
                                        <tr key={e.id} className="transition hover:bg-slate-50/80">
                                            <td className="px-4 py-3">
                                                <span
                                                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                                                        isSuccess
                                                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                                                    }`}
                                                >
                                                    <span
                                                        className={`size-1.5 rounded-full ${
                                                            isSuccess ? 'bg-emerald-500' : 'bg-rose-500'
                                                        }`}
                                                    ></span>
                                                    {e.result.toUpperCase()}
                                                </span>
                                            </td>

                                            <td className="px-4 py-3">
                                                <div className="font-semibold text-[#0F2644]">{name}</div>
                                                <div className="font-mono text-[11px] text-slate-400">
                                                    {bioId}
                                                </div>
                                            </td>

                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-1.5 font-medium text-slate-700">
                                                    {getModeIcon(e.mode)}
                                                    <span className="capitalize">
                                                        {e.mode.replace(/_/g, ' ')}
                                                    </span>
                                                </div>
                                            </td>

                                            <td className="px-4 py-3 font-mono text-[11px] text-slate-600">
                                                {e.verifier_ref || 'Terminal #01 (Direct)'}
                                            </td>

                                            <td className="px-4 py-3 text-slate-500">
                                                {new Date(e.created_at).toLocaleString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                })}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AdminLayout>
    );
}
