import { Head, router } from '@inertiajs/react';
import {
    AlertTriangle,
    CheckCircle2,
    Clock,
    FileCheck2,
    FileText,
    Fingerprint,
    GitMerge,
    HelpCircle,
    Search,
    ShieldAlert,
    ShieldCheck,
    User,
    XCircle,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AdminLayout, { type AdminStats } from '@/layouts/admin-layout';

interface CaseItem {
    id: number;
    status: string;
    mobile?: string;
    created_at?: string;
    updated_at?: string;
    demographic?: {
        full_name: string;
        dob: string;
        gender?: string;
        nationality?: string;
        province?: string;
        photo_url?: string | null;
    } | null;
    documents: {
        id?: number;
        doc_type: string;
        verified_status: string;
        file_path?: string;
    }[];
    appointments?: {
        id?: number;
        status: string;
        center?: { name: string };
    }[];
}

interface Match {
    id: number;
    name: string;
    dob: string;
    score: number;
}

export default function Validation({
    cases = [],
    active,
    matches = [],
    stats,
}: {
    cases: CaseItem[];
    active?: (CaseItem & { appointments: { status: string; center?: { name: string } }[] }) | null;
    matches?: Match[];
    stats?: AdminStats;
}) {
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'validating' | 'rework'>('all');
    const [reason, setReason] = useState('');
    const [submittingDecision, setSubmittingDecision] = useState(false);
    const [mergingId, setMergingId] = useState<number | null>(null);

    const filteredCases = useMemo(() => {
        return cases.filter((c) => {
            const name = c.demographic?.full_name?.toLowerCase() || '';
            const id = String(c.id);
            const query = search.toLowerCase();
            const matchesQuery = name.includes(query) || id.includes(query);

            if (statusFilter === 'all') return matchesQuery;
            return matchesQuery && c.status === statusFilter;
        });
    }, [cases, search, statusFilter]);

    const handleDecide = (decision: 'approved' | 'failed') => {
        if (!active) return;
        if (decision === 'failed' && !reason.trim()) {
            alert('Please specify a rejection reason for audit compliance.');
            return;
        }

        setSubmittingDecision(true);
        router.post(
            `/admin/validation/${active.id}/decide`,
            { decision, reason: decision === 'failed' ? reason : null },
            {
                onFinish: () => {
                    setSubmittingDecision(false);
                    setReason('');
                },
            }
        );
    };

    const handleMerge = (loserId: number) => {
        if (!active) return;
        if (!confirm(`Are you sure you want to merge record #${loserId} into active record #${active.id}? Record #${loserId} will be flagged as duplicate.`)) {
            return;
        }

        setMergingId(loserId);
        router.post(
            `/admin/validation/${active.id}/merge`,
            { loser_id: loserId },
            {
                onFinish: () => setMergingId(null),
            }
        );
    };

    return (
        <AdminLayout
            title="Validation & Biometric Deduplication"
            stats={stats}
            actions={
                <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-500">
                        {cases.length} Total Pending Dossiers
                    </span>
                </div>
            }
        >
            <Head title="Validation & ABIS Queue — IDENTRIQ Admin" />

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                {/* LEFT COLUMN: Caseload Queue (5 cols) */}
                <div className="space-y-4 lg:col-span-5">
                    {/* Search & Filter Bar */}
                    <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
                        <div className="relative">
                            <Search className="absolute left-3 top-2.5 size-4 text-slate-400" />
                            <Input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search by citizen name or ID..."
                                className="h-10 pl-9 rounded-xl border-slate-200 text-sm focus:border-[#0052CC] focus:ring-[#0052CC]"
                            />
                        </div>

                        {/* Status Pills */}
                        <div className="mt-3 flex items-center gap-1.5 text-xs">
                            <button
                                type="button"
                                onClick={() => setStatusFilter('all')}
                                className={`rounded-lg px-3 py-1 font-semibold transition ${
                                    statusFilter === 'all'
                                        ? 'bg-[#0052CC] text-white shadow-xs'
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                            >
                                All ({cases.length})
                            </button>
                            <button
                                type="button"
                                onClick={() => setStatusFilter('validating')}
                                className={`rounded-lg px-3 py-1 font-semibold transition ${
                                    statusFilter === 'validating'
                                        ? 'bg-[#0052CC] text-white shadow-xs'
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                            >
                                Validating ({cases.filter((c) => c.status === 'validating').length})
                            </button>
                            <button
                                type="button"
                                onClick={() => setStatusFilter('rework')}
                                className={`rounded-lg px-3 py-1 font-semibold transition ${
                                    statusFilter === 'rework'
                                        ? 'bg-[#0052CC] text-white shadow-xs'
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                            >
                                Rework ({cases.filter((c) => c.status === 'rework').length})
                            </button>
                        </div>
                    </div>

                    {/* Case Cards List */}
                    <div className="space-y-2.5 overflow-y-auto max-h-[calc(100vh-280px)] pr-1">
                        {filteredCases.length === 0 ? (
                            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
                                <CheckCircle2 className="mx-auto size-8 text-emerald-500" />
                                <h3 className="mt-2 text-sm font-bold text-[#0F2644]">Caseload Clear</h3>
                                <p className="mt-1 text-xs text-slate-500">
                                    No pending verification dossiers match your current filter.
                                </p>
                            </div>
                        ) : (
                            filteredCases.map((c) => {
                                const isSelected = active?.id === c.id;
                                const isRework = c.status === 'rework';
                                const initials = c.demographic?.full_name
                                    ? c.demographic.full_name
                                          .split(' ')
                                          .map((n) => n[0])
                                          .slice(0, 2)
                                          .join('')
                                    : 'IQ';

                                return (
                                    <button
                                        key={c.id}
                                        type="button"
                                        onClick={() => router.get(`/admin/validation/${c.id}`)}
                                        className={`w-full rounded-2xl p-4 text-left transition-all border ${
                                            isSelected
                                                ? 'border-[#0052CC] bg-blue-50/40 ring-2 ring-[#0052CC]/20 shadow-sm'
                                                : 'border-slate-200/80 bg-white hover:border-slate-300 hover:shadow-xs'
                                        }`}
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex items-center gap-3">
                                                {c.demographic?.photo_url ? (
                                                    <img
                                                        src={c.demographic.photo_url}
                                                        alt={c.demographic.full_name}
                                                        className="size-10 shrink-0 rounded-xl object-cover border border-slate-200 shadow-xs"
                                                    />
                                                ) : (
                                                    <div
                                                        className={`flex size-10 shrink-0 items-center justify-center rounded-xl text-xs font-bold ${
                                                            isSelected
                                                                ? 'bg-[#0052CC] text-white'
                                                                : 'bg-slate-100 text-slate-700'
                                                        }`}
                                                    >
                                                        {initials}
                                                    </div>
                                                )}
                                                <div className="min-w-0">
                                                    <h3 className="truncate text-sm font-bold text-[#0F2644]">
                                                        {c.demographic?.full_name ?? `Applicant #${c.id}`}
                                                    </h3>
                                                    <p className="text-xs text-slate-500">
                                                        DOB: {c.demographic?.dob ?? 'N/A'} · ID #{c.id}
                                                    </p>
                                                </div>
                                            </div>

                                            <span
                                                className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-bold capitalize ${
                                                    isRework
                                                        ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                                        : 'bg-blue-100 text-[#0052CC] border border-blue-200'
                                                }`}
                                            >
                                                {c.status}
                                            </span>
                                        </div>

                                        <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2 text-[11px] text-slate-500">
                                            <span className="flex items-center gap-1">
                                                <FileText className="size-3 text-slate-400" />
                                                {c.documents.length} verified docs
                                            </span>
                                            {c.appointments && c.appointments[0]?.center && (
                                                <span className="truncate max-w-[170px]">
                                                    {c.appointments[0].center.name}
                                                </span>
                                            )}
                                        </div>
                                    </button>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* RIGHT COLUMN: Active Review Dossier & ABIS Comparison (7 cols) */}
                <div className="lg:col-span-7">
                    {!active ? (
                        <div className="flex h-full min-h-[460px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center shadow-xs">
                            <div className="flex size-14 items-center justify-center rounded-2xl bg-blue-50 text-[#0052CC]">
                                <FileCheck2 className="size-7" />
                            </div>
                            <h3 className="mt-4 text-base font-bold text-[#0F2644]">No Dossier Selected</h3>
                            <p className="mt-1 max-w-sm text-xs text-slate-500">
                                Click any applicant card from the queue on the left to inspect their demographic profile, civil documents, and automated ABIS deduplication checks.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-5 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
                            {/* Dossier Header */}
                            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-4">
                                <div className="flex items-center gap-3.5">
                                    {active.demographic?.photo_url ? (
                                        <img
                                            src={active.demographic.photo_url}
                                            alt={active.demographic.full_name}
                                            className="size-14 rounded-2xl object-cover border border-slate-200 shadow-xs"
                                        />
                                    ) : (
                                        <div className="flex size-14 items-center justify-center rounded-2xl bg-blue-50 font-bold text-[#0052CC] text-lg">
                                            {active.demographic?.full_name
                                                ? active.demographic.full_name
                                                      .split(' ')
                                                      .map((n) => n[0])
                                                      .slice(0, 2)
                                                      .join('')
                                                : 'IQ'}
                                        </div>
                                    )}
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h2 className="text-xl font-bold text-[#0F2644]">
                                                {active.demographic?.full_name ?? `Case #${active.id}`}
                                            </h2>
                                            <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-bold text-[#0052CC]">
                                                Case #{active.id}
                                            </span>
                                        </div>
                                        <p className="mt-1 text-xs text-slate-500">
                                            Registered via Pre-registration Portal · National Civil Registry Ingestion
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <span className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-600">
                                        <Clock className="size-3.5 text-slate-400" />
                                        Status: <strong className="capitalize text-[#0F2644]">{active.status}</strong>
                                    </span>
                                </div>
                            </div>

                            {/* Citizen Demographic Grid */}
                            <div>
                                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                    Demographic Dossier
                                </h4>
                                <div className="mt-2.5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                                    <div className="rounded-xl border border-slate-100 bg-[#F8FAFC] p-3">
                                        <span className="text-[11px] font-medium text-slate-400">Date of Birth</span>
                                        <p className="mt-0.5 text-sm font-bold text-[#0F2644]">
                                            {active.demographic?.dob ?? '—'}
                                        </p>
                                    </div>
                                    <div className="rounded-xl border border-slate-100 bg-[#F8FAFC] p-3">
                                        <span className="text-[11px] font-medium text-slate-400">Gender</span>
                                        <p className="mt-0.5 text-sm font-bold capitalize text-[#0F2644]">
                                            {active.demographic?.gender ?? 'Unspecified'}
                                        </p>
                                    </div>
                                    <div className="rounded-xl border border-slate-100 bg-[#F8FAFC] p-3">
                                        <span className="text-[11px] font-medium text-slate-400">Nationality</span>
                                        <p className="mt-0.5 text-sm font-bold text-[#0F2644]">
                                            {active.demographic?.nationality ?? 'Papua New Guinean'}
                                        </p>
                                    </div>
                                    <div className="rounded-xl border border-slate-100 bg-[#F8FAFC] p-3">
                                        <span className="text-[11px] font-medium text-slate-400">Mobile Phone</span>
                                        <p className="mt-0.5 text-sm font-bold font-mono text-[#0F2644]">
                                            {active.mobile ?? '+675 —'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Civil Documents Verification List */}
                            <div>
                                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                    Submitted Civil Documents ({active.documents.length})
                                </h4>
                                <div className="mt-2 space-y-2">
                                    {active.documents.length === 0 ? (
                                        <p className="text-xs text-slate-500 italic">No document attachments found.</p>
                                    ) : (
                                        active.documents.map((d, i) => (
                                            <div
                                                key={d.id ?? i}
                                                className="flex items-center justify-between rounded-xl border border-slate-100 bg-[#F8FAFC] p-3 text-xs"
                                            >
                                                <div className="flex items-center gap-2.5">
                                                    <div className="flex size-7 items-center justify-center rounded-lg bg-blue-100 text-[#0052CC]">
                                                        <FileText className="size-4" />
                                                    </div>
                                                    <div>
                                                        <span className="font-bold text-[#0F2644] capitalize">
                                                            {d.doc_type.replace(/_/g, ' ')}
                                                        </span>
                                                        <span className="ml-2 font-mono text-[10px] text-slate-400">
                                                            SHA-256 Validated
                                                        </span>
                                                    </div>
                                                </div>
                                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700 border border-emerald-200">
                                                    <CheckCircle2 className="size-3" />
                                                    {d.verified_status}
                                                </span>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                            {/* ABIS Biometric & Deduplication Engine Check */}
                            <div className="border-t border-slate-100 pt-4">
                                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                                    Automated ABIS 1:N Biometric & Name Deduplication
                                </h4>

                                {matches.length === 0 ? (
                                    <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-4">
                                        <div className="flex items-start gap-3">
                                            <ShieldCheck className="size-5 shrink-0 text-emerald-600 mt-0.5" />
                                            <div>
                                                <h5 className="text-xs font-bold text-emerald-800">
                                                    ABIS Clean: Zero Duplicate Matches Detected
                                                </h5>
                                                <p className="mt-0.5 text-xs text-emerald-700">
                                                    No biometric or demographic collisions found in the Papua New Guinea National Identity Database. Safe to approve for BioSure ID card issuance.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="rounded-xl border border-amber-300 bg-amber-50/90 p-4">
                                        <div className="flex items-start gap-2.5">
                                            <AlertTriangle className="size-5 shrink-0 text-amber-600 mt-0.5" />
                                            <div className="flex-1">
                                                <h5 className="text-xs font-bold text-amber-900">
                                                    Attention: Potential Duplicate Candidates Found ({matches.length})
                                                </h5>
                                                <p className="mt-0.5 text-xs text-amber-800">
                                                    The deduplication engine flagged existing citizen records sharing similar phonetic names or matching dates of birth. Review and merge if confirmed duplicate.
                                                </p>

                                                <div className="mt-3 space-y-2">
                                                    {matches.map((m) => (
                                                        <div
                                                            key={m.id}
                                                            className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-amber-200/80 bg-white p-3 text-xs"
                                                        >
                                                            <div>
                                                                <span className="font-bold text-[#0F2644]">{m.name}</span>
                                                                <span className="text-slate-500"> · DOB {m.dob}</span>
                                                                <span className="ml-2 inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                                                                    {m.score}% Match
                                                                </span>
                                                            </div>

                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                disabled={mergingId === m.id}
                                                                onClick={() => handleMerge(m.id)}
                                                                className="h-8 gap-1.5 border-amber-300 text-amber-900 hover:bg-amber-50"
                                                            >
                                                                <GitMerge className="size-3.5" />
                                                                {mergingId === m.id ? 'Merging...' : `Merge Duplicate (#${m.id})`}
                                                            </Button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Decision Action Cockpit */}
                            <div className="rounded-xl border border-slate-200 bg-[#F8FAFC] p-4">
                                <h4 className="text-xs font-bold text-[#0F2644]">
                                    Adjudication Decision
                                </h4>
                                <p className="mt-0.5 text-xs text-slate-500">
                                    Approve this applicant to advance into the smart card personalization and issuance queue, or reject with a formal audit reason.
                                </p>

                                <div className="mt-3">
                                    <Input
                                        value={reason}
                                        onChange={(e) => setReason(e.target.value)}
                                        placeholder="Reason for rejection (e.g. Incomplete fingerprints, invalid birth certificate)..."
                                        className="h-10 text-xs rounded-xl border-slate-200 bg-white focus:border-[#0052CC]"
                                    />
                                    {/* Quick Preset Tags */}
                                    <div className="mt-2 flex flex-wrap gap-1.5 text-[11px]">
                                        <span className="text-slate-400 self-center">Presets:</span>
                                        {[
                                            'Biometric capture incomplete',
                                            'Document illegible / blurry',
                                            'Name spelling mismatch on ID',
                                        ].map((preset) => (
                                            <button
                                                key={preset}
                                                type="button"
                                                onClick={() => setReason(preset)}
                                                className="rounded-md border border-slate-200 bg-white px-2 py-0.5 text-slate-600 hover:bg-slate-100"
                                            >
                                                {preset}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="mt-4 flex items-center justify-end gap-3 border-t border-slate-200/80 pt-3">
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        disabled={submittingDecision}
                                        onClick={() => handleDecide('failed')}
                                        className="h-10 gap-1.5 rounded-xl px-5 text-xs font-semibold"
                                    >
                                        <XCircle className="size-4" />
                                        Reject Application
                                    </Button>

                                    <Button
                                        type="button"
                                        disabled={submittingDecision}
                                        onClick={() => handleDecide('approved')}
                                        className="h-10 gap-2 rounded-xl bg-[#0052CC] px-6 text-xs font-bold text-white shadow-xs hover:bg-[#0047B3] active:scale-[0.99]"
                                    >
                                        <CheckCircle2 className="size-4" />
                                        Approve & Advance to Issuance →
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
