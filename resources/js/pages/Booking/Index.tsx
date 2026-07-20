import { useState, useEffect, useMemo } from 'react';
import { Head, Link } from '@inertiajs/react';
import { 
 Check, 
 ChevronRight, 
 ArrowLeft, 
 Plus, 
 Minus,
 ShoppingCart,
 MapPin,
 CalendarDays,
 Clock,
 User,
 Mail,
 Phone,
 Info,
 CheckCircle2,
 Banknote,
 Landmark,
 Search,
 Building2,
 BellRing,
 Star,
 Hash,
 StickyNote,
 CalendarPlus,
 ShieldCheck,
 BadgeCheck,
 ThumbsUp
} from 'lucide-react';
import { buildGoogleCalendarUrl } from '@/lib/google-calendar';

interface SelectedAddress {
 displayName: string;
 lat: number;
 lon: number;
 postcode: string;
}

const REMINDER_OPTIONS = [
 { minutes: 30, label: '30 min before' },
 { minutes: 60, label: '1 hour before' },
 { minutes: 180, label: '3 hours before' },
 { minutes: 1440, label: '1 day before' },
];

function reminderLabel(minutes: number | null | undefined) {
 return REMINDER_OPTIONS.find(o => o.minutes === minutes)?.label || null;
}

export default function BookingWizard({ provider, availability = [] }: { provider: any; availability?: { day_of_week: number; start_time: string; end_time: string }[] }) {
 // 1: Home Type, 2: Services, 3: Schedule, 4: Details, 5: Success
 const [step, setStep] = useState(1);
 const [direction, setDirection] = useState<'forward' | 'back'>('forward');
 const goToStep = (next: number) => {
 setDirection(next > step ? 'forward' : 'back');
 setStep(next);
 };
 const stepEnterClass = direction === 'forward' ? 'slide-in-from-right-4' : 'slide-in-from-left-4';

 // Data states
 const [homeTypes, setHomeTypes] = useState<any[]>([]);
 const [serviceItems, setServiceItems] = useState<any[]>([]);
 const [bookedSlots, setBookedSlots] = useState<string[]>([]);
 
 // Selection states
 const [selectedHomeTypeId, setSelectedHomeTypeId] = useState<number | null>(null);
 const [cart, setCart] = useState<Record<number, number>>({}); // { serviceId: quantity }
 const [selectedDate, setSelectedDate] = useState<string>('');
 const [selectedTime, setSelectedTime] = useState<string>('');
 const [customer, setCustomer] = useState({ name: '', email: '', phone: '', notes: '' });
 const [fieldErrors, setFieldErrors] = useState<{ phone?: string; email?: string }>({});

 const validatePhone = (value: string) => {
 if (!value) return undefined;
 return value.replace(/\D/g, '').length >= 10 ? undefined : 'Enter a valid phone number.';
 };
 const validateEmail = (value: string) => {
 if (!value) return undefined;
 return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? undefined : 'Enter a valid email address.';
 };
 const [paymentMethod, setPaymentMethod] = useState<'cash' | 'etransfer' | ''>('');
 const [reminderMinutesBefore, setReminderMinutesBefore] = useState<number | null>(null);

 // Wizard intro state
 const [wizardStarted, setWizardStarted] = useState(false);

 // Address states
 const [addressQuery, setAddressQuery] = useState('');
 const [addressSuggestions, setAddressSuggestions] = useState<any[]>([]);
 const [isSearchingAddress, setIsSearchingAddress] = useState(false);
 const [addressError, setAddressError] = useState('');
 const [selectedAddress, setSelectedAddress] = useState<SelectedAddress | null>(null);
 const [unitNumber, setUnitNumber] = useState('');
 const [buzzCode, setBuzzCode] = useState('');
 const [buildingInstructions, setBuildingInstructions] = useState('');

 // UI states
 const [isSubmitting, setIsSubmitting] = useState(false);
 const [error, setError] = useState('');
 const [bookingResponse, setBookingResponse] = useState<any>(null);

 // Debounced address search via OpenStreetMap Nominatim (no API key required)
 useEffect(() => {
 if (selectedAddress && addressQuery === selectedAddress.displayName) {
 setAddressSuggestions([]);
 return;
 }
 if (addressQuery.trim().length < 3) {
 setAddressSuggestions([]);
 return;
 }
 setIsSearchingAddress(true);
 const timeout = setTimeout(() => {
 fetch(`https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=5&q=${encodeURIComponent(addressQuery)}`)
 .then(res => res.json())
 .then(data => setAddressSuggestions(data || []))
 .catch(() => setAddressSuggestions([]))
 .finally(() => setIsSearchingAddress(false));
 }, 600);
 return () => clearTimeout(timeout);
 }, [addressQuery]);

 const handleSelectAddressSuggestion = (item: any) => {
 setSelectedAddress({
 displayName: item.display_name,
 lat: parseFloat(item.lat),
 lon: parseFloat(item.lon),
 postcode: item.address?.postcode || ''
 });
 setAddressQuery(item.display_name);
 setAddressSuggestions([]);
 setAddressError('');
 };

 // Initial fetch
 useEffect(() => {
 fetch(`/api/home-types?provider_id=${provider.id}`)
 .then(res => res.json())
 .then(data => setHomeTypes(data));
 }, [provider.id]);

 // Fetch services when home type changes
 useEffect(() => {
 if (selectedHomeTypeId) {
 fetch(`/api/service-items?home_type_id=${selectedHomeTypeId}`)
 .then(res => res.json())
 .then(data => {
 setServiceItems(data);
 setCart({}); // Reset cart on home type change
 });
 }
 }, [selectedHomeTypeId]);

 // Fetch booked slots when date changes
 useEffect(() => {
 if (selectedDate) {
 fetch(`/api/booked-slots?provider_id=${provider.id}&start_date=${selectedDate}&end_date=${selectedDate}`)
 .then(res => res.json())
 .then(data => setBookedSlots(data.booked_slots || []));
 }
 }, [selectedDate, provider.id]);

 // Handlers
 const handleAddService = (id: number) => {
 setCart(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
 };

 const handleRemoveService = (id: number) => {
 setCart(prev => {
 const current = prev[id] || 0;
 if (current <= 1) {
 const newCart = { ...prev };
 delete newCart[id];
 return newCart;
 }
 return { ...prev, [id]: current - 1 };
 });
 };

 const totalQuote = useMemo(() => {
 return Object.entries(cart).reduce((total, [id, qty]) => {
 const item = serviceItems.find(s => s.id === parseInt(id));
 return total + (item ? item.price * qty : 0);
 }, 0);
 }, [cart, serviceItems]);

 const totalItems = useMemo(() => {
 return Object.values(cart).reduce((sum, qty) => sum + qty, 0);
 }, [cart]);

 const groupedServiceItems = useMemo(() => {
 const groups: { category: string; items: typeof serviceItems }[] = [];
 serviceItems.forEach(item => {
 const category = item.category || 'Other';
 let group = groups.find(g => g.category === category);
 if (!group) {
 group = { category, items: [] };
 groups.push(group);
 }
 group.items.push(item);
 });
 return groups;
 }, [serviceItems]);

 const scheduleLabel = useMemo(() => {
 if (!selectedDate || !selectedTime) return '';
 const d = new Date(`${selectedDate}T00:00:00`);
 const dateStr = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
 const hour = parseInt(selectedTime.split(':')[0], 10);
 const timeStr = hour > 12 ? `${hour - 12}:00 PM` : hour === 12 ? '12:00 PM' : `${hour}:00 AM`;
 return `${dateStr} · ${timeStr}`;
 }, [selectedDate, selectedTime]);

 const googleCalendarUrl = useMemo(() => {
 if (!selectedDate || !selectedTime) return null;

 const start = new Date(`${selectedDate}T${selectedTime}:00`);
 const details = Object.entries(cart)
 .map(([id, qty]) => {
 const item = serviceItems.find(s => s.id === parseInt(id));
 return item ? `${qty}x ${item.name}` : null;
 })
 .filter(Boolean)
 .join(', ');
 const location = selectedAddress ? `${selectedAddress.displayName}${unitNumber ? `, Unit ${unitNumber}` : ''}` : undefined;

 return buildGoogleCalendarUrl({
 title: `Cleaning — ${provider.name}`,
 start,
 details,
 location,
 });
 }, [selectedDate, selectedTime, cart, serviceItems, selectedAddress, unitNumber, provider.name]);

 const submitBooking = async () => {
 setIsSubmitting(true);
 setError('');
 
 try {
 const scheduled_at = `${selectedDate} ${selectedTime}:00`;
 // Flatten cart into array of service_item_ids based on quantity
 const service_item_ids = Object.entries(cart).flatMap(([id, qty]) => 
 Array(qty).fill(parseInt(id))
 );

 const res = await fetch('/api/bookings', {
 method: 'POST',
 headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
 body: JSON.stringify({
 home_type_id: selectedHomeTypeId,
 service_item_ids,
 scheduled_at,
 customer_name: customer.name,
 customer_email: customer.email,
 customer_phone: customer.phone,
 notes: customer.notes,
 payment_method: paymentMethod,
 customer_address: selectedAddress?.displayName,
 unit_number: unitNumber,
 buzz_code: buzzCode,
 building_instructions: buildingInstructions,
 postal_code: selectedAddress?.postcode,
 latitude: selectedAddress?.lat,
 longitude: selectedAddress?.lon,
 reminder_minutes_before: reminderMinutesBefore
 })
 });

 const data = await res.json();
 if (res.ok) {
 setBookingResponse(data.booking);
 setDirection('forward');
 setStep(5);
 } else {
 setError(data.message || 'An error occurred while booking.');
 }
 } catch (e) {
 setError('Failed to submit booking. Please try again.');
 } finally {
 setIsSubmitting(false);
 }
 };

 // Date/Time Generators
 const dates = useMemo(() => {
 const arr = [];
 const today = new Date();
 for (let i = 0; i < 14; i++) {
 const d = new Date(today);
 d.setDate(today.getDate() + i);
 arr.push({
 dayLabel: d.toLocaleDateString('en-US', { weekday: 'short' }),
 dayNumber: d.getDate(),
 dayOfWeek: d.getDay(),
 value: d.toISOString().split('T')[0],
 isToday: i === 0
 });
 }
 return arr;
 }, []);

 const selectedDayOfWeek = useMemo(
 () => dates.find(d => d.value === selectedDate)?.dayOfWeek,
 [dates, selectedDate]
 );

 const timeSlots = useMemo(() => {
 if (selectedDayOfWeek === undefined) return [];

 const windows = availability.filter((a: any) => a.day_of_week === selectedDayOfWeek);
 if (windows.length === 0) return [];

 const hours = new Set<number>();
 windows.forEach((w: any) => {
 const startHour = parseInt(w.start_time.split(':')[0], 10);
 const endHour = parseInt(w.end_time.split(':')[0], 10);
 for (let i = startHour; i + 1 <= endHour; i++) {
 hours.add(i);
 }
 });

 const slots = Array.from(hours).sort((a, b) => a - b).map(i => {
 const hourStr = i.toString().padStart(2, '0');
 const timeString = `${hourStr}:00`;
 const isBooked = bookedSlots.some(isoStr => {
 const bookedDate = new Date(isoStr);
 return bookedDate.getUTCHours() === i;
 });
 const period = i < 12 ? 'Morning' : (i < 16 ? 'Afternoon' : 'Evening');
 const formatted = i > 12 ? `${i-12}:00 PM` : (i === 12 ? '12:00 PM' : `${i}:00 AM`);

 return { time: timeString, label: formatted, period, available: !isBooked };
 });
 return slots;
 }, [bookedSlots, availability, selectedDayOfWeek]);

 const periods = ['Morning', 'Afternoon', 'Evening'];

 // Only offer reminder options whose target time hasn't already passed
 const availableReminderOptions = useMemo(() => {
 if (!selectedDate || !selectedTime) return [];
 const scheduledUTC = new Date(`${selectedDate}T${selectedTime}:00Z`).getTime();
 return REMINDER_OPTIONS.filter(opt => scheduledUTC - opt.minutes * 60000 > Date.now());
 }, [selectedDate, selectedTime]);

 useEffect(() => {
 if (reminderMinutesBefore !== null && !availableReminderOptions.some(o => o.minutes === reminderMinutesBefore)) {
 setReminderMinutesBefore(null);
 }
 }, [availableReminderOptions, reminderMinutesBefore]);

 // Steps configs
 const getStepTitle = () => {
 switch (step) {
 case 1: return 'Select Home Type';
 case 2: return 'Select Services';
 case 3: return 'Choose Date & Time';
 case 4: return 'Review & Checkout';
 case 5: return 'Booking Confirmed';
 default: return '';
 }
 };

 // INTRO: Branded hero shown before the numbered wizard steps begin
 if (!wizardStarted) {
 const brandStyle = provider.brand_color ? ({ '--primary': provider.brand_color } as React.CSSProperties) : undefined;
 const hasStats = provider.rating || provider.completed_cleanings_count || provider.years_in_business;
 const trustBadges = [
 provider.is_insured && { icon: ShieldCheck, label: 'Insured' },
 provider.is_background_checked && { icon: BadgeCheck, label: 'Background-Checked' },
 provider.has_satisfaction_guarantee && { icon: ThumbsUp, label: 'Satisfaction Guaranteed' },
 ].filter(Boolean) as { icon: typeof ShieldCheck; label: string }[];

 return (
 <div className="h-dvh overflow-hidden bg-background flex flex-col font-sans selection:bg-primary/20" style={brandStyle}>
 <Head title={`Book ${provider.name}`} />

 <main className="flex-1 min-h-0 max-w-2xl mx-auto w-full overflow-hidden">
 {/* Hero: full-screen provider image with all branding overlaid, fixed to the viewport */}
 <div className="relative h-full w-full overflow-hidden flex flex-col justify-end">
 {provider.cover_image_url ? (
 <img src={provider.cover_image_url} alt="" className="absolute inset-0 w-full h-full object-cover"/>
 ) : (
 <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary/70"/>
 )}
 <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/55 to-black/10"/>

 <div className="relative px-5 pb-[calc(7rem+env(safe-area-inset-bottom))]">
 {provider.logo_url && (
 <img
 src={provider.logo_url}
 alt={`${provider.name} logo`}
 className="w-14 h-14 rounded-2xl object-cover mb-4 border-2 border-white/70 shadow-lg"
 />
 )}
 <h1 className="text-3xl font-black font-heading text-white mb-1.5">{provider.name}</h1>
 {provider.tagline && (
 <p className="text-white/85 font-medium mb-2.5">{provider.tagline}</p>
 )}
 {hasStats && (
 <div className="flex items-center gap-x-2 gap-y-1.5 flex-wrap text-sm text-white/90 mb-5">
 {provider.rating && (
 <span className="flex items-center gap-1 font-semibold text-white">
 <Star className="w-4 h-4 fill-amber-400 text-amber-400"/>
 {provider.rating.toFixed(1)}
 </span>
 )}
 {provider.completed_cleanings_count && (
 <span>{provider.rating && '•'} {provider.completed_cleanings_count.toLocaleString()}+ Homes Cleaned</span>
 )}
 {provider.years_in_business && (
 <span>{(provider.rating || provider.completed_cleanings_count) && '•'} {provider.years_in_business}+ Years Experience</span>
 )}
 </div>
 )}

 {/* Welcome Message */}
 <p className="text-white/85 text-sm leading-relaxed mb-4 max-w-sm">
 Pick your home type, choose your services, and grab a time that works — takes about 2 minutes.
 </p>

 {/* Trust Badges */}
 {trustBadges.length > 0 && (
 <div className="flex flex-wrap gap-2">
 {trustBadges.map(({ icon: Icon, label }) => (
 <span key={label} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/15 text-white border border-white/25 backdrop-blur-sm text-xs font-semibold">
 <Icon className="w-3.5 h-3.5"/>
 {label}
 </span>
 ))}
 </div>
 )}
 </div>
 </div>
 </main>

 {/* Primary CTA */}
 <div className="fixed bottom-0 left-0 right-0 p-4 bg-card/80 backdrop-blur-md border-t border-border z-50 animate-in slide-in-from-bottom-full duration-300">
 <div className="max-w-2xl mx-auto">
 <button
 onClick={() => setWizardStarted(true)}
 className="w-full py-4 bg-primary text-primary-foreground rounded-xl font-bold active:scale-[0.97] transition-[transform,box-shadow] duration-150 shadow-lg shadow-primary/25 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
 >
 See Services & Pricing
 </button>
 </div>
 </div>
 </div>
 );
 }

 return (
 <div className="min-h-dvh bg-background flex flex-col font-sans selection:bg-primary/20">
 <Head title={`${getStepTitle()} | ${provider.name}`} />

 {/* Top App Bar - Fixed */}
 <header className="sticky top-0 z-50 bg-card border-b border-border shadow-sm">
 <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
 <div className="flex items-center gap-3 min-w-0">
 {step > 1 && step < 5 ? (
 <button
 onClick={() => goToStep(step - 1)}
 aria-label="Go back to previous step"
 className="p-2 -ml-2 rounded-full hover:bg-accent transition-[background-color,transform] duration-150 active:scale-[0.97] cursor-pointer shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
 >
 <ArrowLeft className="w-5 h-5 text-foreground"/>
 </button>
 ) : (
 <div className="w-9 shrink-0" aria-hidden="true"></div>
 )}
 <h1 className="text-lg font-semibold font-heading text-foreground truncate">
 {getStepTitle()}
 </h1>
 </div>
 {/* Step Count */}
 {step < 5 && (
 <div className="text-xs font-semibold text-primary bg-accent px-2.5 py-1 rounded-full shrink-0">
 Step {step} of 4
 </div>
 )}
 </div>
 {/* Segmented Progress Bar */}
 {step < 5 && (
 <div className="flex gap-1 px-4 pb-2.5" role="progressbar" aria-valuenow={step} aria-valuemin={1} aria-valuemax={4} aria-label="Booking progress">
 {[1, 2, 3, 4].map(i => (
 <div key={i} className="h-1 flex-1 rounded-full bg-muted overflow-hidden">
 <div
 className="h-full bg-primary rounded-full transition-transform duration-300 origin-left"
 style={{
 transitionTimingFunction: 'var(--ease-in-out-strong)',
 transform: `scaleX(${i <= step ? 1 : 0})`,
 }}
 />
 </div>
 ))}
 </div>
 )}
 </header>

 {/* Main Content Area */}
 <main className="flex-1 max-w-2xl mx-auto w-full pb-28">
 
 {/* STEP 1: HOME TYPE */}
 {step === 1 && (
 <div className="p-4 animate-in fade-in slide-in-from-right-4 duration-250 ease-[cubic-bezier(0.23,1,0.32,1)]">
 <div className="mb-6">
 <h2 className="text-2xl font-bold font-heading text-foreground mb-1">Select your home type</h2>
 <p className="text-muted-foreground text-sm">Pricing and services are tailored to your property size.</p>
 </div>
 <div className="space-y-4">
 {homeTypes.map(type => (
 <button
 key={type.id}
 onClick={() => {
 setSelectedHomeTypeId(type.id);
 goToStep(2);
 }}
 className="w-full flex items-center p-4 bg-card rounded-2xl border border-border hover:shadow-md hover:border-primary/30 hover:-translate-y-0.5 transition-[transform,box-shadow,border-color] duration-300 active:scale-[0.97] group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
 >
 <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mr-4 group-hover:bg-primary/10 transition-colors shrink-0">
 <MapPin className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors"/>
 </div>
 <div className="flex-1 text-left min-w-0">
 <h3 className="text-lg font-semibold text-foreground">{type.label}</h3>
 <p className="text-sm text-muted-foreground line-clamp-1">{type.description || 'Standard cleaning for this property size.'}</p>
 </div>
 <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors shrink-0"/>
 </button>
 ))}
 </div>
 </div>
 )}

 {/* STEP 2: SERVICES (CART STYLE) */}
 {step === 2 && (
 <div className={`p-4 animate-in fade-in ${stepEnterClass} duration-250 ease-[cubic-bezier(0.23,1,0.32,1)]`}>
 <div className="mb-6">
 <h2 className="text-2xl font-bold font-heading text-foreground mb-1">Add Services</h2>
 <p className="text-muted-foreground text-sm">Customize your cleaning package.</p>
 </div>

 <div className="space-y-6">
 {groupedServiceItems.map(group => (
 <div key={group.category}>
 <h3 className="text-sm font-bold text-foreground mb-3 uppercase tracking-wider">{group.category}</h3>
 <div className="space-y-4">
 {group.items.map(item => {
 const qty = cart[item.id] || 0;
 return (
 <div key={item.id} className={`flex p-4 bg-card rounded-2xl border shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-[transform,box-shadow,border-color] duration-300 relative overflow-hidden group ${qty > 0 ? 'border-primary/30' : 'border-border'}`}>
 {qty > 0 && <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" aria-hidden="true"></div>}
 <div className="flex-1 pr-4 min-w-0">
 <div className="flex items-center gap-2 mb-1">
 {qty > 0 && <CheckCircle2 className="w-4 h-4 text-primary fill-primary/10 shrink-0"/>}
 <h3 className="font-bold text-foreground text-base">{item.name}</h3>
 </div>
 <div className="font-semibold text-foreground">${item.price}</div>
 </div>

 <div className="flex flex-col items-end justify-center shrink-0">
 {qty === 0 ? (
 <button
 onClick={() => handleAddService(item.id)}
 aria-label={`Add ${item.name}`}
 className="px-6 py-2 bg-primary/10 hover:bg-primary/20 text-primary font-semibold rounded-full transition-[background-color,transform] duration-150 text-sm active:scale-[0.97] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
 >
 Add
 </button>
 ) : (
 <div className="flex items-center bg-muted rounded-full border border-border">
 <button
 onClick={() => handleRemoveService(item.id)}
 aria-label={`Remove one ${item.name}`}
 className="w-9 h-9 flex items-center justify-center text-muted-foreground hover:text-primary transition-[color,transform] duration-150 active:scale-90 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-full"
 >
 <Minus className="w-4 h-4"/>
 </button>
 <span key={qty} className="anim-tick inline-block w-6 text-center font-semibold text-foreground text-sm" aria-live="polite">{qty}</span>
 <button
 onClick={() => handleAddService(item.id)}
 aria-label={`Add one more ${item.name}`}
 className="w-9 h-9 flex items-center justify-center text-muted-foreground hover:text-primary transition-[color,transform] duration-150 active:scale-90 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-full"
 >
 <Plus className="w-4 h-4"/>
 </button>
 </div>
 )}
 </div>
 </div>
 );
 })}
 </div>
 </div>
 ))}
 </div>
 </div>
 )}

 {/* STEP 3: SCHEDULE */}
 {step === 3 && (
 <div className={`animate-in fade-in ${stepEnterClass} duration-250 ease-[cubic-bezier(0.23,1,0.32,1)]`}>
 {/* Order Summary Recap */}
 <div className="px-4 pt-4 flex items-center justify-between gap-3 text-sm">
 <span className="text-muted-foreground">
 <span className="font-semibold text-foreground">{totalItems}</span> service{totalItems === 1 ? '' : 's'} selected · <span className="font-semibold text-foreground">${totalQuote}</span>
 </span>
 <button
 onClick={() => goToStep(2)}
 className="font-semibold text-primary hover:underline cursor-pointer rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 shrink-0"
 >
 Edit
 </button>
 </div>

 {/* Horizontal Date Picker */}
 <div className="bg-card pt-6 pb-4 border-b border-border sticky top-14 z-40">
 <div className="px-4 mb-4 flex items-center justify-between">
 <h2 className="text-xl font-bold font-heading text-foreground">When do you need us?</h2>
 <CalendarDays className="w-5 h-5 text-muted-foreground"/>
 </div>

 <div className="flex overflow-x-auto hide-scrollbar px-4 pb-2 gap-3 snap-x">
 {dates.map((d, i) => {
 const isSelected = selectedDate === d.value;
 const isAvailable = availability.some((a: any) => a.day_of_week === d.dayOfWeek);
 return (
 <button
 key={d.value}
 disabled={!isAvailable}
 onClick={() => {
 setSelectedDate(d.value);
 setSelectedTime('');
 }}
 aria-pressed={isSelected}
 style={{ animationDelay: `${i * 30}ms` }}
 className={`anim-stagger-item flex-shrink-0 w-[4.5rem] p-3 rounded-2xl border-2 flex flex-col items-center justify-center snap-start transition-[transform,box-shadow,border-color,background-color] duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
 !isAvailable
 ? 'border-transparent bg-muted text-muted-foreground/50 cursor-not-allowed'
 : `hover:-translate-y-0.5 active:scale-[0.97] cursor-pointer ${
 isSelected ? 'border-primary bg-primary/5 shadow-sm' : 'border-border bg-card hover:border-primary/30'
 }`
 }`}
 >
 <span className={`text-xs uppercase font-semibold mb-1 ${!isAvailable ? '' : isSelected ? 'text-primary' : 'text-muted-foreground'}`}>
 {d.isToday ? 'Today' : d.dayLabel}
 </span>
 <span className={`text-xl font-bold ${!isAvailable ? '' : isSelected ? 'text-primary' : 'text-foreground'}`}>
 {d.dayNumber}
 </span>
 </button>
 )
 })}
 </div>
 </div>

 {/* Time Slots */}
 <div className="p-4 pt-6">
 {!selectedDate ? (
 <div className="text-center py-12 text-muted-foreground flex flex-col items-center">
 <Clock className="w-12 h-12 text-muted-foreground/40 mb-3"/>
 <p>Please select a date to view available times.</p>
 </div>
 ) : timeSlots.length === 0 ? (
 <div className="text-center py-12 text-muted-foreground flex flex-col items-center">
 <Clock className="w-12 h-12 text-muted-foreground/40 mb-3"/>
 <p>This provider isn't available on this day.</p>
 </div>
 ) : (
 <div className="space-y-8 animate-in fade-in duration-300">
 {periods.map(period => {
 const periodSlots = timeSlots.filter(s => s.period === period);
 if (periodSlots.length === 0) return null;

 return (
 <div key={period}>
 <h3 className="text-sm font-bold text-foreground mb-3 uppercase tracking-wider flex items-center gap-2">
 {period}
 </h3>
 <div className="grid grid-cols-3 gap-3">
 {periodSlots.map(slot => {
 const isSelected = selectedTime === slot.time;
 return (
 <button
 key={slot.time}
 disabled={!slot.available}
 aria-pressed={isSelected}
 onClick={() => setSelectedTime(slot.time)}
 className={`py-3 px-2 rounded-xl text-sm font-semibold border-2 transition-[transform,box-shadow,border-color,background-color] duration-200 active:scale-[0.97] flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
 !slot.available
 ? 'bg-muted border-transparent text-muted-foreground line-through cursor-not-allowed'
 : isSelected
 ? 'bg-primary border-primary text-primary-foreground shadow-md shadow-primary/20 cursor-pointer'
 : 'bg-card border-border text-foreground hover:border-success/50 hover:bg-success/5 cursor-pointer'
 }`}
 >
 {slot.label}
 </button>
 )
 })}
 </div>
 </div>
 )
 })}
 </div>
 )}
 </div>
 </div>
 )}

 {/* STEP 4: CHECKOUT DETAILS */}
 {step === 4 && (
 <div className={`animate-in fade-in ${stepEnterClass} duration-250 ease-[cubic-bezier(0.23,1,0.32,1)]`}>
 {/* Receipt Summary */}
 <div className="bg-card p-6 border-b border-border">
 <h2 className="text-xl font-bold font-heading text-foreground mb-4">Summary</h2>

 <div className="space-y-3 mb-6">
 {Object.entries(cart).map(([id, qty]) => {
 const item = serviceItems.find(s => s.id === parseInt(id));
 if(!item) return null;
 return (
 <div key={id} className="flex justify-between items-start text-sm">
 <div className="flex-1">
 <span className="font-semibold text-foreground">{qty}x {item.name}</span>
 </div>
 <div className="font-medium text-foreground">${item.price * qty}</div>
 </div>
 )
 })}
 </div>

 <div className="pt-4 border-t border-dashed border-border flex justify-between items-center">
 <span className="font-bold text-foreground text-lg">Total to pay</span>
 <span className="font-black text-2xl text-foreground">${totalQuote}</span>
 </div>
 </div>

 {/* User Details Form */}
 <div className="p-4 pt-6 space-y-5">
 <div>
 <h2 className="text-xl font-bold font-heading text-foreground mb-1">Where should we come?</h2>
 <p className="text-muted-foreground text-sm">Enter the address where you'd like the cleaning service.</p>
 </div>

 <div className="bg-card rounded-xl border border-border shadow-sm p-4">
 {!selectedAddress ? (
 <>
 <label htmlFor="address-search" className="block text-sm font-semibold text-foreground mb-1.5">
 Full Address
 </label>
 <div className="relative mb-2">
 <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
 <Search className="h-5 w-5 text-muted-foreground"/>
 </div>
 <input
 id="address-search"
 type="text"
 role="combobox"
 aria-expanded={addressSuggestions.length > 0}
 aria-controls="address-suggestions"
 autoComplete="off"
 value={addressQuery}
 onChange={e => setAddressQuery(e.target.value)}
 className="w-full pl-11 pr-4 py-4 bg-card border border-input rounded-xl focus:ring-2 focus:ring-ring focus:border-primary outline-none transition-[border-color,box-shadow] duration-150 shadow-sm font-medium text-base placeholder:font-normal placeholder:text-muted-foreground text-foreground"
 placeholder="Start typing your street address..."
 />
 </div>

 {isSearchingAddress && (
 <p className="text-sm text-muted-foreground px-1">Searching...</p>
 )}

 {addressSuggestions.length > 0 && (
 <div id="address-suggestions" role="listbox" aria-label="Address suggestions" className="bg-card rounded-xl border border-border shadow-sm divide-y divide-border overflow-hidden">
 {addressSuggestions.map((item: any, i: number) => (
 <button
 key={item.place_id}
 role="option"
 aria-selected="false"
 onClick={() => handleSelectAddressSuggestion(item)}
 style={{ animationDelay: `${i * 30}ms` }}
 className="anim-stagger-item w-full flex items-start gap-3 p-4 text-left hover:bg-accent transition-colors duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
 >
 <MapPin className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5"/>
 <span className="text-sm text-foreground">{item.display_name}</span>
 </button>
 ))}
 </div>
 )}

 {addressError && (
 <div role="alert" className="mt-4 p-4 bg-destructive/10 text-destructive rounded-xl text-sm font-medium flex items-start gap-2 border border-destructive/20">
 <Info className="w-5 h-5 shrink-0 mt-0.5"/>
 {addressError}
 </div>
 )}
 </>
 ) : (
 <div className="animate-in fade-in duration-300 space-y-4">
 <div>
 <div className="flex items-start gap-3 mb-3">
 <MapPin className="w-5 h-5 text-primary shrink-0 mt-0.5"/>
 <span className="text-sm text-foreground flex-1">{selectedAddress.displayName}</span>
 </div>
 <button
 onClick={() => {
 setSelectedAddress(null);
 setAddressQuery('');
 }}
 className="text-sm font-semibold text-primary hover:underline cursor-pointer rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
 >
 Change address
 </button>
 </div>

 <div className="pt-1 border-t border-dashed border-border"/>

 <div>
 <label htmlFor="unit-number" className="block text-sm font-semibold text-foreground mb-1.5">
 Apartment / Unit <span className="font-normal text-muted-foreground">(optional)</span>
 </label>
 <div className="relative">
 <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
 <Building2 className="h-5 w-5 text-muted-foreground"/>
 </div>
 <input
 id="unit-number"
 type="text"
 value={unitNumber}
 onChange={e => setUnitNumber(e.target.value)}
 className="w-full pl-11 pr-4 py-4 bg-card border border-input rounded-xl focus:ring-2 focus:ring-ring focus:border-primary outline-none transition-[border-color,box-shadow] duration-150 shadow-sm font-medium text-base placeholder:font-normal placeholder:text-muted-foreground text-foreground"
 placeholder="e.g. Unit 4B"
 />
 </div>
 </div>

 <div>
 <label htmlFor="buzz-code" className="block text-sm font-semibold text-foreground mb-1.5">
 Buzz Code <span className="font-normal text-muted-foreground">(optional)</span>
 </label>
 <div className="relative">
 <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
 <Hash className="h-5 w-5 text-muted-foreground"/>
 </div>
 <input
 id="buzz-code"
 type="text"
 value={buzzCode}
 onChange={e => setBuzzCode(e.target.value)}
 className="w-full pl-11 pr-4 py-4 bg-card border border-input rounded-xl focus:ring-2 focus:ring-ring focus:border-primary outline-none transition-[border-color,box-shadow] duration-150 shadow-sm font-medium text-base placeholder:font-normal placeholder:text-muted-foreground text-foreground"
 placeholder="e.g. #1234"
 />
 </div>
 </div>

 <div>
 <label htmlFor="building-instructions" className="block text-sm font-semibold text-foreground mb-1.5">
 Building Instructions <span className="font-normal text-muted-foreground">(optional)</span>
 </label>
 <div className="relative">
 <div className="absolute top-4 left-0 pl-4 flex items-center pointer-events-none">
 <StickyNote className="h-5 w-5 text-muted-foreground"/>
 </div>
 <textarea
 id="building-instructions"
 value={buildingInstructions}
 onChange={e => setBuildingInstructions(e.target.value)}
 className="w-full pl-11 pr-4 py-4 bg-card border border-input rounded-xl focus:ring-2 focus:ring-ring focus:border-primary outline-none transition-[border-color,box-shadow] duration-150 shadow-sm resize-none h-20 font-medium text-base placeholder:font-normal placeholder:text-muted-foreground text-foreground"
 placeholder="e.g. Use the side entrance, parking in the back"
 />
 </div>
 </div>
 </div>
 )}
 </div>

 <div className="pt-2 border-t border-dashed border-border"/>

 <h2 className="text-xl font-bold font-heading text-foreground">Your Details</h2>

 <div>
 <label htmlFor="customer-name" className="block text-sm font-semibold text-foreground mb-1.5">Full Name</label>
 <div className="relative">
 <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
 <User className="h-5 w-5 text-muted-foreground"/>
 </div>
 <input
 id="customer-name"
 type="text"
 required
 autoComplete="name"
 value={customer.name}
 onChange={e => setCustomer({...customer, name: e.target.value})}
 className="w-full pl-11 pr-4 py-4 bg-card border border-input rounded-xl focus:ring-2 focus:ring-ring focus:border-primary outline-none transition-[border-color,box-shadow] duration-150 shadow-sm font-medium text-base placeholder:font-normal placeholder:text-muted-foreground text-foreground"
 placeholder="Jane Doe"
 />
 </div>
 </div>

 <div>
 <label htmlFor="customer-phone" className="block text-sm font-semibold text-foreground mb-1.5">Phone Number</label>
 <div className="relative">
 <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
 <Phone className="h-5 w-5 text-muted-foreground"/>
 </div>
 <input
 id="customer-phone"
 type="tel"
 required
 autoComplete="tel"
 aria-invalid={!!fieldErrors.phone}
 aria-describedby={fieldErrors.phone ? 'customer-phone-error' : undefined}
 value={customer.phone}
 onChange={e => {
 setCustomer({...customer, phone: e.target.value});
 if (fieldErrors.phone) setFieldErrors(prev => ({...prev, phone: undefined}));
 }}
 onBlur={e => setFieldErrors(prev => ({...prev, phone: validatePhone(e.target.value)}))}
 className={`w-full pl-11 pr-4 py-4 bg-card border rounded-xl focus:ring-2 focus:border-primary outline-none transition-[border-color,box-shadow] duration-150 shadow-sm font-medium text-base placeholder:font-normal placeholder:text-muted-foreground text-foreground ${fieldErrors.phone ? 'border-destructive focus:ring-destructive/40' : 'border-input focus:ring-ring'}`}
 placeholder="(555) 123-4567"
 />
 </div>
 {fieldErrors.phone && (
 <p id="customer-phone-error" role="alert" className="text-xs text-destructive font-medium mt-1.5">{fieldErrors.phone}</p>
 )}
 </div>

 <div>
 <label htmlFor="customer-email" className="block text-sm font-semibold text-foreground mb-1.5">
 Email Address {reminderMinutesBefore !== null && <span className="text-muted-foreground font-normal">(needed for your reminder)</span>}
 </label>
 <div className="relative">
 <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
 <Mail className="h-5 w-5 text-muted-foreground"/>
 </div>
 <input
 id="customer-email"
 type="email"
 autoComplete="email"
 aria-invalid={!!fieldErrors.email}
 aria-describedby={fieldErrors.email ? 'customer-email-error' : undefined}
 value={customer.email}
 onChange={e => {
 setCustomer({...customer, email: e.target.value});
 if (fieldErrors.email) setFieldErrors(prev => ({...prev, email: undefined}));
 }}
 onBlur={e => setFieldErrors(prev => ({...prev, email: validateEmail(e.target.value)}))}
 className={`w-full pl-11 pr-4 py-4 bg-card border rounded-xl focus:ring-2 focus:border-primary outline-none transition-[border-color,box-shadow] duration-150 shadow-sm font-medium text-base placeholder:font-normal placeholder:text-muted-foreground text-foreground ${fieldErrors.email ? 'border-destructive focus:ring-destructive/40' : 'border-input focus:ring-ring'}`}
 placeholder="jane@example.com"
 />
 </div>
 {fieldErrors.email && (
 <p id="customer-email-error" role="alert" className="text-xs text-destructive font-medium mt-1.5">{fieldErrors.email}</p>
 )}
 </div>

 <div>
 <label htmlFor="customer-notes" className="block text-sm font-semibold text-foreground mb-1.5">
 Notes <span className="font-normal text-muted-foreground">(optional)</span>
 </label>
 <textarea
 id="customer-notes"
 value={customer.notes}
 onChange={e => setCustomer({...customer, notes: e.target.value})}
 className="w-full p-4 bg-card border border-input rounded-xl focus:ring-2 focus:ring-ring focus:border-primary outline-none transition-[border-color,box-shadow] duration-150 shadow-sm resize-none h-24 text-base placeholder:text-muted-foreground text-foreground"
 placeholder="Any special instructions for the professional?"
 ></textarea>
 </div>

 <div>
 <h3 className="text-sm font-bold text-foreground mb-3">How are you paying?</h3>
 <div className="grid grid-cols-2 gap-3" role="radiogroup" aria-label="Payment method">
 <button
 type="button"
 role="radio"
 aria-checked={paymentMethod === 'cash'}
 onClick={() => setPaymentMethod('cash')}
 className={`flex flex-col items-center justify-center gap-2 py-4 rounded-xl border-2 font-semibold transition-[transform,box-shadow,border-color,background-color] duration-150 active:scale-[0.97] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
 paymentMethod === 'cash'
 ? 'border-primary bg-primary/5 text-primary shadow-sm'
 : 'border-border bg-card text-foreground hover:border-primary/30'
 }`}
 >
 <Banknote className="w-6 h-6"/>
 Cash
 </button>
 <button
 type="button"
 role="radio"
 aria-checked={paymentMethod === 'etransfer'}
 onClick={() => setPaymentMethod('etransfer')}
 className={`flex flex-col items-center justify-center gap-2 py-4 rounded-xl border-2 font-semibold transition-[transform,box-shadow,border-color,background-color] duration-150 active:scale-[0.97] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
 paymentMethod === 'etransfer'
 ? 'border-primary bg-primary/5 text-primary shadow-sm'
 : 'border-border bg-card text-foreground hover:border-primary/30'
 }`}
 >
 <Landmark className="w-6 h-6"/>
 E-transfer
 </button>
 </div>
 </div>

 <div>
 <h3 className="text-sm font-bold text-foreground mb-1 flex items-center gap-2">
 <BellRing className="w-4 h-4 text-muted-foreground"/>
 Email reminder (optional)
 </h3>
 {availableReminderOptions.length === 0 ? (
 <p className="text-sm text-muted-foreground">No reminder options are available this close to your appointment.</p>
 ) : (
 <>
 <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Reminder time">
 <button
 type="button"
 role="radio"
 aria-checked={reminderMinutesBefore === null}
 onClick={() => setReminderMinutesBefore(null)}
 className={`px-4 py-2 rounded-full text-sm font-semibold border-2 transition-[transform,box-shadow,border-color,background-color] duration-150 active:scale-[0.97] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
 reminderMinutesBefore === null
 ? 'border-primary bg-primary/5 text-primary'
 : 'border-border bg-card text-foreground hover:border-primary/30'
 }`}
 >
 No reminder
 </button>
 {availableReminderOptions.map(opt => (
 <button
 key={opt.minutes}
 type="button"
 role="radio"
 aria-checked={reminderMinutesBefore === opt.minutes}
 onClick={() => setReminderMinutesBefore(opt.minutes)}
 className={`px-4 py-2 rounded-full text-sm font-semibold border-2 transition-[transform,box-shadow,border-color,background-color] duration-150 active:scale-[0.97] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
 reminderMinutesBefore === opt.minutes
 ? 'border-primary bg-primary/5 text-primary'
 : 'border-border bg-card text-foreground hover:border-primary/30'
 }`}
 >
 {opt.label}
 </button>
 ))}
 </div>
 {reminderMinutesBefore !== null && !customer.email && (
 <p className="text-sm text-amber-600 mt-2">Add your email above so we know where to send the reminder.</p>
 )}
 </>
 )}
 </div>

 {error && (
 <div role="alert" aria-live="assertive" className="p-4 bg-destructive/10 text-destructive rounded-xl text-sm font-medium flex items-start gap-2 border border-destructive/20">
 <Info className="w-5 h-5 shrink-0 mt-0.5"/>
 {error}
 </div>
 )}
 </div>
 </div>
 )}

 {/* STEP 5: SUCCESS */}
 {step === 5 && (
 <div className="flex flex-col items-center px-4 pt-10 pb-16 animate-in fade-in slide-in-from-bottom-2 duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]">
 <div className="relative mb-5">
 <div className="anim-ring-pulse absolute inset-0 rounded-full border-2 border-success pointer-events-none" aria-hidden="true"/>
 <div className="animate-in zoom-in-90 fade-in duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] w-14 h-14 bg-success rounded-full flex items-center justify-center shadow-lg shadow-success/25 text-success-foreground">
 <Check className="w-7 h-7"strokeWidth={3} />
 </div>
 </div>
 <h2 className="text-2xl font-black font-heading text-foreground mb-1.5 text-center">Booking Confirmed!</h2>
 <p className="text-muted-foreground text-sm text-center mb-8 max-w-sm">
 Thanks for booking with <span className="font-semibold text-foreground">{provider.name}</span>{customer.name ? `, ${customer.name.split(' ')[0]}` : ''}. We've sent the details to your email.
 </p>

 {/* Receipt Card */}
 <div className="anim-stagger-item w-full bg-card rounded-3xl border border-border shadow-sm overflow-hidden mb-6" style={{ animationDelay: '80ms' }}>
 <div className="flex items-center gap-3 p-5 bg-muted/40 border-b border-dashed border-border">
 {provider.logo_url ? (
 <img src={provider.logo_url} alt=""className="w-10 h-10 rounded-xl object-cover border border-border shrink-0"/>
 ) : (
 <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
 <Building2 className="w-5 h-5 text-primary"/>
 </div>
 )}
 <div className="flex-1 min-w-0">
 <p className="font-bold text-foreground truncate">{provider.name}</p>
 <p className="text-xs text-muted-foreground">Home Cleaning Service</p>
 </div>
 <div className="text-right shrink-0">
 <p className="text-[11px] text-muted-foreground uppercase tracking-wide font-semibold">Ref</p>
 <p className="font-mono text-sm font-bold text-foreground">{bookingResponse?.reference_id}</p>
 </div>
 </div>

 <div className="p-5 space-y-4">
 <div className="anim-stagger-item space-y-2.5" style={{ animationDelay: '140ms' }}>
 {Object.entries(cart).map(([id, qty]) => {
 const item = serviceItems.find(s => s.id === parseInt(id));
 if (!item) return null;
 return (
 <div key={id} className="flex justify-between items-start text-sm gap-3">
 <span className="text-foreground/80">{qty}x {item.name}</span>
 <span className="font-medium text-foreground shrink-0">${item.price * qty}</span>
 </div>
 )
 })}
 </div>

 <div className="anim-stagger-item pt-4 border-t border-dashed border-border flex justify-between items-center" style={{ animationDelay: '180ms' }}>
 <span className="font-bold text-foreground">Total</span>
 <span className="font-black text-xl text-foreground">${bookingResponse?.total_quote}</span>
 </div>

 <div className="anim-stagger-item pt-4 border-t border-border space-y-3" style={{ animationDelay: '220ms' }}>
 {scheduleLabel && (
 <div className="flex items-start gap-3">
 <CalendarDays className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5"/>
 <span className="text-sm text-foreground/80">{scheduleLabel}</span>
 </div>
 )}
 <div className="flex items-start gap-3">
 <MapPin className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5"/>
 <span className="text-sm text-foreground/80">
 {selectedAddress?.displayName}{unitNumber && `, Unit ${unitNumber}`}
 </span>
 </div>
 <div className="flex items-start gap-3">
 {paymentMethod === 'cash' ? (
 <Banknote className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5"/>
 ) : (
 <Landmark className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5"/>
 )}
 <span className="text-sm text-foreground/80">
 {paymentMethod === 'cash' ? 'Pay with cash'  : 'Pay with e-transfer'}
 </span>
 </div>
 </div>
 </div>
 </div>

 {paymentMethod === 'etransfer' && (
 <div className="anim-stagger-item bg-primary/5 border border-primary/20 rounded-2xl p-5 w-full mb-6 flex items-start gap-3" style={{ animationDelay: '260ms' }}>
 <Landmark className="w-5 h-5 text-primary shrink-0 mt-0.5"/>
 <div>
 <p className="font-bold text-foreground text-sm mb-0.5">Send your e-transfer to</p>
 <p className="text-foreground/80 text-sm">
 {provider.etransfer_email || 'The provider will contact you with e-transfer details.'}
 </p>
 </div>
 </div>
 )}

 {bookingResponse?.reminder_minutes_before && (
 <div className="anim-stagger-item bg-card border border-border rounded-2xl p-4 w-full mb-6 flex items-center gap-3 shadow-sm" style={{ animationDelay: '260ms' }}>
 <BellRing className="w-4 h-4 text-primary shrink-0"/>
 <p className="text-foreground/80 text-sm">
 We'll email you a reminder {reminderLabel(bookingResponse.reminder_minutes_before)} your appointment.
 </p>
 </div>
 )}

 {googleCalendarUrl && (
 <a
 href={googleCalendarUrl}
 target="_blank"
 rel="noopener noreferrer"
 className="w-full mb-3 py-4 bg-card border border-border text-foreground font-bold rounded-xl active:scale-[0.97] transition-[transform,box-shadow] duration-150 flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
 >
 <CalendarPlus className="w-4 h-4"/>
 Add to Google Calendar
 </a>
 )}

 <button
 onClick={() => window.location.reload()}
 className="w-full py-4 bg-primary text-primary-foreground font-bold rounded-xl active:scale-[0.97] transition-[transform,box-shadow] duration-150 shadow-xl cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
 >
 Book Another Service
 </button>
 </div>
 )}
 </main>

 {/* Sticky Bottom Action Bar */}
 {step > 1 && step < 5 && (
 <div className="fixed bottom-0 left-0 right-0 p-4 bg-card/80 backdrop-blur-md border-t border-border z-50 animate-in slide-in-from-bottom-full duration-300">
 <div className="max-w-2xl mx-auto flex items-center gap-4">
 {step === 2 && (
 <>
 <div className="flex-shrink-0 w-12 h-12 bg-muted rounded-xl flex items-center justify-center relative">
 <ShoppingCart className="w-5 h-5 text-muted-foreground"/>
 {totalItems > 0 && (
 <div key={totalItems} className="absolute -top-2 -right-2 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold border-2 border-card animate-in zoom-in-90 fade-in duration-200 ease-[cubic-bezier(0.23,1,0.32,1)]">
 {totalItems}
 </div>
 )}
 </div>
 <div className="flex-1 min-w-0">
 <div className="text-xs text-muted-foreground font-medium">Total Price</div>
 <div key={totalQuote} className="anim-pop text-xl font-black text-foreground">${totalQuote}</div>
 </div>
 <button
 disabled={totalItems === 0}
 onClick={() => goToStep(3)}
 className="px-8 py-3.5 bg-primary text-primary-foreground rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-[transform,box-shadow] duration-150 active:scale-[0.97] shadow-lg shadow-primary/25 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
 >
 Continue
 </button>
 </>
 )}

 {step === 3 && (
 <>
 <div className="flex-1 min-w-0">
 <div className="text-xs text-muted-foreground font-medium">Selected Slot</div>
 <div className="text-sm font-bold text-foreground truncate">
 {selectedDate && selectedTime
 ? `${new Date(selectedDate).toLocaleDateString('en-US', {month:'short', day:'numeric'})}, ${selectedTime}`
 : 'None'}
 </div>
 </div>
 <button
 disabled={!selectedDate || !selectedTime}
 onClick={() => goToStep(4)}
 className="px-8 py-3.5 bg-primary text-primary-foreground rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-[transform,box-shadow] duration-150 active:scale-[0.97] shadow-lg shadow-primary/25 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
 >
 Proceed
 </button>
 </>
 )}

 {step === 4 && (
 <>
 <div className="flex-1 min-w-0">
 <div className="text-xs text-muted-foreground font-medium">Total to pay</div>
 <div className="text-xl font-black text-foreground">${totalQuote}</div>
 </div>
 <button
 disabled={!selectedAddress || !customer.name || !customer.phone || !paymentMethod || !!fieldErrors.phone || !!fieldErrors.email || (reminderMinutesBefore !== null && !customer.email) || isSubmitting}
 onClick={submitBooking}
 className="px-8 py-3.5 bg-primary text-primary-foreground rounded-xl font-bold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-[transform,box-shadow] duration-150 active:scale-[0.97] shadow-lg shadow-primary/25 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
 >
 {isSubmitting ? (
 <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" aria-hidden="true"></div>
 ) : 'Confirm Booking'}
 </button>
 </>
 )}
 </div>
 </div>
 )}

 {/* Global Hide Scrollbar Class injection if needed (usually handled in global css, adding simple style here for assurance) */}
 <style dangerouslySetInnerHTML={{__html: `
 .hide-scrollbar::-webkit-scrollbar { display: none; }
 .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
 `}} />
 </div>
 );
}
