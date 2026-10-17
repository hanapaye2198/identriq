import { Head, Link } from '@inertiajs/react';

interface Center {
    id: number;
    name: string;
    province: string;
    location: string;
    daily_capacity: number;
}

export default function Centers({ centers }: { centers: Center[] }) {
    return (
        <>
            <Head title="Find a registration center" />
            <div className="min-h-screen bg-[#F7F5EF] px-4 py-10 text-[#14201B] sm:px-8">
                <div className="mx-auto max-w-4xl">
                    <Link href="/" className="text-sm text-[#14201B]/60 hover:underline">← Home</Link>
                    <h1 className="mt-2 text-3xl font-bold">Registration centers</h1>
                    <div className="mt-6 grid gap-4 sm:grid-cols-2">
                        {centers.map((c) => (
                            <div key={c.id} className="rounded-xl bg-white p-5 shadow-sm">
                                <h2 className="font-semibold">{c.name}</h2>
                                <p className="mt-1 text-sm text-[#14201B]/70">{c.location}, {c.province}</p>
                                <p className="mt-1 text-sm text-[#14201B]/70">Capacity: {c.daily_capacity}/day</p>
                                <Link
                                    href={`/prereg/8?center=${c.id}`}
                                    className="mt-3 inline-block rounded-xl bg-[#0052CC] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#0047B3]"
                                >
                                    Book here
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
}
