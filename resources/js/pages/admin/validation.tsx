import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface CaseItem {
    id: number;
    status: string;
    demographic?: { full_name: string; dob: string } | null;
    documents: { doc_type: string; verified_status: string }[];
}

interface Match {
    id: number;
    name: string;
    dob: string;
    score: number;
}

export default function Validation({ cases, active, matches }: {
    cases: CaseItem[];
    active?: (CaseItem & { appointments: { status: string }[] }) | null;
    matches?: Match[];
}) {
    const [reason, setReason] = useState('');
    return (
        <>
            <Head title="Validation queue" />
            <div className="min-h-screen bg-[#F7F5EF] px-4 py-8 text-[#14201B] sm:px-8">
                <div className="mx-auto max-w-6xl">
                    <div className="flex items-center justify-between">
                        <h1 className="text-2xl font-bold sm:text-3xl">Validation queue</h1>
                        <div className="flex gap-2">
                            <Button onClick={() => router.post('/admin/advance')} variant="outline" size="sm">
                                Advance clean cases
                            </Button>
                            <Link href="/admin/issuance" className="rounded-md bg-[#0E2A26] px-3 py-1.5 text-sm text-white">Issuance →</Link>
                        </div>
                    </div>
                    <div className="mt-4 grid gap-4 lg:grid-cols-2">
                        <div className="grid content-start gap-2">
                            {cases.length === 0 && <p className="text-sm text-[#14201B]/60">Queue clear.</p>}
                            {cases.map((c) => (
                                <button
                                    key={c.id}
                                    type="button"
                                    onClick={() => router.get(`/admin/validation/${c.id}`)}
                                    className={`rounded-xl p-4 text-left shadow-sm ${active?.id === c.id ? 'bg-[#2FD6A3]/15 ring-2 ring-[#2FD6A3]' : 'bg-white'}`}
                                >
                                    <span className="font-semibold">{c.demographic?.full_name ?? `#${c.id}`}</span>
                                    <span className="ml-2 rounded-full bg-[#14201B]/5 px-2 py-0.5 text-xs">{c.status}</span>
                                </button>
                            ))}
                        </div>
                        <div>
                            {!active && <p className="text-sm text-[#14201B]/60">Select a case to review.</p>}
                            {active && (
                                <div className="rounded-xl bg-white p-5 shadow-sm">
                                    <h2 className="font-bold">{active.demographic?.full_name}</h2>
                                    <p className="text-sm text-[#14201B]/60">DOB {active.demographic?.dob} · {active.documents.length} documents</p>
                                    <ul className="mt-2 space-y-1 text-sm">
                                        {active.documents.map((d, i) => (
                                            <li key={i} className="rounded bg-[#14201B]/5 px-2 py-1">{d.doc_type} ({d.verified_status})</li>
                                        ))}
                                    </ul>
                                    {(matches ?? []).length > 0 && (
                                        <div className="mt-3 rounded-lg bg-amber-50 p-3">
                                            <h3 className="text-sm font-semibold">Duplicate candidates</h3>
                                            {matches!.map((m) => (
                                                <div key={m.id} className="mt-1 flex items-center gap-2 text-sm">
                                                    <span>{m.name} · {m.dob} · <strong>{m.score}%</strong></span>
                                                    <Button size="sm" variant="outline" onClick={() => router.post(`/admin/validation/${active.id}/merge`, { loser_id: m.id })}>
                                                        Merge (fail #{m.id})
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    <Input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Reason (for rejection)" className="mt-3" />
                                    <div className="mt-2 flex gap-2">
                                        <Button onClick={() => router.post(`/admin/validation/${active.id}/decide`, { decision: 'approved' })} className="bg-[#2FD6A3] text-[#0E2A26] hover:brightness-110">
                                            Approve
                                        </Button>
                                        <Button onClick={() => router.post(`/admin/validation/${active.id}/decide`, { decision: 'failed', reason })} variant="destructive">
                                            Reject
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
