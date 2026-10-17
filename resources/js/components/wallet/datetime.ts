/**
 * ISO timestamps → PNG local time. Plain dates are handled elsewhere
 * (formatCardDate in the wallet page) so the printed card day never shifts.
 */
export function formatDateTime(value: string | null | undefined): string {
    if (!value) return '—';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleString('en-GB', {
        timeZone: 'Pacific/Port_Moresby',
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
    });
}

export function formatDay(value: string | null | undefined): string {
    if (!value) return '—';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString('en-GB', {
        timeZone: 'Pacific/Port_Moresby',
        day: '2-digit',
        month: 'short',
    });
}
