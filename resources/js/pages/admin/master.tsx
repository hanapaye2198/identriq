import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Center {
    id: number;
    name: string;
    province: string;
    location: string;
    daily_capacity: number;
    is_active: boolean;
}

export default function Master({ centers }: { centers: Center[] }) {
    const [n, setN] = useState({ name: '', province: '', location: '', daily_capacity: 30 });
    return (
        <>
            <Head title="Master data" />
            <div className="min-h-screen bg-[#F7F5EF] px-4 py-8 text-[#14201B] sm:px-8">
                <div className="mx-auto max-w-4xl">
                    <Link href="/admin/validation" className="text-sm text-[#14201B]/60 hover:underline">← Validation</Link>
                    <h1 className="mt-2 text-2xl font-bold sm:text-3xl">Master data · centers</h1>
                    <div className="mt-4 grid gap-3">
                        {centers.map((c) => (
                            <div key={c.id} className="flex flex-wrap items-center gap-3 rounded-xl bg-white p-4 shadow-sm">
                                <span className="font-semibold">{c.name}</span>
                                <span className="text-sm text-[#14201B]/60">{c.location} · cap {c.daily_capacity} · {c.is_active ? 'active' : 'inactive'}</span>
                                <Button size="sm" variant="outline" className="ml-auto" onClick={() => router.put(`/admin/master/centers/${c.id}`, { is_active: !c.is_active })}>
                                    {c.is_active ? 'Deactivate' : 'Activate'}
                                </Button>
                            </div>
                        ))}
                    </div>
                    <div className="mt-4 grid gap-3 rounded-xl bg-white p-5 shadow-sm sm:grid-cols-2">
                        <div><Label>Name</Label><Input value={n.name} onChange={(e) => setN({ ...n, name: e.target.value })} /></div>
                        <div><Label>Province</Label><Input value={n.province} onChange={(e) => setN({ ...n, province: e.target.value })} /></div>
                        <div><Label>Location</Label><Input value={n.location} onChange={(e) => setN({ ...n, location: e.target.value })} /></div>
                        <div><Label>Daily capacity</Label><Input type="number" value={n.daily_capacity} onChange={(e) => setN({ ...n, daily_capacity: Number(e.target.value) })} /></div>
                        <Button onClick={() => router.post('/admin/master/centers', n)} className="bg-[#2FD6A3] text-[#0E2A26] hover:brightness-110 sm:col-span-2">
                            Add center
                        </Button>
                    </div>
                </div>
            </div>
        </>
    );
}
