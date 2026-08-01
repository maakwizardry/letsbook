import AppLayout from '@/layouts/app-layout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { CalendarOff, ChevronDown, Clock, Plus, Trash2, UserRound } from 'lucide-react';
import { useMemo, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Staff', href: '/staff' }];

const DAY_LABELS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

interface ScheduleRange {
 id?: number;
 day_of_week: number;
 start_time: string;
 end_time: string;
}

interface BlockedDateRow {
 id: number;
 date: string;
 reason: string | null;
}

interface StaffRow {
 id: number;
 name: string;
 is_active: boolean;
 usesOwnSchedule: boolean;
 schedule: ScheduleRange[];
 blockedDates: BlockedDateRow[];
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

function formatBlockedDate(isoDate: string) {
 const [y, m, d] = isoDate.split('-').map(Number);
 return new Date(y, m - 1, d).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

function addHour(time: string): string {
 const [h, m] = time.split(':').map(Number);
 const nextHour = Math.min(h + 1, 23);
 return `${String(nextHour).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function buildDays(schedule: ScheduleRange[]): DayRow[] {
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

function StaffScheduleEditor({ staffId, schedule, fallbackSchedule }: { staffId: number; schedule: ScheduleRange[]; fallbackSchedule: ScheduleRange[] }) {
 const usesOwn = schedule.length > 0;
 const [days, setDays] = useState<DayRow[]>(() => buildDays(usesOwn ? schedule : fallbackSchedule));
 const [isSaving, setIsSaving] = useState(false);
 const [error, setError] = useState('');

 const hasInvalidRange = useMemo(
 () => days.some((d) => d.enabled && d.ranges.some((r) => !r.start || !r.end || r.end <= r.start)),
 [days],
 );

 const toggleDay = (dayOfWeek: number) => {
 setDays((prev) => prev.map((d) => (d.dayOfWeek === dayOfWeek ? { ...d, enabled: !d.enabled } : d)));
 };

 const addRange = (dayOfWeek: number) => {
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
 setDays((prev) =>
 prev.map((d) => (d.dayOfWeek === dayOfWeek ? { ...d, ranges: d.ranges.filter((_, i) => i !== index) } : d)),
 );
 };

 const updateRange = (dayOfWeek: number, index: number, field: keyof Range, value: string) => {
 setDays((prev) =>
 prev.map((d) => {
 if (d.dayOfWeek !== dayOfWeek) return d;
 return { ...d, ranges: d.ranges.map((r, i) => (i === index ? { ...r, [field]: value } : r)) };
 }),
 );
 };

 const save = (flattened: { day_of_week: number; start_time: string; end_time: string }[]) => {
 setIsSaving(true);
 setError('');
 router.put(
 `/staff/${staffId}/availability`,
 { schedule: flattened },
 {
 preserveScroll: true,
 onError: () => setError('Could not save these hours. Please check the highlighted times and try again.'),
 onFinish: () => setIsSaving(false),
 },
 );
 };

 const handleSave = () => {
 if (hasInvalidRange) return;
 const flattened = days.flatMap((d) => (d.enabled ? d.ranges.map((r) => ({ day_of_week: d.dayOfWeek, start_time: r.start, end_time: r.end })) : []));
 save(flattened);
 };

 const revertToDefault = () => {
 setDays(buildDays(fallbackSchedule));
 save([]);
 };

 return (
 <div className="space-y-3">
 <div className="flex items-center justify-between gap-3">
 <div className="flex items-center gap-2">
 <p className="text-sm font-semibold text-foreground">Hours</p>
 {usesOwn ? (
 <Badge variant="secondary">Custom hours</Badge>
 ) : (
 <Badge variant="outline">Following the business's default hours</Badge>
 )}
 </div>
 <div className="flex items-center gap-2">
 {usesOwn && (
 <Button type="button" variant="ghost" size="sm" onClick={revertToDefault} disabled={isSaving}>
 Revert to default hours
 </Button>
 )}
 <Button type="button" size="sm" onClick={handleSave} disabled={hasInvalidRange || isSaving}>
 {isSaving ? 'Saving...' : 'Save hours'}
 </Button>
 </div>
 </div>

 {error && <p className="text-xs text-destructive">{error}</p>}

 <div className="rounded-xl border border-border bg-background divide-y divide-border">
 {days.map((day) => (
 <div key={day.dayOfWeek} className="flex flex-col gap-2 p-3 sm:flex-row sm:items-start">
 <div className="flex w-36 flex-shrink-0 items-center gap-2">
 <Checkbox checked={day.enabled} onCheckedChange={() => toggleDay(day.dayOfWeek)} id={`staff-${staffId}-day-${day.dayOfWeek}`} />
 <label htmlFor={`staff-${staffId}-day-${day.dayOfWeek}`} className="cursor-pointer text-sm font-medium text-foreground select-none">
 {day.label}
 </label>
 </div>

 {!day.enabled ? (
 <div className="flex items-center gap-2 text-sm text-muted-foreground">
 <Clock className="h-4 w-4" />
 Unavailable
 </div>
 ) : (
 <div className="flex flex-1 flex-col gap-2">
 {day.ranges.map((range, index) => {
 const invalid = !range.start || !range.end || range.end <= range.start;
 return (
 <div key={index} className="flex flex-col gap-1">
 <div className="flex items-center gap-2">
 <Input type="time" value={range.start} onChange={(e) => updateRange(day.dayOfWeek, index, 'start', e.target.value)} className="w-28" />
 <span className="text-muted-foreground">&ndash;</span>
 <Input type="time" value={range.end} onChange={(e) => updateRange(day.dayOfWeek, index, 'end', e.target.value)} className="w-28" />
 <Button type="button" variant="ghost" size="icon" onClick={() => removeRange(day.dayOfWeek, index)} aria-label="Remove time range">
 <Trash2 className="h-4 w-4 text-muted-foreground" />
 </Button>
 </div>
 {invalid && <p className="text-xs text-destructive">End time must be after start time.</p>}
 </div>
 );
 })}
 <Button type="button" variant="ghost" size="sm" onClick={() => addRange(day.dayOfWeek)} className="w-fit text-muted-foreground">
 <Plus className="h-4 w-4" />
 Add hours
 </Button>
 </div>
 )}
 </div>
 ))}
 </div>
 </div>
 );
}

function StaffHolidays({ staffId, blockedDates }: { staffId: number; blockedDates: BlockedDateRow[] }) {
 const todayValue = useMemo(() => {
 const d = new Date();
 return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
 }, []);
 const [newDate, setNewDate] = useState('');
 const [newReason, setNewReason] = useState('');
 const [isAdding, setIsAdding] = useState(false);
 const [error, setError] = useState('');
 const [removingIds, setRemovingIds] = useState<Set<number>>(new Set());

 const addHoliday = () => {
 if (!newDate) return;
 setIsAdding(true);
 setError('');
 router.post(
 '/blocked-dates',
 { date: newDate, reason: newReason || null, staff_id: staffId },
 {
 preserveScroll: true,
 onSuccess: () => {
 setNewDate('');
 setNewReason('');
 },
 onError: (errors) => setError(errors.date ?? 'Could not block that date.'),
 onFinish: () => setIsAdding(false),
 },
 );
 };

 const removeHoliday = (id: number) => {
 setRemovingIds((prev) => new Set(prev).add(id));
 router.delete(`/blocked-dates/${id}`, {
 preserveScroll: true,
 onFinish: () =>
 setRemovingIds((prev) => {
 const next = new Set(prev);
 next.delete(id);
 return next;
 }),
 });
 };

 return (
 <div className="space-y-3">
 <p className="text-sm font-semibold text-foreground">Holidays</p>
 <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
 <div className="grid gap-1.5">
 <Label htmlFor={`staff-${staffId}-holiday-date`}>Date</Label>
 <Input id={`staff-${staffId}-holiday-date`} type="date" min={todayValue} value={newDate} onChange={(e) => setNewDate(e.target.value)} className="w-40" />
 </div>
 <div className="grid flex-1 gap-1.5">
 <Label htmlFor={`staff-${staffId}-holiday-reason`}>
 Reason <span className="font-normal text-muted-foreground">(optional)</span>
 </Label>
 <Input id={`staff-${staffId}-holiday-reason`} value={newReason} onChange={(e) => setNewReason(e.target.value)} placeholder="e.g. Vacation" />
 </div>
 <Button type="button" size="sm" onClick={addHoliday} disabled={!newDate || isAdding} className="gap-1.5">
 <Plus className="h-4 w-4" />
 Block this date
 </Button>
 </div>
 {error && <p className="text-xs text-destructive">{error}</p>}

 {blockedDates.length > 0 ? (
 <div className="divide-y divide-border rounded-xl border border-border bg-background">
 {blockedDates.map((blocked) => (
 <div key={blocked.id} className="flex items-center justify-between gap-3 px-3 py-2.5">
 <div className="flex items-center gap-2 text-sm">
 <CalendarOff className="h-4 w-4 shrink-0 text-muted-foreground" />
 <span className="font-medium text-foreground">{formatBlockedDate(blocked.date)}</span>
 {blocked.reason && <span className="text-muted-foreground">— {blocked.reason}</span>}
 </div>
 <Button type="button" variant="ghost" size="icon" onClick={() => removeHoliday(blocked.id)} disabled={removingIds.has(blocked.id)} aria-label="Remove holiday">
 <Trash2 className="h-4 w-4 text-muted-foreground" />
 </Button>
 </div>
 ))}
 </div>
 ) : (
 <p className="text-sm text-muted-foreground">No holidays blocked for this staff member.</p>
 )}
 </div>
 );
}

export default function Staff({ staff = [], providerSchedule = [] }: { staff?: StaffRow[]; providerSchedule?: ScheduleRange[] }) {
 const [newName, setNewName] = useState('');
 const [isAdding, setIsAdding] = useState(false);
 const [expandedId, setExpandedId] = useState<number | null>(null);

 const addStaff = () => {
 if (!newName.trim()) return;
 setIsAdding(true);
 router.post(
 '/staff',
 { name: newName.trim() },
 {
 preserveScroll: true,
 onSuccess: () => setNewName(''),
 onFinish: () => setIsAdding(false),
 },
 );
 };

 const toggleActive = (member: StaffRow) => {
 router.patch(`/staff/${member.id}`, { is_active: !member.is_active }, { preserveScroll: true });
 };

 const deleteStaff = (member: StaffRow) => {
 if (!confirm(`Remove ${member.name}? Their custom hours and holidays will be deleted. Past bookings assigned to them are kept.`)) return;
 router.delete(`/staff/${member.id}`, { preserveScroll: true });
 };

 return (
 <AppLayout breadcrumbs={breadcrumbs}>
 <Head title="Staff" />
 <div className="mx-auto w-full max-w-3xl px-4 py-8">
 <div className="mb-6">
 <h1 className="text-2xl font-bold font-heading text-foreground">Staff</h1>
 <p className="mt-1 text-sm text-muted-foreground">Add the people customers can book, and set each person's own hours and holidays.</p>
 </div>

 <div className="mb-6 rounded-2xl border border-border bg-card p-5 shadow-sm">
 <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
 <div className="grid flex-1 gap-1.5">
 <Label htmlFor="new-staff-name">Name</Label>
 <Input
 id="new-staff-name"
 value={newName}
 onChange={(e) => setNewName(e.target.value)}
 placeholder="e.g. Jordan"
 onKeyDown={(e) => e.key === 'Enter' && addStaff()}
 />
 </div>
 <Button type="button" onClick={addStaff} disabled={!newName.trim() || isAdding} className="gap-1.5">
 <Plus className="h-4 w-4" />
 Add staff
 </Button>
 </div>
 </div>

 {staff.length === 0 ? (
 <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
 No staff yet. Add someone above to start scheduling their own hours.
 </div>
 ) : (
 <div className="space-y-4">
 {staff.map((member) => (
 <Collapsible key={member.id} open={expandedId === member.id} onOpenChange={(open) => setExpandedId(open ? member.id : null)}>
 <div className="rounded-2xl border border-border bg-card shadow-sm">
 <div className="flex items-center justify-between gap-3 p-4">
 <div className="flex items-center gap-3">
 <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted">
 <UserRound className="h-4 w-4 text-muted-foreground" />
 </div>
 <div>
 <p className="font-semibold text-foreground">{member.name}</p>
 <div className="flex items-center gap-2">
 <Checkbox checked={member.is_active} onCheckedChange={() => toggleActive(member)} id={`active-${member.id}`} />
 <label htmlFor={`active-${member.id}`} className="cursor-pointer text-xs text-muted-foreground select-none">
 Active (bookable by customers)
 </label>
 </div>
 </div>
 </div>
 <div className="flex items-center gap-1">
 <Button type="button" variant="ghost" size="icon" onClick={() => deleteStaff(member)} aria-label="Remove staff member">
 <Trash2 className="h-4 w-4 text-muted-foreground" />
 </Button>
 <CollapsibleTrigger asChild>
 <Button type="button" variant="ghost" size="icon" aria-label="Toggle hours and holidays">
 <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${expandedId === member.id ? 'rotate-180' : ''}`} />
 </Button>
 </CollapsibleTrigger>
 </div>
 </div>

 <CollapsibleContent>
 <div className="space-y-6 border-t border-border p-4">
 <StaffScheduleEditor staffId={member.id} schedule={member.schedule} fallbackSchedule={providerSchedule} />
 <StaffHolidays staffId={member.id} blockedDates={member.blockedDates} />
 </div>
 </CollapsibleContent>
 </div>
 </Collapsible>
 ))}
 </div>
 )}
 </div>
 </AppLayout>
 );
}
