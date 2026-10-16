import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Identity {
    id: number;
    biosure_id_number: string | null;
    card_personalized_at: string | null;
    delivered_at: string | null;
    registrant: { demographic?: { full_name: string } | null };
}

export default function Issuance({ identities }: { identities: Identity[] }) {
    const [channels, setChannels] = useState<Record<number, string>>({});
    return (
        <>
            <Head title="Issuance" />
            <div className="min-h-screen bg-[#F7F5EF] px-4 py-8 text-[#14201B] sm:px-8">
                <div className="mx-auto max-w-4xl">
                    <div className="flex items-center justify-between">
                        <h1 className="text-2xl font-bold sm:text-3xl">Issuance & delivery</h1>
                        <Link href="/admin/audit" className="rounded-md bg-[#0E2A26] px-3 py-1.5 text-sm text-white">Audit →</Link>
                    </div>
                    <div className="mt-4 grid gap-3">
                        {identities.length === 0 && <p className="text-sm text-[#14201B]/60">Nothing approved yet.</p>}
                        {identities.map((i) => (
                            <div key={i.id} className="rounded-xl bg-white p-5 shadow-sm">
                                <p className="font-semibold">{i.registrant.demographic?.full_name ?? `#${i.id}`}</p>
                                {i.biosure_id_number ? (
                                    <p className="mt-1 font-mono text-xl font-bold text-[#C9A227]">{i.biosure_id_number}</p>
                                ) : (
                                    <Button onClick={() => router.post(`/admin/issuance/${i.id}/issue`)} className="mt-2 bg-[#2FD6A3] text-[#0E2A26] hover:brightness-110">
                                        Generate BIOSURE number
                                    </Button>
                                )}
                                {i.biosure_id_number && !i.delivered_at && (
                                    <div className="mt-3 flex gap-2">
                                        <Input
                                            placeholder="Delivery channel"
                                            value={channels[i.id] ?? ''}
                                            onChange={(e) => setChannels({ ...channels, [i.id]: e.target.value })}
                                            className="max-w-xs"
                                        />
                                        <Button onClick={() => router.post(`/admin/issuance/${i.id}/deliver`, { channel: channels[i.id] ?? 'Counter pickup' })} variant="outline">
                                            Mark delivered
                                        </Button>
                                    </div>
                                )}
                                {i.delivered_at && <p className="mt-1 text-sm text-[#14201B]/60">Delivered ✓</p>}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
}
