import AppLayout from '@/layouts/app-layout';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import InputError from '@/components/input-error';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { Banknote, CalendarPlus, CalendarRange, Check, ChevronDown, LoaderCircle, Landmark, PackageCheck, Pencil, Plus, Repeat, X } from 'lucide-react';
import { buildGoogleCalendarUrl, parseFloatingIsoDateTime } from '@/lib/google-calendar';
import { AddressAutocomplete, type SelectedAddress } from '@/components/address-autocomplete';

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
 buzz_code: string | null;
 building_instructions: string | null;
 postal_code: string | null;
 latitude: number | null;
 longitude: number | null;
}

interface HomeType {
 id: number;
 label: string;
}

interface BookingSeriesSummary {
 id: number;
 frequency: 'weekly' | 'biweekly' | 'monthly';
}

interface Booking {
 id: number;
 reference_id: string;
 scheduled_at: string;
 duration_hours: number;
 total_quote: number;
 payment_method: 'cash' | 'etransfer' | null;
 status: string;
 is_paid: boolean;
 items_count: number;
 items: { service_item_id: number }[];
 notes: string | null;
 reminder_minutes_before: number | null;
 customer: Customer | null;
 home_type: HomeType | null;
 booking_series: BookingSeriesSummary | null;
}

const FREQUENCY_LABELS: Record<BookingSeriesSummary['frequency'], string> = {
 weekly: 'Repeats weekly',
 biweekly: 'Repeats bi-weekly',
 monthly: 'Repeats monthly',
};

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

interface Filters {
 status: string;
 paid: string;
 date_from: string | null;
 date_to: string | null;
}

interface ServiceItem {
 id: number;
 name: string;
 price: number;
 home_type_id: number | null;
}

interface ServiceItemCategory {
 category: string;
 items: ServiceItem[];
}

const DURATION_HOUR_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8];

const REMINDER_OPTIONS = [
 { value: '30', label: '30 minutes before' },
 { value: '60', label: '1 hour before' },
 { value: '180', label: '3 hours before' },
 { value: '1440', label: '1 day before' },
];

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
 durationHours: booking.duration_hours,
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

// Shared by the New booking and Edit booking dialogs — everything about a
// booking except New-only recurrence settings, so both forms stay visually
// and behaviorally identical without duplicating the field markup.
interface BookingFormFieldsData {
 home_type_id: string;
 service_item_ids: number[];
 customer_name: string;
 customer_phone: string;
 customer_email: string;
 customer_address: string;
 latitude: number | null;
 longitude: number | null;
 unit_number: string;
 buzz_code: string;
 building_instructions: string;
 postal_code: string;
 scheduled_date: string;
 scheduled_time: string;
 duration_hours: string;
 payment_method: 'cash' | 'etransfer' | '';
 reminder_minutes_before: string;
 notes: string;
}

interface NewBookingForm extends BookingFormFieldsData {
 is_recurring: boolean;
 frequency: 'weekly' | 'biweekly' | 'monthly' | '';
 days_of_week: number[];
 ends_type: 'never' | 'count' | 'date';
 ends_count: string;
 ends_on: string;
}

type EditBookingFormData = BookingFormFieldsData;

const emptyNewBookingForm: NewBookingForm = {
 home_type_id: '',
 service_item_ids: [],
 customer_name: '',
 customer_phone: '',
 customer_email: '',
 customer_address: '',
 latitude: null,
 longitude: null,
 unit_number: '',
 buzz_code: '',
 building_instructions: '',
 postal_code: '',
 scheduled_date: '',
 scheduled_time: '',
 duration_hours: '1',
 payment_method: '',
 reminder_minutes_before: '',
 notes: '',
 is_recurring: false,
 frequency: '',
 days_of_week: [],
 ends_type: 'never',
 ends_count: '4',
 ends_on: '',
};

