import { CheckCircle2, QrCode, RefreshCw, Shield, Sparkles, User, Wifi } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

interface SmartCard3DProps {
    citizenName?: string;
    idNumber?: string;
    dob?: string;
    province?: string;
    sex?: string;
    expiryDate?: string;
    className?: string;
}

export default function SmartCard3D({
    citizenName = 'AMINI, KILA PETER',
    idNumber = 'PNG-2026-9042-8810',
    dob = '14 APR 1994',
    province = 'CENTRAL PROVINCE',
    sex = 'F',
    expiryDate = '14 APR 2036',
    className = '',
}: SmartCard3DProps) {
    const cardRef = useRef<HTMLDivElement | null>(null);
    const [rotX, setRotX] = useState<number>(0);
    const [rotY, setRotY] = useState<number>(0);
    const [glare, setGlare] = useState<{ x: number; y: number; opacity: number }>({ x: 50, y: 50, opacity: 0 });
    const [isFlipped, setIsFlipped] = useState<boolean>(false);
    const [isHovered, setIsHovered] = useState<boolean>(false);
    const [isMobile, setIsMobile] = useState<boolean>(false);

    // Detect touch device for gyro / tap behavior
    useEffect(() => {
        setIsMobile('ontouchstart' in window || navigator.maxTouchPoints > 0);
    }, []);

    // Mouse movement 3D tilt tracking
    const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        if (!cardRef.current) return;
        const rect = cardRef.current.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;

        // Calculate cursor position relative to card center (-1 to 1)
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const px = (mouseX / width - 0.5) * 2;
        const py = (mouseY / height - 0.5) * 2;

        // Maximum rotation angles (degrees)
        const maxTilt = 14;
        setRotX(-py * maxTilt);
        setRotY(px * maxTilt);

        // Specular holographic glare position (0% - 100%)
        setGlare({
            x: (mouseX / width) * 100,
            y: (mouseY / height) * 100,
            opacity: 0.65,
        });
    }, []);

    const handleMouseEnter = () => {
        setIsHovered(true);
    };

    const handleMouseLeave = () => {
        setIsHovered(false);
        // Smoothly return to neutral
        setRotX(0);
        setRotY(0);
        setGlare((prev) => ({ ...prev, opacity: 0 }));
    };

    // Keyboard flip support
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            setIsFlipped((f) => !f);
        }
    };

    return (
        <div className={`flex flex-col items-center ${className}`}>
            {/* Card 3D Canvas Stage */}
            <div
                className="group relative w-full max-w-[420px] select-none py-2"
                style={{ perspective: '1200px' }}
                onMouseMove={handleMouseMove}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
            >
                {/* 3D Transform Container */}
                <div
                    ref={cardRef}
                    tabIndex={0}
                    role="button"
                    aria-label={`Papua New Guinea National ID Card for ${citizenName}. Click or press space to flip.`}
                    onKeyDown={handleKeyDown}
                    onClick={() => setIsFlipped((f) => !f)}
                    className="relative aspect-[1.586/1] w-full cursor-pointer rounded-2xl shadow-2xl transition-transform duration-300 ease-out focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary focus-visible:ring-offset-4"
                    style={{
                        transformStyle: 'preserve-3d',
                        transform: `rotateX(${rotX}deg) rotateY(${isFlipped ? rotY + 180 : rotY}deg) ${
                            isHovered ? 'scale3d(1.02, 1.02, 1.02)' : 'scale3d(1, 1, 1)'
                        }`,
                        transition: isHovered
                            ? 'transform 0.08s ease-out'
                            : 'transform 0.6s cubic-bezier(0.23, 1, 0.32, 1)',
                    }}
                >
                    {/* =========================================================================
                        FRONT FACE: OFFICIAL NATIONAL POLYCARBONATE SMART CARD
                       ========================================================================= */}
                    <div
                        className="absolute inset-0 flex flex-col justify-between overflow-hidden rounded-2xl border border-white/20 p-5 text-white shadow-2xl"
                        style={{
                            backfaceVisibility: 'hidden',
                            WebkitBackfaceVisibility: 'hidden',
                            background:
                                'linear-gradient(135deg, #071933 0%, #0B254A 38%, #0C366B 68%, #0A1E3C 100%)',
                        }}
                    >
                        {/* Micro-guilloche security pattern overlay */}
                        <div
                            className="pointer-events-none absolute inset-0 opacity-15"
                            style={{
                                backgroundImage: `radial-gradient(circle at 50% 50%, #0052CC 1px, transparent 1px), radial-gradient(circle at 0% 100%, #C9A227 1px, transparent 1px)`,
                                backgroundSize: '16px 16px, 24px 24px',
                            }}
                        />

                        {/* Embedded Holographic Watermark of the IDENTRIQ Biometric Emblem */}
                        <div className="pointer-events-none absolute -right-6 -top-6 h-48 w-48 opacity-10">
                            <img
                                src="/images/identriq-mark.png"
                                alt=""
                                className="h-full w-full object-contain filter invert"
                            />
                        </div>

                        {/* Interactive Holographic Glare Follower */}
                        <div
                            className="pointer-events-none absolute inset-0 transition-opacity duration-300"
                            style={{
                                opacity: glare.opacity,
                                background: `radial-gradient(circle 260px at ${glare.x}% ${glare.y}%, rgba(255, 255, 255, 0.35) 0%, rgba(201, 162, 39, 0.15) 35%, transparent 70%)`,
                            }}
                        />

                        {/* Top Masthead: Sovereign Heading & Crest */}
                        <div className="relative z-10 flex items-start justify-between gap-3 border-b border-white/15 pb-2.5">
                            <div className="flex items-center gap-2.5">
                                <img
                                    src="/images/identriq-mark.png"
                                    alt="IDENTRIQ Sovereign Mark"
                                    className="h-8 w-8 object-contain drop-shadow"
                                />
                                <div>
                                    <div className="text-[10px] font-bold tracking-widest text-[#C9A227] uppercase">
                                        Independent State of Papua New Guinea
                                    </div>
                                    <div className="text-xs font-black tracking-tight text-white uppercase sm:text-sm">
                                        National Identity Smart Card
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col items-end">
                                <span className="rounded bg-[#C9A227]/20 px-1.5 py-0.5 text-[9px] font-bold tracking-wider text-[#C9A227] border border-[#C9A227]/40 uppercase">
                                    Official
                                </span>
                                <div className="mt-1 flex items-center gap-1 text-[9px] text-white/60 font-mono">
                                    <Wifi className="h-2.5 w-2.5 rotate-90 text-[#38BDF8]" aria-hidden="true" />
                                    <span>NFC</span>
                                </div>
                            </div>
                        </div>

                        {/* Middle Card Content: Photo, Gold Chip, Biometric Fields */}
                        <div className="relative z-10 my-auto grid grid-cols-[82px_1fr] items-center gap-4 pt-1">
                            {/* Biometric Portrait Frame */}
                            <div className="relative flex flex-col items-center">
                                <div className="relative h-24 w-20 overflow-hidden rounded-lg border-2 border-white/30 bg-[#0B192C]/80 shadow-md">
                                    <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-b from-white/10 to-transparent text-white/70">
                                        <User className="h-10 w-10 text-white/80" aria-hidden="true" />
                                        <span className="text-[8px] font-bold uppercase tracking-wider text-white/50">
                                            Portrait
                                        </span>
                                    </div>
                                    {/* Security hologram stamp on photo corner */}
                                    <div className="absolute -bottom-2 -right-2 h-7 w-7 rounded-full bg-gradient-to-tr from-[#C9A227] via-amber-200 to-sky-400 opacity-80 shadow-sm" />
                                </div>
                                <span className="mt-1 text-[8px] font-semibold text-[#38BDF8] tracking-widest uppercase">
                                    Biometric Match
                                </span>
                            </div>

                            {/* Citizen Demographic Fields & Gold Chip */}
                            <div className="flex flex-col justify-between space-y-1.5 text-left">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="text-[8px] font-semibold tracking-wider text-white/60 uppercase">
                                            Full Name / Nem Bilong Yu
                                        </div>
                                        <div className="text-xs font-bold tracking-tight text-white sm:text-sm">
                                            {citizenName}
                                        </div>
                                    </div>

                                    {/* Metallic Gold Security Microchip (Physical EMV/Biometric) */}
                                    <div
                                        className="relative h-7 w-9 shrink-0 rounded-md border border-[#9A7B1C] shadow-inner"
                                        style={{
                                            background:
                                                'linear-gradient(135deg, #ECC94B 0%, #D69E2E 50%, #B7791F 100%)',
                                        }}
                                        title="Embedded Secure Cryptographic Microchip"
                                    >
                                        {/* Chip circuit contact pattern */}
                                        <div className="absolute inset-0.5 rounded-sm border border-black/20" />
                                        <div className="absolute inset-x-0 top-1/2 h-[1px] bg-black/25" />
                                        <div className="absolute inset-y-0 left-1/3 w-[1px] bg-black/25" />
                                        <div className="absolute inset-y-0 right-1/3 w-[1px] bg-black/25" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-2 text-[10px]">
                                    <div>
                                        <div className="text-[8px] text-white/60 uppercase">Date of Birth</div>
                                        <div className="font-semibold text-white font-mono">{dob}</div>
                                    </div>
                                    <div>
                                        <div className="text-[8px] text-white/60 uppercase">Province</div>
                                        <div className="font-semibold text-white truncate">{province}</div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-2 text-[10px]">
                                    <div>
                                        <div className="text-[8px] text-white/60 uppercase">National ID No.</div>
                                        <div className="font-mono font-black text-[#38BDF8] tracking-wide text-[11px]">
                                            {idNumber}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-[8px] text-white/60 uppercase">Status</div>
                                        <div className="flex items-center gap-1 font-bold text-emerald-400 text-[10px]">
                                            <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
                                            <span>VERIFIED</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Card Bottom Strip: Legal Authority & Expiry */}
                        <div className="relative z-10 flex items-center justify-between border-t border-white/15 pt-2 text-[9px] text-white/70">
                            <span className="font-mono text-[8px] tracking-wider text-white/50">
                                CIVIL &amp; NATIONAL REGISTRATION AUTHORITY
                            </span>
                            <span className="font-mono text-white/80">
                                EXP: <strong className="text-white">{expiryDate}</strong>
                            </span>
                        </div>
                    </div>

                    {/* =========================================================================
                        BACK FACE: REVERSE SECURITY MRZ & CONTACTLESS CHIP ARCHITECTURE
                       ========================================================================= */}
                    <div
                        className="absolute inset-0 flex flex-col justify-between overflow-hidden rounded-2xl border border-white/20 p-5 text-white shadow-2xl"
                        style={{
                            backfaceVisibility: 'hidden',
                            WebkitBackfaceVisibility: 'hidden',
                            transform: 'rotateY(180deg)',
                            background:
                                'linear-gradient(135deg, #0A1E3C 0%, #071933 50%, #0B254A 100%)',
                        }}
                    >
                        {/* Magnetic & Optical Stripe */}
                        <div className="relative -mx-5 -mt-5 h-11 bg-black/80 border-b border-white/10 flex items-center justify-between px-5">
                            <div className="flex items-center gap-2 text-[9px] font-mono text-[#38BDF8]">
                                <Sparkles className="h-3 w-3 text-[#C9A227]" />
                                <span>OPTICAL VARIABLE CRYPTOGRAPHIC BAR</span>
                            </div>
                            <span className="text-[9px] text-white/40 font-mono">ISO/IEC 7810 ID-1</span>
                        </div>

                        {/* Card Back Body */}
                        <div className="my-auto space-y-2 text-[10px] text-white/80">
                            <div className="flex items-start justify-between gap-4">
                                <div className="space-y-1">
                                    <div className="text-[8px] font-bold uppercase tracking-wider text-[#C9A227]">
                                        Property of the State of Papua New Guinea
                                    </div>
                                    <p className="text-[9px] leading-relaxed text-white/70">
                                        This card remains the property of the Independent State of Papua New Guinea. If found, please return to any provincial police post or Civil Registry Center.
                                    </p>
                                </div>
                                <div className="flex flex-col items-center shrink-0">
                                    <div className="rounded border border-white/30 bg-white p-1 text-black shadow">
                                        <QrCode className="h-10 w-10 text-slate-900" aria-hidden="true" />
                                    </div>
                                    <span className="mt-0.5 text-[8px] font-mono text-white/50">SECURE QR</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2 border-t border-white/10 pt-2 text-[9px]">
                                <div>
                                    <span className="text-white/50">Emergency Helpline:</span>
                                    <div className="font-mono font-bold text-white">+675 301 3500</div>
                                </div>
                                <div>
                                    <span className="text-white/50">Authorized Signature:</span>
                                    <div className="font-serif italic text-white/90">K. Amari · Registrar General</div>
                                </div>
                            </div>
                        </div>

                        {/* Machine Readable Zone (MRZ - ICAO Standard) */}
                        <div className="rounded bg-black/60 p-2 font-mono text-[9px] tracking-widest text-[#38BDF8] select-all border border-white/10">
                            <div className="truncate">IDPNGAMINI&lt;&lt;KILA&lt;PETER&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;</div>
                            <div className="truncate">2690428810PNG9404147F3610174&lt;&lt;&lt;&lt;&lt;&lt;</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Interactive 3D Controls Bar */}
            <div className="mt-3 flex flex-wrap items-center justify-center gap-3 text-xs">
                <button
                    type="button"
                    onClick={() => setIsFlipped((f) => !f)}
                    className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-primary-border bg-surface px-4 py-2 font-semibold text-primary transition hover:bg-primary-tint active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary shadow-xs"
                >
                    <RefreshCw className="h-3.5 w-3.5 transition-transform duration-300" aria-hidden="true" />
                    <span>{isFlipped ? 'Flip to Front View' : 'Flip to Inspect Security Back'}</span>
                </button>

                <div className="flex items-center gap-1.5 text-muted-foreground text-[11px]">
                    <Shield className="h-3.5 w-3.5 text-emerald-600" aria-hidden="true" />
                    <span>{isMobile ? 'Tap card to flip' : 'Move cursor over card to inspect 3D angles & holographic sheen'}</span>
                </div>
            </div>
        </div>
    );
}
