import { useId, useMemo } from 'react';
import { QrCode, Sparkles, Wifi } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface NationalIdCardBackProps {
    /** Citizen full name, e.g. "KUMAL, JOHN A." or "Mary Kila" */
    fullName?: string;
    /** National ID / BioSure ID, e.g. "785-3049-921-A" */
    idNumber?: string;
    dateOfBirth?: string;
    sex?: string;
    expiryDate?: string;
    qrSvg?: string | null;
    qrToken?: string | null;
    mobile?: string;
    status?: string;
    className?: string;
}

/** Format citizen name for ICAO 9303 Doc MRZ Line 1: IDPNG<SURNAME><<GIVEN<NAMES<<<<<< */
function formatMrzName(name: string): string {
    const clean = name
        .toUpperCase()
        .replace(/[^A-Z,\s]/g, '')
        .trim();
    let surname = 'CITIZEN';
    let given = '';

    if (clean.includes(',')) {
        const parts = clean.split(',').map((p) => p.trim());
        surname = parts[0] || 'CITIZEN';
        given = parts.slice(1).join(' ').replace(/\s+/g, '<');
    } else {
        const parts = clean.split(/\s+/);
        if (parts.length > 1) {
            surname = parts[parts.length - 1];
            given = parts.slice(0, -1).join('<');
        } else {
            surname = parts[0] || 'CITIZEN';
        }
    }

    const raw = `IDPNG${surname}<<${given}`;
    return raw.padEnd(30, '<').slice(0, 30);
}

const MRZ_MONTHS: Record<string, string> = {
    JAN: '01',
    FEB: '02',
    MAR: '03',
    APR: '04',
    MAY: '05',
    JUN: '06',
    JUL: '07',
    AUG: '08',
    SEP: '09',
    OCT: '10',
    NOV: '11',
    DEC: '12',
};

/**
 * YYMMDD for an ICAO MRZ field. Plain dates and already-formatted
 * "14 APR 1988" strings are used as-is; full timestamps (UTC instants from the
 * API) render as the PNG civil date so the digits never shift a day early.
 */
function mrzDatePart(value?: string | null): string | null {
    if (!value) return null;

    const plain = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
    if (plain) return `${plain[1].slice(2)}${plain[2]}${plain[3]}`;

    const shown = /^(\d{2})\s([A-Za-z]{3})\s(\d{4})$/.exec(value);
    if (shown) {
        const month = MRZ_MONTHS[shown[2].toUpperCase()];
        if (month) return `${shown[3].slice(2)}${month}${shown[1]}`;
    }

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return null;

    const parts = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Pacific/Port_Moresby',
        year: '2-digit',
        month: '2-digit',
        day: '2-digit',
    }).formatToParts(parsed);
    const part = (type: string) =>
        parts.find((p) => p.type === type)?.value ?? '';

    return `${part('year')}${part('month')}${part('day')}`;
}

/** Format ICAO 9303 Doc MRZ Line 2: <ID_NUM>PNG<DOB_YYMMDD><SEX><EXP_YYMMDD><CHK><<<< */
function formatMrzData(
    idNumber?: string,
    dob?: string,
    sex?: string,
    expiry?: string,
): string {
    const cleanId = (idNumber || '7853049921')
        .replace(/[^A-Z0-9]/gi, '')
        .padEnd(9, '<')
        .slice(0, 9);

    const dobStr = mrzDatePart(dob) ?? '880414';
    const sexChar = (sex || 'M').charAt(0).toUpperCase();
    const expStr = mrzDatePart(expiry) ?? '311024';

    const raw = `${cleanId}8PNG${dobStr}8${sexChar}${expStr}2`;
    return raw.padEnd(30, '<').slice(0, 30);
}

