import { CalendarDays, ClipboardCheck, MapPin } from 'lucide-react';
import type { WalletAppointment } from '@/lib/api';

const TO_BRING = [
    'Your appointment code — show this app or a printout',
    'The original documents you uploaded (identity and address)',
    'Your mobile phone, in case a confirmation code is needed',
];

/** ISO timestamp → "Fri, 24 Oct 2026 · 09:30" in PNG local time. */
function formatSlot(value: string | null): string {
    if (!value) return '—';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;

    const day = date.toLocaleDateString('en-GB', {
        timeZone: 'Pacific/Port_Moresby',
        weekday: 'short',
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
    const time = date.toLocaleTimeString('en-GB', {
        timeZone: 'Pacific/Port_Moresby',
        hour: '2-digit',
        minute: '2-digit',
    });

    return `${day} · ${time}`;
}

/**
 * Spec §3.3 — the appointment slip: booked center, date + time slot and the
 * "what to bring" checklist for registration day.
 */
export default function AppointmentSlip({
    appointment,
}: {
    appointment: WalletAppointment;
}) {
    const address = [appointment.center_location, appointment.center_province]
        .filter(Boolean)
        .join(', ');

    return (
        <section className="mt-4 rounded-2xl bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-2">
                <h2 className="font-semibold">Registration appointment</h2>
                {appointment.status && (
                    <span className="rounded-full bg-[#2FD6A3]/20 px-2.5 py-0.5 text-xs font-semibold text-[#0E2A26] capitalize">
                        {appointment.status}
                    </span>
                )}
            </div>

            <div className="mt-3 space-y-2 text-sm">
                <p className="flex items-start gap-2">
                    <MapPin className="mt-0.5 size-4 shrink-0 text-[#0E2A26]/60" />
                    <span>
                        <span className="font-semibold">
                            {appointment.center ?? 'Registration center'}
                        </span>
                        {address && (
                            <span className="block text-[#14201B]/60">
                                {address}
                            </span>
                        )}
                    </span>
                </p>
                <p className="flex items-start gap-2">
                    <CalendarDays className="mt-0.5 size-4 shrink-0 text-[#0E2A26]/60" />
                    <span>{formatSlot(appointment.slot_at)}</span>
                </p>
            </div>

            <div className="mt-3 rounded-xl bg-[#14201B]/5 p-3">
                <p className="flex items-center gap-1.5 text-xs font-semibold tracking-wide text-[#14201B]/60 uppercase">
                    <ClipboardCheck className="size-3.5" />
                    What to bring
                </p>
                <ul className="mt-2 space-y-1.5 text-sm">
                    {TO_BRING.map((item) => (
                        <li key={item} className="flex gap-2">
                            <span className="text-[#0E2A26]/50">•</span>
                            <span>{item}</span>
                        </li>
                    ))}
                </ul>
            </div>

            {appointment.reference && (
                <p className="mt-3 text-xs break-all text-[#14201B]/50">
                    Appointment code:{' '}
                    <span className="font-mono">{appointment.reference}</span>
                </p>
            )}
        </section>
    );
}
