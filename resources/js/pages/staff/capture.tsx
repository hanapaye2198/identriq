import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Doc {
    id: number;
    category: string;
    doc_type: string;
    verified_status: string;
}

interface Appointment {
    id: number;
    registrant: {
        mobile: string;
        demographic?: Record<string, string> | null;
        documents: Doc[];
    };
    center: { name: string };
}

export default function Capture({ appointment }: { appointment: Appointment }) {
    const [photo, setPhoto] = useState<File | null>(null);
    const [fp, setFp] = useState('');
    const [iris, setIris] = useState('');
    const [docs, setDocs] = useState<Record<number, { status: string; note: string }>>(
        Object.fromEntries(appointment.registrant.documents.map((d) => [d.id, { status: 'accepted', note: '' }]))
    );
    const [attest, setAttest] = useState(false);
    const demo = appointment.registrant.documents;

    function submit() {
        const fd = new FormData();
        if (photo) fd.append('photo', photo);
        if (fp) fd.append('fingerprint_ref', fp);
        if (iris) fd.append('iris_ref', iris);
        Object.entries(docs).forEach(([id, v]) => {
            fd.append(`documents[${id}][status]`, v.status);
            fd.append(`documents[${id}][note]`, v.note);
        });
        fd.append('attest', attest ? '1' : '0');
        router.post(`/staff/capture/${appointment.id}`, fd, { forceFormData: true });
    }

    return (
        <>
            <Head title="Live capture" />
            <div className="min-h-screen bg-[#F7F5EF] px-4 py-8 text-[#14201B] sm:px-8">
                <div className="mx-auto max-w-5xl">
                    <Link href="/staff" className="text-sm text-[#14201B]/60 hover:underline">← Queue</Link>
                    <h1 className="mt-2 text-2xl font-bold sm:text-3xl">Live capture · {appointment.center.name}</h1>
                    <div className="mt-4 grid gap-4 lg:grid-cols-2">
                        <div className="rounded-xl bg-white p-5 shadow-sm">
                            <h2 className="font-semibold">Pre-registration draft (read-only)</h2>
                            <dl className="mt-3 space-y-1 text-sm">
                                <div className="flex justify-between"><dt className="text-[#14201B]/60">Name</dt><dd className="font-medium">{appointment.registrant.demographic?.full_name ?? '—'}</dd></div>
                                <div className="flex justify-between"><dt className="text-[#14201B]/60">Mobile</dt><dd className="font-medium">{appointment.registrant.mobile}</dd></div>
                                <div className="flex justify-between"><dt className="text-[#14201B]/60">DOB</dt><dd className="font-medium">{appointment.registrant.demographic?.dob ?? '—'}</dd></div>
                                <div className="flex justify-between"><dt className="text-[#14201B]/60">Address</dt><dd className="font-medium">{[appointment.registrant.demographic?.village, appointment.registrant.demographic?.province].filter(Boolean).join(', ') || '—'}</dd></div>
                            </dl>
                        </div>
                        <div className="rounded-xl bg-white p-5 shadow-sm">
                            <h2 className="font-semibold">Capture</h2>
                            <div className="mt-3 grid gap-3">
                                <div><Label>Photo (webcam / file stub)</Label><Input type="file" accept="image/*" onChange={(e) => setPhoto(e.target.files?.[0] ?? null)} /></div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div><Label>Fingerprint ref <span className="text-xs text-[#14201B]/50">(simulated)</span></Label><Input value={fp} onChange={(e) => setFp(e.target.value)} placeholder="FP-…" /></div>
                                    <div><Label>Iris ref <span className="text-xs text-[#14201B]/50">(simulated)</span></Label><Input value={iris} onChange={(e) => setIris(e.target.value)} placeholder="IRIS-…" /></div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="mt-4 rounded-xl bg-white p-5 shadow-sm">
                        <h2 className="font-semibold">Document verification</h2>
                        <div className="mt-3 grid gap-2">
                            {demo.map((d) => (
                                <div key={d.id} className="flex flex-wrap items-center gap-2 rounded-lg bg-[#14201B]/5 px-3 py-2 text-sm">
                                    <span className="font-medium">{d.category} · {d.doc_type}</span>
                                    <select
                                        value={docs[d.id]?.status ?? 'accepted'}
                                        onChange={(e) => setDocs({ ...docs, [d.id]: { ...docs[d.id], status: e.target.value } })}
                                        className="ml-auto rounded-md border px-2 py-1"
                                    >
                                        <option value="accepted">Accept</option>
                                        <option value="rejected">Reject</option>
                                    </select>
                                    <Input
                                        placeholder="Reason (if rejected)"
                                        value={docs[d.id]?.note ?? ''}
                                        onChange={(e) => setDocs({ ...docs, [d.id]: { ...docs[d.id], note: e.target.value } })}
                                        className="w-48"
                                    />
                                </div>
                            ))}
                        </div>
                        <label className="mt-4 flex items-center gap-2 text-sm">
                            <input type="checkbox" checked={attest} onChange={(e) => setAttest(e.target.checked)} className="size-4" />
                            I attest this capture was performed in person at this center.
                        </label>
                        <Button onClick={submit} disabled={!attest} className="mt-3 bg-[#2FD6A3] text-[#0E2A26] hover:brightness-110 disabled:opacity-40">
                            Submit to validation →
                        </Button>
                    </div>
                </div>
            </div>
        </>
    );
}