/**
 * The full set of booking fields (client, address, home type/services,
 * schedule, payment, reminder, notes) shared by New booking and Edit
 * booking. `setData`/`data` are typed loosely against `any` because
 * Inertia's generic `useForm<T>()` setter doesn't collapse cleanly into a
 * single non-generic function type — callers pass their own `useForm`
 * instance's `data`/`setData` straight through, so real key/value pairing
 * is still enforced at each call site.
 */
function BookingFormFields({
 data,
 setData,
 errors,
 homeTypes,
 serviceItemCategories,
 selectedAddress,
 onAddressChange,
 afterDuration,
}: {
 data: BookingFormFieldsData;
 setData: (key: any, value?: any) => void;
 errors: Partial<Record<string, string>>;
 homeTypes: HomeType[];
 serviceItemCategories: ServiceItemCategory[];
 selectedAddress: SelectedAddress | null;
 onAddressChange: (address: SelectedAddress | null) => void;
 afterDuration?: React.ReactNode;
}) {
 const [addressOpen, setAddressOpen] = useState(false);

 const allItems = useMemo(() => serviceItemCategories.flatMap((c) => c.items), [serviceItemCategories]);

 const availableItems = useMemo(() => {
 const homeTypeId = data.home_type_id ? Number(data.home_type_id) : null;
 return serviceItemCategories
 .map((category) => ({
 category: category.category,
 items: category.items.filter((item) => item.home_type_id === null || item.home_type_id === homeTypeId),
 }))
 .filter((category) => category.items.length > 0);
 }, [serviceItemCategories, data.home_type_id]);

 const total = useMemo(
 () => data.service_item_ids.reduce((sum, id) => sum + (allItems.find((item) => item.id === id)?.price ?? 0), 0),
 [data.service_item_ids, allItems],
 );

 const toggleItem = (id: number, checked: boolean) => {
 setData('service_item_ids', checked ? [...data.service_item_ids, id] : data.service_item_ids.filter((i) => i !== id));
 };

 const onHomeTypeChange = (value: string) => {
 const homeTypeId = Number(value);
 setData((prev: BookingFormFieldsData) => ({
 ...prev,
 home_type_id: value,
 service_item_ids: prev.service_item_ids.filter((id) => {
 const item = allItems.find((i) => i.id === id);
 return item && (item.home_type_id === null || item.home_type_id === homeTypeId);
 }),
 }));
 };

 return (
 <>
 <div className="grid gap-3">
 <div className="grid gap-1.5">
 <Label htmlFor="customer_name">Client name</Label>
 <Input id="customer_name" value={data.customer_name} onChange={(e) => setData('customer_name', e.target.value)} required/>
 <InputError message={errors.customer_name}/>
 </div>

 <div className="grid grid-cols-2 gap-3">
 <div className="grid gap-1.5">
 <Label htmlFor="customer_phone">Phone</Label>
 <Input id="customer_phone" value={data.customer_phone} onChange={(e) => setData('customer_phone', e.target.value)}/>
 <InputError message={errors.customer_phone}/>
 </div>
 <div className="grid gap-1.5">
 <Label htmlFor="customer_email">Email</Label>
 <Input id="customer_email" type="email" value={data.customer_email} onChange={(e) => setData('customer_email', e.target.value)}/>
 <InputError message={errors.customer_email}/>
 </div>
 </div>
 <p className="text-xs text-muted-foreground -mt-1">At least a phone or an email is required, so this client is remembered next time.</p>

 <div className="grid gap-1.5">
 <Label>Address</Label>
 <AddressAutocomplete value={selectedAddress} onChange={onAddressChange}/>
 <InputError message={errors.customer_address}/>
 </div>

 <Collapsible open={addressOpen} onOpenChange={setAddressOpen}>
 <CollapsibleTrigger type="button" className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground cursor-pointer">
 <ChevronDown className={`h-3.5 w-3.5 transition-transform ${addressOpen ? 'rotate-180' : ''}`}/>
 Unit, buzz code, building instructions
 </CollapsibleTrigger>
 <CollapsibleContent className="grid gap-3 pt-3">
 <div className="grid grid-cols-2 gap-3">
 <div className="grid gap-1.5">
 <Label htmlFor="unit_number">Unit number</Label>
 <Input id="unit_number" value={data.unit_number} onChange={(e) => setData('unit_number', e.target.value)}/>
 </div>
 <div className="grid gap-1.5">
 <Label htmlFor="buzz_code">Buzz code</Label>
 <Input id="buzz_code" value={data.buzz_code} onChange={(e) => setData('buzz_code', e.target.value)}/>
 </div>
 </div>
 <div className="grid gap-1.5">
 <Label htmlFor="postal_code">Postal code</Label>
 <Input id="postal_code" value={data.postal_code} onChange={(e) => setData('postal_code', e.target.value)}/>
 </div>
 <div className="grid gap-1.5">
 <Label htmlFor="building_instructions">Building instructions</Label>
 <textarea
 id="building_instructions"
 value={data.building_instructions}
 onChange={(e) => setData('building_instructions', e.target.value)}
 rows={2}
 className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
 />
 </div>
 </CollapsibleContent>
 </Collapsible>
 </div>

 <div className="grid gap-1.5">
 <Label htmlFor="home_type_id">Home type</Label>
 <Select value={data.home_type_id} onValueChange={onHomeTypeChange}>
 <SelectTrigger id="home_type_id" className="w-full">
 <SelectValue placeholder="Select a home type"/>
 </SelectTrigger>
 <SelectContent>
 {homeTypes.map((ht) => (
 <SelectItem key={ht.id} value={String(ht.id)}>{ht.label}</SelectItem>
 ))}
 </SelectContent>
 </Select>
 <InputError message={errors.home_type_id}/>
 </div>

 {data.home_type_id && (
 <div className="grid gap-3">
 <Label>Services</Label>
 <div className="flex flex-col gap-3 rounded-md border border-border p-3">
 {availableItems.map((category) => (
 <div key={category.category} className="grid gap-1.5">
 <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{category.category}</p>
 {category.items.map((item) => (
 <label key={item.id} className="flex items-center gap-2 text-sm cursor-pointer">
 <Checkbox checked={data.service_item_ids.includes(item.id)} onCheckedChange={(checked) => toggleItem(item.id, checked === true)}/>
 <span className="flex-1">{item.name}</span>
 <span className="text-muted-foreground">${item.price.toFixed(2)}</span>
 </label>
 ))}
 </div>
 ))}
 {availableItems.length === 0 && <p className="text-sm text-muted-foreground">No services set up for this home type yet.</p>}
 </div>
 <InputError message={errors.service_item_ids}/>
 <div className="flex items-center justify-between text-sm font-semibold">
 <span>Total</span>
 <span>${total.toFixed(2)}</span>
 </div>
 </div>
 )}

 <div className="grid grid-cols-2 gap-3">
 <div className="grid gap-1.5">
 <Label htmlFor="scheduled_date">Date</Label>
 <Input id="scheduled_date" type="date" value={data.scheduled_date} onChange={(e) => setData('scheduled_date', e.target.value)} required/>
 <InputError message={errors.scheduled_at}/>
 </div>
 <div className="grid gap-1.5">
 <Label htmlFor="scheduled_time">Time</Label>
 <Input id="scheduled_time" type="time" value={data.scheduled_time} onChange={(e) => setData('scheduled_time', e.target.value)} required/>
 </div>
 </div>

 <div className="grid gap-1.5">
 <Label htmlFor="duration_hours">Duration</Label>
 <Select value={data.duration_hours} onValueChange={(v) => setData('duration_hours', v)}>
 <SelectTrigger id="duration_hours" className="w-full">
 <SelectValue placeholder="Select duration"/>
 </SelectTrigger>
 <SelectContent>
 {DURATION_HOUR_OPTIONS.map((hours) => (
 <SelectItem key={hours} value={String(hours)}>{hours} hour{hours === 1 ? '' : 's'}</SelectItem>
 ))}
 </SelectContent>
 </Select>
 <InputError message={errors.duration_hours}/>
 </div>

 {afterDuration}

 <div className="grid gap-1.5">
 <Label htmlFor="payment_method">Payment method</Label>
 <Select value={data.payment_method} onValueChange={(v) => setData('payment_method', v as 'cash' | 'etransfer')}>
 <SelectTrigger id="payment_method" className="w-full">
 <SelectValue placeholder="Select payment method"/>
 </SelectTrigger>
 <SelectContent>
 <SelectItem value="cash">Cash</SelectItem>
 <SelectItem value="etransfer">E-transfer</SelectItem>
 </SelectContent>
 </Select>
 <InputError message={errors.payment_method}/>
 </div>

 <div className="grid gap-1.5">
 <Label htmlFor="reminder_minutes_before">Reminder email</Label>
 <Select
 value={data.reminder_minutes_before || 'none'}
 onValueChange={(v) => setData('reminder_minutes_before', v === 'none' ? '' : v)}
 disabled={!data.customer_email}
 >
 <SelectTrigger id="reminder_minutes_before" className="w-full">
 <SelectValue placeholder="No reminder"/>
 </SelectTrigger>
 <SelectContent>
 <SelectItem value="none">No reminder</SelectItem>
 {REMINDER_OPTIONS.map((opt) => (
 <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
 ))}
 </SelectContent>
 </Select>
 {!data.customer_email && <p className="text-xs text-muted-foreground">Add an email to send a reminder.</p>}
 </div>

 <div className="grid gap-1.5">
 <Label htmlFor="notes">Notes</Label>
 <textarea
 id="notes"
 value={data.notes}
 onChange={(e) => setData('notes', e.target.value)}
 rows={2}
 className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
 />
 </div>
 </>
 );
}

