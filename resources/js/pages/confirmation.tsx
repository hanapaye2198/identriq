import { Head, Link } from '@inertiajs/react';
import AppointmentConfirmationCard, { AppointmentData } from '@/components/appointment-confirmation-card';

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

export default function Confirmation({
    appointment,
    qrSvg,
    checklist,
}: {
    appointment: AppointmentData;
    qrSvg?: string;
    checklist?: string[];
}) {
    return (
        <>
            <Head title="Pre-registration · Step 10 of 10 — Confirmed" />
            <div className="min-h-screen bg-[#F7F5EF] px-4 py-8 text-[#14201B] sm:px-8">
                <div className="mx-auto max-w-4xl sm:max-w-5xl">
                    <div className="flex items-center justify-between">
                        <Link
                            href="/"
                            className="inline-flex items-center gap-1.5 text-sm font-medium text-[#14201B]/70 hover:text-[#0E2A26] hover:underline"
                        >
                            <span>←</span> Return to Home
                        </Link>
                        <span className="text-xs font-semibold uppercase tracking-wider text-[#0E2A26]/50">
                            PNG National ID
                        </span>
                    </div>

                    <div
                        className="mt-4 flex gap-1.5"
                        role="progressbar"
                        aria-valuenow={10}
                        aria-valuemin={1}
                        aria-valuemax={10}
                    >
                        {TITLES.map((t) => (
                            <div
                                key={t}
                                title={t}
                                className="h-2 flex-1 rounded-full bg-[#2FD6A3] transition-colors duration-300"
                            />
                        ))}
                    </div>

                    <div className="mt-2.5 mb-6 flex items-center justify-between text-xs text-[#14201B]/60 sm:text-sm">
                        <p className="font-medium">
                            Step 10 of 10 · <span className="font-semibold text-[#0E2A26]">Confirmation</span>
                        </p>
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
                            <span className="size-1.5 rounded-full bg-emerald-600"></span> Completed
                        </span>
                    </div>

                    <AppointmentConfirmationCard
                        appointment={appointment}
                        qrSvg={qrSvg}
                        checklist={checklist}
                    />
                </div>
            </div>
        </>
    );
}
