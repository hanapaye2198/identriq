import { Link } from '@inertiajs/react';
import {
    Activity,
    ArrowRight,
    Building2,
    Check,
    CheckCircle2,
    ChevronRight,
    Clock,
    CreditCard,
    ExternalLink,
    FileCheck,
    FileText,
    Fingerprint,
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
    Star,
    Truck,
    User,
    WifiOff,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';

export default function LandingRoadmapThread() {
    const sectionRef = useRef<HTMLElement | null>(null);
    const [scrollProgress, setScrollProgress] = useState(0);

    // Track scroll position through the roadmap section
    useEffect(() => {
        let ticking = false;
        const handleScroll = () => {
            if (!sectionRef.current) return;
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    const rect = sectionRef.current!.getBoundingClientRect();
                    const windowHeight = window.innerHeight;
                    const totalDistance = rect.height - windowHeight * 0.6;
                    if (totalDistance > 0) {
                        const current = -rect.top + windowHeight * 0.3;
                        const p = Math.max(0, Math.min(1, current / totalDistance));
                        setScrollProgress(p);
                    }
                    ticking = false;
                });
                ticking = true;
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll();
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Interactive simulator states
    const [biometricScanned, setBiometricScanned] = useState(false);
    const [abisScanning, setAbisScanning] = useState(false);
    const [cardTilted, setCardTilted] = useState(false);

    const triggerBiometricScan = () => {
        setBiometricScanned(false);
        setTimeout(() => setBiometricScanned(true), 900);
    };

    const triggerAbisMatch = () => {
        setAbisScanning(true);
        setTimeout(() => setAbisScanning(false), 1200);
    };

    return (
        <section
            id="roadmap"
            ref={sectionRef}
            aria-label="Official Registration Process"
            className="relative bg-[#071324] py-20 text-white sm:py-28 border-t border-slate-800"
        >
            <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <div className="mx-auto max-w-3xl text-center">
                    <div className="inline-flex items-center gap-2 rounded-full border border-sky-500/30 bg-sky-500/10 px-3.5 py-1 text-xs font-semibold tracking-wider text-sky-300 uppercase">
                        <Building2 className="size-3.5 text-sky-400" aria-hidden="true" />
                        <span>PNG Civil &amp; National Registration Authority</span>
                    </div>

                    <h2 className="mt-4 text-3xl font-black tracking-tight text-white sm:text-5xl">
                        Five Steps to Your National Identity Card
                    </h2>

                    <p className="mt-4 text-base leading-relaxed text-slate-300">
                        Governed by the <em>Civil and National Registration Act</em>. 
                        Pre-register online from your phone or computer, complete biometric enrollment at an accredited provincial center, and receive your legal identity credentials.
                    </p>

                    {/* Process Information Badges */}
                    <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
                        <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-[#0B192C] px-4 py-2 text-xs font-medium text-slate-200">
                            <Clock className="size-4 text-sky-400" aria-hidden="true" />
                            <span>Online Form: <strong>10 Minutes</strong></span>
                        </div>
                        <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-[#0B192C] px-4 py-2 text-xs font-medium text-slate-200">
                            <MapPin className="size-4 text-emerald-400" aria-hidden="true" />
                            <span>In-Person Enrollment: <strong>One 15-Minute Visit</strong></span>
                        </div>
                        <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-[#0B192C] px-4 py-2 text-xs font-medium text-slate-200">
                            <ShieldCheck className="size-4 text-[#C9A227]" aria-hidden="true" />
                            <span>Standard: <strong>ICAO 9303 &amp; ISO 18013-5 mDL</strong></span>
                        </div>
                    </div>
                </div>

                {/* THE CONTINUOUS ROADMAP THREAD */}
                <div className="relative mt-20">
                    {/* Continuous Vertical Thread Line (Left on mobile, Centered on desktop) */}
                    <div 
                        className="absolute top-8 bottom-8 left-6 w-1 -translate-x-1/2 bg-slate-800 lg:left-1/2" 
                        aria-hidden="true"
                    >
                        {/* Dynamic Scroll Fill Indicator */}
                        <div
                            className="w-full bg-gradient-to-b from-[#0052CC] via-[#388BFF] to-[#C9A227] transition-all duration-300"
                            style={{ height: `${scrollProgress * 100}%` }}
                        />
                    </div>

                    {/* =========================================================================
                        MILESTONE 1: Online Pre-Registration & Document Upload
                       ========================================================================= */}
                    <div className="relative mb-24 grid grid-cols-1 items-center gap-8 lg:grid-cols-2 lg:gap-16">
                        {/* Milestone Node Badge */}
                        <div className="absolute left-6 -translate-x-1/2 flex items-center justify-center lg:left-1/2 z-20" aria-hidden="true">
                            <div className="flex size-12 items-center justify-center rounded-2xl border-2 border-[#0052CC] bg-[#071324] text-sm font-black text-white shadow-md">
                                01
                            </div>
                        </div>

                        {/* Instructions Content (Left Side on Desktop) */}
                        <div className="pl-16 lg:pl-0 lg:pr-14 lg:text-right">
                            <div className="inline-flex items-center gap-1.5 rounded-md bg-[#0052CC]/15 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-sky-400 border border-[#0052CC]/30">
                                Step 1 · Online Self-Service
                            </div>
                            <h3 className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">
                                Online Pre-Registration
                            </h3>
                            <p className="mt-3 text-sm leading-relaxed text-slate-300">
                                Complete your personal, civil, and residency information from any smartphone, tablet, or desktop computer. 
                                Verify your phone number via SMS code and upload digital photographs of your supporting documents.
                            </p>

                            <ul className="mt-4 space-y-2 text-xs text-slate-300 lg:flex lg:flex-col lg:items-end">
                                <li className="flex items-center gap-2">
                                    <span>Verify your phone number with an instant 6-digit SMS code (+675)</span>
                                    <CheckCircle2 className="size-4 shrink-0 text-emerald-400" aria-hidden="true" />
                                </li>
                                <li className="flex items-center gap-2">
                                    <span>Upload birth certificates, baptism certificates, or ward councillor letters</span>
                                    <CheckCircle2 className="size-4 shrink-0 text-emerald-400" aria-hidden="true" />
                                </li>
                                <li className="flex items-center gap-2">
                                    <span>No printed application forms or certified photocopies required</span>
                                    <CheckCircle2 className="size-4 shrink-0 text-emerald-400" aria-hidden="true" />
                                </li>
                            </ul>

                            <div className="mt-6 flex flex-wrap items-center gap-3 lg:justify-end">
                                <Link
                                    href="/prereg"
                                    className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-[#0052CC] px-6 text-xs font-bold text-white shadow-sm transition hover:bg-[#0047B3] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                                >
                                    <span>Begin Pre-Registration</span>
                                    <ArrowRight className="size-4" aria-hidden="true" />
                                </Link>
                            </div>
                        </div>

                        {/* Visual Interface Card (Right Side on Desktop) */}
                        <div className="pl-16 lg:pl-14">
                            <div className="overflow-hidden rounded-2xl border border-slate-800 bg-[#0B192C] p-6 shadow-lg">
                                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                                    <div className="flex items-center gap-2">
                                        <div className="flex size-7 items-center justify-center rounded-lg bg-[#0052CC] text-white">
                                            <Phone className="size-3.5" aria-hidden="true" />
                                        </div>
                                        <span className="text-xs font-bold text-white">Mobile Phone Verification</span>
                                    </div>
                                    <span className="rounded-md bg-emerald-500/15 px-2 py-0.5 text-[11px] font-semibold text-emerald-300 border border-emerald-500/30">
                                        +675 Verified
                                    </span>
                                </div>

                                <div className="mt-5 space-y-4">
                                    <div className="rounded-xl bg-[#071324] p-3.5 border border-slate-800">
                                        <div className="text-[11px] text-slate-400">Mobile Contact</div>
                                        <div className="font-mono text-sm font-semibold text-white mt-0.5">+675 7123 4567 (Digicel / Bmobile)</div>
                                    </div>

                                    <div>
                                        <div className="flex items-center justify-between text-xs text-slate-300">
                                            <span>One-Time Passcode (OTP)</span>
                                            <span className="text-sky-400 font-mono text-[11px]">DEMO: 714902</span>
                                        </div>
                                        <div className="mt-2 grid grid-cols-6 gap-2">
                                            {['7', '1', '4', '9', '0', '2'].map((digit, i) => (
                                                <div
                                                    key={i}
                                                    className="flex h-11 items-center justify-center rounded-lg border border-slate-700 bg-[#071324] font-mono text-base font-bold text-white"
                                                >
                                                    {digit}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 rounded-lg bg-emerald-950/40 p-2.5 border border-emerald-800/40 text-[11px] text-emerald-200">
                                        <FileCheck className="size-4 shrink-0 text-emerald-400" aria-hidden="true" />
                                        <span>Document Attached: <strong>Certificate of Birth (Civil Registry)</strong></span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* =========================================================================
                        MILESTONE 2: In-Person Biometric Enrollment
                       ========================================================================= */}
                    <div className="relative mb-24 grid grid-cols-1 items-center gap-8 lg:grid-cols-2 lg:gap-16">
                        {/* Milestone Node Badge */}
                        <div className="absolute left-6 -translate-x-1/2 flex items-center justify-center lg:left-1/2 z-20" aria-hidden="true">
                            <div className="flex size-12 items-center justify-center rounded-2xl border-2 border-[#0052CC] bg-[#071324] text-sm font-black text-white shadow-md">
                                02
                            </div>
                        </div>

                        {/* Visual Interface Card (Left Side on Desktop) */}
                        <div className="order-2 pl-16 lg:order-1 lg:pl-0 lg:pr-14">
                            <div className="overflow-hidden rounded-2xl border border-slate-800 bg-[#0B192C] p-6 shadow-lg">
                                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                                    <div className="flex items-center gap-2">
                                        <div className="flex size-7 items-center justify-center rounded-lg bg-[#0052CC] text-white">
                                            <Fingerprint className="size-4" aria-hidden="true" />
                                        </div>
                                        <span className="text-xs font-bold text-white">Biometric Enrollment Desk</span>
                                    </div>
                                    <span className="text-[11px] font-mono text-slate-400">
                                        Waigani Counter #02
                                    </span>
                                </div>

                                <div className="mt-4 grid grid-cols-2 gap-3">
                                    {/* Facial Photo */}
                                    <div className="flex flex-col items-center justify-center rounded-xl border border-slate-800 bg-[#071324] p-4 text-center">
                                        <div className="relative size-16 rounded-full border-2 border-slate-700 flex items-center justify-center bg-[#0B192C] overflow-hidden">
                                            <User className="size-8 text-slate-400" aria-hidden="true" />
                                        </div>
                                        <span className="mt-2 text-xs font-bold text-white">ICAO 9303 Portrait</span>
                                        <span className="text-[10px] text-emerald-400 font-semibold">Standard Passed</span>
                                    </div>

                                    {/* 10-Print Fingerprint Simulation */}
                                    <button
                                        type="button"
                                        onClick={triggerBiometricScan}
                                        className="flex flex-col items-center justify-center rounded-xl border border-slate-800 bg-[#071324] p-4 text-center cursor-pointer transition hover:border-[#0052CC] hover:bg-slate-900 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#388BFF]"
                                    >
                                        <div className="relative size-16 rounded-2xl border border-[#0052CC]/50 bg-[#0052CC]/10 flex items-center justify-center">
                                            <Fingerprint className={`size-9 transition-colors ${biometricScanned ? 'text-emerald-400' : 'text-sky-400'}`} aria-hidden="true" />
                                        </div>
                                        <span className="mt-2 text-xs font-bold text-white">10-Finger Scanner</span>
                                        <span className={`text-[10px] font-bold ${biometricScanned ? 'text-emerald-400' : 'text-sky-300'}`}>
                                            {biometricScanned ? '✓ 10 Prints Saved' : 'Click to Test Scan'}
                                        </span>
                                    </button>
                                </div>

                                <div className="mt-4 flex items-center justify-between rounded-xl bg-[#071324] p-3 border border-slate-800 text-xs">
                                    <div className="flex items-center gap-2">
                                        <QrCode className="size-4 text-sky-400" aria-hidden="true" />
                                        <span className="font-mono text-slate-300">Appointment QR: POM-2026-9041</span>
                                    </div>
                                    <span className="text-emerald-400 font-semibold text-[11px]">Checked In</span>
                                </div>
                            </div>
                        </div>

                        {/* Instructions Content (Right Side on Desktop) */}
                        <div className="order-1 pl-16 lg:order-2 lg:pl-14">
                            <div className="inline-flex items-center gap-1.5 rounded-md bg-[#0052CC]/15 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-sky-400 border border-[#0052CC]/30">
                                Step 2 · Provincial Office Visit
                            </div>
                            <h3 className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">
                                Biometric Enrollment
                            </h3>
                            <p className="mt-3 text-sm leading-relaxed text-slate-300">
                                Visit your chosen provincial registry office or mobile enrollment kit with your original documents. 
                                A trained registry officer records your digital facial portrait, ten fingerprints, and iris scans in a single 15-minute appointment.
                            </p>

                            <ul className="mt-4 space-y-2 text-xs text-slate-300">
                                <li className="flex items-center gap-2">
                                    <CheckCircle2 className="size-4 shrink-0 text-emerald-400" aria-hidden="true" />
                                    <span>Accredited centers operating across all 22 provinces</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <CheckCircle2 className="size-4 shrink-0 text-emerald-400" aria-hidden="true" />
                                    <span>High-resolution portrait and 10-finger slap capture compliant with ICAO 9303</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <CheckCircle2 className="size-4 shrink-0 text-emerald-400" aria-hidden="true" />
                                    <span>Original document inspection against civil registry archives</span>
                                </li>
                            </ul>

                            <div className="mt-6 flex flex-wrap items-center gap-3">
                                <Link
                                    href="/centers"
                                    className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 px-5 text-xs font-bold text-white transition hover:bg-slate-700 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                                >
                                    <MapPin className="size-4 text-sky-400" aria-hidden="true" />
                                    <span>Find Your Provincial Registry Office</span>
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* =========================================================================
                        MILESTONE 3: Civil Registry Verification & ABIS Deduplication
                       ========================================================================= */}
                    <div className="relative mb-24 grid grid-cols-1 items-center gap-8 lg:grid-cols-2 lg:gap-16">
                        {/* Milestone Node Badge */}
                        <div className="absolute left-6 -translate-x-1/2 flex items-center justify-center lg:left-1/2 z-20" aria-hidden="true">
                            <div className="flex size-12 items-center justify-center rounded-2xl border-2 border-[#0052CC] bg-[#071324] text-sm font-black text-white shadow-md">
                                03
                            </div>
                        </div>

                        {/* Instructions Content (Left Side on Desktop) */}
                        <div className="pl-16 lg:pl-0 lg:pr-14 lg:text-right">
                            <div className="inline-flex items-center gap-1.5 rounded-md bg-[#0052CC]/15 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-sky-400 border border-[#0052CC]/30">
                                Step 3 · Civil Registry Clearance
                            </div>
                            <h3 className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">
                                ABIS Deduplication &amp; Civil Verification
                            </h3>
                            <p className="mt-3 text-sm leading-relaxed text-slate-300">
                                Your enrollment records undergo automated 1:N deduplication against the national civil database. 
                                This ensures no individual can obtain duplicate credentials, protecting citizen identities and public voting rolls.
                            </p>

                            <ul className="mt-4 space-y-2 text-xs text-slate-300 lg:flex lg:flex-col lg:items-end">
                                <li className="flex items-center gap-2">
                                    <span>Automated cross-check across fingerprint and facial biometric records</span>
                                    <CheckCircle2 className="size-4 shrink-0 text-emerald-400" aria-hidden="true" />
                                </li>
                                <li className="flex items-center gap-2">
                                    <span>Validation with National Civil Registry &amp; Vital Statistics birth ledgers</span>
                                    <CheckCircle2 className="size-4 shrink-0 text-emerald-400" aria-hidden="true" />
                                </li>
                                <li className="flex items-center gap-2">
                                    <span>Adjudication officers review exceptions and provincial name spellings</span>
                                    <CheckCircle2 className="size-4 shrink-0 text-emerald-400" aria-hidden="true" />
                                </li>
                            </ul>

                            <div className="mt-6 flex flex-wrap items-center gap-3 lg:justify-end">
                                <Link
                                    href="/admin/validation"
                                    className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 px-5 text-xs font-bold text-white transition hover:bg-slate-700 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                                >
                                    <Shield className="size-4 text-sky-400" aria-hidden="true" />
                                    <span>Registry Officer Verification Console</span>
                                </Link>
                            </div>
                        </div>

                        {/* Visual Interface Card (Right Side on Desktop) */}
                        <div className="pl-16 lg:pl-14">
                            <div className="overflow-hidden rounded-2xl border border-slate-800 bg-[#0B192C] p-6 shadow-lg">
                                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                                    <div className="flex items-center gap-2">
                                        <div className="flex size-7 items-center justify-center rounded-lg bg-[#0052CC] text-white">
                                            <Activity className="size-4" aria-hidden="true" />
                                        </div>
                                        <span className="text-xs font-bold text-white">Civil Registry ABIS Engine</span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={triggerAbisMatch}
                                        className="inline-flex min-h-[32px] items-center gap-1.5 text-xs font-bold text-sky-400 hover:text-sky-300 cursor-pointer focus-visible:outline-none focus-visible:underline"
                                    >
                                        <RefreshCw className={`size-3 ${abisScanning ? 'animate-spin' : ''}`} aria-hidden="true" />
                                        <span>{abisScanning ? 'Checking Registry...' : 'Simulate Match'}</span>
                                    </button>
                                </div>

                                <div className="mt-4 space-y-3">
                                    <div className="rounded-xl border border-slate-800 bg-[#071324] p-3.5">
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="text-slate-300">Biometric Uniqueness Score</span>
                                            <span className="font-mono font-bold text-emerald-400">99.8% UNIQUE</span>
                                        </div>
                                        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-800">
                                            <div
                                                className={`h-full bg-gradient-to-r from-[#0052CC] to-emerald-400 transition-all duration-700 ${
                                                    abisScanning ? 'w-1/3 animate-pulse' : 'w-full'
                                                }`}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2 text-xs">
                                        <div className="rounded-lg bg-[#071324] p-2.5 border border-slate-800">
                                            <div className="text-[10px] text-slate-400">Civil Registry Record</div>
                                            <div className="font-semibold text-white mt-0.5">VERIFIED ACTIVE</div>
                                        </div>
                                        <div className="rounded-lg bg-[#071324] p-2.5 border border-slate-800">
                                            <div className="text-[10px] text-slate-400">Conflict Flags</div>
                                            <div className="font-semibold text-emerald-400 mt-0.5">0 Duplicates Found</div>
                                        </div>
                                    </div>

                                    <div className="rounded-lg bg-emerald-950/40 p-2.5 border border-emerald-800/40 text-xs text-emerald-200 flex items-center gap-2">
                                        <Check className="size-4 shrink-0 text-emerald-400" aria-hidden="true" />
                                        <span>Candidate record cleared for national smart card personalization</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* =========================================================================
                        MILESTONE 4: Smart Card Personalization & Laser Engraving
                       ========================================================================= */}
                    <div className="relative mb-24 grid grid-cols-1 items-center gap-8 lg:grid-cols-2 lg:gap-16">
                        {/* Milestone Node Badge */}
                        <div className="absolute left-6 -translate-x-1/2 flex items-center justify-center lg:left-1/2 z-20" aria-hidden="true">
                            <div className="flex size-12 items-center justify-center rounded-2xl border-2 border-[#0052CC] bg-[#071324] text-sm font-black text-white shadow-md">
                                04
                            </div>
                        </div>

                        {/* Visual Interface Card (Left Side on Desktop) */}
                        <div className="order-2 pl-16 lg:order-1 lg:pl-0 lg:pr-14">
                            <div
                                onClick={() => setCardTilted(!cardTilted)}
                                className="group relative cursor-pointer overflow-hidden rounded-2xl border border-slate-700 bg-gradient-to-br from-[#0B192C] via-[#0F2644] to-[#071324] p-6 text-white shadow-xl transition-all duration-300 hover:border-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#388BFF]"
                                role="button"
                                tabIndex={0}
                                aria-label="Interactive National ID Smart Card Preview. Click to toggle card view."
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        e.preventDefault();
                                        setCardTilted(!cardTilted);
                                    }
                                }}
                            >
                                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                                    <div className="flex items-center gap-2">
                                        <div className="flex size-5 items-center justify-center rounded-full bg-[#C9A227] text-black">
                                            <Star className="size-3 fill-black text-black" aria-hidden="true" />
                                        </div>
                                        <span className="font-bold tracking-wider text-xs uppercase text-white">
                                            Independent State of Papua New Guinea
                                        </span>
                                    </div>
                                    <span className="font-mono text-[10px] text-slate-300">ICAO 9303</span>
                                </div>

                                <div className="mt-5 flex items-center gap-4">
                                    <div className="flex size-14 items-center justify-center rounded-xl bg-slate-900 border border-slate-700 text-slate-300 shadow-inner">
                                        <User className="size-8" aria-hidden="true" />
                                    </div>

                                    <div>
                                        <div className="text-[10px] uppercase tracking-wider text-slate-400">
                                            National Citizen Identity Card
                                        </div>
                                        <div className="text-base font-bold text-white tracking-wide">
                                            KILA M. AMINI
                                        </div>
                                        <div className="mt-0.5 font-mono text-sm font-bold text-[#C9A227] tracking-wider">
                                            PNG-2026-004128
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-5 flex items-center justify-between border-t border-slate-800 pt-3 text-[11px] text-slate-300">
                                    <div className="flex items-center gap-1.5">
                                        <Lock className="size-3.5 text-emerald-400" aria-hidden="true" />
                                        <span>Polycarbonate Laser Engraved</span>
                                    </div>
                                    <span className="font-mono text-sky-400">Contactless Chip Active</span>
                                </div>
                            </div>
                        </div>

                        {/* Instructions Content (Right Side on Desktop) */}
                        <div className="order-1 pl-16 lg:order-2 lg:pl-14">
                            <div className="inline-flex items-center gap-1.5 rounded-md bg-[#0052CC]/15 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-sky-400 border border-[#0052CC]/30">
                                Step 4 · High-Security Production
                            </div>
                            <h3 className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">
                                Smart Card Personalization
                            </h3>
                            <p className="mt-3 text-sm leading-relaxed text-slate-300">
                                After verification approval, your lifetime National ID number (<span className="font-mono text-[#C9A227]">PNG-2026-XXXXXX</span>) is issued. 
                                Your card is manufactured on multi-layer composite polycarbonate with laser-engraved personal data and an embedded ICAO 9303 chip.
                            </p>

                            <ul className="mt-4 space-y-2 text-xs text-slate-300">
                                <li className="flex items-center gap-2">
                                    <CheckCircle2 className="size-4 shrink-0 text-emerald-400" aria-hidden="true" />
                                    <span>Laser engraving etched directly into the plastic layers prevents alteration</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <CheckCircle2 className="size-4 shrink-0 text-emerald-400" aria-hidden="true" />
                                    <span>Contactless electronic chip stores cryptographically signed biometric templates</span>
                                </li>
                                <li className="flex items-center gap-2">
                                    <CheckCircle2 className="size-4 shrink-0 text-emerald-400" aria-hidden="true" />
                                    <span>Compliant with Bank of PNG and International Civil Aviation standards</span>
                                </li>
                            </ul>

                            <div className="mt-6 flex flex-wrap items-center gap-3">
                                <Link
                                    href="/admin/issuance"
                                    className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 px-5 text-xs font-bold text-white transition hover:bg-slate-700 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                                >
                                    <CreditCard className="size-4 text-sky-400" aria-hidden="true" />
                                    <span>Card Issuance Production Desk</span>
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* =========================================================================
                        MILESTONE 5: Distribution & Offline Verification
                       ========================================================================= */}
                    <div className="relative grid grid-cols-1 items-center gap-8 lg:grid-cols-2 lg:gap-16">
                        {/* Milestone Node Badge */}
                        <div className="absolute left-6 -translate-x-1/2 flex items-center justify-center lg:left-1/2 z-20" aria-hidden="true">
                            <div className="flex size-12 items-center justify-center rounded-2xl border-2 border-[#C9A227] bg-[#071324] text-sm font-black text-[#C9A227] shadow-md">
                                05
                            </div>
                        </div>

                        {/* Instructions Content (Left Side on Desktop) */}
                        <div className="pl-16 lg:pl-0 lg:pr-14 lg:text-right">
                            <div className="inline-flex items-center gap-1.5 rounded-md bg-[#C9A227]/15 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-[#C9A227] border border-[#C9A227]/30">
                                Step 5 · Collection &amp; Daily Use
                            </div>
                            <h3 className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">
                                Collection &amp; Offline Verification
                            </h3>
                            <p className="mt-3 text-sm leading-relaxed text-slate-300">
                                Collect your physical card at your provincial registry office or receive dispatch via Post PNG Express. 
                                The card functions everywhere in Papua New Guinea—including remote districts without internet or mobile reception.
                            </p>

                            <ul className="mt-4 space-y-2 text-xs text-slate-300 lg:flex lg:flex-col lg:items-end">
                                <li className="flex items-center gap-2">
                                    <span>Offline QR code verification with ECDSA digital signature validation</span>
                                    <CheckCircle2 className="size-4 shrink-0 text-emerald-400" aria-hidden="true" />
                                </li>
                                <li className="flex items-center gap-2">
                                    <span>Accepted by BSP Financial Group, Kina Bank, and Nasfund without paperwork</span>
                                    <CheckCircle2 className="size-4 shrink-0 text-emerald-400" aria-hidden="true" />
                                </li>
                                <li className="flex items-center gap-2">
                                    <span>Track your application status 24/7 using your reference number</span>
                                    <CheckCircle2 className="size-4 shrink-0 text-emerald-400" aria-hidden="true" />
                                </li>
                            </ul>

                            <div className="mt-6 flex flex-wrap items-center gap-3 lg:justify-end">
                                <Link
                                    href="/track"
                                    className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-[#0052CC] px-6 text-xs font-bold text-white shadow-sm transition hover:bg-[#0047B3] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                                >
                                    <span>Track Your Application</span>
                                    <ArrowRight className="size-4" aria-hidden="true" />
                                </Link>
                            </div>
                        </div>

                        {/* Visual Interface Card (Right Side on Desktop) */}
                        <div className="pl-16 lg:pl-14">
                            <div className="overflow-hidden rounded-2xl border border-slate-800 bg-[#0B192C] p-6 shadow-lg">
                                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                                    <div className="flex items-center gap-2">
                                        <div className="flex size-7 items-center justify-center rounded-lg bg-[#C9A227] text-black">
                                            <WifiOff className="size-4" aria-hidden="true" />
                                        </div>
                                        <span className="text-xs font-bold text-white">Offline Turnstile &amp; Merchant Scan</span>
                                    </div>
                                    <span className="rounded-md bg-emerald-500/15 px-2 py-0.5 text-[11px] font-semibold text-emerald-300 border border-emerald-500/30">
                                        Offline Ready
                                    </span>
                                </div>

                                <div className="mt-4 space-y-3">
                                    <div className="rounded-xl border border-slate-800 bg-[#071324] p-3.5">
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="text-slate-300">Cryptographic Check (Zero Mobile Data)</span>
                                            <span className="font-mono text-emerald-400 font-bold">12ms Response</span>
                                        </div>
                                        <p className="mt-1 text-[11px] text-slate-400">
                                            Device reads public key certificate and authenticates national signature locally.
                                        </p>
                                    </div>

                                    <div className="rounded-xl border border-slate-800 bg-[#071324] p-3 text-xs">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Truck className="size-4 text-sky-400" aria-hidden="true" />
                                                <span className="font-medium text-white">Post PNG Express Tracking</span>
                                            </div>
                                            <span className="font-mono text-emerald-400 font-semibold">Ready for Collection</span>
                                        </div>
                                        <p className="mt-1 text-[11px] font-mono text-slate-400">
                                            Consignment: PNG-POST-POM-88192
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Final Callout Strip */}
                <div className="mt-20 rounded-2xl border border-slate-800 bg-[#0B192C] p-6 sm:p-8 text-center">
                    <h3 className="text-xl font-bold text-white sm:text-2xl">
                        Ready to enroll? Get your National ID underway
                    </h3>
                    <p className="mx-auto mt-2 max-w-xl text-xs text-slate-300 sm:text-sm">
                        Pre-register online to reserve your biometric appointment at any provincial civil registry office.
                    </p>
                    <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
                        <Link
                            href="/prereg"
                            className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-[#0052CC] px-6 text-xs font-bold text-white shadow-sm transition hover:bg-[#0047B3] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                        >
                            <span>Start Pre-Registration Online</span>
                            <ArrowRight className="size-4" aria-hidden="true" />
                        </Link>
                        <Link
                            href="/track"
                            className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 px-5 text-xs font-bold text-white transition hover:bg-slate-700 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                        >
                            <span>Check Existing Application</span>
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}
