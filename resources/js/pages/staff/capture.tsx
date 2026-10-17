import { Head, Link, router } from '@inertiajs/react';
import {
    AlertCircle,
    ArrowLeft,
    Camera,
    CheckCircle2,
    CreditCard,
    ExternalLink,
    Eye,
    FileCheck,
    FileText,
    Fingerprint,
    Image as ImageIcon,
    ShieldAlert,
    ShieldCheck,
    Upload,
    User,
    X,
    XCircle,
    ZoomIn,
} from 'lucide-react';
import { useState } from 'react';
import StaffLayout, { StaffStats } from '@/layouts/staff-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Doc {
    id: number;
    category: string;
    doc_type: string;
    ref_number?: string | null;
    path?: string | null;
    file_url?: string | null;
    mime?: string | null;
    verified_status: string;
    verified_note?: string | null;
}

interface Appointment {
    id: number;
    registrant: {
        id?: number;
        mobile: string;
        demographic?: Record<string, string> | null;
        documents: Doc[];
    };
    center: { name: string };
}

function formatDocType(type: string): string {
    if (!type) return 'Identity Document';
    const map: Record<string, string> = {
        national_id: 'National ID Card',
        birth_certificate: 'Birth Certificate',
        drivers_license: "Driver's License",
        passport: 'Passport',
        ward_councillor_letter: 'Ward Councillor Letter',
        utility_bill: 'Utility Bill (Proof of Address)',
        employment_id: 'Employment / Student ID',
        customary_land_title: 'Customary Land Title',
        voter_id: 'Voter Registration Card',
    };
    const key = type.toLowerCase().trim();
    if (map[key]) return map[key];
    return type.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function Capture({
    appointment,
    centers = [],
    stats,
}: {
    appointment: Appointment;
    centers?: { id: number; name: string }[];
    stats?: StaffStats;
}) {
    const [photo, setPhoto] = useState<File | null>(null);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const [fp, setFp] = useState('FP-PNG-AUTO-CAPTURE');
    const [iris, setIris] = useState('IRIS-PNG-DUAL-OK');
    const [docs, setDocs] = useState<Record<number, { status: string; note: string }>>(
        Object.fromEntries(
            appointment.registrant.documents.map((d) => [
                d.id,
                { status: d.verified_status === 'rejected' ? 'rejected' : 'accepted', note: d.verified_note || '' },
            ])
        )
    );
    const [docFiles, setDocFiles] = useState<Record<number, File>>({});
    const [docFilePreviews, setDocFilePreviews] = useState<Record<number, string>>({});
    const [inspectingDoc, setInspectingDoc] = useState<Doc | null>(null);
    const [attest, setAttest] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const demo = appointment.registrant.documents;

    function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0] ?? null;
        setPhoto(file);
        if (file) {
            setPhotoPreview(URL.createObjectURL(file));
        } else {
            setPhotoPreview(null);
        }
    }

    function handleDocFileChange(id: number, e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0] ?? null;
        if (!file) return;
        setDocFiles((prev) => ({ ...prev, [id]: file }));
        setDocFilePreviews((prev) => ({ ...prev, [id]: URL.createObjectURL(file) }));
    }

    function submit() {
        setSubmitting(true);
        const fd = new FormData();
        if (photo) fd.append('photo', photo);
        if (fp) fd.append('fingerprint_ref', fp);
        if (iris) fd.append('iris_ref', iris);
        Object.entries(docs).forEach(([id, v]) => {
            fd.append(`documents[${id}][status]`, v.status);
            fd.append(`documents[${id}][note]`, v.note);
        });
        Object.entries(docFiles).forEach(([id, file]) => {
            fd.append(`document_files[${id}]`, file);
        });
        fd.append('attest', attest ? '1' : '0');
        router.post(`/staff/capture/${appointment.id}`, fd, {
            forceFormData: true,
            onFinish: () => setSubmitting(false),
        });
    }

    const applicantName =
        appointment.registrant.demographic?.full_name ||
        [appointment.registrant.demographic?.given_name, appointment.registrant.demographic?.family_name]
            .filter(Boolean)
            .join(' ') ||
        'Citizen Applicant';

    return (
        <StaffLayout currentCenterName={appointment.center.name} centers={centers} stats={stats}>
            <Head title={`Live Capture · ${applicantName} · Staff Station`} />

            <div className="p-6 sm:p-8">
                {/* Back Link & Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <Link
                            href="/staff"
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-[#0052CC]"
                        >
                            <ArrowLeft className="size-3.5" />
                            <span>Back to Queue</span>
                        </Link>
                        <h1 className="mt-1 text-2xl font-bold tracking-tight text-[#0F2644] sm:text-3xl">
                            Live Biometric Capture &amp; Verification
                        </h1>
                        <p className="mt-0.5 text-sm text-slate-500">
                            Station: {appointment.center.name} · Appointment #{appointment.id}
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-bold text-[#0052CC]">
                            Station Desk Active
                        </span>
                    </div>
                </div>

                {/* Grid: Applicant Dossier + Biometric Sensors */}
                <div className="mt-6 grid gap-6 lg:grid-cols-12">
                    {/* Left: Applicant Pre-Registration Dossier (5 cols) */}
                    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs lg:col-span-5">
                        <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
                            <User className="size-4 text-[#0052CC]" />
                            <h2 className="text-sm font-bold text-[#0F2644]">Citizen Demographic Dossier</h2>
                        </div>

                        <dl className="mt-4 space-y-3 text-sm">
                            <div className="flex items-baseline justify-between border-b border-slate-50 pb-2">
                                <dt className="text-xs font-medium text-slate-500">Full Name</dt>
                                <dd className="font-bold text-[#0F2644]">{applicantName}</dd>
                            </div>
                            <div className="flex items-baseline justify-between border-b border-slate-50 pb-2">
                                <dt className="text-xs font-medium text-slate-500">Mobile Number</dt>
                                <dd className="font-mono text-sm font-semibold text-[#0F2644]">
                                    {appointment.registrant.mobile}
                                </dd>
                            </div>
                            <div className="flex items-baseline justify-between border-b border-slate-50 pb-2">
                                <dt className="text-xs font-medium text-slate-500">Date of Birth</dt>
                                <dd className="font-medium text-[#0F2644]">
                                    {appointment.registrant.demographic?.dob ?? '—'}
                                </dd>
                            </div>
                            <div className="flex items-baseline justify-between border-b border-slate-50 pb-2">
                                <dt className="text-xs font-medium text-slate-500">Sex / Gender</dt>
                                <dd className="font-medium capitalize text-[#0F2644]">
                                    {appointment.registrant.demographic?.gender ?? '—'}
                                </dd>
                            </div>
                            <div className="flex items-baseline justify-between border-b border-slate-50 pb-2">
                                <dt className="text-xs font-medium text-slate-500">Nationality</dt>
                                <dd className="font-medium text-[#0F2644]">
                                    {appointment.registrant.demographic?.nationality ?? 'Papua New Guinean'}
                                </dd>
                            </div>
                            <div className="flex items-start justify-between">
                                <dt className="pt-0.5 text-xs font-medium text-slate-500">Province &amp; District</dt>
                                <dd className="text-right text-xs font-medium text-[#0F2644]">
                                    {[
                                        appointment.registrant.demographic?.district,
                                        appointment.registrant.demographic?.province,
                                    ]
                                        .filter(Boolean)
                                        .join(', ') || 'National Capital District'}
                                </dd>
                            </div>
                        </dl>
                    </div>

                    {/* Right: Live Biometric Capture Feeds (7 cols) */}
                    <div className="space-y-5 lg:col-span-7">
                        {/* 1. Live Facial Camera */}
                        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                <div className="flex items-center gap-2">
                                    <Camera className="size-4 text-[#0052CC]" />
                                    <h3 className="text-sm font-bold text-[#0F2644]">1. High-Resolution Facial Photo</h3>
                                </div>
                                <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                                    <span className="size-1.5 rounded-full bg-emerald-500"></span> Sensor Ready
                                </span>
                            </div>

                            <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center">
                                {/* Photo Preview / Box */}
                                <div className="flex size-32 shrink-0 items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-slate-300 bg-slate-50">
                                    {photoPreview ? (
                                        <img
                                            src={photoPreview}
                                            alt="Live Capture"
                                            className="size-full object-cover"
                                        />
                                    ) : (
                                        <div className="text-center text-slate-400">
                                            <Camera className="mx-auto size-7" />
                                            <span className="mt-1 block text-[10px] font-medium">No Image</span>
                                        </div>
                                    )}
                                </div>

                                <div className="flex-1 space-y-2">
                                    <Label className="text-xs font-semibold text-slate-700">
                                        Webcam Capture Feed or Upload File
                                    </Label>
                                    <Input
                                        type="file"
                                        accept="image/*"
                                        onChange={handlePhotoChange}
                                        className="h-10 text-xs font-medium border-slate-300"
                                    />
                                    <p className="text-[11px] text-slate-500">
                                        ICAO 9303 compliant neutral expression, plain white background.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* 2. Fingerprint & Iris Hardware Sensors */}
                        <div className="grid gap-4 sm:grid-cols-2">
                            {/* Fingerprint Card */}
                            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Fingerprint className="size-4 text-[#0052CC]" />
                                        <h4 className="text-xs font-bold text-[#0F2644]">2. Fingerprint Scanner</h4>
                                    </div>
                                    <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                                        Calibrated
                                    </span>
                                </div>
                                <div className="mt-3">
                                    <Label className="text-[11px] text-slate-500">Sensor Token Ref</Label>
                                    <Input
                                        value={fp}
                                        onChange={(e) => setFp(e.target.value)}
                                        className="mt-1 h-9 font-mono text-xs border-slate-300"
                                        placeholder="FP-…"
                                    />
                                </div>
                                <p className="mt-1.5 text-[10px] text-slate-400">10-print slap &amp; roll scan complete.</p>
                            </div>

                            {/* Iris Scanner Card */}
                            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Eye className="size-4 text-[#0052CC]" />
                                        <h4 className="text-xs font-bold text-[#0F2644]">3. Dual Iris Scanner</h4>
                                    </div>
                                    <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                                        Calibrated
                                    </span>
                                </div>
                                <div className="mt-3">
                                    <Label className="text-[11px] text-slate-500">Iris Token Ref</Label>
                                    <Input
                                        value={iris}
                                        onChange={(e) => setIris(e.target.value)}
                                        className="mt-1 h-9 font-mono text-xs border-slate-300"
                                        placeholder="IRIS-…"
                                    />
                                </div>
                                <p className="mt-1.5 text-[10px] text-slate-400">Left and right iris patterns captured.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Physical Document Verification Section */}
                <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
                        <div className="flex items-center gap-2.5">
                            <FileCheck className="size-5 text-[#0052CC]" />
                            <div>
                                <h2 className="text-base font-bold text-[#0F2644]">Physical Document Verification</h2>
                                <p className="text-xs text-slate-500">
                                    Verify original physical documents presented by the citizen against uploaded civil scans
                                </p>
                            </div>
                        </div>
                        <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                            {demo.length} {demo.length === 1 ? 'document' : 'documents'} presented
                        </span>
                    </div>

                    <div className="mt-4 space-y-4">
                        {demo.length === 0 ? (
                            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/50 p-8 text-center text-slate-500">
                                <FileText className="mx-auto size-8 text-slate-400" />
                                <p className="mt-2 text-sm font-semibold text-slate-700">
                                    No Pre-Uploaded Documents on Record
                                </p>
                                <p className="mt-0.5 text-xs text-slate-400">
                                    Walk-in applicant has not submitted digital scans. Please inspect physical ID card and proof of residence.
                                </p>
                            </div>
                        ) : (
                            demo.map((d) => {
                                const currentStatus = docs[d.id]?.status ?? 'accepted';
                                const currentNote = docs[d.id]?.note ?? '';
                                const previewUrl =
                                    docFilePreviews[d.id] ||
                                    d.file_url ||
                                    (d.path ? `/storage/${d.path.replace(/^\//, '')}` : null);
                                const isWalkinPresented = d.ref_number === 'WALKIN-PRESENTED' || !d.path;

                                return (
                                    <div
                                        key={d.id}
                                        className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-slate-50/60 p-4 transition hover:border-slate-300 sm:flex-row sm:items-center sm:justify-between"
                                    >
                                        {/* Document Thumbnail Image & Info */}
                                        <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                                            {/* Image Thumbnail Box */}
                                            <div className="relative group size-18 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
                                                {previewUrl ? (
                                                    <>
                                                        <img
                                                            src={previewUrl}
                                                            alt={formatDocType(d.doc_type)}
                                                            className="size-full object-cover transition group-hover:scale-105"
                                                            onError={(e) => {
                                                                // If preview path does not exist on disk, hide img and fallback
                                                                (e.target as HTMLElement).style.display = 'none';
                                                            }}
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => setInspectingDoc(d)}
                                                            className="absolute inset-0 flex items-center justify-center bg-black/40 text-white opacity-0 transition group-hover:opacity-100 cursor-pointer"
                                                            title="Inspect Full Image"
                                                        >
                                                            <ZoomIn className="size-5" />
                                                        </button>
                                                    </>
                                                ) : (
                                                    <div className="flex size-full flex-col items-center justify-center bg-blue-50 text-[#0052CC]">
                                                        <CreditCard className="size-6 text-[#0052CC]" />
                                                        <span className="text-[9px] font-bold mt-0.5">Physical</span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Document Details */}
                                            <div className="min-w-0">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <span className="rounded-md bg-slate-200/70 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-600">
                                                        {d.category.replace(/_/g, ' ')}
                                                    </span>

                                                    {isWalkinPresented ? (
                                                        <span className="rounded-md bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700 border border-amber-200">
                                                            In-Person Physical Card
                                                        </span>
                                                    ) : (
                                                        <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                                                            Uploaded Civil Scan
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Document Title with Underscores Removed */}
                                                <h3 className="mt-1 text-sm font-bold text-[#0F2644] tracking-tight">
                                                    {formatDocType(d.doc_type)}
                                                </h3>

                                                {/* Reference & Scan attachment button */}
                                                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                                                    {d.ref_number && (
                                                        <span className="font-mono text-[11px] text-slate-600">
                                                            Ref: {d.ref_number}
                                                        </span>
                                                    )}

                                                    {previewUrl && (
                                                        <button
                                                            type="button"
                                                            onClick={() => setInspectingDoc(d)}
                                                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#0052CC] hover:underline cursor-pointer"
                                                        >
                                                            <Eye className="size-3" />
                                                            <span>Inspect Scan</span>
                                                        </button>
                                                    )}

                                                    {/* Attach Scan / Photo if missing or walk-in */}
                                                    <label className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 hover:text-[#0052CC] cursor-pointer">
                                                        <Upload className="size-3" />
                                                        <span>{previewUrl ? 'Replace Scan' : 'Snap / Upload Scan'}</span>
                                                        <input
                                                            type="file"
                                                            accept="image/*,application/pdf"
                                                            className="hidden"
                                                            onChange={(e) => handleDocFileChange(d.id, e)}
                                                        />
                                                    </label>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Accept / Reject Controls */}
                                        <div className="flex flex-wrap items-center gap-2.5">
                                            <div className="flex rounded-lg border border-slate-200 bg-white p-0.5 shadow-xs">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setDocs({
                                                            ...docs,
                                                            [d.id]: { ...docs[d.id], status: 'accepted' },
                                                        })
                                                    }
                                                    className={`flex items-center gap-1.5 rounded-md px-3.5 py-1.5 text-xs font-bold transition cursor-pointer ${
                                                        currentStatus === 'accepted'
                                                            ? 'bg-emerald-600 text-white shadow-xs'
                                                            : 'text-slate-600 hover:text-emerald-700'
                                                    }`}
                                                >
                                                    <CheckCircle2 className="size-3.5" />
                                                    Accept
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setDocs({
                                                            ...docs,
                                                            [d.id]: { ...docs[d.id], status: 'rejected' },
                                                        })
                                                    }
                                                    className={`flex items-center gap-1.5 rounded-md px-3.5 py-1.5 text-xs font-bold transition cursor-pointer ${
                                                        currentStatus === 'rejected'
                                                            ? 'bg-red-600 text-white shadow-xs'
                                                            : 'text-slate-600 hover:text-red-700'
                                                    }`}
                                                >
                                                    <XCircle className="size-3.5" />
                                                    Reject
                                                </button>
                                            </div>

                                            {/* Reason / Note Input */}
                                            <Input
                                                placeholder={
                                                    currentStatus === 'rejected'
                                                        ? 'Reason for rejection (required)'
                                                        : 'Verification note (optional)'
                                                }
                                                value={currentNote}
                                                onChange={(e) =>
                                                    setDocs({
                                                        ...docs,
                                                        [d.id]: { ...docs[d.id], note: e.target.value },
                                                    })
                                                }
                                                className={`h-9 text-xs sm:w-64 ${
                                                    currentStatus === 'rejected'
                                                        ? 'border-red-300 bg-red-50/50 text-red-900 placeholder:text-red-400'
                                                        : 'border-slate-300'
                                                }`}
                                            />
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {/* Attestation & Submit */}
                    <div className="mt-6 border-t border-slate-100 pt-5">
                        <label className="flex items-start gap-3 rounded-xl border border-blue-200 bg-[#F0F6FF] p-3.5 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={attest}
                                onChange={(e) => setAttest(e.target.checked)}
                                className="mt-0.5 size-4 rounded border-slate-300 text-[#0052CC] focus:ring-[#0052CC]"
                            />
                            <div className="text-xs">
                                <span className="font-bold text-[#0052CC]">Officer Legal Attestation:</span>
                                <p className="text-slate-600 mt-0.5">
                                    I attest under penalty of administrative sanctions that this biometric capture and
                                    document review was performed in person at {appointment.center.name}.
                                </p>
                            </div>
                        </label>

                        <div className="mt-5 flex items-center justify-end gap-3">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => router.visit('/staff')}
                                className="h-11 border-slate-300 font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                            >
                                Cancel &amp; Return to Queue
                            </Button>
                            <Button
                                onClick={submit}
                                disabled={!attest || submitting}
                                className="h-11 gap-2 rounded-xl bg-[#0052CC] px-8 font-semibold text-white shadow-xs transition hover:bg-[#0047B3] active:scale-[0.99] disabled:bg-slate-200 disabled:text-slate-400 cursor-pointer"
                            >
                                <span>Submit to Validation Pipeline →</span>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Document Inspection Lightbox Dialog */}
            {inspectingDoc && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs"
                    onClick={() => setInspectingDoc(null)}
                >
                    <div
                        className="relative max-h-[90vh] max-w-3xl w-full overflow-hidden rounded-2xl bg-white shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="flex items-center justify-between border-b border-slate-200 bg-[#0B192C] px-5 py-4 text-white">
                            <div>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-[#5EA4FF]">
                                    Civil Document Inspection
                                </span>
                                <h3 className="text-base font-bold text-white">
                                    {formatDocType(inspectingDoc.doc_type)}
                                </h3>
                                {inspectingDoc.ref_number && (
                                    <p className="font-mono text-xs text-slate-300">
                                        Ref: {inspectingDoc.ref_number}
                                    </p>
                                )}
                            </div>
                            <button
                                type="button"
                                onClick={() => setInspectingDoc(null)}
                                className="rounded-lg p-1.5 text-slate-300 hover:bg-white/10 hover:text-white transition cursor-pointer"
                            >
                                <X className="size-5" />
                            </button>
                        </div>

                        {/* Modal Body / Image View */}
                        <div className="flex items-center justify-center bg-slate-100 p-6 min-h-[300px] max-h-[65vh] overflow-auto">
                            {docFilePreviews[inspectingDoc.id] ||
                            inspectingDoc.file_url ||
                            (inspectingDoc.path ? `/storage/${inspectingDoc.path.replace(/^\//, '')}` : null) ? (
                                <img
                                    src={
                                        docFilePreviews[inspectingDoc.id] ||
                                        inspectingDoc.file_url ||
                                        `/storage/${inspectingDoc.path?.replace(/^\//, '')}`
                                    }
                                    alt={formatDocType(inspectingDoc.doc_type)}
                                    className="max-h-[60vh] max-w-full rounded-lg object-contain shadow-md"
                                />
                            ) : (
                                <div className="text-center text-slate-500 py-12">
                                    <CreditCard className="mx-auto size-16 text-slate-400" />
                                    <h4 className="mt-3 text-sm font-bold text-slate-700">
                                        Original Physical Document Presented at Counter
                                    </h4>
                                    <p className="mt-1 text-xs text-slate-400 max-w-sm">
                                        This document was verified in-person by desk staff. No digital upload was submitted during online pre-registration.
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="flex items-center justify-between border-t border-slate-200 bg-white px-5 py-3">
                            <span className="text-xs text-slate-500">
                                Applicant: <strong>{applicantName}</strong>
                            </span>
                            <Button
                                size="sm"
                                onClick={() => setInspectingDoc(null)}
                                className="bg-[#0052CC] text-white hover:bg-[#0047B3] text-xs font-bold"
                            >
                                Close Inspection
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </StaffLayout>
    );
}
