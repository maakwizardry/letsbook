import { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import { Check, ChevronRight, Calendar, Clock, Sparkles } from 'lucide-react';

export default function BookingWizard({ provider }: { provider: any }) {
    const [step, setStep] = useState(1);
    const [homeTypes, setHomeTypes] = useState<any[]>([]);
    const [selectedHomeTypeId, setSelectedHomeTypeId] = useState<number | null>(null);
    const [serviceItems, setServiceItems] = useState<any[]>([]);
    const [selectedServiceItemIds, setSelectedServiceItemIds] = useState<number[]>([]);
    const [selectedDate, setSelectedDate] = useState<string>('');
    const [selectedTime, setSelectedTime] = useState<string>('');
    const [bookedSlots, setBookedSlots] = useState<string[]>([]);
    const [quote, setQuote] = useState<number | null>(null);
    const [customer, setCustomer] = useState({ name: '', email: '', phone: '', notes: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [bookingResponse, setBookingResponse] = useState<any>(null);

    useEffect(() => {
        fetch('/api/home-types')
            .then(res => res.json())
            .then(data => {
                const providerTypes = data.filter((h: any) => h.provider_id === provider.id);
                setHomeTypes(providerTypes.length ? providerTypes : data);
            });
    }, [provider.id]);

    useEffect(() => {
        if (selectedHomeTypeId) {
            fetch(`/api/service-items?home_type_id=${selectedHomeTypeId}`)
                .then(res => res.json())
                .then(data => setServiceItems(data));
        }
    }, [selectedHomeTypeId]);

    useEffect(() => {
        if (selectedDate) {
            fetch(`/api/booked-slots?provider_id=${provider.id}&start_date=${selectedDate}&end_date=${selectedDate}`)
                .then(res => res.json())
                .then(data => setBookedSlots(data.booked_slots || []));
        }
    }, [selectedDate, provider.id]);

    const fetchQuote = () => {
        fetch('/api/quote', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                home_type_id: selectedHomeTypeId,
                service_item_ids: selectedServiceItemIds
            })
        })
        .then(res => res.json())
        .then(data => setQuote(data.total));
    };

    const nextStep = () => {
        if (step === 2) fetchQuote();
        setStep(s => s + 1);
    };

    const submitBooking = async () => {
        setIsSubmitting(true);
        setError('');
        
        try {
            const scheduled_at = `${selectedDate} ${selectedTime}:00`;
            const res = await fetch('/api/bookings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                body: JSON.stringify({
                    home_type_id: selectedHomeTypeId,
                    service_item_ids: selectedServiceItemIds,
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
                setStep(6);
            } else {
                setError(data.message || 'An error occurred while booking.');
            }
        } catch (e) {
            setError('Failed to submit booking. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const generateTimeSlots = () => {
        const slots = [];
        for (let i = 8; i <= 18; i++) {
            const hour = i.toString().padStart(2, '0');
            const timeString = `${hour}:00`;
            const isBooked = bookedSlots.some(isoStr => {
                const bookedDate = new Date(isoStr);
                return bookedDate.getHours() === i;
            });
            slots.push({ time: timeString, label: `${hour}:00`, available: !isBooked });
        }
        return slots;
    };

    const timeSlots = generateTimeSlots();

    return (
        <div className="min-h-screen bg-background md:bg-muted/30 py-6 md:py-12 px-4 sm:px-6 lg:px-8">
            <Head title={`Book with ${provider.name}`} />
            
            <div className="max-w-3xl mx-auto">
                <div className="text-center mb-8 md:mb-12">
                    <h1 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight mb-2">
                        {provider.name}
                    </h1>
                    <p className="text-base text-muted-foreground">Book your next cleaning service in seconds.</p>
                </div>

                <div className="bg-background md:rounded-2xl md:shadow-sm md:border md:border-border overflow-hidden transition-all duration-500">
                    <div className="md:px-10 py-4 md:py-8">
                        {/* Progress Bar */}
                        {step < 6 && (
                            <div className="mb-8">
                                <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                                    <div 
                                        className="h-full bg-primary transition-all duration-500 ease-out" 
                                        style={{ width: `${(step / 5) * 100}%` }}
                                    ></div>
                                </div>
                                <div className="mt-2 text-xs text-muted-foreground font-medium text-right">Step {step} of 5</div>
                            </div>
                        )}

                        {/* Step 1: Home Type */}
                        {step === 1 && (
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <h2 className="text-xl md:text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
                                    <Sparkles className="text-primary w-5 h-5" /> Select your home type
                                </h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {homeTypes.map(type => (
                                        <button
                                            key={type.id}
                                            onClick={() => setSelectedHomeTypeId(type.id)}
                                            className={`p-5 md:p-6 text-left rounded-xl border-2 transition-all duration-200 group relative overflow-hidden ${
                                                selectedHomeTypeId === type.id 
                                                ? 'border-primary bg-primary/5 shadow-sm' 
                                                : 'border-border hover:border-primary/40 hover:bg-muted/50'
                                            }`}
                                        >
                                            <div className="flex justify-between items-center">
                                                <span className="font-semibold text-base md:text-lg text-foreground group-hover:text-primary transition-colors">
                                                    {type.label}
                                                </span>
                                                {selectedHomeTypeId === type.id && (
                                                    <Check className="text-primary h-5 w-5 md:h-6 md:w-6" />
                                                )}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                                <div className="mt-8 flex justify-end">
                                    <button 
                                        disabled={!selectedHomeTypeId}
                                        onClick={nextStep}
                                        className="bg-primary text-primary-foreground px-6 py-2.5 rounded-lg font-semibold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                                    >
                                        Next <ChevronRight className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Step 2: Service Items */}
                        {step === 2 && (
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <h2 className="text-xl md:text-2xl font-bold text-foreground mb-6">What do you need cleaned?</h2>
                                <div className="space-y-3">
                                    {serviceItems.map(item => {
                                        const isSelected = selectedServiceItemIds.includes(item.id);
                                        return (
                                            <button
                                                key={item.id}
                                                onClick={() => {
                                                    if (isSelected) {
                                                        setSelectedServiceItemIds(prev => prev.filter(id => id !== item.id));
                                                    } else {
                                                        setSelectedServiceItemIds(prev => [...prev, item.id]);
                                                    }
                                                }}
                                                className={`w-full p-4 flex items-center justify-between rounded-xl border-2 transition-all ${
                                                    isSelected ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40 hover:bg-muted/50'
                                                }`}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-5 h-5 md:w-6 md:h-6 rounded-full border flex items-center justify-center transition-colors ${
                                                        isSelected ? 'bg-primary border-primary' : 'border-muted-foreground/30'
                                                    }`}>
                                                        {isSelected && <Check className="text-primary-foreground w-3 h-3 md:w-4 md:h-4" />}
                                                    </div>
                                                    <div className="text-left">
                                                        <div className="font-semibold text-foreground text-sm md:text-base">{item.name}</div>
                                                        <div className="text-xs md:text-sm text-muted-foreground">{item.category}</div>
                                                    </div>
                                                </div>
                                                <div className="font-bold text-foreground text-sm md:text-base">${item.price}</div>
                                            </button>
                                        );
                                    })}
                                </div>
                                <div className="mt-8 flex justify-between items-center">
                                    <button onClick={() => setStep(1)} className="text-muted-foreground hover:text-foreground font-medium px-2 py-2">Back</button>
                                    <button 
                                        disabled={selectedServiceItemIds.length === 0}
                                        onClick={nextStep}
                                        className="bg-primary text-primary-foreground px-6 py-2.5 rounded-lg font-semibold hover:bg-primary/90 disabled:opacity-50 transition-all"
                                    >
                                        Continue
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Step 3: Date & Time */}
                        {step === 3 && (
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <h2 className="text-xl md:text-2xl font-bold text-foreground mb-6">Choose a Date & Time</h2>
                                
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-muted-foreground" /> Select Date
                                    </label>
                                    <input 
                                        type="date" 
                                        min={new Date().toISOString().split('T')[0]}
                                        value={selectedDate}
                                        onChange={(e) => {
                                            setSelectedDate(e.target.value);
                                            setSelectedTime('');
                                        }}
                                        className="w-full sm:w-1/2 p-3 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none text-foreground"
                                    />
                                </div>

                                {selectedDate && (
                                    <div className="animate-in fade-in duration-300">
                                        <label className="block text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                                            <Clock className="w-4 h-4 text-muted-foreground" /> Available Times
                                        </label>
                                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                                            {timeSlots.map(slot => (
                                                <button
                                                    key={slot.time}
                                                    disabled={!slot.available}
                                                    onClick={() => setSelectedTime(slot.time)}
                                                    className={`py-3 px-2 rounded-lg text-sm font-medium transition-all ${
                                                        !slot.available 
                                                        ? 'bg-muted text-muted-foreground/50 cursor-not-allowed line-through' 
                                                        : selectedTime === slot.time
                                                        ? 'bg-primary text-primary-foreground shadow-sm'
                                                        : 'bg-background border border-border text-foreground hover:border-primary/40 hover:bg-muted/50'
                                                    }`}
                                                >
                                                    {slot.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="mt-8 flex justify-between items-center">
                                    <button onClick={() => setStep(2)} className="text-muted-foreground hover:text-foreground font-medium px-2 py-2">Back</button>
                                    <button 
                                        disabled={!selectedDate || !selectedTime}
                                        onClick={nextStep}
                                        className="bg-primary text-primary-foreground px-6 py-2.5 rounded-lg font-semibold hover:bg-primary/90 disabled:opacity-50 transition-all"
                                    >
                                        Continue
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Step 4: Details & Quote */}
                        {step === 4 && (
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <h2 className="text-xl md:text-2xl font-bold text-foreground mb-6">Your Details</h2>
                                
                                <div className="bg-primary/5 border border-primary/20 rounded-xl p-5 mb-8">
                                    <div className="text-xs text-primary font-semibold uppercase tracking-wider mb-1">Total Quote</div>
                                    <div className="text-3xl md:text-4xl font-extrabold text-foreground">${quote}</div>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-foreground mb-1">Full Name</label>
                                        <input 
                                            type="text" 
                                            value={customer.name}
                                            onChange={e => setCustomer({...customer, name: e.target.value})}
                                            className="w-full p-3 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all text-foreground"
                                            placeholder="John Doe"
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-foreground mb-1">Email</label>
                                            <input 
                                                type="email" 
                                                value={customer.email}
                                                onChange={e => setCustomer({...customer, email: e.target.value})}
                                                className="w-full p-3 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all text-foreground"
                                                placeholder="john@example.com"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-foreground mb-1">Phone</label>
                                            <input 
                                                type="tel" 
                                                value={customer.phone}
                                                onChange={e => setCustomer({...customer, phone: e.target.value})}
                                                className="w-full p-3 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all text-foreground"
                                                placeholder="(555) 000-0000"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-foreground mb-1">Special Instructions</label>
                                        <textarea 
                                            value={customer.notes}
                                            onChange={e => setCustomer({...customer, notes: e.target.value})}
                                            className="w-full p-3 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all text-foreground"
                                            rows={3}
                                            placeholder="Any details we should know before arriving?"
                                        ></textarea>
                                    </div>
                                </div>

                                {error && (
                                    <div className="mt-4 p-4 bg-destructive/10 border border-destructive/20 text-destructive rounded-lg text-sm">
                                        {error}
                                    </div>
                                )}

                                <div className="mt-8 flex justify-between items-center">
                                    <button onClick={() => setStep(3)} className="text-muted-foreground hover:text-foreground font-medium px-2 py-2">Back</button>
                                    <button 
                                        disabled={!customer.name || !customer.email || isSubmitting}
                                        onClick={submitBooking}
                                        className="bg-primary text-primary-foreground px-6 py-2.5 rounded-lg font-semibold hover:bg-primary/90 disabled:opacity-50 transition-all flex items-center gap-2"
                                    >
                                        {isSubmitting ? 'Booking...' : 'Confirm Booking'}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Step 5: Success */}
                        {step === 6 && (
                            <div className="text-center py-12 animate-in zoom-in-95 duration-500">
                                <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Check className="w-10 h-10 text-green-600" />
                                </div>
                                <h2 className="text-2xl md:text-3xl font-extrabold text-foreground mb-2">Booking Confirmed!</h2>
                                <div className="inline-block bg-muted border border-border text-foreground font-mono px-4 py-2 rounded-lg mb-4 text-base font-bold tracking-wider">
                                    {bookingResponse?.reference_id}
                                </div>
                                <p className="text-muted-foreground text-base md:text-lg mb-8 max-w-md mx-auto">
                                    Thank you, {customer.name}. Your cleaning service has been scheduled for {selectedDate} at {selectedTime}. We've sent a confirmation to {customer.email}.
                                </p>
                                <button 
                                    onClick={() => window.location.reload()}
                                    className="bg-foreground text-background px-6 py-2.5 rounded-lg font-semibold hover:bg-foreground/90 transition-all"
                                >
                                    Book Another Service
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
