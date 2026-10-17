import { Head, router } from '@inertiajs/react';
import {
    AlertCircle,
    Building2,
    Check,
    CheckCircle2,
    Filter,
    MapPin,
    Plus,
    Power,
    Search,
    Shield,
    Users,
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AdminLayout, { AdminStats } from '@/layouts/admin-layout';

interface Center {
    id: number;
    name: string;
    province: string;
    location: string;
    daily_capacity: number;
    is_active: boolean;
}

interface MasterProps {
    centers: Center[];
    stats: AdminStats;
}

const PNG_PROVINCES = [
    'National Capital District',
    'Morobe',
    'Eastern Highlands',
    'Western Highlands',
    'East New Britain',
    'Madang',
    'West New Britain',
    'Southern Highlands',
    'Enga',
    'Autonomous Region of Bougainville',
    'Central',
    'Milne Bay',
    'Northern (Oro)',
    'Western (Fly River)',
    'Gulf',
    'Chimbu (Simbu)',
    'Jiwaka',
    'Hela',
    'East Sepik',
    'Sandaun (West Sepik)',
    'Manus',
    'New Ireland',
];

export default function Master({ centers, stats }: MasterProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
    const [selectedProvince, setSelectedProvince] = useState<string>('all');

    // New Center Form State
    const [showAddForm, setShowAddForm] = useState(false);
    const [newCenter, setNewCenter] = useState({
        name: '',
        province: 'National Capital District',
        location: '',
        daily_capacity: 50,
    });
    const [submitting, setSubmitting] = useState(false);
    const [togglingId, setTogglingId] = useState<number | null>(null);

    // Filter centers
    const filteredCenters = centers.filter((c) => {
        const matchesSearch =
            c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.province.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus =
            statusFilter === 'all'
                ? true
                : statusFilter === 'active'
                  ? c.is_active
                  : !c.is_active;
        const matchesProvince =
            selectedProvince === 'all' || c.province.toLowerCase() === selectedProvince.toLowerCase();
        return matchesSearch && matchesStatus && matchesProvince;
    });

    const activeCenters = centers.filter((c) => c.is_active);
    const totalDailyCapacity = activeCenters.reduce((sum, c) => sum + (c.daily_capacity || 0), 0);
    const uniqueProvinces = Array.from(new Set(centers.map((c) => c.province)));

    const handleToggleActive = (center: Center) => {
        setTogglingId(center.id);
        router.put(
            `/admin/master/centers/${center.id}`,
            { is_active: !center.is_active },
            {
                preserveScroll: true,
                onFinish: () => setTogglingId(null),
            }
        );
    };

    const handleCreateCenter = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCenter.name.trim() || !newCenter.location.trim()) {
            return;
        }
        setSubmitting(true);
        router.post('/admin/master/centers', newCenter, {
            preserveScroll: true,
            onSuccess: () => {
                setShowAddForm(false);
                setNewCenter({
                    name: '',
                    province: 'National Capital District',
                    location: '',
                    daily_capacity: 50,
                });
            },
            onFinish: () => setSubmitting(false),
        });
    };

    return (
        <AdminLayout
            title="Biometric Center Master Registry"
            stats={stats}
            actions={
                <Button
                    onClick={() => setShowAddForm(!showAddForm)}
                    size="sm"
                    className="h-9 gap-1.5 rounded-lg bg-[#0052CC] px-4 font-semibold text-white shadow-xs hover:bg-[#0047B3]"
                >
                    <Plus className="size-4" />
                    <span>{showAddForm ? 'Close Form' : 'Register New Center'}</span>
                </Button>
            }
        >
            <Head title="Center Master Registry · IDENTRIQ Admin" />

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 mb-6">
                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-slate-500">Total Enclave Centers</span>
                        <Building2 className="size-4 text-[#0052CC]" />
                    </div>
                    <div className="mt-2 text-2xl font-bold tracking-tight text-[#0F2644]">
                        {centers.length}
                    </div>
                    <div className="mt-1 text-[11px] text-slate-400">Nationwide accredited nodes</div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-slate-500">Active Operational</span>
                        <CheckCircle2 className="size-4 text-emerald-600" />
                    </div>
                    <div className="mt-2 text-2xl font-bold tracking-tight text-emerald-600">
                        {activeCenters.length}
                    </div>
                    <div className="mt-1 text-[11px] text-slate-400">
                        {centers.length > 0
                            ? Math.round((activeCenters.length / centers.length) * 100)
                            : 0}
                        % operational rate
                    </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-slate-500">Daily Biometric Quota</span>
                        <Users className="size-4 text-[#0052CC]" />
                    </div>
                    <div className="mt-2 text-2xl font-bold tracking-tight text-[#0052CC]">
                        {totalDailyCapacity.toLocaleString()}
                    </div>
                    <div className="mt-1 text-[11px] text-slate-400">Registrants capacity/day</div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-slate-500">Provinces Covered</span>
                        <MapPin className="size-4 text-amber-600" />
                    </div>
                    <div className="mt-2 text-2xl font-bold tracking-tight text-slate-800">
                        {uniqueProvinces.length} <span className="text-sm font-normal text-slate-400">/ 22</span>
                    </div>
                    <div className="mt-1 text-[11px] text-slate-400">Provincial jurisdictions</div>
                </div>
            </div>

            {/* Add Center Form Drawer/Card */}
            {showAddForm && (
                <div className="mb-6 rounded-2xl border-2 border-[#0052CC]/30 bg-white p-6 shadow-md transition-all">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                        <div className="flex items-center gap-2.5">
                            <div className="flex size-8 items-center justify-center rounded-lg bg-[#0052CC]/10 text-[#0052CC]">
                                <Building2 className="size-4" />
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-[#0F2644]">
                                    Register Authorized Biometric Capture Node
                                </h3>
                                <p className="text-xs text-slate-500">
                                    Accredit an on-ground enrollment workstation or provincial center
                                </p>
                            </div>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowAddForm(false)}
                            className="text-slate-400 hover:text-slate-700"
                        >
                            Cancel
                        </Button>
                    </div>

                    <form onSubmit={handleCreateCenter} className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <div className="lg:col-span-2">
                            <Label htmlFor="center-name" className="text-xs font-semibold text-slate-700">
                                Center / Station Name *
                            </Label>
                            <Input
                                id="center-name"
                                placeholder="e.g. Waigani Central Registry Node A"
                                value={newCenter.name}
                                onChange={(e) => setNewCenter({ ...newCenter, name: e.target.value })}
                                required
                                className="mt-1.5 h-10 border-slate-200"
                            />
                        </div>

                        <div>
                            <Label htmlFor="center-province" className="text-xs font-semibold text-slate-700">
                                Province *
                            </Label>
                            <select
                                id="center-province"
                                value={newCenter.province}
                                onChange={(e) => setNewCenter({ ...newCenter, province: e.target.value })}
                                className="mt-1.5 flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 shadow-xs focus:border-[#0052CC] focus:outline-hidden focus:ring-1 focus:ring-[#0052CC]"
                            >
                                {PNG_PROVINCES.map((prov) => (
                                    <option key={prov} value={prov}>
                                        {prov}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <Label htmlFor="center-capacity" className="text-xs font-semibold text-slate-700">
                                Daily Registrant Capacity *
                            </Label>
                            <Input
                                id="center-capacity"
                                type="number"
                                min={1}
                                max={500}
                                value={newCenter.daily_capacity}
                                onChange={(e) =>
                                    setNewCenter({ ...newCenter, daily_capacity: Number(e.target.value) })
                                }
                                required
                                className="mt-1.5 h-10 border-slate-200"
                            />
                        </div>

                        <div className="sm:col-span-2 lg:col-span-4">
                            <Label htmlFor="center-location" className="text-xs font-semibold text-slate-700">
                                Physical Address / Facility Location *
                            </Label>
                            <Input
                                id="center-location"
                                placeholder="e.g. Ground Floor, NID Haus, Kumul Ave, Waigani, Port Moresby"
                                value={newCenter.location}
                                onChange={(e) => setNewCenter({ ...newCenter, location: e.target.value })}
                                required
                                className="mt-1.5 h-10 border-slate-200"
                            />
                        </div>

                        <div className="sm:col-span-2 lg:col-span-4 flex items-center justify-end gap-3 pt-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setShowAddForm(false)}
                                className="h-10 px-5 text-xs font-semibold text-slate-600"
                            >
                                Discard
                            </Button>
                            <Button
                                type="submit"
                                disabled={submitting}
                                className="h-10 gap-2 rounded-lg bg-[#0052CC] px-6 text-xs font-bold text-white shadow-xs hover:bg-[#0047B3]"
                            >
                                <Check className="size-4" />
                                <span>{submitting ? 'Accrediting Node...' : 'Authorize & Provision Center'}</span>
                            </Button>
                        </div>
                    </form>
                </div>
            )}

            {/* Filter and Search Bar */}
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-xs">
                <div className="flex flex-1 items-center gap-2 min-w-[240px]">
                    <Search className="size-4 text-slate-400" />
                    <Input
                        placeholder="Search centers by name, province, or location..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="h-9 border-none bg-transparent shadow-none text-xs focus-visible:ring-0"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            className="text-xs font-medium text-slate-400 hover:text-slate-600"
                        >
                            Clear
                        </button>
                    )}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    {/* Province Filter */}
                    <div className="flex items-center gap-1.5">
                        <Filter className="size-3.5 text-slate-400" />
                        <select
                            value={selectedProvince}
                            onChange={(e) => setSelectedProvince(e.target.value)}
                            className="h-8 rounded-lg border border-slate-200 bg-slate-50 px-2.5 text-xs font-medium text-slate-700 focus:outline-hidden"
                        >
                            <option value="all">All Provinces ({uniqueProvinces.length})</option>
                            {uniqueProvinces.map((prov) => (
                                <option key={prov} value={prov}>
                                    {prov}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Status Segmented Control */}
                    <div className="flex items-center rounded-lg bg-slate-100 p-0.5 border border-slate-200 text-xs">
                        <button
                            onClick={() => setStatusFilter('all')}
                            className={`rounded-md px-2.5 py-1 font-medium transition ${
                                statusFilter === 'all'
                                    ? 'bg-white text-slate-900 shadow-xs'
                                    : 'text-slate-600 hover:text-slate-900'
                            }`}
                        >
                            All ({centers.length})
                        </button>
                        <button
                            onClick={() => setStatusFilter('active')}
                            className={`rounded-md px-2.5 py-1 font-medium transition ${
                                statusFilter === 'active'
                                    ? 'bg-white text-emerald-700 shadow-xs'
                                    : 'text-slate-600 hover:text-slate-900'
                            }`}
                        >
                            Active ({activeCenters.length})
                        </button>
                        <button
                            onClick={() => setStatusFilter('inactive')}
                            className={`rounded-md px-2.5 py-1 font-medium transition ${
                                statusFilter === 'inactive'
                                    ? 'bg-white text-slate-900 shadow-xs'
                                    : 'text-slate-600 hover:text-slate-900'
                            }`}
                        >
                            Inactive ({centers.length - activeCenters.length})
                        </button>
                    </div>
                </div>
            </div>

            {/* Centers Grid */}
            {filteredCenters.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
                    <Building2 className="size-12 text-slate-300" />
                    <h3 className="mt-3 text-base font-bold text-slate-800">No Biometric Centers Match Query</h3>
                    <p className="mt-1 text-xs text-slate-500 max-w-sm">
                        Try modifying your search criteria or register a new enrollment node for this province.
                    </p>
                    <Button
                        onClick={() => {
                            setSearchQuery('');
                            setStatusFilter('all');
                            setSelectedProvince('all');
                        }}
                        variant="outline"
                        size="sm"
                        className="mt-4 text-xs font-semibold"
                    >
                        Reset Filters
                    </Button>
                </div>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {filteredCenters.map((c) => {
                        const isToggling = togglingId === c.id;
                        return (
                            <div
                                key={c.id}
                                className={`flex flex-col justify-between rounded-xl border bg-white p-5 shadow-xs transition hover:shadow-md ${
                                    c.is_active ? 'border-slate-200' : 'border-slate-200/60 bg-slate-50/50 opacity-80'
                                }`}
                            >
                                <div>
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex items-center gap-2">
                                            <div
                                                className={`flex size-8 items-center justify-center rounded-lg ${
                                                    c.is_active
                                                        ? 'bg-[#0052CC]/10 text-[#0052CC]'
                                                        : 'bg-slate-200 text-slate-500'
                                                }`}
                                            >
                                                <Building2 className="size-4" />
                                            </div>
                                            <div>
                                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                                    Node #{c.id}
                                                </span>
                                                <h4 className="text-sm font-bold text-[#0F2644] line-clamp-1">
                                                    {c.name}
                                                </h4>
                                            </div>
                                        </div>

                                        <span
                                            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                                                c.is_active
                                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                                    : 'bg-slate-100 text-slate-600 border border-slate-200'
                                            }`}
                                        >
                                            <span
                                                className={`size-1.5 rounded-full ${
                                                    c.is_active ? 'bg-emerald-500' : 'bg-slate-400'
                                                }`}
                                            ></span>
                                            {c.is_active ? 'OPERATIONAL' : 'OFFLINE'}
                                        </span>
                                    </div>

                                    {/* Province and Address */}
                                    <div className="mt-4 space-y-1.5 text-xs text-slate-600">
                                        <div className="flex items-center gap-1.5 font-medium text-slate-800">
                                            <MapPin className="size-3.5 text-[#0052CC]" />
                                            <span>{c.province}</span>
                                        </div>
                                        <p className="line-clamp-2 text-[11px] text-slate-500 pl-5">
                                            {c.location}
                                        </p>
                                    </div>
                                </div>

                                {/* Card Footer: Daily Quota & Toggle */}
                                <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-3">
                                    <div className="flex items-center gap-1.5 text-xs">
                                        <Users className="size-3.5 text-slate-400" />
                                        <span className="font-semibold text-slate-700">
                                            {c.daily_capacity}
                                        </span>
                                        <span className="text-[11px] text-slate-400">slots/day</span>
                                    </div>

                                    <Button
                                        size="sm"
                                        variant="outline"
                                        disabled={isToggling}
                                        onClick={() => handleToggleActive(c)}
                                        className={`h-8 gap-1.5 text-xs font-semibold transition ${
                                            c.is_active
                                                ? 'border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700'
                                                : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700'
                                        }`}
                                    >
                                        <Power className="size-3" />
                                        <span>
                                            {isToggling
                                                ? 'Updating...'
                                                : c.is_active
                                                  ? 'Deactivate'
                                                  : 'Activate'}
                                        </span>
                                    </Button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </AdminLayout>
    );
}
