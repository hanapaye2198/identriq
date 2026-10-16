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
            { threshold: 0.2 }
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
            className={`transition-all duration-500 ease-out ${seen ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'} ${className}`}
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
    { value: 22, suffix: '', label: 'Provinces covered' },
    { value: 60, suffix: '+', label: 'Registration centers (target)' },
    { value: 3, suffix: '', label: 'Credential formats' },
    { value: 2700, suffix: '+', label: 'Services within reach (vision)' },
];

const STEPS = [
    { n: '1', t: 'Register', d: 'Pre-register online, then visit a center for photo, fingerprints and iris capture.' },
    { n: '2', t: 'Validate', d: 'Data quality, duplicate and compliance checks run on every application.' },
    { n: '3', t: 'Receive', d: 'Your BIOSURE ID number is issued; card personalized and delivered.' },
    { n: '4', t: 'Use', d: 'Verify online or offline with a QR scan — no internet required.' },
];

const VOICES = [
    { q: 'I registered my whole family in one visit. The card came to our district office.', n: 'Miriam S.', r: 'Eastern Highlands' },
    { q: 'The bank verified my identity without a single photocopy. That has never happened before.', n: 'Paul T.', r: 'Port Moresby' },
    { q: 'Our officers check cards offline at roadside stops — no signal needed.', n: 'Insp. J. Heni', r: 'Highlands Patrol' },
];

