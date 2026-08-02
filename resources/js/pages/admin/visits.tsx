import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Eye, ExternalLink } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Visits', href: '/admin/visits' }];

interface Visit {
 id: number;
 provider_name: string;
 provider_slug: string;
 ip_address: string | null;
 user_agent: string | null;
 referrer: string | null;
 visited_at: string;
}

interface TopProvider {
 name: string;
 slug: string;
 visits: number;
}

interface PaginatedVisits {
 data: Visit[];
 links: { url: string | null; label: string; active: boolean }[];
 current_page: number;
 last_page: number;
 total: number;
}

function formatVisitedAt(iso: string) {
 return new Date(iso).toLocaleString('en-US', {
 month: 'short',
 day: 'numeric',
 hour: 'numeric',
 minute: '2-digit',
 });
}

function shortUserAgent(userAgent: string | null) {
 if (!userAgent) return '—';
 if (userAgent.length <= 60) return userAgent;
 return userAgent.slice(0, 60) + '…';
}

export default function Visits({
 visits,
 topProviders,
 filters,
 totalVisits,
 providerCount,
}: {
 visits: PaginatedVisits;
 topProviders: TopProvider[];
 filters: { provider?: string; from?: string; to?: string };
 totalVisits: number;
 providerCount: number;
}) {
 const [provider, setProvider] = useState(filters.provider ?? '');
 const [from, setFrom] = useState(filters.from ?? '');
 const [to, setTo] = useState(filters.to ?? '');

 const applyFilters = () => {
 router.get(
 '/admin/visits',
 { provider: provider || undefined, from: from || undefined, to: to || undefined },
 { preserveState: true, preserveScroll: true },
 );
 };

 const clearFilters = () => {
 setProvider('');
 setFrom('');
 setTo('');
 router.get('/admin/visits', {}, { preserveState: true, preserveScroll: true });
 };

 return (
 <AppLayout breadcrumbs={breadcrumbs}>
 <Head title="Booking Page Visits" />
 <div className="mx-auto w-full max-w-5xl px-4 py-8">
 <div className="mb-6 flex items-center gap-3">
 <Eye className="h-6 w-6 text-muted-foreground" />
 <div>
 <h1 className="text-2xl font-bold font-heading text-foreground">Booking Page Visits</h1>
 <p className="mt-1 text-sm text-muted-foreground">
 {totalVisits.toLocaleString()} total visits across {providerCount} provider{providerCount === 1 ? '' : 's'}.
 </p>
 </div>
 </div>

 {topProviders.length > 0 && (
 <div className="mb-6 rounded-2xl border border-border bg-card p-5 shadow-sm">
 <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-muted-foreground">Most visited</h2>
 <div className="flex flex-wrap gap-2">
 {topProviders.map((p) => (
 <button
 key={p.slug}
 type="button"
 onClick={() => {
 setProvider(p.slug);
 router.get('/admin/visits', { provider: p.slug }, { preserveState: true, preserveScroll: true });
 }}
 className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground transition-colors hover:bg-accent"
 >
 {p.name} <span className="text-muted-foreground">({p.visits})</span>
 </button>
 ))}
 </div>
 </div>
 )}

 <div className="mb-6 rounded-2xl border border-border bg-card p-5 shadow-sm">
 <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
 <div className="grid gap-1.5">
 <Label htmlFor="filter-provider">Provider slug</Label>
 <Input id="filter-provider" value={provider} onChange={(e) => setProvider(e.target.value)} placeholder="e.g. sebiha-baran" className="w-56" />
 </div>
 <div className="grid gap-1.5">
 <Label htmlFor="filter-from">From</Label>
 <Input id="filter-from" type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="w-40" />
 </div>
 <div className="grid gap-1.5">
 <Label htmlFor="filter-to">To</Label>
 <Input id="filter-to" type="date" value={to} onChange={(e) => setTo(e.target.value)} className="w-40" />
 </div>
 <Button type="button" onClick={applyFilters}>Filter</Button>
 {(filters.provider || filters.from || filters.to) && (
 <Button type="button" variant="ghost" onClick={clearFilters}>Clear</Button>
 )}
 </div>
 </div>

 <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-sm">
 <table className="w-full text-sm">
 <thead>
 <tr className="border-b border-border text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
 <th className="px-4 py-3 whitespace-nowrap">Provider</th>
 <th className="px-4 py-3 whitespace-nowrap">Visited</th>
 <th className="px-4 py-3 whitespace-nowrap">IP</th>
 <th className="px-4 py-3 whitespace-nowrap">Referrer</th>
 <th className="px-4 py-3">User agent</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-border">
 {visits.data.map((visit) => (
 <tr key={visit.id}>
 <td className="px-4 py-3 whitespace-nowrap">
 <Link href={`/business/${visit.provider_slug}`} target="_blank" className="inline-flex items-center gap-1 font-semibold text-foreground hover:text-primary">
 {visit.provider_name}
 <ExternalLink className="h-3 w-3 text-muted-foreground" />
 </Link>
 </td>
 <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">{formatVisitedAt(visit.visited_at)}</td>
 <td className="px-4 py-3 whitespace-nowrap font-mono text-xs text-muted-foreground">{visit.ip_address ?? '—'}</td>
 <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">{visit.referrer ?? '(direct)'}</td>
 <td className="px-4 py-3 text-xs text-muted-foreground">{shortUserAgent(visit.user_agent)}</td>
 </tr>
 ))}
 {visits.data.length === 0 && (
 <tr>
 <td colSpan={5} className="px-4 py-10 text-center text-sm text-muted-foreground">
 No visits recorded yet{filters.provider || filters.from || filters.to ? ' for this filter' : ''}.
 </td>
 </tr>
 )}
 </tbody>
 </table>
 </div>

 {visits.last_page > 1 && (
 <div className="mt-4 flex flex-wrap gap-1.5">
 {visits.links.map((link, i) => (
 <button
 key={i}
 type="button"
 disabled={!link.url}
 onClick={() => link.url && router.visit(link.url, { preserveState: true, preserveScroll: true })}
 className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${
 link.active
 ? 'border-primary bg-primary/10 text-primary'
 : link.url
 ? 'border-border bg-card text-foreground hover:bg-accent'
 : 'border-transparent text-muted-foreground/40 cursor-not-allowed'
 }`}
 dangerouslySetInnerHTML={{ __html: link.label }}
 />
 ))}
 </div>
 )}
 </div>
 </AppLayout>
 );
}
