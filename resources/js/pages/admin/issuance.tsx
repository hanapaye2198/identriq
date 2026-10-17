import { Head, router } from '@inertiajs/react';
import {
    CreditCard,
    Maximize2,
    PackageCheck,
    Printer,
    Search,
    Send,
} from 'lucide-react';
import { useMemo, useState, type ComponentProps } from 'react';
import NationalIdCard from '@/components/national-id-card';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import AdminLayout, { type AdminStats } from '@/layouts/admin-layout';

interface IdentityItem {
    id: number;
    status: string;
    biosure_id_number: string | null;
    card_personalized_at: string | null;
    delivered_at: string | null;
    delivered_channel?: string | null;
    registrant: {
        id: number;
        mobile?: string;
        demographic?: {
            full_name: string;
            dob: string;
            gender?: string;
            province?: string;
        } | null;
    };
}

/** "1988-04-14" → "14 APR 1988"; unparseable values pass through untouched. */
function formatCardDate(
    value: string | Date | null | undefined,
): string | undefined {
    if (!value) return undefined;

    let date: Date;
    if (value instanceof Date) {
        date = value;
    } else {
        const parts = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
        date = parts
            ? new Date(Number(parts[1]), Number(parts[2]) - 1, Number(parts[3]))
            : new Date(value);
    }

    if (Number.isNaN(date.getTime())) {
        return typeof value === 'string' ? value : undefined;
    }

    return date
        .toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        })
        .toUpperCase();
}

/** "KUMAL, JOHN A." → "Kumal, John A." for the handwriting signature line. */
function titleCaseName(name: string): string {
    return name
        .toLowerCase()
        .split(' ')
        .map((word) =>
            word ? word.charAt(0).toUpperCase() + word.slice(1) : word,
        )
        .join(' ');
}

/** Compact metadata tile in the card inspection dialog. */
function MetaCell({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-xl border border-slate-200/80 bg-slate-50/70 px-3 py-2">
            <p className="text-[10px] font-semibold tracking-wide text-slate-500 uppercase">
                {label}
            </p>
            <p className="mt-0.5 text-xs leading-snug font-semibold text-[#0F2644]">
                {value}
            </p>
        </div>
    );
}