function NewBookingDialog({ homeTypes, serviceItemCategories }: { homeTypes: HomeType[]; serviceItemCategories: ServiceItemCategory[] }) {
 const [open, setOpen] = useState(false);
 const [selectedAddress, setSelectedAddress] = useState<SelectedAddress | null>(null);
 const { data, setData, post, processing, errors, reset, clearErrors, transform } = useForm<NewBookingForm>(emptyNewBookingForm);

 const onAddressChange = (address: SelectedAddress | null) => {
 setSelectedAddress(address);
 setData((prev) => ({
 ...prev,
 customer_address: address?.displayName ?? '',
 latitude: address?.lat ?? null,
 longitude: address?.lon ?? null,
 postal_code: address?.postcode || prev.postal_code,
 }));
 };

 const scheduledDateWeekday = (): number | null => {
 if (!data.scheduled_date) return null;
 return new Date(`${data.scheduled_date}T00:00:00`).getDay();
 };

 const onIsRecurringChange = (checked: boolean) => {
 setData((prev) => {
 const defaultDay = scheduledDateWeekday();
 return {
 ...prev,
 is_recurring: checked,
 days_of_week: checked && prev.days_of_week.length === 0 && defaultDay !== null ? [defaultDay] : prev.days_of_week,
 };
 });
 };

 const onFrequencyChange = (value: 'weekly' | 'biweekly' | 'monthly') => {
 setData((prev) => {
 const defaultDay = scheduledDateWeekday();
 return {
 ...prev,
 frequency: value,
 days_of_week: (value === 'weekly' || value === 'biweekly') && prev.days_of_week.length === 0 && defaultDay !== null ? [defaultDay] : prev.days_of_week,
 };
 });
 };

 const toggleDay = (day: number) => {
 setData('days_of_week', data.days_of_week.includes(day) ? data.days_of_week.filter((d) => d !== day) : [...data.days_of_week, day].sort());
 };

 const close = () => {
 setOpen(false);
 reset();
 clearErrors();
 setSelectedAddress(null);
 };

 const submit = (e: FormEvent) => {
 e.preventDefault();
 transform((formData) => {
 const { scheduled_date, scheduled_time, duration_hours, is_recurring, frequency, days_of_week, ends_type, ends_count, ends_on, ...rest } = formData;
 const scheduled_at = `${scheduled_date} ${scheduled_time || '00:00'}:00`;

 if (!is_recurring) {
 return { ...rest, scheduled_at, duration_hours: Number(duration_hours), is_recurring: false };
 }

 return {
 ...rest,
 scheduled_at,
 duration_hours: Number(duration_hours),
 is_recurring: true,
 frequency,
 days_of_week: frequency === 'monthly' ? null : days_of_week,
 ends_type,
 ends_count: ends_type === 'count' ? Number(ends_count) : null,
 ends_on: ends_type === 'date' ? ends_on : null,
 };
 });
 post('/bookings', {
 preserveScroll: true,
 onSuccess: () => close(),
 });
 };

 return (
 <Dialog open={open} onOpenChange={(next) => (next ? setOpen(true) : close())}>
 <Button type="button" onClick={() => setOpen(true)} className="gap-1.5">
 <Plus className="h-4 w-4"/>
 New booking
 </Button>
 <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
 <DialogHeader>
 <DialogTitle>New booking</DialogTitle>
 <DialogDescription>Add a booking for a client you already had, or one who booked by phone or text.</DialogDescription>
 </DialogHeader>

 <form onSubmit={submit} className="grid gap-5">
 <BookingFormFields
 data={data}
 setData={setData}
 errors={errors}
 homeTypes={homeTypes}
 serviceItemCategories={serviceItemCategories}
 selectedAddress={selectedAddress}
 onAddressChange={onAddressChange}
 afterDuration={
 <div className="grid gap-3 rounded-md border border-border p-3">
 <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
 <Checkbox checked={data.is_recurring} onCheckedChange={(checked) => onIsRecurringChange(checked === true)}/>
 Repeat this booking
 </label>

 {data.is_recurring && (
 <div className="grid gap-3 pl-1">
 <div className="grid gap-1.5">
 <Label htmlFor="frequency">Frequency</Label>
 <Select value={data.frequency} onValueChange={(v) => onFrequencyChange(v as 'weekly' | 'biweekly' | 'monthly')}>
 <SelectTrigger id="frequency" className="w-full">
 <SelectValue placeholder="Select frequency"/>
 </SelectTrigger>
 <SelectContent>
 <SelectItem value="weekly">Weekly</SelectItem>
 <SelectItem value="biweekly">Bi-weekly</SelectItem>
 <SelectItem value="monthly">Monthly</SelectItem>
 </SelectContent>
 </Select>
 <InputError message={errors.frequency}/>
 </div>

 {(data.frequency === 'weekly' || data.frequency === 'biweekly') && (
 <div className="grid gap-1.5">
 <Label>Repeats on</Label>
 <div className="flex flex-wrap gap-1.5">
 {DAY_LABELS.map((label, day) => (
 <button
 key={day}
 type="button"
 onClick={() => toggleDay(day)}
 className={`rounded-full border px-2.5 py-1 text-xs font-medium cursor-pointer ${
 data.days_of_week.includes(day)
 ? 'border-primary/30 bg-primary/10 text-primary'
 : 'border-border text-foreground hover:bg-accent'
 }`}
 >
 {label}
 </button>
 ))}
 </div>
 <InputError message={errors.days_of_week}/>
 </div>
 )}

 <div className="grid gap-1.5">
 <Label>Ends</Label>
 <div className="flex flex-col gap-2">
 <label className="flex items-center gap-2 text-sm cursor-pointer">
 <input type="radio" name="ends_type" checked={data.ends_type === 'never'} onChange={() => setData('ends_type', 'never')}/>
 Never
 </label>
 <label className="flex items-center gap-2 text-sm cursor-pointer">
 <input type="radio" name="ends_type" checked={data.ends_type === 'count'} onChange={() => setData('ends_type', 'count')}/>
 After
 <Input
 type="number"
 min={2}
 value={data.ends_count}
 onChange={(e) => setData((prev) => ({ ...prev, ends_count: e.target.value, ends_type: 'count' }))}
 className="h-8 w-20"
 />
 times
 </label>
 <label className="flex items-center gap-2 text-sm cursor-pointer">
 <input type="radio" name="ends_type" checked={data.ends_type === 'date'} onChange={() => setData('ends_type', 'date')}/>
 On
 <Input
 type="date"
 value={data.ends_on}
 onChange={(e) => setData((prev) => ({ ...prev, ends_on: e.target.value, ends_type: 'date' }))}
 className="h-8 w-auto"
 />
 </label>
 </div>
 <InputError message={errors.ends_count}/>
 <InputError message={errors.ends_on}/>
 </div>
 </div>
 )}
 </div>
 }
 />

 <Button type="submit" disabled={processing || !selectedAddress} className="mt-2 w-full">
 {processing && <LoaderCircle className="h-4 w-4 animate-spin"/>}
 Add booking
 </Button>
 </form>
 </DialogContent>
 </Dialog>
 );
}

