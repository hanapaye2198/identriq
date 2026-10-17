import { CheckCircle2, QrCode, RefreshCw, Shield, Sparkles, User, Wifi } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import NationalIdCard from '@/components/national-id-card';
import NationalIdCardBack from '@/components/national-id-card-back';

export interface SmartCard3DProps {
    citizenName?: string;
    idNumber?: string;
    dob?: string;
    province?: string;
    sex?: string;
    nationality?: string;
    expiryDate?: string;
    authority?: string;
    signatureName?: string;
    photoSrc?: string | null;
    className?: string;
}

export default function SmartCard3D({
    citizenName = 'KUMAL, JOHN A.',
    idNumber = '785-3049-921-A',
    dob = '14 APR 1988',
    province = 'CENTRAL PROVINCE',
    sex = 'M',
    nationality = 'PAPUA NEW GUINEA',
    expiryDate = '24 OCT 2031',
    authority = 'PNG CIVIL REGISTRY',
    signatureName = 'John Kumal.',
    photoSrc = '/images/john-kumal-portrait-hd.png',
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
            opacity: 0.7,
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
        <div className={`relative flex flex-col items-center w-full ${className}`}>
            {/* AMBIENT PRESENTATION STAGE WITH CURVED CYAN RIBBONS (Matches reference photo layout) */}
            <div className="relative w-full max-w-[460px] overflow-hidden rounded-3xl border border-sky-100 bg-gradient-to-br from-[#f0f7ff] via-[#e2f1fd] to-[#f8fbfe] p-4 sm:p-6 shadow-lg shadow-sky-900/5">
                {/* 3D Cyan Curved Background Ribbons from template layout */}
                <svg
                    className="pointer-events-none absolute inset-0 h-full w-full"
                    viewBox="0 0 460 300"
                    preserveAspectRatio="none"
                    aria-hidden="true"
                >
                    <defs>
                        <linearGradient id="ribbon-cyan-1" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#bae6fd" stopOpacity="0.7" />
                            <stop offset="50%" stopColor="#38bdf8" stopOpacity="0.45" />
                            <stop offset="100%" stopColor="#0284c7" stopOpacity="0.2" />
                        </linearGradient>
                        <linearGradient id="ribbon-cyan-2" x1="0%" y1="100%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#0284c7" stopOpacity="0.2" />
                            <stop offset="60%" stopColor="#38bdf8" stopOpacity="0.35" />
                            <stop offset="100%" stopColor="#e0f2fe" stopOpacity="0.6" />
                        </linearGradient>
                    </defs>
                    {/* Sweeping dynamic waves matching presentation mockup */}
                    <path
                        d="M -30 220 C 80 140, 240 260, 490 180 L 490 310 L -30 310 Z"
                        fill="url(#ribbon-cyan-1)"
                    />
                    <path
                        d="M -20 160 C 140 210, 310 110, 480 170"
                        fill="none"
                        stroke="url(#ribbon-cyan-2)"
                        strokeWidth="18"
                        strokeLinecap="round"
                    />
                    <path
                        d="M 20 280 C 180 200, 320 290, 480 230"
                        fill="none"
                        stroke="#0284c7"
                        strokeWidth="4"
                        opacity="0.3"
                    />
                </svg>

                {/* Card 3D Canvas Stage */}
                <div
                    className="group relative mx-auto w-full max-w-[400px] select-none py-1"
                    style={{ perspective: '1200px' }}
                    onMouseMove={handleMouseMove}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                >
                    {/* Realistic 3D floating shadow underneath */}
                    <div
                        className="pointer-events-none absolute -bottom-4 left-1/2 h-8 w-4/5 -translate-x-1/2 rounded-full transition-all duration-300"
                        style={{
                            background:
                                'radial-gradient(ellipse at center, rgba(2, 132, 199, 0.35) 0%, rgba(2, 132, 199, 0) 70%)',
                            transform: `translateX(-50%) translateY(${isHovered ? '6px' : '0px'}) scale(${
                                isHovered ? 1.08 : 1
                            })`,
                            filter: 'blur(8px)',
                        }}
                    />

                    {/* 3D Transform Container */}
                    <div
                        ref={cardRef}
                        tabIndex={0}
                        role="button"
                        aria-label={`Papua New Guinea National ID Card for ${citizenName}. Click or press space to flip.`}
                        onKeyDown={handleKeyDown}
                        onClick={() => setIsFlipped((f) => !f)}
                        className="relative aspect-[1.586/1] w-full cursor-pointer rounded-2xl transition-transform duration-300 ease-out focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary focus-visible:ring-offset-4"
                        style={{
                            transformStyle: 'preserve-3d',
                            transform: `rotateX(${rotX}deg) rotateY(${isFlipped ? rotY + 180 : rotY}deg) ${
                                isHovered ? 'scale3d(1.025, 1.025, 1.025)' : 'scale3d(1, 1, 1)'
                            }`,
                            transition: isHovered
                                ? 'transform 0.08s ease-out'
                                : 'transform 0.6s cubic-bezier(0.23, 1, 0.32, 1)',
                        }}
                    >
                        {/* =========================================================================
                            FRONT FACE: OFFICIAL NATIONAL ID CARD (EXACT TEMPLATE)
                           ========================================================================= */}
                        <div
                            className="absolute inset-0 overflow-hidden rounded-2xl shadow-2xl"
                            style={{
                                backfaceVisibility: 'hidden',
                                WebkitBackfaceVisibility: 'hidden',
                            }}
                        >
                            <NationalIdCard
                                fullName={citizenName}
                                idNumber={idNumber}
                                dateOfBirth={dob}
                                sex={sex}
                                nationality={nationality}
                                expiryDate={expiryDate}
                                authority={authority}
                                signatureName={signatureName}
                                photoSrc={photoSrc}
                                className="h-full w-full"
                            />

                            {/* Interactive Holographic Glare Follower Overlay */}
                            <div
                                className="pointer-events-none absolute inset-0 z-30 transition-opacity duration-300"
                                style={{
                                    opacity: glare.opacity,
                                    background: `radial-gradient(circle 280px at ${glare.x}% ${glare.y}%, rgba(255, 255, 255, 0.45) 0%, rgba(201, 162, 39, 0.2) 35%, transparent 70%)`,
                                }}
                            />
                        </div>

                        {/* =========================================================================
                            BACK FACE: REVERSE SECURITY MRZ & CONTACTLESS CHIP ARCHITECTURE
                           ========================================================================= */}
                        <div
                            className="absolute inset-0 overflow-hidden rounded-2xl shadow-2xl"
                            style={{
                                backfaceVisibility: 'hidden',
                                WebkitBackfaceVisibility: 'hidden',
                                transform: 'rotateY(180deg)',
                            }}
                        >
                            <NationalIdCardBack
                                fullName={citizenName}
                                idNumber={idNumber}
                                dateOfBirth={dob}
                                sex={sex}
                                expiryDate={expiryDate}
                                className="h-full w-full"
                            />
                        </div>
                    </div>
                </div>

                {/* Interactive 3D Controls Bar */}
                <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-sky-200/60 pt-3 text-xs">
                    <button
                        type="button"
                        onClick={() => setIsFlipped((f) => !f)}
                        className="inline-flex min-h-[36px] items-center gap-1.5 rounded-full border border-sky-300 bg-white px-4 py-1.5 font-bold text-navy transition hover:bg-sky-50 hover:border-sky-400 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary shadow-xs cursor-pointer"
                    >
                        <RefreshCw className="h-3.5 w-3.5 text-primary transition-transform duration-300" aria-hidden="true" />
                        <span>{isFlipped ? 'Show Official Front' : 'Flip to Security Reverse'}</span>
                    </button>

                    <div className="flex items-center gap-1.5 text-slate-600 text-[11px] font-medium">
                        <Shield className="h-3.5 w-3.5 text-emerald-600" aria-hidden="true" />
                        <span>{isMobile ? 'Tap card to flip' : 'Move cursor for 3D holographic tilt'}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