export default function Issuance({
    identities = [],
    stats,
}: {
    identities: IdentityItem[];
    stats?: AdminStats;
}) {
    const [search, setSearch] = useState('');
    const [filterTab, setFilterTab] = useState<
        'all' | 'needs_print' | 'needs_delivery' | 'delivered'
    >('all');
    const [channels, setChannels] = useState<Record<number, string>>({});
    const [processingId, setProcessingId] = useState<number | null>(null);

    const filteredIdentities = useMemo(() => {
        return identities.filter((i) => {
            const name =
                i.registrant.demographic?.full_name?.toLowerCase() || '';
            const idNum = i.biosure_id_number?.toLowerCase() || '';
            const query = search.toLowerCase();
            const matchesQuery =
                name.includes(query) ||
                idNum.includes(query) ||
                String(i.id).includes(query);

            if (!matchesQuery) return false;

            if (filterTab === 'needs_print') {
                return !i.biosure_id_number;
            }
            if (filterTab === 'needs_delivery') {
                return !!i.biosure_id_number && !i.delivered_at;
            }
            if (filterTab === 'delivered') {
                return !!i.delivered_at;
            }
            return true;
        });
    }, [identities, search, filterTab]);

    const handleIssue = (identityId: number) => {
        setProcessingId(identityId);
        router.post(
            `/admin/issuance/${identityId}/issue`,
            {},
            {
                onFinish: () => setProcessingId(null),
            },
        );
    };

    const handleDeliver = (identityId: number) => {
        const channel = channels[identityId] || 'Counter pickup at center';
        setProcessingId(identityId);
        router.post(
            `/admin/issuance/${identityId}/deliver`,
            { channel },
            {
                onFinish: () => setProcessingId(null),
            },
        );
    };

    const totalApproved = identities.length;
    const personalizedCount = identities.filter(
        (i) => !!i.biosure_id_number,
    ).length;
    const deliveredCount = identities.filter((i) => !!i.delivered_at).length;
    const pendingPersonalization = identities.filter(
        (i) => !i.biosure_id_number,
    ).length;

    return (
        <AdminLayout
            title="Credential Issuance & Smart Card Personalization"
            stats={stats}
            actions={
                <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold text-slate-500">
                        {totalApproved} Total Verified Citizens
                    </span>
                </div>
            }
        >
            <Head title="Issuance & Card Printing — IDENTRIQ Admin" />

            {/* Quick Metrics Bar */}
            <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
                    <span className="text-xs font-medium text-slate-500">
                        Approved Citizens
                    </span>
                    <p className="mt-1 text-2xl font-bold text-[#0F2644]">
                        {totalApproved}
                    </p>
                </div>
                <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-4 shadow-xs">
                    <span className="text-xs font-medium text-amber-800">
                        Needs BioSure ID
                    </span>
                    <p className="mt-1 text-2xl font-bold text-amber-700">
                        {pendingPersonalization}
                    </p>
                </div>
                <div className="rounded-2xl border border-blue-200 bg-blue-50/50 p-4 shadow-xs">
                    <span className="text-xs font-medium text-[#0052CC]">
                        Cards Personalized
                    </span>
                    <p className="mt-1 text-2xl font-bold text-[#0052CC]">
                        {personalizedCount}
                    </p>
                </div>
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4 shadow-xs">
                    <span className="text-xs font-medium text-emerald-800">
                        Delivered
                    </span>
                    <p className="mt-1 text-2xl font-bold text-emerald-700">
                        {deliveredCount}
                    </p>
                </div>
            </div>

            {/* Controls Bar */}
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
                <div className="relative w-full max-w-sm">
                    <Search className="absolute top-2.5 left-3 size-4 text-slate-400" />
                    <Input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search citizen or BioSure ID..."
                        className="h-10 rounded-xl border-slate-200 pl-9 text-sm focus:border-[#0052CC]"
                    />
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-semibold">
                    <button
                        type="button"
                        onClick={() => setFilterTab('all')}
                        className={`rounded-lg px-3 py-1.5 transition ${
                            filterTab === 'all'
                                ? 'bg-[#0052CC] text-white shadow-xs'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                    >
                        All ({totalApproved})
                    </button>
                    <button
                        type="button"
                        onClick={() => setFilterTab('needs_print')}
                        className={`rounded-lg px-3 py-1.5 transition ${
                            filterTab === 'needs_print'
                                ? 'bg-[#0052CC] text-white shadow-xs'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                    >
                        Needs Personalization ({pendingPersonalization})
                    </button>
                    <button
                        type="button"
                        onClick={() => setFilterTab('needs_delivery')}
                        className={`rounded-lg px-3 py-1.5 transition ${
                            filterTab === 'needs_delivery'
                                ? 'bg-[#0052CC] text-white shadow-xs'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                    >
                        Ready for Delivery ({personalizedCount - deliveredCount}
                        )
                    </button>
                    <button
                        type="button"
                        onClick={() => setFilterTab('delivered')}
                        className={`rounded-lg px-3 py-1.5 transition ${
                            filterTab === 'delivered'
                                ? 'bg-[#0052CC] text-white shadow-xs'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                    >
                        Delivered ({deliveredCount})
                    </button>
                </div>
            </div>

            {/* Identities Card Grid */}
            <div className="space-y-4">
                {filteredIdentities.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
                        <CreditCard className="mx-auto size-10 text-slate-300" />
                        <h3 className="mt-3 text-sm font-bold text-[#0F2644]">
                            No Records Match Filter
                        </h3>
                        <p className="mt-1 text-xs text-slate-500">
                            Approved citizen identities awaiting card
                            personalization or dispatch will appear here.
                        </p>
                    </div>
                ) : (
                    filteredIdentities.map((item) => {
                        const name =
                            item.registrant.demographic?.full_name ??
                            `Applicant #${item.id}`;
                        const dob = item.registrant.demographic?.dob ?? '—';
                        const isPersonalized = !!item.biosure_id_number;
                        const isDelivered = !!item.delivered_at;
                        const rawGender =
                            item.registrant.demographic?.gender?.trim();
                        const sex = rawGender
                            ? rawGender.charAt(0).toUpperCase()
                            : '—';
                        const personalizedAt = item.card_personalized_at
                            ? new Date(item.card_personalized_at)
                            : null;
                        const cardExpiry = personalizedAt
                            ? formatCardDate(
                                  new Date(
                                      personalizedAt.getFullYear() + 10,
                                      personalizedAt.getMonth(),
                                      personalizedAt.getDate(),
                                  ),
                              )
                            : undefined;

                        const cardProps: ComponentProps<typeof NationalIdCard> =
                            {
                                fullName: name,
                                idNumber:
                                    item.biosure_id_number ??
                                    'PENDING PERSONALIZATION',
                                dateOfBirth: formatCardDate(dob) ?? '—',
                                sex,
                                expiryDate: cardExpiry,
                                signatureName: titleCaseName(name),
                            };
                        const cardStatus = isDelivered
                            ? 'Delivered & activated'
                            : isPersonalized
                              ? 'Personalized'
                              : 'Pending personalization';

                        return (
                            <div
                                key={item.id}
                                className="flex flex-col gap-6 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs transition hover:border-slate-300 md:flex-row md:items-center md:justify-between"
                            >
                                {/* Left: Citizen Dossier Info */}
                                <div className="space-y-2 md:max-w-md">
                                    <div className="flex items-center gap-2.5">
                                        <div className="flex size-10 items-center justify-center rounded-xl bg-blue-50 font-bold text-[#0052CC]">
                                            {name
                                                .split(' ')
                                                .map((w) => w[0])
                                                .slice(0, 2)
                                                .join('')}
                                        </div>
                                        <div>
                                            <h3 className="text-base font-bold text-[#0F2644]">
                                                {name}
                                            </h3>
                                            <p className="text-xs text-slate-500">
                                                DOB:{' '}
                                                {formatCardDate(dob) ?? dob} ·
                                                Registrant #{item.registrant.id}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Smart card preview — click to inspect at full size */}
                                    <Dialog>
                                        <DialogTrigger asChild>
                                            <button
                                                type="button"
                                                aria-label={`Inspect the national ID card for ${name}`}
                                                className="group/card relative block w-full max-w-[360px] cursor-zoom-in rounded-xl text-left focus-visible:ring-2 focus-visible:ring-[#0052CC]/70 focus-visible:ring-offset-2 focus-visible:outline-none"
                                            >
                                                <NationalIdCard
                                                    {...cardProps}
                                                />
                                                <span className="absolute -top-2 -right-2 z-10 flex size-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-md transition group-hover/card:border-[#0052CC] group-hover/card:text-[#0052CC] group-focus-visible/card:border-[#0052CC] group-focus-visible/card:text-[#0052CC]">
                                                    <Maximize2 className="size-3.5" />
                                                </span>
                                            </button>
                                        </DialogTrigger>
                                        <DialogContent className="max-h-[calc(100dvh-2rem)] w-full max-w-[calc(100vw-2rem)] gap-4 overflow-y-auto rounded-2xl border-slate-200/80 bg-white p-5 shadow-2xl sm:max-w-[900px]">
                                            <DialogHeader>
                                                <DialogTitle className="text-base font-bold text-[#0F2644]">
                                                    Card Inspection — {name}
                                                </DialogTitle>
                                                <DialogDescription className="text-xs text-slate-500">
                                                    Canonical PNG National
                                                    Identity Card template ·
                                                    BioSure ID{' '}
                                                    {item.biosure_id_number ??
                                                        'not yet minted'}{' '}
                                                    · {cardStatus}
                                                </DialogDescription>
                                            </DialogHeader>

                                            <div className="mx-auto w-full max-w-[min(840px,calc((100dvh_-_19rem)*1.586))]">
                                                <NationalIdCard
                                                    {...cardProps}
                                                />
                                            </div>

                                            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                                                <MetaCell
                                                    label="Date of Birth"
                                                    value={
                                                        cardProps.dateOfBirth ??
                                                        '—'
                                                    }
                                                />
                                                <MetaCell
                                                    label="Sex"
                                                    value={sex}
                                                />
                                                <MetaCell
                                                    label="Card Expiry"
                                                    value={
                                                        cardExpiry ??
                                                        'Ten years after personalization'
                                                    }
                                                />
                                                <MetaCell
                                                    label="Personalized"
                                                    value={
                                                        item.card_personalized_at
                                                            ? new Date(
                                                                  item.card_personalized_at,
                                                              ).toLocaleDateString()
                                                            : 'Awaiting'
                                                    }
                                                />
                                            </div>
                                        </DialogContent>
                                    </Dialog>
                                </div>

                                {/* Right: Action Cockpit */}
                                <div className="flex flex-col items-start gap-3 md:items-end md:justify-end">
                                    {!isPersonalized ? (
                                        <div className="space-y-1 text-left md:text-right">
                                            <Button
                                                onClick={() =>
                                                    handleIssue(item.id)
                                                }
                                                disabled={
                                                    processingId === item.id
                                                }
                                                className="h-10 gap-2 rounded-xl bg-[#0052CC] px-5 font-semibold text-white shadow-xs hover:bg-[#0047B3]"
                                            >
                                                <Printer className="size-4" />
                                                {processingId === item.id
                                                    ? 'Personalizing...'
                                                    : 'Personalize BioSure ID'}
                                            </Button>
                                            <p className="text-[11px] text-slate-400">
                                                Generates permanent sovereign ID
                                                & signs card token
                                            </p>
                                        </div>
                                    ) : !isDelivered ? (
                                        <div className="space-y-2 text-left md:text-right">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <select
                                                    value={
                                                        channels[item.id] ??
                                                        'Counter pickup at center'
                                                    }
                                                    onChange={(e) =>
                                                        setChannels({
                                                            ...channels,
                                                            [item.id]:
                                                                e.target.value,
                                                        })
                                                    }
                                                    className="h-10 rounded-xl border border-slate-300 bg-white px-3 text-xs font-medium text-slate-700 focus:border-[#0052CC]"
                                                >
                                                    <option value="Counter pickup at center">
                                                        Counter Pickup (Center)
                                                    </option>
                                                    <option value="Post PNG Courier Express">
                                                        Post PNG Express
                                                        Delivery
                                                    </option>
                                                    <option value="Provincial Ward LLG Dispatch">
                                                        Provincial Ward Dispatch
                                                    </option>
                                                </select>

                                                <Button
                                                    onClick={() =>
                                                        handleDeliver(item.id)
                                                    }
                                                    disabled={
                                                        processingId === item.id
                                                    }
                                                    variant="outline"
                                                    className="h-10 gap-1.5 rounded-xl border-[#0052CC] text-xs font-semibold text-[#0052CC] hover:bg-blue-50"
                                                >
                                                    <Send className="size-3.5" />
                                                    {processingId === item.id
                                                        ? 'Marking...'
                                                        : 'Mark Delivered'}
                                                </Button>
                                            </div>
                                            <p className="text-[11px] text-slate-400">
                                                Personalized at{' '}
                                                {new Date(
                                                    item.card_personalized_at!,
                                                ).toLocaleDateString()}
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-left md:text-right">
                                            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800">
                                                <PackageCheck className="size-4 text-emerald-600" />
                                                <span>
                                                    Delivered & Activated
                                                </span>
                                            </div>
                                            <p className="mt-0.5 text-[11px] text-emerald-700">
                                                Channel:{' '}
                                                {item.delivered_channel ??
                                                    'Counter pickup'}{' '}
                                                ·{' '}
                                                {new Date(
                                                    item.delivered_at!,
                                                ).toLocaleDateString()}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </AdminLayout>
    );
}
