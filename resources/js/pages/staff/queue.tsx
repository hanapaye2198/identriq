import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Appointment {
    id: number;
    slot_at: string;
    status: string;
    registrant: { mobile: string; demographic?: { full_name: string } | null };
    center: { name: string };
}

interface Center {
    id: number;
    name: string;
}

export default function Queue({ date, centers, appointments, search, results, filter }: {
    date: string;
    centers: Center[];
    appointments: Appointment[];
    search: string;
    results: { id: number; mobile: string; demographic?: { full_name: string } | null }[];
    filter?: string;
}) {
    const [q, setQ] = useState(search);
    const [day, setDay] = useState(date);
    const [showWalkin, setShowWalkin] = useState(false);
    const [wName, setWName] = useState('');
    const [wMobile, setWMobile] = useState('+675');
    const [wCenter, setWCenter] = useState(centers[0]?.id ?? 0);

    return (
        <>
            <Head title="Staff queue" />
            <div className="min-h-screen bg-[#F7F5EF] px-4 py-8 text-[#14201B] sm:px-8">
                <div className="mx-auto max-w-5xl">
                    <div className="flex items-center justify-between">
                        <h1 className="text-2xl font-bold sm:text-3xl">
                            {filter === 'rework' ? 'Rework queue' : 'Today’s queue'}
                        </h1>
                        <div className="flex gap-2">
                            <Link href="/staff/rework" className="rounded-full border px-4 py-2 text-sm">Rework</Link>
                            <Link href="/staff/setup" className="rounded-full border px-4 py-2 text-sm">Setup</Link>
                        </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                        <Input type="date" value={day} onChange={(e) => { setDay(e.target.value); router.get('/staff', { date: e.target.value }); }} className="w-auto" />
                        <div className="flex gap-2">
                            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Name or mobile…" className="w-52" />
                            <Button onClick={() => router.get('/staff', { q })} variant="outline">Search</Button>
                        </div>
                        <Button onClick={() => setShowWalkin(!showWalkin)} className="bg-[#2FD6A3] text-[#0E2A26] hover:brightness-110">
                            + Walk-in
                        </Button>
                    </div>

                    {showWalkin && (
                        <div className="mt-4 grid gap-3 rounded-xl bg-white p-5 shadow-sm sm:grid-cols-4">
                            <div><Label>Name</Label><Input value={wName} onChange={(e) => setWName(e.target.value)} /></div>
                            <div><Label>Mobile</Label><Input value={wMobile} onChange={(e) => setWMobile(e.target.value)} /></div>
                            <div>
                                <Label>Center</Label>
                                <select value={wCenter} onChange={(e) => setWCenter(Number(e.target.value))} className="w-full rounded-md border px-3 py-2">
                                    {centers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                            <div className="flex items-end">
                                <Button onClick={() => router.post('/staff/walkin', { full_name: wName, mobile: wMobile, center_id: wCenter })} className="bg-[#0E2A26] text-white">
                                    Check in →
                                </Button>
                            </div>
                        </div>
                    )}

                    {results.length > 0 && (
                        <div className="mt-4 rounded-xl bg-white p-4 shadow-sm">
                            <h2 className="font-semibold">Search results</h2>
                            {results.map((r) => (
                                <p key={r.id} className="py-1 text-sm">{r.demographic?.full_name ?? '—'} · {r.mobile}</p>
                            ))}
                        </div>
                    )}

                    <div className="mt-4 grid gap-3">
                        {appointments.length === 0 && <p className="text-sm text-[#14201B]/60">Nothing here. Queue is clear.</p>}
                        {appointments.map((a) => (
                            <div key={a.id} className="flex flex-wrap items-center gap-3 rounded-xl bg-white p-4 shadow-sm">
                                <span className="text-sm font-medium">{new Date(a.slot_at).toLocaleString()}</span>
                                <span className="font-semibold">{a.registrant.demographic?.full_name ?? a.registrant.mobile}</span>
                                <span className="text-sm text-[#14201B]/60">{a.center.name}</span>
                                <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${a.status === 'completed' ? 'bg-[#2FD6A3]/20 text-[#0E2A26]' : a.status === 'rework' ? 'bg-amber-100 text-amber-800' : 'bg-[#14201B]/5'}`}>
                                    {a.status}
                                </span>
                                {['booked', 'checked-in'].includes(a.status) && (
                                    <Button
                                        onClick={() => a.status === 'booked'
                                            ? router.post(`/staff/appointments/${a.id}/checkin`)
                                            : router.visit(`/staff/capture/${a.id}`)}
                                        size="sm"
                                        className="ml-auto bg-[#0E2A26] text-white"
                                    >
                                        {a.status === 'booked' ? 'Check in' : 'Capture →'}
                                    </Button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
}
