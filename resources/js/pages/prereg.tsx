import { Head, Link, router, usePage } from '@inertiajs/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import CenterMap from '@/components/center-map';
import AppointmentConfirmationCard from '@/components/appointment-confirmation-card';

interface Demographic {
    given_name?: string;
    family_name?: string;
    middle_name?: string;
    other_names?: string;
    full_name?: string;
    dob?: string;
    gender?: string;
    nationality?: string;
    marital_status?: string;
    mobile?: string;
    email?: string;
    province?: string;
    district?: string;
    llg?: string;
    ward?: string;
    village?: string;
    residential_address?: string;
    address_line?: string;
    postal_code?: string;
    [key: string]: string | undefined;
}

interface Appointment {
    id: number;
    qr_token: string;
    slot_at: string;
    status: string;
    center?: { name: string; location: string };
}

interface Draft {
    mobile?: string;
    demographic?: Demographic | null;
    documents?: { id: number; category: string; doc_type: string; ref_number?: string | null; verified_status: string }[];
    appointments?: Appointment[];
}

export interface CalendarDay {
    dateStr: string;
    dayName: string;
    formattedDate: string;
    slotsCount: number;
    isFull: boolean;
}

export interface TimeSlotItem {
    label: string;
    time24: string;
    total: number;
    booked: number;
    available: number;
    isFull: boolean;
}

export interface SlotData {
    center_id: number;
    selected_date: string;
    daily_capacity: number;
    slot_capacity: number;
    calendar: CalendarDay[];
    slots: TimeSlotItem[];
}

const TITLES = [
    'Language',
    'Mobile',
    'OTP',
    'Consent',
    'Personal Details',
    'Documents',
    'Review',
    'Center',
    'Slot',
    'Confirmation',
];

const PNG_PROVINCES: Record<string, string[]> = {
    'National Capital District': ['Moresby North-East', 'Moresby North-West', 'Moresby South'],
    'Morobe': ['Lae', 'Huon Gulf', 'Finschhafen', 'Markham', 'Nawaeb', 'Bulolo', 'Menyamya', 'Tewae-Siassi', 'Wau-Waria'],
    'Western Highlands': ['Mt Hagen', 'Dei', 'Mul-Baiyer', 'Tambul-Nebilyer'],
    'Eastern Highlands': ['Goroka', 'Daulo', 'Henganofi', 'Kainantu', 'Lufa', 'Obura-Wonenara', 'Okapa', 'Unggai-Bena'],
    'East New Britain': ['Kokopo', 'Rabaul', 'Gazelle', 'Pomio'],
    'West New Britain': ['Talasea', 'Kandrian-Gloucester', 'Nakanai'],
    'Madang': ['Madang', 'Bogia', 'Sumkar', 'Ramu', 'Middle Ramu', 'Usino-Bundi'],
    'Autonomous Region of Bougainville': ['North Bougainville', 'Central Bougainville', 'South Bougainville'],
    'Enga': ['Wabag', 'Kompiam-Ambum', 'Lagaip-Porgera', 'Wapenamanda', 'Kandep'],
    'Hela': ['Tari-Pori', 'Komo-Margarima', 'Koroba-Lake Kopiago'],
    'Jiwaka': ['Anglimp-South Waghi', 'Jimi', 'North Waghi'],
    'Southern Highlands': ['Mendi-Munihu', 'Ialibu-Pangia', 'Imbonggu', 'Kagua-Erave', 'Nipa-Kutubu'],
    'Central': ['Abau', 'Goilala', 'Kairuku-Hiri', 'Rigo'],
    'Western': ['North Fly', 'Middle Fly', 'South Fly'],
    'Gulf': ['Kerema', 'Kikori'],
    'Milne Bay': ['Alotau', 'Esa\'ala', 'Kiriwina-Goodenough', 'Samarai-Murua'],
    'Oro (Northern)': ['Ijivitari', 'Sohe'],
    'East Sepik': ['Wewak', 'Ambunti-Dreikikir', 'Angoram', 'Maprik', 'Wosera-Gawi', 'Yangoru-Saussia'],
    'Sandaun (West Sepik)': ['Vanimo-Green River', 'Aitape-Lumi', 'Nuku', 'Telefomin'],
    'Manus': ['Manus'],
    'New Ireland': ['Kavieng', 'Namatanai'],
    'Simbu (Chimbu)': ['Kundiawa-Gembogl', 'Chuave', 'Gumine', 'Karimui-Nomane', 'Kerowagi', 'Sinasina-Yonggomugl'],
};

function Shell({ step, children }: { step: number; children: React.ReactNode }) {
    const isWide = step === 5 || step === 6 || step === 8 || step === 9 || step === 10;
    return (
        <div className="min-h-screen bg-[#F7F5EF] px-4 py-8 text-[#14201B] sm:px-8">
            <div className={`mx-auto ${isWide ? 'max-w-5xl xl:max-w-6xl' : 'max-w-4xl sm:max-w-5xl'}`}>
                <div className="flex items-center justify-between">
                    <Link href="/" className="inline-flex items-center gap-1.5 text-sm font-medium text-[#14201B]/70 hover:text-[#0E2A26] hover:underline">
                        <span>←</span> Return to Home
                    </Link>
                    <span className="text-xs font-semibold uppercase tracking-wider text-[#0E2A26]/50">
                        PNG National ID
                    </span>
                </div>

                <div className="mt-4 flex gap-1.5" role="progressbar" aria-valuenow={step} aria-valuemin={1} aria-valuemax={10}>
                    {TITLES.map((t, i) => (
                        <div
                            key={t}
                            title={`${i + 1}. ${t}`}
                            className={`h-2 flex-1 rounded-full transition-colors duration-300 ${
                                i + 1 <= step ? 'bg-[#0052CC]' : 'bg-[#14201B]/15'
                            }`}
                        />
                    ))}
                </div>

                <div className="mt-2.5 flex items-center justify-between text-xs text-[#14201B]/60 sm:text-sm">
                    <p className="font-medium">
                        Step {step} of 10 · <span className="font-semibold text-[#0F2644]">{TITLES[step - 1]}</span>
                    </p>
                    <span className="tabular-nums font-medium">{Math.round((step / 10) * 100)}% complete</span>
                </div>

                <div className="mt-4 rounded-2xl border border-[#14201B]/10 bg-white p-6 text-[#14201B] shadow-sm sm:p-8">
                    {children}
                </div>
            </div>
        </div>
    );
}

function Step1() {
    function submitEnglish() {
        router.post('/prereg/language', { language: 'en' });
    }

    useEffect(() => {
        function onKeyDown(e: KeyboardEvent) {
            if (e.key === 'Enter') {
                e.preventDefault();
                submitEnglish();
            }
        }
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, []);

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault();
                submitEnglish();
            }}
            className="mx-auto max-w-2xl"
        >
            <h2 className="text-2xl font-bold tracking-tight text-[#0E2A26]">Select your language</h2>
            <p className="mt-1 text-sm text-[#14201B]/70">
                Choose the language you would like to complete your pre-registration with.
            </p>
            <div className="mt-6 grid gap-3">
                <Button
                    type="submit"
                    className="h-12 justify-between rounded-xl bg-[#0052CC] px-5 text-base font-semibold text-white shadow-sm transition hover:bg-[#0047B3] active:scale-[0.99]"
                >
                    <span>English</span>
                    <span className="text-xs uppercase tracking-wider opacity-90">Continue (↵ Enter)</span>
                </Button>
                {['Tok Pisin — coming soon', 'Hiri Motu — coming soon'].map((l) => (
                    <Button key={l} disabled variant="outline" type="button" className="h-12 justify-start rounded-xl border border-slate-200 bg-slate-50/80 px-5 text-left text-sm text-slate-400">
                        {l}
                    </Button>
                ))}
            </div>
        </form>
    );
}

