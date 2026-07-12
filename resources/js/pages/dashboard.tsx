import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import {
 AlertCircle,
 Banknote,
 CalendarClock,
 CalendarDays,
 CheckCircle2,
 CircleDollarSign,
 Landmark,
 ListChecks,
 Wallet,
} from 'lucide-react';
import { type ComponentType } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
 { title: 'Dashboard', href: '/dashboard' },
];

interface Stats {
 totalOrders: number;
 ordersToday: number;
 ordersThisWeek: number;
 ordersThisMonth: number;
 totalRevenue: number;
 revenueThisMonth: number;
 outstandingAmount: number;
 outstandingCount: number;
 avgOrderValue: number;
 completionRate: number;
 cancellationRate: number;
 needsAttention: number;
 statusCounts: Record<string, number>;
 paymentMethodCounts: { cash: number; etransfer: number };
}

const STATUS_COLORS: Record<string, string> = {
 Pending: 'bg-muted-foreground/40',
 'In Progress': 'bg-primary',
 Completed: 'bg-success',
 Cancelled: 'bg-destructive',
};

function formatMoney(value: number) {
 return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function StatTile({
 label,
 value,
 icon: Icon,
 hint,
 tone = 'default',
}: {
 label: string;
 value: string;
 icon: ComponentType<{ className?: string }>;
 hint?: string;
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
 {hint && <div className="mt-1 text-xs text-muted-foreground">{hint}</div>}
 </div>
 );
}

export default function Dashboard({ stats }: { stats: Stats }) {
 const statuses = Object.keys(stats.statusCounts);
 const hasOrders = stats.totalOrders > 0;
 const totalPaymentMethods = stats.paymentMethodCounts.cash + stats.paymentMethodCounts.etransfer;

 return (
 <AppLayout breadcrumbs={breadcrumbs}>
 <Head title="Dashboard"/>
 <div className="mx-auto w-full max-w-6xl px-4 py-8">
 <div className="mb-6">
 <h1 className="text-2xl font-bold font-heading text-foreground">Dashboard</h1>
 <p className="mt-1 text-sm text-muted-foreground">Your business at a glance</p>
 </div>

 {!hasOrders ? (
 <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-20 text-center">
 <CircleDollarSign className="mb-3 h-10 w-10 text-muted-foreground/40"/>
 <p className="text-muted-foreground">No orders yet. Stats will show up here once bookings come in.</p>
 </div>
 ) : (
 <div className="space-y-6">
 <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
 <StatTile label="Total Revenue" value={formatMoney(stats.totalRevenue)} icon={CircleDollarSign} hint="From paid orders, all time" tone="success"/>
 <StatTile label="Revenue This Month" value={formatMoney(stats.revenueThisMonth)} icon={CalendarDays} hint={`${stats.ordersThisMonth} order${stats.ordersThisMonth === 1 ? '' : 's'} this month`} tone="primary"/>
 <StatTile
 label="Outstanding"
 value={formatMoney(stats.outstandingAmount)}
 icon={Wallet}
 hint={`${stats.outstandingCount} unpaid order${stats.outstandingCount === 1 ? '' : 's'}`}
 tone={stats.outstandingAmount > 0 ? 'destructive' : 'default'}
 />
 <StatTile label="Avg. Order Value" value={formatMoney(stats.avgOrderValue)} icon={ListChecks} hint="Across all orders"/>
 </div>

 <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
 <StatTile label="Total Orders" value={String(stats.totalOrders)} icon={ListChecks} hint="All time"/>
 <StatTile label="Orders Today" value={String(stats.ordersToday)} icon={CalendarClock} hint={`${stats.ordersThisWeek} this week`}/>
 <StatTile
 label="Needs Attention"
 value={String(stats.needsAttention)}
 icon={AlertCircle}
 hint="Pending or in progress"
 tone={stats.needsAttention > 0 ? 'primary' : 'default'}
 />
 <StatTile label="Completion Rate" value={`${stats.completionRate}%`} icon={CheckCircle2} hint={`${stats.cancellationRate}% cancelled`} tone="success"/>
 </div>

 <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
 <h2 className="mb-4 text-sm font-semibold text-foreground">Orders by status</h2>
 <div className="flex h-3 w-full gap-0.5 overflow-hidden rounded-full bg-muted">
 {statuses.map((status) => {
 const count = stats.statusCounts[status] ?? 0;
 if (count === 0) return null;
 const width = (count / stats.totalOrders) * 100;
 return (
 <div
 key={status}
 title={`${status}: ${count}`}
 className={`h-full ${STATUS_COLORS[status] ?? 'bg-muted-foreground/40'} first:rounded-l-full last:rounded-r-full`}
 style={{ width: `${width}%` }}
 />
 );
 })}
 </div>
 <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
 {statuses.map((status) => (
 <div key={status} className="flex items-center gap-1.5 text-sm">
 <span className={`h-2.5 w-2.5 rounded-full ${STATUS_COLORS[status] ?? 'bg-muted-foreground/40'}`}/>
 <span className="text-foreground">{status}</span>
 <span className="text-muted-foreground">{stats.statusCounts[status] ?? 0}</span>
 </div>
 ))}
 </div>
 </div>

 <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
 <h2 className="mb-4 text-sm font-semibold text-foreground">Payment methods</h2>
 {totalPaymentMethods === 0 ? (
 <p className="text-sm text-muted-foreground">No orders yet.</p>
 ) : (
 <div className="flex flex-wrap gap-6">
 <div className="flex items-center gap-2 text-sm">
 <Banknote className="h-4 w-4 text-muted-foreground"/>
 <span className="text-foreground">Cash</span>
 <span className="font-semibold text-foreground">{stats.paymentMethodCounts.cash}</span>
 <span className="text-muted-foreground">
 ({totalPaymentMethods > 0 ? Math.round((stats.paymentMethodCounts.cash / totalPaymentMethods) * 100) : 0}%)
 </span>
 </div>
 <div className="flex items-center gap-2 text-sm">
 <Landmark className="h-4 w-4 text-muted-foreground"/>
 <span className="text-foreground">E-transfer</span>
 <span className="font-semibold text-foreground">{stats.paymentMethodCounts.etransfer}</span>
 <span className="text-muted-foreground">
 ({totalPaymentMethods > 0 ? Math.round((stats.paymentMethodCounts.etransfer / totalPaymentMethods) * 100) : 0}%)
 </span>
 </div>
 </div>
 )}
 </div>
 </div>
 )}
 </div>
 </AppLayout>
 );
}
