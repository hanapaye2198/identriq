import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Center {
    id: number;
    name: string;
    location: string;
    daily_capacity: number;
    is_active: boolean;
}

export default function Setup({ centers }: { centers: Center[] }) {
    const [cap, setCap] = useState<Record<number, number>>(
        Object.fromEntries(centers.map((c) => [c.id, c.daily_capacity]))
    );
    return (
        <>
            <Head title="Center setup" />
            <div className="min-h-screen bg-[#F7F5EF] px-4 py-8 text-[#14201B] sm:px-8">
                <div className="mx-auto max-w-3xl">
                    <Link href="/staff" className="text-sm text-[#14201B]/60 hover:underline">← Queue</Link>
                    <h1 className="mt-2 text-2xl font-bold sm:text-3xl">Center setup</h1>
                    <p className="mt-1 text-sm text-[#14201B]/60">Capacity changes apply to the public slot picker immediately.</p>
                    <div className="mt-4 grid gap-3">
                        {centers.map((c) => (
                            <div key={c.id} className="rounded-xl bg-white p-4 shadow-sm">
                                <h2 className="font-semibold">{c.name} <span className="font-normal text-[#14201B]/50">· {c.location}</span></h2>
                                <div className="mt-3 flex items-end gap-3">
                                    <div>
                                        <Label>Daily capacity</Label>
                                        <Input type="number" min={1} max={1000} value={cap[c.id] ?? c.daily_capacity} onChange={(e) => setCap({ ...cap, [c.id]: Number(e.target.value) })} className="w-28" />
                                    </div>
                                    <Button onClick={() => router.put(`/staff/setup/${c.id}`, { daily_capacity: cap[c.id] ?? c.daily_capacity })} className="bg-[#0E2A26] text-white">
                                        Save
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
}
