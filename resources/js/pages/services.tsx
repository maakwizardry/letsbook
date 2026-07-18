import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { Check, Pencil, Tags, X } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
 { title: 'Services', href: '/services' },
];

interface ServiceItemRow {
 id: number;
 name: string;
 price: number;
 home_type_label: string | null;
}

interface ServiceCategory {
 category: string;
 items: ServiceItemRow[];
}

function formatMoney(value: number) {
 return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function useServiceItemEditor(item: ServiceItemRow) {
 const [isEditing, setIsEditing] = useState(false);
 const [name, setName] = useState(item.name);
 const [price, setPrice] = useState(String(item.price));
 const [pending, setPending] = useState(false);
 const [error, setError] = useState('');

 const startEdit = () => {
 setName(item.name);
 setPrice(String(item.price));
 setError('');
 setIsEditing(true);
 };

 const cancelEdit = () => {
 setIsEditing(false);
 setError('');
 };

 const priceValue = Number(price);
 const canSave = name.trim() !== '' && price.trim() !== '' && !Number.isNaN(priceValue) && priceValue >= 0;

 const save = () => {
 if (!canSave) return;
 setPending(true);
 setError('');
 router.patch(
 `/services/${item.id}`,
 { name: name.trim(), price: priceValue },
 {
 preserveScroll: true,
 onSuccess: () => setIsEditing(false),
 onError: (errors) => setError(Object.values(errors).flat().join(' ') || 'Could not save. Please try again.'),
 onFinish: () => setPending(false),
 },
 );
 };

 return { isEditing, name, price, setName, setPrice, startEdit, cancelEdit, save, pending, error, canSave };
}

function ServiceCard({ item, showHomeType }: { item: ServiceItemRow; showHomeType: boolean }) {
 const editor = useServiceItemEditor(item);

 if (editor.isEditing) {
 return (
 <div className="rounded-2xl border border-primary/40 bg-card p-4 shadow-sm">
 <div className="flex flex-col gap-2">
 <Input
 value={editor.name}
 onChange={(e) => editor.setName(e.target.value)}
 placeholder="Service name"
 className="text-sm"
 />
 <div className="flex items-center gap-2">
 <Input
 type="number"
 step="0.01"
 min="0"
 value={editor.price}
 onChange={(e) => editor.setPrice(e.target.value)}
 className="w-28 text-sm"
 />
 <Button type="button" size="icon" variant="ghost" onClick={editor.save} disabled={!editor.canSave || editor.pending} aria-label="Save">
 <Check className="h-4 w-4 text-success"/>
 </Button>
 <Button type="button" size="icon" variant="ghost" onClick={editor.cancelEdit} disabled={editor.pending} aria-label="Cancel">
 <X className="h-4 w-4 text-muted-foreground"/>
 </Button>
 </div>
 {editor.error && <p className="text-xs text-destructive">{editor.error}</p>}
 </div>
 </div>
 );
 }

 return (
 <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
 <div className="flex items-start justify-between gap-2">
 <div className="min-w-0">
 <div className="font-medium text-foreground">{item.name}</div>
 {showHomeType && <div className="mt-0.5 text-xs text-muted-foreground">{item.home_type_label}</div>}
 </div>
 <div className="flex items-center gap-1">
 <div className="font-semibold text-foreground whitespace-nowrap">{formatMoney(item.price)}</div>
 <Button type="button" size="icon" variant="ghost" onClick={editor.startEdit} aria-label="Edit service">
 <Pencil className="h-3.5 w-3.5 text-muted-foreground"/>
 </Button>
 </div>
 </div>
 </div>
 );
}

function ServiceTableRow({ item, showHomeType }: { item: ServiceItemRow; showHomeType: boolean }) {
 const editor = useServiceItemEditor(item);

 if (editor.isEditing) {
 return (
 <tr className="bg-accent/30">
 <td className="px-4 py-3">
 <Input value={editor.name} onChange={(e) => editor.setName(e.target.value)} className="h-8 text-sm"/>
 {editor.error && <p className="mt-1 text-xs text-destructive">{editor.error}</p>}
 </td>
 {showHomeType && <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">{item.home_type_label}</td>}
 <td className="px-4 py-3">
 <div className="flex items-center gap-2">
 <Input
 type="number"
 step="0.01"
 min="0"
 value={editor.price}
 onChange={(e) => editor.setPrice(e.target.value)}
 className="h-8 w-24 text-sm"
 />
 <Button type="button" size="icon" variant="ghost" onClick={editor.save} disabled={!editor.canSave || editor.pending} aria-label="Save">
 <Check className="h-4 w-4 text-success"/>
 </Button>
 <Button type="button" size="icon" variant="ghost" onClick={editor.cancelEdit} disabled={editor.pending} aria-label="Cancel">
 <X className="h-4 w-4 text-muted-foreground"/>
 </Button>
 </div>
 </td>
 </tr>
 );
 }

 return (
 <tr className="transition-colors hover:bg-accent/40">
 <td className="px-4 py-3 whitespace-nowrap font-medium text-foreground">{item.name}</td>
 {showHomeType && <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">{item.home_type_label}</td>}
 <td className="px-4 py-3 whitespace-nowrap">
 <div className="flex items-center justify-between gap-2">
 <span className="font-semibold text-foreground">{formatMoney(item.price)}</span>
 <Button type="button" size="icon" variant="ghost" onClick={editor.startEdit} aria-label="Edit service">
 <Pencil className="h-3.5 w-3.5 text-muted-foreground"/>
 </Button>
 </div>
 </td>
 </tr>
 );
}

export default function Services({ categories, total_count }: { categories: ServiceCategory[]; total_count: number }) {
 return (
 <AppLayout breadcrumbs={breadcrumbs}>
 <Head title="Services"/>
 <div className="mx-auto w-full max-w-6xl px-4 py-8">
 <div className="mb-6">
 <h1 className="text-2xl font-bold font-heading text-foreground">Services</h1>
 <p className="mt-1 text-sm text-muted-foreground">
 {total_count} service{total_count === 1 ? '' : 's'} across {categories.length} categor{categories.length === 1 ? 'y' : 'ies'}
 </p>
 </div>

 {categories.length === 0 ? (
 <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-20 text-center">
 <Tags className="mb-3 h-10 w-10 text-muted-foreground/40"/>
 <p className="text-muted-foreground">No services yet.</p>
 </div>
 ) : (
 <div className="flex flex-col gap-8">
 {categories.map((group) => {
 const showHomeType = group.items.some((item) => item.home_type_label);

 return (
 <div key={group.category}>
 <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-muted-foreground">{group.category}</h2>

 {/* Mobile: card list */}
 <div className="flex flex-col gap-3 sm:hidden">
 {group.items.map((item) => (
 <ServiceCard key={item.id} item={item} showHomeType={showHomeType}/>
 ))}
 </div>

 {/* Desktop / tablet: table */}
 <div className="hidden overflow-hidden rounded-2xl border border-border bg-card shadow-sm sm:block">
 <div className="overflow-x-auto">
 <table className="w-full text-sm">
 <thead>
 <tr className="border-b border-border bg-muted/40 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
 <th className="px-4 py-3 whitespace-nowrap">Service</th>
 {showHomeType && <th className="px-4 py-3 whitespace-nowrap">Home Type</th>}
 <th className="px-4 py-3 whitespace-nowrap">Price</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-border">
 {group.items.map((item) => (
 <ServiceTableRow key={item.id} item={item} showHomeType={showHomeType}/>
 ))}
 </tbody>
 </table>
 </div>
 </div>
 </div>
 );
 })}
 </div>
 )}
 </div>
 </AppLayout>
 );
}