function Step2() {
    const [mobile, setMobile] = useState('+675');
    const [captchaInput, setCaptchaInput] = useState('');
    const [challenge, setChallenge] = useState('');
    const [captchaFailed, setCaptchaFailed] = useState(false);
    const [refreshingCaptcha, setRefreshingCaptcha] = useState(false);
    const loaded = useRef(false);
    const captchaRef = useRef<HTMLInputElement | null>(null);
    const { errors } = usePage().props as unknown as { errors: Record<string, string> };

    async function loadCaptcha() {
        setRefreshingCaptcha(true);
        setCaptchaFailed(false);
        try {
            const r = await fetch('/prereg/captcha');
            const j = await r.json();
            setChallenge(j.challenge ?? '');
            if (!j.challenge) setCaptchaFailed(true);
        } catch {
            setCaptchaFailed(true);
        } finally {
            setRefreshingCaptcha(false);
        }
    }

    useEffect(() => {
        if (loaded.current) return;
        loaded.current = true;
        void loadCaptcha();
    }, []);

    function onMobile(v: string) {
        let raw = v.replace(/[^\d+]/g, '');
        if (raw.startsWith('+675')) {
            raw = raw.slice(4);
        } else if (raw.startsWith('675')) {
            raw = raw.slice(3);
        } else if (raw.startsWith('+')) {
            raw = raw.slice(1);
        }
        const digits = raw.replace(/\D/g, '').slice(0, 7);
        setMobile('+675' + digits);
    }

    const digitsOnly = mobile.replace(/\D/g, '').replace(/^675/, '');

    function handleSubmit(e?: React.FormEvent) {
        if (e) e.preventDefault();
        if (digitsOnly.length !== 7) return;
        if (!captchaInput) {
            captchaRef.current?.focus();
            return;
        }
        router.post('/prereg/mobile', { mobile, captcha: captchaInput });
    }

    return (
        <form onSubmit={handleSubmit} className="mx-auto max-w-2xl">
            <h2 className="text-2xl font-bold tracking-tight text-[#0E2A26]">Your mobile number</h2>
            <p className="mt-1 text-sm text-[#14201B]/70">
                We will send an SMS verification code to confirm your contact number.
            </p>
            <div className="mt-6 grid gap-4">
                <div>
                    <Label htmlFor="mobile" className="font-semibold text-[#0E2A26]">Mobile number (Papua New Guinea)</Label>
                    <div className="relative mt-1">
                        <Input
                            id="mobile"
                            value={mobile}
                            onChange={(e) => onMobile(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    if (digitsOnly.length === 7 && !captchaInput) {
                                        e.preventDefault();
                                        captchaRef.current?.focus();
                                    }
                                }
                            }}
                            inputMode="tel"
                            maxLength={11}
                            autoFocus
                            className="h-12 font-mono text-base tracking-wider"
                            placeholder="+6757XXXXXXX"
                        />
                        <span className="absolute right-3 top-3 text-xs font-medium text-[#14201B]/50">
                            {digitsOnly.length}/7 digits
                        </span>
                    </div>
                    {errors.mobile && <p className="mt-1.5 text-sm font-medium text-red-600">{errors.mobile}</p>}
                </div>

                <div className="rounded-xl border border-[#14201B]/10 bg-[#14201B]/[0.02] p-4">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="captcha" className="font-semibold text-[#0E2A26]">Security Verification</Label>
                        <button
                            type="button"
                            onClick={loadCaptcha}
                            disabled={refreshingCaptcha}
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0052CC] hover:text-[#0047B3] hover:underline disabled:opacity-50 transition-colors"
                        >
                            ↻ Refresh code
                        </button>
                    </div>
                    <div className="mt-2 flex items-center gap-3">
                        <code className="flex h-11 min-w-28 items-center justify-center rounded-lg border border-[#0E2A26]/20 bg-white px-3 font-mono text-xl font-bold tracking-widest text-[#0E2A26]">
                            {refreshingCaptcha ? '...' : (challenge || (captchaFailed ? 'ERR' : '...'))}
                        </code>
                        <Input
                            ref={captchaRef}
                            id="captcha"
                            value={captchaInput}
                            onChange={(e) => setCaptchaInput(e.target.value.toUpperCase())}
                            maxLength={5}
                            placeholder="CODE"
                            className="h-11 font-mono text-base uppercase tracking-widest"
                            autoComplete="off"
                        />
                    </div>
                    {errors.captcha && <p className="mt-1.5 text-sm font-medium text-red-600">{errors.captcha}</p>}
                </div>

                <Button
                    type="submit"
                    disabled={digitsOnly.length !== 7 || !captchaInput}
                    className="mt-2 h-12 rounded-xl bg-[#0052CC] font-semibold text-white shadow-sm transition hover:bg-[#0047B3] active:scale-[0.99] disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed disabled:shadow-none"
                >
                    Send Verification Code (OTP) (↵ Enter)
                </Button>
            </div>
        </form>
    );
}

function Step3({ demoOtp }: { demoOtp: string | null }) {
    const [otp, setOtp] = useState('');
    const [countdown, setCountdown] = useState(60);
    const { errors } = usePage().props as unknown as { errors: Record<string, string> };

    useEffect(() => {
        if (countdown <= 0) return;
        const timer = setInterval(() => setCountdown((c) => c - 1), 1000);
        return () => clearInterval(timer);
    }, [countdown]);

    function resend() {
        if (countdown > 0) return;
        router.post('/prereg/otp/resend', {}, {
            onSuccess: () => setCountdown(60),
        });
    }

    function verify(e?: React.FormEvent) {
        if (e) e.preventDefault();
        if (otp.length !== 6) return;
        router.post('/prereg/otp/verify', { otp });
    }

    return (
        <form onSubmit={verify} className="mx-auto max-w-2xl">
            <h2 className="text-2xl font-bold tracking-tight text-[#0E2A26]">Enter the 6-digit code</h2>
            <p className="mt-1 text-sm text-[#14201B]/70">
                A verification code was sent to your mobile. Enter the 6 digits below.
            </p>

            {demoOtp && (
                <div className="mt-4 rounded-xl border border-[#CCE0FF] bg-[#F0F6FF] p-3.5 text-sm text-[#0F2644]">
                    <span className="font-bold uppercase tracking-wider text-xs bg-[#0052CC] text-white rounded px-2 py-0.5 mr-2">Demo Mode</span>
                    Your verification code is <strong className="font-mono text-base font-bold tracking-widest text-[#0052CC]">{demoOtp}</strong>
                </div>
            )}

            <div className="mt-6 grid gap-4">
                <div>
                    <Input
                        value={otp}
                        onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                            setOtp(val);
                            if (val.length === 6) {
                                router.post('/prereg/otp/verify', { otp: val });
                            }
                        }}
                        maxLength={6}
                        inputMode="numeric"
                        placeholder="••••••"
                        autoFocus
                        className="h-14 text-center font-mono text-3xl font-bold tracking-widest text-[#0F2644] border-slate-300"
                    />
                    {errors.otp && <p className="mt-1.5 text-center text-sm font-medium text-red-600">{errors.otp}</p>}
                </div>

                <Button
                    type="submit"
                    disabled={otp.length !== 6}
                    className="h-12 rounded-xl bg-[#0052CC] font-semibold text-white shadow-sm transition hover:bg-[#0047B3] active:scale-[0.99] disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed disabled:shadow-none"
                >
                    Verify & Continue (↵ Enter)
                </Button>

                <div className="text-center">
                    <button
                        type="button"
                        onClick={resend}
                        disabled={countdown > 0}
                        className="text-sm font-semibold text-[#0052CC] hover:text-[#0047B3] underline disabled:text-slate-400 disabled:no-underline transition-colors"
                    >
                        {countdown > 0 ? `Resend code in ${countdown}s` : 'Resend code'}
                    </button>
                </div>
            </div>
        </form>
    );
}

