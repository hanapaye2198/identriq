import { Link } from '@inertiajs/react';
import {
    ArrowRight,
    Building2,
    Calendar,
    Check,
    CheckCircle2,
    ChevronRight,
    Clock,
    CreditCard,
    FileCheck,
    FileText,
    Fingerprint,
    HelpCircle,
    Info,
    Lock,
    MapPin,
    Phone,
    QrCode,
    RefreshCw,
    Scan,
    Shield,
    ShieldCheck,
    Smartphone,
    Sparkles,
    Star,
    Truck,
    User,
    Wifi,
} from 'lucide-react';
import { useState } from 'react';
import SmartCard3D from '@/components/landing/smart-card-3d';

interface RoadmapStep {
    id: number;
    badge: string;
    title: string;
    subtitle: string;
    timeEstimate: string;
    description: string;
}

const ROADMAP_STEPS: RoadmapStep[] = [
    {
        id: 1,
        badge: 'Step 1',
        title: 'Online Pre-Registration',
        subtitle: 'From any phone or browser',
        timeEstimate: '5–10 mins',
        description:
            'Enter your basic citizen details, family heritage, and mobile number. You will receive an immediate SMS reference code.',
    },
    {
        id: 2,
        badge: 'Step 2',
        title: 'Check Required Documents',
        subtitle: 'Bring 1 supporting record',
        timeEstimate: 'Before your visit',
        description:
            'Prepare your green birth certificate, church baptismal record, clinic book, or a signed letter from your local ward councillor.',
    },
    {
        id: 3,
        badge: 'Step 3',
        title: 'Choose a Registry Center',
        subtitle: 'All 22 provinces connected',
        timeEstimate: 'Instant booking',
        description:
            'Select your nearest provincial office or mobile enrollment patrol. Choose a morning or afternoon arrival window to skip the regular queue.',
    },
    {
        id: 4,
        badge: 'Step 4',
        title: 'Express Biometric Visit',
        subtitle: 'Photo & fingerprint scan',
        timeEstimate: '5 mins at counter',
        description:
            'Walk into the express pre-registration desk. An enrollment officer captures your digital photo and fingerprints with zero paper delays.',
    },
    {
        id: 5,
        badge: 'Step 5',
        title: 'Receive & Use Your ID',
        subtitle: 'Physical card & digital NFC',
        timeEstimate: 'Lifelong credential',
        description:
            'Collect your secure polycarbonate Smart Card. Instantly verify your identity for BSP/Kina Bank accounts, Nasfund, and SIM cards.',
    },
];

