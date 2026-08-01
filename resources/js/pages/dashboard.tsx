import AppLayout from '@/layouts/app-layout';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import {
 AlertCircle,
 Banknote,
 CalendarClock,
 CalendarDays,
 Check,
 CheckCircle2,
 CircleDollarSign,
 Copy,
 Download,
 ExternalLink,
 Landmark,
 Link2,
 ListChecks,
 QrCode,
 Wallet,
} from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import { type ComponentType, useEffect, useRef, useState } from 'react';

// Rendered on an offscreen canvas (not an <img> pointed at an SVG) so the
// already-loaded Lexend webfont is available — fonts aren't applied inside
// images loaded via a data: URL, only within same-document canvas draws.
function drawWordmarkLogo(color: string): Promise<string> {
 const width = 200;
 const height = 56;
 const scale = 3;

 return document.fonts.load('700 32px Lexend').then(() => {
 const canvas = document.createElement('canvas');
 canvas.width = width * scale;
 canvas.height = height * scale;
 const ctx = canvas.getContext('2d');
 if (!ctx) return '';
 ctx.scale(scale, scale);
 ctx.fillStyle = color;
 ctx.font = '700 32px Lexend, sans-serif';
 ctx.textAlign = 'center';
 ctx.textBaseline = 'middle';
 ctx.fillText('LetsBook', width / 2, height / 2 + 2);
 return canvas.toDataURL('image/png');
 });
}

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

function BookingQrDialog({ url, slug }: { url: string; slug: string }) {
 const { auth } = usePage<SharedData>().props;
 const brandColor = auth.user.brand_color || '#0284c7';
 const [open, setOpen] = useState(false);
 const [logoSrc, setLogoSrc] = useState('');
 const canvasRef = useRef<HTMLCanvasElement>(null);

 useEffect(() => {
 let cancelled = false;
 drawWordmarkLogo(brandColor).then((src) => {
 if (!cancelled) setLogoSrc(src);
 });
 return () => {
 cancelled = true;
 };
 }, [brandColor]);

 const download = () => {
 const canvas = canvasRef.current;
 if (!canvas) return;
 const link = document.createElement('a');
 link.href = canvas.toDataURL('image/png');
 link.download = `${slug}-qr-code.png`;
 link.click();
 };

 return (
 <Dialog open={open} onOpenChange={setOpen}>
 <DialogTrigger asChild>
 <button
 className="inline-flex items-center justify-center rounded-lg border border-border px-3 py-2 text-foreground hover:bg-accent"
 title="View QR code"
 >
 <QrCode className="h-4 w-4"/>
 </button>
 </DialogTrigger>
 <DialogContent className="max-w-sm">
 <DialogHeader>
 <DialogTitle>Booking page QR code</DialogTitle>
 <DialogDescription>Customers can scan this to go straight to your booking page.</DialogDescription>
 </DialogHeader>
 <div className="flex flex-col items-center gap-4 py-2">
 <div className="w-full max-w-56 rounded-xl border border-border bg-white p-4">
 <QRCodeCanvas
 ref={canvasRef}
 value={url}
 size={512}
 level="H"
 marginSize={2}
 fgColor={brandColor}
 style={{ width: '100%', height: 'auto' }}
 imageSettings={
 logoSrc ? { src: logoSrc, height: 56, width: 200, excavate: true } : undefined
 }
 />
 </div>
 <p className="max-w-full truncate text-xs text-muted-foreground">{url}</p>
 <button
 onClick={download}
 className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
 >
 <Download className="h-4 w-4"/>
 Download PNG
 </button>
 </div>
 </DialogContent>
 </Dialog>
 );
}

function BookingLinkCard({ url, slug }: { url: string; slug: string }) {
 const [copied, setCopied] = useState(false);

 const copy = async () => {
 try {
 await navigator.clipboard.writeText(url);
 setCopied(true);
 setTimeout(() => setCopied(false), 2000);
 } catch {
 // Clipboard API blocked (e.g. insecure context) — user can still select and copy manually.
 }
 };

 return (
 <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
 <div className="mb-3 flex items-center gap-3">
 <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
 <Link2 className="h-4 w-4"/>
 </div>
 <div>
 <h2 className="text-sm font-semibold text-foreground">Your booking page</h2>
 <p className="text-xs text-muted-foreground">Share this link with customers so they can book you directly.</p>
 </div>
 </div>
 <div className="flex flex-col gap-2 sm:flex-row">
 <div className="flex-1 truncate rounded-lg border border-border bg-muted/50 px-3 py-2 text-sm text-foreground">{url}</div>
 <div className="flex gap-2">
 <button
 onClick={copy}
 className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 sm:flex-none"
 >
 {copied ? <Check className="h-4 w-4"/> : <Copy className="h-4 w-4"/>}
 {copied ? 'Copied' : 'Copy'}
 </button>
 <a
 href={url}
 target="_blank"
 rel="noopener noreferrer"
 className="inline-flex items-center justify-center rounded-lg border border-border px-3 py-2 text-foreground hover:bg-accent"
 title="Open booking page"
 >
 <ExternalLink className="h-4 w-4"/>
 </a>
 <BookingQrDialog url={url} slug={slug}/>
 </div>
 </div>
 </div>
 );
}

export default function Dashboard({ stats }: { stats: Stats }) {
 const { auth } = usePage<SharedData>().props;
 const bookingUrl = route('provider.booking', auth.user.slug);
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

 <div className="mb-6">
 <BookingLinkCard url={bookingUrl} slug={auth.user.slug}/>
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
