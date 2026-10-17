import { Head, Link } from '@inertiajs/react';
import {
    ArrowRight,
    Building2,
    Check,
    CheckCircle2,
    ChevronDown,
    CreditCard,
    ExternalLink,
    FileCheck,
    Fingerprint,
    Globe,
    HelpCircle,
    Landmark,
    Lock,
    MapPin,
    Menu,
    Phone,
    QrCode,
    Search,
    Shield,
    ShieldAlert,
    ShieldCheck,
    Smartphone,
    Sparkles,
    Star,
    Truck,
    Users,
    Wifi,
    X,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import LandingRoadmapThread from '@/components/landing-roadmap-thread';
import DigitalShowcase3D from '@/components/landing/digital-showcase-3d';

const REGIONS = [
    {
        name: 'Southern Region',
        centers: [
            { name: 'Waigani Statistics Haus Center', prov: 'National Capital District', phone: '+675 301 3500' },
            { name: 'Kwikila District Civil Office', prov: 'Central Province', phone: '+675 325 1102' },
            { name: 'Alotau Provincial Administration', prov: 'Milne Bay Province', phone: '+675 641 1234' },
            { name: 'Daru Island Civic Center', prov: 'Western Province', phone: '+675 645 9012' },
        ],
    },
    {
        name: 'Momase Region',
        centers: [
            { name: 'Lae Top Town Registry Hub', prov: 'Morobe Province', phone: '+675 472 1890' },
            { name: 'Madang Civic Center', prov: 'Madang Province', phone: '+675 422 2011' },
            { name: 'Wewak Hill Administrative Office', prov: 'East Sepik Province', phone: '+675 456 2200' },
            { name: 'Vanimo Border Post Center', prov: 'West Sepik (Sandaun)', phone: '+675 457 1198' },
        ],
    },
    {
        name: 'Highlands Region',
        centers: [
            { name: 'Mt Hagen Kapal Haus Hub', prov: 'Western Highlands', phone: '+675 542 1200' },
            { name: 'Goroka Provincial Assembly Center', prov: 'Eastern Highlands', phone: '+675 532 1099' },
            { name: 'Kundiawa Town Civic Desk', prov: 'Simbu (Chimbu)', phone: '+675 535 1400' },
            { name: 'Mendi Valley Registration Office', prov: 'Southern Highlands', phone: '+675 549 1100' },
        ],
    },
    {
        name: 'Islands Region',
        centers: [
            { name: 'Kokopo Civic Center', prov: 'East New Britain', phone: '+675 982 8700' },
            { name: 'Kimbe Town Provincial Hub', prov: 'West New Britain', phone: '+675 983 5000' },
            { name: 'Kavieng Harbour Registry Office', prov: 'New Ireland Province', phone: '+675 984 2100' },
            { name: 'Buka Town Administration Office', prov: 'Autonomous Region of Bougainville', phone: '+675 973 9011' },
        ],
    },
];

const USE_CASES = [
    {
        icon: Landmark,
        badge: 'Banking & Financial',
        title: 'Bank Account Opening',
        description:
            'Open accounts at Bank South Pacific (BSP) and Kina Bank without needing two secondary photo IDs or statutory declarations.',
    },
    {
        icon: Building2,
        badge: 'Superannuation',
        title: 'Nasfund & Nambawan Super',
        description:
            'Biometric verification for superannuation payouts, beneficiary updates, and retirement benefit claims across all provinces.',
    },
    {
        icon: Smartphone,
        badge: 'Telecommunications',
        title: 'Digicel & Vodafone SIM Cards',
        description:
            'Instantly comply with NICTA mandatory SIM registration at any authorized dealer booth without paper photocopying.',
    },
    {
        icon: Globe,
        badge: 'Passports & Border',
        title: 'PNG Immigration (ICA)',
        description:
            'Direct electronic validation for Papua New Guinea passport applications, renewals, and border travel credentials.',
    },
    {
        icon: Users,
        badge: 'Public Service',
        title: 'Government Payroll (Ascender)',
        description:
            'Department of Personnel Management biometric identity checks preventing duplicate payroll entries across all public departments.',
    },
    {
        icon: ShieldCheck,
        badge: 'Customary Lands',
        title: 'Incorporated Land Groups (ILG)',
        description:
            'Secure landowner verification preventing fraudulent royalty claims and protecting customary clan records.',
    },
];

const FAQS = [
    {
        q: 'How much does it cost to pre-register and receive a National ID?',
        a: 'Registration is 100% free of charge (0 PGK). The Government of Papua New Guinea funds the program under the Civil and National Registration Act. Never pay any fee or facilitation bribe to anyone.',
    },
    {
        q: 'What if I do not have a hospital birth certificate?',
        a: 'You can still register! A signed confirmation letter from your local Ward Councillor, village peace officer, or church pastor is legally recognized for your initial identity verification.',
    },
    {
        q: 'How long does the in-person biometric visit take?',
        a: 'Citizens who pre-register online spend an average of less than 5 minutes at the enrollment counter. Because your information is already queued, the officer only needs to take your photo and fingerprint scan.',
    },
    {
        q: 'How does the ID work in remote areas without cellular reception?',
        a: 'The National ID smart card carries a tamper-proof cryptographic microchip, and the mobile pass uses an offline digital signature. Verified field officers and bank agents can validate your card with handheld scanners even in remote valleys with zero network coverage.',
    },
];

export default function Welcome() {
    const [menuOpen, setMenuOpen] = useState(false);
    const [selectedRegion, setSelectedRegion] = useState(0);
    const [openFaq, setOpenFaq] = useState<number | null>(0);
    const toggleRef = useRef<HTMLButtonElement | null>(null);

    const closeMenu = () => setMenuOpen(false);

    useEffect(() => {
        if (!menuOpen) return;
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setMenuOpen(false);
                toggleRef.current?.focus();
            }
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [menuOpen]);

    const focusRingLight =
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#47F4C7] focus-visible:ring-offset-2 focus-visible:ring-offset-black';

    return (
        <>
            <Head title="IDENTRIQ for Papua New Guinea — National Digital ID" />

            <div className="min-h-screen bg-canvas text-base text-ink antialiased">
                <a
                    href="#main"
                    className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[70] focus:rounded-lg focus:bg-surface focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-ink shadow-lg"
                >
                    Skip to content
                </a>

                {/* =========================================================================
                    SCREEN 1: FULL-SCREEN FAYDA-STYLE HERO OCCUPYING 100VH ON FIRST GLANCE
                   ========================================================================= */}
                <section className="relative min-h-screen w-full flex flex-col justify-between overflow-hidden bg-[#071324] text-white">
                    {/* Full-bleed authentic documentary background image */}
                    <div className="absolute inset-0 z-0">
                        <img
                            src="/images/png-hero-fayda-full.jpg"
                            alt="Papua New Guinean citizen at official biometric registration station"
                            className="h-full w-full object-cover object-center"
                        />
                        {/* Cinematic gradient overlay for maximum legibility and Fayda vignette */}
                        <div className="absolute inset-0 bg-gradient-to-r from-[#071324]/95 via-[#071324]/75 to-[#071324]/40" />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#071324] via-transparent to-[#071324]/60" />
                    </div>

                    {/* TOP FLOATING NAVIGATION BAR (Fayda Style) */}
                    <header className="relative z-20 w-full pt-2">
                        {/* Top official sovereign micro-bar */}
                        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-12 py-1.5 text-xs text-white/70 border-b border-white/10">
                            <div className="flex items-center gap-2">
                                <span className="h-2 w-2 rounded-full bg-[#47F4C7] animate-pulse"></span>
                                <span className="font-semibold text-white/90">Independent State of Papua New Guinea</span>
                                <span className="hidden sm:inline text-white/40">•</span>
                                <span className="hidden sm:inline">Civil &amp; National Registration Authority</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="hidden md:inline font-mono text-[11px] text-white/60">Official System: identriq.gov.pg</span>
                                <div className="inline-flex items-center gap-1 rounded-md border border-white/20 bg-white/10 px-2 py-0.5 text-[11px] font-medium text-white">
                                    <span>English (PNG)</span>
                                    <ChevronDown className="h-3 w-3" />
                                </div>
                            </div>
                        </div>

                        {/* Main transparent header */}
                        <nav
                            aria-label="Primary"
                            className="mx-auto flex h-20 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-12"
                        >
                            {/* Logo + National ID Brand */}
                            <Link href="/" aria-label="IDENTRIQ home" className="flex items-center gap-3 group">
                                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 p-1.5 backdrop-blur-md border border-white/20 group-hover:border-[#47F4C7] transition">
                                    <img src="/images/identriq-mark.png" alt="IDENTRIQ" className="h-full w-full object-contain invert" />
                                </div>
                                <div className="flex flex-col">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xl font-black tracking-tight text-white leading-none">IDENTRIQ</span>
                                        <span className="rounded bg-[#47F4C7]/20 px-1.5 py-0.5 font-mono text-[9px] font-bold text-[#47F4C7] border border-[#47F4C7]/30">
                                            MOSIP
                                        </span>
                                    </div>
                                    <span className="text-[11px] text-white/75 font-medium tracking-wide">
                                        National ID · Namba Bilong Olgeta
                                    </span>
                                </div>
                            </Link>

                            {/* Desktop Links (Fayda Style with Active Indicator) */}
                            <div className="hidden items-center gap-7 lg:flex text-sm font-semibold">
                                <Link href="/" className="text-white relative py-2 text-[#47F4C7]">
                                    Home
                                    <span className="absolute bottom-0 inset-x-0 h-0.5 bg-[#47F4C7] rounded-full"></span>
                                </Link>
                                <a href="#roadmap" className="text-white/80 hover:text-white transition py-2">
                                    How to Register
                                </a>
                                <a href="#showcase" className="text-white/80 hover:text-white transition py-2 flex items-center gap-1">
                                    <span>3D Credentials</span>
                                    <span className="rounded-full bg-gold/20 px-1.5 py-0.2 text-[9px] font-bold text-gold border border-gold/40">NEW</span>
                                </a>
                                <a href="#where-to-use" className="text-white/80 hover:text-white transition py-2">
                                    Where to Use
                                </a>
                                <a href="#centers" className="text-white/80 hover:text-white transition py-2">
                                    Provincial Hubs
                                </a>
                                <a href="#faq" className="text-white/80 hover:text-white transition py-2">
                                    FAQ
                                </a>
                                <Link href="/track" className="text-white/80 hover:text-white transition py-2">
                                    Track Status
                                </Link>
                            </div>

                            {/* Desktop Action Button */}
                            <div className="hidden lg:flex items-center gap-3">
                                <Link
                                    href="/prereg"
                                    className="inline-flex h-11 items-center justify-center rounded-full bg-[#47F4C7] px-6 text-sm font-extrabold text-[#071324] shadow-lg shadow-[#47F4C7]/20 transition-all hover:bg-white hover:scale-[1.02] active:scale-[0.98]"
                                >
                                    Pre-Register Now →
                                </Link>
                            </div>

                            {/* Mobile Hamburger */}
                            <button
                                ref={toggleRef}
                                type="button"
                                onClick={() => setMenuOpen((open) => !open)}
                                aria-expanded={menuOpen}
                                aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
                                className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-white/20 text-white lg:hidden bg-white/10 backdrop-blur-md"
                            >
                                {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                            </button>
                        </nav>

                        {/* Mobile dropdown menu */}
                        {menuOpen && (
                            <div className="absolute inset-x-0 top-full border-t border-white/10 bg-[#071324]/95 p-5 lg:hidden shadow-2xl backdrop-blur-xl z-50">
                                <ul className="space-y-3">
                                    <li>
                                        <a href="#roadmap" onClick={closeMenu} className="block py-2 text-base font-semibold text-white/90">
                                            How to Register (5 Steps)
                                        </a>
                                    </li>
                                    <li>
                                        <a href="#showcase" onClick={closeMenu} className="block py-2 text-base font-semibold text-[#47F4C7]">
                                            Interactive 3D Smart Card &amp; Mobile Pass
                                        </a>
                                    </li>
                                    <li>
                                        <a href="#where-to-use" onClick={closeMenu} className="block py-2 text-base font-semibold text-white/90">
                                            Where to Use in PNG
                                        </a>
                                    </li>
                                    <li>
                                        <a href="#centers" onClick={closeMenu} className="block py-2 text-base font-semibold text-white/90">
                                            22 Provincial Registry Centers
                                        </a>
                                    </li>
                                    <li>
                                        <a href="#faq" onClick={closeMenu} className="block py-2 text-base font-semibold text-white/90">
                                            Citizen Questions &amp; Support
                                        </a>
                                    </li>
                                    <li>
                                        <Link href="/track" onClick={closeMenu} className="block py-2 text-base font-semibold text-white/90">
                                            Track Existing Application
                                        </Link>
                                    </li>
                                    <li className="pt-2">
                                        <Link
                                            href="/prereg"
                                            onClick={closeMenu}
                                            className="flex h-12 w-full items-center justify-center rounded-full bg-[#47F4C7] text-sm font-extrabold text-[#071324] shadow-md"
                                        >
                                            Start Free Pre-Registration
                                        </Link>
                                    </li>
                                </ul>
                            </div>
                        )}
                    </header>

                    {/* HERO CENTER CONTENT (Fayda Title & Action Pills Row) */}
                    <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-12 py-10 sm:py-16 my-auto">
                        <div className="max-w-3xl">
                            {/* Two-tone Headline: IDENTRIQ in cyan, for Papua New Guinea in white */}
                            <h1 className="text-4xl font-black tracking-tight sm:text-6xl lg:text-7xl leading-[1.08]">
                                <span className="text-[#47F4C7] drop-shadow-sm">IDENTRIQ</span>{' '}
                                <span className="text-white">for Papua New Guinea</span>
                            </h1>

                            {/* Subtitle matching Fayda's structure */}
                            <p className="mt-5 text-base sm:text-xl leading-relaxed text-white/90 font-normal max-w-2xl">
                                A robust digital identification at the national level, offering real-time biometric authentication and eKYC for all use-cases.
                            </p>

                            <p className="mt-3 text-xs sm:text-sm text-white/70 max-w-xl">
                                Established under the Civil and National Registration Act as a foundational legal ID for Papua New Guinea.
                            </p>

                            {/* HORIZONTAL ACTION PILLS ROW (Exactly like Fayda) */}
                            <div className="mt-8 flex flex-wrap items-center gap-3 sm:gap-4">
                                {/* Pill 1: Solid Cyan Filled (Primary) */}
                                <Link
                                    href="/prereg"
                                    className="inline-flex min-h-[46px] items-center justify-center rounded-full bg-[#47F4C7] px-7 py-2.5 text-sm font-black text-[#071324] shadow-xl shadow-[#47F4C7]/25 transition hover:bg-white hover:scale-[1.03] active:scale-[0.98]"
                                >
                                    Register For IDENTRIQ!
                                </Link>

                                {/* Pill 2: Outlined Cyan Pill */}
                                <Link
                                    href="/track"
                                    className="inline-flex min-h-[46px] items-center justify-center rounded-full border-2 border-[#47F4C7]/70 bg-black/20 px-6 py-2.5 text-sm font-bold text-[#47F4C7] backdrop-blur-md transition hover:bg-[#47F4C7]/15 hover:border-[#47F4C7] hover:scale-[1.02]"
                                >
                                    Update your Details
                                </Link>

                                {/* Pill 3: Outlined / Solid Card Print Pill */}
                                <a
                                    href="#showcase"
                                    className="inline-flex min-h-[46px] items-center justify-center rounded-full border-2 border-[#47F4C7]/70 bg-black/20 px-6 py-2.5 text-sm font-bold text-[#47F4C7] backdrop-blur-md transition hover:bg-[#47F4C7]/15 hover:border-[#47F4C7] hover:scale-[1.02]"
                                >
                                    Order Card Print &amp; 3D Model
                                </a>

                                {/* Pill 4: Support Pill */}
                                <a
                                    href="#faq"
                                    className="inline-flex min-h-[46px] items-center justify-center rounded-full border-2 border-[#47F4C7]/70 bg-black/20 px-6 py-2.5 text-sm font-bold text-[#47F4C7] backdrop-blur-md transition hover:bg-[#47F4C7]/15 hover:border-[#47F4C7] hover:scale-[1.02]"
                                >
                                    Get Support
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* DOCKED BOTTOM FROSTED GLASS STATS COUNTER BAR (Fayda Style) */}
                    <div className="relative z-20 w-full border-t border-white/15 bg-black/50 backdrop-blur-md py-5 sm:py-6 text-white shadow-2xl">
                        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-12">
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 md:gap-0 divide-y md:divide-y-0 md:divide-x divide-white/15">
                                {/* Stat 1 */}
                                <div className="text-center px-3 pt-2 md:pt-0">
                                    <div className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-mono text-white tracking-tight">
                                        124,592
                                    </div>
                                    <div className="mt-1 text-[11px] sm:text-xs text-white/70 font-medium uppercase tracking-wider">
                                        Total Registrations
                                    </div>
                                </div>

                                {/* Stat 2 */}
                                <div className="text-center px-3 pt-2 md:pt-0">
                                    <div className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-mono text-[#47F4C7] tracking-tight">
                                        208,873,154
                                    </div>
                                    <div className="mt-1 text-[11px] sm:text-xs text-white/70 font-medium uppercase tracking-wider">
                                        eKYC (Know Your Customer)
                                    </div>
                                </div>

                                {/* Stat 3 */}
                                <div className="text-center px-3 pt-2 md:pt-0">
                                    <div className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-mono text-white tracking-tight">
                                        22
                                    </div>
                                    <div className="mt-1 text-[11px] sm:text-xs text-white/70 font-medium uppercase tracking-wider">
                                        Provincial Centers Active
                                    </div>
                                </div>

                                {/* Stat 4 */}
                                <div className="text-center px-3 pt-2 md:pt-0">
                                    <div className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-mono text-white tracking-tight">
                                        12,000
                                    </div>
                                    <div className="mt-1 text-[11px] sm:text-xs text-white/70 font-medium uppercase tracking-wider">
                                        Registration Kits
                                    </div>
                                </div>

                                {/* Stat 5 */}
                                <div className="text-center px-3 pt-2 md:pt-0 col-span-2 md:col-span-1">
                                    <div className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-mono text-white tracking-tight">
                                        14,929,141
                                    </div>
                                    <div className="mt-1 text-[11px] sm:text-xs text-white/70 font-medium uppercase tracking-wider">
                                        Printed Cards
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Subtle Scroll Down Prompt */}
                        <div className="mt-3 text-center">
                            <a
                                href="#roadmap"
                                className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-white/60 hover:text-[#47F4C7] transition"
                            >
                                <span>Scroll down for pre-registration roadmap &amp; interactive 3D model</span>
                                <span className="animate-bounce">↓</span>
                            </a>
                        </div>
                    </div>
                </section>

                <main id="main">
                    {/* =========================================================================
                        SCREEN 2: ROADMAP STEP-BY-STEP PRE-REGISTRATION (AFTER USER SCROLLS)
                       ========================================================================= */}
                    <section id="roadmap" className="scroll-mt-6 bg-surface py-12 sm:py-20 border-b border-line">
                        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-12">
                            <LandingRoadmapThread />
                        </div>
                    </section>

                    {/* =========================================================================
                        SCREEN 3: 3D ANIMATION SHOWCASE (PHYSICAL SMART CARD & MOBILE PASS)
                       ========================================================================= */}
                    <section id="showcase" className="scroll-mt-6 bg-canvas py-16 sm:py-24 border-b border-line">
                        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-12">
                            <div className="mb-10 text-center max-w-2xl mx-auto">
                                <div className="inline-flex items-center gap-2 rounded-full border border-primary-border bg-primary-tint px-3.5 py-1 text-xs font-semibold text-primary">
                                    <Sparkles className="h-3.5 w-3.5 text-primary" />
                                    <span>Interactive 3D Technology</span>
                                </div>
                                <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
                                    Explore the 3D Smart Card &amp; Mobile Pass
                                </h2>
                                <p className="mt-3 text-base text-muted-foreground">
                                    Move your cursor or touch the card to inspect the 3D holographic angles. Flip to view the ICAO 9303 MRZ zone and simulate instant offline verification.
                                </p>
                            </div>

                            <DigitalShowcase3D />
                        </div>
                    </section>

                    {/* =========================================================================
                        SCREEN 4: WHERE TO USE YOUR NATIONAL ID (REAL CIVIC & ECONOMIC INTEGRATION)
                       ========================================================================= */}
                    <section id="where-to-use" className="scroll-mt-6 bg-surface py-16 sm:py-24 border-b border-line">
                        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-12">
                            <div className="max-w-2xl">
                                <div className="inline-flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800 border border-emerald-200">
                                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                                    <span>Practical Daily Use Across PNG</span>
                                </div>
                                <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
                                    Where You Can Use Your National ID
                                </h2>
                                <p className="mt-3 text-base text-muted-foreground leading-relaxed">
                                    Your verified credential replaces messy stacks of photocopies, statutory declarations, and endless commissioner visits for every basic transaction in Papua New Guinea.
                                </p>
                            </div>

                            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                {USE_CASES.map((item) => (
                                    <div
                                        key={item.title}
                                        className="rounded-2xl border border-line bg-canvas p-6 shadow-sm transition-all hover:border-primary-border hover:shadow-md flex flex-col justify-between"
                                    >
                                        <div>
                                            <div className="flex items-center justify-between">
                                                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-tint text-primary">
                                                    <item.icon className="h-5 w-5" aria-hidden="true" />
                                                </span>
                                                <span className="rounded-md bg-surface px-2.5 py-0.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider border border-line">
                                                    {item.badge}
                                                </span>
                                            </div>

                                            <h3 className="mt-5 text-base font-bold text-ink">
                                                {item.title}
                                            </h3>

                                            <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                                                {item.description}
                                            </p>
                                        </div>

                                        <div className="mt-5 border-t border-line pt-3 flex items-center justify-between text-xs text-primary font-semibold">
                                            <span>Instant Verification</span>
                                            <Check className="h-4 w-4 text-emerald-600" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* =========================================================================
                        SCREEN 5: PROVINCIAL REGISTRY CENTERS DIRECTORY PREVIEW
                       ========================================================================= */}
                    <section id="centers" className="scroll-mt-6 bg-canvas py-16 sm:py-24 border-b border-line">
                        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-12">
                            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                                <div className="max-w-2xl">
                                    <div className="inline-flex items-center gap-2 rounded-lg bg-sky-50 px-3 py-1 text-xs font-semibold text-primary border border-primary-border">
                                        <MapPin className="h-3.5 w-3.5" />
                                        <span>Nationwide Network</span>
                                    </div>
                                    <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
                                        Find Your Provincial Registry Center
                                    </h2>
                                    <p className="mt-3 text-base text-muted-foreground leading-relaxed">
                                        Registration hubs are active in all 22 provinces, supported by district mobile patrol teams for rural villages and island communities.
                                    </p>
                                </div>

                                <Link
                                    href="/centers"
                                    className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-primary bg-surface px-6 py-2.5 text-sm font-bold text-primary transition hover:bg-primary-tint self-start md:self-auto"
                                >
                                    <span>Open Interactive Center Map</span>
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                            </div>

                            {/* Regional Tab Selector */}
                            <div className="mt-8 flex flex-wrap gap-2 border-b border-line pb-4">
                                {REGIONS.map((reg, idx) => (
                                    <button
                                        key={reg.name}
                                        type="button"
                                        onClick={() => setSelectedRegion(idx)}
                                        className={`rounded-xl px-4 py-2 text-xs font-bold transition cursor-pointer ${
                                            selectedRegion === idx
                                                ? 'bg-primary text-white shadow-xs'
                                                : 'bg-surface text-muted-foreground hover:bg-line hover:text-ink'
                                        }`}
                                    >
                                        {reg.name}
                                    </button>
                                ))}
                            </div>

                            {/* Centers Cards */}
                            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                {REGIONS[selectedRegion].centers.map((c) => (
                                    <div
                                        key={c.name}
                                        className="rounded-xl border border-line bg-surface p-4 shadow-2xs hover:border-primary-border transition"
                                    >
                                        <span className="text-[10px] font-bold text-primary uppercase tracking-wide">
                                            {c.prov}
                                        </span>
                                        <div className="mt-1 text-sm font-bold text-ink">{c.name}</div>
                                        <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
                                            <Phone className="h-3 w-3 text-muted-foreground" />
                                            <span>{c.phone}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* =========================================================================
                        SCREEN 6: FREQUENTLY ASKED QUESTIONS (CITIZEN CLARITY)
                       ========================================================================= */}
                    <section id="faq" className="scroll-mt-6 bg-surface py-16 sm:py-24 border-b border-line">
                        <div className="mx-auto w-full max-w-4xl px-4 sm:px-6 lg:px-12">
                            <div className="text-center">
                                <div className="inline-flex items-center gap-2 rounded-lg bg-primary-tint px-3 py-1 text-xs font-semibold text-primary">
                                    <HelpCircle className="h-3.5 w-3.5" />
                                    <span>Got Questions?</span>
                                </div>
                                <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
                                    Frequently Asked Citizen Questions
                                </h2>
                                <p className="mt-3 text-base text-muted-foreground">
                                    Clear answers to help you prepare for your pre-registration and center visit.
                                </p>
                            </div>

                            <div className="mt-10 space-y-4">
                                {FAQS.map((faq, idx) => {
                                    const isOpen = openFaq === idx;
                                    return (
                                        <div
                                            key={faq.q}
                                            className="rounded-2xl border border-line bg-canvas transition overflow-hidden"
                                        >
                                            <button
                                                type="button"
                                                onClick={() => setOpenFaq(isOpen ? null : idx)}
                                                className="flex w-full min-h-[52px] items-center justify-between p-5 text-left font-bold text-ink hover:text-primary transition cursor-pointer"
                                            >
                                                <span className="text-base">{faq.q}</span>
                                                <ChevronDown
                                                    className={`h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-200 ${
                                                        isOpen ? 'rotate-180 text-primary' : ''
                                                    }`}
                                                />
                                            </button>
                                            {isOpen && (
                                                <div className="px-5 pb-5 text-sm leading-relaxed text-muted-foreground border-t border-line/50 pt-3">
                                                    {faq.a}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </section>

                    {/* =========================================================================
                        SCREEN 7: FINAL CALL TO ACTION: READY TO PRE-REGISTER
                       ========================================================================= */}
                    <section className="bg-[#071324] py-16 text-white sm:py-24 border-t border-white/10">
                        <div className="mx-auto w-full max-w-4xl px-4 text-center sm:px-6 lg:px-12">
                            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-1 text-xs font-semibold text-[#47F4C7]">
                                <Star className="h-3 w-3 fill-[#47F4C7] text-[#47F4C7]" />
                                <span>Civil and National Registration Act</span>
                            </div>

                            <h2 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
                                Get Your National ID Pre-Registered Today
                            </h2>

                            <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-white/80 sm:text-lg">
                                Take 10 minutes to pre-register online. Skip the paperwork queue at your provincial center and receive your verified citizen smart card.
                            </p>

                            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
                                <Link
                                    href="/prereg"
                                    className="inline-flex min-h-[48px] w-full sm:w-auto items-center justify-center gap-2 rounded-full bg-[#47F4C7] px-8 py-3.5 text-base font-extrabold text-[#071324] shadow-xl shadow-[#47F4C7]/20 transition hover:bg-white active:scale-[0.98]"
                                >
                                    <span>Begin Free Pre-Registration Online</span>
                                    <ArrowRight className="h-5 w-5" />
                                </Link>

                                <Link
                                    href="/track"
                                    className="inline-flex min-h-[48px] w-full sm:w-auto items-center justify-center rounded-full border border-white/30 bg-white/5 px-6 py-3.5 text-base font-semibold text-white transition hover:bg-white/10"
                                >
                                    <span>Track Existing Application</span>
                                </Link>
                            </div>
                        </div>
                    </section>
                </main>

                {/* =========================================================================
                    OFFICIAL GOVERNMENT FOOTER
                   ========================================================================= */}
                <footer className="bg-[#040C18] py-12 text-white border-t border-white/10">
                    <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-12">
                        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
                            <div className="max-w-sm">
                                <div className="flex items-center gap-2.5">
                                    <img src="/images/identriq-mark.png" alt="IDENTRIQ" className="h-8 w-8 object-contain invert" />
                                    <div>
                                        <span className="text-lg font-black tracking-tight text-white">IDENTRIQ</span>
                                        <div className="text-[10px] text-white/60">Independent State of Papua New Guinea</div>
                                    </div>
                                </div>
                                <p className="mt-3 text-xs leading-relaxed text-white/70">
                                    Administered under the <em>Civil and National Registration Act</em> by the Civil &amp; National Registration Authority (CNRA) and Department of Community Development.
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 text-xs">
                                <div>
                                    <div className="font-bold text-white uppercase tracking-wider text-[11px] mb-2.5 text-[#47F4C7]">
                                        Citizens
                                    </div>
                                    <ul className="space-y-2 text-white/70">
                                        <li><Link href="/prereg" className="hover:text-white transition">Online Pre-Reg</Link></li>
                                        <li><Link href="/track" className="hover:text-white transition">Track Status</Link></li>
                                        <li><Link href="/centers" className="hover:text-white transition">Provincial Hubs</Link></li>
                                    </ul>
                                </div>

                                <div>
                                    <div className="font-bold text-white uppercase tracking-wider text-[11px] mb-2.5 text-[#47F4C7]">
                                        Operations
                                    </div>
                                    <ul className="space-y-2 text-white/70">
                                        <li><Link href="/staff/capture" className="hover:text-white transition">Staff Enrollment</Link></li>
                                        <li><Link href="/staff/queue" className="hover:text-white transition">Live Queue Desk</Link></li>
                                        <li><Link href="/admin/issuance" className="hover:text-white transition">Card Production</Link></li>
                                    </ul>
                                </div>

                                <div>
                                    <div className="font-bold text-white uppercase tracking-wider text-[11px] mb-2.5 text-[#47F4C7]">
                                        Verification
                                    </div>
                                    <ul className="space-y-2 text-white/70">
                                        <li><Link href="/verifier/offline" className="hover:text-white transition">Offline QR Check</Link></li>
                                        <li><Link href="/verifier/online" className="hover:text-white transition">Bank eKYC API</Link></li>
                                        <li><Link href="/admin/audit" className="hover:text-white transition">Security Audit</Link></li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/50">
                            <p>© 2026 Independent State of Papua New Guinea. All rights reserved.</p>
                            <p className="font-mono text-[11px]">National Civic Identity Platform · Release 2026.1</p>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