function Step4() {
    const [scrolled, setScrolled] = useState(false);
    const [agreed, setAgreed] = useState(false);

    function submit(e?: React.FormEvent) {
        if (e) e.preventDefault();
        if (!agreed) {
            setAgreed(true);
            return;
        }
        router.post('/prereg/consent', { accept: true });
    }

    useEffect(() => {
        function onKeyDown(e: KeyboardEvent) {
            if (e.key === 'Enter') {
                e.preventDefault();
                submit();
            }
        }
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [agreed]);

    return (
        <form onSubmit={submit} className="mx-auto max-w-2xl">
            <h2 className="text-2xl font-bold tracking-tight text-[#0E2A26]">Consent Statement</h2>
            <p className="mt-1 text-sm text-[#14201B]/70">
                Please review the terms of biometric collection and civic identity protection.
            </p>

            <div
                onScroll={(e) => {
                    const el = e.currentTarget;
                    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 16) {
                        setScrolled(true);
                    }
                }}
                className="mt-4 max-h-56 overflow-y-auto rounded-xl border border-[#14201B]/15 bg-[#14201B]/[0.02] p-4 text-sm leading-relaxed text-[#14201B]/80"
            >
                <p className="font-semibold text-[#0E2A26]">
                    IDENTRIQ Civic Identity & Biometric Verification Consent (v1)
                </p>
                <p className="mt-2">
                    IDENTRIQ collects your demographic details, supporting documents, and registration biometric data
                    (facial photo, fingerprints, and iris capture) solely to establish and maintain your sovereign national identity.
                </p>
                <p className="mt-2">
                    Your data is protected under the laws of Papua New Guinea, processed with end-to-end encryption, and
                    used strictly for verified public and private identity transactions to which you explicitly consent.
                    Your biometrics and demographic information will never be sold or transferred to unauthorized third parties.
                </p>
                <p className="mt-2">
                    You have the right to inspect your identity record, request official corrections, or review access audits at any time
                    through accredited registration centers or the digital civic portal.
                </p>
            </div>

            <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-lg border border-[#14201B]/10 p-3 text-sm font-medium hover:bg-[#14201B]/[0.02]">
                <input
                    type="checkbox"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    className="mt-0.5 size-4 rounded border-slate-300 text-[#0052CC] focus:ring-[#0052CC] accent-[#0052CC]"
                />
                <span className="text-[#14201B]/90">
                    I have read and agree to the IDENTRIQ terms of consent and biometric enrollment under Papua New Guinea law.
                </span>
            </label>

            <Button
                type="submit"
                disabled={!scrolled && !agreed}
                className="mt-6 h-12 w-full rounded-xl bg-[#0052CC] font-semibold text-white shadow-sm transition hover:bg-[#0047B3] active:scale-[0.99] disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed disabled:shadow-none"
            >
                Agree & Continue (↵ Enter)
            </Button>
        </form>
    );
}

function Step5({ draft }: { draft: Draft | null }) {
    const demo = draft?.demographic ?? {};
    const nameParts = (demo.full_name ?? '').split(' ');

    const [f, setF] = useState({
        given_name: demo.given_name ?? nameParts[0] ?? '',
        family_name: demo.family_name ?? (nameParts.length > 1 ? nameParts.slice(1).join(' ') : ''),
        middle_name: demo.middle_name ?? '',
        other_names: demo.other_names ?? '',
        dob: demo.dob ? String(demo.dob).slice(0, 10) : '',
        gender: demo.gender ?? 'female',
        nationality: demo.nationality ?? 'Papua New Guinean',
        marital_status: demo.marital_status ?? '',
        mobile: demo.mobile ?? (draft as any)?.mobile ?? '',
        email: demo.email ?? '',
        province: demo.province ?? '',
        district: demo.district ?? '',
        llg: demo.llg ?? '',
        ward: demo.ward ?? '',
        residential_address: demo.residential_address ?? demo.address_line ?? '',
        postal_code: demo.postal_code ?? '',
    });

    const { errors } = usePage().props as unknown as { errors: Record<string, string> };
    const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => setF({ ...f, [k]: e.target.value });

    // Available districts based on selected province
    const availableDistricts = f.province && PNG_PROVINCES[f.province] ? PNG_PROVINCES[f.province] : [];

    // 16 years ago limit
    const maxDobDate = new Date(Date.now() - 16 * 365.25 * 86400000).toISOString().split('T')[0];

    function handleProvinceChange(val: string) {
        setF({
            ...f,
            province: val,
            district: '', // Reset district when province changes
        });
    }

    function handleSubmit(e?: React.FormEvent) {
        if (e) e.preventDefault();
        router.post('/prereg/demographics', f);
    }

    function handleKeyDown(e: React.KeyboardEvent<HTMLFormElement>) {
        if (e.key === 'Enter') {
            const target = e.target as HTMLElement;
            if (e.ctrlKey || e.metaKey || target.getAttribute('type') === 'submit') {
                e.preventDefault();
                handleSubmit();
                return;
            }

            if (target.tagName === 'INPUT') {
                const isFormComplete = Boolean(
                    f.given_name.trim() &&
                    f.family_name.trim() &&
                    f.dob &&
                    f.gender &&
                    f.nationality &&
                    f.mobile.trim() &&
                    f.province &&
                    f.district &&
                    f.llg.trim() &&
                    f.ward.trim() &&
                    f.residential_address.trim()
                );

                if (isFormComplete) {
                    e.preventDefault();
                    handleSubmit();
                    return;
                }

                e.preventDefault();
                const form = e.currentTarget;
                const inputs = Array.from(
                    form.querySelectorAll<HTMLInputElement>(
                        'input:not([type="hidden"]):not([disabled])',
                    ),
                );
                const currentIndex = inputs.indexOf(target as HTMLInputElement);
                if (currentIndex >= 0 && currentIndex < inputs.length - 1) {
                    const nextEmpty =
                        inputs.slice(currentIndex + 1).find((i) => !i.value.trim()) ||
                        inputs[currentIndex + 1];
                    nextEmpty?.focus();
                } else {
                    handleSubmit();
                }
            }
        }
    }

    return (
        <form onSubmit={handleSubmit} onKeyDown={handleKeyDown}>
            <div>
                <h2 className="text-2xl font-bold tracking-tight text-[#0F2644] sm:text-3xl">Personal Information</h2>
                <p className="mt-1 text-sm text-[#475569]">
                    Please provide your personal details. Make sure all information is accurate and up to date.
                </p>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-x-8 gap-y-5 border-t border-slate-200/80 pt-6 lg:grid-cols-2">
                {/* LEFT COLUMN */}
                <div className="space-y-4">
                    {/* Given Name & Family Name */}
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div>
                            <Label className="text-xs font-bold text-[#0F2644]">
                                Given Name <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                value={f.given_name}
                                onChange={set('given_name')}
                                placeholder="Enter given name"
                                className="mt-1.5 h-11 rounded-lg border-slate-300"
                            />
                            {errors.given_name && <p className="mt-1 text-xs text-red-600">{errors.given_name}</p>}
                        </div>
                        <div>
                            <Label className="text-xs font-bold text-[#0F2644]">
                                Family Name <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                value={f.family_name}
                                onChange={set('family_name')}
                                placeholder="Enter family name"
                                className="mt-1.5 h-11 rounded-lg border-slate-300"
                            />
                            {errors.family_name && <p className="mt-1 text-xs text-red-600">{errors.family_name}</p>}
                        </div>
                    </div>

                    {/* Middle Name & Other Names */}
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div>
                            <Label className="text-xs font-medium text-[#475569]">Middle Name (Optional)</Label>
                            <Input
                                value={f.middle_name}
                                onChange={set('middle_name')}
                                placeholder="Enter middle name"
                                className="mt-1.5 h-11 rounded-lg border-slate-300"
                            />
                        </div>
                        <div>
                            <Label className="text-xs font-medium text-[#475569]">Other Names (Optional)</Label>
                            <Input
                                value={f.other_names}
                                onChange={set('other_names')}
                                placeholder="Enter other names"
                                className="mt-1.5 h-11 rounded-lg border-slate-300"
                            />
                        </div>
                    </div>

                    {/* Date of Birth */}
                    <div>
                        <Label className="text-xs font-bold text-[#0F2644]">
                            Date of Birth <span className="text-red-500">*</span>
                        </Label>
                        <div className="relative mt-1.5">
                            <Input
                                type="date"
                                max={maxDobDate}
                                value={f.dob}
                                onChange={set('dob')}
                                className="h-11 rounded-lg border-slate-300"
                            />
                        </div>
                        {errors.dob && <p className="mt-1 text-xs text-red-600">{errors.dob}</p>}
                    </div>

                    {/* Sex */}
                    <div>
                        <Label className="text-xs font-bold text-[#0F2644]">
                            Sex <span className="text-red-500">*</span>
                        </Label>
                        <Select value={f.gender} onValueChange={(v) => setF({ ...f, gender: v })}>
                            <SelectTrigger className="mt-1.5 h-11 w-full rounded-lg border border-slate-300 bg-white font-medium text-[#0F2644] shadow-xs hover:border-slate-400 focus:border-[#0052CC]">
                                <SelectValue placeholder="Select sex" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="female">Female</SelectItem>
                                <SelectItem value="male">Male</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                        </Select>
                        {errors.gender && <p className="mt-1 text-xs text-red-600">{errors.gender}</p>}
                    </div>

                    {/* Citizenship / Nationality */}
                    <div>
                        <Label className="text-xs font-bold text-[#0F2644]">
                            Citizenship / Nationality <span className="text-red-500">*</span>
                        </Label>
                        <Select value={f.nationality} onValueChange={(v) => setF({ ...f, nationality: v })}>
                            <SelectTrigger className="mt-1.5 h-11 w-full rounded-lg border border-slate-300 bg-white font-medium text-[#0F2644] shadow-xs hover:border-slate-400 focus:border-[#0052CC]">
                                <SelectValue placeholder="Select citizenship / nationality" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Papua New Guinean">Papua New Guinean</SelectItem>
                                <SelectItem value="Foreign Resident">Foreign Resident</SelectItem>
                                <SelectItem value="Dual Citizen">Dual Citizen</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Marital Status */}
                    <div>
                        <Label className="text-xs font-medium text-[#475569]">Marital Status</Label>
                        <Select value={f.marital_status} onValueChange={(v) => setF({ ...f, marital_status: v })}>
                            <SelectTrigger className="mt-1.5 h-11 w-full rounded-lg border border-slate-300 bg-white font-medium text-[#0F2644] shadow-xs hover:border-slate-400 focus:border-[#0052CC]">
                                <SelectValue placeholder="Select marital status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Single">Single</SelectItem>
                                <SelectItem value="Married">Married</SelectItem>
                                <SelectItem value="Divorced">Divorced</SelectItem>
                                <SelectItem value="Widowed">Widowed</SelectItem>
                                <SelectItem value="Separated">Separated</SelectItem>
                                <SelectItem value="De Facto">De Facto</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Mobile Number */}
                    <div>
                        <Label className="text-xs font-bold text-[#0F2644]">
                            Mobile Number <span className="text-red-500">*</span>
                        </Label>
                        <div className="mt-1.5 flex gap-2">
                            <div className="flex h-11 items-center justify-between gap-1.5 rounded-lg border border-slate-300 bg-slate-50 px-3 text-sm font-semibold text-[#0F2644]">
                                <span>+675</span>
                                <span className="text-xs text-slate-500">▼</span>
                            </div>
                            <Input
                                value={f.mobile.replace(/^\+675/, '')}
                                onChange={(e) => {
                                    const digits = e.target.value.replace(/\D/g, '').slice(0, 8);
                                    setF({ ...f, mobile: '+675' + digits });
                                }}
                                placeholder="Enter mobile number"
                                className="h-11 flex-1 rounded-lg border-slate-300 font-mono"
                            />
                        </div>
                        {errors.mobile && <p className="mt-1 text-xs text-red-600">{errors.mobile}</p>}
                    </div>

                    {/* Email Address */}
                    <div>
                        <div className="flex items-center justify-between">
                            <Label className="text-xs font-medium text-[#475569]">Email Address</Label>
                            <span className="text-xs text-slate-400">Optional</span>
                        </div>
                        <Input
                            type="email"
                            value={f.email}
                            onChange={set('email')}
                            placeholder="Enter email address"
                            className="mt-1.5 h-11 rounded-lg border-slate-300"
                        />
                        {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
                    </div>
                </div>

                {/* RIGHT COLUMN */}
                <div className="space-y-4">
                    {/* Province */}
                    <div>
                        <Label className="text-xs font-bold text-[#0F2644]">
                            Province <span className="text-red-500">*</span>
                        </Label>
                        <Select value={f.province} onValueChange={handleProvinceChange}>
                            <SelectTrigger className="mt-1.5 h-11 w-full rounded-lg border border-slate-300 bg-white font-medium text-[#0F2644] shadow-xs hover:border-slate-400 focus:border-[#0052CC]">
                                <SelectValue placeholder="Select province" />
                            </SelectTrigger>
                            <SelectContent className="max-h-60">
                                {Object.keys(PNG_PROVINCES).map((prov) => (
                                    <SelectItem key={prov} value={prov}>
                                        {prov}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.province && <p className="mt-1 text-xs text-red-600">{errors.province}</p>}
                    </div>

                    {/* District */}
                    <div>
                        <Label className="text-xs font-bold text-[#0F2644]">
                            District <span className="text-red-500">*</span>
                        </Label>
                        {availableDistricts.length > 0 ? (
                            <Select value={f.district} onValueChange={(v) => setF({ ...f, district: v })}>
                                <SelectTrigger className="mt-1.5 h-11 w-full rounded-lg border border-slate-300 bg-white font-medium text-[#0F2644] shadow-xs hover:border-slate-400 focus:border-[#0052CC]">
                                    <SelectValue placeholder="Select district" />
                                </SelectTrigger>
                                <SelectContent>
                                    {availableDistricts.map((dist) => (
                                        <SelectItem key={dist} value={dist}>
                                            {dist}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        ) : (
                            <Input
                                value={f.district}
                                onChange={set('district')}
                                placeholder="Enter district (or select province first)"
                                className="mt-1.5 h-11 rounded-lg border-slate-300"
                            />
                        )}
                        {errors.district && <p className="mt-1 text-xs text-red-600">{errors.district}</p>}
                    </div>

                    {/* Local-level Government (LLG) */}
                    <div>
                        <Label className="text-xs font-bold text-[#0F2644]">
                            Local-level Government (LLG) <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            value={f.llg}
                            onChange={set('llg')}
                            placeholder="Enter or select LLG (e.g. Urban LLG, Rural LLG)"
                            className="mt-1.5 h-11 rounded-lg border-slate-300"
                        />
                        {errors.llg && <p className="mt-1 text-xs text-red-600">{errors.llg}</p>}
                    </div>

                    {/* Ward */}
                    <div>
                        <Label className="text-xs font-bold text-[#0F2644]">
                            Ward <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            value={f.ward}
                            onChange={set('ward')}
                            placeholder="Enter or select ward (e.g. Ward 06, Korobosea Ward)"
                            className="mt-1.5 h-11 rounded-lg border-slate-300"
                        />
                        {errors.ward && <p className="mt-1 text-xs text-red-600">{errors.ward}</p>}
                    </div>

                    {/* Residential Address */}
                    <div>
                        <Label className="text-xs font-bold text-[#0F2644]">
                            Residential Address <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            value={f.residential_address}
                            onChange={set('residential_address')}
                            placeholder="House number, street, settlement, etc."
                            className="mt-1.5 h-11 rounded-lg border-slate-300"
                        />
                        {errors.residential_address && <p className="mt-1 text-xs text-red-600">{errors.residential_address}</p>}
                    </div>

                    {/* Postal Code */}
                    <div>
                        <div className="flex items-center justify-between">
                            <Label className="text-xs font-medium text-[#475569]">Postal Code</Label>
                            <span className="text-xs text-slate-400">Optional</span>
                        </div>
                        <Input
                            value={f.postal_code}
                            onChange={set('postal_code')}
                            placeholder="Enter postal code"
                            className="mt-1.5 h-11 rounded-lg border-slate-300"
                        />
                    </div>
                </div>
            </div>

            {/* ACTION BAR */}
            <div className="mt-8 flex justify-end border-t border-slate-200/80 pt-6">
                <Button
                    type="submit"
                    className="h-12 w-full rounded-xl bg-[#0052CC] px-8 text-base font-semibold text-white shadow transition hover:bg-[#0047B3] active:scale-[0.99] sm:w-auto"
                >
                    <span>Continue (↵ Enter)</span>
                    <span className="ml-2">→</span>
                </Button>
            </div>
        </form>
    );
}

function Step6({ draft }: { draft: Draft | null }) {
    const docs = draft?.documents ?? [];

    const existingPrimary = docs.find((d) => d.category === 'identity' || d.category === 'primary_id');
    const existingSecondary = docs.filter((d) => d.category === 'identity' || d.category === 'secondary_id')[1];
    const existingAddress = docs.find((d) => d.category === 'address' || d.category === 'proof_of_address');

    const [primaryType, setPrimaryType] = useState(existingPrimary?.doc_type ?? '');
    const [primaryRef, setPrimaryRef] = useState(existingPrimary?.ref_number ?? '');
    const [primaryFile, setPrimaryFile] = useState<File | null>(null);

    const [secondaryType, setSecondaryType] = useState(existingSecondary?.doc_type ?? '');
    const [secondaryRef, setSecondaryRef] = useState(existingSecondary?.ref_number ?? '');
    const [secondaryFile, setSecondaryFile] = useState<File | null>(null);

    const [addressType, setAddressType] = useState(existingAddress?.doc_type ?? '');
    const [addressRef, setAddressRef] = useState(existingAddress?.ref_number ?? '');
    const [addressFile, setAddressFile] = useState<File | null>(null);

    const [uploading, setUploading] = useState(false);
    const [clientError, setClientError] = useState('');

    const primaryInputRef = useRef<HTMLInputElement | null>(null);
    const secondaryInputRef = useRef<HTMLInputElement | null>(null);
    const addressInputRef = useRef<HTMLInputElement | null>(null);

    const { errors } = usePage().props as unknown as { errors: Record<string, string> };

    const hasPrimaryUploaded = Boolean(existingPrimary || primaryFile);

    function handleContinue(e?: React.FormEvent) {
        if (e) e.preventDefault();
        setClientError('');

        const hasAnyNewFiles = Boolean(primaryFile || secondaryFile || addressFile);

        if (!hasAnyNewFiles && !hasPrimaryUploaded) {
            setClientError('Please choose a file for your Primary ID.');
            return;
        }

        if (!primaryType && !existingPrimary) {
            setClientError('Please select a Primary ID Type.');
            return;
        }

        setUploading(true);
        const fd = new FormData();
        fd.append('batch_mode', '1');
        if (primaryFile) {
            fd.append('primary_file', primaryFile);
        }
        if (primaryType) fd.append('primary_doc_type', primaryType);
        if (primaryRef) fd.append('primary_ref_number', primaryRef);

        if (secondaryFile) {
            fd.append('secondary_file', secondaryFile);
        }
        if (secondaryType) fd.append('secondary_doc_type', secondaryType);
        if (secondaryRef) fd.append('secondary_ref_number', secondaryRef);

        if (addressFile) {
            fd.append('address_file', addressFile);
        }
        if (addressType) fd.append('address_doc_type', addressType);
        if (addressRef) fd.append('address_ref_number', addressRef);

        router.post('/prereg/documents', fd, {
            forceFormData: true,
            onFinish: () => setUploading(false),
        });
    }

    useEffect(() => {
        function onKeyDown(e: KeyboardEvent) {
            if (e.key === 'Enter') {
                if (hasPrimaryUploaded) {
                    e.preventDefault();
                    handleContinue();
                }
            }
        }
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [
        hasPrimaryUploaded,
        primaryFile,
        primaryType,
        primaryRef,
        secondaryFile,
        secondaryType,
        secondaryRef,
        addressFile,
        addressType,
        addressRef,
    ]);

    return (
        <form onSubmit={handleContinue}>
            {/* Header + Info Callout */}
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-[#0F2644] sm:text-3xl">Supporting Documents</h2>
                    <p className="mt-1 text-sm text-[#475569]">
                        Upload clear and valid documents. Make sure all details are readable.
                    </p>
                </div>

                <div className="flex max-w-sm items-start gap-2.5 rounded-xl border border-[#CCE0FF] bg-[#F0F6FF] px-4 py-3 text-xs text-[#0F2644] shadow-sm">
                    <svg className="size-5 shrink-0 text-[#0052CC]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <circle cx="12" cy="12" r="9" />
                        <line x1="12" y1="8" x2="12" y2="8.01" strokeLinecap="round" />
                        <line x1="12" y1="11" x2="12" y2="16" strokeLinecap="round" />
                    </svg>
                    <div className="leading-snug">
                        <p className="font-semibold text-[#0F2644]">Accepted formats: PDF, JPG, JPEG, PNG.</p>
                        <p className="mt-0.5 text-slate-500">Maximum file size: 5 MB per file.</p>
                    </div>
                </div>
            </div>

            {clientError && (
                <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3.5 text-sm font-medium text-red-600">
                    {clientError}
                </div>
            )}
            {Object.keys(errors).length > 0 && (
                <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3.5 text-sm font-medium text-red-600">
                    {Object.values(errors)[0]}
                </div>
            )}

            {/* Document Form Rows */}
            <div className="mt-8 space-y-6">
                {/* ROW 1: PRIMARY ID */}
                <div className="grid grid-cols-1 items-end gap-4 md:grid-cols-3">
                    <div>
                        <Label className="text-xs font-bold text-[#0F2644]">
                            Primary ID Type <span className="text-red-500">*</span>
                        </Label>
                        <Select value={primaryType} onValueChange={setPrimaryType}>
                            <SelectTrigger className="mt-1.5 h-11 w-full rounded-lg border border-slate-300 bg-white font-medium text-[#0F2644] shadow-xs hover:border-slate-400 focus:border-[#0052CC]">
                                <SelectValue placeholder="Select ID type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="birth_certificate">Birth Certificate</SelectItem>
                                <SelectItem value="passport">Passport</SelectItem>
                                <SelectItem value="drivers_licence">Driver's Licence</SelectItem>
                                <SelectItem value="national_id">National Identity Card</SelectItem>
                                <SelectItem value="statutory_declaration">Statutory Declaration</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <Label className="text-xs font-bold text-[#0F2644]">
                            Document Reference Number <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            value={primaryRef}
                            onChange={(e) => setPrimaryRef(e.target.value)}
                            placeholder="Enter document number"
                            className="mt-1.5 h-11 rounded-lg border-slate-300 placeholder:text-slate-400"
                        />
                    </div>

                    <div>
                        <Label className="text-xs font-bold text-[#0F2644]">
                            Upload File <span className="text-red-500">*</span>
                        </Label>
                        <input
                            ref={primaryInputRef}
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            className="hidden"
                            onChange={(e) => setPrimaryFile(e.target.files?.[0] ?? null)}
                        />
                        <button
                            type="button"
                            onClick={() => primaryInputRef.current?.click()}
                            className="mt-1.5 flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-[#C6DCFC] bg-[#F8FAFF] px-3 text-sm font-semibold text-[#0052CC] transition hover:bg-[#EEF4FE] shadow-xs"
                        >
                            <svg className="size-5 shrink-0 text-[#0052CC]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                                <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" />
                                <path d="M12 12v9" />
                                <path d="m16 16-4-4-4 4" />
                            </svg>
                            <span className="truncate">
                                {primaryFile ? primaryFile.name : (existingPrimary ? '✓ File Uploaded' : 'Choose file')}
                            </span>
                        </button>
                    </div>
                </div>

                {/* ROW 2: SECONDARY ID (OPTIONAL) */}
                <div className="grid grid-cols-1 items-end gap-4 md:grid-cols-3">
                    <div>
                        <Label className="text-xs font-medium text-[#475569]">
                            Secondary ID Type <span className="text-xs text-slate-400 font-normal">(Optional)</span>
                        </Label>
                        <Select value={secondaryType} onValueChange={setSecondaryType}>
                            <SelectTrigger className="mt-1.5 h-11 w-full rounded-lg border border-slate-300 bg-white font-medium text-[#0F2644] shadow-xs hover:border-slate-400 focus:border-[#0052CC]">
                                <SelectValue placeholder="Select ID type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="employment_id">Employment ID / Work Permit</SelectItem>
                                <SelectItem value="statutory_declaration">Statutory Declaration</SelectItem>
                                <SelectItem value="student_id">Student ID / School Certificate</SelectItem>
                                <SelectItem value="church_leader_letter">Church / Community Leader ID</SelectItem>
                                <SelectItem value="drivers_licence">Driver's Licence</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <Label className="text-xs font-medium text-[#475569]">
                            Document Reference Number <span className="text-xs text-slate-400 font-normal">(Optional)</span>
                        </Label>
                        <Input
                            value={secondaryRef}
                            onChange={(e) => setSecondaryRef(e.target.value)}
                            placeholder="Enter document number"
                            className="mt-1.5 h-11 rounded-lg border-slate-300 placeholder:text-slate-400"
                        />
                    </div>

                    <div>
                        <Label className="text-xs font-medium text-[#475569]">
                            Upload File <span className="text-xs text-slate-400 font-normal">(Optional)</span>
                        </Label>
                        <input
                            ref={secondaryInputRef}
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            className="hidden"
                            onChange={(e) => setSecondaryFile(e.target.files?.[0] ?? null)}
                        />
                        <button
                            type="button"
                            onClick={() => secondaryInputRef.current?.click()}
                            className="mt-1.5 flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-[#C6DCFC] bg-[#F8FAFF] px-3 text-sm font-semibold text-[#0052CC] transition hover:bg-[#EEF4FE] shadow-xs"
                        >
                            <svg className="size-5 shrink-0 text-[#0052CC]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                                <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" />
                                <path d="M12 12v9" />
                                <path d="m16 16-4-4-4 4" />
                            </svg>
                            <span className="truncate">
                                {secondaryFile ? secondaryFile.name : (existingSecondary ? '✓ File Uploaded' : 'Choose file')}
                            </span>
                        </button>
                    </div>
                </div>

                {/* ROW 3: PROOF OF ADDRESS (OPTIONAL) */}
                <div className="grid grid-cols-1 items-end gap-4 md:grid-cols-3">
                    <div>
                        <Label className="text-xs font-medium text-[#475569]">
                            Proof of Address <span className="text-xs text-slate-400 font-normal">(Optional)</span>
                        </Label>
                        <Select value={addressType} onValueChange={setAddressType}>
                            <SelectTrigger className="mt-1.5 h-11 w-full rounded-lg border border-slate-300 bg-white font-medium text-[#0F2644] shadow-xs hover:border-slate-400 focus:border-[#0052CC]">
                                <SelectValue placeholder="Select document type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="utility_bill">Utility Bill (Water / Power / Telecom)</SelectItem>
                                <SelectItem value="tenancy_agreement">Tenancy Agreement / Lease</SelectItem>
                                <SelectItem value="ward_councillor_letter">Ward Councillor Letter</SelectItem>
                                <SelectItem value="employer_letter">Employer Confirmation Letter</SelectItem>
                                <SelectItem value="bank_statement">Bank Statement</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <Label className="text-xs font-medium text-[#475569]">
                            Document Reference Number <span className="text-xs text-slate-400 font-normal">(Optional)</span>
                        </Label>
                        <Input
                            value={addressRef}
                            onChange={(e) => setAddressRef(e.target.value)}
                            placeholder="Enter document number"
                            className="mt-1.5 h-11 rounded-lg border-slate-300 placeholder:text-slate-400"
                        />
                    </div>

                    <div>
                        <Label className="text-xs font-medium text-[#475569]">
                            Upload File <span className="text-xs text-slate-400 font-normal">(Optional)</span>
                        </Label>
                        <input
                            ref={addressInputRef}
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            className="hidden"
                            onChange={(e) => setAddressFile(e.target.files?.[0] ?? null)}
                        />
                        <button
                            type="button"
                            onClick={() => addressInputRef.current?.click()}
                            className="mt-1.5 flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-[#C6DCFC] bg-[#F8FAFF] px-3 text-sm font-semibold text-[#0052CC] transition hover:bg-[#EEF4FE] shadow-xs"
                        >
                            <svg className="size-5 shrink-0 text-[#0052CC]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                                <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" />
                                <path d="M12 12v9" />
                                <path d="m16 16-4-4-4 4" />
                            </svg>
                            <span className="truncate">
                                {addressFile ? addressFile.name : (existingAddress ? '✓ File Uploaded' : 'Choose file')}
                            </span>
                        </button>
                    </div>
                </div>
            </div>

            {/* ACTION BAR */}
            <div className="mt-10 flex items-center justify-between border-t border-slate-200/80 pt-6">
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.visit('/prereg/5')}
                    className="h-11 rounded-xl border border-slate-300 bg-white px-7 text-sm font-semibold text-[#0F2644] hover:bg-slate-50 hover:border-slate-400 shadow-xs transition-colors"
                >
                    ← Back
                </Button>

                <Button
                    type="submit"
                    disabled={uploading}
                    className="h-11 rounded-xl bg-[#0052CC] px-9 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0047B3] active:scale-[0.99] disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none disabled:cursor-not-allowed"
                >
                    {uploading ? 'Uploading...' : 'Continue (↵ Enter) →'}
                </Button>
            </div>
        </form>
    );
}

function Step7({ draft }: { draft: Draft | null }) {
    const d = (draft?.demographic ?? {}) as Record<string, string>;
    const docs = draft?.documents ?? [];

    const fullName = d.full_name || [d.given_name, d.middle_name, d.family_name].filter(Boolean).join(' ');

    function handleConfirm(e?: React.FormEvent) {
        if (e) e.preventDefault();
        router.post('/prereg/confirm');
    }

    useEffect(() => {
        function onKeyDown(e: KeyboardEvent) {
            if (e.key === 'Enter') {
                e.preventDefault();
                handleConfirm();
            }
        }
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, []);

    return (
        <form onSubmit={handleConfirm}>
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-[#0E2A26]">Review Application</h2>
                    <p className="mt-1 text-sm text-[#14201B]/70">Confirm your personal details and uploaded documents.</p>
                </div>
                <Button
                    type="button"
                    onClick={() => router.visit('/prereg/5')}
                    variant="outline"
                    className="h-8 rounded-lg border border-slate-300 bg-white px-3 text-xs font-semibold text-[#0052CC] hover:bg-blue-50/50 hover:border-[#0052CC] shadow-xs transition-colors"
                >
                    Edit Details
                </Button>
            </div>

            {/* Personal Details Card */}
            <div className="mt-6 rounded-xl border border-[#14201B]/10 bg-white p-5">
                <p className="text-xs font-bold uppercase tracking-wider text-[#0E2A26]">Personal Information Summary</p>
                <div className="mt-3 grid gap-3 text-sm sm:grid-cols-2 md:grid-cols-3">
                    <div className="rounded-lg bg-[#14201B]/[0.03] p-2.5">
                        <dt className="text-xs text-[#14201B]/60">Full Name</dt>
                        <dd className="mt-0.5 font-bold text-[#0E2A26]">{fullName || '—'}</dd>
                    </div>
                    <div className="rounded-lg bg-[#14201B]/[0.03] p-2.5">
                        <dt className="text-xs text-[#14201B]/60">Date of Birth</dt>
                        <dd className="mt-0.5 font-semibold text-[#0E2A26]">{d.dob || '—'}</dd>
                    </div>
                    <div className="rounded-lg bg-[#14201B]/[0.03] p-2.5">
                        <dt className="text-xs text-[#14201B]/60">Sex</dt>
                        <dd className="mt-0.5 font-semibold capitalize text-[#0E2A26]">{d.gender || '—'}</dd>
                    </div>
                    <div className="rounded-lg bg-[#14201B]/[0.03] p-2.5">
                        <dt className="text-xs text-[#14201B]/60">Nationality</dt>
                        <dd className="mt-0.5 font-semibold text-[#0E2A26]">{d.nationality || '—'}</dd>
                    </div>
                    <div className="rounded-lg bg-[#14201B]/[0.03] p-2.5">
                        <dt className="text-xs text-[#14201B]/60">Marital Status</dt>
                        <dd className="mt-0.5 font-semibold text-[#0E2A26]">{d.marital_status || '—'}</dd>
                    </div>
                    <div className="rounded-lg bg-[#14201B]/[0.03] p-2.5">
                        <dt className="text-xs text-[#14201B]/60">Contact Number</dt>
                        <dd className="mt-0.5 font-semibold text-[#0E2A26]">{d.mobile || (draft as any)?.mobile || '—'}</dd>
                    </div>
                    {d.email && (
                        <div className="rounded-lg bg-[#14201B]/[0.03] p-2.5">
                            <dt className="text-xs text-[#14201B]/60">Email</dt>
                            <dd className="mt-0.5 font-semibold text-[#0E2A26]">{d.email}</dd>
                        </div>
                    )}
                    <div className="rounded-lg bg-[#14201B]/[0.03] p-2.5 sm:col-span-2 md:col-span-3">
                        <dt className="text-xs text-[#14201B]/60">Residential Address</dt>
                        <dd className="mt-0.5 font-semibold text-[#0E2A26]">
                            {[d.residential_address || d.address_line, d.ward, d.llg, d.district, d.province, d.postal_code].filter(Boolean).join(', ') || '—'}
                        </dd>
                    </div>
                </div>
            </div>

            {/* Documents Card */}
            <div className="mt-4 rounded-xl border border-[#14201B]/10 bg-white p-5">
                <div className="flex items-center justify-between">
                    <p className="text-xs font-bold uppercase tracking-wider text-[#0E2A26]">Supporting Documents ({docs.length})</p>
                    <button
                        type="button"
                        onClick={() => router.visit('/prereg/6')}
                        className="text-xs font-semibold text-[#0052CC] hover:underline transition-colors"
                    >
                        Edit Documents
                    </button>
                </div>
                <div className="mt-3 space-y-2">
                    {docs.map((doc) => (
                        <div key={doc.id} className="flex items-center justify-between rounded-lg bg-[#14201B]/[0.02] p-2.5 text-sm">
                            <span className="capitalize font-medium text-[#14201B]">{doc.category}: {doc.doc_type.replace(/_/g, ' ')}</span>
                            <span className="rounded bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-xs font-bold text-emerald-800">Verified Document</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Button
                    type="button"
                    onClick={() => router.visit('/prereg/5')}
                    variant="outline"
                    className="h-12 flex-1 rounded-xl border border-slate-300 bg-white font-semibold text-[#0F2644] hover:bg-slate-50 hover:border-slate-400 shadow-xs transition-colors"
                >
                    ← Back to Details
                </Button>
                <Button
                    type="submit"
                    className="h-12 flex-1 rounded-xl bg-[#0052CC] font-semibold text-white shadow-sm transition hover:bg-[#0047B3] active:scale-[0.99]"
                >
                    Confirm & Select Center (Step 8) (↵ Enter) →
                </Button>
            </div>
        </form>
    );
}

function Step8({
    centers,
    preselect,
}: {
    centers: { id: number; name: string; location: string; province?: string; daily_capacity?: number; latitude?: number | null; longitude?: number | null }[];
    preselect: number | null;
}) {
    // 5 canonical centers from the reference design mockup
    const defaultCenters = [
        {
            id: 1,
            name: 'Waigani National Capital District Registration Center',
            location: 'Level 1, PNG Statistics Haus, Waigani, NCD',
            province: 'National Capital District',
            schedule: 'Mon - Fri: 8:00 AM - 5:00 PM',
            lunch: 'No lunch break',
            mapPin: { name: 'Waigani Registration Center', label: 'Port Moresby', x: 48, y: 74 },
        },
        {
            id: 2,
            name: 'Boroko Registration Center',
            location: 'Section 487, Boroko, NCD',
            province: 'National Capital District',
            schedule: 'Mon - Fri: 8:00 AM - 4:30 PM',
            lunch: 'Lunch: 12:00 PM - 1:00 PM',
            mapPin: { name: 'Boroko Registration Center', label: 'Port Moresby', x: 48, y: 74 },
        },
        {
            id: 3,
            name: 'Lae Registration Center',
            location: 'PNG Ports Building, Malahang Road, Lae, Morobe Province',
            province: 'Morobe',
            schedule: 'Mon - Fri: 8:00 AM - 4:30 PM',
            lunch: 'Lunch: 12:00 PM - 1:00 PM',
            mapPin: { name: 'Lae Registration Center', label: 'Lae', x: 55, y: 52 },
        },
        {
            id: 4,
            name: 'Mt. Hagen Registration Center',
            location: 'Western Highlands Provincial Government Complex, Mt. Hagen',
            province: 'Western Highlands',
            schedule: 'Mon - Fri: 8:00 AM - 4:30 PM',
            lunch: 'Lunch: 12:00 PM - 1:00 PM',
            mapPin: { name: 'Mt. Hagen Registration Center', label: 'Mt. Hagen', x: 31, y: 41 },
        },
        {
            id: 5,
            name: 'Kimbe Registration Center',
            location: 'West New Britain Provincial Administration, Kimbe, WNB',
            province: 'West New Britain',
            schedule: 'Mon - Fri: 8:00 AM - 4:30 PM',
            lunch: 'Lunch: 12:00 PM - 1:00 PM',
            mapPin: { name: 'Kimbe Registration Center', label: 'Kimbe', x: 65, y: 41 },
        },
    ];

    // Harmonize with backend database records
    const items = defaultCenters.map((def) => {
        const found = centers.find(
            (c) =>
                c.name.toLowerCase().includes(def.name.toLowerCase().slice(0, 10)) ||
                c.id === def.id
        );
        return {
            ...def,
            id: found ? found.id : def.id,
        };
    });

    const [selectedId, setSelectedId] = useState<number>(preselect ?? items[0].id);
    const [search, setSearch] = useState('');

    const filtered = items.filter(
        (c) =>
            c.name.toLowerCase().includes(search.toLowerCase()) ||
            c.location.toLowerCase().includes(search.toLowerCase()) ||
            c.province.toLowerCase().includes(search.toLowerCase())
    );

    const selectedCenter = items.find((c) => c.id === selectedId) ?? items[0];

    const mapPoints = centers
        .filter((c) => c.latitude != null && c.longitude != null)
        .map((c) => ({ id: c.id, name: c.name, lat: c.latitude as number, lng: c.longitude as number }));


    function handleContinue(e?: React.FormEvent) {
        if (e) e.preventDefault();
        const targetId = (filtered.length === 1 ? filtered[0].id : selectedId) || items[0]?.id;
        if (targetId) {
            router.visit(`/prereg/9?center=${targetId}`);
        }
    }

    useEffect(() => {
        function handleKeyDown(e: KeyboardEvent) {
            if (e.key === 'Enter') {
                const tag = (document.activeElement?.tagName || '').toLowerCase();
                if (tag !== 'textarea') {
                    e.preventDefault();
                    handleContinue();
                }
            }
        }
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedId, filtered, items]);

    return (
        <form onSubmit={handleContinue}>
            {/* Header */}
            <div>
                <h2 className="text-2xl font-bold tracking-tight text-[#0F2644] sm:text-3xl">Select a Registration Center</h2>
                <p className="mt-1 text-sm text-[#475569]">
                    Choose a convenient location for your IDENTRIQ registration.
                </p>
            </div>

            {/* Full-width Search Bar */}
            <div className="relative mt-5">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                    <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
                <Input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by province, district, city/town, or address"
                    className="h-11 rounded-lg border-slate-300 pl-10 text-sm text-slate-800 placeholder:text-slate-400 focus-visible:ring-1 focus-visible:ring-[#0052CC]"
                />
                {search && (
                    <button
                        type="button"
                        onClick={() => setSearch('')}
                        className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-xs text-slate-400 hover:text-slate-600"
                    >
                        ✕
                    </button>
                )}
            </div>

            {/* Dual Column Layout: Centers List (Left) + Interactive Map (Right) */}
            <div className="mt-6 grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
                {/* LEFT COLUMN: CENTERS LIST */}
                <div className="space-y-3 lg:col-span-6">
                    {filtered.length === 0 ? (
                        <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
                            No centers found matching "{search}". Try searching for another province or city.
                        </div>
                    ) : (
                        filtered.map((c) => {
                            const isSelected = selectedId === c.id;
                            return (
                                <div
                                    key={c.id}
                                    onClick={() => setSelectedId(c.id)}
                                    className={`relative cursor-pointer rounded-xl p-4 transition-all ${
                                        isSelected
                                            ? 'border-2 border-[#0052CC] bg-[#F4F8FE] shadow-sm'
                                            : 'border border-slate-200 bg-white hover:border-slate-300'
                                    }`}
                                >
                                    <div className="flex items-start gap-3">
                                        {/* Radio Circle */}
                                        <div className="mt-0.5 shrink-0">
                                            {isSelected ? (
                                                <div className="flex size-5 items-center justify-center rounded-full border-2 border-[#0052CC] bg-white">
                                                    <div className="size-2.5 rounded-full bg-[#0052CC]" />
                                                </div>
                                            ) : (
                                                <div className="size-5 rounded-full border-2 border-slate-300 bg-white" />
                                            )}
                                        </div>

                                        {/* Center Information */}
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="flex items-start gap-1.5">
                                                    <svg className="size-4 shrink-0 text-[#0052CC] mt-0.5" viewBox="0 0 24 24" fill="currentColor">
                                                        <path fillRule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                                                    </svg>
                                                    <h3 className="text-sm font-bold leading-snug text-[#0F2644] sm:text-base">
                                                        {c.name}
                                                    </h3>
                                                </div>

                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setSelectedId(c.id);
                                                    }}
                                                    className="flex shrink-0 items-center gap-1 text-xs font-semibold text-[#0052CC] hover:underline"
                                                >
                                                    <svg className="size-3.5" viewBox="0 0 24 24" fill="currentColor">
                                                        <path fillRule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                                                    </svg>
                                                    <span>View on map</span>
                                                </button>
                                            </div>

                                            <p className="mt-1 pl-5 text-xs text-slate-500">
                                                {c.location}
                                            </p>

                                            <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1 pl-5 text-xs text-slate-600">
                                                <div className="flex items-center gap-1.5">
                                                    <svg className="size-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    <span>{c.schedule}</span>
                                                </div>

                                                <div className="flex items-center gap-1.5">
                                                    <svg className="size-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                    </svg>
                                                    <span>{c.lunch}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* RIGHT COLUMN: LIVE LEAFLET MAP */}
                <div className="relative w-full overflow-hidden rounded-2xl border border-slate-200 shadow-sm lg:col-span-6">
                    <CenterMap points={mapPoints} selectedId={selectedId} onSelect={setSelectedId} />
                    <p className="absolute bottom-2 right-2 z-[500] rounded bg-white/85 px-1.5 py-0.5 text-[10px] text-slate-600">
                        Tap a pin to select · drag to pan · scroll to zoom
                    </p>
                </div>
            </div>

            {/* ACTION BAR */}
            <div className="mt-8 flex items-center justify-between border-t border-slate-200/80 pt-6">
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.visit('/prereg/7')}
                    className="h-11 rounded-xl border border-slate-300 bg-white px-7 text-sm font-semibold text-[#0F2644] hover:bg-slate-50 hover:border-slate-400 shadow-xs transition-colors"
                >
                    ← Back
                </Button>

                <Button
                    type="submit"
                    disabled={!selectedId && filtered.length === 0}
                    className="h-11 rounded-xl bg-[#0052CC] px-9 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0047B3] active:scale-[0.99] disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none disabled:cursor-not-allowed"
                >
                    Continue (↵ Enter) →
                </Button>
            </div>
        </form>
    );
}

const DEFAULT_TIME_SLOTS: TimeSlotItem[] = [
    { label: '8:00 – 8:20 AM', time24: '08:00', total: 6, booked: 0, available: 6, isFull: false },
    { label: '8:20 – 8:40 AM', time24: '08:20', total: 6, booked: 0, available: 6, isFull: false },
    { label: '8:40 – 9:00 AM', time24: '08:40', total: 6, booked: 0, available: 6, isFull: false },
    { label: '9:00 – 9:20 AM', time24: '09:00', total: 6, booked: 0, available: 6, isFull: false },
    { label: '9:20 – 9:40 AM', time24: '09:20', total: 6, booked: 0, available: 6, isFull: false },
    { label: '9:40 – 10:00 AM', time24: '09:40', total: 6, booked: 0, available: 6, isFull: false },
    { label: '10:00 – 10:20 AM', time24: '10:00', total: 6, booked: 0, available: 6, isFull: false },
    { label: '10:20 – 10:40 AM', time24: '10:20', total: 6, booked: 0, available: 6, isFull: false },
    { label: '10:40 – 11:00 AM', time24: '10:40', total: 6, booked: 0, available: 6, isFull: false },
    { label: '11:00 – 11:20 AM', time24: '11:00', total: 6, booked: 0, available: 6, isFull: false },
    { label: '11:20 – 11:40 AM', time24: '11:20', total: 6, booked: 0, available: 6, isFull: false },
    { label: '11:40 – 12:00 PM', time24: '11:40', total: 6, booked: 0, available: 6, isFull: false },
    { label: '1:00 – 1:20 PM', time24: '13:00', total: 6, booked: 0, available: 6, isFull: false },
    { label: '1:20 – 1:40 PM', time24: '13:20', total: 6, booked: 0, available: 6, isFull: false },
    { label: '1:40 – 2:00 PM', time24: '13:40', total: 6, booked: 0, available: 6, isFull: false },
    { label: '2:00 – 2:20 PM', time24: '14:00', total: 6, booked: 0, available: 6, isFull: false },
    { label: '2:20 – 2:40 PM', time24: '14:20', total: 6, booked: 0, available: 6, isFull: false },
    { label: '2:40 – 3:00 PM', time24: '14:40', total: 6, booked: 0, available: 6, isFull: false },
    { label: '3:00 – 3:20 PM', time24: '15:00', total: 6, booked: 0, available: 6, isFull: false },
    { label: '3:20 – 3:40 PM', time24: '15:20', total: 6, booked: 0, available: 6, isFull: false },
    { label: '3:40 – 4:00 PM', time24: '15:40', total: 6, booked: 0, available: 6, isFull: false },
    { label: '4:00 – 4:20 PM', time24: '16:00', total: 6, booked: 0, available: 6, isFull: false },
    { label: '4:20 – 4:40 PM', time24: '16:20', total: 6, booked: 0, available: 6, isFull: false },
    { label: '4:40 – 5:00 PM', time24: '16:40', total: 6, booked: 0, available: 6, isFull: false },
];

function Step9({
    centers,
    preselect,
    initialSlotData,
}: {
    centers: { id: number; name: string; location: string }[];
    preselect: number | null;
    initialSlotData?: SlotData | null;
}) {
    const [centerId] = useState<number | null>(preselect ?? centers[0]?.id ?? null);
    const [weekOffset, setWeekOffset] = useState(0);
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    const [date, setDate] = useState(initialSlotData?.selected_date ?? tomorrow);
    const [slotData, setSlotData] = useState<SlotData | null>(initialSlotData ?? null);
    const [isLoadingSlots, setIsLoadingSlots] = useState(false);
    const isFirstMount = useRef(true);

    const initialSlots = initialSlotData?.slots ?? DEFAULT_TIME_SLOTS;
    const [selectedSlot, setSelectedSlot] = useState<TimeSlotItem | null>(() => {
        return initialSlots.find((s) => !s.isFull) ?? initialSlots[13] ?? initialSlots[0];
    });

    const { errors } = usePage().props as unknown as { errors: Record<string, string> };

    const selectedCenter = centers.find((c) => c.id === centerId) ?? centers[0] ?? {
        id: 1,
        name: 'Waigani Registration Center',
        location: 'PNG Statistics Haus, Waigani, National Capital District (NCD)',
    };

    const carouselStartDate = useMemo(() => {
        const d = new Date(Date.now() + 86400000);
        d.setDate(d.getDate() + weekOffset * 7);
        return d.toISOString().split('T')[0];
    }, [weekOffset]);

    useEffect(() => {
        if (!centerId) return;
        if (
            isFirstMount.current &&
            initialSlotData &&
            initialSlotData.selected_date === date &&
            initialSlotData.center_id === centerId &&
            weekOffset === 0
        ) {
            isFirstMount.current = false;
            return;
        }
        isFirstMount.current = false;

        let cancelled = false;
        setIsLoadingSlots(true);

        const params = new URLSearchParams({
            center_id: String(centerId),
            date: date,
            start_date: carouselStartDate,
            days: '7',
        });

        fetch(`/api/prereg/slots?${params.toString()}`)
            .then((res) => {
                if (!res.ok) throw new Error('Failed to fetch slot availability');
                return res.json();
            })
            .then((data: SlotData) => {
                if (cancelled) return;
                setSlotData(data);
                setIsLoadingSlots(false);

                setSelectedSlot((prev) => {
                    if (!prev) {
                        return data.slots.find((s) => !s.isFull) ?? data.slots[0] ?? null;
                    }
                    const matching = data.slots.find((s) => s.time24 === prev.time24);
                    if (matching && !matching.isFull) {
                        return matching;
                    }
                    return data.slots.find((s) => !s.isFull) ?? data.slots[0] ?? null;
                });
            })
            .catch((err) => {
                console.error(err);
                if (!cancelled) setIsLoadingSlots(false);
            });

        return () => {
            cancelled = true;
        };
    }, [centerId, date, carouselStartDate]);

    // 7 days for the carousel from real database records (or fallback computed dates)
    const dayCards: CalendarDay[] = useMemo(() => {
        if (slotData?.calendar && slotData.calendar.length > 0) {
            return slotData.calendar;
        }
        return Array.from({ length: 7 }).map((_, i) => {
            const d = new Date(Date.now() + 86400000);
            d.setDate(d.getDate() + weekOffset * 7 + i);
            const dateStr = d.toISOString().split('T')[0];
            const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
            const formattedDate = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
            return {
                dateStr,
                dayName,
                formattedDate,
                slotsCount: 0,
                isFull: false,
            };
        });
    }, [slotData?.calendar, weekOffset]);

    const displaySlots = slotData?.slots ?? DEFAULT_TIME_SLOTS;

    const selectedDateObj = new Date(date);
    const selectedDayFormatted = !isNaN(selectedDateObj.getTime())
        ? selectedDateObj.toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
              year: 'numeric',
          })
        : 'Tomorrow';

    function book(e?: React.FormEvent) {
        if (e) e.preventDefault();
        if (!centerId || !date || !selectedSlot || selectedSlot.isFull) return;
        router.post('/prereg/book', {
            center_id: centerId,
            slot_at: `${date} ${selectedSlot.time24}:00`,
        });
    }

    useEffect(() => {
        function handleKeyDown(e: KeyboardEvent) {
            if (e.key === 'Enter') {
                const tag = (document.activeElement?.tagName || '').toLowerCase();
                if (tag !== 'textarea') {
                    e.preventDefault();
                    book();
                }
            }
        }
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [centerId, date, selectedSlot]);

    return (
        <form onSubmit={book} className="w-full">
            {/* Header */}
            <div className="mb-6 flex items-start gap-3.5">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#0052CC] text-white shadow-xs">
                    <svg className="size-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                    </svg>
                </div>
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-[#0F2644]">Select Appointment Date & Time</h2>
                    <p className="mt-0.5 text-sm font-medium text-slate-500">
                        Choose a date and time slot that works for you. Available slots are live and synchronized with center capacity.
                    </p>
                </div>
            </div>

            {/* Date Carousel / Tabs */}
            <div className="mb-6 flex items-center gap-2">
                <button
                    type="button"
                    onClick={() => setWeekOffset(Math.max(0, weekOffset - 1))}
                    disabled={weekOffset === 0}
                    className="flex size-10 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-xs transition hover:border-[#0052CC] hover:text-[#0052CC] disabled:cursor-not-allowed disabled:opacity-40"
                    aria-label="Previous week"
                >
                    <svg className="size-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                    </svg>
                </button>

                <div className="grid flex-1 grid-cols-2 gap-2 sm:grid-cols-4 md:grid-cols-7">
                    {dayCards.map((card) => {
                        const isSelected = date === card.dateStr;
                        const isDayFull = card.isFull;
                        return (
                            <button
                                key={card.dateStr}
                                type="button"
                                onClick={() => setDate(card.dateStr)}
                                disabled={isDayFull}
                                className={`relative flex flex-col items-center justify-center rounded-xl p-3 text-center transition-all ${
                                    isDayFull
                                        ? 'cursor-not-allowed border border-dashed border-slate-200 bg-slate-50 text-slate-400 opacity-60'
                                        : isSelected
                                        ? 'border border-[#0052CC] bg-[#0052CC] text-white shadow-sm ring-2 ring-[#0052CC]/20'
                                        : 'border border-slate-200 bg-white text-slate-800 hover:border-slate-300 hover:bg-slate-50'
                                }`}
                            >
                                <span className="text-xs font-bold uppercase tracking-wider">{card.dayName}</span>
                                <span className={`text-xs font-semibold mt-0.5 ${isSelected ? 'text-white' : isDayFull ? 'text-slate-400' : 'text-[#0F2644]'}`}>
                                    {card.formattedDate}
                                </span>
                                <span className={`text-[11px] font-medium mt-1 ${isSelected ? 'text-blue-100' : isDayFull ? 'text-rose-600 font-semibold' : 'text-slate-500'}`}>
                                    {isDayFull ? 'Fully booked' : `${card.slotsCount} slots available`}
                                </span>
                                {isSelected && !isDayFull && (
                                    <span className="absolute -bottom-1 left-1/2 h-1 w-8 -translate-x-1/2 rounded-full bg-[#0052CC]" />
                                )}
                            </button>
                        );
                    })}
                </div>

                <button
                    type="button"
                    onClick={() => setWeekOffset(weekOffset + 1)}
                    className="flex size-10 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-xs transition hover:border-[#0052CC] hover:text-[#0052CC]"
                    aria-label="Next week"
                >
                    <svg className="size-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                    </svg>
                </button>
            </div>

            {/* Main Content Grid: 8 cols Left, 4 cols Right */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                {/* Left Card: Center & Slots */}
                <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs lg:col-span-8">
                    <div className="mb-5 flex items-start gap-2.5 border-b border-slate-100 pb-4">
                        <svg className="mt-0.5 size-5 shrink-0 text-[#0052CC]" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 00.281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 103 9c0 3.492 1.698 5.988 3.355 7.588a13.433 13.433 0 002.274 1.765 11.258 11.258 0 001.038.573l.018.008.006.003zM10 11.25a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z" clipRule="evenodd" />
                        </svg>
                        <div className="flex-1">
                            <h3 className="text-base font-bold leading-snug text-[#0F2644]">{selectedCenter.name}</h3>
                            <p className="mt-0.5 text-xs text-slate-500">{selectedCenter.location}</p>
                        </div>
                        <Link href="/prereg/8" className="text-xs font-semibold text-[#0052CC] hover:underline">
                            Change Center
                        </Link>
                    </div>

                    <div className="mb-3 flex items-center justify-between">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                            Available Time Slots
                        </h4>
                        {isLoadingSlots ? (
                            <span className="flex items-center gap-1.5 text-xs font-medium text-[#0052CC]">
                                <svg className="size-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                Updating availability...
                            </span>
                        ) : (
                            <span className="text-xs text-slate-400">
                                Live Center Capacity
                            </span>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                        {displaySlots.map((slot) => {
                            const isSelected = selectedSlot?.time24 === slot.time24;
                            const isFull = slot.isFull || slot.available <= 0;
                            return (
                                <button
                                    key={slot.time24}
                                    type="button"
                                    disabled={isFull}
                                    onClick={() => setSelectedSlot(slot)}
                                    className={`rounded-lg p-3 text-left transition-all ${
                                        isFull
                                            ? 'cursor-not-allowed border border-dashed border-slate-200 bg-slate-50 opacity-60'
                                            : isSelected
                                            ? 'flex items-center justify-between border border-[#0052CC] bg-[#0052CC] text-white shadow-xs'
                                            : 'border border-slate-200 bg-white text-[#0F2644] hover:border-[#0052CC] hover:bg-blue-50/40'
                                    }`}
                                >
                                    <div>
                                        <div className="flex items-center gap-1.5">
                                            <p className={`text-xs font-bold leading-tight sm:text-[13px] ${isFull ? 'text-slate-400 line-through' : isSelected ? 'text-white' : 'text-[#0F2644]'}`}>
                                                {slot.label}
                                            </p>
                                            {isFull && (
                                                <span className="rounded bg-rose-100 px-1 py-0.5 text-[9px] font-bold text-rose-700">
                                                    Full
                                                </span>
                                            )}
                                        </div>
                                        <p className={`mt-1 text-[11px] font-medium ${isFull ? 'text-slate-400' : isSelected ? 'text-blue-100' : 'text-slate-500'}`}>
                                            {isFull ? '0 available' : `${slot.available} of ${slot.total} available`}
                                        </p>
                                    </div>
                                    {isSelected && !isFull && (
                                        <svg className="size-4 shrink-0 text-white" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                                        </svg>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Right Card: Summary */}
                <div className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-xs lg:col-span-4">
                    <div className="space-y-6">
                        {/* Selected Appointment */}
                        <div className="flex items-start gap-3">
                            <svg className="mt-0.5 size-6 shrink-0 text-[#0052CC]" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                            </svg>
                            <div>
                                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                                    Selected Appointment
                                </span>
                                <p className="mt-0.5 text-base font-bold leading-snug text-[#0F2644] sm:text-lg">
                                    {selectedDayFormatted}
                                </p>
                                <p className="text-sm font-bold text-[#0F2644] sm:text-base">
                                    {selectedSlot ? selectedSlot.label : 'Select a slot'}
                                </p>
                                {selectedSlot && !selectedSlot.isFull && (
                                    <p className="mt-1 text-xs font-semibold text-emerald-600">
                                        ✓ {selectedSlot.available} spot{selectedSlot.available === 1 ? '' : 's'} remaining
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Location */}
                        <div className="flex items-start gap-3">
                            <svg className="mt-0.5 size-5 shrink-0 text-[#0052CC]" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 00.281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 103 9c0 3.492 1.698 5.988 3.355 7.588a13.433 13.433 0 002.274 1.765 11.258 11.258 0 001.038.573l.018.008.006.003zM10 11.25a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z" clipRule="evenodd" />
                            </svg>
                            <div>
                                <p className="text-sm font-bold leading-snug text-[#0F2644]">{selectedCenter.name}</p>
                                <p className="mt-0.5 text-xs text-slate-500">{selectedCenter.location}</p>
                            </div>
                        </div>

                        {/* Reminder Callout */}
                        <div className="flex items-start gap-3 rounded-xl border border-[#D0E2FF] bg-[#F0F6FF] p-3.5">
                            <svg className="mt-0.5 size-5 shrink-0 text-[#0052CC]" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clipRule="evenodd" />
                            </svg>
                            <div>
                                <h4 className="text-xs font-bold text-[#0052CC]">Reminder</h4>
                                <p className="mt-0.5 text-xs leading-relaxed text-slate-600">
                                    Please arrive at least 10 minutes before your scheduled time.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {(errors.center_id || errors.slot_at) && (
                <p className="mt-3 text-sm font-medium text-red-600">{errors.center_id ?? errors.slot_at}</p>
            )}

            {/* Bottom Navigation */}
            <div className="mt-6 flex items-center justify-between border-t border-slate-200 pt-4">
                <Button
                    type="button"
                    onClick={() => router.visit('/prereg/8')}
                    variant="outline"
                    className="h-11 rounded-lg border border-[#0052CC] bg-white px-6 text-sm font-semibold text-[#0052CC] shadow-xs transition hover:bg-blue-50/60"
                >
                    ← Back
                </Button>
                <Button
                    type="submit"
                    disabled={!centerId || !date || !selectedSlot || selectedSlot.isFull}
                    className="h-11 rounded-lg bg-[#0052CC] px-8 text-sm font-semibold text-white shadow-xs transition hover:bg-[#0047B3] active:scale-[0.99] disabled:bg-slate-200 disabled:text-slate-400"
                >
                    Continue (↵ Enter) →
                </Button>
            </div>
        </form>
    );
}

export default function Prereg({
    step,
    draft,
    demoOtp,
    centers,
    initialSlotData,
}: {
    step: number;
    draft: Draft | null;
    demoOtp: string | null;
    centers: { id: number; name: string; location: string }[];
    initialSlotData?: SlotData | null;
}) {
    const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
    const preselect = params?.get('center') ? Number(params.get('center')) : null;

    return (
        <>
            <Head title={`Pre-registration · Step ${step} of 10`} />
            <Shell step={step}>
                {step === 1 && <Step1 />}
                {step === 2 && <Step2 />}
                {step === 3 && <Step3 demoOtp={demoOtp} />}
                {step === 4 && <Step4 />}
                {step === 5 && <Step5 draft={draft} />}
                {step === 6 && <Step6 draft={draft} />}
                {step === 7 && <Step7 draft={draft} />}
                {step === 8 && <Step8 centers={centers} preselect={preselect} />}
                {step === 9 && (
                    <Step9
                        centers={centers}
                        preselect={preselect}
                        initialSlotData={initialSlotData}
                    />
                )}
                {step === 10 && (
                    <AppointmentConfirmationCard
                        appointment={draft?.appointments?.[draft.appointments.length - 1]}
                    />
                )}
            </Shell>
        </>
    );
}
