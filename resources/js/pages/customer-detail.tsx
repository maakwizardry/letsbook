import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import {
 Banknote,
 Building2,
 CalendarDays,
 Check,
 CircleDollarSign,
 Hash,
 Landmark,
 ListChecks,
 Mail,
 MapPin,
 Phone,
 StickyNote,
 Wallet,
} from 'lucide-react';
import { type ComponentType } from 'react';

interface CustomerDetail {
 id: number;
 name: string;
 phone: string | null;
 email: string | null;
 address: string | null;
 unit_number: string | null;
 buzz_code: string | null;
 building_instructions: string | null;
 postal_code: string | null;
}

interface Summary {
 bookings_count: number;
 total_spent: number;
 outstanding_amount: number;
 avg_order_value: number;
 last_booking_at: string | null;
 first_booking_at: string | null;
}

interface BookingRow {
 id: number;
 reference_id: string;
 scheduled_at: string;
 status: string;
 is_paid: boolean;
 payment_method: 'cash' | 'etransfer' | null;
 total_quote: number;
 items_count: number;
}

const STATUS_STYLES: Record<string, string> = {
 Pending: 'bg-muted text-muted-foreground border-border',
 'In Progress': 'bg-primary/10 text-primary border-primary/20',
 Completed: 'bg-success/10 text-success border-success/20',
 Cancelled: 'bg-destructive/10 text-destructive border-destructive/20',
};