export default function Welcome() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
                <header className="sticky top-0 z-40 flex items-center justify-between bg-[#0E2A26]/95 px-4 py-3 text-white backdrop-blur sm:px-8">
                    <Link href="/" className="text-lg font-bold tracking-tight transition hover:opacity-90">
                        IDENTRIQ <span className="font-normal text-white/60">· PNG National ID</span>
                    </Link>
                    <nav aria-label="Desktop Navigation" className="hidden items-center gap-6 text-sm md:flex">
                        <a href="#how" className="transition-colors hover:text-[#2FD6A3]">How it works</a>
                        <a href="#credentials" className="transition-colors hover:text-[#2FD6A3]">Credentials</a>
                        <Link href="/centers" className="transition-colors hover:text-[#2FD6A3]">Centers</Link>
                        <Link href="/track" className="transition-colors hover:text-[#2FD6A3]">Track</Link>
                        <Link href="/prereg" className="rounded-full bg-[#2FD6A3] px-4 py-1.5 font-semibold text-[#0E2A26] transition hover:brightness-110 active:scale-95">
                            Pre-register
                        </Link>
                    </nav>
                    <div className="flex items-center gap-2 md:hidden">
                        <Link href="/prereg" className="rounded-full bg-[#2FD6A3] px-3.5 py-1.5 text-xs font-semibold text-[#0E2A26]">
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
                </header>

                {mobileMenuOpen && (
                    <nav aria-label="Mobile Navigation" className="fixed inset-x-0 top-[53px] z-30 border-b border-white/10 bg-[#0E2A26] px-6 py-5 text-white shadow-xl md:hidden">
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
                                Centers
                            </Link>
                            <Link
                                href="/track"
                                onClick={() => setMobileMenuOpen(false)}
                                className="py-1 transition-colors hover:text-[#2FD6A3]"
                            >
                                Track application
                            </Link>
                            <Link
                                href="/prereg"
                                onClick={() => setMobileMenuOpen(false)}
                                className="mt-2 inline-block rounded-xl bg-[#2FD6A3] py-2.5 text-center font-semibold text-[#0E2A26]"
                            >
                                Start pre-registration
                            </Link>
                        </div>
                    </nav>
                )}

                <main id="main-content">
                    <section className="relative overflow-hidden">
                        <img
                            src="/images/png-hero-photo.png"
                            alt="Papua New Guineans holding their national ID cards"
                            width={1920}
                            height={640}
                            className="h-[620px] w-full object-cover sm:h-[640px]"
                            fetchPriority="high"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-[#0E2A26]/95 via-[#0E2A26]/55 to-[#0E2A26]/10" />
                        <div className="absolute inset-0 flex flex-col justify-center px-4 pb-16 pt-20 sm:px-8 lg:px-16">
                            <p className="animate-rise text-xs font-semibold tracking-widest text-[#2FD6A3] sm:text-sm">PAPUA NEW GUINEA · NATIONAL IDENTITY</p>
                            <h1 className="mt-2 max-w-2xl animate-rise text-4xl font-bold leading-[1.05] text-white sm:text-6xl" style={{ animationDelay: '80ms' }}>
                                One identity.<br />Every Papua New Guinean.
                            </h1>
                            <p className="mt-4 max-w-lg animate-rise text-base text-white/85 sm:text-lg" style={{ animationDelay: '160ms' }}>
                                A robust digital ID at national level — real-time biometric authentication
                                and eKYC for every use-case, online and off.
                            </p>
                            <div className="mt-8 flex animate-rise flex-col gap-3 sm:flex-row sm:flex-wrap" style={{ animationDelay: '240ms' }}>
                                <Link
                                    href="/prereg"
                                    className="rounded-full bg-[#2FD6A3] px-7 py-3 text-center font-semibold text-[#0E2A26] transition hover:brightness-110 active:scale-[0.98]"
                                >
                                    Start pre-registration
                                </Link>
                                <Link
                                    href="/track"
                                    className="rounded-full border border-white/40 px-7 py-3 text-center text-white transition hover:border-white active:scale-[0.98]"
                                >
                                    Track application
                                </Link>
                                <Link
                                    href="/centers"
                                    className="rounded-full border border-white/40 px-7 py-3 text-center text-white transition hover:border-white active:scale-[0.98]"
                                >
                                    Find a center
                                </Link>
                            </div>
                        </div>
                    </section>

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

                <section id="how" className="mx-auto max-w-5xl scroll-mt-24 px-4 py-16 sm:px-8">
                    <Reveal>
                        <p className="text-sm font-semibold tracking-widest text-[#0E2A26]/60">HOW IT WORKS</p>
                        <h2 className="mt-1 text-3xl font-bold sm:text-4xl">From registration to everyday use</h2>
                    </Reveal>
                    <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {STEPS.map((s, i) => (
                            <Reveal key={s.n} delay={i * 60}>
                                <div className="h-full rounded-2xl bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
                                    <div className="flex size-10 items-center justify-center rounded-full bg-[#2FD6A3] text-lg font-bold text-[#0E2A26]">
                                        {s.n}
                                    </div>
                                    <h3 className="mt-4 text-lg font-semibold">{s.t}</h3>
                                    <p className="mt-1 text-sm leading-relaxed text-[#14201B]/70">{s.d}</p>
                                </div>
                            </Reveal>
                        ))}
                    </div>
                </section>

                <section id="credentials" className="scroll-mt-24 bg-[#0E2A26] px-4 py-16 text-white sm:px-8">
                    <div className="mx-auto max-w-5xl">
                        <Reveal>
                            <p className="text-sm font-semibold tracking-widest text-[#2FD6A3]">YOUR CREDENTIALS</p>
                            <h2 className="mt-1 text-3xl font-bold sm:text-4xl">One identity, three ways to carry it</h2>
                        </Reveal>
                        <div className="mt-8 grid gap-4 sm:grid-cols-3">
                            {[
                                ['Physical card', 'Secure ID-1 card with photo, gold crest and QR. Collected at your center.'],
                                ['Mobile app', 'Digital ID in your pocket with offline QR. No signal, no problem.'],
                                ['Digital ID', 'Verifiable online credential banks and agencies can trust instantly.'],
                            ].map(([t, d], i) => (
                                <Reveal key={t} delay={i * 60}>
                                    <div className="h-full rounded-2xl bg-white/5 p-6 transition-all duration-200 hover:-translate-y-1 hover:bg-white/10">
                                        <h3 className="text-lg font-semibold text-[#2FD6A3]">{t}</h3>
                                        <p className="mt-2 text-sm leading-relaxed text-white/70">{d}</p>
                                    </div>
                                </Reveal>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="mx-auto max-w-5xl px-4 py-16 sm:px-8">
                    <Reveal>
                        <p className="text-sm font-semibold tracking-widest text-[#0E2A26]/60">VOICES</p>
                        <h2 className="mt-1 text-3xl font-bold sm:text-4xl">Built for Papua New Guineans</h2>
                    </Reveal>
                    <div className="mt-8 grid gap-4 md:grid-cols-3">
                        {VOICES.map((v) => (
                            <Reveal key={v.n}>
                                <figure className="h-full rounded-2xl bg-white p-6 shadow-sm">
                                    <blockquote className="text-sm leading-relaxed italic">“{v.q}”</blockquote>
                                    <figcaption className="mt-4 text-sm font-semibold">{v.n} <span className="font-normal text-[#14201B]/50">· {v.r}</span></figcaption>
                                </figure>
                            </Reveal>
                        ))}
                    </div>
                </section>

                <section className="mx-auto max-w-5xl px-4 pb-16 sm:px-8">
                    <Reveal className="rounded-2xl bg-[#0E2A26] p-8 text-center text-white sm:p-12">
                        <h2 className="text-3xl font-bold sm:text-4xl">Get your IDENTRIQ ID</h2>
                        <p className="mx-auto mt-2 max-w-md text-white/70">Ten steps online, one short visit to a center. Your identity, for life.</p>
                        <Link
                            href="/prereg"
                            className="mt-6 inline-block rounded-full bg-[#2FD6A3] px-8 py-3 font-semibold text-[#0E2A26] transition hover:brightness-110"
                        >
                            Start now — it takes 10 minutes
                        </Link>
                    </Reveal>
                </section>
                </main>

                <footer className="bg-[#0E2A26] px-4 py-8 text-center text-sm text-white/50 sm:px-8">
                    IDENTRIQ · PNG National ID demo — integrations simulated.
                </footer>
            </div>
        </>
    );
}
