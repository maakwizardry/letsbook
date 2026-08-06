import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { Check, Plus, Pencil, Tags, X } from 'lucide-react';
import { FormEvent, useMemo, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
 { title: 'Services', href: '/services' },
];

interface ServiceItemRow {
 id: number;
 name: string;
 description: string | null;
 price: number;
 service_category_label: string | null;
 service_category_id: number | null;
 is_active: boolean;
}

interface ServiceCategoryGroup {
 category: string;
 items: ServiceItemRow[];
}

interface ServiceCategory {
 id: number;
 label: string;
}

function formatMoney(value: number) {
 return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function useServiceItemEditor(item: ServiceItemRow) {
 const [isEditing, setIsEditing] = useState(false);
 const [name, setName] = useState(item.name);
 const [description, setDescription] = useState(item.description ?? '');
 const [price, setPrice] = useState(String(item.price));
 const [pending, setPending] = useState(false);
 const [error, setError] = useState('');

 const startEdit = () => {
 setName(item.name);
 setDescription(item.description ?? '');
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
 { name: name.trim(), description: description.trim() || null, price: priceValue },
 {
 preserveScroll: true,
 onSuccess: () => setIsEditing(false),
 onError: (errors) => setError(Object.values(errors).flat().join(' ') || 'Could not save. Please try again.'),
 onFinish: () => setPending(false),
 },
 );
 };

 return { isEditing, name, description, price, setName, setDescription, setPrice, startEdit, cancelEdit, save, pending, error, canSave };
}

function useActiveToggle(item: ServiceItemRow) {
 const [pending, setPending] = useState(false);

 const toggle = () => {
 setPending(true);
 router.patch(
 `/services/${item.id}`,
 { is_active: !item.is_active },
 { preserveScroll: true, onFinish: () => setPending(false) },
 );
 };

 return { toggle, pending };
}