function formatMoney(value: number) {
 return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDate(iso: string | null) {
 if (!iso) return '—';
 const d = new Date(iso);
 return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatScheduled(iso: string) {
 const d = new Date(iso);
 return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + ' · ' + d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

function StatTile({
 label,
 value,
 icon: Icon,
 tone = 'default',
}: {
 label: string;
 value: string;
 icon: ComponentType<{ className?: string }>;
 tone?: 'default' | 'success' | 'destructive' | 'primary';
}) {
 const toneStyles: Record<string, string> = {
 default: 'bg-muted text-muted-foreground',
 success: 'bg-success/10 text-success',
 destructive: 'bg-destructive/10 text-destructive',
 primary: 'bg-primary/10 text-primary',
 };

 return (
 <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
 <div className="mb-3 flex items-center justify-between">
 <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</span>
 <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${toneStyles[tone]}`}>
 <Icon className="h-4 w-4"/>
 </div>
 </div>
 <div className="text-2xl font-bold font-heading text-foreground">{value}</div>
 </div>
 );
}

function InfoRow({ icon: Icon, label, value }: { icon: ComponentType<{ className?: string }>; label: string; value: string }) {
 return (
 <div className="flex items-start gap-3">
 <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground"/>
 <div className="min-w-0">
 <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</div>
 <div className="text-sm text-foreground">{value}</div>
 </div>
 </div>
 );
}

export default function CustomerDetailPage({ customer, summary, bookings }: { customer: CustomerDetail; summary: Summary; bookings: BookingRow[] }) {
 const breadcrumbs: BreadcrumbItem[] = [
 { title: 'Customers', href: '/customers' },
 { title: customer.name, href: `/customers/${customer.id}` },
 ];

 return (
 <AppLayout breadcrumbs={breadcrumbs}>
 <Head title={customer.name}/>
 <div className="mx-auto w-full max-w-6xl px-4 py-8">
 <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
 <div>
 <h1 className="text-2xl font-bold font-heading text-foreground">{customer.name}</h1>
 <p className="mt-1 text-sm text-muted-foreground">Customer since {formatDate(summary.first_booking_at)}</p>
 </div>
 <div className="flex gap-2">
 {customer.phone && (
 <a
 href={`tel:${customer.phone}`}
 className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm font-semibold text-foreground hover:bg-accent"
 >
 <Phone className="h-4 w-4"/>
 Call
 </a>
 )}
 {customer.email && (
 <a
 href={`mailto:${customer.email}`}
 className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm font-semibold text-foreground hover:bg-accent"
 >
 <Mail className="h-4 w-4"/>
 Email
 </a>
 )}
 </div>
 </div>

 <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
 <StatTile label="Total Bookings" value={String(summary.bookings_count)} icon={ListChecks}/>
 <StatTile label="Total Spent" value={formatMoney(summary.total_spent)} icon={CircleDollarSign} tone="success"/>
 <StatTile
 label="Outstanding"
 value={formatMoney(summary.outstanding_amount)}
 icon={Wallet}
 tone={summary.outstanding_amount > 0 ? 'destructive' : 'default'}
 />
 <StatTile label="Avg. Order Value" value={formatMoney(summary.avg_order_value)} icon={CalendarDays} tone="primary"/>
 </div>

 <div className="mb-6 rounded-2xl border border-border bg-card p-5 shadow-sm">
 <h2 className="mb-4 text-sm font-semibold text-foreground">Contact & address</h2>
 <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
 {customer.phone && <InfoRow icon={Phone} label="Phone" value={customer.phone}/>}
 {customer.email && <InfoRow icon={Mail} label="Email" value={customer.email}/>}
 {customer.address && (
 <InfoRow icon={MapPin} label="Address" value={`${customer.address}${customer.unit_number ? `, Unit ${customer.unit_number}` : ''}`}/>
 )}
 {customer.postal_code && <InfoRow icon={Hash} label="Postal Code" value={customer.postal_code}/>}
 {customer.buzz_code && <InfoRow icon={Building2} label="Buzz Code" value={customer.buzz_code}/>}
 {customer.building_instructions && <InfoRow icon={StickyNote} label="Building Instructions" value={customer.building_instructions}/>}
 </div>
 </div>

 <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
 <div className="border-b border-border px-5 py-4">
 <h2 className="text-sm font-semibold text-foreground">Booking history</h2>
 </div>
 <div className="overflow-x-auto">
 <table className="w-full text-sm">
 <thead>
 <tr className="border-b border-border bg-muted/40 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
 <th className="px-4 py-3 whitespace-nowrap">Reference</th>
 <th className="px-4 py-3 whitespace-nowrap">Scheduled</th>
 <th className="px-4 py-3 whitespace-nowrap">Items</th>
 <th className="px-4 py-3 whitespace-nowrap">Total</th>
 <th className="px-4 py-3 whitespace-nowrap">Payment</th>
 <th className="px-4 py-3 whitespace-nowrap">Status</th>
 <th className="px-4 py-3 whitespace-nowrap">Paid</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-border">
 {bookings.map((booking) => (
 <tr key={booking.id}>
 <td className="px-4 py-3 font-mono text-xs font-semibold text-foreground whitespace-nowrap">{booking.reference_id}</td>
 <td className="px-4 py-3 whitespace-nowrap text-foreground">{formatScheduled(booking.scheduled_at)}</td>
 <td className="px-4 py-3 whitespace-nowrap text-foreground">
 {booking.items_count} item{booking.items_count === 1 ? '' : 's'}
 </td>
 <td className="px-4 py-3 whitespace-nowrap font-semibold text-foreground">{formatMoney(booking.total_quote)}</td>
 <td className="px-4 py-3 whitespace-nowrap">
 <span className="flex items-center gap-1.5 text-muted-foreground">
 {booking.payment_method === 'etransfer' ? <Landmark className="h-3.5 w-3.5"/> : <Banknote className="h-3.5 w-3.5"/>}
 {booking.payment_method === 'etransfer' ? 'E-transfer' : 'Cash'}
 </span>
 </td>
 <td className="px-4 py-3 whitespace-nowrap">
 <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLES[booking.status] ?? 'bg-muted text-muted-foreground border-border'}`}>
 {booking.status}
 </span>
 </td>
 <td className="px-4 py-3 whitespace-nowrap">
 {booking.is_paid ? (
 <span className="inline-flex items-center gap-1 rounded-full border border-success/20 bg-success/10 px-2.5 py-0.5 text-xs font-semibold text-success">
 <Check className="h-3 w-3"/>
 Paid
 </span>
 ) : (
 <span className="inline-flex items-center rounded-full border border-border bg-muted px-2.5 py-0.5 text-xs font-semibold text-muted-foreground">
 Unpaid
 </span>
 )}
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </div>
 </div>
 </AppLayout>
 );
}
