import { Head, Link } from '@inertiajs/react';

export default function Audit({ events, funnel }: {
    events: { id: number; mode: string; result: string; verifier_ref: string | null; created_at: string; identity: { registrant: { demographic?: { full_name: string } | null } } }[];
    funnel: Record<string, number>;
}) {
    return (
        <>
            <Head title="Audit & reports" />
            <div className="min-h-screen bg-[#F7F5EF] px-4 py-8 text-[#14201B] sm:px-8">
                <div className="mx-auto max-w-4xl">
                    <div className="flex items-center justify-between">
                        <h1 className="text-2xl font-bold sm:text-3xl">Audit & reports</h1>
                        <a href="/admin/export.csv" className="rounded-md bg-[#0E2A26] px-3 py-1.5 text-sm text-white">Export CSV</a>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                        {Object.entries(funnel).map(([k, v]) => (
                            <div key={k} className="rounded-xl bg-white p-4 text-center shadow-sm">
                                <div className="text-2xl font-bold text-[#2FD6A3]">{v}</div>
                                <div className="text-xs capitalize text-[#14201B]/60">{k}</div>
                            </div>
                        ))}
                    </div>
                    <h2 className="mt-6 font-semibold">Auth events</h2>
                    <div className="mt-2 grid gap-2">
                        {events.length === 0 && <p className="text-sm text-[#14201B]/60">No verification events yet.</p>}
                        {events.map((e) => (
                            <div key={e.id} className="rounded-xl bg-white px-4 py-3 text-sm shadow-sm">
                                <strong>{e.result.toUpperCase()}</strong> · {e.mode} · {e.identity.registrant.demographic?.full_name ?? '—'}
                                <span className="ml-2 text-[#14201B]/50">{e.verifier_ref} · {new Date(e.created_at).toLocaleString()}</span>
                            </div>
                        ))}
                    </div>
                    <Link href="/admin/validation" className="mt-4 inline-block text-sm underline">← Validation queue</Link>
                </div>
            </div>
        </>
    );
}
