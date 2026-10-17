import { Head, Link, router } from '@inertiajs/react';
import {
    AlertTriangle,
    Calendar,
    Camera,
    CheckCircle2,
    Clock,
    MapPin,
    Phone,
    Search,
    UserCheck,
    Users,
    X,
} from 'lucide-react';
import { useState } from 'react';
import StaffLayout, { StaffStats } from '@/layouts/staff-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Appointment {
    id: number;
    slot_at: string;
    status: string;
    qr_token?: string;
    registrant: {
        id: number;
        mobile: string;
        demographic?: {
            full_name?: string;
            given_name?: string;
            family_name?: string;
            dob?: string;
            province?: string;
        } | null;
    };
    center: {
        id: number;
        name: string;
        location?: string;
    };
}

interface Center {
    id: number;
    name: string;
    location?: string;
}

export default function Queue({
    date = 'all',
    selectedCenterId,
    centers = [],
    appointments = [],
    search = '',
    filter = 'queue',
    stats,
}: {
    date: string;
    selectedCenterId?: number | null;
    centers: Center[];
    appointments: Appointment[];
    search: string;
    filter?: string;
    stats?: StaffStats;
}) {
    const [q, setQ] = useState(search);
    const [activeDate, setActiveDate] = useState(date);
    const [centerFilter, setCenterFilter] = useState<number | 'all'>(selectedCenterId ?? 'all');

    const isRework = filter === 'rework';

    const todayStr = new Date().toISOString().split('T')[0];
    const tomorrowDate = new Date(Date.now() + 86400000);
    const tomorrowStr = tomorrowDate.toISOString().split('T')[0];

    const currentCenter = centers.find((c) => c.id === centerFilter) ?? centers[0];

    function applyFilters(newDate = activeDate, newCenter = centerFilter, newQ = q) {
        router.get(
            '/staff',
            {
                date: newDate,
                center_id: newCenter === 'all' ? undefined : newCenter,
                q: newQ || undefined,
                filter: isRework ? 'rework' : undefined,
            },
            { preserveState: true }
        );
    }

    function toggleReworkFilter() {
        router.get(
            '/staff',
            {
                date: activeDate,
                center_id: centerFilter === 'all' ? undefined : centerFilter,
                q: q || undefined,
                filter: isRework ? undefined : 'rework',
            },
            { preserveState: true }
        );
    }

    function handleDateTab(d: string) {
        setActiveDate(d);
        // Picking a date exits the rework lens — dates don't apply to the rework tray.
        router.get(
            '/staff',
            {
                date: d,
                center_id: centerFilter === 'all' ? undefined : centerFilter,
                q: q || undefined,
            },
            { preserveState: true }
        );
    }

    function handleCenterChange(cId: number | 'all') {
        setCenterFilter(cId);
        applyFilters(activeDate, cId, q);
    }

    function handleSearchSubmit(e: React.FormEvent) {
        e.preventDefault();
        applyFilters(activeDate, centerFilter, q);
    }

    function clearSearch() {
        setQ('');
        applyFilters(activeDate, centerFilter, '');
    }

    return (
        <StaffLayout stats={stats} currentCenterName={currentCenter?.name} centers={centers}>
            <Head title={isRework ? 'Needs Rework · Live Queue · Staff Station' : 'Live Enrolment Queue · Staff Station'} />

            <div className="p-6 sm:p-8">
                {/* Header Title & Top Controls */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <div className="flex items-center gap-2.5">
                            <h1 className="text-2xl font-bold tracking-tight text-[#0F2644] sm:text-3xl">
                                Live Enrolment Queue
                            </h1>
                            <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-[#0052CC]">
                                {appointments.length} {appointments.length === 1 ? 'applicant' : 'applicants'}
                            </span>
                        </div>
                        <p className="mt-1 text-sm text-slate-500">
                            {isRework
                                ? 'Filtered view — applicants flagged for document re-verification or biometric recapture.'
                                : 'Active citizen appointments ready for desk check-in and biometric capture.'}
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        {/* Center selector */}
                        <div className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-[#0F2644] shadow-xs">
                            <MapPin className="size-3.5 text-[#0052CC]" />
                            <select
                                value={centerFilter}
                                onChange={(e) =>
                                    handleCenterChange(e.target.value === 'all' ? 'all' : Number(e.target.value))
                                }
                                className="border-0 bg-transparent font-semibold text-[#0F2644] focus:outline-hidden focus:ring-0 cursor-pointer"
                            >
                                <option value="all">All Registration Centers</option>
                                {centers.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Filter Bar (Date Tabs & Search) */}
                <div className="mt-6 flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-xs lg:flex-row lg:items-center lg:justify-between">
                    {/* Date Segment Tabs */}
                    <div className="flex flex-wrap items-center gap-1.5">
                        <button
                            type="button"
                            onClick={() => handleDateTab('all')}
                            className={`rounded-lg px-3 py-2 text-xs font-bold transition ${
                                activeDate === 'all' && !isRework
                                    ? 'bg-[#0052CC] text-white shadow-xs'
                                    : 'text-slate-600 hover:bg-slate-100 hover:text-[#0F2644]'
                            }`}
                        >
                            All Dates
                        </button>
                        <button
                            type="button"
                            onClick={() => handleDateTab(todayStr)}
                            className={`rounded-lg px-3 py-2 text-xs font-bold transition ${
                                activeDate === todayStr && !isRework
                                    ? 'bg-[#0052CC] text-white shadow-xs'
                                    : 'text-slate-600 hover:bg-slate-100 hover:text-[#0F2644]'
                            }`}
                        >
                            Today
                        </button>
                        <button
                            type="button"
                            onClick={() => handleDateTab(tomorrowStr)}
                            className={`rounded-lg px-3 py-2 text-xs font-bold transition ${
                                activeDate === tomorrowStr && !isRework
                                    ? 'bg-[#0052CC] text-white shadow-xs'
                                    : 'text-slate-600 hover:bg-slate-100 hover:text-[#0F2644]'
                            }`}
                        >
                            Tomorrow
                        </button>

                        <div className="ml-1 flex items-center gap-1.5 border-l border-slate-200 pl-2">
                            <Calendar className="size-3.5 text-slate-400" />
                            <input
                                type="date"
                                value={activeDate === 'all' ? '' : activeDate}
                                onChange={(e) => handleDateTab(e.target.value || 'all')}
                                className="h-8 rounded-lg border border-slate-200 px-2 text-xs font-medium text-slate-700 focus:border-[#0052CC] focus:ring-1 focus:ring-[#0052CC]"
                            />
                        </div>

                        <div className="ml-1 flex items-center gap-1.5 border-l border-slate-200 pl-2">
                            <button
                                type="button"
                                onClick={toggleReworkFilter}
                                className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold transition ${
                                    isRework
                                        ? 'bg-amber-600 text-white shadow-xs'
                                        : 'text-amber-700 hover:bg-amber-50'
                                }`}
                                title="Show only applicants flagged for rework"
                            >
                                <AlertTriangle className="size-3.5" />
                                <span>Needs Rework ({stats?.rework_count ?? 0})</span>
                            </button>
                        </div>
                    </div>

                    {/* Search Form */}
                    <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 lg:w-96">
                        <div className="relative flex-1">
                            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                            <Input
                                value={q}
                                onChange={(e) => setQ(e.target.value)}
                                placeholder="Search by name, +675 mobile, or token..."
                                className="h-10 pl-9 pr-8 text-xs font-medium border-slate-300"
                            />
                            {q && (
                                <button
                                    type="button"
                                    onClick={clearSearch}
                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                >
                                    <X className="size-3.5" />
                                </button>
                            )}
                        </div>
                        <Button
                            type="submit"
                            variant="outline"
                            className="h-10 border-slate-300 font-semibold text-[#0F2644] hover:bg-slate-50"
                        >
                            Search
                        </Button>
                    </form>
                </div>

                {/* Queue Cards Grid */}
                <div className="mt-6 space-y-3">
                    {appointments.length === 0 ? (
                        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
                            <div className="flex size-14 items-center justify-center rounded-full bg-blue-50 text-[#0052CC]">
                                <Users className="size-7" />
                            </div>
                            <h3 className="mt-4 text-base font-bold text-[#0F2644]">
                                {isRework ? 'No applicants flagged for rework' : 'No appointments found'}
                            </h3>
                            <p className="mt-1 max-w-sm text-sm text-slate-500">
                                {isRework
                                    ? 'Every applicant has passed verification — the rework tray is clear.'
                                    : 'There are no appointments matching the selected filters. Try choosing "All Dates".'}
                            </p>
                            <div className="mt-5 flex gap-3">
                                <Button
                                    onClick={isRework ? toggleReworkFilter : () => handleDateTab('all')}
                                    variant="outline"
                                    className="border-slate-300 font-semibold text-[#0F2644]"
                                >
                                    {isRework ? 'View Full Queue' : 'View All Dates'}
                                </Button>
                            </div>
                        </div>
                    ) : (
                        appointments.map((a) => {
                            const name =
                                a.registrant.demographic?.full_name ||
                                [a.registrant.demographic?.given_name, a.registrant.demographic?.family_name]
                                    .filter(Boolean)
                                    .join(' ') ||
                                'Applicant ' + a.registrant.mobile;

                            const slotDate = new Date(a.slot_at);
                            const formattedTime = !isNaN(slotDate.getTime())
                                ? slotDate.toLocaleTimeString('en-US', {
                                      hour: 'numeric',
                                      minute: '2-digit',
                                      hour12: true,
                                  })
                                : '09:00 AM';
                            const formattedDay = !isNaN(slotDate.getTime())
                                ? slotDate.toLocaleDateString('en-US', {
                                      weekday: 'short',
                                      month: 'short',
                                      day: 'numeric',
                                  })
                                : '';

                            return (
                                <div
                                    key={a.id}
                                    className="flex flex-col items-start justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-xs transition hover:border-slate-300 sm:flex-row sm:items-center sm:p-5"
                                >
                                    {/* Left Details */}
                                    <div className="flex items-start gap-4">
                                        {/* Time badge */}
                                        <div className="flex size-14 shrink-0 flex-col items-center justify-center rounded-xl border border-[#CCE0FF] bg-[#F0F6FF] text-center">
                                            <Clock className="size-3.5 text-[#0052CC]" />
                                            <span className="mt-0.5 text-xs font-bold text-[#0052CC]">
                                                {formattedTime}
                                            </span>
                                            <span className="text-[10px] font-medium text-slate-500">
                                                {formattedDay}
                                            </span>
                                        </div>

                                        <div>
                                            <div className="flex flex-wrap items-center gap-2">
                                                <h3 className="text-base font-bold text-[#0F2644]">{name}</h3>
                                                {/* Status badge */}
                                                <span
                                                    className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                                                        a.status === 'completed'
                                                            ? 'border border-slate-200 bg-slate-100 text-slate-700'
                                                            : a.status === 'checked-in'
                                                              ? 'border border-emerald-200 bg-emerald-50 text-emerald-800'
                                                              : a.status === 'rework'
                                                                ? 'border border-amber-200 bg-amber-50 text-amber-800'
                                                                : 'border border-blue-200 bg-blue-50 text-[#0052CC]'
                                                    }`}
                                                >
                                                    {a.status === 'completed'
                                                        ? 'Validating'
                                                        : a.status === 'checked-in'
                                                          ? 'Checked In'
                                                          : a.status === 'rework'
                                                            ? 'Needs Rework'
                                                            : 'Booked'}
                                                </span>
                                            </div>

                                            <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                                                <span className="flex items-center gap-1">
                                                    <Phone className="size-3 text-slate-400" />
                                                    <span className="font-mono">{a.registrant.mobile}</span>
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <MapPin className="size-3 text-slate-400" />
                                                    <span>{a.center.name}</span>
                                                </span>
                                                {a.qr_token && (
                                                    <span className="text-[11px] font-mono text-slate-400">
                                                        Token: {a.qr_token.slice(0, 8)}...
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Button */}
                                    <div className="flex w-full items-center justify-end gap-2 sm:w-auto">
                                        {a.status === 'booked' && (
                                            <Button
                                                onClick={() => router.post(`/staff/appointments/${a.id}/checkin`)}
                                                className="h-10 w-full gap-2 rounded-xl bg-[#0052CC] px-5 font-semibold text-white shadow-xs hover:bg-[#0047B3] sm:w-auto"
                                            >
                                                <UserCheck className="size-4" />
                                                <span>Check In</span>
                                            </Button>
                                        )}

                                        {a.status === 'checked-in' && (
                                            <Button
                                                onClick={() => router.visit(`/staff/capture/${a.id}`)}
                                                className="h-10 w-full gap-2 rounded-xl bg-[#0052CC] px-5 font-semibold text-white shadow-xs hover:bg-[#0047B3] sm:w-auto"
                                            >
                                                <Camera className="size-4" />
                                                <span>Live Capture →</span>
                                            </Button>
                                        )}

                                        {a.status === 'rework' && (
                                            <Button
                                                onClick={() => router.visit(`/staff/capture/${a.id}`)}
                                                className="h-10 w-full gap-2 rounded-xl bg-amber-600 px-5 font-semibold text-white shadow-xs hover:bg-amber-700 sm:w-auto"
                                            >
                                                <AlertTriangle className="size-4" />
                                                <span>Re-Capture Biometrics →</span>
                                            </Button>
                                        )}

                                        {a.status === 'completed' && (
                                            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
                                                <CheckCircle2 className="size-4 text-emerald-600" />
                                                Captured &amp; Forwarded
                                            </span>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

        </StaffLayout>
    );
}
