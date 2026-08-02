import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ExternalLink, Users } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Clients', href: '/admin/clients' }];

interface Client {
 id: number;
 name: string;
 slug: string;
 email: string;
 bookings_count: number;
 recurring_bookings_count: number;
 total_revenue: number;
 total_cash: number;
 total_etransfer: number;
 total_paid: number;
 total_upcoming: number;
 last_activity: string | null;
}

function formatLastActivity(iso: string | null) {
 if (!iso) return 'No bookings yet';
 return new Date(iso).toLocaleString('en-US', {
 month: 'short',
 day: 'numeric',
 year: 'numeric',
 hour: 'numeric',
 minute: '2-digit',
 });
}

function formatCurrency(amount: number) {
 return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function Clients({ clients }: { clients: Client[] }) {
 const totalRevenue = clients.reduce((sum, c) => sum + c.total_revenue, 0);
 const totalBookings = clients.reduce((sum, c) => sum + c.bookings_count, 0);

 return (
 <AppLayout breadcrumbs={breadcrumbs}>
 <Head title="Clients" />
 <div className="mx-auto w-full max-w-5xl px-4 py-8">
 <div className="mb-6 flex items-center gap-3">
 <Users className="h-6 w-6 text-muted-foreground" />
 <div>
 <h1 className="text-2xl font-bold font-heading text-foreground">Clients</h1>
 <p className="mt-1 text-sm text-muted-foreground">
 {clients.length} onboarded client{clients.length === 1 ? '' : 's'} · {totalBookings.toLocaleString()} bookings total · {formatCurrency(totalRevenue)} total revenue
 </p>
 </div>
 </div>

 <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-sm">
 <table className="w-full text-sm">
 <thead>
 <tr className="border-b border-border text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
 <th className="px-4 py-3 whitespace-nowrap">Client</th>
 <th className="px-4 py-3 whitespace-nowrap">Last activity</th>
 <th className="px-4 py-3 whitespace-nowrap text-right">Bookings</th>
 <th className="px-4 py-3 whitespace-nowrap text-right">Recurring</th>
 <th className="px-4 py-3 whitespace-nowrap text-right">Revenue</th>
 <th className="px-4 py-3 whitespace-nowrap text-right">Cash</th>
 <th className="px-4 py-3 whitespace-nowrap text-right">E-transfer</th>
 <th className="px-4 py-3 whitespace-nowrap text-right">Paid</th>
 <th className="px-4 py-3 whitespace-nowrap text-right">Upcoming to earn</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-border">
 {clients.map((client) => (
 <tr key={client.id}>
 <td className="px-4 py-3">
 <Link href={`/business/${client.slug}`} target="_blank" className="inline-flex items-center gap-1 font-semibold text-foreground hover:text-primary">
 {client.name}
 <ExternalLink className="h-3 w-3 text-muted-foreground" />
 </Link>
 <div className="text-xs text-muted-foreground">{client.email}</div>
 </td>
 <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">{formatLastActivity(client.last_activity)}</td>
 <td className="px-4 py-3 whitespace-nowrap text-right font-semibold text-foreground">{client.bookings_count}</td>
 <td className="px-4 py-3 whitespace-nowrap text-right text-muted-foreground">{client.recurring_bookings_count}</td>
 <td className="px-4 py-3 whitespace-nowrap text-right font-semibold text-foreground">{formatCurrency(client.total_revenue)}</td>
 <td className="px-4 py-3 whitespace-nowrap text-right text-muted-foreground">{formatCurrency(client.total_cash)}</td>
 <td className="px-4 py-3 whitespace-nowrap text-right text-muted-foreground">{formatCurrency(client.total_etransfer)}</td>
 <td className="px-4 py-3 whitespace-nowrap text-right text-muted-foreground">{formatCurrency(client.total_paid)}</td>
 <td className="px-4 py-3 whitespace-nowrap text-right text-muted-foreground">{formatCurrency(client.total_upcoming)}</td>
 </tr>
 ))}
 {clients.length === 0 && (
 <tr>
 <td colSpan={9} className="px-4 py-10 text-center text-sm text-muted-foreground">
 No clients marked yet — set Provider::is_client to flag one.
 </td>
 </tr>
 )}
 </tbody>
 </table>
 </div>
 </div>
 </AppLayout>
 );
}
