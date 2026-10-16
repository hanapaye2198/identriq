import { Head, Link } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';

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
            className={`transition-all duration-700 ease-out ${seen ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'} ${className}`}
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
    { value: 22, suffix: '', label: 'Provinces covered across PNG' },
    { value: 60, suffix: '+', label: 'Registration centers planned' },
    { value: 3, suffix: '', label: 'Unified credential formats' },
    { value: 2700, suffix: '+', label: 'Civic & banking services reachable' },
];

const STEPS = [
    { n: '1', t: 'Pre-Register Online', d: 'Complete your demographic details and upload supporting documents from any phone or computer in 10 minutes.' },
    { n: '2', t: 'Biometric Capture', d: 'Visit an IDENTRIQ registration center for instant digital photo, 10-fingerprints, and iris enrollment.' },
    { n: '3', t: 'Automated ABIS & KYC', d: 'Secure deduplication and civil registry validation run automatically with Zero-Knowledge verification.' },
    { n: '4', t: 'Issue & Carry', d: 'Receive your physical smart card, mobile offline wallet credential, and digital ID number for life.' },
];

const VOICES = [
    { q: 'I registered my family at the Waigani Statistics Haus center. The mobile card was verified by BSP bank without a single photocopy.', n: 'Miriam S.', r: 'Eastern Highlands / NCD' },
    { q: 'Our patrol officers authenticate cards offline at highway checkpoints using simple QR scans — zero signal required in the mountains.', n: 'Insp. J. Heni', r: 'Highlands Patrol Commander' },
    { q: 'Finally, a national identity system that connects rural ward councils with national digital services seamlessly.', n: 'Paul T.', r: 'Morobe Province' },
];

/* ─────────────────────────────────────────────────────────────────────────────
   Singpass-Style Convergence Stage (Interactive Scroll Engine)
   Shows fragmented paper documents flying and condensing into the BioSure Digital Card
   ───────────────────────────────────────────────────────────────────────────── */
