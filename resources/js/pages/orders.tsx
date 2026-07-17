import AppLayout from '@/layouts/app-layout';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import { Banknote, CalendarPlus, CalendarRange, Check, Landmark, PackageCheck, X } from 'lucide-react';
import { buildGoogleCalendarUrl, parseFloatingIsoDateTime } from '@/lib/google-calendar';

const breadcrumbs: BreadcrumbItem[] = [
 { title: 'Orders', href: '/orders' },
];

interface Customer {
 id: number;
 name: string;
 phone: string | null;
 email: string | null;
 address: string | null;
 unit_number: string | null;
}

interface HomeType {
 id: number;
 label: string;
}

interface Booking {
 id: number;
 reference_id: string;
 scheduled_at: string;
 total_quote: number;
 payment_method: 'cash' | 'etransfer' | null;
 status: string;
 is_paid: boolean;
 items_count: number;
 customer: Customer | null;
 home_type: HomeType | null;
}

interface Filters {
 status: string;
 paid: string;
 date_from: string | null;
 date_to: string | null;
}

const STATUS_STYLES: Record<string, string> = {
 Pending: 'bg-muted text-muted-foreground border-border',
 'In Progress': 'bg-primary/10 text-primary border-primary/20',
 Completed: 'bg-success/10 text-success border-success/20',
 Cancelled: 'bg-destructive/10 text-destructive border-destructive/20',
};

