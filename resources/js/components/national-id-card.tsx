import { useId, useMemo, type ReactNode } from 'react';
import { QrCode } from 'lucide-react';
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
    /** Portrait photo URL; falls back to a neutral silhouette placeholder. */
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
    photoSrc = '/images/portrait-placeholder.svg',
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
                        'linear-gradient(105deg, #c74d28 0%, #d86937 14%, #fbf6ec 27%, #fdfdfc 48%, #f0f7fc 68%, #b3def6 86%, #0284c7 100%)',
                }}
            >
                {/* Traditional Papua New Guinea Tapa & Banknote Guilloche Security Pattern */}
                <svg
                    className="pointer-events-none absolute inset-0 h-full w-full"
                    viewBox="0 0 100 63.1"
                    preserveAspectRatio="none"
                    aria-hidden="true"
                >
                    <defs>
                        {/* Concentric Guilloche Circles in the center */}
                        <pattern
                            id={`${patternId}-guilloche`}
                            width="40"
                            height="40"
                            patternUnits="userSpaceOnUse"
                        >
                            <circle
                                cx="20"
                                cy="20"
                                r="19"
                                fill="none"
                                stroke="#1d4ed8"
                                strokeWidth="0.1"
                                opacity="0.14"
                                strokeDasharray="0.6 0.3"
                            />
                            <circle
                                cx="20"
                                cy="20"
                                r="16"
                                fill="none"
                                stroke="#d97706"
                                strokeWidth="0.1"
                                opacity="0.12"
                            />
                            <circle
                                cx="20"
                                cy="20"
                                r="13"
                                fill="none"
                                stroke="#0284c7"
                                strokeWidth="0.08"
                                opacity="0.14"
                                strokeDasharray="0.4 0.2"
                            />
                            <circle
                                cx="20"
                                cy="20"
                                r="10"
                                fill="none"
                                stroke="#2563eb"
                                strokeWidth="0.08"
                                opacity="0.15"
                            />
                            <circle
                                cx="20"
                                cy="20"
                                r="7"
                                fill="none"
                                stroke="#b45309"
                                strokeWidth="0.06"
                                opacity="0.12"
                            />
                            <circle
                                cx="20"
                                cy="20"
                                r="4"
                                fill="none"
                                stroke="#0284c7"
                                strokeWidth="0.06"
                                opacity="0.14"
                            />
                        </pattern>

                        {/* Traditional Melanesian Tapa Left Pattern */}
                        <pattern
                            id={`${patternId}-left-tapa`}
                            width="14"
                            height="14"
                            patternUnits="userSpaceOnUse"
                        >
                            {/* Dark terracotta chevron arrowheads */}
                            <path
                                d="M 0 0 L 7 7 L 0 14 Z M 7 0 L 14 7 L 7 14 Z"
                                fill="#7f1d1d"
                                opacity="0.35"
                            />
                            {/* Ochre diamond center */}
                            <polygon
                                points="7,2 12,7 7,12 2,7"
                                fill="#f59e0b"
                                opacity="0.25"
                            />
                            <circle
                                cx="7"
                                cy="7"
                                r="1"
                                fill="#fff"
                                opacity="0.4"
                            />
                        </pattern>

                        {/* Traditional Pacific Oceanic Cyan Tapa Pattern */}
                        <pattern
                            id={`${patternId}-right-tapa`}
                            width="12"
                            height="12"
                            patternUnits="userSpaceOnUse"
                        >
                            {/* Cyan diamond weave */}
                            <polygon
                                points="6,0 12,6 6,12 0,6"
                                fill="none"
                                stroke="#0284c7"
                                strokeWidth="0.6"
                                opacity="0.4"
                            />
                            <polygon
                                points="6,2 10,6 6,10 2,6"
                                fill="#38bdf8"
                                opacity="0.28"
                            />
                            <path
                                d="M 0 0 L 6 6 L 12 0 M 0 12 L 6 6 L 12 12"
                                stroke="#0369a1"
                                strokeWidth="0.4"
                                opacity="0.3"
                                fill="none"
                            />
                        </pattern>

                        {/* Smooth gradient masks for organic tapa transitions */}
                        <linearGradient
                            id={`${patternId}-left-fade`}
                            x1="0"
                            y1="0"
                            x2="1"
                            y2="0"
                        >
                            <stop
                                offset="0%"
                                stopColor="#fff"
                                stopOpacity="0.9"
                            />
                            <stop
                                offset="70%"
                                stopColor="#fff"
                                stopOpacity="0.7"
                            />
                            <stop
                                offset="100%"
                                stopColor="#fff"
                                stopOpacity="0"
                            />
                        </linearGradient>

                        <linearGradient
                            id={`${patternId}-right-fade`}
                            x1="1"
                            y1="0"
                            x2="0"
                            y2="0"
                        >
                            <stop
                                offset="0%"
                                stopColor="#fff"
                                stopOpacity="0.95"
                            />
                            <stop
                                offset="70%"
                                stopColor="#fff"
                                stopOpacity="0.7"
                            />
                            <stop
                                offset="100%"
                                stopColor="#fff"
                                stopOpacity="0"
                            />
                        </linearGradient>
                    </defs>

                    {/* Central Banknote Guilloche Background */}
                    <rect
                        x="20"
                        y="0"
                        width="60"
                        height="63.1"
                        fill={`url(#${patternId}-guilloche)`}
                    />

                    {/* Faint Center Circular Watermark Rosette */}
                    <g transform="translate(62, 31)" opacity="0.18">
                        <circle
                            cx="0"
                            cy="0"
                            r="18"
                            fill="none"
                            stroke="#0284c7"
                            strokeWidth="0.2"
                        />
                        <circle
                            cx="0"
                            cy="0"
                            r="14"
                            fill="none"
                            stroke="#b45309"
                            strokeWidth="0.15"
                            strokeDasharray="0.8 0.4"
                        />
                        <circle
                            cx="0"
                            cy="0"
                            r="10"
                            fill="none"
                            stroke="#1d4ed8"
                            strokeWidth="0.2"
                        />
                        <circle
                            cx="0"
                            cy="0"
                            r="6"
                            fill="none"
                            stroke="#0284c7"
                            strokeWidth="0.15"
                        />
                        {Array.from({ length: 12 }).map((_, i) => (
                            <line
                                key={`ray-${i}`}
                                x1="0"
                                y1="0"
                                x2={Math.cos((i * 30 * Math.PI) / 180) * 17}
                                y2={Math.sin((i * 30 * Math.PI) / 180) * 17}
                                stroke="#d97706"
                                strokeWidth="0.12"
                            />
                        ))}
                    </g>

                    {/* Left Terracotta Tapa Zone with Curved Organic Border */}
                    <path
                        d="M 0 0 L 26 0 Q 30 20 25 40 Q 20 55 24 63.1 L 0 63.1 Z"
                        fill={`url(#${patternId}-left-tapa)`}
                    />
                    <path
                        d="M 0 0 L 26 0 Q 30 20 25 40 Q 20 55 24 63.1 L 0 63.1 Z"
                        fill="#b91c1c"
                        opacity="0.15"
                    />

                    {/* Right Oceanic Cyan Tapa Zone with Organic Curved Sweep */}
                    <path
                        d="M 100 0 L 76 0 Q 72 20 78 40 Q 82 55 75 63.1 L 100 63.1 Z"
                        fill={`url(#${patternId}-right-tapa)`}
                    />
                    <path
                        d="M 100 0 L 76 0 Q 72 20 78 40 Q 82 55 75 63.1 L 100 63.1 Z"
                        fill="#0284c7"
                        opacity="0.12"
                    />

                    {/* Fine Security Micro-wave Ribbon along the bottom */}
                    <path
                        d="M 0 58 Q 25 54 50 58 T 100 58"
                        fill="none"
                        stroke="#0284c7"
                        strokeWidth="0.15"
                        opacity="0.35"
                    />
                    <path
                        d="M 0 59 Q 25 55 50 59 T 100 59"
                        fill="none"
                        stroke="#d97706"
                        strokeWidth="0.1"
                        opacity="0.3"
                    />
                </svg>

                {/* Subtle Light Reflection Sheen Overlay */}
                <div
                    className="pointer-events-none absolute inset-0 opacity-40"
                    style={{
                        background:
                            'linear-gradient(135deg, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0) 40%, rgba(255,255,255,0.25) 100%)',
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
                                    src="/images/png-crest-kumul-hd.png"
                                    alt="Papua New Guinea Crest"
                                    className="h-[7.8cqw] w-auto object-contain drop-shadow-xs"
                                    onError={(e) => {
                                        e.currentTarget.src =
                                            '/images/png-crest-kumul.png';
                                    }}
                                />
                            )}
                        </div>

                        {/* Top Center: Official State Header */}
                        <div className="flex-1 text-center">
                            <h2
                                className="font-serif text-[3.2cqw] leading-tight font-black tracking-[0.06em] text-[#9A6214] uppercase"
                                style={{
                                    textShadow:
                                        '0 1px 1px rgba(255,255,255,0.8), 0 -1px 1px rgba(0,0,0,0.1)',
                                }}
                            >
                                PAPUA NEW GUINEA
                            </h2>
                            <h3 className="mt-[0.3cqw] text-[2.4cqw] leading-none font-black tracking-[0.02em] text-[#0B2B64] uppercase">
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
                                        src={
                                            photoSrc ||
                                            '/images/portrait-placeholder.svg'
                                        }
                                        alt={fullName}
                                        className="h-full w-full object-cover object-center"
                                        onError={(e) => {
                                            e.currentTarget.src =
                                                '/images/portrait-placeholder.svg';
                                        }}
                                    />
                                </div>

                                {/* Rainbow Iridescent Biometric Fingerprint Hologram Overlay */}
                                <div
                                    className="pointer-events-none absolute -right-[2.8cqw] -bottom-[2.8cqw] size-[9.2cqw] rounded-full"
                                    style={{
                                        filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.15))',
                                    }}
                                    aria-hidden="true"
                                >
                                    <svg
                                        viewBox="0 0 100 100"
                                        className="h-full w-full"
                                    >
                                        <defs>
                                            <linearGradient
                                                id={`${patternId}-holo-grad`}
                                                x1="0%"
                                                y1="0%"
                                                x2="100%"
                                                y2="100%"
                                            >
                                                <stop
                                                    offset="0%"
                                                    stopColor="#06b6d4"
                                                    stopOpacity="0.85"
                                                />
                                                <stop
                                                    offset="25%"
                                                    stopColor="#10b981"
                                                    stopOpacity="0.85"
                                                />
                                                <stop
                                                    offset="50%"
                                                    stopColor="#f59e0b"
                                                    stopOpacity="0.85"
                                                />
                                                <stop
                                                    offset="75%"
                                                    stopColor="#ec4899"
                                                    stopOpacity="0.85"
                                                />
                                                <stop
                                                    offset="100%"
                                                    stopColor="#8b5cf6"
                                                    stopOpacity="0.85"
                                                />
                                            </linearGradient>
                                        </defs>
                                        {/* Fingerprint ridges looping */}
                                        <path
                                            d="M 50 15 A 35 35 0 0 1 85 50 A 35 35 0 0 1 78 72"
                                            fill="none"
                                            stroke={`url(#${patternId}-holo-grad)`}
                                            strokeWidth="3.2"
                                            strokeLinecap="round"
                                        />
                                        <path
                                            d="M 22 65 A 35 35 0 0 1 15 50 A 35 35 0 0 1 50 15"
                                            fill="none"
                                            stroke={`url(#${patternId}-holo-grad)`}
                                            strokeWidth="3.2"
                                            strokeLinecap="round"
                                        />
                                        <path
                                            d="M 50 25 A 25 25 0 0 1 75 50 A 25 25 0 0 1 65 72"
                                            fill="none"
                                            stroke={`url(#${patternId}-holo-grad)`}
                                            strokeWidth="3.2"
                                            strokeLinecap="round"
                                        />
                                        <path
                                            d="M 35 72 A 25 25 0 0 1 25 50 A 25 25 0 0 1 50 25"
                                            fill="none"
                                            stroke={`url(#${patternId}-holo-grad)`}
                                            strokeWidth="3.2"
                                            strokeLinecap="round"
                                        />
                                        <path
                                            d="M 50 35 A 15 15 0 0 1 65 50 Q 65 65 50 78 Q 35 65 35 50 A 15 15 0 0 1 50 35"
                                            fill="none"
                                            stroke={`url(#${patternId}-holo-grad)`}
                                            strokeWidth="3.2"
                                            strokeLinecap="round"
                                        />
                                        <path
                                            d="M 50 45 A 5 5 0 0 1 55 50 Q 55 60 50 68 Q 45 60 45 50 A 5 5 0 0 1 50 45"
                                            fill="none"
                                            stroke={`url(#${patternId}-holo-grad)`}
                                            strokeWidth="3.2"
                                            strokeLinecap="round"
                                        />
                                    </svg>
                                </div>
                            </div>

                            {/* Citizen Name Directly Below Photo (Exactly like template) */}
                            <div className="mt-[1.4cqw] leading-[1.05] font-black tracking-[0.01em] text-black uppercase">
                                <div className="text-[2.6cqw]">
                                    {nameLines[0]}
                                </div>
                                {nameLines[1] && (
                                    <div className="text-[2.4cqw]">
                                        {nameLines[1]}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Right Column: Data Fields & Official Verification Bar */}
                        <div className="flex h-full flex-col justify-between pl-[0.5cqw]">
                            {/* ID Number Badge (White embossed box) */}
                            <div>
                                <span className="text-[1.3cqw] font-black tracking-[0.16em] text-slate-700 uppercase">
                                    ID NUMBER:
                                </span>
                                <div className="mt-[0.2cqw] inline-block rounded-[1cqw] border border-black/15 bg-white/95 px-[2cqw] py-[0.6cqw] shadow-xs">
                                    <span className="font-mono text-[3.8cqw] leading-none font-black tracking-[0.05em] text-black">
                                        {idNumber}
                                    </span>
                                </div>
                            </div>

                            {/* Demographic Fields Grid */}
                            <div className="mt-[1.2cqw] space-y-[0.8cqw] text-[1.95cqw] leading-snug font-bold text-black">
                                <div>
                                    <span className="font-medium text-slate-600">
                                        DATE OF BIRTH:{' '}
                                    </span>
                                    <span className="font-mono">
                                        {dateOfBirth}
                                    </span>
                                </div>

                                <div className="flex items-center gap-[2.5cqw]">
                                    <div>
                                        <span className="font-medium text-slate-600">
                                            SEX:{' '}
                                        </span>
                                        <span>{sex}</span>
                                    </div>
                                    <div>
                                        <span className="font-medium text-slate-600">
                                            NATIONALITY:{' '}
                                        </span>
                                        <span className="uppercase">
                                            {nationality}
                                        </span>
                                    </div>
                                </div>

                                <div>
                                    <span className="font-medium text-slate-600">
                                        EXPIRY DATE:{' '}
                                    </span>
                                    <span className="font-mono">
                                        {expiryDate}
                                    </span>
                                </div>

                                <div>
                                    <span className="font-medium text-slate-600">
                                        AUTHORITY:{' '}
                                    </span>
                                    <span className="uppercase">
                                        {authority}
                                    </span>
                                </div>
                            </div>

                            {/* Bottom Row: Signature & QR Code */}
                            <div className="mt-[1cqw] flex items-end justify-between border-t border-black/10 pt-[0.8cqw]">
                                {/* Official Handwritten Signature */}
                                <div>
                                    <p
                                        className="text-[3.8cqw] leading-none font-normal text-[#1e3a8a]"
                                        style={{
                                            fontFamily:
                                                "'Segoe Script', 'Brush Script MT', 'Caveat', cursive",
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
                                                dangerouslySetInnerHTML={{
                                                    __html: qrSvg,
                                                }}
                                            />
                                        ) : (
                                            <div className="relative flex h-full w-full items-center justify-center">
                                                <QrCode className="h-full w-full stroke-[1.5] text-black" />
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <div className="flex size-[2.6cqw] items-center justify-center rounded-full bg-white shadow-xs">
                                                        <img
                                                            src="/images/identriq-mark.png"
                                                            alt=""
                                                            className="size-[2cqw] object-contain"
                                                        />
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

export { default as NationalIdCardBack } from './national-id-card-back';