function bookingToEditForm(booking: Booking): EditBookingFormData {
 const scheduled = parseFloatingIsoDateTime(booking.scheduled_at);

 return {
 home_type_id: booking.home_type ? String(booking.home_type.id) : '',
 service_item_ids: booking.items.map((item) => item.service_item_id),
 customer_name: booking.customer?.name ?? '',
 customer_phone: booking.customer?.phone ?? '',
 customer_email: booking.customer?.email ?? '',
 customer_address: booking.customer?.address ?? '',
 latitude: booking.customer?.latitude ?? null,
 longitude: booking.customer?.longitude ?? null,
 unit_number: booking.customer?.unit_number ?? '',
 buzz_code: booking.customer?.buzz_code ?? '',
 building_instructions: booking.customer?.building_instructions ?? '',
 postal_code: booking.customer?.postal_code ?? '',
 scheduled_date: toISODate(scheduled),
 scheduled_time: `${String(scheduled.getHours()).padStart(2, '0')}:${String(scheduled.getMinutes()).padStart(2, '0')}`,
 duration_hours: String(booking.duration_hours),
 payment_method: booking.payment_method ?? '',
 reminder_minutes_before: booking.reminder_minutes_before ? String(booking.reminder_minutes_before) : '',
 notes: booking.notes ?? '',
 };
}

