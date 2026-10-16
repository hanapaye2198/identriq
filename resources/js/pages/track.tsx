import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface TimelineItem {
    stage: string;
    at: string | null;
    done: boolean;
}

interface Result {
    registrant: {
        mobile: string;
        status: string;
        appointments: { slot_at: string; status: string; center?: { name: string } }[];
        identity?: { biosure_id_number: string | null; status: string } | null;
        notifications: { title: string; body: string; sent_at: string | null }[];
    };
    timeline: TimelineItem[];
}

export default function Track({ result }: { result: Result | null }) {
    const [mobile, setMobile] = useState('');
    const [qrToken, setQrToken] = useState('');
    return (
        <>
            <Head title="Track application" />
            <div className="min-h-screen bg-[#F7F5EF] px-4 py-10 text-[#14201B] sm:px-8">
                <div className="mx-auto max-w-2xl">
                    <Link href="/" className="text-sm text-[#14201B]/60 hover:underline">← Home</Link>
                    <h1 className="mt-2 text-3xl font-bold">Track your application</h1>
                    <div className="mt-4 grid gap-3 rounded-xl bg-white p-5 shadow-sm sm:grid-cols-2">
                        <div>
                            <Label>Mobile number</Label>
                            <Input value={mobile} onChange={(e) => setMobile(e.target.value)} placeholder="+675…" />
                        </div>
                        <div>
                            <Label>…or QR reference</Label>
                            <Input value={qrToken} onChange={(e) => setQrToken(e.target.value)} placeholder="qr token" />
                        </div>
                        <Button onClick={() => router.post('/track/lookup', { mobile, qr_token: qrToken })} className="bg-[#2FD6A3] text-[#0E2A26] hover:brightness-110 sm:col-span-2">
                            Look up
                        </Button>
                    </div>

                    {result && (
                        <div className="mt-6 rounded-xl bg-white p-5 shadow-sm">
                            <p className="text-sm text-[#14201B]/60">Status: <strong className="text-[#14201B]">{result.registrant.status}</strong></p>
                            {result.registrant.identity?.biosure_id_number && (
                                <p className="mt-1 font-mono text-lg font-bold text-[#C9A227]">{result.registrant.identity.biosure_id_number}</p>
                            )}
                            <ol className="mt-4 space-y-2">
                                {result.timeline.map((t) => (
                                    <li key={t.stage} className="flex items-center gap-3 text-sm">
                                        <span className={`flex size-6 items-center justify-center rounded-full text-xs font-bold ${t.done ? 'bg-[#2FD6A3] text-[#0E2A26]' : 'bg-[#14201B]/10 text-[#14201B]/40'}`}>
                                            {t.done ? '✓' : '·'}
                                        </span>
                                        <span className="capitalize">{t.stage}</span>
                                        {t.at && <span className="ml-auto text-[#14201B]/50">{new Date(t.at).toLocaleDateString()}</span>}
                                    </li>
                                ))}
                            </ol>
                            {result.registrant.notifications.length > 0 && (
                                <div className="mt-4">
                                    <h2 className="font-semibold">Notifications</h2>
                                    <ul className="mt-2 space-y-1 text-sm">
                                        {result.registrant.notifications.map((n, i) => (
                                            <li key={i} className="rounded-lg bg-[#14201B]/5 px-3 py-2">
                                                <strong>{n.title}:</strong> {n.body}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
