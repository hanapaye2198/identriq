import { Head, Link, useForm } from '@inertiajs/react';
import { FormEvent, useId, useState } from 'react';
import {
    AlertCircle,
    ArrowLeft,
    CheckCircle2,
    Lock,
    ShieldCheck,
    Sparkles,
} from 'lucide-react';
import AppLogoIcon from '@/components/app-logo-icon';
import InputError from '@/components/input-error';
import PasskeyVerify from '@/components/passkey-verify';
import PasswordInput from '@/components/password-input';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { home, register } from '@/routes';
import { request } from '@/routes/password';

type RoleKey = 'staff' | 'admin' | 'verifier';

interface RoleConfig {
    key: RoleKey;
    title: string;
    doorName: string;
    purpose: string;
    badge: string;
    destination: string;
}

const ROLES: Record<RoleKey, RoleConfig> = {
    staff: {
        key: 'staff',
        title: 'Staff Enrollment Desk',
        doorName: 'Staff Desk',
        purpose: 'Biometric capture, document intake, and identity issuance counter.',
        badge: 'Center Station',
        destination: '/staff',
    },
    admin: {
        key: 'admin',
        title: 'Registry Back-Office',
        doorName: 'Registry Admin',
        purpose: 'Civil validation queue, deduplication pipeline, and sovereign master records.',
        badge: 'National Headquarters',
        destination: '/admin/validation',
    },
    verifier: {
        key: 'verifier',
        title: 'Verifier Portal',
        doorName: 'Verifier Portal',
        purpose: 'National identity verification, eKYC validation, and credential query terminal.',
        badge: 'Accredited Terminal',
        destination: '/verify/online',
    },
};

/** Abstract PNG-inspired traditional weave and highland ridge contour line art SVG */
function AbstractPatternSvg({ className }: { className?: string }) {
    const patternId = useId().replace(/[^a-zA-Z0-9_-]/g, '');

    return (
        <svg
            className={className}
            viewBox="0 0 600 800"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="xMidYMid slice"
            aria-hidden="true"
        >
            <defs>
                {/* Traditional Tapa / Bilum Geometric Weave Pattern */}
                <pattern
                    id={`weave-${patternId}`}
                    width="60"
                    height="60"
                    patternUnits="userSpaceOnUse"
                >
                    <path
                        d="M30 0 L60 30 L30 60 L0 30 Z"
                        fill="none"
                        stroke="#38BDF8"
                        strokeWidth="0.75"
                        strokeOpacity="0.14"
                    />
                    <path
                        d="M30 10 L50 30 L30 50 L10 30 Z"
                        fill="none"
                        stroke="#0284C7"
                        strokeWidth="0.5"
                        strokeOpacity="0.12"
                    />
                    <path
                        d="M30 20 L40 30 L30 40 L20 30 Z"
                        fill="#38BDF8"
                        fillOpacity="0.04"
                    />
                    <circle cx="30" cy="30" r="1.5" fill="#38BDF8" fillOpacity="0.25" />
                    <circle cx="0" cy="0" r="1.5" fill="#38BDF8" fillOpacity="0.25" />
                    <circle cx="60" cy="0" r="1.5" fill="#38BDF8" fillOpacity="0.25" />
                    <circle cx="0" cy="60" r="1.5" fill="#38BDF8" fillOpacity="0.25" />
                    <circle cx="60" cy="60" r="1.5" fill="#38BDF8" fillOpacity="0.25" />
                </pattern>

                {/* Soft gradient mask for depth */}
                <linearGradient id={`grad-sky-${patternId}`} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.35" />
                    <stop offset="50%" stopColor="#0284C7" stopOpacity="0.18" />
                    <stop offset="100%" stopColor="#0369A1" stopOpacity="0.05" />
                </linearGradient>

                <radialGradient id={`glow-${patternId}`} cx="50%" cy="40%" r="65%">
                    <stop offset="0%" stopColor="#0284C7" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#06152B" stopOpacity="0" />
                </radialGradient>
            </defs>

            {/* Ambient Radial Depth Glow */}
            <rect width="600" height="800" fill={`url(#glow-${patternId})`} />

            {/* Geometric Tapa Weave Fill */}
            <rect width="600" height="800" fill={`url(#weave-${patternId})`} />

            {/* Papua New Guinea Highland Ridge Topographic Elevation Contour Lines */}
            <g stroke={`url(#grad-sky-${patternId})`} fill="none" strokeLinecap="round">
                {/* Ridge 1: High Elevation Ridge */}
                <path
                    d="M-40 280 C120 220, 240 340, 420 270 C520 230, 580 290, 650 260"
                    strokeWidth="1.75"
                    strokeOpacity="0.32"
                />
                {/* Ridge 2: Mid-Slope Contour */}
                <path
                    d="M-50 330 C100 270, 260 390, 440 320 C540 280, 600 340, 660 310"
                    strokeWidth="1.25"
                    strokeOpacity="0.24"
                />
                {/* Ridge 3: Valley Traverse */}
                <path
                    d="M-60 380 C80 320, 280 440, 460 370 C560 330, 620 390, 670 360"
                    strokeWidth="1.5"
                    strokeOpacity="0.28"
                />
                {/* Ridge 4: Parallel Step Contour */}
                <path
                    d="M-40 430 C110 380, 300 490, 480 420 C570 380, 630 435, 680 410"
                    strokeWidth="1"
                    strokeOpacity="0.2"
                    strokeDasharray="4 4"
                />
                {/* Ridge 5: Lower Cordillera Basin */}
                <path
                    d="M-50 490 C90 440, 310 540, 500 480 C590 450, 640 490, 690 470"
                    strokeWidth="1.25"
                    strokeOpacity="0.22"
                />
                {/* Ridge 6: Base Foot-Hills */}
                <path
                    d="M-60 550 C70 510, 320 600, 520 540 C600 510, 650 550, 700 530"
                    strokeWidth="1"
                    strokeOpacity="0.16"
                />
            </g>

            {/* Subtle Sovereign Constellation Motif */}
            <g opacity="0.35" fill="#E0F2FE">
                <circle cx="480" cy="140" r="1.5" />
                <circle cx="510" cy="180" r="1.5" />
                <circle cx="460" cy="210" r="1.5" />
                <circle cx="505" cy="250" r="1.5" />
                <circle cx="475" cy="190" r="1" />
            </g>
        </svg>
    );
}

