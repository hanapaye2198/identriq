import { Head, Link } from '@inertiajs/react';

interface Appointment {
    qr_token: string;
    slot_at: string;
    center: { name: string; location: string };
}

export default function Confirmation({
    appointment,
    qrSvg,
    checklist,
}: {
    appointment: Appointment;
    qrSvg: string;
    checklist: string[];
}) {
    return (
        <>
            <Head title="Pre-registration · Step 10 of 10 — Confirmed" />
            <div className="min-h-screen bg-[#F7F5EF] px-4 py-8 text-[#14201B] sm:px-8">
                <div className="mx-auto max-w-xl">
                    <div className="flex items-center justify-between">
                        <Link href="/" className="inline-flex items-center gap-1.5 text-sm font-medium text-[#14201B]/70 hover:text-[#0E2A26] hover:underline">
                            <span>←</span> Return to Home
                        </Link>
                        <span className="text-xs font-semibold uppercase tracking-wider text-[#0E2A26]/50">
                            Step 10 of 10 · Complete
                        </span>
                    </div>

                    <div className="mt-4 rounded-2xl border border-[#14201B]/10 bg-white p-6 text-center shadow-sm sm:p-8">
                        <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-[#2FD6A3] text-2xl font-bold text-[#0E2A26]">
                            ✓
                        </div>
                        <h1 className="mt-4 text-2xl font-bold tracking-tight text-[#0E2A26] sm:text-3xl">
                            Appointment Confirmed
                        </h1>
                        <p className="mt-1 text-sm font-medium text-[#14201B]/70">
                            Your in-person biometric capture is scheduled.
                        </p>

                        <div className="mt-5 rounded-xl border border-[#14201B]/10 bg-[#14201B]/[0.02] p-4 text-left">
                            <div className="grid gap-2 text-sm sm:grid-cols-2">
                                <div>
                                    <span className="text-xs font-semibold uppercase tracking-wider text-[#14201B]/50">Center</span>
                                    <p className="font-bold text-[#0E2A26]">{appointment.center.name}</p>
                                    <p className="text-xs text-[#14201B]/70">{appointment.center.location}</p>
                                </div>
                                <div>
                                    <span className="text-xs font-semibold uppercase tracking-wider text-[#14201B]/50">Scheduled Slot</span>
                                    <p className="font-bold text-[#0E2A26]">{new Date(appointment.slot_at).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</p>
                                    <p className="text-xs text-[#14201B]/70">{new Date(appointment.slot_at).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}</p>
                                </div>
                            </div>
                        </div>

                        <div className="mx-auto mt-6 w-52 rounded-xl border border-[#14201B]/10 bg-white p-3 shadow-sm [&>svg]:h-auto [&>svg]:w-full" dangerouslySetInnerHTML={{ __html: qrSvg }} />
                        <p className="mt-2 font-mono text-xs text-[#14201B]/60 break-all">
                            Token: <span className="font-semibold text-[#0E2A26]">{appointment.qr_token}</span>
                        </p>
                        <p className="mt-1 text-xs text-[#14201B]/50">
                            Present this QR token at the center desk for instant offline check-in.
                        </p>

                        <div className="mt-6 text-left">
                            <h2 className="text-xs font-bold uppercase tracking-wider text-[#0E2A26]">What to bring with you:</h2>
                            <ul className="mt-2 space-y-1.5 text-sm">
                                {checklist.map((c) => (
                                    <li key={c} className="flex items-center gap-2 rounded-lg bg-[#14201B]/[0.03] px-3 py-2 text-[#14201B]">
                                        <span className="text-[#2FD6A3] font-bold">✓</span> {c}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
                            <button
                                type="button"
                                onClick={() => window.print()}
                                className="h-11 flex-1 rounded-xl border border-[#14201B]/20 bg-white text-sm font-semibold text-[#14201B] hover:bg-[#14201B]/5"
                            >
                                ⎙ Print / Save PDF
                            </button>
                            <Link
                                href="/track"
                                className="inline-flex h-11 flex-1 items-center justify-center rounded-xl bg-[#2FD6A3] text-sm font-semibold text-[#0E2A26] transition hover:brightness-105"
                            >
                                Track Application Status
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