function bookingToSelectedAddress(booking: Booking): SelectedAddress | null {
 if (!booking.customer?.address) return null;
 return {
 displayName: booking.customer.address,
 lat: booking.customer.latitude ?? 0,
 lon: booking.customer.longitude ?? 0,
 postcode: booking.customer.postal_code ?? '',
 };
}

/**
 * The actual form, keyed by `booking.id` from the parent dialog so switching
 * which booking is being edited remounts it fresh — simpler than syncing a
 * `useForm` instance's data across prop changes with useEffect.
 */
function EditBookingForm({
 booking,
 homeTypes,
 serviceItemCategories,
 onClose,
}: {
 booking: Booking;
 homeTypes: HomeType[];
 serviceItemCategories: ServiceItemCategory[];
 onClose: () => void;
}) {
 const [selectedAddress, setSelectedAddress] = useState<SelectedAddress | null>(() => bookingToSelectedAddress(booking));
 const { data, setData, patch, processing, errors, transform } = useForm<EditBookingFormData>(bookingToEditForm(booking));

 const onAddressChange = (address: SelectedAddress | null) => {
 setSelectedAddress(address);
 setData((prev) => ({
 ...prev,
 customer_address: address?.displayName ?? '',
 latitude: address?.lat ?? null,
 longitude: address?.lon ?? null,
 postal_code: address?.postcode || prev.postal_code,
 }));
 };

 const submit = (e: FormEvent) => {
 e.preventDefault();
 transform((formData) => {
 const { scheduled_date, scheduled_time, duration_hours, ...rest } = formData;
 return {
 ...rest,
 scheduled_at: `${scheduled_date} ${scheduled_time || '00:00'}:00`,
 duration_hours: Number(duration_hours),
 };
 });
 patch(`/bookings/${booking.id}`, {
 preserveScroll: true,
 onSuccess: () => onClose(),
 });
 };

 return (
 <form onSubmit={submit} className="grid gap-5">
 <BookingFormFields
 data={data}
 setData={setData}
 errors={errors}
 homeTypes={homeTypes}
 serviceItemCategories={serviceItemCategories}
 selectedAddress={selectedAddress}
 onAddressChange={onAddressChange}
 />

 <Button type="submit" disabled={processing || !selectedAddress} className="mt-2 w-full">
 {processing && <LoaderCircle className="h-4 w-4 animate-spin"/>}
 Save changes
 </Button>
 </form>
 );
}

