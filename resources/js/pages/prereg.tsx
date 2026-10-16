import { Head, Link, router, usePage } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
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
    documents?: { id: number; category: string; doc_type: string; verified_status: string }[];
    appointments?: Appointment[];
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
    return (
        <div className="min-h-screen bg-[#F7F5EF] px-4 py-8 text-[#14201B] sm:px-8">
            <div className="mx-auto max-w-4xl sm:max-w-5xl">
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
                                i + 1 <= step ? 'bg-[#2FD6A3]' : 'bg-[#14201B]/15'
                            }`}
                        />
                    ))}
                </div>

                <div className="mt-2.5 flex items-center justify-between text-xs text-[#14201B]/60 sm:text-sm">
                    <p className="font-medium">
                        Step {step} of 10 · <span className="font-semibold text-[#0E2A26]">{TITLES[step - 1]}</span>
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
    return (
        <div className="mx-auto max-w-2xl">
            <h2 className="text-2xl font-bold tracking-tight text-[#0E2A26]">Select your language</h2>
            <p className="mt-1 text-sm text-[#14201B]/70">
                Choose the language you would like to complete your pre-registration with.
            </p>
            <div className="mt-6 grid gap-3">
                <Button
                    onClick={() => router.post('/prereg/language', { language: 'en' })}
                    className="h-12 justify-between rounded-xl bg-[#2FD6A3] px-5 text-base font-semibold text-[#0E2A26] transition hover:brightness-105 active:scale-[0.99]"
                >
                    <span>English</span>
                    <span className="text-xs uppercase tracking-wider opacity-75">Continue →</span>
                </Button>
                {['Tok Pisin — coming soon', 'Hiri Motu — coming soon'].map((l) => (
                    <Button key={l} disabled variant="outline" className="h-12 justify-start rounded-xl px-5 text-left text-sm text-[#14201B]/50">
                        {l}
                    </Button>
                ))}
            </div>
        </div>
    );
}

function Step2() {
    const [mobile, setMobile] = useState('+675');
    const [captchaInput, setCaptchaInput] = useState('');
    const [challenge, setChallenge] = useState('');
    const [captchaFailed, setCaptchaFailed] = useState(false);
    const [refreshingCaptcha, setRefreshingCaptcha] = useState(false);
    const loaded = useRef(false);
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

    return (
        <div className="mx-auto max-w-2xl">
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
                            inputMode="tel"
                            maxLength={11}
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
                            className="inline-flex items-center gap-1 text-xs font-semibold text-[#0E2A26] underline hover:opacity-80 disabled:opacity-50"
                        >
                            ↻ Refresh code
                        </button>
                    </div>
                    <div className="mt-2 flex items-center gap-3">
                        <code className="flex h-11 min-w-28 items-center justify-center rounded-lg border border-[#0E2A26]/20 bg-white px-3 font-mono text-xl font-bold tracking-widest text-[#0E2A26]">
                            {refreshingCaptcha ? '...' : (challenge || (captchaFailed ? 'ERR' : '...'))}
                        </code>
                        <Input
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
                    onClick={() => router.post('/prereg/mobile', { mobile, captcha: captchaInput })}
                    disabled={digitsOnly.length !== 7 || !captchaInput}
                    className="mt-2 h-12 rounded-xl bg-[#2FD6A3] font-semibold text-[#0E2A26] transition hover:brightness-105 active:scale-[0.99] disabled:opacity-40"
                >
                    Send Verification Code (OTP)
                </Button>
            </div>
        </div>
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

    return (
        <div className="mx-auto max-w-2xl">
            <h2 className="text-2xl font-bold tracking-tight text-[#0E2A26]">Enter the 6-digit code</h2>
            <p className="mt-1 text-sm text-[#14201B]/70">
                A verification code was sent to your mobile. Enter the 6 digits below.
            </p>

            {demoOtp && (
                <div className="mt-4 rounded-xl border border-[#2FD6A3]/30 bg-[#2FD6A3]/10 p-3.5 text-sm text-[#0E2A26]">
                    <span className="font-semibold uppercase tracking-wider text-xs bg-[#0E2A26] text-white rounded px-1.5 py-0.5 mr-2">Demo Mode</span>
                    Your verification code is <strong className="font-mono text-base font-bold tracking-widest">{demoOtp}</strong>
                </div>
            )}

            <div className="mt-6 grid gap-4">
                <div>
                    <Input
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        maxLength={6}
                        inputMode="numeric"
                        placeholder="••••••"
                        className="h-14 text-center font-mono text-3xl font-bold tracking-widest"
                    />
                    {errors.otp && <p className="mt-1.5 text-center text-sm font-medium text-red-600">{errors.otp}</p>}
                </div>

                <Button
                    onClick={() => router.post('/prereg/otp/verify', { otp })}
                    disabled={otp.length !== 6}
                    className="h-12 rounded-xl bg-[#2FD6A3] font-semibold text-[#0E2A26] transition hover:brightness-105 active:scale-[0.99] disabled:opacity-40"
                >
                    Verify & Continue
                </Button>

                <div className="text-center">
                    <button
                        type="button"
                        onClick={resend}
                        disabled={countdown > 0}
                        className="text-sm font-medium text-[#0E2A26] underline hover:opacity-80 disabled:opacity-40 disabled:no-underline"
                    >
                        {countdown > 0 ? `Resend code in ${countdown}s` : 'Resend code'}
                    </button>
                </div>
            </div>
        </div>
    );
}

function Step4() {
    const [scrolled, setScrolled] = useState(false);
    const [agreed, setAgreed] = useState(false);

    return (
        <div className="mx-auto max-w-2xl">
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
                    className="mt-0.5 size-4 rounded border-gray-300 text-[#0E2A26] focus:ring-[#2FD6A3]"
                />
                <span className="text-[#14201B]/90">
                    I have read and agree to the IDENTRIQ terms of consent and biometric enrollment under Papua New Guinea law.
                </span>
            </label>

            <Button
                disabled={!scrolled && !agreed}
                onClick={() => router.post('/prereg/consent', { accept: true })}
                className="mt-6 h-12 w-full rounded-xl bg-[#2FD6A3] font-semibold text-[#0E2A26] transition hover:brightness-105 active:scale-[0.99] disabled:opacity-40"
            >
                Agree & Continue
            </Button>
        </div>
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

    return (
        <div>
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
                            <SelectTrigger className="mt-1.5 h-11 rounded-lg border-slate-300 text-slate-700">
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
                            <SelectTrigger className="mt-1.5 h-11 rounded-lg border-slate-300 text-slate-700">
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
                            <SelectTrigger className="mt-1.5 h-11 rounded-lg border-slate-300 text-slate-700">
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
                            <div className="flex h-11 items-center justify-between gap-1.5 rounded-lg border border-slate-300 bg-slate-50 px-3 text-sm font-semibold text-slate-700">
                                <span>+675</span>
                                <span className="text-xs text-slate-400">▼</span>
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
                            <SelectTrigger className="mt-1.5 h-11 rounded-lg border-slate-300 text-slate-700">
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
                                <SelectTrigger className="mt-1.5 h-11 rounded-lg border-slate-300 text-slate-700">
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
                    onClick={() => router.post('/prereg/demographics', f)}
                    className="h-12 w-full rounded-xl bg-[#0052CC] px-8 text-base font-semibold text-white shadow transition hover:bg-[#0047B3] active:scale-[0.99] sm:w-auto"
                >
                    <span>Continue</span>
                    <span className="ml-2">→</span>
                </Button>
            </div>
        </div>
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

    function handleContinue() {
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

    return (
        <div>
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
                            <SelectTrigger className="mt-1.5 h-11 rounded-lg border-slate-300 text-slate-700">
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
                            className="mt-1.5 flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-[#C6DCFC] bg-[#F8FAFF] px-3 text-sm font-semibold text-[#0052CC] transition hover:bg-[#EEF4FE]"
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
                            <SelectTrigger className="mt-1.5 h-11 rounded-lg border-slate-300 text-slate-700">
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
                            className="mt-1.5 flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-[#C6DCFC] bg-[#F8FAFF] px-3 text-sm font-semibold text-[#0052CC] transition hover:bg-[#EEF4FE]"
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
                            <SelectTrigger className="mt-1.5 h-11 rounded-lg border-slate-300 text-slate-700">
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
                            className="mt-1.5 flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-[#C6DCFC] bg-[#F8FAFF] px-3 text-sm font-semibold text-[#0052CC] transition hover:bg-[#EEF4FE]"
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
                    className="h-11 rounded-xl border border-[#0052CC] bg-white px-7 text-sm font-semibold text-[#0052CC] hover:bg-blue-50/50 transition-colors"
                >
                    ← Back
                </Button>

                <Button
                    type="button"
                    onClick={handleContinue}
                    disabled={uploading}
                    className="h-11 rounded-xl bg-[#0052CC] px-9 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0047B3] active:scale-[0.99] disabled:opacity-50"
                >
                    {uploading ? 'Uploading...' : 'Continue →'}
                </Button>
            </div>
        </div>
    );
}

function Step7({ draft }: { draft: Draft | null }) {
    const d = (draft?.demographic ?? {}) as Record<string, string>;
    const docs = draft?.documents ?? [];

    const fullName = d.full_name || [d.given_name, d.middle_name, d.family_name].filter(Boolean).join(' ');

    return (
        <div>
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-[#0E2A26]">Review Application</h2>
                    <p className="mt-1 text-sm text-[#14201B]/70">Confirm your personal details and uploaded documents.</p>
                </div>
                <Button onClick={() => router.visit('/prereg/5')} variant="outline" className="text-xs font-semibold">
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
                    <Button onClick={() => router.visit('/prereg/6')} variant="ghost" className="h-6 text-xs text-[#0E2A26] underline">
                        Edit Documents
                    </Button>
                </div>
                <div className="mt-3 space-y-2">
                    {docs.map((doc) => (
                        <div key={doc.id} className="flex items-center justify-between rounded-lg bg-[#14201B]/[0.02] p-2.5 text-sm">
                            <span className="capitalize font-medium text-[#14201B]">{doc.category}: {doc.doc_type.replace(/_/g, ' ')}</span>
                            <span className="rounded bg-[#2FD6A3]/20 px-2 py-0.5 text-xs font-bold text-[#0E2A26]">Verified Document</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Button onClick={() => router.visit('/prereg/5')} variant="outline" className="h-12 flex-1 rounded-xl">
                    ← Back to Details
                </Button>
                <Button
                    onClick={() => router.post('/prereg/confirm')}
                    className="h-12 flex-1 rounded-xl bg-[#2FD6A3] font-semibold text-[#0E2A26] transition hover:brightness-105 active:scale-[0.99]"
                >
                    Confirm & Select Center (Step 8) →
                </Button>
            </div>
        </div>
    );
}

function Step8({
    centers,
    preselect,
}: {
    centers: { id: number; name: string; location: string; province?: string; daily_capacity?: number }[];
    preselect: number | null;
}) {
    const [centerId, setCenterId] = useState<number | null>(preselect ?? centers[0]?.id ?? null);

    return (
        <div className="mx-auto max-w-2xl">
            <h2 className="text-2xl font-bold tracking-tight text-[#0E2A26]">Choose Registration Center</h2>
            <p className="mt-1 text-sm text-[#14201B]/70">
                Select your convenient center for biometric capture (photo, fingerprints, iris).
            </p>

            <div className="mt-6 grid gap-3">
                {centers.map((c) => {
                    const isSelected = centerId === c.id;
                    return (
                        <button
                            key={c.id}
                            type="button"
                            onClick={() => setCenterId(c.id)}
                            className={`flex items-start justify-between rounded-xl border p-4 text-left transition-all ${
                                isSelected
                                    ? 'border-[#2FD6A3] bg-[#2FD6A3]/10 shadow-sm ring-2 ring-[#2FD6A3]/30'
                                    : 'border-[#14201B]/15 hover:border-[#14201B]/30'
                            }`}
                        >
                            <div>
                                <span className="text-base font-bold text-[#0E2A26]">{c.name}</span>
                                <span className="block mt-0.5 text-sm text-[#14201B]/70">{c.location}</span>
                                {c.province && (
                                    <span className="mt-2 inline-block rounded bg-[#14201B]/5 px-2 py-0.5 text-xs font-medium text-[#14201B]/70">
                                        {c.province}
                                    </span>
                                )}
                            </div>
                            <div className="flex size-6 items-center justify-center rounded-full border border-[#0E2A26]/30">
                                {isSelected && <div className="size-3.5 rounded-full bg-[#0E2A26]" />}
                            </div>
                        </button>
                    );
                })}
            </div>

            <Button
                onClick={() => router.visit(`/prereg/9?center=${centerId}`)}
                disabled={!centerId}
                className="mt-6 h-12 w-full rounded-xl bg-[#2FD6A3] font-semibold text-[#0E2A26] transition hover:brightness-105 active:scale-[0.99] disabled:opacity-40"
            >
                Continue to Date & Time (Step 9) →
            </Button>
        </div>
    );
}

function Step9({
    centers,
    preselect,
}: {
    centers: { id: number; name: string; location: string }[];
    preselect: number | null;
}) {
    const [centerId] = useState<number | null>(preselect ?? centers[0]?.id ?? null);
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    const [date, setDate] = useState(tomorrow);
    const [time, setTime] = useState('09:00');
    const { errors } = usePage().props as unknown as { errors: Record<string, string> };

    const selectedCenter = centers.find((c) => c.id === centerId) ?? centers[0];
    const timeSlots = ['09:00', '10:30', '13:00', '14:30', '16:00'];

    function book() {
        if (!centerId || !date) return;
        router.post('/prereg/book', {
            center_id: centerId,
            slot_at: `${date} ${time}:00`,
        });
    }

    return (
        <div className="mx-auto max-w-2xl">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-[#0E2A26]">Select Date & Time Slot</h2>
                    <p className="mt-1 text-sm text-[#14201B]/70">Choose an available appointment slot for in-person capture.</p>
                </div>
                <Link href="/prereg/8" className="text-xs font-semibold text-[#0E2A26] underline">
                    Change Center
                </Link>
            </div>

            {selectedCenter && (
                <div className="mt-4 rounded-xl border border-[#2FD6A3]/40 bg-[#2FD6A3]/10 p-3.5 text-sm text-[#0E2A26]">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#0E2A26]/60">Selected Center:</span>
                    <p className="font-bold">{selectedCenter.name}</p>
                    <p className="text-xs text-[#0E2A26]/75">{selectedCenter.location}</p>
                </div>
            )}

            <div className="mt-6 grid gap-4">
                <div>
                    <Label className="font-semibold text-[#0E2A26]">Appointment Date</Label>
                    <Input
                        type="date"
                        min={tomorrow}
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="mt-1 h-12 text-base font-medium"
                    />
                </div>

                <div>
                    <Label className="font-semibold text-[#0E2A26]">Available Time Slots</Label>
                    <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-5">
                        {timeSlots.map((slot) => {
                            const isSlot = time === slot;
                            return (
                                <button
                                    key={slot}
                                    type="button"
                                    onClick={() => setTime(slot)}
                                    className={`rounded-lg py-2.5 text-center text-sm font-bold transition ${
                                        isSlot
                                            ? 'bg-[#0E2A26] text-white shadow'
                                            : 'border border-[#14201B]/15 bg-white text-[#14201B] hover:bg-[#14201B]/5'
                                    }`}
                                >
                                    {slot}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {(errors.center_id || errors.slot_at) && (
                    <p className="text-sm font-medium text-red-600">{errors.center_id ?? errors.slot_at}</p>
                )}

                <div className="mt-4 flex gap-3">
                    <Button onClick={() => router.visit('/prereg/8')} variant="outline" className="h-12 flex-1 rounded-xl">
                        ← Back to Center
                    </Button>
                    <Button
                        onClick={book}
                        disabled={!centerId || !date}
                        className="h-12 flex-1 rounded-xl bg-[#2FD6A3] font-semibold text-[#0E2A26] transition hover:brightness-105 active:scale-[0.99] disabled:opacity-40"
                    >
                        Confirm Appointment (Step 10) →
                    </Button>
                </div>
            </div>
        </div>
    );
}

export default function Prereg({
    step,
    draft,
    demoOtp,
    centers,
}: {
    step: number;
    draft: Draft | null;
    demoOtp: string | null;
    centers: { id: number; name: string; location: string }[];
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
                {step >= 9 && <Step9 centers={centers} preselect={preselect} />}
            </Shell>
        </>
    );
}