export default function NationalIdCardBack({
    fullName = 'KUMAL, JOHN A.',
    idNumber = '785-3049-921-A',
    dateOfBirth = '14 APR 1988',
    sex = 'M',
    expiryDate = '24 OCT 2031',
    qrSvg = null,
    className,
}: NationalIdCardBackProps) {
    const patternId = `nid-back-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;

    const mrzLine1 = useMemo(() => formatMrzName(fullName), [fullName]);
    const mrzLine2 = useMemo(
        () => formatMrzData(idNumber, dateOfBirth, sex, expiryDate),
        [idNumber, dateOfBirth, sex, expiryDate],
    );

    return (
        <div
            className={cn('@container w-full font-sans select-none', className)}
            role="img"
            aria-label={`Papua New Guinea National Identity Card Back for ${fullName}`}
        >
            <div
                className="relative flex aspect-[1.586] w-full flex-col justify-between overflow-hidden rounded-[2.8cqw] text-slate-900 shadow-2xl ring-1 ring-black/15"
                style={{
                    background:
                        'linear-gradient(105deg, #c74d28 0%, #d86937 14%, #fbf6ec 27%, #fdfdfc 48%, #f0f7fc 68%, #b3def6 86%, #0284c7 100%)',
                }}
            >
                {/* Traditional Papua New Guinea Tapa & Banknote Guilloche Security Pattern (Same as front) */}
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
                            <path
                                d="M 0 0 L 7 7 L 0 14 Z M 7 0 L 14 7 L 7 14 Z"
                                fill="#7f1d1d"
                                opacity="0.35"
                            />
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
                    <g transform="translate(48, 31)" opacity="0.18">
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

                {/* =========================================================================
                    TOP: OPTICALLY VARIABLE CRYPTOGRAPHIC BAR & STANDARD MARKS
                   ========================================================================= */}
                <div className="relative z-10 flex h-[8.5cqw] w-full items-center justify-between border-b border-black/20 bg-slate-950/95 px-[2.8cqw] shadow-xs">
                    {/* Holographic Rainbow Security Shimmer Bar */}
                    <div
                        className="pointer-events-none absolute inset-x-0 bottom-0 h-[0.4cqw]"
                        style={{
                            background:
                                'linear-gradient(90deg, #06b6d4, #10b981, #f59e0b, #ec4899, #8b5cf6, #06b6d4)',
                            opacity: 0.9,
                        }}
                    />

                    <div className="flex items-center gap-[1.2cqw]">
                        <Sparkles className="size-[2.4cqw] text-[#F59E0B]" />
                        <span className="font-mono text-[1.6cqw] font-black tracking-[0.16em] text-[#38BDF8] uppercase">
                            OPTICAL VARIABLE CRYPTOGRAPHIC BAR
                        </span>
                    </div>

                    <div className="flex items-center gap-[2cqw]">
                        <span className="font-mono text-[1.5cqw] font-semibold tracking-wider text-white/70">
                            ISO/IEC 7810 ID-1
                        </span>
                        <div className="flex items-center gap-[0.5cqw] text-[#38BDF8]">
                            <Wifi className="size-[2.2cqw] rotate-90" />
                            <span className="font-mono text-[1.4cqw] font-bold">
                                NFC
                            </span>
                        </div>
                    </div>
                </div>

                {/* =========================================================================
                    MIDDLE: SOVEREIGN NOTICE + HOTLINE + SEAL + QR CODE
                   ========================================================================= */}
                <div className="relative z-10 flex flex-1 items-center justify-between gap-[2.4cqw] px-[3cqw] py-[1.5cqw]">
                    {/* Left & Center: Legal Notice & Sovereign Authority */}
                    <div className="flex h-full flex-1 flex-col justify-between py-[0.5cqw]">
                        <div>
                            {/* Gold Sovereign Authority Heading */}
                            <div className="flex items-center gap-[1.2cqw]">
                                <img
                                    src="/images/png-crest-kumul-hd.png"
                                    alt=""
                                    className="h-[4cqw] w-auto object-contain drop-shadow-xs"
                                    onError={(e) => {
                                        e.currentTarget.src =
                                            '/images/png-crest-kumul.png';
                                    }}
                                />
                                <h3 className="font-serif text-[2cqw] font-black tracking-[0.06em] text-[#9A6214] uppercase drop-shadow-xs">
                                    INDEPENDENT STATE OF PAPUA NEW GUINEA
                                </h3>
                            </div>

                            {/* Legal Sovereign Property Statement */}
                            <p className="mt-[0.8cqw] max-w-[58cqw] text-[1.35cqw] leading-[1.35] font-semibold text-[#0B254A]">
                                This card remains the property of the Independent State of Papua New Guinea. Issued under the Civil and National Registration Act. If found, please return to any Provincial Civil Registry Center or nearest police station.
                            </p>
                        </div>

                        {/* Bottom Row: Official Seal + Registrar General Signature + Hotline */}
                        <div className="mt-auto flex items-end justify-between border-t border-black/10 pt-[0.8cqw]">
                            {/* Helpline */}
                            <div>
                                <span className="block text-[1.15cqw] font-bold tracking-wider text-slate-600 uppercase">
                                    National Registry Hotline
                                </span>
                                <span className="font-mono text-[1.5cqw] font-black tracking-wide text-[#0B2B64]">
                                    +675 301 3500 · www.nid.gov.pg
                                </span>
                            </div>

                            {/* Registrar General Official Stamp & Signature */}
                            <div className="flex items-center gap-[1.2cqw] text-right">
                                {/* Circular Red/Gold Sovereign Seal */}
                                <div className="flex size-[5cqw] items-center justify-center rounded-full border border-[#b45309] bg-gradient-to-br from-amber-500/25 to-red-600/35 p-[0.3cqw] shadow-xs">
                                    <div className="flex size-full items-center justify-center rounded-full border border-dashed border-[#b45309] text-center text-[0.8cqw] leading-[0.9] font-black text-[#9A6214]">
                                        SEAL
                                    </div>
                                </div>
                                <div>
                                    <span className="block text-[1.15cqw] font-bold tracking-wider text-slate-600 uppercase">
                                        Authorized Signature
                                    </span>
                                    <span className="font-serif text-[1.6cqw] font-bold text-[#0B2B64] italic">
                                        K. Amari · Registrar General
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Cryptographic QR Code Container */}
                    <div className="flex shrink-0 flex-col items-center justify-center">
                        <div className="rounded-[1.2cqw] border border-black/15 bg-white p-[0.8cqw] shadow-sm ring-1 ring-black/5">
                            <div className="relative size-[10.5cqw]">
                                {qrSvg ? (
                                    <div
                                        className="[&_svg]:h-full [&_svg]:w-full"
                                        dangerouslySetInnerHTML={{
                                            __html: qrSvg,
                                        }}
                                    />
                                ) : (
                                    <div className="relative flex h-full w-full items-center justify-center">
                                        <QrCode className="h-full w-full stroke-[1.6] text-slate-900" />
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="flex size-[2.8cqw] items-center justify-center rounded-full bg-white shadow-xs">
                                                <img
                                                    src="/images/identriq-mark.png"
                                                    alt=""
                                                    className="size-[2.2cqw] object-contain"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                        <span className="mt-[0.4cqw] font-mono text-[1.15cqw] font-bold tracking-wider text-slate-700">
                            SECURE 2D QR
                        </span>
                    </div>
                </div>

                {/* =========================================================================
                    BOTTOM: ICAO DOC 9303 MACHINE READABLE ZONE (MRZ)
                   ========================================================================= */}
                <div className="relative z-10 m-[1.6cqw] mt-0 rounded-[1cqw] border border-black/30 bg-[#06152B]/95 px-[2cqw] py-[0.8cqw] font-mono shadow-md backdrop-blur-xs">
                    <div className="truncate text-[1.8cqw] leading-snug font-black tracking-[0.25em] text-[#38BDF8] select-all">
                        {mrzLine1}
                    </div>
                    <div className="truncate text-[1.8cqw] leading-snug font-black tracking-[0.25em] text-[#38BDF8] select-all">
                        {mrzLine2}
                    </div>
                </div>
            </div>
        </div>
    );
}
