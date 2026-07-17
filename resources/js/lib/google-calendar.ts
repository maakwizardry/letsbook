/**
 * Builds a Google Calendar "add event" link. `start` is treated as a floating
 * local time (no timezone suffix appended), so Google displays it as-is
 * rather than converting it to the viewer's timezone — correct for this app,
 * which doesn't track a real timezone per booking.
 */
export function buildGoogleCalendarUrl({
    title,
    start,
    durationHours = 2,
    details,
    location,
}: {
    title: string;
    start: Date;
    durationHours?: number;
    details?: string;
    location?: string;
}): string {
    const end = new Date(start.getTime() + durationHours * 60 * 60 * 1000);

    const format = (d: Date) =>
        `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;

    const params = new URLSearchParams({
        action: 'TEMPLATE',
        text: title,
        dates: `${format(start)}/${format(end)}`,
    });

    if (details) params.set('details', details);
    if (location) params.set('location', location);

    return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

function pad(n: number): string {
    return n.toString().padStart(2, '0');
}

/**
 * The backend serializes `scheduled_at` as a "Z"-suffixed ISO string (e.g.
 * from a JSON API response), but the value is really a floating local time
 * with no timezone tracked (see `buildGoogleCalendarUrl`). Parsing it with
 * `new Date(iso)` directly would treat "Z" as a real UTC instant and then
 * `buildGoogleCalendarUrl` would read it back through the viewer's local
 * getters, shifting the displayed time by the viewer's UTC offset. This
 * re-labels the UTC-parsed fields as local fields instead, canceling that
 * shift out.
 */
export function parseFloatingIsoDateTime(iso: string): Date {
    const d = new Date(iso);
    return new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), d.getUTCHours(), d.getUTCMinutes(), d.getUTCSeconds());
}
