import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { ChevronRight, Mail, Phone, Search, Users } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
 { title: 'Customers', href: '/customers' },
];

interface CustomerSummary {
 id: number;
 name: string;
 phone: string | null;
 email: string | null;
 address: string | null;
 bookings_count: number;
 total_spent: number;
 outstanding_amount: number;
 avg_order_value: number;
 last_booking_at: string | null;
 first_booking_at: string | null;
}

interface Filters {
 search: string;
}

function formatMoney(value: number) {
 return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDate(iso: string | null) {
 if (!iso) return '—';
 const d = new Date(iso);
 return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function Customers({ customers, filters }: { customers: CustomerSummary[]; filters: Filters }) {
 const [search, setSearch] = useState(filters.search ?? '');
 const isFirstRender = useRef(true);

 useEffect(() => {
 if (isFirstRender.current) {
 isFirstRender.current = false;
 return;
 }
 const timeout = setTimeout(() => {
 router.get('/customers', search ? { search } : {}, { preserveState: true, preserveScroll: true, replace: true });
 }, 300);
 return () => clearTimeout(timeout);
 }, [search]);

 return (
 <AppLayout breadcrumbs={breadcrumbs}>
 <Head title="Customers"/>
 <div className="mx-auto w-full max-w-6xl px-4 py-8">
 <div className="mb-6">
 <h1 className="text-2xl font-bold font-heading text-foreground">Customers</h1>
 <p className="mt-1 text-sm text-muted-foreground">
 {customers.length} customer{customers.length === 1 ? '' : 's'} total
 </p>
 </div>

 <div className="mb-4 max-w-sm">
 <div className="relative">
 <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground"/>
 <Input
 type="search"
 value={search}
 onChange={(e) => setSearch(e.target.value)}
 placeholder="Search by name, phone or email..."
 className="h-9 pl-9 text-sm"
 />
 </div>
 </div>

 {customers.length === 0 ? (
 <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-20 text-center">
 <Users className="mb-3 h-10 w-10 text-muted-foreground/40"/>
 <p className="text-muted-foreground">
 {search ? 'No customers match this search.' : 'No customers yet. They appear here after their first booking.'}
 </p>
 </div>
 ) : (
 <>
 {/* Mobile: card list */}
 <div className="flex flex-col gap-3 sm:hidden">
 {customers.map((customer) => (
 <Link
 key={customer.id}
 href={`/customers/${customer.id}`}
 className="rounded-2xl border border-border bg-card p-4 shadow-sm transition-colors hover:bg-accent/40"
 >
 <div className="flex items-start justify-between gap-2">
 <div className="min-w-0">
 <div className="font-medium text-foreground">{customer.name}</div>
 {customer.phone && (
 <div className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
 <Phone className="h-3 w-3 shrink-0"/>
 {customer.phone}
 </div>
 )}
 {customer.email && (
 <div className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
 <Mail className="h-3 w-3 shrink-0"/>
 <span className="truncate">{customer.email}</span>
 </div>
 )}
 </div>
 <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground"/>
 </div>
 <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
 <span>{customer.bookings_count} booking{customer.bookings_count === 1 ? '' : 's'}</span>
 <span className="font-medium text-foreground">{formatMoney(customer.total_spent)} spent</span>
 {customer.outstanding_amount > 0 && (
 <span className="font-semibold text-destructive">{formatMoney(customer.outstanding_amount)} owing</span>
 )}
 <span>Last: {formatDate(customer.last_booking_at)}</span>
 </div>
 </Link>
 ))}
 </div>

 {/* Desktop / tablet: table */}
 <div className="hidden overflow-hidden rounded-2xl border border-border bg-card shadow-sm sm:block">
 <div className="overflow-x-auto">
 <table className="w-full text-sm">
 <thead>
 <tr className="border-b border-border bg-muted/40 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
 <th className="px-4 py-3 whitespace-nowrap">Customer</th>
 <th className="px-4 py-3 whitespace-nowrap">Email</th>
 <th className="px-4 py-3 whitespace-nowrap">Bookings</th>
 <th className="px-4 py-3 whitespace-nowrap">Total Spent</th>
 <th className="px-4 py-3 whitespace-nowrap">Outstanding</th>
 <th className="px-4 py-3 whitespace-nowrap">Last Booking</th>
 <th className="px-4 py-3 whitespace-nowrap"><span className="sr-only">View</span></th>
 </tr>
 </thead>
 <tbody className="divide-y divide-border">
 {customers.map((customer) => (
 <tr key={customer.id} className="transition-colors hover:bg-accent/40">
 <td className="px-4 py-3 whitespace-nowrap">
 <Link href={`/customers/${customer.id}`} className="font-medium text-foreground hover:underline">
 {customer.name}
 </Link>
 {customer.phone && <div className="text-xs text-muted-foreground">{customer.phone}</div>}
 </td>
 <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">{customer.email ?? '—'}</td>
 <td className="px-4 py-3 whitespace-nowrap text-foreground">{customer.bookings_count}</td>
 <td className="px-4 py-3 whitespace-nowrap font-semibold text-foreground">{formatMoney(customer.total_spent)}</td>
 <td className="px-4 py-3 whitespace-nowrap">
 {customer.outstanding_amount > 0 ? (
 <span className="font-semibold text-destructive">{formatMoney(customer.outstanding_amount)}</span>
 ) : (
 <span className="text-muted-foreground">—</span>
 )}
 </td>
 <td className="px-4 py-3 whitespace-nowrap text-foreground">{formatDate(customer.last_booking_at)}</td>
 <td className="px-4 py-3 whitespace-nowrap">
 <Link
 href={`/customers/${customer.id}`}
 className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border text-muted-foreground hover:bg-accent hover:text-accent-foreground"
 title="View customer"
 >
 <ChevronRight className="h-4 w-4"/>
 </Link>
 </td>
 </tr>
 ))}
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