function ActiveToggleButton({ item }: { item: ServiceItemRow }) {
 const { toggle, pending } = useActiveToggle(item);

 return (
 <button
 type="button"
 onClick={toggle}
 disabled={pending}
 className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold transition-colors cursor-pointer disabled:cursor-not-allowed ${
 item.is_active
 ? 'bg-success/10 text-success border-success/20 hover:bg-success/15'
 : 'bg-muted text-muted-foreground border-border hover:bg-accent'
 }`}
 >
 {item.is_active ? <Check className="h-3 w-3"/> : null}
 {item.is_active ? 'Active' : 'Inactive'}
 </button>
 );
}

function NewServiceForm({
 serviceCategories,
 categoryOptions,
 onClose,
}: {
 serviceCategories: ServiceCategory[];
 categoryOptions: string[];
 onClose: () => void;
}) {
 const [name, setName] = useState('');
 const [description, setDescription] = useState('');
 const [price, setPrice] = useState('');
 const [category, setCategory] = useState('');
 const [serviceCategoryId, setServiceCategoryId] = useState('');
 const [pending, setPending] = useState(false);
 const [error, setError] = useState('');

 const priceValue = Number(price);
 const canSave = name.trim() !== '' && price.trim() !== '' && !Number.isNaN(priceValue) && priceValue >= 0;

 const submit = (e: FormEvent) => {
 e.preventDefault();
 if (!canSave) return;
 setPending(true);
 setError('');
 router.post(
 '/services',
 {
 name: name.trim(),
 description: description.trim() || null,
 price: priceValue,
 category: category.trim() || null,
 service_category_id: serviceCategoryId ? Number(serviceCategoryId) : null,
 },
 {
 preserveScroll: true,
 onSuccess: () => onClose(),
 onError: (errors) => setError(Object.values(errors).flat().join(' ') || 'Could not add service. Please try again.'),
 onFinish: () => setPending(false),
 },
 );
 };

 return (
 <form onSubmit={submit} className="mb-8 rounded-2xl border border-primary/30 bg-card p-5 shadow-sm">
 <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-foreground">Add a service</h2>
 <div className="grid gap-3 sm:grid-cols-2">
 <div className="grid gap-1.5">
 <Label htmlFor="new-service-name">Name</Label>
 <Input id="new-service-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Window Cleaning" required/>
 </div>
 <div className="grid gap-1.5">
 <Label htmlFor="new-service-price">Price</Label>
 <Input id="new-service-price" type="number" step="0.01" min="0" value={price} onChange={(e) => setPrice(e.target.value)} required/>
 </div>
 <div className="grid gap-1.5 sm:col-span-2">
 <Label htmlFor="new-service-description">Description <span className="font-normal text-muted-foreground">(optional)</span></Label>
 <Textarea
 id="new-service-description"
 value={description}
 onChange={(e) => setDescription(e.target.value)}
 placeholder="What's included in this service?"
 maxLength={2000}
 className="min-h-[60px] text-sm"
 />
 </div>
 <div className="grid gap-1.5">
 <Label htmlFor="new-service-category">Category <span className="font-normal text-muted-foreground">(optional)</span></Label>
 <Input id="new-service-category" list="service-category-options" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="e.g. Add-ons"/>
 <datalist id="service-category-options">
 {categoryOptions.map((c) => <option key={c} value={c}/>)}
 </datalist>
 </div>
 <div className="grid gap-1.5">
 <Label htmlFor="new-service-home-type">Home type <span className="font-normal text-muted-foreground">(optional)</span></Label>
 <select
 id="new-service-home-type"
 value={serviceCategoryId}
 onChange={(e) => setServiceCategoryId(e.target.value)}
 className="h-9 rounded-md border border-input bg-background px-3 text-sm"
 >
 <option value="">No specific home type (add-on)</option>
 {serviceCategories.map((ht) => (
 <option key={ht.id} value={ht.id}>{ht.label}</option>
 ))}
 </select>
 </div>
 </div>
 {error && <p className="mt-3 text-xs text-destructive">{error}</p>}
 <div className="mt-4 flex items-center gap-2">
 <Button type="submit" size="sm" disabled={!canSave || pending}>Add service</Button>
 <Button type="button" size="sm" variant="ghost" onClick={onClose} disabled={pending}>Cancel</Button>
 </div>
 </form>
 );
}

function ServiceCard({ item, showServiceCategory }: { item: ServiceItemRow; showServiceCategory: boolean }) {
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
 <Textarea
 value={editor.description}
 onChange={(e) => editor.setDescription(e.target.value)}
 placeholder="Description (optional)"
 maxLength={2000}
 className="min-h-[60px] text-sm"
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
 <div className={`rounded-2xl border border-border bg-card p-4 shadow-sm ${!item.is_active ? 'opacity-60' : ''}`}>
 <div className="flex items-start justify-between gap-2">
 <div className="min-w-0">
 <div className="flex items-center gap-1.5">
 <div className="font-medium text-foreground">{item.name}</div>
 {!item.is_active && (
 <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Inactive</span>
 )}
 </div>
 {item.description && <p className="mt-0.5 text-xs text-muted-foreground">{item.description}</p>}
 {showServiceCategory && <div className="mt-0.5 text-xs text-muted-foreground">{item.service_category_label}</div>}
 </div>
 <div className="flex items-center gap-1">
 <div className="font-semibold text-foreground whitespace-nowrap">{formatMoney(item.price)}</div>
 <ActiveToggleButton item={item}/>
 <Button type="button" size="icon" variant="ghost" onClick={editor.startEdit} aria-label="Edit service">
 <Pencil className="h-3.5 w-3.5 text-muted-foreground"/>
 </Button>
 </div>
 </div>
 </div>
 );
}

function ServiceTableRow({ item, showServiceCategory }: { item: ServiceItemRow; showServiceCategory: boolean }) {
 const editor = useServiceItemEditor(item);

 if (editor.isEditing) {
 return (
 <tr className="bg-accent/30">
 <td className="px-4 py-3">
 <Input value={editor.name} onChange={(e) => editor.setName(e.target.value)} className="h-8 text-sm"/>
 <Textarea
 value={editor.description}
 onChange={(e) => editor.setDescription(e.target.value)}
 placeholder="Description (optional)"
 maxLength={2000}
 className="mt-1.5 min-h-[50px] text-sm"
 />
 {editor.error && <p className="mt-1 text-xs text-destructive">{editor.error}</p>}
 </td>
 {showServiceCategory && <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">{item.service_category_label}</td>}
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
 <tr className={`transition-colors hover:bg-accent/40 ${!item.is_active ? 'opacity-60' : ''}`}>
 <td className="px-4 py-3 font-medium text-foreground">
 <div className="flex items-center gap-1.5">
 {item.name}
 {!item.is_active && (
 <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Inactive</span>
 )}
 </div>
 {item.description && <p className="mt-0.5 text-xs font-normal whitespace-normal text-muted-foreground">{item.description}</p>}
 </td>
 {showServiceCategory && <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">{item.service_category_label}</td>}
 <td className="px-4 py-3 whitespace-nowrap">
 <div className="flex items-center justify-between gap-2">
 <span className="font-semibold text-foreground">{formatMoney(item.price)}</span>
 <div className="flex items-center gap-1">
 <ActiveToggleButton item={item}/>
 <Button type="button" size="icon" variant="ghost" onClick={editor.startEdit} aria-label="Edit service">
 <Pencil className="h-3.5 w-3.5 text-muted-foreground"/>
 </Button>
 </div>
 </div>
 </td>
 </tr>
 );
}

export default function Services({
 categories,
 total_count,
 serviceCategories = [],
}: {
 categories: ServiceCategoryGroup[];
 total_count: number;
 serviceCategories?: ServiceCategory[];
}) {
 const [isAdding, setIsAdding] = useState(false);

 const categoryOptions = useMemo(() => categories.map((c) => c.category), [categories]);

 return (
 <AppLayout breadcrumbs={breadcrumbs}>
 <Head title="Services"/>
 <div className="mx-auto w-full max-w-6xl px-4 py-8">
 <div className="mb-6 flex items-start justify-between gap-4">
 <div>
 <h1 className="text-2xl font-bold font-heading text-foreground">Services</h1>
 <p className="mt-1 text-sm text-muted-foreground">
 {total_count} service{total_count === 1 ? '' : 's'} across {categories.length} categor{categories.length === 1 ? 'y' : 'ies'}
 </p>
 </div>
 {!isAdding && (
 <Button type="button" onClick={() => setIsAdding(true)} className="gap-1.5">
 <Plus className="h-4 w-4"/>
 Add service
 </Button>
 )}
 </div>

 {isAdding && (
 <NewServiceForm serviceCategories={serviceCategories} categoryOptions={categoryOptions} onClose={() => setIsAdding(false)}/>
 )}

 {categories.length === 0 ? (
 <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-20 text-center">
 <Tags className="mb-3 h-10 w-10 text-muted-foreground/40"/>
 <p className="text-muted-foreground">No services yet.</p>
 </div>
 ) : (
 <div className="flex flex-col gap-8">
 {categories.map((group) => {
 const showServiceCategory = group.items.some((item) => item.service_category_label);

 return (
 <div key={group.category}>
 <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-muted-foreground">{group.category}</h2>

 {/* Mobile: card list */}
 <div className="flex flex-col gap-3 sm:hidden">
 {group.items.map((item) => (
 <ServiceCard key={item.id} item={item} showServiceCategory={showServiceCategory}/>
 ))}
 </div>

 {/* Desktop / tablet: table */}
 <div className="hidden overflow-hidden rounded-2xl border border-border bg-card shadow-sm sm:block">
 <div className="overflow-x-auto">
 <table className="w-full text-sm">
 <thead>
 <tr className="border-b border-border bg-muted/40 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
 <th className="px-4 py-3 whitespace-nowrap">Service</th>
 {showServiceCategory && <th className="px-4 py-3 whitespace-nowrap">Home Type</th>}
 <th className="px-4 py-3 whitespace-nowrap">Price</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-border">
 {group.items.map((item) => (
 <ServiceTableRow key={item.id} item={item} showServiceCategory={showServiceCategory}/>
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