function DocumentConvergenceStage() {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        let ticking = false;
        const handleScroll = () => {
            if (!containerRef.current) return;
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    const rect = containerRef.current!.getBoundingClientRect();
                    const windowH = window.innerHeight;
                    // Total scrollable distance within this stage
                    const totalDistance = rect.height - windowH;
                    if (totalDistance > 0) {
                        const current = -rect.top;
                        const p = Math.max(0, Math.min(1, current / totalDistance));
                        setProgress(p);
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

    // Interpolated flight mechanics
    // Early stage: 0 -> 0.45: cards converge
    // Middle stage: 0.45 -> 0.75: absorption into the digital card
    // Late stage: 0.75 -> 1.0: features expansion
    const convergeFactor = Math.min(1, progress / 0.55);
    const absorbFactor = Math.max(0, Math.min(1, (progress - 0.45) / 0.3));
    const revealFactor = Math.max(0, Math.min(1, (progress - 0.7) / 0.3));

    return (
        <section ref={containerRef} className="relative h-[320vh] bg-[#0A1F1C] text-white">
            {/* Sticky Viewport Pinned During Scroll */}
            <div className="sticky top-0 flex h-screen w-full flex-col items-center justify-between overflow-hidden px-4 py-16 sm:px-8">
                {/* Background Ambient Glow */}
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                    <div className="h-[450px] w-[450px] rounded-full bg-[#2FD6A3]/10 blur-[130px] transition-all duration-700" style={{ transform: `scale(${1 + progress * 0.8})` }} />
                    <div className="h-[300px] w-[300px] rounded-full bg-[#00D2FF]/10 blur-[100px]" />
                </div>

                {/* Section Header Text with Dynamic Transition */}
                <div className="relative z-20 text-center max-w-3xl">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-[#2FD6A3]/30 bg-[#2FD6A3]/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-widest text-[#2FD6A3]">
                        Civil Registry Modernization
                    </span>
                    <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-5xl">
                        {progress < 0.45 ? (
                            <>Soon, every document you need will be <span className="text-[#2FD6A3]">one</span></>
                        ) : progress < 0.75 ? (
                            <>Condensing into your <span className="text-[#2FD6A3]">IDENTRIQ Digital ID</span></>
                        ) : (
                            <>Accessible everywhere. <span className="text-[#2FD6A3]">Online & Offline.</span></>
                        )}
                    </h2>
                    <p className="mt-2 text-sm text-white/70 sm:text-base">
                        {progress < 0.65
                            ? 'Say goodbye to fragile paper certificates, photocopies, and long queues across provinces.'
                            : 'Cryptographically signed by Papua New Guinea with BioSure biometric authentication.'}
                    </p>
                </div>

                {/* The Central Visual Stage: Pinned Smartphone + Converging Cards */}
                <div className="relative z-10 flex flex-1 items-center justify-center w-full max-w-4xl">
                    {/* CARD 1: National Birth Certificate (Top Left -> Center) */}
                    <div
                        className="absolute hidden sm:flex flex-col rounded-xl border border-white/20 bg-white/10 p-4 text-xs shadow-2xl backdrop-blur-md transition-opacity duration-300"
                        style={{
                            width: '220px',
                            transform: `translate3d(${-260 * (1 - convergeFactor)}px, ${-140 * (1 - convergeFactor)}px, 0) rotate(${-12 * (1 - convergeFactor)}deg) scale(${1 - absorbFactor * 0.4})`,
                            opacity: 1 - absorbFactor,
                        }}
                    >
                        <div className="flex items-center justify-between border-b border-white/20 pb-2">
                            <span className="font-bold text-[#2FD6A3]">PNG Civil Registry</span>
                            <span className="text-[10px] text-white/60">Certificate</span>
                        </div>
                        <p className="mt-2 text-[11px] font-semibold">National Birth Certificate</p>
                        <p className="text-[10px] text-white/70">Civil Reg #PNG-BC-90812</p>
                        <div className="mt-3 h-1.5 w-16 rounded-full bg-white/20" />
                    </div>

                    {/* CARD 2: PNG Driver's Licence (Top Right -> Center) */}
                    <div
                        className="absolute hidden sm:flex flex-col rounded-xl border border-white/20 bg-white/10 p-4 text-xs shadow-2xl backdrop-blur-md transition-opacity duration-300"
                        style={{
                            width: '220px',
                            transform: `translate3d(${260 * (1 - convergeFactor)}px, ${-120 * (1 - convergeFactor)}px, 0) rotate(${10 * (1 - convergeFactor)}deg) scale(${1 - absorbFactor * 0.4})`,
                            opacity: 1 - absorbFactor,
                        }}
                    >
                        <div className="flex items-center justify-between border-b border-white/20 pb-2">
                            <span className="font-bold text-[#00D2FF]">Road Traffic Authority</span>
                            <span className="text-[10px] text-white/60">Class 1</span>
                        </div>
                        <p className="mt-2 text-[11px] font-semibold">Driver's Licence</p>
                        <p className="text-[10px] text-white/70">RTA Lic: DL-8849-POM</p>
                        <div className="mt-3 flex items-center justify-between">
                            <span className="text-[9px] text-[#2FD6A3]">VALID PNG</span>
                            <div className="size-4 rounded-full bg-white/20" />
                        </div>
                    </div>

                    {/* CARD 3: Ward Councillor Letter (Bottom Left -> Center) */}
                    <div
                        className="absolute hidden sm:flex flex-col rounded-xl border border-white/20 bg-white/10 p-4 text-xs shadow-2xl backdrop-blur-md transition-opacity duration-300"
                        style={{
                            width: '210px',
                            transform: `translate3d(${-240 * (1 - convergeFactor)}px, ${140 * (1 - convergeFactor)}px, 0) rotate(${8 * (1 - convergeFactor)}deg) scale(${1 - absorbFactor * 0.4})`,
                            opacity: 1 - absorbFactor,
                        }}
                    >
                        <div className="flex items-center justify-between border-b border-white/20 pb-2">
                            <span className="font-bold text-[#2FD6A3]">Provincial LLG</span>
                            <span className="text-[10px] text-white/60">Proof of Address</span>
                        </div>
                        <p className="mt-2 text-[11px] font-semibold">Ward Councillor Letter</p>
                        <p className="text-[10px] text-white/70">Ward 6, Morobe District</p>
                        <div className="mt-3 h-1.5 w-12 rounded-full bg-white/20" />
                    </div>

                    {/* CARD 4: PNG Passport (Bottom Right -> Center) */}
                    <div
                        className="absolute hidden sm:flex flex-col rounded-xl border border-white/20 bg-white/10 p-4 text-xs shadow-2xl backdrop-blur-md transition-opacity duration-300"
                        style={{
                            width: '210px',
                            transform: `translate3d(${240 * (1 - convergeFactor)}px, ${130 * (1 - convergeFactor)}px, 0) rotate(${-8 * (1 - convergeFactor)}deg) scale(${1 - absorbFactor * 0.4})`,
                            opacity: 1 - absorbFactor,
                        }}
                    >
                        <div className="flex items-center justify-between border-b border-white/20 pb-2">
                            <span className="font-bold text-[#FFCC00]">Immigration PNG</span>
                            <span className="text-[10px] text-white/60">Passport</span>
                        </div>
                        <p className="mt-2 text-[11px] font-semibold">ICA Travel Passport</p>
                        <p className="text-[10px] text-white/70">PNG-P-882910</p>
                        <div className="mt-3 h-1.5 w-14 rounded-full bg-white/20" />
                    </div>

                    {/* CENTRAL RECEPTACLE: Sleek Smartphone Showing the IDENTRIQ Digital Card */}
                    <div
                        className="relative z-20 w-[290px] sm:w-[320px] rounded-[38px] border-4 border-white/30 bg-[#0E2A26] p-3 shadow-[0_0_50px_rgba(47,214,163,0.3)] backdrop-blur-xl transition-all duration-500"
                        style={{
                            transform: `scale(${0.92 + progress * 0.12})`,
                        }}
                    >
                        {/* Dynamic Island / Speaker */}
                        <div className="mx-auto mb-3 h-4 w-28 rounded-full bg-black/60 flex items-center justify-center">
                            <div className="size-2 rounded-full bg-white/20" />
                        </div>

                        {/* Phone Display Screen */}
                        <div className="rounded-[28px] bg-gradient-to-br from-[#123832] via-[#0D2420] to-[#061715] p-4 text-white shadow-inner border border-white/10">
                            {/* App Header */}
                            <div className="flex items-center justify-between text-xs text-white/70 border-b border-white/10 pb-2.5">
                                <div className="flex items-center gap-1.5">
                                    <span className="size-2 rounded-full bg-[#2FD6A3] animate-pulse" />
                                    <span className="font-bold tracking-wider text-white">IDENTRIQ</span>
                                </div>
                                <span className="font-mono text-[10px] bg-white/10 px-2 py-0.5 rounded">PNG SECURE</span>
                            </div>

                            {/* The Glowing Digital BioSure Identity Card */}
                            <div className="mt-3 rounded-2xl bg-gradient-to-br from-[#2FD6A3]/25 via-white/10 to-[#00D2FF]/20 p-4 border border-[#2FD6A3]/40 shadow-lg relative overflow-hidden">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-[10px] font-semibold uppercase tracking-widest text-[#2FD6A3]">Papua New Guinea</p>
                                        <p className="text-sm font-bold text-white">National ID Card</p>
                                    </div>
                                    <div className="flex size-7 items-center justify-center rounded-full bg-[#2FD6A3] text-xs font-bold text-[#0E2A26]">
                                        PNG
                                    </div>
                                </div>

                                <div className="mt-4 flex gap-3 items-center">
                                    <div className="size-14 rounded-xl bg-white/20 border border-white/30 flex items-center justify-center text-xl font-bold overflow-hidden shadow">
                                        👤
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold">Mary Kila Amini</p>
                                        <p className="text-[10px] font-mono text-[#2FD6A3]">ID: 9812-4501-7729</p>
                                        <p className="text-[9px] text-white/70">DOB: 12 Apr 1990 · NCD</p>
                                    </div>
                                </div>

                                <div className="mt-3 pt-2.5 border-t border-white/15 flex items-center justify-between text-[10px]">
                                    <span className="text-[#2FD6A3] font-semibold">✓ BioSure Verified</span>
                                    <span className="font-mono text-white/60">EXPIRES: 2036</span>
                                </div>
                            </div>

                            {/* Offline Verifiable QR Badge (Reveals as user scrolls) */}
                            <div className="mt-3.5 rounded-xl border border-white/10 bg-white/5 p-3 text-center">
                                <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-[#2FD6A3]">
                                    <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                                        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                                    </svg>
                                    <span>Offline QR Token Active</span>
                                </div>
                                <p className="mt-1 text-[10px] text-white/60">
                                    Instant cryptographic check without cellular data
                                </p>
                            </div>
                        </div>

                        {/* Phone Bottom Pill */}
                        <div className="mx-auto mt-2 h-1 w-24 rounded-full bg-white/30" />
                    </div>
                </div>

                {/* Bottom Stage Progress Indicator */}
                <div className="relative z-20 flex items-center gap-3 text-xs text-white/60">
                    <span className="tabular-nums font-mono text-[#2FD6A3]">
                        {Math.round(progress * 100)}%
                    </span>
                    <div className="h-1.5 w-36 rounded-full bg-white/15 overflow-hidden">
                        <div className="h-full bg-[#2FD6A3] transition-all duration-100" style={{ width: `${progress * 100}%` }} />
                    </div>
                    <span>Scroll to explore identity convergence</span>
                </div>
            </div>
        </section>
    );
}

export default function Welcome() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [scrollProgress, setScrollProgress] = useState(0);

    // Track scroll for dynamic frosted glass navbar & top 2px progress bar
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
            <Head title="IDENTRIQ — Papua New Guinea National ID" />
            <a
                href="#main-content"
                className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-[#2FD6A3] focus:px-4 focus:py-2 focus:font-semibold focus:text-[#0E2A26] focus:shadow-lg focus:outline-none"
            >
                Skip to main content
            </a>

            <div className="min-h-screen scroll-smooth bg-[#F7F5EF] text-[#14201B]">
                {/* ─────────────────────────────────────────────────────────────────
                    TWO-TIER SOVEREIGN HEADER (Singpass Style)
                    Tier 1: Government Agency Sovereign Masthead
                    Tier 2: Frosted Glassmorphism Nav with 2px Dynamic Scroll Progress Glow
                   ───────────────────────────────────────────────────────────────── */}
                <header className="sticky top-0 z-50 w-full transition-all duration-300">
                    {/* TIER 1: SOVEREIGN MASTHEAD */}
                    <div className="border-b border-white/10 bg-[#061815] px-4 py-1.5 text-xs text-white/75 sm:px-8">
                        <div className="mx-auto flex max-w-7xl items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="flex size-4 items-center justify-center rounded-full bg-[#2FD6A3] text-[9px] font-bold text-[#0E2A26]">
                                    ★
                                </span>
                                <span className="font-semibold text-white">Independent State of Papua New Guinea</span>
                                <span className="text-white/30">·</span>
                                <span className="hidden md:inline">Official Civic Digital Identity Portal</span>
                            </div>
                            <div className="flex items-center gap-3 text-[11px] text-white/60">
                                <span className="hidden sm:inline">Secure Government Platform</span>
                                <span className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-[10px] text-[#2FD6A3]">gov.pg</span>
                            </div>
                        </div>
                    </div>

                    {/* TIER 2: MAIN DYNAMIC FROSTED GLASS NAVBAR */}
                    <nav
                        aria-label="Primary Navigation"
                        className={`transition-all duration-300 ${
                            scrolled
                                ? 'bg-[#0E2A26]/90 backdrop-blur-md shadow-lg py-3'
                                : 'bg-[#0E2A26] py-3.5'
                        } px-4 sm:px-8 text-white`}
                    >
                        <div className="mx-auto flex max-w-7xl items-center justify-between">
                            {/* Brand Logo & National ID Badge */}
                            <Link href="/" className="flex items-center gap-2.5 transition hover:opacity-95">
                                <span className="text-xl font-black tracking-tight text-white">IDENTRIQ</span>
                                <span className="rounded-md border border-[#2FD6A3]/40 bg-[#2FD6A3]/15 px-2 py-0.5 text-xs font-semibold text-[#2FD6A3]">
                                    PNG National ID
                                </span>
                            </Link>

                            {/* Desktop Navigation Links with Micro-Interactions */}
                            <div className="hidden items-center gap-7 text-sm font-medium md:flex">
                                <a href="#how" className="transition-colors hover:text-[#2FD6A3]">How it works</a>
                                <a href="#credentials" className="transition-colors hover:text-[#2FD6A3]">Credentials</a>
                                <Link href="/centers" className="transition-colors hover:text-[#2FD6A3]">Registration Centers</Link>
                                <Link href="/track" className="transition-colors hover:text-[#2FD6A3]">Track Status</Link>
                            </div>

                            {/* Dual CTA Hierarchy (Singpass Style) */}
                            <div className="hidden items-center gap-3 md:flex">
                                <Link
                                    href="/track"
                                    className="rounded-xl border border-white/30 px-4 py-2 text-xs font-semibold text-white transition hover:border-white hover:bg-white/10 active:scale-95"
                                >
                                    Track / Verify
                                </Link>
                                <Link
                                    href="/prereg"
                                    className="rounded-xl bg-[#2FD6A3] px-5 py-2 text-xs font-bold text-[#0E2A26] shadow-sm transition hover:brightness-105 active:scale-95"
                                >
                                    Pre-register Online →
                                </Link>
                            </div>

                            {/* Mobile Hamburger Button */}
                            <div className="flex items-center gap-2 md:hidden">
                                <Link
                                    href="/prereg"
                                    className="rounded-lg bg-[#2FD6A3] px-3 py-1.5 text-xs font-bold text-[#0E2A26]"
                                >
                                    Pre-register
                                </Link>
                                <button
                                    type="button"
                                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                    aria-expanded={mobileMenuOpen}
                                    aria-label="Toggle navigation menu"
                                    className="inline-flex size-9 items-center justify-center rounded-lg border border-white/20 p-1 text-white hover:bg-white/10"
                                >
                                    <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        {mobileMenuOpen ? (
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        ) : (
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                        )}
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </nav>

                    {/* TOP 2PX SCROLLBAR PROGRESS GLOW LINE */}
                    <div className="h-[2px] w-full bg-white/5">
                        <div
                            className="h-full bg-gradient-to-r from-[#2FD6A3] via-[#00D2FF] to-[#2FD6A3] transition-all duration-75"
                            style={{ width: `${scrollProgress}%` }}
                        />
                    </div>
                </header>

                {/* Mobile Navigation Drawer */}
                {mobileMenuOpen && (
                    <nav aria-label="Mobile Navigation" className="fixed inset-x-0 top-[88px] z-40 border-b border-white/10 bg-[#0E2A26] px-6 py-5 text-white shadow-2xl md:hidden">
                        <div className="flex flex-col gap-4 text-base font-medium">
                            <a
                                href="#how"
                                onClick={() => setMobileMenuOpen(false)}
                                className="py-1 transition-colors hover:text-[#2FD6A3]"
                            >
                                How it works
                            </a>
                            <a
                                href="#credentials"
                                onClick={() => setMobileMenuOpen(false)}
                                className="py-1 transition-colors hover:text-[#2FD6A3]"
                            >
                                Credentials
                            </a>
                            <Link
                                href="/centers"
                                onClick={() => setMobileMenuOpen(false)}
                                className="py-1 transition-colors hover:text-[#2FD6A3]"
                            >
                                Registration Centers
                            </Link>
                            <Link
                                href="/track"
                                onClick={() => setMobileMenuOpen(false)}
                                className="py-1 transition-colors hover:text-[#2FD6A3]"
                            >
                                Track Application
                            </Link>
                            <div className="mt-2 grid grid-cols-2 gap-2">
                                <Link
                                    href="/track"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="rounded-xl border border-white/30 py-2.5 text-center text-xs font-semibold text-white"
                                >
                                    Track ID
                                </Link>
                                <Link
                                    href="/prereg"
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="rounded-xl bg-[#2FD6A3] py-2.5 text-center text-xs font-bold text-[#0E2A26]"
                                >
                                    Pre-register
                                </Link>
                            </div>
                        </div>
                    </nav>
                )}

                <main id="main-content">
                    {/* HERO SECTION */}
                    <section className="relative overflow-hidden">
                        <img
                            src="/images/png-hero-photo.png"
                            alt="Papua New Guineans holding their national ID cards"
                            width={1920}
                            height={640}
                            className="h-[620px] w-full object-cover sm:h-[660px]"
                            fetchPriority="high"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-[#0E2A26]/95 via-[#0E2A26]/60 to-[#0E2A26]/15" />
                        <div className="absolute inset-0 flex flex-col justify-center px-4 pb-16 pt-20 sm:px-8 lg:px-16">
                            <p className="text-xs font-bold tracking-widest text-[#2FD6A3] sm:text-sm uppercase">
                                Papua New Guinea · Sovereign Civic ID
                            </p>
                            <h1 className="mt-2 max-w-3xl text-4xl font-extrabold leading-[1.05] text-white sm:text-6xl">
                                One identity.<br />Every Papua New Guinean.
                            </h1>
                            <p className="mt-4 max-w-xl text-base text-white/85 sm:text-lg">
                                Real-time biometric enrollment and BioSure authentication for all 22 provinces.
                                Access banking, government, and civil services online and offline with Zero-Knowledge verification.
                            </p>
                            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                                <Link
                                    href="/prereg"
                                    className="rounded-xl bg-[#2FD6A3] px-7 py-3 text-center font-bold text-[#0E2A26] shadow-lg transition hover:brightness-105 active:scale-[0.98]"
                                >
                                    Start Pre-registration Online →
                                </Link>
                                <Link
                                    href="/track"
                                    className="rounded-xl border border-white/40 px-7 py-3 text-center text-sm font-semibold text-white transition hover:border-white hover:bg-white/10 active:scale-[0.98]"
                                >
                                    Track My Application
                                </Link>
                                <Link
                                    href="/centers"
                                    className="rounded-xl border border-white/40 px-7 py-3 text-center text-sm font-semibold text-white transition hover:border-white hover:bg-white/10 active:scale-[0.98]"
                                >
                                    Find Registration Center
                                </Link>
                            </div>
                        </div>
                    </section>

                    {/* LIVE STATS COUNTER BAR */}
                    <section className="relative z-10 mx-4 -mt-12 grid grid-cols-2 gap-px overflow-hidden rounded-2xl shadow-xl sm:mx-8 sm:grid-cols-4 lg:mx-16">
                        {STATS.map((s) => (
                            <div key={s.label} className="bg-[#0E2A26] px-4 py-6 text-center">
                                <div className="text-3xl font-bold text-[#2FD6A3] tabular-nums sm:text-4xl">
                                    <CountUp to={s.value} suffix={s.suffix} />
                                </div>
                                <div className="mt-1 text-xs text-white/70">{s.label}</div>
                            </div>
                        ))}
                    </section>

                    {/* ─────────────────────────────────────────────────────────────
                        SINGPASS-GRADE SIGNATURE INTERACTIVE SCROLL STAGE
                        Shows paper documents condensing into the BioSure Digital Card
                       ───────────────────────────────────────────────────────────── */}
                    <DocumentConvergenceStage />

                    {/* HOW IT WORKS SECTION */}
                    <section id="how" className="mx-auto max-w-5xl scroll-mt-24 px-4 py-20 sm:px-8">
                        <Reveal>
                            <p className="text-xs font-bold tracking-widest text-[#0E2A26]/60 uppercase">Step-by-step workflow</p>
                            <h2 className="mt-1 text-3xl font-bold sm:text-4xl text-[#0E2A26]">From pre-registration to everyday use</h2>
                        </Reveal>
                        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                            {STEPS.map((s, i) => (
                                <Reveal key={s.n} delay={i * 70}>
                                    <div className="h-full rounded-2xl bg-white p-6 shadow-sm border border-slate-200/60 transition-all duration-200 hover:-translate-y-1.5 hover:shadow-md">
                                        <div className="flex size-11 items-center justify-center rounded-xl bg-[#2FD6A3] text-lg font-bold text-[#0E2A26]">
                                            {s.n}
                                        </div>
                                        <h3 className="mt-4 text-lg font-bold text-[#0E2A26]">{s.t}</h3>
                                        <p className="mt-1.5 text-sm leading-relaxed text-[#14201B]/70">{s.d}</p>
                                    </div>
                                </Reveal>
                            ))}
                        </div>
                    </section>

                    {/* CREDENTIALS SECTION */}
                    <section id="credentials" className="scroll-mt-24 bg-[#0E2A26] px-4 py-20 text-white sm:px-8">
                        <div className="mx-auto max-w-5xl">
                            <Reveal>
                                <p className="text-xs font-bold tracking-widest text-[#2FD6A3] uppercase">Unified format</p>
                                <h2 className="mt-1 text-3xl font-bold sm:text-4xl">One national identity, three ways to carry it</h2>
                            </Reveal>
                            <div className="mt-8 grid gap-5 sm:grid-cols-3">
                                {[
                                    ['Physical Smart Card', 'Secure polycarbonate card with embedded gold crest, laser-engraved portrait, and signed 2D barcode for offline reading.'],
                                    ['Mobile Wallet App', 'Biometric credential stored in your smartphone secure enclave. Verify offline with Bluetooth and QR anywhere in PNG.'],
                                    ['Digital Verifiable ID', 'Open standard eKYC token allowing commercial banks, airlines, and telecom operators to verify identity without paperwork.'],
                                ].map(([t, d], i) => (
                                    <Reveal key={t} delay={i * 80}>
                                        <div className="h-full rounded-2xl bg-white/5 border border-white/10 p-6 transition-all duration-200 hover:-translate-y-1.5 hover:bg-white/10 hover:border-[#2FD6A3]/40">
                                            <h3 className="text-lg font-bold text-[#2FD6A3]">{t}</h3>
                                            <p className="mt-2 text-sm leading-relaxed text-white/70">{d}</p>
                                        </div>
                                    </Reveal>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* CITIZEN VOICES TESTIMONIALS */}
                    <section className="mx-auto max-w-5xl px-4 py-20 sm:px-8">
                        <Reveal>
                            <p className="text-xs font-bold tracking-widest text-[#0E2A26]/60 uppercase">Citizen testimonials</p>
                            <h2 className="mt-1 text-3xl font-bold sm:text-4xl text-[#0E2A26]">Built for everyday Papua New Guineans</h2>
                        </Reveal>
                        <div className="mt-8 grid gap-5 md:grid-cols-3">
                            {VOICES.map((v) => (
                                <Reveal key={v.n}>
                                    <figure className="h-full rounded-2xl bg-white p-6 shadow-sm border border-slate-200/60">
                                        <blockquote className="text-sm leading-relaxed italic text-slate-700">“{v.q}”</blockquote>
                                        <figcaption className="mt-4 text-sm font-bold text-[#0E2A26]">
                                            {v.n} <span className="font-normal text-slate-500">· {v.r}</span>
                                        </figcaption>
                                    </figure>
                                </Reveal>
                            ))}
                        </div>
                    </section>

                    {/* CALL TO ACTION */}
                    <section className="mx-auto max-w-5xl px-4 pb-20 sm:px-8">
                        <Reveal className="rounded-3xl bg-[#0E2A26] p-8 text-center text-white sm:p-14 shadow-2xl relative overflow-hidden border border-white/10">
                            <div className="pointer-events-none absolute -right-20 -top-20 size-64 rounded-full bg-[#2FD6A3]/10 blur-3xl" />
                            <h2 className="text-3xl font-extrabold sm:text-5xl">Get your IDENTRIQ ID today</h2>
                            <p className="mx-auto mt-3 max-w-lg text-white/75 text-sm sm:text-base">
                                Ten steps online, one quick biometric visit at your provincial registration center. Your national identity, secured for life.
                            </p>
                            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
                                <Link
                                    href="/prereg"
                                    className="w-full sm:w-auto rounded-xl bg-[#2FD6A3] px-8 py-3.5 font-bold text-[#0E2A26] shadow-lg transition hover:brightness-105 active:scale-95"
                                >
                                    Start Pre-registration Now →
                                </Link>
                                <Link
                                    href="/centers"
                                    className="w-full sm:w-auto rounded-xl border border-white/30 px-6 py-3.5 text-sm font-semibold text-white hover:bg-white/10"
                                >
                                    View Registration Centers
                                </Link>
                            </div>
                        </Reveal>
                    </section>
                </main>

                {/* FOOTER */}
                <footer className="bg-[#061815] px-4 py-10 text-center text-xs text-white/50 border-t border-white/10 sm:px-8">
                    <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-4">
                        <p>© 2026 Independent State of Papua New Guinea · IDENTRIQ BioSure Civic Identity Platform</p>
                        <div className="flex items-center gap-6 text-white/60">
                            <Link href="/track" className="hover:text-white transition">Track</Link>
                            <Link href="/centers" className="hover:text-white transition">Centers</Link>
                            <Link href="/prereg" className="hover:text-white transition">Pre-registration</Link>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