type Props = {
    status?: string;
    canResetPassword: boolean;
};

export default function Login({ status, canResetPassword }: Props) {
    const [selectedRole, setSelectedRole] = useState<RoleKey>('staff');
    const currentRole = ROLES[selectedRole];

    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const handleQuickFill = () => {
        setData((prev) => ({
            ...prev,
            email: 'test@example.com',
            password: 'password',
        }));
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        post('/login', {
            onFinish: () => reset('password'),
        });
    };

    // Generic error message fallback so specific login half is never disclosed
    const hasGenericError = Boolean(errors.email || errors.password);
    const genericErrorMessage =
        errors.email || errors.password || 'Incorrect username or password. Please verify your credentials.';

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row text-slate-900 selection:bg-sky-500 selection:text-white">
            <Head title={`Sign in · ${currentRole.title} · IDENTRIQ`} />

            {/* =========================================================================
                MOBILE SLIM NAVY HEADER (Visible on screens < 1024px; left panel hidden)
               ========================================================================= */}
            <header className="lg:hidden flex items-center justify-between border-b border-sky-950 bg-[#06152B] px-5 py-3.5 text-white shadow-md">
                <Link href={home()} className="flex items-center gap-2.5">
                    <div className="flex size-7 items-center justify-center rounded-lg bg-white/10 p-1 ring-1 ring-white/20">
                        <AppLogoIcon className="size-5 object-contain" />
                    </div>
                    <div>
                        <div className="text-sm font-black tracking-wider text-white">IDENTRIQ</div>
                        <div className="text-[10px] font-medium text-sky-300/80">PNG National ID</div>
                    </div>
                </Link>

                <div className="flex items-center gap-1.5 rounded-full border border-sky-400/30 bg-sky-900/50 px-2.5 py-0.5 text-[11px] font-semibold text-sky-200">
                    <span className="size-1.5 rounded-full bg-sky-400" />
                    <span>{currentRole.doorName}</span>
                </div>
            </header>

            {/* =========================================================================
                LEFT PANEL: 55% DESKTOP (Deep Navy #06152B, Abstract PNG Line Art)
               ========================================================================= */}
            <aside
                className="hidden lg:flex lg:w-[55%] relative flex-col justify-between p-10 lg:p-14 overflow-hidden text-white border-r border-sky-950 shadow-2xl"
                style={{
                    background:
                        'linear-gradient(150deg, #051326 0%, #071A35 48%, #092348 85%, #051020 100%)',
                }}
            >
                {/* Abstract PNG Traditional Weave & Highland-Ridge SVG Pattern */}
                <div className="pointer-events-none absolute inset-0 z-0">
                    <AbstractPatternSvg className="h-full w-full object-cover" />
                </div>

                {/* Top: Logo and System Name */}
                <div className="relative z-10 flex items-center justify-between">
                    <Link
                        href={home()}
                        className="group inline-flex items-center gap-3 transition-opacity hover:opacity-95"
                    >
                        <div className="flex size-11 items-center justify-center rounded-xl bg-white/10 p-2 ring-1 ring-white/25 backdrop-blur-md shadow-inner transition group-hover:bg-white/15">
                            <AppLogoIcon className="size-7 object-contain" />
                        </div>
                        <div>
                            <div className="text-xl font-black tracking-wider text-white">IDENTRIQ</div>
                            <div className="text-xs font-semibold tracking-wide text-sky-300/80">
                                PNG National ID
                            </div>
                        </div>
                    </Link>

                    <Link
                        href={home()}
                        className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold text-sky-100 hover:bg-white/10 transition"
                    >
                        <ArrowLeft className="size-3.5" />
                        <span>Public Portal</span>
                    </Link>
                </div>

                {/* Middle: Role Selector & One-line Purpose */}
                <div className="relative z-10 my-auto py-10 max-w-xl">
                    {/* Role Doors Segmented Switcher */}
                    <div className="inline-flex rounded-xl bg-black/30 p-1.5 ring-1 ring-white/15 backdrop-blur-md">
                        {(Object.keys(ROLES) as RoleKey[]).map((key) => {
                            const r = ROLES[key];
                            const isActive = selectedRole === key;
                            return (
                                <button
                                    key={key}
                                    type="button"
                                    onClick={() => setSelectedRole(key)}
                                    className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition cursor-pointer ${
                                        isActive
                                            ? 'bg-sky-500/25 text-white ring-1 ring-sky-400/50 shadow-xs'
                                            : 'text-sky-200/70 hover:text-white hover:bg-white/5'
                                    }`}
                                >
                                    {r.doorName}
                                </button>
                            );
                        })}
                    </div>

                    <div className="mt-6 space-y-3">
                        <div className="inline-flex items-center gap-2 rounded-full border border-sky-400/30 bg-sky-950/60 px-3 py-1 text-xs font-mono font-medium text-sky-300">
                            <span className="size-1.5 rounded-full bg-sky-400 animate-pulse" />
                            <span>{currentRole.badge}</span>
                        </div>

                        <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                            {currentRole.title}
                        </h1>

                        <p className="text-base leading-relaxed text-sky-100/90 font-normal">
                            {currentRole.purpose}
                        </p>
                    </div>
                </div>

                {/* Bottom: Small Trust Block (Strictly No Fake Stats, Marketing Claims, or False Seals) */}
                <div className="relative z-10 pt-6 border-t border-white/10 space-y-2.5">
                    <div className="flex items-center gap-2 text-xs font-semibold text-white/95">
                        <ShieldCheck className="size-4 text-sky-400 shrink-0" />
                        <span>Authorized personnel only. Activity is logged.</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-400/25 bg-sky-950/40 px-2.5 py-0.5 text-[11px] font-mono text-sky-200">
                            Demonstration build, simulated data.
                        </span>
                    </div>

                    <p className="text-xs text-sky-200/60 font-medium">
                        Need help? Contact your center administrator.
                    </p>
                </div>
            </aside>

            {/* =========================================================================
                RIGHT PANEL: 45% DESKTOP (Capped at 420px, Plain White / Canvas)
               ========================================================================= */}
            <main className="w-full lg:w-[45%] flex flex-col justify-center px-6 py-10 sm:px-10 lg:px-14 bg-white">
                <div className="mx-auto w-full max-w-[420px] space-y-6">
                    {/* Header Context for Form */}
                    <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-[#0052CC]">
                                {currentRole.badge}
                            </span>
                            <span className="text-[11px] font-mono text-slate-400">
                                TLS 1.3 · Sanctum
                            </span>
                        </div>
                        <h2 className="text-2xl font-bold tracking-tight text-[#0F2644]">
                            Sign in to Station
                        </h2>
                        <p className="text-xs leading-relaxed text-slate-500">
                            Enter your civil registry credentials to access the{' '}
                            <span className="font-semibold text-slate-700">
                                {currentRole.title.toLowerCase()}
                            </span>
                            .
                        </p>
                    </div>

                    {/* Status Message (if redirected from password reset, etc.) */}
                    {status && (
                        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-medium text-emerald-800">
                            {status}
                        </div>
                    )}

                    {/* Generic Authentication Error Alert */}
                    {hasGenericError && (
                        <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs text-red-800">
                            <AlertCircle className="size-4 shrink-0 text-red-600 mt-0.5" />
                            <div>
                                <p className="font-bold">Authentication Failed</p>
                                <p className="mt-0.5 text-[11px] text-red-700">
                                    {genericErrorMessage}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* One-Click Quick-Fill Demo Assistant Chip */}
                    <div className="rounded-xl border border-sky-200 bg-sky-50/80 p-3.5 text-xs text-slate-700 shadow-2xs">
                        <div className="flex items-center justify-between gap-2">
                            <div className="space-y-0.5">
                                <div className="flex items-center gap-1.5 font-bold text-[#0F2644]">
                                    <Sparkles className="size-3.5 text-[#0052CC]" />
                                    <span>Demo Station Access</span>
                                </div>
                                <div className="text-[11px] text-slate-500 font-mono">
                                    test@example.com · password
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={handleQuickFill}
                                className="shrink-0 rounded-lg bg-[#0052CC] px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-[#0047B3] transition cursor-pointer"
                            >
                                Quick Fill
                            </button>
                        </div>
                    </div>

                    {/* Passkey Verify (if supported on browser/device) */}
                    <PasskeyVerify />

                    {/* Main Authentication Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Email Input */}
                        <div className="space-y-1.5">
                            <Label htmlFor="email" className="text-xs font-bold text-[#0F2644]">
                                Personnel Email
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                name="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                required
                                autoFocus
                                tabIndex={1}
                                autoComplete="email"
                                placeholder="name@registry.gov.pg"
                                className="h-10 text-xs border-slate-300 focus:border-[#0052CC] focus:ring-1 focus:ring-[#0052CC]"
                            />
                        </div>

                        {/* Password Input */}
                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="password" className="text-xs font-bold text-[#0F2644]">
                                    Password
                                </Label>
                                {canResetPassword && (
                                    <TextLink
                                        href={request()}
                                        className="text-xs text-[#0052CC] hover:underline font-medium"
                                        tabIndex={5}
                                    >
                                        Forgot password?
                                    </TextLink>
                                )}
                            </div>
                            <PasswordInput
                                id="password"
                                name="password"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                required
                                tabIndex={2}
                                autoComplete="current-password"
                                placeholder="••••••••"
                                className="h-10 text-xs border-slate-300 focus:border-[#0052CC] focus:ring-1 focus:ring-[#0052CC]"
                            />
                        </div>

                        {/* Remember Station Checkbox */}
                        <div className="flex items-center space-x-2 pt-1">
                            <Checkbox
                                id="remember"
                                name="remember"
                                checked={data.remember}
                                onCheckedChange={(checked) =>
                                    setData('remember', checked === true)
                                }
                                tabIndex={3}
                            />
                            <Label
                                htmlFor="remember"
                                className="text-xs font-medium text-slate-600 cursor-pointer"
                            >
                                Remember this workstation for 30 days
                            </Label>
                        </div>

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            className="mt-2 h-11 w-full gap-2 rounded-xl bg-[#0052CC] font-bold text-white shadow-xs hover:bg-[#0047B3] transition active:scale-[0.99] cursor-pointer"
                            tabIndex={4}
                            disabled={processing}
                            data-test="login-button"
                        >
                            {processing ? (
                                <>
                                    <Spinner className="size-4" />
                                    <span>Verifying Station Access...</span>
                                </>
                            ) : (
                                <>
                                    <Lock className="size-4" />
                                    <span>Sign In to {currentRole.doorName}</span>
                                </>
                            )}
                        </Button>
                    </form>

                    {/* Bottom Navigation Links */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                        <Link
                            href={home()}
                            className="inline-flex items-center gap-1 text-slate-600 hover:text-[#0052CC] font-medium transition"
                        >
                            <ArrowLeft className="size-3" />
                            <span>Return to Portal</span>
                        </Link>

                        <div className="text-slate-400 text-[11px]">
                            IDENTRIQ · v1.4 Sovereign Build
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

// Full page layout without nested card wrapper
Login.layout = (page: React.ReactNode) => <>{page}</>;
