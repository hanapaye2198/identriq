import { useId, useMemo, type ReactNode } from 'react';
import { User, QrCode } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface NationalIdCardProps {
    /** Printed name, e.g. "KUMAL, JOHN A." */
    fullName?: string;
    /** Identity number, e.g. "785-3049-921-A" */
    idNumber?: string;
    dateOfBirth?: string;
    sex?: string;
    nationality?: string;
    expiryDate?: string;
    authority?: string;
    /** Handwriting-style signature name, e.g. "John Kumal." */
    signatureName?: string;
    /** Portrait photo URL; falls back to John Kumal's authentic portrait. */
    photoSrc?: string | null;
    /** Raw SVG markup for the QR mark. */
    qrSvg?: string | null;
    /** Optional crest element */
    crest?: ReactNode;
    className?: string;
}

export default function NationalIdCard({
    fullName = 'KUMAL, JOHN A.',
    idNumber = '785-3049-921-A',
    dateOfBirth = '14 APR 1988',
    sex = 'M',
    nationality = 'PAPUA NEW GUINEA',
    expiryDate = '24 OCT 2031',
    authority = 'PNG CIVIL REGISTRY',
    signatureName = 'John Kumal.',
    photoSrc = '/images/john-kumal-portrait.png',
    qrSvg = null,
    crest,
    className,
}: NationalIdCardProps) {
    const patternId = `nid-pattern-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;

    // Split full name for bottom-left display below photo if formatted as LAST, FIRST
    const nameLines = useMemo(() => {
        if (fullName.includes(',')) {
            const parts = fullName.split(',').map((p) => p.trim());
            return [`${parts[0]},`, parts.slice(1).join(' ')];
        }
        return [fullName];
    }, [fullName]);

    return (
        <div
            className={cn('@container w-full font-sans select-none', className)}
            role="img"
            aria-label={`Papua New Guinea National Identity Card for ${fullName}`}
        >
            <div
                className="relative aspect-[1.586] w-full overflow-hidden rounded-[2.8cqw] text-navy shadow-2xl ring-1 ring-black/15"
                style={{
                    background:
                        'linear-gradient(108deg, #d8623d 0%, #e88656 12%, #fdf8ef 28%, #f8fbfe 66%, #bae6fd 86%, #0284c7 100%)',
                }}
            >
                {/* Traditional Papua New Guinea Tapa & Guilloche Security Pattern */}
                <svg
                    className="pointer-events-none absolute inset-0 h-full w-full"
                    viewBox="0 0 100 63.1"
                    preserveAspectRatio="none"
                    aria-hidden="true"
                >
                    <defs>
                        {/* Concentric Guilloche Circles in the center */}
                        <pattern id={`${patternId}-guilloche`} width="30" height="30" patternUnits="userSpaceOnUse">
                            <circle cx="15" cy="15" r="14" fill="none" stroke="#2563eb" strokeWidth="0.12" opacity="0.18" />
                            <circle cx="15" cy="15" r="11" fill="none" stroke="#d97706" strokeWidth="0.1" opacity="0.15" />
                            <circle cx="15" cy="15" r="8" fill="none" stroke="#0284c7" strokeWidth="0.1" opacity="0.18" />
                            <circle cx="15" cy="15" r="5" fill="none" stroke="#2563eb" strokeWidth="0.08" opacity="0.14" />
                        </pattern>
                    </defs>

                    {/* Central Guilloche Background */}
                    <rect x="25" y="0" width="55" height="63.1" fill={`url(#${patternId}-guilloche)`} />

                    {/* Left Tapa Border (Warm Terracotta / Geometric Triangles) */}
                    <g fill="#991b1b" opacity="0.32">
                        {Array.from({ length: 9 }).map((_, i) => (
                            <path
                                key={`tapa-left-${i}`}
                                d={`M 0 ${i * 7} L 4 ${i * 7 + 3.5} L 0 ${i * 7 + 7} Z M 4 ${i * 7} L 8 ${i * 7 + 3.5} L 4 ${i * 7 + 7} Z`}
                            />
                        ))}
                    </g>
                    <g fill="#d97706" opacity="0.28">
                        {Array.from({ length: 9 }).map((_, i) => (
                            <path
                                key={`tapa-left-2-${i}`}
                                d={`M 8 ${i * 7} L 12 ${i * 7 + 3.5} L 8 ${i * 7 + 7} Z M 12 ${i * 7} L 16 ${i * 7 + 3.5} L 12 ${i * 7 + 7} Z`}
                            />
                        ))}
                    </g>

                    {/* Right Tapa Border (Oceanic Cyan / Blue Diamond Weave) */}
                    <g fill="#0284c7" opacity="0.35">
                        {Array.from({ length: 9 }).map((_, i) => (
                            <path
                                key={`tapa-right-${i}`}
                                d={`M 100 ${i * 7} L 96 ${i * 7 + 3.5} L 100 ${i * 7 + 7} Z M 96 ${i * 7} L 92 ${i * 7 + 3.5} L 96 ${i * 7 + 7} Z`}
                            />
                        ))}
                    </g>
                    <g fill="#38bdf8" opacity="0.30">
                        {Array.from({ length: 9 }).map((_, i) => (
                            <path
                                key={`tapa-right-2-${i}`}
                                d={`M 92 ${i * 7} L 88 ${i * 7 + 3.5} L 92 ${i * 7 + 7} Z M 88 ${i * 7} L 84 ${i * 7 + 3.5} L 88 ${i * 7 + 7} Z`}
                            />
                        ))}
                    </g>
                </svg>

                {/* Subtle Light Reflection Sheen Overlay */}
                <div
                    className="pointer-events-none absolute inset-0 opacity-40"
                    style={{
                        background:
                            'linear-gradient(135deg, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0) 40%, rgba(255,255,255,0.3) 100%)',
                    }}
                />

                {/* CARD INNER CONTENT */}
                <div className="relative z-10 flex h-full flex-col justify-between p-[2.8cqw]">
                    {/* =========================================================================
                        TOP HEADER: CREST + "PAPUA NEW GUINEA" + "IDENTRIQ" LOGO
                       ========================================================================= */}
                    <header className="flex items-center justify-between gap-[2cqw] border-b border-black/10 pb-[1.4cqw]">
                        {/* Top Left: PNG National Emblem (Kumul Bird of Paradise) */}
                        <div className="flex shrink-0 items-center">
                            {crest ?? (
                                <img
                                    src="/images/png-crest-kumul.png"
                                    alt="Papua New Guinea Crest"
                                    className="h-[7.8cqw] w-auto drop-shadow-xs object-contain"
                                    onError={(e) => {
                                        // Fallback to Bird icon if image load fails
                                        e.currentTarget.style.display = 'none';
                                    }}
                                />
                            )}
                        </div>

                        {/* Top Center: Official State Header */}
                        <div className="flex-1 text-center">
                            <h2
                                className="font-serif text-[3.2cqw] font-black tracking-[0.06em] text-[#9A6214] uppercase leading-tight"
                                style={{
                                    textShadow: '0 1px 1px rgba(255,255,255,0.8), 0 -1px 1px rgba(0,0,0,0.1)',
                                }}
                            >
                                PAPUA NEW GUINEA
                            </h2>
                            <h3 className="text-[2.5cqw] font-black tracking-[0.02em] text-[#0B2B64] uppercase leading-none mt-[0.3cqw]">
                                NATIONAL IDENTITY CARD
                            </h3>
                        </div>

                        {/* Top Right: IDENTRIQ Logo */}
                        <div className="flex shrink-0 items-center gap-[1.2cqw]">
                            <img
                                src="/images/identriq-mark.png"
                                alt=""
                                className="h-[6.5cqw] w-auto object-contain"
                            />
                            <span className="text-[2.4cqw] font-black tracking-[0.12em] text-[#0B2B64]">
                                IDENTRIQ
                            </span>
                        </div>
                    </header>

                    {/* =========================================================================
                        CARD BODY: PORTRAIT + CONTACT CHIP + DATA FIELDS + SIGNATURE + QR
                       ========================================================================= */}
                    <div className="grid min-h-0 flex-1 grid-cols-[5.4cqw_21cqw_minmax(0,1fr)] items-start gap-x-[2.6cqw] pt-[1.8cqw]">
                        {/* Far Left Column: Metallic Gold Smart Card Contact Chip */}
                        <div className="flex h-full items-center justify-center">
                            <Chip className="h-[4.2cqw] w-[5.4cqw]" />
                        </div>

                        {/* Middle-Left Column: Citizen Photo + Name */}
                        <div className="flex flex-col">
                            {/* Portrait Frame */}
                            <div className="relative">
                                <div className="h-[27cqw] w-full overflow-hidden rounded-[1.4cqw] border-[0.45cqw] border-white bg-slate-200 shadow-md ring-1 ring-black/15">
                                    <img
                                        src={photoSrc || '/images/john-kumal-portrait.png'}
                                        alt={fullName}
                                        className="h-full w-full object-cover object-top"
                                        onError={(e) => {
                                            // Fallback to placeholder if file missing
                                            e.currentTarget.src = '/images/png-hero-photo.png';
                                        }}
                                    />
                                </div>

                                {/* Rainbow Iridescent Biometric Fingerprint Hologram Overlay */}
                                <div
                                    className="pointer-events-none absolute -right-[2.5cqw] -bottom-[2.5cqw] size-[8.5cqw] rounded-full opacity-80"
                                    style={{
                                        background:
                                            'conic-gradient(from 180deg, rgba(236,72,153,0.85), rgba(139,92,246,0.85), rgba(59,130,246,0.85), rgba(16,185,129,0.85), rgba(245,158,11,0.85), rgba(236,72,153,0.85))',
                                        maskImage: 'radial-gradient(circle, black 40%, transparent 75%)',
                                        WebkitMaskImage: 'radial-gradient(circle, black 40%, transparent 75%)',
                                        filter: 'blur(0.2px)',
                                    }}
                                    aria-hidden="true"
                                >
                                    <svg viewBox="0 0 24 24" className="h-full w-full stroke-white p-1" fill="none" strokeWidth={1.4}>
                                        <path d="M12 2a10 10 0 0 0-10 10c0 4.2 2.6 7.8 6.3 9.3" />
                                        <path d="M12 6a6 6 0 0 0-6 6c0 2.5 1.5 4.7 3.8 5.6" />
                                        <path d="M12 10a2 2 0 0 0-2 2c0 .9.5 1.7 1.3 2" />
                                    </svg>
                                </div>
                            </div>

                            {/* Citizen Name Directly Below Photo (Exactly like template) */}
                            <div className="mt-[1.4cqw] leading-[1.05] font-black uppercase tracking-[0.01em] text-black">
                                <div className="text-[2.6cqw]">{nameLines[0]}</div>
                                {nameLines[1] && <div className="text-[2.4cqw]">{nameLines[1]}</div>}
                            </div>
                        </div>

                        {/* Right Column: Data Fields & Official Verification Bar */}
                        <div className="flex h-full flex-col justify-between pl-[0.5cqw]">
                            {/* ID Number Badge (White embossed box) */}
                            <div>
                                <span className="text-[1.3cqw] font-black text-slate-700 uppercase tracking-[0.16em]">
                                    ID NUMBER:
                                </span>
                                <div className="mt-[0.2cqw] inline-block rounded-[1cqw] border border-black/15 bg-white/95 px-[2cqw] py-[0.6cqw] shadow-xs">
                                    <span className="font-mono text-[3.8cqw] font-black tracking-[0.05em] text-black leading-none">
                                        {idNumber}
                                    </span>
                                </div>
                            </div>

                            {/* Demographic Fields Grid */}
                            <div className="mt-[1.2cqw] space-y-[0.8cqw] text-[1.95cqw] font-bold text-black leading-snug">
                                <div>
                                    <span className="text-slate-600 font-medium">DATE OF BIRTH: </span>
                                    <span className="font-mono">{dateOfBirth}</span>
                                </div>

                                <div className="flex items-center gap-[2.5cqw]">
                                    <div>
                                        <span className="text-slate-600 font-medium">SEX: </span>
                                        <span>{sex}</span>
                                    </div>
                                    <div>
                                        <span className="text-slate-600 font-medium">NATIONALITY: </span>
                                        <span className="uppercase">{nationality}</span>
                                    </div>
                                </div>

                                <div>
                                    <span className="text-slate-600 font-medium">EXPIRY DATE: </span>
                                    <span className="font-mono">{expiryDate}</span>
                                </div>

                                <div>
                                    <span className="text-slate-600 font-medium">AUTHORITY: </span>
                                    <span className="uppercase">{authority}</span>
                                </div>
                            </div>

                            {/* Bottom Row: Signature & QR Code */}
                            <div className="mt-[1cqw] flex items-end justify-between border-t border-black/10 pt-[0.8cqw]">
                                {/* Official Handwritten Signature */}
                                <div>
                                    <p
                                        className="text-[3.8cqw] leading-none text-[#1e3a8a] font-normal"
                                        style={{
                                            fontFamily: "'Segoe Script', 'Brush Script MT', 'Caveat', cursive",
                                            transform: 'rotate(-2deg)',
                                        }}
                                    >
                                        {signatureName}
                                    </p>
                                </div>

                                {/* Secure 2D Cryptographic QR Code */}
                                <div className="rounded-[1.1cqw] border border-black/15 bg-white p-[0.6cqw] shadow-sm">
                                    <div className="relative size-[9.2cqw]">
                                        {qrSvg ? (
                                            <div
                                                className="[&_svg]:h-full [&_svg]:w-full"
                                                dangerouslySetInnerHTML={{ __html: qrSvg }}
                                            />
                                        ) : (
                                            <div className="h-full w-full flex items-center justify-center relative">
                                                <QrCode className="h-full w-full text-black stroke-[1.5]" />
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <div className="size-[2.6cqw] rounded-full bg-white flex items-center justify-center shadow-xs">
                                                        <img src="/images/identriq-mark.png" alt="" className="size-[2cqw] object-contain" />
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function Chip({ className }: { className?: string }) {
    return (
        <div
            className={cn(
                'relative overflow-hidden rounded-[0.8cqw] border border-[#a16207] shadow-sm',
                className,
            )}
            style={{
                background:
                    'linear-gradient(135deg, #fef08a 0%, #eab308 30%, #ca8a04 70%, #854d0e 100%)',
            }}
            aria-hidden="true"
        >
            {/* Etched Contact Pads */}
            <div className="absolute inset-[0.4cqw] rounded-[0.4cqw] border border-black/25">
                <div className="absolute inset-y-0 left-1/3 w-px bg-black/20" />
                <div className="absolute inset-y-0 left-2/3 w-px bg-black/20" />
                <div className="absolute inset-x-0 top-1/2 h-px bg-black/20" />
            </div>
        </div>
    );
}
