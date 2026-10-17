import { Head, Link } from '@inertiajs/react';
import {
    ArrowRight,
    Building2,
    CheckCircle2,
    CreditCard,
    FileCheck,
    Globe,
    Lock,
    MapPin,
    Menu,
    Phone,
    QrCode,
    Search,
    Shield,
    ShieldCheck,
    Smartphone,
    Star,
    X,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import LandingRoadmapThread from '@/components/landing-roadmap-thread';

function useInView<T extends HTMLElement>() {
    const ref = useRef<T | null>(null);
    const [seen, setSeen] = useState(false);
    useEffect(() => {
        if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
            setSeen(true);
            return;
        }
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            setSeen(true);
            return;
        }
        const el = ref.current;
        if (!el) return;
        const io = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    setSeen(true);
                    io.disconnect();
                }
            },
            { threshold: 0.15 }
        );
        io.observe(el);
        return () => io.disconnect();
    }, []);
    return { ref, seen };
}

function Reveal({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
    const { ref, seen } = useInView<HTMLDivElement>();
    return (
        <div
            ref={ref}
            style={{ transitionDelay: `${delay}ms` }}
            className={`transition-all duration-700 ease-out ${seen ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'} ${className}`}
        >
            {children}
        </div>
    );
}

function CountUp({ to, suffix = '' }: { to: number; suffix?: string }) {
    const { ref, seen } = useInView<HTMLSpanElement>();
    const [val, setVal] = useState(0);
    useEffect(() => {
        if (!seen) return;
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            setVal(to);
            return;
        }
        let raf = 0;
        const t0 = performance.now();
        const tick = (t: number) => {
            const p = Math.min(1, (t - t0) / 1400);
            setVal(Math.round(to * (1 - Math.pow(1 - p, 3))));
            if (p < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf);
    }, [seen, to]);
    return <span ref={ref}>{val.toLocaleString()}{suffix}</span>;
}

const STATS = [
    { value: 22, suffix: '', label: 'Provinces Connected' },
    { value: 89, suffix: '', label: 'Districts Covered' },
    { value: 3, suffix: '', label: 'Official Credential Types' },
    { value: 0, suffix: ' PGK', label: 'Initial Registration Fee' },
];

const CITIZEN_EXPERIENCES = [
    {
        quote: 'I enrolled our family at the Waigani Statistics Haus center. When my daughter opened her first account at BSP Waigani, the bank verified her BioSure card in five seconds—without requiring statutory declarations or photocopy certification.',
        author: 'Kila Amini',
        role: 'Citizen · Waigani, National Capital District',
    },
    {
        quote: 'At highway checkpoints between Goroka and Kainantu, our patrol team verifies identity cards offline using handheld terminals. Even without cellular reception in mountain valleys, the cryptographic signature confirms authenticity immediately.',
        author: 'Sgt. D. Kaupa',
        role: 'Highlands Highway Command · Eastern Highlands',
    },
    {
        quote: 'Previously, our ward members had to travel by boat to Lae just to certify birth certificates. With the pre-registration portal, ward councillors verify local residency online before the mobile enrollment kit arrives.',
        author: 'B. Gima',
        role: 'Provincial Civil Registry Officer · Morobe Province',
    },
];

export default function Welcome() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [scrollProgress, setScrollProgress] = useState(0);

    // Track scroll for dynamic header and progress bar
    useEffect(() => {
        const onScroll = () => {
            const y = window.scrollY;
            setScrolled(y > 20);
            const total = document.documentElement.scrollHeight - window.innerHeight;
            setScrollProgress(total > 0 ? Math.min(100, Math.max(0, (y / total) * 100)) : 0);
        };
        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    return (
        <>
            <Head title="IDENTRIQ — Papua New Guinea National ID Portal" />
            <a
                href="#main-content"
                className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-[#0052CC] focus:px-4 focus:py-2 focus:font-semibold focus:text-white focus:shadow-lg focus:outline-none"
            >
                Skip to main content
            </a>

            <div className="min-h-screen scroll-smooth bg-[#F8FAFC] text-[#0F2644]">
                {/* =========================================================================
                    TWO-TIER GOVERNMENT MASTHEAD & PRIMARY NAVIGATION
                   ========================================================================= */}
                <header className="sticky top-0 z-50 w-full transition-all duration-300">
                    {/* TIER 1: OFFICIAL GOVERNMENT SOVEREIGN MASTHEAD */}
                    <div className="border-b border-white/10 bg-[#071324] px-4 py-1.5 text-xs text-white/80 sm:px-8">
                        <div className="mx-auto flex max-w-7xl items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="flex size-4 items-center justify-center rounded-full bg-[#C9A227] text-black">
                                    <Star className="size-2.5 fill-black text-black" aria-hidden="true" />
                                </div>
                                <span className="font-semibold text-white">Independent State of Papua New Guinea</span>
                                <span className="text-white/30 hidden sm:inline">·</span>
                                <span className="hidden md:inline text-slate-300">Civil &amp; National Registration Authority</span>
                            </div>
                            <div className="flex items-center gap-3 text-[11px] text-white/70">
                                <span className="hidden sm:inline">Official Public Registry Portal</span>
                                <span className="rounded bg-white/10 px-2 py-0.5 font-mono text-[10px] text-sky-400">gov.pg</span>
                            </div>
                        </div>
                    </div>

                    {/* TIER 2: PRIMARY NAVBAR */}
                    <nav
                        aria-label="Primary Navigation"
                        className={`transition-all duration-300 ${
                            scrolled
                                ? 'bg-[#0B192C]/95 backdrop-blur-md shadow-md py-3'
                                : 'bg-[#0B192C] py-3.5'
                        } px-4 sm:px-8 text-white`}
                    >
                        <div className="mx-auto flex max-w-7xl items-center justify-between">
                            {/* Brand Logo & National ID Badge */}
                            <Link href="/" className="flex items-center gap-2.5 transition hover:opacity-95" aria-label="IDENTRIQ PNG National ID Home">
                                <span className="text-xl font-black tracking-tight text-white">IDENTRIQ</span>
                                <span className="rounded-md border border-[#0052CC]/40 bg-[#0052CC]/20 px-2 py-0.5 text-xs font-semibold text-sky-300">
                                    PNG National ID
                                </span>
                            </Link>

                            {/* Desktop Navigation Links */}
                            <div className="hidden items-center gap-7 text-sm font-medium md:flex">
                                <a href="#roadmap" className="transition-colors hover:text-sky-300">Process</a>
                                <a href="#credentials" className="transition-colors hover:text-sky-300">Credentials</a>
                                <Link href="/centers" className="transition-colors hover:text-sky-300">Registry Centers</Link>
                                <Link href="/track" className="transition-colors hover:text-sky-300">Track Application</Link>
                            </div>

                            {/* Desktop Action Buttons */}
                            <div className="hidden items-center gap-3 md:flex">
                                <Link
                                    href="/track"
                                    className="inline-flex min-h-[40px] items-center rounded-xl border border-white/20 bg-white/5 px-4 py-2 text-xs font-semibold text-white transition hover:bg-white/10 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                                >
                                    Track Status
                                </Link>
                                <Link
                                    href="/prereg"
                                    className="inline-flex min-h-[40px] items-center rounded-xl bg-[#0052CC] px-5 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-[#0047B3] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                                >
                                    Pre-Register Online →
                                </Link>
                            </div>

                            {/* Mobile Hamburger Button */}
                            <div className="flex items-center gap-2 md:hidden">
                                <Link
                                    href="/prereg"
                                    className="rounded-lg bg-[#0052CC] px-3 py-1.5 text-xs font-bold text-white"
                                >
                                    Pre-Register
                                </Link>
                                <button
                                    type="button"
                                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                    aria-expanded={mobileMenuOpen}
                                    aria-label="Toggle navigation menu"
                                    className="inline-flex size-10 items-center justify-center rounded-lg border border-white/20 p-1 text-white hover:bg-white/10"
                                >
                                    {mobileMenuOpen ? (
                                        <X className="size-5" aria-hidden="true" />
                                    ) : (
                                        <Menu className="size-5" aria-hidden="true" />
                                    )}
                                </button>
                            </div>
                        </div>
                    </nav>

                    {/* TOP SCROLL PROGRESS BAR */}
                    <div className="h-[2px] w-full bg-white/5" aria-hidden="true">
                        <div
                            className="h-full bg-gradient-to-r from-[#0052CC] via-sky-400 to-[#C9A227] transition-all duration-75"
                            style={{ width: `${scrollProgress}%` }}
                        />
                    </div>
                </header>

                {/* Mobile Navigation Drawer */}
                {mobileMenuOpen && (
                    <nav aria-label="Mobile Navigation Drawer" className="fixed inset-x-0 top-[88px] z-40 border-b border-white/10 bg-[#0B192C] px-6 py-5 text-white shadow-2xl md:hidden">
                        <div className="flex flex-col gap-4 text-base font-medium">
                            <a
                                href="#roadmap"
                                onClick={() => setMobileMenuOpen(false)}
                                className="py-1 transition-colors hover:text-sky-300"
                            >
                                Process
                            </a>
                            <a
                                href="#credentials"
                                onClick={() => setMobileMenuOpen(false)}
                                className="py-1 transition-colors hover:text-sky-300"
                            >
                                Credentials
                            </a>
                            <Link
                                href="/centers"
                                onClick={() => setMobileMenuOpen(false)}
                                className="py-1 transition-colors hover:text-sky-300"
                            >
                                Registry Centers
                            </Link>
                            <Link
                                href="/track"
                                onClick={() => setMobileMenuOpen(false)}
                                className="py-1 transition-colors hover:text-sky-300"
                            >
                                Track Application
                            </Link>
                            <div className="mt-2 grid grid-cols-2 gap-2">
                                <Link
                                    href="/track"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="inline-flex min-h-[44px] items-center justify-center rounded-xl border border-white/30 text-xs font-semibold text-white"
                                >
                                    Track Status
                                </Link>
                                <Link
                                    href="/prereg"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="inline-flex min-h-[44px] items-center justify-center rounded-xl bg-[#0052CC] text-xs font-bold text-white hover:bg-[#0047B3]"
                                >
                                    Pre-Register
                                </Link>
                            </div>
                        </div>
                    </nav>
                )}

                <main id="main-content">
                    {/* =========================================================================
                        HERO SECTION (NATURAL FULL-COLOR CITIZEN PHOTO, NO BLUE GRADIENT)
                       ========================================================================= */}
                    {/* =========================================================================
                        HERO SECTION (FULL BLEED HERO WITH NATURAL FULL-COLOR CITIZEN PHOTO)
                       ========================================================================= */}
                    <section className="relative overflow-hidden bg-black" aria-label="National Identity Introduction">
                        {/* Background Photo: Full-bleed, full natural color, unwashed, no blue tint */}
                        <img
                            src="/images/png-hero-photo.png"
                            alt="Papua New Guinea citizens proudly displaying their official national identification cards"
                            width={1920}
                            height={680}
                            className="h-[620px] w-full object-cover object-[center_20%] sm:h-[680px]"
                            fetchPriority="high"
                        />

                        {/* Neutral Dark Scrim (Left-aligned for text readability; ZERO blue gradient over citizens on the right) */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/20 sm:bg-gradient-to-r sm:from-black/90 sm:via-black/60 sm:to-transparent" />

                        {/* Hero Content Overlay */}
                        <div className="absolute inset-0 flex flex-col justify-center px-4 pb-20 pt-16 sm:px-8 lg:px-16">
                            <div className="max-w-2xl">
                                <div className="inline-flex items-center gap-2 rounded-full border border-[#C9A227]/40 bg-black/60 backdrop-blur-md px-3.5 py-1 text-xs font-semibold tracking-wider text-[#C9A227] uppercase">
                                    <Star className="size-3 fill-[#C9A227] text-[#C9A227]" aria-hidden="true" />
                                    <span>Civil &amp; National Registration Act 1971 / 2014</span>
                                </div>

                                <h1 className="mt-4 text-4xl font-black leading-[1.08] text-white sm:text-5xl lg:text-6xl drop-shadow-md">
                                    One verified identity.<br />
                                    For every Papua New Guinean.
                                </h1>

                                <p className="mt-4 max-w-xl text-base text-slate-100 sm:text-lg leading-relaxed drop-shadow-sm">
                                    The official sovereign digital identity of Papua New Guinea. 
                                    Register once to verify your citizenship for commercial banking with BSP and Kina Bank, superannuation claims with Nasfund, mobile SIM registration, and passport issuance across all 22 provinces.
                                </p>

                                <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                                    <Link
                                        href="/prereg"
                                        className="inline-flex min-h-[48px] items-center justify-center rounded-xl bg-[#0052CC] px-7 py-3 text-center text-sm font-bold text-white shadow-lg transition hover:bg-[#0047B3] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                                    >
                                        <span>Begin Pre-Registration Online</span>
                                        <ArrowRight className="ml-2 size-4" aria-hidden="true" />
                                    </Link>
                                    <Link
                                        href="/track"
                                        className="inline-flex min-h-[48px] items-center justify-center rounded-xl border border-white/40 bg-black/40 backdrop-blur-md px-6 py-3 text-center text-sm font-semibold text-white transition hover:bg-black/60 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                                    >
                                        Track Application Status
                                    </Link>
                                    <Link
                                        href="/centers"
                                        className="inline-flex min-h-[48px] items-center justify-center rounded-xl border border-white/40 bg-black/40 backdrop-blur-md px-6 py-3 text-center text-sm font-semibold text-white transition hover:bg-black/60 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                                    >
                                        Find a Provincial Office
                                    </Link>
                                </div>

                                {/* Civic Trust Assurance Metrics */}
                                <div className="mt-8 flex flex-wrap items-center gap-6 border-t border-white/20 pt-6 text-xs text-white/90">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle2 className="size-4 text-emerald-400" aria-hidden="true" />
                                        <span>0 PGK Citizen Fee (Free Initial Registration)</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <CheckCircle2 className="size-4 text-emerald-400" aria-hidden="true" />
                                        <span>10-Minute Online Form</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <CheckCircle2 className="size-4 text-emerald-400" aria-hidden="true" />
                                        <span>ICAO 9303 &amp; ISO 18013-5 Standard</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* =========================================================================
                        CIVIC INFRASTRUCTURE STATS BAR
                       ========================================================================= */}
                    <section className="relative z-10 mx-4 -mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-2xl shadow-xl sm:mx-8 sm:grid-cols-4 lg:mx-auto lg:max-w-7xl border border-slate-800 bg-slate-800" aria-label="National Coverage Metrics">
                        {STATS.map((s) => (
                            <div key={s.label} className="bg-[#0B192C] px-4 py-6 text-center">
                                <div className="text-3xl font-black text-sky-400 tabular-nums sm:text-4xl">
                                    <CountUp to={s.value} suffix={s.suffix} />
                                </div>
                                <div className="mt-1 text-xs font-medium text-slate-300">{s.label}</div>
                            </div>
                        ))}
                    </section>

                    {/* =========================================================================
                        CONTINUOUS LIFE-CYCLE ROADMAP THREAD (5 GROUNDED MILESTONES)
                       ========================================================================= */}
                    <LandingRoadmapThread />

                    {/* =========================================================================
                        OFFICIAL CREDENTIALS OVERVIEW
                       ========================================================================= */}
                    <section id="credentials" className="scroll-mt-20 bg-[#0B192C] px-4 py-20 text-white sm:px-8 border-t border-slate-800">
                        <div className="mx-auto max-w-5xl">
                            <Reveal>
                                <div className="inline-flex items-center gap-1.5 rounded-full border border-sky-500/30 bg-sky-500/10 px-3 py-0.5 text-xs font-semibold tracking-wider text-sky-300 uppercase">
                                    Official Issuance Standards
                                </div>
                                <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
                                    One National Identity, Three Official Formats
                                </h2>
                                <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-300">
                                    Citizens receive credentials suited for physical presentation, mobile wallet storage, and digital electronic verification across government and private sectors.
                                </p>
                            </Reveal>

                            <div className="mt-10 grid gap-6 sm:grid-cols-3">
                                {[
                                    {
                                        title: 'Polycarbonate Smart Card',
                                        badge: 'Physical Document',
                                        desc: 'Laser-engraved card with multi-layer tamper protection, embedded gold national crest, and contactless ICAO 9303 microprocessor for border and transit verification.',
                                        icon: CreditCard,
                                    },
                                    {
                                        title: 'BioSure Mobile Wallet',
                                        badge: 'Digital Credential',
                                        desc: 'Secure cryptographic credential stored in your smartphone secure enclave. Authenticates offline via high-density 2D QR code without requiring mobile data.',
                                        icon: Smartphone,
                                    },
                                    {
                                        title: 'Instant Electronic KYC (eKYC)',
                                        badge: 'Service Verification',
                                        desc: 'Authorized verification protocol allowing commercial banks (BSP, Kina Bank), superannuation funds (Nasfund), and airlines to authenticate citizens without paper photocopies.',
                                        icon: ShieldCheck,
                                    },
                                ].map((item, i) => (
                                    <Reveal key={item.title} delay={i * 80}>
                                        <div className="h-full rounded-2xl bg-[#071324] border border-slate-800 p-6 transition hover:border-slate-700">
                                            <div className="flex size-10 items-center justify-center rounded-xl bg-[#0052CC] text-white">
                                                <item.icon className="size-5" aria-hidden="true" />
                                            </div>
                                            <div className="mt-4 text-[11px] font-semibold uppercase tracking-wider text-sky-400">
                                                {item.badge}
                                            </div>
                                            <h3 className="mt-1 text-lg font-bold text-white">{item.title}</h3>
                                            <p className="mt-2 text-sm leading-relaxed text-slate-300">{item.desc}</p>
                                        </div>
                                    </Reveal>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* =========================================================================
                        CITIZEN EXPERIENCES & INSTITUTIONAL USE CASES
                       ========================================================================= */}
                    <section className="mx-auto max-w-5xl px-4 py-20 sm:px-8" aria-label="Citizen Experiences">
                        <Reveal>
                            <div className="inline-flex items-center gap-1.5 rounded-full border border-[#0052CC]/30 bg-[#0052CC]/10 px-3 py-0.5 text-xs font-semibold tracking-wider text-[#0052CC] uppercase">
                                Everyday Impact
                            </div>
                            <h2 className="mt-2 text-3xl font-bold sm:text-4xl text-[#0F2644]">
                                Proven in Districts Across Papua New Guinea
                            </h2>
                            <p className="mt-2 text-sm text-slate-600">
                                Real accounts from citizens, patrol officers, and provincial registry officers using IDENTRIQ daily.
                            </p>
                        </Reveal>

                        <div className="mt-8 grid gap-6 md:grid-cols-3">
                            {CITIZEN_EXPERIENCES.map((exp) => (
                                <Reveal key={exp.author}>
                                    <figure className="flex h-full flex-col justify-between rounded-2xl bg-white p-6 shadow-sm border border-slate-200">
                                        <blockquote className="text-sm leading-relaxed text-slate-700">
                                            “{exp.quote}”
                                        </blockquote>
                                        <figcaption className="mt-5 border-t border-slate-100 pt-3">
                                            <div className="text-sm font-bold text-[#0F2644]">{exp.author}</div>
                                            <div className="text-xs text-slate-500">{exp.role}</div>
                                        </figcaption>
                                    </figure>
                                </Reveal>
                            ))}
                        </div>
                    </section>

                    {/* =========================================================================
                        CALL TO ACTION BANNER
                       ========================================================================= */}
                    <section className="mx-auto max-w-5xl px-4 pb-20 sm:px-8">
                        <Reveal className="rounded-3xl bg-[#0B192C] p-8 text-center text-white sm:p-12 shadow-xl border border-slate-800">
                            <h2 className="text-3xl font-bold sm:text-4xl">
                                Begin Your National Identity Pre-Registration
                            </h2>
                            <p className="mx-auto mt-3 max-w-xl text-slate-300 text-sm sm:text-base leading-relaxed">
                                Enter your demographic information online in 10 minutes. Then select a convenient date for biometric capture at your provincial registry office.
                            </p>
                            <div className="mt-7 flex flex-col sm:flex-row items-center justify-center gap-3">
                                <Link
                                    href="/prereg"
                                    className="w-full sm:w-auto inline-flex min-h-[48px] items-center justify-center rounded-xl bg-[#0052CC] px-8 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#0047B3] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                                >
                                    <span>Start Pre-Registration Online</span>
                                    <ArrowRight className="ml-2 size-4" aria-hidden="true" />
                                </Link>
                                <Link
                                    href="/centers"
                                    className="w-full sm:w-auto inline-flex min-h-[48px] items-center justify-center rounded-xl border border-slate-600 bg-slate-800 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-700 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                                >
                                    Find a Provincial Registry Center
                                </Link>
                            </div>
                        </Reveal>
                    </section>
                </main>

                {/* =========================================================================
                    OFFICIAL GOVERNMENT FOOTER
                   ========================================================================= */}
                <footer className="bg-[#071324] px-4 py-12 text-xs text-slate-400 border-t border-slate-800 sm:px-8">
                    <div className="mx-auto max-w-7xl">
                        <div className="flex flex-col md:flex-row items-start justify-between gap-8 pb-8 border-b border-slate-800">
                            <div className="max-w-md">
                                <div className="flex items-center gap-2 text-white font-bold text-sm">
                                    <Building2 className="size-4 text-sky-400" aria-hidden="true" />
                                    <span>Civil &amp; National Registration Authority</span>
                                </div>
                                <p className="mt-2 text-slate-400 leading-relaxed text-xs">
                                    Established under the <em>Civil and National Registration Act</em>, Independent State of Papua New Guinea. Administered by the National Identification Authority (NIDA) and Department of Community Development.
                                </p>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 text-xs">
                                <div>
                                    <div className="font-semibold text-white uppercase tracking-wider text-[11px]">Citizens</div>
                                    <ul className="mt-2 space-y-1.5 text-slate-400">
                                        <li><Link href="/prereg" className="hover:text-white transition">Pre-Registration</Link></li>
                                        <li><Link href="/track" className="hover:text-white transition">Application Tracking</Link></li>
                                        <li><Link href="/centers" className="hover:text-white transition">Provincial Centers</Link></li>
                                    </ul>
                                </div>
                                <div>
                                    <div className="font-semibold text-white uppercase tracking-wider text-[11px]">Operations</div>
                                    <ul className="mt-2 space-y-1.5 text-slate-400">
                                        <li><Link href="/staff/capture" className="hover:text-white transition">Staff Enrollment Desk</Link></li>
                                        <li><Link href="/admin/validation" className="hover:text-white transition">ABIS Adjudication</Link></li>
                                        <li><Link href="/admin/issuance" className="hover:text-white transition">Card Production</Link></li>
                                    </ul>
                                </div>
                                <div>
                                    <div className="font-semibold text-white uppercase tracking-wider text-[11px]">Verification</div>
                                    <ul className="mt-2 space-y-1.5 text-slate-400">
                                        <li><Link href="/verifier/offline" className="hover:text-white transition">Offline QR Check</Link></li>
                                        <li><Link href="/verifier/online" className="hover:text-white transition">Bank eKYC API</Link></li>
                                        <li><Link href="/admin/audit" className="hover:text-white transition">Audit Records</Link></li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500">
                            <p>© 2026 Independent State of Papua New Guinea. All rights reserved.</p>
                            <p className="font-mono text-[11px]">National Civic Identity Platform · Release 2026.1</p>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
