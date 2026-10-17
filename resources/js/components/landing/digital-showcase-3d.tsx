import { CheckCircle2, ChevronRight, Fingerprint, Lock, QrCode, RefreshCw, Shield, Sparkles, Smartphone, Wifi, Check, ExternalLink } from 'lucide-react';
import { useState, useCallback, useRef, useEffect } from 'react';
import SmartCard3D from './smart-card-3d';

export default function DigitalShowcase3D() {
    const [activeTab, setActiveTab] = useState<'both' | 'physical' | 'digital'>('both');
    const [verificationModalOpen, setVerificationModalOpen] = useState(false);
    const [simulatingVerify, setSimulatingVerify] = useState(false);
    const [verifiedState, setVerifiedState] = useState(false);
    const [phoneTilt, setPhoneTilt] = useState({ x: 0, y: 0 });

    const handlePhoneMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const px = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
        const py = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
        setPhoneTilt({ x: -py * 10, y: px * 10 });
    };

    const handlePhoneMouseLeave = () => {
        setPhoneTilt({ x: 0, y: 0 });
    };

    const runVerificationDemo = () => {
        setVerificationModalOpen(true);
        setSimulatingVerify(true);
        setVerifiedState(false);
        setTimeout(() => {
            setSimulatingVerify(false);
            setVerifiedState(true);
        }, 1200);
    };

    return (
        <div className="w-full">
            {/* View Filter Switcher (Mobile/Desktop friendly) */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-4 mb-8">
                <div>
                    <div className="inline-flex items-center gap-2 rounded-md bg-primary-tint px-2.5 py-1 text-xs font-bold text-primary">
                        <Sparkles className="h-3.5 w-3.5" />
                        <span>UAE PASS & Singpass Dual Form Factor</span>
                    </div>
                    <h3 className="mt-1 text-xl sm:text-2xl font-extrabold text-ink">
                        Two Credentials. One Verified Legal Identity.
                    </h3>
                </div>

                <div className="inline-flex rounded-xl border border-line bg-canvas p-1 text-xs font-semibold">
                    <button
                        type="button"
                        onClick={() => setActiveTab('both')}
                        className={`rounded-lg px-3 py-1.5 transition cursor-pointer ${
                            activeTab === 'both' ? 'bg-surface text-ink shadow-xs font-bold' : 'text-muted-foreground hover:text-ink'
                        }`}
                    >
                        Dual Showcase
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('physical')}
                        className={`rounded-lg px-3 py-1.5 transition cursor-pointer ${
                            activeTab === 'physical' ? 'bg-surface text-ink shadow-xs font-bold' : 'text-muted-foreground hover:text-ink'
                        }`}
                    >
                        Physical Smart Card
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('digital')}
                        className={`rounded-lg px-3 py-1.5 transition cursor-pointer ${
                            activeTab === 'digital' ? 'bg-surface text-ink shadow-xs font-bold' : 'text-muted-foreground hover:text-ink'
                        }`}
                    >
                        Mobile Digital ID
                    </button>
                </div>
            </div>

            {/* Showcase Stage Grid */}
            <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
                {/* 1. PHYSICAL 3D SMART CARD (with interactive tilt & flip) */}
                {(activeTab === 'both' || activeTab === 'physical') && (
                    <div className={`flex flex-col items-center rounded-3xl border border-line bg-gradient-to-b from-surface to-canvas p-6 sm:p-8 shadow-sm ${activeTab === 'physical' ? 'lg:col-span-2 max-w-2xl mx-auto w-full' : ''}`}>
                        <div className="flex w-full items-center justify-between border-b border-line pb-3 mb-6">
                            <div className="flex items-center gap-2">
                                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-navy text-gold">
                                    <Shield className="h-4 w-4" />
                                </span>
                                <div>
                                    <h4 className="text-sm font-bold text-ink">Physical Smart Card</h4>
                                    <p className="text-[11px] text-muted-foreground">ICAO 9303 & ISO 7816 Cryptographic Chip</p>
                                </div>
                            </div>
                            <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800 border border-emerald-200">
                                Offline Verified
                            </span>
                        </div>

                        <div className="w-full flex justify-center py-2">
                            <SmartCard3D
                                citizenName="AMINI, KILA PETER"
                                idNumber="PNG-2026-9042-8810"
                                dob="14 APR 1994"
                                province="CENTRAL PROVINCE"
                                sex="F"
                                expiryDate="14 APR 2036"
                                className="w-full"
                            />
                        </div>

                        <p className="mt-4 text-center text-xs text-muted-foreground">
                            Hover or touch to tilt the card with 3D holographic glare. Click <span className="font-semibold text-primary">Flip</span> to view the MRZ & antenna on back.
                        </p>
                    </div>
                )}

                {/* 2. UAE PASS-STYLE 3D SMARTPHONE DIGITAL ID */}
                {(activeTab === 'both' || activeTab === 'digital') && (
                    <div className={`flex flex-col items-center rounded-3xl border border-line bg-gradient-to-b from-surface to-canvas p-6 sm:p-8 shadow-sm ${activeTab === 'digital' ? 'lg:col-span-2 max-w-2xl mx-auto w-full' : ''}`}>
                        <div className="flex w-full items-center justify-between border-b border-line pb-3 mb-6">
                            <div className="flex items-center gap-2">
                                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white">
                                    <Smartphone className="h-4 w-4" />
                                </span>
                                <div>
                                    <h4 className="text-sm font-bold text-ink">Mobile Digital Pass</h4>
                                    <p className="text-[11px] text-muted-foreground">ECDSA Signed QR & Offline Cryptographic Auth</p>
                                </div>
                            </div>
                            <span className="rounded-full bg-primary-tint px-2.5 py-0.5 text-[10px] font-bold text-primary border border-primary-border">
                                No Internet Required
                            </span>
                        </div>

                        {/* 3D Angled Phone Mockup (UAE PASS Style) */}
                        <div
                            className="relative w-full max-w-[320px] select-none py-2"
                            style={{ perspective: '1000px' }}
                            onMouseMove={handlePhoneMouseMove}
                            onMouseLeave={handlePhoneMouseLeave}
                        >
                            <div
                                style={{
                                    transform: `rotateX(${phoneTilt.x}deg) rotateY(${phoneTilt.y - 4}deg) translateZ(10px)`,
                                    transition: 'transform 0.15s ease-out',
                                    transformStyle: 'preserve-3d',
                                }}
                                className="relative overflow-hidden rounded-[40px] border-[6px] border-[#1e293b] bg-[#0B192C] shadow-2xl p-4 text-white"
                            >
                                {/* Phone Notch & Speaker */}
                                <div className="mx-auto mb-3 h-4 w-28 rounded-full bg-black/60 flex items-center justify-center">
                                    <div className="h-1.5 w-1.5 rounded-full bg-white/20 mr-2"></div>
                                    <div className="h-1 w-10 rounded-full bg-white/10"></div>
                                </div>

                                {/* Phone Inner UI: IDENTRIQ Mobile Wallet */}
                                <div className="rounded-2xl bg-gradient-to-br from-[#0F2942] to-[#071324] p-4 border border-white/10 shadow-inner">
                                    {/* Header */}
                                    <div className="flex items-center justify-between border-b border-white/10 pb-2">
                                        <div className="flex items-center gap-1.5">
                                            <img src="/images/identriq-mark.png" alt="" className="h-4 w-4 invert" />
                                            <span className="text-[11px] font-extrabold tracking-wider text-gold">IDENTRIQ PASS</span>
                                        </div>
                                        <span className="flex items-center gap-1 text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                                            VERIFIED
                                        </span>
                                    </div>

                                    {/* Citizen Profile Card */}
                                    <div className="mt-3 flex items-center gap-3">
                                        <div className="relative h-14 w-12 shrink-0 overflow-hidden rounded-lg border border-gold/40 bg-navy">
                                            <img
                                                src="/images/png-hero-photo.png"
                                                alt="Amini Kila Peter"
                                                className="h-full w-full object-cover"
                                            />
                                            <div className="absolute bottom-0 inset-x-0 bg-gold/90 text-center text-[7px] font-black text-navy uppercase">
                                                CITIZEN
                                            </div>
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <p className="text-[10px] text-white/50 uppercase tracking-wider">Citizen Full Name</p>
                                            <p className="truncate text-xs font-extrabold text-white">AMINI, KILA PETER</p>
                                            <p className="text-[10px] font-mono text-gold mt-0.5">PNG-2026-9042-8810</p>
                                        </div>
                                    </div>

                                    {/* Scannable Verified Dynamic QR Code */}
                                    <div className="mt-4 rounded-xl bg-white p-3 text-center text-navy shadow-md">
                                        <div className="flex items-center justify-center">
                                            <div className="relative p-1 bg-white border border-gray-200 rounded-lg">
                                                <QrCode className="h-28 w-28 text-navy" />
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center text-white border-2 border-white shadow">
                                                        <Fingerprint className="h-3.5 w-3.5" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <p className="mt-2 text-[10px] font-mono font-bold tracking-tight text-gray-700">
                                            ECDSA • EXPIRES IN 04:32
                                        </p>
                                    </div>

                                    {/* Action Buttons inside Mobile Phone */}
                                    <div className="mt-3 grid grid-cols-2 gap-2">
                                        <button
                                            type="button"
                                            onClick={runVerificationDemo}
                                            className="flex items-center justify-center gap-1 rounded-lg bg-primary py-2 text-[10px] font-bold text-white transition hover:bg-primary-hover active:scale-95 cursor-pointer"
                                        >
                                            <Shield className="h-3 w-3" />
                                            <span>Verify Pass</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={runVerificationDemo}
                                            className="flex items-center justify-center gap-1 rounded-lg bg-white/10 py-2 text-[10px] font-bold text-white transition hover:bg-white/20 active:scale-95 cursor-pointer"
                                        >
                                            <Wifi className="h-3 w-3" />
                                            <span>NFC Tap</span>
                                        </button>
                                    </div>
                                </div>

                                {/* Phone Home Indicator bar */}
                                <div className="mx-auto mt-3 h-1 w-24 rounded-full bg-white/30"></div>
                            </div>
                        </div>

                        {/* Interactive Verification Launcher */}
                        <div className="mt-4 flex flex-col items-center">
                            <button
                                type="button"
                                onClick={runVerificationDemo}
                                className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-white shadow transition hover:bg-primary-hover cursor-pointer"
                            >
                                <Fingerprint className="h-4 w-4" />
                                <span>Simulate Citizen QR / In-Person Verification</span>
                            </button>
                            <p className="mt-2 text-[11px] text-muted-foreground">
                                Demonstrates how Bank South Pacific (BSP) or PNG Immigration verifies credentials offline in milliseconds.
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* VERIFICATION MODAL SIMULATION (Singpass & UAE Pass Style) */}
            {verificationModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
                    <div className="w-full max-w-md rounded-2xl border border-line bg-surface p-6 shadow-2xl animate-in fade-in zoom-in-95">
                        <div className="flex items-center justify-between border-b border-line pb-3">
                            <div className="flex items-center gap-2">
                                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-tint text-primary">
                                    <Shield className="h-4 w-4" />
                                </span>
                                <div>
                                    <h4 className="text-sm font-bold text-ink">IDENTRIQ Biometric Verifier</h4>
                                    <p className="text-[10px] text-muted-foreground">Offline Cryptographic Authenticator (v2.4)</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setVerificationModalOpen(false)}
                                className="rounded-lg p-1.5 text-muted-foreground hover:bg-canvas hover:text-ink cursor-pointer"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="py-6 text-center">
                            {simulatingVerify ? (
                                <div className="space-y-4">
                                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary-tint text-primary animate-spin">
                                        <RefreshCw className="h-8 w-8" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-ink">Verifying ECDSA Signature...</p>
                                        <p className="text-xs text-muted-foreground mt-1">Checking civil registry hash and biometric revocation list</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4 animate-in fade-in">
                                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                                        <CheckCircle2 className="h-10 w-10" />
                                    </div>
                                    <div>
                                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 border border-emerald-200">
                                            <Check className="h-3 w-3" />
                                            <span>GENUINE GOVERNMENT CREDENTIAL</span>
                                        </span>
                                        <h5 className="mt-2 text-base font-extrabold text-ink">AMINI, KILA PETER</h5>
                                        <p className="text-xs font-mono text-muted-foreground">NID: PNG-2026-9042-8810</p>
                                    </div>

                                    {/* Verification metadata card */}
                                    <div className="rounded-xl border border-line bg-canvas p-3 text-left text-xs space-y-1.5 font-mono">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Status:</span>
                                            <span className="font-bold text-emerald-600">ACTIVE & VERIFIED</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Issued By:</span>
                                            <span className="text-ink">Civil & National Identity Authority</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Biometrics:</span>
                                            <span className="text-ink">10-Print Match (Score: 98.4%)</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Security Bar:</span>
                                            <span className="text-ink">ECC-256 P-256 Valid</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="border-t border-line pt-3 flex justify-end">
                            <button
                                type="button"
                                onClick={() => setVerificationModalOpen(false)}
                                className="rounded-xl bg-ink px-4 py-2 text-xs font-bold text-white transition hover:bg-black cursor-pointer"
                            >
                                Close Simulator
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
