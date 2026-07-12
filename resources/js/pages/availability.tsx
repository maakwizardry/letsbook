import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { Clock, Plus, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
 { title: 'Availability', href: '/availability' },
];

const DAY_LABELS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

interface ScheduleRange {
 id?: number;
 day_of_week: number;
 start_time: string;
 end_time: string;
}

interface Range {
 start: string;
 end: string;
}

interface DayRow {
 dayOfWeek: number;
 label: string;
 enabled: boolean;
 ranges: Range[];
}

function addHour(time: string): string {
 const [h, m] = time.split(':').map(Number);
 const nextHour = Math.min(h + 1, 23);
 return `${String(nextHour).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function buildInitialDays(schedule: ScheduleRange[]): DayRow[] {
 return DAY_LABELS.map((label, dayOfWeek) => {
 const ranges = schedule
 .filter((s) => s.day_of_week === dayOfWeek)
 .map((s) => ({ start: s.start_time, end: s.end_time }));

 return {
 dayOfWeek,
 label,
 enabled: ranges.length > 0,
 ranges: ranges.length > 0 ? ranges : [{ start: '09:00', end: '17:00' }],
 };
 });
}

function serializeForCompare(days: DayRow[]) {
 return JSON.stringify(
 days.map((d) => (d.enabled ? d.ranges.map((r) => `${r.start}-${r.end}`) : [])),
 );
}

export default function Availability({ schedule }: { schedule: ScheduleRange[] }) {
 const [days, setDays] = useState<DayRow[]>(() => buildInitialDays(schedule));
 const [initialSnapshot] = useState(() => serializeForCompare(buildInitialDays(schedule)));
 const [isSaving, setIsSaving] = useState(false);
 const [error, setError] = useState('');
 const [justSaved, setJustSaved] = useState(false);

 const isDirty = useMemo(() => serializeForCompare(days) !== initialSnapshot, [days, initialSnapshot]);

 const hasInvalidRange = useMemo(
 () => days.some((d) => d.enabled && d.ranges.some((r) => !r.start || !r.end || r.end <= r.start)),
 [days],
 );

 const toggleDay = (dayOfWeek: number) => {
 setJustSaved(false);
 setDays((prev) =>
 prev.map((d) => (d.dayOfWeek === dayOfWeek ? { ...d, enabled: !d.enabled } : d)),
 );
 };

 const addRange = (dayOfWeek: number) => {
 setJustSaved(false);
 setDays((prev) =>
 prev.map((d) => {
 if (d.dayOfWeek !== dayOfWeek) return d;
 const last = d.ranges[d.ranges.length - 1];
 const start = last ? addHour(last.end) : '09:00';
 return { ...d, ranges: [...d.ranges, { start, end: addHour(start) }] };
 }),
 );
 };

 const removeRange = (dayOfWeek: number, index: number) => {
 setJustSaved(false);
 setDays((prev) =>
 prev.map((d) => (d.dayOfWeek === dayOfWeek ? { ...d, ranges: d.ranges.filter((_, i) => i !== index) } : d)),
 );
 };

 const updateRange = (dayOfWeek: number, index: number, field: keyof Range, value: string) => {
 setJustSaved(false);
 setDays((prev) =>
 prev.map((d) => {
 if (d.dayOfWeek !== dayOfWeek) return d;
 const ranges = d.ranges.map((r, i) => (i === index ? { ...r, [field]: value } : r));
 return { ...d, ranges };
 }),
 );
 };

 const handleSave = () => {
 if (hasInvalidRange) return;

 const flattened = days.flatMap((d) =>
 d.enabled ? d.ranges.map((r) => ({ day_of_week: d.dayOfWeek, start_time: r.start, end_time: r.end })) : [],
 );

 setIsSaving(true);
 setError('');
 router.put(
 '/availability',
 { schedule: flattened },
 {
 preserveScroll: true,
 onSuccess: () => setJustSaved(true),
 onError: () => setError('Could not save your availability. Please check the highlighted times and try again.'),
 onFinish: () => setIsSaving(false),
 },
 );
 };

 return (
 <AppLayout breadcrumbs={breadcrumbs}>
 <Head title="Availability"/>
 <div className="mx-auto w-full max-w-3xl px-4 py-8">
 <div className="mb-6 flex items-start justify-between gap-4">
 <div>
 <h1 className="text-2xl font-bold font-heading text-foreground">Availability</h1>
 <p className="mt-1 text-sm text-muted-foreground">Set the days and hours customers can book you.</p>
 </div>
 <Button onClick={handleSave} disabled={!isDirty || hasInvalidRange || isSaving}>
 {isSaving ? 'Saving...' : 'Save'}
 </Button>
 </div>

 {error && (
 <div className="mb-4 rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
 {error}
 </div>
 )}
 {justSaved && !isDirty && (
 <div className="mb-4 rounded-lg border border-success/20 bg-success/10 px-4 py-3 text-sm text-success">
 Your availability has been saved.
 </div>
 )}

 <div className="rounded-2xl border border-border bg-card shadow-sm divide-y divide-border">
 {days.map((day) => (
 <div key={day.dayOfWeek} className="flex flex-col gap-3 p-5 sm:flex-row sm:items-start">
 <div className="flex w-40 flex-shrink-0 items-center gap-3">
 <Checkbox checked={day.enabled} onCheckedChange={() => toggleDay(day.dayOfWeek)} id={`day-${day.dayOfWeek}`}/>
 <label htmlFor={`day-${day.dayOfWeek}`} className="cursor-pointer text-sm font-semibold text-foreground select-none">
 {day.label}
 </label>
 </div>

 {!day.enabled ? (
 <div className="flex items-center gap-2 text-sm text-muted-foreground">
 <Clock className="h-4 w-4"/>
 Unavailable
 </div>
 ) : (
 <div className="flex flex-1 flex-col gap-2">
 {day.ranges.map((range, index) => {
 const invalid = !range.start || !range.end || range.end <= range.start;
 return (
 <div key={index} className="flex flex-col gap-1">
 <div className="flex items-center gap-2">
 <Input
 type="time"
 value={range.start}
 onChange={(e) => updateRange(day.dayOfWeek, index, 'start', e.target.value)}
 className="w-32"
 />
 <span className="text-muted-foreground">&ndash;</span>
 <Input
 type="time"
 value={range.end}
 onChange={(e) => updateRange(day.dayOfWeek, index, 'end', e.target.value)}
 className="w-32"
 />
 <Button
 type="button"
 variant="ghost"
 size="icon"
 onClick={() => removeRange(day.dayOfWeek, index)}
 aria-label="Remove time range"
 >
 <Trash2 className="h-4 w-4 text-muted-foreground"/>
 </Button>
 </div>
 {invalid && <p className="text-xs text-destructive">End time must be after start time.</p>}
 </div>
 );
 })}
 <Button
 type="button"
 variant="ghost"
 size="sm"
 onClick={() => addRange(day.dayOfWeek)}
 className="w-fit text-muted-foreground"
 >
 <Plus className="h-4 w-4"/>
 Add hours
 </Button>
 </div>
 )}
 </div>
 ))}
 </div>
 </div>
 </AppLayout>
 );
}
