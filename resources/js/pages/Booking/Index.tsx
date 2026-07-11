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
 CheckCircle2
} from 'lucide-react';

export default function BookingWizard({ provider }: { provider: any }) {
 // 1: Home Type, 2: Services, 3: Schedule, 4: Details, 5: Success
 const [step, setStep] = useState(1);
 
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
 
 // UI states
 const [isSubmitting, setIsSubmitting] = useState(false);
 const [error, setError] = useState('');
 const [bookingResponse, setBookingResponse] = useState<any>(null);

 // Initial fetch
 useEffect(() => {
 fetch('/api/home-types')
 .then(res => res.json())
 .then(data => {
 const providerTypes = data.filter((h: any) => h.provider_id === provider.id);
 setHomeTypes(providerTypes.length ? providerTypes : data);
 });
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
 notes: customer.notes
 })
 });

 const data = await res.json();
 if (res.ok) {
 setBookingResponse(data.booking);
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
 value: d.toISOString().split('T')[0],
 isToday: i === 0
 });
 }
 return arr;
 }, []);

 const timeSlots = useMemo(() => {
 const slots = [];
 for (let i = 8; i <= 18; i++) {
 const hourStr = i.toString().padStart(2, '0');
 const timeString = `${hourStr}:00`;
 const isBooked = bookedSlots.some(isoStr => {
 const bookedDate = new Date(isoStr);
 return bookedDate.getHours() === i;
 });
 const period = i < 12 ? 'Morning' : (i < 16 ? 'Afternoon' : 'Evening');
 const formatted = i > 12 ? `${i-12}:00 PM` : (i === 12 ? '12:00 PM' : `${i}:00 AM`);
 
 slots.push({ time: timeString, label: formatted, period, available: !isBooked });
 }
 return slots;
 }, [bookedSlots]);

 const periods = ['Morning', 'Afternoon', 'Evening'];

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

 return (
 <div className="min-h-screen bg-gray-50 flex flex-col font-sans selection:bg-primary/20">
 <Head title={`${getStepTitle()} | ${provider.name}`} />
 
 {/* Top App Bar - Fixed */}
 <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
 <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
 <div className="flex items-center gap-3">
 {step > 1 && step < 5 ? (
 <button 
 onClick={() => setStep(s => s - 1)}
 className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors active:scale-95"
 >
 <ArrowLeft className="w-5 h-5 text-gray-700"/>
 </button>
 ) : (
 <div className="w-9"></div> // Spacer for alignment
 )}
 <h1 className="text-lg font-bold text-gray-900 truncate">
 {getStepTitle()}
 </h1>
 </div>
 {/* Tiny Progress Indicator */}
 {step < 5 && (
 <div className="text-xs font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-full">
 {step} / 4
 </div>
 )}
 </div>
 </header>

 {/* Main Content Area */}
 <main className="flex-1 max-w-2xl mx-auto w-full pb-28">
 
 {/* STEP 1: HOME TYPE */}
 {step === 1 && (
 <div className="p-4 animate-in fade-in slide-in-from-right-4 duration-300">
 <div className="mb-6">
 <h2 className="text-2xl font-extrabold text-gray-900 mb-1">Welcome to {provider.name}</h2>
 <p className="text-gray-500 text-sm">What kind of property needs cleaning?</p>
 </div>
 <div className="space-y-4">
 {homeTypes.map(type => (
 <button
 key={type.id}
 onClick={() => {
 setSelectedHomeTypeId(type.id);
 setStep(2);
 }}
 className="w-full flex items-center p-4 bg-white rounded-2xl border border-gray-100 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 active:scale-[0.98] group"
 >
 <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center mr-4 group-hover:bg-primary/10 transition-colors">
 <MapPin className="w-6 h-6 text-gray-500 group-hover:text-primary transition-colors"/>
 </div>
 <div className="flex-1 text-left">
 <h3 className="text-lg font-semibold text-gray-900">{type.label}</h3>
 <p className="text-sm text-gray-500 line-clamp-1">{type.description || 'Standard cleaning for this property size.'}</p>
 </div>
 <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-primary transition-colors"/>
 </button>
 ))}
 </div>
 </div>
 )}

 {/* STEP 2: SERVICES (CART STYLE) */}
 {step === 2 && (
 <div className="p-4 animate-in fade-in slide-in-from-right-4 duration-300">
 <div className="mb-6">
 <h2 className="text-2xl font-extrabold text-gray-900 mb-1">Add Services</h2>
 <p className="text-gray-500 text-sm">Customize your cleaning package.</p>
 </div>
 
 <div className="space-y-4">
 {serviceItems.map(item => {
 const qty = cart[item.id] || 0;
 return (
 <div key={item.id} className="flex p-4 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 relative overflow-hidden group">
 {qty > 0 && <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary"></div>}
 <div className="flex-1 pr-4">
 <div className="flex items-center gap-2 mb-1">
 {qty > 0 && <CheckCircle2 className="w-4 h-4 text-primary fill-primary/10"/>}
 <h3 className="font-bold text-gray-900 text-base">{item.name}</h3>
 </div>
 <div className="text-xs text-gray-500 mb-2 uppercase tracking-wide font-medium">{item.category}</div>
 <div className="font-semibold text-gray-900">${item.price}</div>
 </div>
 
 <div className="flex flex-col items-end justify-center">
 {qty === 0 ? (
 <button 
 onClick={() => handleAddService(item.id)}
 className="px-6 py-2 bg-primary/10 hover:bg-primary/20 text-primary font-semibold rounded-full transition-colors text-sm active:scale-95"
 >
 Add
 </button>
 ) : (
 <div className="flex items-center bg-gray-50 rounded-full border border-gray-200">
 <button 
 onClick={() => handleRemoveService(item.id)}
 className="w-9 h-9 flex items-center justify-center text-gray-600 hover:text-primary transition-colors active:scale-90"
 >
 <Minus className="w-4 h-4"/>
 </button>
 <span className="w-6 text-center font-semibold text-gray-900 text-sm">{qty}</span>
 <button 
 onClick={() => handleAddService(item.id)}
 className="w-9 h-9 flex items-center justify-center text-gray-600 hover:text-primary transition-colors active:scale-90"
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
 )}

 {/* STEP 3: SCHEDULE */}
 {step === 3 && (
 <div className="animate-in fade-in slide-in-from-right-4 duration-300">
 {/* Horizontal Date Picker */}
 <div className="bg-white pt-6 pb-4 border-b border-gray-100 sticky top-14 z-40">
 <div className="px-4 mb-4 flex items-center justify-between">
 <h2 className="text-xl font-extrabold text-gray-900">When do you need us?</h2>
 <CalendarDays className="w-5 h-5 text-gray-400"/>
 </div>
 
 <div className="flex overflow-x-auto hide-scrollbar px-4 pb-2 gap-3 snap-x">
 {dates.map((d, i) => {
 const isSelected = selectedDate === d.value;
 return (
 <button
 key={d.value}
 onClick={() => {
 setSelectedDate(d.value);
 setSelectedTime('');
 }}
 className={`flex-shrink-0 w-[4.5rem] p-3 rounded-2xl border-2 flex flex-col items-center justify-center snap-start transition-all duration-300 hover:-translate-y-0.5 active:scale-95 ${
 isSelected 
 ? 'border-primary bg-primary/5 shadow-sm' 
 : 'border-gray-100 bg-white hover:border-gray-200'
 }`}
 >
 <span className={`text-xs uppercase font-semibold mb-1 ${isSelected ? 'text-primary' : 'text-gray-500'}`}>
 {d.isToday ? 'Today' : d.dayLabel}
 </span>
 <span className={`text-xl font-bold ${isSelected ? 'text-primary' : 'text-gray-900 '}`}>
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
 <div className="text-center py-12 text-gray-500 flex flex-col items-center">
 <Clock className="w-12 h-12 text-gray-200 mb-3"/>
 <p>Please select a date to view available times.</p>
 </div>
 ) : (
 <div className="space-y-8 animate-in fade-in duration-300">
 {periods.map(period => {
 const periodSlots = timeSlots.filter(s => s.period === period);
 if (periodSlots.length === 0) return null;
 
 return (
 <div key={period}>
 <h3 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wider flex items-center gap-2">
 {period}
 </h3>
 <div className="grid grid-cols-3 gap-3">
 {periodSlots.map(slot => {
 const isSelected = selectedTime === slot.time;
 return (
 <button
 key={slot.time}
 disabled={!slot.available}
 onClick={() => setSelectedTime(slot.time)}
 className={`py-3 px-2 rounded-xl text-sm font-semibold border-2 transition-all active:scale-95 flex items-center justify-center ${
 !slot.available 
 ? 'bg-gray-50 border-transparent text-gray-400 line-through cursor-not-allowed'
 : isSelected
 ? 'bg-primary border-primary text-white shadow-md shadow-primary/20'
 : 'bg-white border-gray-100 text-gray-700 hover:border-gray-300'
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
 <div className="animate-in fade-in slide-in-from-right-4 duration-300">
 {/* Receipt Summary */}
 <div className="bg-white p-6 border-b border-gray-100">
 <h2 className="text-xl font-extrabold text-gray-900 mb-4">Summary</h2>
 
 <div className="space-y-3 mb-6">
 {Object.entries(cart).map(([id, qty]) => {
 const item = serviceItems.find(s => s.id === parseInt(id));
 if(!item) return null;
 return (
 <div key={id} className="flex justify-between items-start text-sm">
 <div className="flex-1">
 <span className="font-semibold text-gray-900">{qty}x {item.name}</span>
 </div>
 <div className="font-medium text-gray-900">${item.price * qty}</div>
 </div>
 )
 })}
 </div>
 
 <div className="pt-4 border-t border-dashed border-gray-200 flex justify-between items-center">
 <span className="font-bold text-gray-900 text-lg">Total to pay</span>
 <span className="font-black text-2xl text-gray-900">${totalQuote}</span>
 </div>
 </div>

 {/* User Details Form */}
 <div className="p-4 pt-6 space-y-5">
 <h2 className="text-xl font-extrabold text-gray-900">Your Details</h2>
 
 <div className="relative">
 <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
 <User className="h-5 w-5 text-gray-400"/>
 </div>
 <input 
 type="text"
 value={customer.name}
 onChange={e => setCustomer({...customer, name: e.target.value})}
 className="w-full pl-11 pr-4 py-4 bg-white border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all shadow-sm font-medium placeholder:font-normal"
 placeholder="Full Name"
 />
 </div>

 <div className="relative">
 <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
 <Phone className="h-5 w-5 text-gray-400"/>
 </div>
 <input 
 type="tel"
 value={customer.phone}
 onChange={e => setCustomer({...customer, phone: e.target.value})}
 className="w-full pl-11 pr-4 py-4 bg-white border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all shadow-sm font-medium placeholder:font-normal"
 placeholder="Phone Number"
 />
 </div>

 <div className="relative">
 <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
 <Mail className="h-5 w-5 text-gray-400"/>
 </div>
 <input 
 type="email"
 value={customer.email}
 onChange={e => setCustomer({...customer, email: e.target.value})}
 className="w-full pl-11 pr-4 py-4 bg-white border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all shadow-sm font-medium placeholder:font-normal"
 placeholder="Email Address"
 />
 </div>

 <div>
 <textarea 
 value={customer.notes}
 onChange={e => setCustomer({...customer, notes: e.target.value})}
 className="w-full p-4 bg-white border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all shadow-sm resize-none h-24"
 placeholder="Any special instructions for the professional?"
 ></textarea>
 </div>

 {error && (
 <div className="p-4 bg-red-50 text-red-700 rounded-xl text-sm font-medium flex items-start gap-2 border border-red-100">
 <Info className="w-5 h-5 shrink-0 mt-0.5"/>
 {error}
 </div>
 )}
 </div>
 </div>
 )}

 {/* STEP 5: SUCCESS */}
 {step === 5 && (
 <div className="flex flex-col items-center justify-center py-16 px-4 animate-in zoom-in-95 duration-500">
 <div className="relative mb-8">
 <div className="absolute inset-0 bg-green-500/20 blur-xl rounded-full"></div>
 <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center relative shadow-lg shadow-green-500/30 text-white">
 <Check className="w-12 h-12"strokeWidth={3} />
 </div>
 </div>
 <h2 className="text-3xl font-black text-gray-900 mb-3">Booking Confirmed!</h2>
 
 <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm w-full mb-8">
 <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-100">
 <span className="text-gray-500">Reference ID</span>
 <span className="font-mono font-bold text-gray-900">{bookingResponse?.reference_id}</span>
 </div>
 <div className="flex justify-between items-center">
 <span className="text-gray-500">Total</span>
 <span className="font-bold text-gray-900">${bookingResponse?.total_quote}</span>
 </div>
 </div>

 <p className="text-gray-500 text-center mb-8 max-w-sm">
 Thank you, <span className="font-semibold text-gray-900">{customer.name}</span>. Your service is scheduled. We've sent details to your email.
 </p>
 
 <button 
 onClick={() => window.location.reload()}
 className="w-full py-4 bg-gray-900 text-white font-bold rounded-xl active:scale-95 transition-all shadow-xl"
 >
 Book Another Service
 </button>
 </div>
 )}
 </main>

 {/* Sticky Bottom Action Bar */}
 {step > 1 && step < 5 && (
 <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-md border-t border-gray-200/50 z-50 animate-in slide-in-from-bottom-full duration-300">
 <div className="max-w-2xl mx-auto flex items-center gap-4">
 {step === 2 && (
 <>
 <div className="flex-shrink-0 w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center relative">
 <ShoppingCart className="w-5 h-5 text-gray-600"/>
 {totalItems > 0 && (
 <div className="absolute -top-2 -right-2 w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-xs font-bold border-2 border-white animate-in zoom-in spin-in-12 duration-300">
 {totalItems}
 </div>
 )}
 </div>
 <div className="flex-1">
 <div className="text-xs text-gray-500 font-medium">Total Price</div>
 <div className="text-xl font-black text-gray-900">${totalQuote}</div>
 </div>
 <button 
 disabled={totalItems === 0}
 onClick={() => setStep(3)}
 className="px-8 py-3.5 bg-primary text-white rounded-xl font-bold disabled:opacity-50 disabled:bg-gray-300 disabled:text-gray-500 transition-all active:scale-95 shadow-lg shadow-primary/25"
 >
 Continue
 </button>
 </>
 )}

 {step === 3 && (
 <>
 <div className="flex-1">
 <div className="text-xs text-gray-500 font-medium">Selected Slot</div>
 <div className="text-sm font-bold text-gray-900 truncate">
 {selectedDate && selectedTime 
 ? `${new Date(selectedDate).toLocaleDateString('en-US', {month:'short', day:'numeric'})}, ${selectedTime}`
 : 'None'}
 </div>
 </div>
 <button 
 disabled={!selectedDate || !selectedTime}
 onClick={() => setStep(4)}
 className="px-8 py-3.5 bg-primary text-white rounded-xl font-bold disabled:opacity-50 disabled:bg-gray-300 disabled:text-gray-500 transition-all active:scale-95 shadow-lg shadow-primary/25"
 >
 Proceed
 </button>
 </>
 )}

 {step === 4 && (
 <>
 <div className="flex-1">
 <div className="text-xs text-gray-500 font-medium">Total to pay</div>
 <div className="text-xl font-black text-gray-900">${totalQuote}</div>
 </div>
 <button 
 disabled={!customer.name || !customer.phone || isSubmitting}
 onClick={submitBooking}
 className="px-8 py-3.5 bg-primary text-white rounded-xl font-bold flex items-center gap-2 disabled:opacity-50 disabled:bg-gray-300 disabled:text-gray-500 transition-all active:scale-95 shadow-lg shadow-primary/25"
 >
 {isSubmitting ? (
 <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
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
