import { useEffect, useRef } from 'react';
import type { DivIcon, LatLngBoundsExpression, Map as LeafletMap, Marker as LeafletMarker } from 'leaflet';

export interface MapPoint {
    id: number;
    name: string;
    lat: number;
    lng: number;
}

function dot(active: boolean, L: { divIcon: (o: object) => DivIcon }): DivIcon {
    return L.divIcon({
        className: '',
        html: `<span style="display:block;width:20px;height:20px;border-radius:9999px;background:${active ? '#C9A227' : '#2FD6A3'};border:3px solid #0E2A26;box-shadow:0 1px 4px rgba(0,0,0,.35);"></span>`,
        iconSize: [20, 20],
        iconAnchor: [10, 10],
    });
}

export default function CenterMap({
    points,
    selectedId,
    onSelect,
}: {
    points: MapPoint[];
    selectedId: number | null;
    onSelect: (id: number) => void;
}) {
    const ref = useRef<HTMLDivElement | null>(null);
    const mapRef = useRef<LeafletMap | null>(null);
    const markersRef = useRef<Record<number, LeafletMarker>>({});
    const selectRef = useRef(onSelect);
    selectRef.current = onSelect;

    useEffect(() => {
        let cancelled = false;
        (async () => {
            const L = await import('leaflet');
            await import('leaflet/dist/leaflet.css');
            if (cancelled || !ref.current || mapRef.current) return;
            const map = L.map(ref.current, { scrollWheelZoom: false }).setView([-6.3, 147.0], 6);
            mapRef.current = map;
            L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 18,
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
            }).addTo(map);
            map.on('focus', () => map.scrollWheelZoom.enable());
            map.on('blur', () => map.scrollWheelZoom.disable());
            map.on('click', () => map.scrollWheelZoom.enable());
            setTimeout(() => map.invalidateSize(), 100);
        })();
        return () => {
            cancelled = true;
        };
    }, []);

    useEffect(() => {
        (async () => {
            const L = await import('leaflet');
            const map = mapRef.current;
            if (!map) return;
            Object.values(markersRef.current).forEach((m) => m.remove());
            markersRef.current = {};
            const valid = points.filter((p) => Number.isFinite(p.lat) && Number.isFinite(p.lng));
            valid.forEach((p) => {
                const m = L.marker([p.lat, p.lng], { icon: dot(p.id === selectedId, L) })
                    .addTo(map)
                    .bindTooltip(p.name)
                    .on('click', () => selectRef.current(p.id));
                markersRef.current[p.id] = m;
            });
            if (valid.length > 1) {
                map.fitBounds(
                    L.latLngBounds(valid.map((p) => [p.lat, p.lng] as [number, number])) as LatLngBoundsExpression,
                    { padding: [24, 24] }
                );
            } else if (valid.length === 1) {
                map.setView([valid[0].lat, valid[0].lng], 9);
            }
        })();
    }, [points, selectedId]);

    useEffect(() => {
        return () => {
            mapRef.current?.remove();
            mapRef.current = null;
        };
    }, []);

    return <div ref={ref} className="h-[480px] w-full" role="application" aria-label="Map of registration centers" />;
}