export default function LandingRoadmapThread() {
    const [activeStep, setActiveStep] = useState<number>(1);
    const [selectedDoc, setSelectedDoc] = useState<number>(0);
    const [selectedCenter, setSelectedCenter] = useState<number>(0);

    const DOCUMENTS = [
        {
            title: 'National Birth Certificate',
            category: 'Civil Registry',
            badge: 'Fastest Check',
            description:
                'Green NIDA or Provincial Civil Registry birth certificate with official stamp and registry folio number.',
            validFor: 'Citizens born anywhere in Papua New Guinea',
        },
        {
            title: 'Church Baptismal Certificate',
            category: 'Ecclesiastical Record',
            badge: 'Widely Accepted',
            description:
                'Original baptism or dedication certificate from recognized churches (Catholic, Lutheran, United, SDA, Anglican, Baptist, etc.).',
            validFor: 'Adults without an immediate civil certificate',
        },
        {
            title: 'Ward Councillor Verification Letter',
            category: 'Local Level Government',
            badge: 'Community Verified',
            description:
                'Official letter stamped and signed by your Ward Councillor or Village Peace Officer confirming your clan and residency.',
            validFor: 'Rural and remote communities throughout all 89 districts',
        },
        {
            title: 'Provincial Hospital / Clinic Book',
            category: 'Health Record',
            badge: 'Standard Record',
            description:
                'Child health or maternal health record book showing date and place of birth with maternal details.',
            validFor: 'Applicants providing infant and maternal hospital records',
        },
    ];

    const PROVINCIAL_CENTERS = [
        {
            name: 'Waigani Statistics Haus Center',
            location: 'National Capital District · Port Moresby',
            hours: 'Mon–Fri 8:00 AM – 4:00 PM',
            slots: 'Express Kiosk Available · 4 Active Desks',
            status: 'Open Today',
        },
        {
            name: 'Lae Top Town Civic Center',
            location: 'Morobe Province · Lae City',
            hours: 'Mon–Fri 8:00 AM – 4:00 PM',
            slots: 'Walk-ins & Online Bookings · 3 Active Desks',
            status: 'Open Today',
        },
        {
            name: 'Mt Hagen Provincial Administration',
            location: 'Western Highlands Province · Mt Hagen',
            hours: 'Mon–Fri 8:30 AM – 3:30 PM',
            slots: 'Highlands Highway Hub · 2 Active Desks',
            status: 'Open Today',
        },
        {
            name: 'Kokopo Civic Commercial Complex',
            location: 'East New Britain · Kokopo',
            hours: 'Mon–Fri 8:00 AM – 4:00 PM',
            slots: 'Islands Regional Hub · 2 Active Desks',
            status: 'Open Today',
        },
    ];

    return (
        <section id="roadmap" className="w-full text-ink scroll-mt-20">
            {/* Section Header */}
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 border-b border-line pb-8">
                <div className="max-w-2xl">
                    <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary-tint px-3 py-1 text-xs font-semibold text-primary">
                        <Sparkles className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                        <span>Simple Citizen Guide</span>
                    </div>
                    <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl text-ink">
                        How to Pre-Register Step by Step
                    </h2>
                    <p className="mt-3 text-base text-muted-foreground leading-relaxed">
                        Pre-registering saves you from waiting in long registry lines. Follow these 5 steps to complete your registration and receive your official National ID.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <Link
                        href="/prereg"
                        className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-white shadow-md transition hover:bg-primary-hover active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    >
                        <span>Start Online Pre-Reg</span>
                        <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </Link>
                </div>
            </div>

            {/* Step Selection Tabs (Responsive Stepper) */}
            <div className="mt-8">
                <div
                    role="tablist"
                    aria-label="Pre-registration steps"
                    className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5"
                >
                    {ROADMAP_STEPS.map((step) => {
                        const isCurrent = activeStep === step.id;
                        return (
                            <button
                                key={step.id}
                                role="tab"
                                aria-selected={isCurrent}
                                aria-controls={`roadmap-panel-${step.id}`}
                                onClick={() => setActiveStep(step.id)}
                                className={`group relative flex min-h-[52px] flex-col justify-between rounded-xl border p-4 text-left transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                                    isCurrent
                                        ? 'border-primary bg-primary text-white shadow-md'
                                        : 'border-line bg-surface hover:border-primary-border hover:bg-canvas text-ink'
                                }`}
                            >
                                <div className="flex items-center justify-between w-full">
                                    <span
                                        className={`inline-flex h-6 items-center justify-center rounded-md px-2 text-xs font-bold ${
                                            isCurrent
                                                ? 'bg-white text-primary'
                                                : 'bg-primary-tint text-primary'
                                        }`}
                                    >
                                        {step.badge}
                                    </span>
                                    <span
                                        className={`text-[11px] font-medium ${
                                            isCurrent ? 'text-white/80' : 'text-muted-foreground'
                                        }`}
                                    >
                                        {step.timeEstimate}
                                    </span>
                                </div>

                                <div className="mt-3">
                                    <div
                                        className={`text-sm font-bold leading-tight ${
                                            isCurrent ? 'text-white' : 'text-ink'
                                        }`}
                                    >
                                        {step.title}
                                    </div>
                                    <div
                                        className={`mt-1 text-xs truncate ${
                                            isCurrent ? 'text-white/80' : 'text-muted-foreground'
                                        }`}
                                    >
                                        {step.subtitle}
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Dynamic Interactive Stage Viewer */}
            <div className="mt-6 overflow-hidden rounded-2xl border border-line bg-surface p-6 sm:p-8 lg:p-10 shadow-sm">
                {/* STAGE 1: ONLINE PRE-REGISTRATION INTAKE */}
                {activeStep === 1 && (
                    <div className="grid gap-8 lg:grid-cols-[1fr_420px] lg:items-center">
                        <div className="space-y-4">
                            <div className="inline-flex items-center gap-2 rounded-lg bg-primary-tint px-3 py-1 text-xs font-semibold text-primary">
                                <Smartphone className="h-4 w-4" />
                                <span>Takes only 5 to 10 minutes</span>
                            </div>

                            <h3 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">
                                1. Fill In Your Citizen Information Online
                            </h3>

                            <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
                                You don’t need to stand in line at the provincial office just to fill out paper forms. Complete your pre-registration from home, your workplace, or a community center on any smartphone or computer.
                            </p>

                            <div className="space-y-3 pt-2">
                                <div className="flex items-start gap-3 rounded-xl border border-line bg-canvas p-3.5">
                                    <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                                    <div className="text-sm">
                                        <strong className="font-semibold text-ink">Personal &amp; Clan Details:</strong>
                                        <span className="text-muted-foreground ml-1">
                                            Enter your full legal name, date of birth, sex, village, and Local Level Government (LLG).
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3 rounded-xl border border-line bg-canvas p-3.5">
                                    <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                                    <div className="text-sm">
                                        <strong className="font-semibold text-ink">Instant SMS Booking Code:</strong>
                                        <span className="text-muted-foreground ml-1">
                                            Receive your 8-digit reference code (<code className="font-mono text-primary font-bold">PNG-PR-XXXXXX</code>) directly to your Digicel or Vodafone phone.
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3 rounded-xl border border-line bg-canvas p-3.5">
                                    <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                                    <div className="text-sm">
                                        <strong className="font-semibold text-ink">Save &amp; Resume Anytime:</strong>
                                        <span className="text-muted-foreground ml-1">
                                            If you need to check details with your family, your draft stays saved for 30 days.
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 flex flex-wrap items-center gap-4">
                                <Link
                                    href="/prereg"
                                    className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-white shadow transition hover:bg-primary-hover active:scale-[0.98]"
                                >
                                    <span>Begin Step 1: Pre-Register Now</span>
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                                <span className="text-xs text-muted-foreground font-medium">
                                    Free official enrollment · No fees
                                </span>
                            </div>
                        </div>

                        {/* Interactive Mobile Form Simulator */}
                        <div className="rounded-2xl border border-line bg-canvas p-5 sm:p-6 shadow-inner">
                            <div className="mx-auto max-w-sm rounded-2xl border-2 border-line bg-surface p-4 shadow-md">
                                <div className="flex items-center justify-between border-b border-line pb-3">
                                    <div className="flex items-center gap-2">
                                        <img src="/images/identriq-mark.png" alt="" className="h-5 w-5 object-contain" />
                                        <span className="text-xs font-bold text-ink">PORTAL PRE-REGISTRATION</span>
                                    </div>
                                    <span className="rounded bg-emerald-50 text-emerald-700 font-mono text-[10px] font-bold px-1.5 py-0.5 border border-emerald-200">
                                        ONLINE
                                    </span>
                                </div>

                                <div className="mt-4 space-y-3 text-xs">
                                    <div>
                                        <label className="text-[10px] font-bold text-muted-foreground uppercase">
                                            Given Name(s)
                                        </label>
                                        <div className="mt-1 rounded-lg border border-primary-border bg-primary-tint/30 px-3 py-2 font-semibold text-ink">
                                            Kila Peter
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-[10px] font-bold text-muted-foreground uppercase">
                                            Family / Clan Surname
                                        </label>
                                        <div className="mt-1 rounded-lg border border-primary-border bg-primary-tint/30 px-3 py-2 font-semibold text-ink">
                                            Amini
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <label className="text-[10px] font-bold text-muted-foreground uppercase">
                                                Date of Birth
                                            </label>
                                            <div className="mt-1 rounded-lg border border-line bg-canvas px-3 py-2 font-mono text-ink">
                                                14/04/1994
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold text-muted-foreground uppercase">
                                                Province
                                            </label>
                                            <div className="mt-1 rounded-lg border border-line bg-canvas px-3 py-2 text-ink truncate">
                                                Central Province
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-[10px] font-bold text-muted-foreground uppercase">
                                            Mobile Contact (for SMS reference)
                                        </label>
                                        <div className="mt-1 rounded-lg border border-line bg-canvas px-3 py-2 font-mono text-ink">
                                            +675 7123 4567
                                        </div>
                                    </div>

                                    <div className="rounded-lg bg-emerald-50 p-2.5 text-[11px] text-emerald-800 border border-emerald-200 flex items-center gap-2">
                                        <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                                        <span>Instant SMS verification sent to applicant</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* STAGE 2: PREPARE SUPPORTING DOCUMENTS */}
                {activeStep === 2 && (
                    <div className="space-y-6">
                        <div className="max-w-3xl">
                            <div className="inline-flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 border border-amber-200">
                                <FileCheck className="h-4 w-4" />
                                <span>Bring any 1 recognized document</span>
                            </div>
                            <h3 className="mt-2 text-2xl font-bold tracking-tight text-ink sm:text-3xl">
                                2. What Documents to Bring to Your Visit
                            </h3>
                            <p className="mt-2 text-sm text-muted-foreground sm:text-base leading-relaxed">
                                You do not need expensive lawyer declarations or photocopy certification. Select any of the recognized civil or community documents below to see what is accepted.
                            </p>
                        </div>

                        {/* Interactive Document Cards */}
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            {DOCUMENTS.map((doc, idx) => (
                                <div
                                    key={doc.title}
                                    onClick={() => setSelectedDoc(idx)}
                                    className={`rounded-xl border p-4 transition cursor-pointer flex flex-col justify-between ${
                                        selectedDoc === idx
                                            ? 'border-primary bg-primary-tint/40 shadow-sm ring-1 ring-primary'
                                            : 'border-line bg-canvas hover:border-primary-border'
                                    }`}
                                >
                                    <div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                                {doc.category}
                                            </span>
                                            <span className="rounded bg-primary-tint text-primary text-[10px] font-bold px-1.5 py-0.5 border border-primary-border">
                                                {doc.badge}
                                            </span>
                                        </div>
                                        <div className="mt-2 text-sm font-bold text-ink">{doc.title}</div>
                                        <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                                            {doc.description}
                                        </p>
                                    </div>
                                    <div className="mt-3 border-t border-line pt-2 text-[11px] font-medium text-primary">
                                        Valid for: {doc.validFor}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Helpful Guidance Notice */}
                        <div className="rounded-xl border border-primary-border bg-primary-tint/30 p-4 text-xs text-ink flex items-start gap-3">
                            <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                            <div className="leading-relaxed">
                                <strong className="font-semibold text-primary">What if you don't have a birth certificate?</strong>
                                <span className="ml-1 text-muted-foreground">
                                    No problem! Under the <em>Civil and National Registration Act</em>, a signed confirmation letter from your local ward councillor or church pastor is fully legally recognized for your initial identity verification.
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {/* STAGE 3: SELECT REGISTRY CENTER & TIME */}
                {activeStep === 3 && (
                    <div className="space-y-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <div className="inline-flex items-center gap-2 rounded-lg bg-sky-50 px-3 py-1 text-xs font-semibold text-primary border border-primary-border">
                                    <MapPin className="h-4 w-4" />
                                    <span>22 Provincial Offices &amp; Mobile Teams</span>
                                </div>
                                <h3 className="mt-2 text-2xl font-bold tracking-tight text-ink sm:text-3xl">
                                    3. Select Your Provincial Center
                                </h3>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Choose an office close to you to reserve your biometric appointment window.
                                </p>
                            </div>

                            <Link
                                href="/centers"
                                className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-primary bg-surface px-5 py-2 text-xs font-bold text-primary hover:bg-primary-tint self-start sm:self-auto"
                            >
                                <Building2 className="h-4 w-4" />
                                <span>Browse All Centers Directory</span>
                            </Link>
                        </div>

                        {/* Provincial Centers Showcase */}
                        <div className="grid gap-4 md:grid-cols-2">
                            {PROVINCIAL_CENTERS.map((center, idx) => (
                                <div
                                    key={center.name}
                                    onClick={() => setSelectedCenter(idx)}
                                    className={`rounded-xl border p-5 transition cursor-pointer ${
                                        selectedCenter === idx
                                            ? 'border-primary bg-primary-tint/30 ring-1 ring-primary shadow-sm'
                                            : 'border-line bg-canvas hover:border-primary-border'
                                    }`}
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <div>
                                            <div className="text-sm font-bold text-ink">{center.name}</div>
                                            <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                                                <MapPin className="h-3.5 w-3.5 text-primary" />
                                                <span>{center.location}</span>
                                            </div>
                                        </div>
                                        <span className="rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 border border-emerald-300">
                                            {center.status}
                                        </span>
                                    </div>

                                    <div className="mt-3 grid grid-cols-2 gap-2 text-xs border-t border-line pt-3">
                                        <div>
                                            <span className="text-[10px] text-muted-foreground uppercase font-bold">Hours</span>
                                            <div className="font-semibold text-ink text-[11px] mt-0.5">{center.hours}</div>
                                        </div>
                                        <div>
                                            <span className="text-[10px] text-muted-foreground uppercase font-bold">Desk Capacity</span>
                                            <div className="font-semibold text-primary text-[11px] mt-0.5">{center.slots}</div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="flex items-center justify-between border-t border-line pt-4 text-xs text-muted-foreground">
                            <span>Prefer walk-in? Pre-registered citizens get express fast-track priority at all centers.</span>
                            <Link href="/centers" className="font-semibold text-primary hover:underline">
                                View map &amp; directions →
                            </Link>
                        </div>
                    </div>
                )}

                {/* STAGE 4: IN-PERSON BIOMETRIC CAPTURE */}
                {activeStep === 4 && (
                    <div className="grid gap-8 lg:grid-cols-[1fr_380px] lg:items-center">
                        <div className="space-y-4">
                            <div className="inline-flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800 border border-emerald-200">
                                <Fingerprint className="h-4 w-4 text-emerald-600" />
                                <span>Quick 5-Minute In-Person Step</span>
                            </div>

                            <h3 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">
                                4. Express Biometric Visit &amp; Verification
                            </h3>

                            <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
                                When you arrive at the provincial office, bypass the regular general queue and head straight to the <strong>Pre-Registration Fast-Track Desk</strong>.
                            </p>

                            <div className="space-y-3 pt-2">
                                <div className="flex items-start gap-3 rounded-xl border border-line bg-canvas p-4">
                                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary text-white font-bold text-xs">
                                        1
                                    </div>
                                    <div className="text-sm">
                                        <div className="font-bold text-ink">Show Your SMS Reference Code</div>
                                        <p className="text-xs text-muted-foreground mt-0.5">
                                            The officer pulls up your pre-filled record instantly on their terminal. No re-typing or manual paperwork.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3 rounded-xl border border-line bg-canvas p-4">
                                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary text-white font-bold text-xs">
                                        2
                                    </div>
                                    <div className="text-sm">
                                        <div className="font-bold text-ink">Digital High-Resolution Photo</div>
                                        <p className="text-xs text-muted-foreground mt-0.5">
                                            A standard compliant portrait photograph is taken against the official neutral background.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3 rounded-xl border border-line bg-canvas p-4">
                                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary text-white font-bold text-xs">
                                        3
                                    </div>
                                    <div className="text-sm">
                                        <div className="font-bold text-ink">4-Finger Optical Biometric Capture</div>
                                        <p className="text-xs text-muted-foreground mt-0.5">
                                            Gentle optical scan of your index and thumb fingers. We check your details so no one else can use your identity.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Visual Capture Station Guide */}
                        <div className="rounded-2xl border border-line bg-canvas p-6 text-center space-y-4 shadow-sm">
                            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-white shadow-md">
                                <Scan className="h-8 w-8" />
                            </div>
                            <div>
                                <div className="text-base font-bold text-ink">Fast-Track Enrollment Desk</div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Average in-person processing time: <strong>4 minutes 30 seconds</strong>.
                                </p>
                            </div>
                            <div className="rounded-xl border border-line bg-surface p-4 text-xs text-left space-y-2">
                                <div className="flex items-center justify-between text-muted-foreground">
                                    <span>Pre-reg lookup:</span>
                                    <strong className="text-emerald-700">Instant (SMS)</strong>
                                </div>
                                <div className="flex items-center justify-between text-muted-foreground">
                                    <span>Photo capture:</span>
                                    <strong className="text-ink">~60 secs</strong>
                                </div>
                                <div className="flex items-center justify-between text-muted-foreground">
                                    <span>Fingerprint scan:</span>
                                    <strong className="text-ink">~90 secs</strong>
                                </div>
                                <div className="flex items-center justify-between text-muted-foreground border-t border-line pt-2">
                                    <span>Total visit:</span>
                                    <strong className="text-primary font-bold">&lt; 5 minutes</strong>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* STAGE 5: RECEIVE AND USE YOUR ID (WITH 3D CARD SHOWCASE) */}
                {activeStep === 5 && (
                    <div className="grid gap-8 lg:grid-cols-[1fr_450px] lg:items-center">
                        <div className="space-y-4">
                            <div className="inline-flex items-center gap-2 rounded-lg bg-primary-tint px-3 py-1 text-xs font-semibold text-primary">
                                <Sparkles className="h-4 w-4 text-primary" />
                                <span>Interactive 3D Smart Card Model</span>
                            </div>

                            <h3 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">
                                5. Receive Your Physical &amp; Digital Identity
                            </h3>

                            <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
                                Your identity credential is issued in two complementary formats: a tamper-proof physical smart card and a mobile digital wallet pass with offline cryptographic validation.
                            </p>

                            <div className="space-y-2.5 pt-1 text-xs">
                                <div className="rounded-xl border border-line bg-canvas p-3.5 flex items-start gap-3">
                                    <CreditCard className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                                    <div>
                                        <strong className="font-semibold text-ink text-sm">Polycarbonate Security Smart Card</strong>
                                        <p className="text-muted-foreground mt-0.5">
                                            Laser-engraved with micro-guilloche security patterns, embedded EMV contact chip, and tamper-resistant optical holographic seal.
                                        </p>
                                    </div>
                                </div>

                                <div className="rounded-xl border border-line bg-canvas p-3.5 flex items-start gap-3">
                                    <Smartphone className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                                    <div>
                                        <strong className="font-semibold text-ink text-sm">Digital Mobile Wallet Pass</strong>
                                        <p className="text-muted-foreground mt-0.5">
                                            Store your verified credentials on your phone. Works even in mountain valleys without cellular reception via offline cryptographic verification.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-2 flex flex-wrap items-center gap-4">
                                <Link
                                    href="/track"
                                    className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-white shadow transition hover:bg-primary-hover active:scale-[0.98]"
                                >
                                    <span>Track Your Application Status</span>
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                                <Link
                                    href="/prereg"
                                    className="inline-flex min-h-[44px] items-center justify-center rounded-xl border border-line bg-surface px-5 py-2.5 text-sm font-semibold text-ink hover:bg-canvas"
                                >
                                    <span>Begin Pre-Registration</span>
                                </Link>
                            </div>
                        </div>

                        {/* Interactive 3D Card Interactive Component */}
                        <div className="rounded-2xl border border-line bg-canvas p-4 sm:p-6 shadow-sm">
                            <div className="mb-2 text-center text-xs font-semibold text-muted-foreground">
                                3D Polycarbonate Smart Card · Interactive Simulation
                            </div>
                            <SmartCard3D
                                citizenName="KUMAL, JOHN A."
                                idNumber="785-3049-921-A"
                                dob="14 APR 1988"
                                province="CENTRAL PROVINCE"
                                sex="M"
                                nationality="PAPUA NEW GUINEA"
                                expiryDate="24 OCT 2031"
                                authority="PNG CIVIL REGISTRY"
                                signatureName="John Kumal."
                                photoSrc="/images/john-kumal-portrait-hd.png"
                            />
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}
