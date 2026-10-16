import { Head, router } from '@inertiajs/react';
import { Check, MapPin, Save, Settings } from 'lucide-react';
import { useState } from 'react';
import StaffLayout, { StaffStats } from '@/layouts/staff-layout';
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

export default function Setup({ centers, stats }: { centers: Center[]; stats?: StaffStats }) {
    const [cap, setCap] = useState<Record<number, number>>(
        Object.fromEntries(centers.map((c) => [c.id, c.daily_capacity]))
    );
    const [savedId, setSavedId] = useState<number | null>(null);

    function handleSave(id: number) {
        router.put(
            `/staff/setup/${id}`,
            { daily_capacity: cap[id] ?? 50 },
            {
                onSuccess: () => {
                    setSavedId(id);
                    setTimeout(() => setSavedId(null), 2500);
                },
            }
        );
    }

    return (
        <StaffLayout stats={stats}>
            <Head title="Center Setup &amp; Capacity · Staff Station" />

            <div className="p-6 sm:p-8">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-200 pb-5">
                    <div>
                        <div className="flex items-center gap-2.5">
                            <Settings className="size-6 text-[#0052CC]" />
                            <h1 className="text-2xl font-bold tracking-tight text-[#0F2644] sm:text-3xl">
                                Registration Center Operations &amp; Capacity
                            </h1>
                        </div>
                        <p className="mt-1 text-sm text-slate-500">
                            Configure daily appointment capacity limits for each in-person enrolment center across PNG.
                        </p>
                    </div>
                </div>

                {/* Centers Grid */}
                <div className="mt-6 grid gap-4">
                    {centers.map((c) => {
                        const isSaved = savedId === c.id;

                        return (
                            <div
                                key={c.id}
                                className="flex flex-col items-start justify-between gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-xs transition sm:flex-row sm:items-center"
                            >
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-base font-bold text-[#0F2644]">{c.name}</h3>
                                        <span
                                            className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                                                c.is_active
                                                    ? 'bg-emerald-50 text-emerald-700'
                                                    : 'bg-slate-100 text-slate-500'
                                            }`}
                                        >
                                            {c.is_active ? 'Active Desk' : 'Offline'}
                                        </span>
                                    </div>
                                    <p className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-500">
                                        <MapPin className="size-3 text-slate-400" />
                                        <span>{c.location}</span>
                                    </p>
                                </div>

                                <div className="flex w-full items-end gap-3 sm:w-auto">
                                    <div>
                                        <Label className="text-xs font-semibold text-slate-600">Daily Quota Capacity</Label>
                                        <Input
                                            type="number"
                                            min={1}
                                            max={1000}
                                            value={cap[c.id] ?? c.daily_capacity}
                                            onChange={(e) =>
                                                setCap({ ...cap, [c.id]: Number(e.target.value) })
                                            }
                                            className="mt-1 h-10 w-32 font-bold text-center border-slate-300"
                                        />
                                    </div>
                                    <Button
                                        onClick={() => handleSave(c.id)}
                                        className={`h-10 gap-1.5 rounded-xl px-5 font-semibold text-white shadow-xs transition ${
                                            isSaved
                                                ? 'bg-emerald-600 hover:bg-emerald-700'
                                                : 'bg-[#0052CC] hover:bg-[#0047B3]'
                                        }`}
                                    >
                                        {isSaved ? (
                                            <>
                                                <Check className="size-4" />
                                                <span>Saved!</span>
                                            </>
                                        ) : (
                                            <>
                                                <Save className="size-4" />
                                                <span>Save</span>
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </StaffLayout>
    );
}