function formatScheduled(iso: string) {
 const d = new Date(iso);
 return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ' · ' + d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

function bookingCalendarUrl(booking: Booking) {
 return buildGoogleCalendarUrl({
 title: `Cleaning — ${booking.customer?.name ?? booking.reference_id}`,
 start: parseFloatingIsoDateTime(booking.scheduled_at),
 details: `${booking.home_type?.label ?? ''} · ${booking.items_count} item${booking.items_count === 1 ? '' : 's'}`.trim(),
 location: booking.customer?.address ? `${booking.customer.address}${booking.customer.unit_number ? `, Unit ${booking.customer.unit_number}` : ''}` : undefined,
 });
}

function toISODate(d: Date) {
 const year = d.getFullYear();
 const month = String(d.getMonth() + 1).padStart(2, '0');
 const day = String(d.getDate()).padStart(2, '0');
 return `${year}-${month}-${day}`;
}

function startOfWeek(d: Date) {
 const day = d.getDay();
 const diff = (day === 0 ? -6 : 1) - day;
 const monday = new Date(d);
 monday.setDate(d.getDate() + diff);
 return monday;
}

function addDays(d: Date, days: number) {
 const copy = new Date(d);
 copy.setDate(copy.getDate() + days);
 return copy;
}

function startOfMonth(d: Date) {
 return new Date(d.getFullYear(), d.getMonth(), 1);
}

function endOfMonth(d: Date) {
 return new Date(d.getFullYear(), d.getMonth() + 1, 0);
}

function formatShort(isoDate: string) {
 const [y, m, d] = isoDate.split('-').map(Number);
 return new Date(y, m - 1, d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

type DatePreset = { label: string; range: () => [string, string] };

const DATE_PRESETS: DatePreset[] = [
 { label: 'Today', range: () => { const iso = toISODate(new Date()); return [iso, iso]; } },
 { label: 'This week', range: () => { const start = startOfWeek(new Date()); return [toISODate(start), toISODate(addDays(start, 6))]; } },
 { label: 'This month', range: () => { const now = new Date(); return [toISODate(startOfMonth(now)), toISODate(endOfMonth(now))]; } },
 { label: 'All time', range: () => ['', ''] },
];

function DateRangeFilter({ from, to, onApply }: { from: string; to: string; onApply: (from: string, to: string) => void }) {
 const [open, setOpen] = useState(false);
 const [draftFrom, setDraftFrom] = useState(from);
 const [draftTo, setDraftTo] = useState(to);
 const containerRef = useRef<HTMLDivElement>(null);

 useEffect(() => {
 setDraftFrom(from);
 setDraftTo(to);
 }, [from, to]);

 useEffect(() => {
 if (!open) return;
 const handleClick = (e: MouseEvent) => {
 if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
 setOpen(false);
 }
 };
 document.addEventListener('mousedown', handleClick);
 return () => document.removeEventListener('mousedown', handleClick);
 }, [open]);

 const activePreset = DATE_PRESETS.find((preset) => {
 const [f, t] = preset.range();
 return f === from && t === to;
 });

 const label = !from && !to
 ? 'All time'
 : activePreset
 ? activePreset.label
 : from && to
 ? `${formatShort(from)} – ${formatShort(to)}`
 : from
 ? `From ${formatShort(from)}`
 : `Until ${formatShort(to)}`;

 const applyPreset = (preset: DatePreset) => {
 const [f, t] = preset.range();
 onApply(f, t);
 setOpen(false);
 };

 const applyCustom = () => {
 onApply(draftFrom, draftTo);
 setOpen(false);
 };

 return (
 <div ref={containerRef} className="relative flex w-full flex-col gap-1.5 sm:w-auto">
 <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Date range</label>
 <button
 type="button"
 onClick={() => setOpen((o) => !o)}
 className="flex h-9 w-full items-center gap-2 rounded-md border border-input bg-background px-3 text-left text-sm text-foreground hover:bg-accent cursor-pointer sm:w-[13rem]"
 >
 <CalendarRange className="h-4 w-4 shrink-0 text-muted-foreground"/>
 <span className="truncate">{label}</span>
 </button>

 {open && (
 <div className="absolute left-0 top-full z-20 mt-2 w-[min(20rem,calc(100vw-2.5rem))] rounded-lg border border-border bg-popover p-3 shadow-md">
 <div className="mb-3 flex flex-wrap gap-1.5">
 {DATE_PRESETS.map((preset) => (
 <button
 key={preset.label}
 type="button"
 onClick={() => applyPreset(preset)}
 className={`rounded-full border px-2.5 py-1 text-xs font-medium cursor-pointer ${
 preset.label === activePreset?.label
 ? 'border-primary/30 bg-primary/10 text-primary'
 : 'border-border text-foreground hover:bg-accent'
 }`}
 >
 {preset.label}
 </button>
 ))}
 </div>
 <div className="flex items-center gap-2">
 <Input type="date" value={draftFrom} onChange={(e) => setDraftFrom(e.target.value)} className="h-9 min-w-0 flex-1 text-sm"/>
 <span className="text-muted-foreground">–</span>
 <Input type="date" value={draftTo} onChange={(e) => setDraftTo(e.target.value)} className="h-9 min-w-0 flex-1 text-sm"/>
 </div>
 <div className="mt-3 flex items-center justify-end gap-3">
 <button type="button" onClick={() => { onApply('', ''); setOpen(false); }} className="text-xs font-medium text-muted-foreground hover:text-foreground cursor-pointer">
 Clear
 </button>
 <button type="button" onClick={applyCustom} className="rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:opacity-90 cursor-pointer">
 Apply
 </button>
 </div>
 </div>
 )}
 </div>
 );
}

export default function Orders({ bookings, statuses, filters }: { bookings: Booking[]; statuses: string[]; filters: Filters }) {
 const [pendingIds, setPendingIds] = useState<Set<number>>(new Set());
 const [status, setStatus] = useState(filters.status ?? 'all');
 const [paid, setPaid] = useState(filters.paid ?? 'all');
 const [dateFrom, setDateFrom] = useState(filters.date_from ?? '');
 const [dateTo, setDateTo] = useState(filters.date_to ?? '');

 const applyFilters = (next: Partial<{ status: string; paid: string; date_from: string; date_to: string }>) => {
 const merged = {
 status: next.status ?? status,
 paid: next.paid ?? paid,
 date_from: next.date_from ?? dateFrom,
 date_to: next.date_to ?? dateTo,
 };

 router.get('/orders', merged, { preserveState: true, preserveScroll: true, replace: true });
 };

 const hasActiveFilters = status !== 'all' || paid !== 'all' || !!dateFrom || !!dateTo;

 const clearFilters = () => {
 setStatus('all');
 setPaid('all');
 setDateFrom('');
 setDateTo('');
 router.get('/orders', {}, { preserveState: true, preserveScroll: true, replace: true });
 };

 const withPending = (id: number, fn: () => void) => {
 setPendingIds(prev => new Set(prev).add(id));
 fn();
 };

 const updateStatus = (booking: Booking, newStatus: string) => {
 if (newStatus === booking.status) return;
 withPending(booking.id, () => {
 router.patch(`/bookings/${booking.id}`, { status: newStatus }, {
 preserveScroll: true,
 onFinish: () => setPendingIds(prev => { const next = new Set(prev); next.delete(booking.id); return next; }),
 });
 });
 };

 const togglePaid = (booking: Booking) => {
 withPending(booking.id, () => {
 router.patch(`/bookings/${booking.id}`, { is_paid: !booking.is_paid }, {
 preserveScroll: true,
 onFinish: () => setPendingIds(prev => { const next = new Set(prev); next.delete(booking.id); return next; }),
 });
 });
 };

 return (
 <AppLayout breadcrumbs={breadcrumbs}>
 <Head title="Orders"/>
 <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:py-8">
 <div className="mb-6">
 <h1 className="text-2xl font-bold font-heading text-foreground">Orders</h1>
 <p className="text-sm text-muted-foreground mt-1">{bookings.length} booking{bookings.length === 1 ? '' : 's'}{hasActiveFilters ? ' matching filters' : ' total'}</p>
 </div>

 <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm sm:flex-row sm:flex-wrap sm:items-end">
 <div className="flex w-full flex-col gap-1.5 sm:w-[10rem]">
 <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Status</label>
 <Select value={status} onValueChange={(value) => { setStatus(value); applyFilters({ status: value }); }}>
 <SelectTrigger className="h-9 w-full text-sm">
 <SelectValue/>
 </SelectTrigger>
 <SelectContent>
 <SelectItem value="all">All statuses</SelectItem>
 {statuses.map((s) => (
 <SelectItem key={s} value={s}>{s}</SelectItem>
 ))}
 </SelectContent>
 </Select>
 </div>

 <div className="flex w-full flex-col gap-1.5 sm:w-[9rem]">
 <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Payment</label>
 <Select value={paid} onValueChange={(value) => { setPaid(value); applyFilters({ paid: value }); }}>
 <SelectTrigger className="h-9 w-full text-sm">
 <SelectValue/>
 </SelectTrigger>
 <SelectContent>
 <SelectItem value="all">All</SelectItem>
 <SelectItem value="paid">Paid</SelectItem>
 <SelectItem value="unpaid">Unpaid</SelectItem>
 </SelectContent>
 </Select>
 </div>

 <DateRangeFilter
 from={dateFrom}
 to={dateTo}
 onApply={(from, to) => { setDateFrom(from); setDateTo(to); applyFilters({ date_from: from, date_to: to }); }}
 />

 {hasActiveFilters && (
 <button
 onClick={clearFilters}
 className="flex h-9 w-full items-center justify-center gap-1 rounded-md border border-border px-3 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground cursor-pointer sm:w-auto"
 >
 <X className="w-3.5 h-3.5"/>
 Clear filters
 </button>
 )}
 </div>

 {bookings.length === 0 ? (
 <div className="flex flex-col items-center justify-center text-center py-20 border border-dashed border-border rounded-2xl">
 <PackageCheck className="w-10 h-10 text-muted-foreground/40 mb-3"/>
 <p className="text-muted-foreground">{hasActiveFilters ? 'No bookings match these filters.' : 'No bookings yet. Share your booking link to get your first order.'}</p>
 </div>
 ) : (
 <>
 {/* Mobile: card list */}
 <div className="flex flex-col gap-3 sm:hidden">
 {bookings.map((booking) => {
 const isPending = pendingIds.has(booking.id);
 return (
 <div key={booking.id} className={`rounded-2xl border border-border bg-card p-4 shadow-sm transition-opacity ${isPending ? 'opacity-50' : ''}`}>
 <div className="flex items-start justify-between gap-2">
 <div>
 <div className="font-mono text-xs font-semibold text-foreground">{booking.reference_id}</div>
 <div className="mt-0.5 font-medium text-foreground">{booking.customer?.name ?? '—'}</div>
 {booking.customer?.phone && <div className="text-xs text-muted-foreground">{booking.customer.phone}</div>}
 </div>
 <div className="text-right font-semibold text-foreground">${booking.total_quote}</div>
 </div>

 <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
 <span>{formatScheduled(booking.scheduled_at)}</span>
 <span>{booking.home_type?.label ?? '—'} · {booking.items_count} item{booking.items_count === 1 ? '' : 's'}</span>
 <span className="flex items-center gap-1">
 {booking.payment_method === 'etransfer' ? <Landmark className="w-3.5 h-3.5"/> : <Banknote className="w-3.5 h-3.5"/>}
 {booking.payment_method === 'etransfer' ? 'E-transfer' : 'Cash'}
 </span>
 </div>

 <div className="mt-3 flex items-center gap-2">
 <Select value={booking.status} onValueChange={(value) => updateStatus(booking, value)} disabled={isPending}>
 <SelectTrigger className={`h-9 flex-1 text-xs font-semibold ${STATUS_STYLES[booking.status] ?? ''}`}>
 <SelectValue/>
 </SelectTrigger>
 <SelectContent>
 {statuses.map((s) => (
 <SelectItem key={s} value={s} className="text-xs">{s}</SelectItem>
 ))}
 </SelectContent>
 </Select>
 <button
 onClick={() => togglePaid(booking)}
 disabled={isPending}
 className={`inline-flex h-9 items-center gap-1.5 rounded-full border px-3 text-xs font-semibold transition-colors cursor-pointer disabled:cursor-not-allowed ${
 booking.is_paid
 ? 'bg-success/10 text-success border-success/20 hover:bg-success/15'
 : 'bg-muted text-muted-foreground border-border hover:bg-accent'
 }`}
 >
 {booking.is_paid && <Check className="w-3.5 h-3.5"/>}
 {booking.is_paid ? 'Paid' : 'Mark Paid'}
 </button>
 <a
 href={bookingCalendarUrl(booking)}
 target="_blank"
 rel="noopener noreferrer"
 title="Add to Google Calendar"
 className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border text-muted-foreground hover:bg-accent hover:text-accent-foreground"
 >
 <CalendarPlus className="w-4 h-4"/>
 </a>
 </div>
 </div>
 );
 })}
 </div>

 {/* Desktop / tablet: table */}
 <div className="hidden sm:block border border-border rounded-2xl overflow-hidden bg-card shadow-sm">
 <div className="overflow-x-auto">
 <table className="w-full text-sm">
 <thead>
 <tr className="border-b border-border bg-muted/40 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
 <th className="px-4 py-3 whitespace-nowrap">Reference</th>
 <th className="px-4 py-3 whitespace-nowrap">Customer</th>
 <th className="px-4 py-3 whitespace-nowrap">Home Type</th>
 <th className="px-4 py-3 whitespace-nowrap">Scheduled</th>
 <th className="px-4 py-3 whitespace-nowrap">Total</th>
 <th className="px-4 py-3 whitespace-nowrap">Payment</th>
 <th className="px-4 py-3 whitespace-nowrap">Status</th>
 <th className="px-4 py-3 whitespace-nowrap">Paid</th>
 <th className="px-4 py-3 whitespace-nowrap"><span className="sr-only">Calendar</span></th>
 </tr>
 </thead>
 <tbody className="divide-y divide-border">
 {bookings.map((booking) => {
 const isPending = pendingIds.has(booking.id);
 return (
 <tr key={booking.id} className={`transition-opacity ${isPending ? 'opacity-50' : ''}`}>
 <td className="px-4 py-3 font-mono text-xs font-semibold text-foreground whitespace-nowrap">{booking.reference_id}</td>
 <td className="px-4 py-3 whitespace-nowrap">
 <div className="font-medium text-foreground">{booking.customer?.name ?? '—'}</div>
 {booking.customer?.phone && <div className="text-xs text-muted-foreground">{booking.customer.phone}</div>}
 </td>
 <td className="px-4 py-3 whitespace-nowrap text-foreground">
 {booking.home_type?.label ?? '—'}
 <span className="text-muted-foreground"> · {booking.items_count} item{booking.items_count === 1 ? '' : 's'}</span>
 </td>
 <td className="px-4 py-3 whitespace-nowrap text-foreground">{formatScheduled(booking.scheduled_at)}</td>
 <td className="px-4 py-3 whitespace-nowrap font-semibold text-foreground">${booking.total_quote}</td>
 <td className="px-4 py-3 whitespace-nowrap">
 <span className="flex items-center gap-1.5 text-muted-foreground">
 {booking.payment_method === 'etransfer' ? <Landmark className="w-3.5 h-3.5"/> : <Banknote className="w-3.5 h-3.5"/>}
 {booking.payment_method === 'etransfer' ? 'E-transfer' : 'Cash'}
 </span>
 </td>
 <td className="px-4 py-3 whitespace-nowrap">
 <Select value={booking.status} onValueChange={(value) => updateStatus(booking, value)} disabled={isPending}>
 <SelectTrigger className={`h-8 w-[9.5rem] text-xs font-semibold ${STATUS_STYLES[booking.status] ?? ''}`}>
 <SelectValue/>
 </SelectTrigger>
 <SelectContent>
 {statuses.map((s) => (
 <SelectItem key={s} value={s} className="text-xs">{s}</SelectItem>
 ))}
 </SelectContent>
 </Select>
 </td>
 <td className="px-4 py-3 whitespace-nowrap">
 <button
 onClick={() => togglePaid(booking)}
 disabled={isPending}
 className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold transition-colors cursor-pointer disabled:cursor-not-allowed ${
 booking.is_paid
 ? 'bg-success/10 text-success border-success/20 hover:bg-success/15'
 : 'bg-muted text-muted-foreground border-border hover:bg-accent'
 }`}
 >
 {booking.is_paid && <Check className="w-3.5 h-3.5"/>}
 {booking.is_paid ? 'Paid' : 'Mark as Paid'}
 </button>
 </td>
 <td className="px-4 py-3 whitespace-nowrap">
 <a
 href={bookingCalendarUrl(booking)}
 target="_blank"
 rel="noopener noreferrer"
 title="Add to Google Calendar"
 className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border text-muted-foreground hover:bg-accent hover:text-accent-foreground"
 >
 <CalendarPlus className="w-4 h-4"/>
 </a>
 </td>
 </tr>
 );
 })}
 </tbody>
 </table>
 </div>
 </div>
 </>
 )}
 </div>
 </AppLayout>
 );
}
