import { Link, router } from '@inertiajs/react';

export interface AppointmentData {
    id?: number;
    qr_token?: string;
    slot_at?: string;
    reference_number?: string;
    status?: string;
    center?: {
        name: string;
        location: string;
    };
}

interface AppointmentConfirmationCardProps {
    appointment?: AppointmentData | null;
    qrSvg?: string | null;
    checklist?: string[];
}

export default function AppointmentConfirmationCard({
    appointment,
    qrSvg,
}: AppointmentConfirmationCardProps) {
    const slotDate = appointment?.slot_at ? new Date(appointment.slot_at) : new Date();
    const isDateValid = !isNaN(slotDate.getTime());

    const yyyy = isDateValid ? slotDate.getFullYear() : 2025;
    const mm = isDateValid ? String(slotDate.getMonth() + 1).padStart(2, '0') : '08';
    const dd = isDateValid ? String(slotDate.getDate()).padStart(2, '0') : '14';

    // Formatted reference number matching IDQ-YYYY-MMDD-NNNNNN
    const tokenHash = appointment?.qr_token
        ? Math.abs(appointment.qr_token.split('').reduce((acc, char) => (acc << 5) - acc + char.charCodeAt(0), 0)) % 1000000
        : 567;
    const idNum = String(appointment?.id ?? tokenHash).padStart(6, '0');
    const refNumber = appointment?.reference_number || `IDQ-${yyyy}-${mm}${dd}-${idNum}`;

    const formattedDate = isDateValid
        ? slotDate.toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
              year: 'numeric',
          })
        : 'Thursday, August 14, 2025';

    const endDate = isDateValid ? new Date(slotDate.getTime() + 20 * 60 * 1000) : new Date();
    const formatTimeStr = (d: Date) =>
        d.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
        });
    const formattedTime = isDateValid
        ? `${formatTimeStr(slotDate)} – ${formatTimeStr(endDate)}`
        : '1:20 PM – 1:40 PM';

    const centerName = appointment?.center?.name || 'Waigani Registration Center';
    const centerLocation =
        appointment?.center?.location || 'PNG Statistics Haus, Waigani, National Capital District (NCD)';

    return (
        <div className="w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            {/* Top Success Banner */}
            <div className="flex items-start gap-3.5 border-b border-[#D1E7DD] bg-[#EAF5EE] px-6 py-4">
                <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-[#0E7A4A] text-white shadow-xs">
                    <svg className="size-4" viewBox="0 0 20 20" fill="currentColor">
                        <path
                            fillRule="evenodd"
                            d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                            clipRule="evenodd"
                        />
                    </svg>
                </div>
                <div>
                    <h3 className="text-base font-bold leading-snug text-[#0E7A4A]">
                        Your appointment has been successfully booked!
                    </h3>
                    <p className="mt-0.5 text-sm font-normal text-slate-600">
                        Please save your registration details and QR code. You will need this upon arrival at the
                        registration center.
                    </p>
                </div>
            </div>

            {/* Booking Details & QR Code */}
            <div className="flex flex-col items-stretch justify-between gap-6 p-6 sm:p-8 md:flex-row md:gap-8">
                <div className="flex-1 space-y-3.5">
                    <h3 className="mb-3 text-lg font-bold text-[#0F2644]">Booking Details</h3>

                    <div className="flex items-baseline text-sm">
                        <span className="w-44 shrink-0 font-medium text-slate-500">Reference Number</span>
                        <span className="mr-4 font-medium text-slate-400">:</span>
                        <span className="font-bold tracking-wide text-[#0F2644]">{refNumber}</span>
                    </div>

                    <div className="flex items-baseline text-sm">
                        <span className="w-44 shrink-0 font-medium text-slate-500">Appointment Date</span>
                        <span className="mr-4 font-medium text-slate-400">:</span>
                        <span className="font-bold text-[#0F2644]">{formattedDate}</span>
                    </div>

                    <div className="flex items-baseline text-sm">
                        <span className="w-44 shrink-0 font-medium text-slate-500">Appointment Time</span>
                        <span className="mr-4 font-medium text-slate-400">:</span>
                        <span className="font-bold text-[#0F2644]">{formattedTime}</span>
                    </div>

                    <div className="flex items-start text-sm">
                        <span className="w-44 shrink-0 pt-0.5 font-medium text-slate-500">Registration Center</span>
                        <span className="mr-4 pt-0.5 font-medium text-slate-400">:</span>
                        <div className="flex-1">
                            <p className="font-bold text-[#0F2644]">{centerName}</p>
                            <p className="mt-0.5 text-xs leading-relaxed text-slate-500">{centerLocation}</p>
                        </div>
                    </div>
                </div>

                {/* Vertical Divider & QR code */}
                <div className="flex shrink-0 flex-col items-center justify-center border-t border-slate-200 pt-4 md:w-64 md:border-t-0 md:border-l md:border-slate-200 md:pt-0 md:pl-8">
                    <div className="flex size-38 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-white p-2.5 shadow-xs">
                        {qrSvg ? (
                            <div
                                className="size-full [&>svg]:size-full [&>svg]:object-contain"
                                dangerouslySetInnerHTML={{ __html: qrSvg }}
                            />
                        ) : (
                            <svg className="size-full" viewBox="0 0 100 100" fill="currentColor">
                                <rect width="100" height="100" fill="white" />
                                <path
                                    d="M10 10h30v30h-30zM15 15v20h20v-20zM20 20h10v10h-10zM60 10h30v30h-30zM65 15v20h20v-20zM70 20h10v10h-10zM10 60h30v30h-30zM15 65v20h20v-20zM20 70h10v10h-10zM45 10h10v10h-10zM45 25h10v15h-10zM45 45h10v10h-10zM60 45h15v10h-15zM80 45h10v15h-10zM60 60h10v15h-10zM75 60h15v10h-15zM65 75h10v15h-10zM80 80h10v10h-10zM45 65h10v25h-10zM25 45h15v10h-15zM10 45h10v10h-10z"
                                    fill="#0F2644"
                                />
                            </svg>
                        )}
                    </div>
                    <p className="mt-2.5 max-w-[190px] text-center text-xs font-medium leading-snug text-slate-500">
                        Present this QR code at the registration center.
                    </p>
                </div>
            </div>

            {/* Horizontal Divider */}
            <div className="border-t border-slate-200" />

            {/* Important Reminders */}
            <div className="p-6 sm:p-8">
                <h3 className="mb-4 text-lg font-bold text-[#0F2644]">Important Reminders</h3>
                <div className="space-y-3.5">
                    <div className="flex items-start gap-3">
                        <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[#EBF3FC] text-xs font-bold text-[#0052CC]">
                            1
                        </span>
                        <p className="pt-0.5 text-sm font-medium text-slate-700">
                            Arrive at least 10 minutes before your scheduled time.
                        </p>
                    </div>

                    <div className="flex items-start gap-3">
                        <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[#EBF3FC] text-xs font-bold text-[#0052CC]">
                            2
                        </span>
                        <div className="pt-0.5 text-sm">
                            <p className="font-medium text-slate-700">Bring the following original documents:</p>
                            <ul className="mt-1.5 space-y-1 pl-5 text-sm font-normal text-slate-600 list-disc">
                                <li>
                                    Primary ID (e.g., PNG Passport, Driver&apos;s License, NID (if available), or other
                                    accepted government IDs)
                                </li>
                                <li>
                                    Proof of Address (e.g., utility bill, bank statement, or other accepted documents)
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div className="flex items-start gap-3">
                        <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[#EBF3FC] text-xs font-bold text-[#0052CC]">
                            3
                        </span>
                        <p className="pt-0.5 text-sm font-medium text-slate-700">
                            Make sure your documents are clear, valid, and not expired.
                        </p>
                    </div>

                    <div className="flex items-start gap-3">
                        <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[#EBF3FC] text-xs font-bold text-[#0052CC]">
                            4
                        </span>
                        <p className="pt-0.5 text-sm font-medium text-slate-700">
                            At the registration center, your biometric data (fingerprints, photo, and signature) will be
                            captured.
                        </p>
                    </div>

                    <div className="flex items-start gap-3">
                        <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[#EBF3FC] text-xs font-bold text-[#0052CC]">
                            5
                        </span>
                        <p className="pt-0.5 text-sm font-medium text-slate-700">
                            You will receive a registration slip with a unique ID number. Keep this slip to track the
                            status of your application.
                        </p>
                    </div>

                    <div className="flex items-start gap-3">
                        <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[#EBF3FC] text-xs font-bold text-[#0052CC]">
                            6
                        </span>
                        <p className="pt-0.5 text-sm font-medium text-slate-700">
                            You can also view your appointment details and registration status by logging in to your
                            IDENTRIQ account.
                        </p>
                    </div>
                </div>
            </div>

            {/* Bottom Action Bar */}
            <div className="flex items-center justify-between border-t border-slate-200 bg-white px-6 py-4 sm:px-8 print:hidden">
                <button
                    type="button"
                    onClick={() => router.visit('/prereg/9')}
                    className="inline-flex items-center gap-2 rounded-lg border border-[#0052CC] bg-white px-6 py-2.5 text-sm font-semibold text-[#0052CC] shadow-xs transition hover:bg-blue-50/60 active:scale-[0.99]"
                >
                    <svg className="size-4" viewBox="0 0 20 20" fill="currentColor">
                        <path
                            fillRule="evenodd"
                            d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z"
                            clipRule="evenodd"
                        />
                    </svg>
                    Back
                </button>

                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={() => window.print()}
                        className="inline-flex items-center gap-2 rounded-lg border border-[#0052CC] bg-white px-5 py-2.5 text-sm font-semibold text-[#0052CC] shadow-xs transition hover:bg-blue-50/60 active:scale-[0.99]"
                    >
                        <svg className="size-4.5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 011.913-.247m10.5 0a48.536 48.536 0 00-10.5 0m10.5 0V3.75c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.533"
                            />
                        </svg>
                        Print Details
                    </button>

                    <Link
                        href="/track"
                        className="inline-flex items-center gap-2 rounded-lg bg-[#0052CC] px-6 py-2.5 text-sm font-semibold text-white shadow-xs transition hover:bg-[#0047B3] active:scale-[0.99]"
                    >
                        Finish
                        <svg className="size-4" viewBox="0 0 20 20" fill="currentColor">
                            <path
                                fillRule="evenodd"
                                d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z"
                                clipRule="evenodd"
                            />
                        </svg>
                    </Link>
                </div>
            </div>
        </div>
    );
}