function EditBookingDialog({
 booking,
 onClose,
 homeTypes,
 serviceItemCategories,
}: {
 booking: Booking | null;
 onClose: () => void;
 homeTypes: HomeType[];
 serviceItemCategories: ServiceItemCategory[];
}) {
 return (
 <Dialog open={!!booking} onOpenChange={(next) => !next && onClose()}>
 <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
 <DialogHeader>
 <DialogTitle>Edit booking</DialogTitle>
 <DialogDescription>Update the time, services, or details for this booking.</DialogDescription>
 </DialogHeader>

 {booking && (
 <EditBookingForm key={booking.id} booking={booking} homeTypes={homeTypes} serviceItemCategories={serviceItemCategories} onClose={onClose}/>
 )}
 </DialogContent>
 </Dialog>
 );
}

export default function Orders({
 bookings,
 statuses,
 filters,
 homeTypes,
 serviceItemCategories,
}: {
 bookings: Booking[];
 statuses: string[];
 filters: Filters;
 homeTypes: HomeType[];
 serviceItemCategories: ServiceItemCategory[];
}) {
 const [pendingIds, setPendingIds] = useState<Set<number>>(new Set());
 const [status, setStatus] = useState(filters.status ?? 'all');
 const [paid, setPaid] = useState(filters.paid ?? 'all');
 const [dateFrom, setDateFrom] = useState(filters.date_from ?? '');
 const [dateTo, setDateTo] = useState(filters.date_to ?? '');
 const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
 const isEditable = (booking: Booking) => booking.status !== 'Cancelled' && booking.status !== 'Completed';

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

 const stopRepeating = (booking: Booking) => {
 if (!booking.booking_series) return;
 if (!confirm('Stop repeating this booking? Already-scheduled future bookings will stay on your calendar — you can cancel them individually if needed.')) return;
 router.patch(`/booking-series/${booking.booking_series.id}`, {}, { preserveScroll: true });
 };

 const cancelBooking = (booking: Booking) => {
 if (booking.status === 'Cancelled' || booking.status === 'Completed') return;
 const seriesNote = booking.booking_series ? ' This only cancels this occurrence — the repeating series will continue.' : '';
 if (!confirm(`Cancel this booking for ${booking.customer?.name ?? 'this customer'}?${seriesNote} The customer will be emailed.`)) return;
 updateStatus(booking, 'Cancelled');
 };

 return (
 <AppLayout breadcrumbs={breadcrumbs}>
 <Head title="Orders"/>
 <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:py-8">
 <div className="mb-6 flex items-start justify-between gap-4">
 <div>
 <h1 className="text-2xl font-bold font-heading text-foreground">Orders</h1>
 <p className="text-sm text-muted-foreground mt-1">{bookings.length} booking{bookings.length === 1 ? '' : 's'}{hasActiveFilters ? ' matching filters' : ' total'}</p>
 </div>
 <NewBookingDialog homeTypes={homeTypes} serviceItemCategories={serviceItemCategories}/>
 </div>

 <EditBookingDialog
 booking={editingBooking}
 onClose={() => setEditingBooking(null)}
 homeTypes={homeTypes}
 serviceItemCategories={serviceItemCategories}
 />

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
 <div className="flex items-center gap-1.5">
 <span className="font-mono text-xs font-semibold text-foreground">{booking.reference_id}</span>
 {booking.booking_series && (
 <span title={FREQUENCY_LABELS[booking.booking_series.frequency]}>
 <Repeat className="h-3 w-3 text-muted-foreground"/>
 </span>
 )}
 </div>
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
 {isEditable(booking) && (
 <button
 onClick={() => setEditingBooking(booking)}
 disabled={isPending}
 title="Edit booking"
 className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border text-muted-foreground hover:bg-accent hover:text-accent-foreground disabled:cursor-not-allowed cursor-pointer"
 >
 <Pencil className="w-4 h-4"/>
 </button>
 )}
 {booking.status !== 'Cancelled' && booking.status !== 'Completed' && (
 <button
 onClick={() => cancelBooking(booking)}
 disabled={isPending}
 title="Cancel booking"
 className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border text-muted-foreground hover:bg-destructive/10 hover:border-destructive/20 hover:text-destructive disabled:cursor-not-allowed cursor-pointer"
 >
 <X className="w-4 h-4"/>
 </button>
 )}
 </div>
 {booking.booking_series && (
 <button onClick={() => stopRepeating(booking)} className="mt-2 text-xs font-medium text-muted-foreground hover:text-foreground cursor-pointer">
 Stop repeating
 </button>
 )}
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
 <td className="px-4 py-3 font-mono text-xs font-semibold text-foreground whitespace-nowrap">
 <span className="inline-flex items-center gap-1.5">
 {booking.reference_id}
 {booking.booking_series && (
 <span title={FREQUENCY_LABELS[booking.booking_series.frequency]}>
 <Repeat className="h-3 w-3 text-muted-foreground"/>
 </span>
 )}
 </span>
 </td>
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
 <div className="flex items-center gap-2">
 <a
 href={bookingCalendarUrl(booking)}
 target="_blank"
 rel="noopener noreferrer"
 title="Add to Google Calendar"
 className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border text-muted-foreground hover:bg-accent hover:text-accent-foreground"
 >
 <CalendarPlus className="w-4 h-4"/>
 </a>
 {isEditable(booking) && (
 <button
 onClick={() => setEditingBooking(booking)}
 disabled={isPending}
 title="Edit booking"
 className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border text-muted-foreground hover:bg-accent hover:text-accent-foreground disabled:cursor-not-allowed cursor-pointer"
 >
 <Pencil className="w-4 h-4"/>
 </button>
 )}
 {booking.status !== 'Cancelled' && booking.status !== 'Completed' && (
 <button
 onClick={() => cancelBooking(booking)}
 disabled={isPending}
 title="Cancel booking"
 className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border text-muted-foreground hover:bg-destructive/10 hover:border-destructive/20 hover:text-destructive disabled:cursor-not-allowed cursor-pointer"
 >
 <X className="w-4 h-4"/>
 </button>
 )}
 {booking.booking_series && (
 <button onClick={() => stopRepeating(booking)} className="text-xs font-medium text-muted-foreground hover:text-foreground cursor-pointer whitespace-nowrap">
 Stop repeating
 </button>
 )}
 </div>
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
