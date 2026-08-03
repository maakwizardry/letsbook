import BrowserFrame from '@/components/browser-frame';
import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { QRCodeCanvas } from 'qrcode.react';
import { useEffect, useRef, useState } from 'react';
import {
 SprayCan,
 CalendarClock,
 BellRing,
 Wallet,
 MapPin,
 ShieldCheck,
 Check,
 X,
 ArrowRight,
 ArrowDown,
 ClipboardList,
 Share2,
 CheckCircle2,
 Clock3,
 Mail,
 Users,
 QrCode,
 Download,
 Timer,
 Sparkles,
} from 'lucide-react';
import AppLogoIcon from '@/components/app-logo-icon';
import { DashboardIcon } from '@/components/icons/dashboard-icon';

function Skeleton({ className }: { className: string }) {
 return <div className={`skeleton-shimmer rounded-md bg-muted ${className}`} />;
}

const DEMO_STEPS = ['loading', 'address', 'schedule', 'confirmed'] as const;
type DemoStep = (typeof DEMO_STEPS)[number];

function BookingDemoCard() {
 const [step, setStep] = useState<DemoStep>('loading');

 useEffect(() => {
 const durations: Record<DemoStep, number> = { loading: 1400, address: 1800, schedule: 1800, confirmed: 2400 };
 const timeout = setTimeout(() => {
 const idx = DEMO_STEPS.indexOf(step);
 setStep(DEMO_STEPS[(idx + 1) % DEMO_STEPS.length]);
 }, durations[step]);
 return () => clearTimeout(timeout);
 }, [step]);

 return (
 <div className="relative w-full max-w-sm mx-auto">
 <div className="absolute -inset-4 bg-gradient-to-br from-primary/20 via-chart-4/10 to-chart-2/20 rounded-[2.5rem] blur-2xl" aria-hidden="true"/>
 <div className="relative bg-card border border-border rounded-[2rem] shadow-xl overflow-hidden">
 <div className="flex items-center gap-1.5 px-4 py-3 border-b border-border bg-muted/50">
 <span className="w-2.5 h-2.5 rounded-full bg-destructive/40"/>
 <span className="w-2.5 h-2.5 rounded-full bg-chart-3/40"/>
 <span className="w-2.5 h-2.5 rounded-full bg-success/40"/>
 <span className="ml-3 text-xs font-medium text-muted-foreground truncate">letsbook.app/sparkle-cleaning</span>
 </div>

 <div className="p-5 min-h-[300px]">
 {step === 'loading' && (
 <div key="loading" className="space-y-4 animate-in fade-in duration-300">
 <div className="flex items-center gap-3">
 <Skeleton className="w-12 h-12 shrink-0 rounded-2xl"/>
 <div className="flex-1 space-y-2">
 <Skeleton className="h-4 w-2/3"/>
 <Skeleton className="h-3 w-1/2"/>
 </div>
 </div>
 <Skeleton className="h-32 w-full rounded-xl"/>
 <Skeleton className="h-11 w-full rounded-xl"/>
 <p className="text-xs text-muted-foreground text-center pt-1">Loading booking page…</p>
 </div>
 )}

 {step === 'address' && (
 <div key="address" className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
 <h3 className="font-bold font-heading text-foreground">Where should we come?</h3>
 <div className="flex items-start gap-2 p-3 bg-accent/60 rounded-xl border border-border">
 <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5"/>
 <span className="text-sm text-foreground">128 Maple Street, Toronto, ON</span>
 </div>
 <div className="h-10 rounded-lg bg-muted flex items-center px-3 text-sm text-muted-foreground">Unit 4B</div>
 <div className="h-11 rounded-xl bg-primary/90 flex items-center justify-center text-sm font-bold text-primary-foreground">Continue</div>
 </div>
 )}

 {step === 'schedule' && (
 <div key="schedule" className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
 <h3 className="font-bold font-heading text-foreground">When do you need us?</h3>
 <div className="grid grid-cols-4 gap-2">
 {['Mon','Tue','Wed','Thu'].map((d, i) => (
 <div key={d} className={`rounded-xl border-2 py-2 text-center text-xs font-semibold ${i === 2 ? 'border-primary bg-primary/5 text-primary' : 'border-border text-muted-foreground'}`}>
 {d}
 </div>
 ))}
 </div>
 <div className="grid grid-cols-3 gap-2">
 {['9 AM','11 AM','2 PM'].map((t, i) => (
 <div key={t} className={`rounded-lg py-2 text-center text-xs font-semibold ${i === 1 ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'}`}>
 {t}
 </div>
 ))}
 </div>
 <div className="h-11 rounded-xl bg-primary/90 flex items-center justify-center text-sm font-bold text-primary-foreground">Proceed</div>
 </div>
 )}

 {step === 'confirmed' && (
 <div key="confirmed" className="flex flex-col items-center justify-center text-center py-6 animate-in zoom-in-95 duration-300">
 <div className="w-16 h-16 rounded-full bg-success/15 flex items-center justify-center mb-4">
 <CheckCircle2 className="w-8 h-8 text-success"/>
 </div>
 <h3 className="font-bold font-heading text-foreground mb-1">Booking Confirmed!</h3>
 <p className="text-sm text-muted-foreground mb-4">Wed, 11:00 AM · Ref #BKG-7F2A1</p>
 <div className="w-full flex items-center justify-between text-xs text-muted-foreground border-t border-dashed border-border pt-4">
 <span className="flex items-center gap-1"><Clock3 className="w-3.5 h-3.5"/> Instant, no calls</span>
 <span className="flex items-center gap-1 text-success font-semibold"><Check className="w-3.5 h-3.5"/> Synced to your dashboard</span>
 </div>
 </div>
 )}
 </div>
 </div>
 </div>
 );
}

const TOUR_TABS = [
 {
 key: 'dashboard',
 label: 'Dashboard',
 icon: DashboardIcon,
 color: 'bg-primary/10 text-primary',
 eyebrow: 'Open it anytime',
 image: '/images/dashboard.jpeg',
 imageWidth: 1400,
 imageHeight: 686,
 url: 'letsbook.app/dashboard',
 title: 'Know exactly what needs attention',
 description: "Instead of checking Facebook messages, texts, and notebooks, open one dashboard and see what's happening with your business — revenue, what's outstanding, and how many jobs need attention today.",
 points: ['Total & monthly revenue', 'Outstanding payments to collect', 'Orders broken down by status', 'Cash vs. e-transfer split'],
 },
 {
 key: 'orders',
 label: 'Orders',
 icon: ClipboardList,
 color: 'bg-chart-4/10 text-chart-4',
 eyebrow: 'Throughout the day',
 image: '/images/orders.jpeg',
 imageWidth: 1400,
 imageHeight: 684,
 url: 'letsbook.app/orders',
 title: 'Every booking, organized',
 description: 'As bookings come in, you check Orders to see who’s booked, when, and for what — filter by status or payment, and update a job the moment it’s done.',
 points: ['Filter by status, payment & date', "Customer name and phone on every row", 'Update job status right from the list'],
 },
 {
 key: 'availability',
 label: 'Availability',
 icon: CalendarClock,
 color: 'bg-chart-2/10 text-chart-2',
 eyebrow: 'Once, at signup',
 image: '/images/availability.jpeg',
 imageWidth: 1280,
 imageHeight: 626,
 url: 'letsbook.app/availability',
 title: 'Set your hours once, never double-book',
 description: "You set your working hours a single time. From then on, customers only ever see times you're actually free — no double-bookings, ever.",
 points: ['Turn any day on or off', 'Multiple time ranges per day', 'Changes reflect instantly on your booking page'],
 },
 {
 key: 'customers',
 label: 'Customers',
 icon: Users,
 color: 'bg-chart-5/10 text-chart-5',
 eyebrow: 'As you grow',
 image: '/images/customers.webp',
 imageWidth: 1400,
 imageHeight: 860,
 url: 'letsbook.app/customers',
 title: "Stop digging through WhatsApp for an address",
 description: "Every customer gets their own profile — contact info, address, booking history, total spending, and outstanding balance, all in one place. No more scrolling old message threads to find what you need.",
 points: ['Total spent & outstanding for every customer', 'One-tap call or email from their profile', 'Spot your regulars — and win back quiet ones'],
 },
 {
 key: 'customer-detail',
 label: 'Customer Profile',
 icon: Users,
 color: 'bg-primary/10 text-primary',
 eyebrow: 'Before every job',
 image: '/images/customer-detail.webp',
 imageWidth: 1400,
 imageHeight: 860,
 url: 'letsbook.app/customers/emma-wilson',
 title: 'Everything about a customer, without searching',
 description: "Open a customer's profile and everything's there — lifetime spend, outstanding balance, address with buzz code and entry notes for the crew, and their full booking history. Call or email them without ever hunting for a number again.",
 points: ['Lifetime spend, balance & average job value', 'Address, buzz code & entry notes for the crew', 'Every past and upcoming booking in one list'],
 },
] as const;

function ProductTour() {
 return (
 <section className="max-w-5xl mx-auto px-5 py-16 lg:py-20">
 <div className="text-center mb-16">
 <h2 className="text-3xl font-black font-heading text-foreground mb-2">See exactly what you'll get</h2>
 <p className="text-muted-foreground max-w-lg mx-auto">Running your business on LetsBook — from open to close, and as it grows.</p>
 </div>

 <div className="space-y-16 lg:space-y-24">
 {TOUR_TABS.map((tab, i) => (
 <div key={tab.key} className="grid lg:grid-cols-2 gap-8 lg:gap-14 items-center">
 <div className={i % 2 === 1 ? 'lg:order-2' : ''}>
 <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${tab.color}`}>
 <tab.icon className="w-5 h-5"/>
 </div>
 <span className="block text-xs font-bold uppercase tracking-wide text-muted-foreground mb-2">{tab.eyebrow}</span>
 <h3 className="text-2xl font-black font-heading text-foreground mb-3">{tab.title}</h3>
 <p className="text-muted-foreground leading-relaxed mb-6">{tab.description}</p>
 <ul className="space-y-3">
 {tab.points.map((point) => (
 <li key={point} className="flex items-start gap-3 text-foreground">
 <span className="w-5 h-5 rounded-full bg-success/15 flex items-center justify-center shrink-0 mt-0.5">
 <Check className="w-3 h-3 text-success"/>
 </span>
 <span className="text-sm font-medium">{point}</span>
 </li>
 ))}
 </ul>
 </div>

 <div className={i % 2 === 1 ? 'lg:order-1' : ''}>
 <BrowserFrame url={tab.url} image={tab.image} imageWidth={tab.imageWidth} imageHeight={tab.imageHeight} alt={`${tab.label} screenshot`}/>
 </div>
 </div>
 ))}
 </div>
 </section>
 );
}

const EMAIL_STORY = [
 {
 key: 'booking-confirmed',
 audience: 'customer' as const,
 subject: 'Your booking is confirmed',
 narrative: "Jordan books a cleaning through Sparkle Clean Co.'s page. Within seconds, a confirmation lands in their inbox — the date, the address, and every service itemized, so there's no surprise later. One tap adds it straight to Jordan's Google Calendar.",
 image: '/images/emails/booking-confirmed.webp',
 width: 900,
 height: 1325,
 },
 {
 key: 'new-booking',
 audience: 'provider' as const,
 subject: 'New booking received',
 narrative: 'At the very same moment, Sparkle Clean Co. gets notified too — customer details, address, a link straight into their dashboard, and their own one-tap link to add the job to Google Calendar. No missed calls, no double-booking.',
 image: '/images/emails/new-booking.webp',
 width: 900,
 height: 1431,
 },
 {
 key: 'reminder',
 audience: 'customer' as const,
 subject: 'Booking reminder',
 narrative: "As the appointment gets closer, Jordan gets a friendly nudge — so nobody forgets, and nobody's left waiting on the day.",
 image: '/images/emails/booking-reminder.webp',
 width: 900,
 height: 1194,
 },
 {
 key: 'in-progress',
 audience: 'customer' as const,
 subject: 'Your cleaning has started',
 narrative: 'On the day, the moment the team marks the job underway, Jordan knows the cleaning has actually started.',
 image: '/images/emails/status-in-progress.webp',
 width: 900,
 height: 1059,
 },
 {
 key: 'completed',
 audience: 'customer' as const,
 subject: 'Your cleaning is complete',
 narrative: 'When the job wraps up, Jordan gets a recap of everything that was done — and a thank-you from Sparkle Clean Co.',
 image: '/images/emails/status-completed.webp',
 width: 900,
 height: 1141,
 },
 {
 key: 'payment',
 audience: 'provider' as const,
 subject: 'Payment recorded',
 narrative: "Once payment's marked received, Sparkle Clean Co. gets a clean, itemized receipt for their own records. Nothing to track down later.",
 image: '/images/emails/payment-confirmed.webp',
 width: 900,
 height: 1208,
 },
];

function EmailStory() {
 return (
 <section className="max-w-5xl mx-auto px-5 py-16 lg:py-20">
 <div className="text-center mb-14">
 <h2 className="text-3xl font-black font-heading text-foreground mb-2">Once they book, LetsBook keeps everyone informed.</h2>
 <p className="text-muted-foreground max-w-lg mx-auto">From confirmation to reminder to completion, LetsBook automatically keeps your customer and your business updated — every email sent for you, automatically.</p>
 </div>

 <div className="relative">
 <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-px bg-border -translate-x-1/2" aria-hidden="true"/>

 <div className="space-y-16 lg:space-y-24">
 {EMAIL_STORY.map((step, i) => (
 <div key={step.key} className="relative grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
 <div className="hidden lg:flex absolute left-1/2 top-0 -translate-x-1/2 w-9 h-9 rounded-full bg-primary text-primary-foreground items-center justify-center font-black text-sm shadow-lg shadow-primary/25 z-10">
 {i + 1}
 </div>

 <div className={i % 2 === 1 ? 'lg:order-2' : ''}>
 <span
 className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold mb-3 ${
 step.audience === 'provider' ? 'bg-chart-4/10 text-chart-4' : 'bg-primary/10 text-primary'
 }`}
 >
 {step.audience === 'provider' ? <DashboardIcon className="w-3.5 h-3.5"/> : <Mail className="w-3.5 h-3.5"/>}
 Sent to the {step.audience === 'provider' ? 'business' : 'customer'}
 </span>
 <h3 className="text-xl font-black font-heading text-foreground mb-2">{step.subject}</h3>
 <p className="text-muted-foreground leading-relaxed">{step.narrative}</p>
 </div>

 <div className={i % 2 === 1 ? 'lg:order-1' : ''}>
 <div className="relative max-w-xs mx-auto">
 <div className="absolute -inset-3 bg-gradient-to-br from-primary/15 via-chart-4/10 to-chart-2/15 rounded-[2rem] blur-2xl" aria-hidden="true"/>
 <img
 src={step.image}
 width={step.width}
 height={step.height}
 loading="lazy"
 decoding="async"
 alt={`"${step.subject}" email screenshot`}
 className="relative w-full h-auto rounded-2xl border border-border shadow-xl"
 />
 </div>
 </div>
 </div>
 ))}
 </div>
 </div>
 </section>
 );
}

const SITE_URL = 'https://letsbook.maakhq.com';
const PAGE_TITLE = 'LetsBook — Online Booking Software for Home Cleaning Businesses';
const PAGE_DESCRIPTION =
 'Give your home cleaning business a booking page customers love. Automated scheduling, reminders, and one dashboard for every job — $199 one-time, no monthly fees.';
const OG_IMAGE = `${SITE_URL}/images/og-image.jpg`;

const STRUCTURED_DATA = {
 '@context': 'https://schema.org',
 '@type': 'SoftwareApplication',
 name: 'LetsBook',
 applicationCategory: 'BusinessApplication',
 operatingSystem: 'Web',
 description: PAGE_DESCRIPTION,
 url: SITE_URL,
 image: OG_IMAGE,
 offers: {
 '@type': 'Offer',
 price: '199',
 priceCurrency: 'USD',
 },
};

function FeatureCard({ icon: Icon, color, title, description }: { icon: React.ComponentType<{ className?: string }>; color: string; title: string; description: string }) {
 return (
 <div className="group bg-card border border-border rounded-2xl p-5 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
 <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6 ${color}`}>
 <Icon className="w-5 h-5"/>
 </div>
 <h3 className="font-bold font-heading text-foreground mb-1">{title}</h3>
 <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
 </div>
 );
}

// Rendered on an offscreen canvas (not an <img> pointed at an SVG) so the
// already-loaded Lexend webfont is available — fonts aren't applied inside
// images loaded via a data: URL, only within same-document canvas draws.
function drawWordmarkLogo(): Promise<string> {
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
 ctx.fillStyle = '#0284c7';
 ctx.font = '700 32px Lexend, sans-serif';
 ctx.textAlign = 'center';
 ctx.textBaseline = 'middle';
 ctx.fillText('LetsBook', width / 2, height / 2 + 2);
 return canvas.toDataURL('image/png');
 });
}

const QR_DEMO_URL = 'https://letsbook.maakhq.com/business/fury-provider';

function QrBanner() {
 const [logoSrc, setLogoSrc] = useState('');
 const canvasRef = useRef<HTMLCanvasElement>(null);

 useEffect(() => {
 let cancelled = false;
 drawWordmarkLogo().then((src) => {
 if (!cancelled) setLogoSrc(src);
 });
 return () => {
 cancelled = true;
 };
 }, []);

 const download = () => {
 const canvas = canvasRef.current;
 if (!canvas) return;
 const link = document.createElement('a');
 link.href = canvas.toDataURL('image/png');
 link.download = 'letsbook-demo-qr-code.png';
 link.click();
 };

 return (
 <div className="mt-5 bg-card border border-border rounded-2xl p-6 lg:p-8 shadow-sm flex flex-col lg:flex-row items-center gap-8 lg:gap-10">
 <div className="flex-1 text-center lg:text-left">
 <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4 mx-auto lg:mx-0 bg-primary/10 text-primary">
 <QrCode className="w-5 h-5"/>
 </div>
 <h3 className="font-bold font-heading text-foreground text-xl mb-2">Printable QR Code</h3>
 <p className="text-sm text-muted-foreground leading-relaxed max-w-md mx-auto lg:mx-0 mb-5">
 Download a QR code for your booking page — stick it on your van, a flyer, or a door hanger. This one's live: scan it and you'll land on a real booking page, not a mockup.
 </p>
 <button
 onClick={download}
 className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90"
 >
 <Download className="h-4 w-4"/>
 Download PNG
 </button>
 </div>
 <div className="shrink-0 w-full max-w-56 lg:w-56 rounded-xl border border-border bg-white p-4">
 <QRCodeCanvas
 ref={canvasRef}
 value={QR_DEMO_URL}
 size={512}
 level="H"
 marginSize={2}
 style={{ width: '100%', height: 'auto' }}
 imageSettings={
 logoSrc ? { src: logoSrc, height: 56, width: 200, excavate: true } : undefined
 }
 />
 </div>
 </div>
 );
}

const BOOKING_FLOW_STEPS = [
 { icon: Share2, label: 'Customer gets your link' },
 { icon: SprayCan, label: 'Chooses a cleaning service' },
 { icon: CalendarClock, label: 'Picks an available time' },
 { icon: MapPin, label: 'Enters their address' },
 { icon: CheckCircle2, label: 'Booking confirmed' },
 { icon: DashboardIcon, label: 'You get the job in your dashboard' },
];

function BookingFlowSection() {
 return (
 <section className="max-w-4xl mx-auto px-5 py-16 lg:py-20">
 <div className="text-center mb-12">
 <h2 className="text-3xl font-black font-heading text-foreground mb-3">Your customers shouldn't have to ask if you're available.</h2>
 <p className="text-muted-foreground max-w-xl mx-auto leading-relaxed">
 When someone wants to book a cleaning, they shouldn't have to wait for you to reply. With LetsBook, you send them one link. They choose their service, choose an available time, enter their address, and book.
 </p>
 </div>

 <div className="grid sm:grid-cols-3 lg:grid-cols-6 gap-3 items-stretch">
 {BOOKING_FLOW_STEPS.map((step, i) => (
 <div key={step.label} className="relative rounded-2xl border border-border bg-card p-4 pt-5 flex flex-col items-center text-center gap-2.5 shadow-sm">
 <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-black flex items-center justify-center shadow-sm">
 {i + 1}
 </span>
 <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
 <step.icon className="w-4.5 h-4.5"/>
 </div>
 <span className="text-xs font-semibold text-foreground leading-snug">{step.label}</span>
 </div>
 ))}
 </div>

 <p className="text-center mt-10 text-lg font-bold font-heading text-foreground">
 You keep cleaning. <span className="text-primary">LetsBook handles the booking.</span>
 </p>
 </section>
 );
}

function OldWayNewWaySection() {
 const withoutItems = [
 '"Are you available Friday?"',
 '"How much for a 3-bedroom house?"',
 '"What time can you come?"',
 '"What\'s your address again?"',
 'Booking details scattered across Messenger and texts',
 'Double-bookings and scheduling headaches',
 'Spending your evening answering booking messages',
 ];
 const withItems = [
 'Send one booking link',
 'Customers choose their own service',
 'Customers choose an available time',
 'Address collected automatically',
 'Every booking in one dashboard',
 'Automatic customer reminders',
 'You spend less time managing bookings',
 ];

 return (
 <section className="max-w-6xl mx-auto px-5 py-16 lg:py-20">
 <div className="text-center mb-12">
 <h2 className="text-3xl font-black font-heading text-foreground mb-2">You started a cleaning business. Not a call center.</h2>
 <p className="text-muted-foreground max-w-lg mx-auto">Here's what changes once your customers can book you online.</p>
 </div>
 <div className="grid md:grid-cols-2 gap-6">
 <div className="rounded-2xl border border-border bg-card p-6">
 <span className="inline-block text-xs font-bold uppercase tracking-wide text-muted-foreground mb-4">Without LetsBook</span>
 <ul className="space-y-4">
 {withoutItems.map((text, i) => (
 <li key={i} className="flex items-start gap-3 text-muted-foreground">
 <span className="w-5 h-5 rounded-full bg-destructive/10 flex items-center justify-center shrink-0 mt-0.5">
 <X className="w-3 h-3 text-destructive/70"/>
 </span>
 <span className="text-sm">{text}</span>
 </li>
 ))}
 </ul>
 </div>
 <div className="rounded-2xl border-2 border-primary/30 bg-primary/[0.04] p-6 relative overflow-hidden">
 <span className="inline-block text-xs font-bold uppercase tracking-wide text-primary mb-4">With LetsBook</span>
 <ul className="space-y-4">
 {withItems.map((text, i) => (
 <li key={i} className="flex items-start gap-3 text-foreground font-medium">
 <span className="w-5 h-5 rounded-full bg-success/15 flex items-center justify-center shrink-0 mt-0.5">
 <Check className="w-3 h-3 text-success"/>
 </span>
 <span className="text-sm">{text}</span>
 </li>
 ))}
 </ul>
 </div>
 </div>
 <div className="text-center mt-10">
 <Link href={route('register')} className="inline-flex items-center gap-1.5 text-primary font-bold hover:underline">
 Let customers book themselves <ArrowRight className="w-4 h-4"/>
 </Link>
 </div>
 </section>
 );
}

// Working days/month (not calendar days — matches a business that's closed
// some days) and an hourly value assumption. Both stated in the disclaimer
// so the numbers below the slider are never a mystery.
const ROI_WORKING_DAYS_PER_MONTH = 24;
const ROI_HOURLY_RATE = 30;
const ROI_MIN_MINUTES = 15;
const ROI_MAX_MINUTES = 180;
const ROI_DEFAULT_MINUTES = 45;

function formatRoiCurrency(amount: number) {
 return `$${Math.round(amount).toLocaleString('en-US')}`;
}

function RoiSection() {
 const [minutesPerDay, setMinutesPerDay] = useState(ROI_DEFAULT_MINUTES);

 const hoursPerMonth = (minutesPerDay * ROI_WORKING_DAYS_PER_MONTH) / 60;
 const costPerMonth = hoursPerMonth * ROI_HOURLY_RATE;
 const costPerYear = costPerMonth * 12;

 const sliderPercent = ((minutesPerDay - ROI_MIN_MINUTES) / (ROI_MAX_MINUTES - ROI_MIN_MINUTES)) * 100;

 return (
 <section className="max-w-4xl mx-auto px-5 py-16 lg:py-20">
 <div className="rounded-[2rem] border border-border bg-card shadow-sm p-8 sm:p-12">
 <div className="text-center mb-10">
 <h2 className="text-3xl font-black font-heading text-foreground mb-3">How much is booking admin costing you?</h2>
 <p className="text-muted-foreground max-w-xl mx-auto leading-relaxed">
 Drag the slider to how much time you actually spend each day answering booking messages, checking availability, collecting addresses, and updating your calendar.
 </p>
 </div>

 <div className="max-w-md mx-auto mb-10">
 <div className="flex items-center justify-between mb-3">
 <span className="text-sm font-semibold text-muted-foreground">Time spent per day</span>
 <span className="text-lg font-black font-heading text-primary">{minutesPerDay} min</span>
 </div>
 <input
 type="range"
 min={ROI_MIN_MINUTES}
 max={ROI_MAX_MINUTES}
 step={5}
 value={minutesPerDay}
 onChange={(e) => setMinutesPerDay(Number(e.target.value))}
 className="roi-slider w-full"
 style={{ '--roi-slider-fill': `${sliderPercent}%` } as React.CSSProperties}
 aria-label="Minutes per day spent on booking admin"
 />
 <div className="flex items-center justify-between mt-1.5 text-xs text-muted-foreground">
 <span>{ROI_MIN_MINUTES} min</span>
 <span>{ROI_MAX_MINUTES} min</span>
 </div>
 </div>

 <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-8">
 <div className="rounded-2xl bg-muted/60 px-3 py-5 text-center">
 <Timer className="w-5 h-5 text-muted-foreground mx-auto mb-2"/>
 <div key={hoursPerMonth} className="anim-pop text-xl sm:text-2xl font-black font-heading text-foreground">{hoursPerMonth.toFixed(1)}</div>
 <div className="text-xs text-muted-foreground mt-0.5">hours / month</div>
 </div>
 <div className="rounded-2xl bg-muted/60 px-3 py-5 text-center">
 <ClipboardList className="w-5 h-5 text-muted-foreground mx-auto mb-2"/>
 <div key={costPerMonth} className="anim-pop text-xl sm:text-2xl font-black font-heading text-foreground">{formatRoiCurrency(costPerMonth)}</div>
 <div className="text-xs text-muted-foreground mt-0.5">per month</div>
 </div>
 <div className="rounded-2xl bg-destructive/5 border border-destructive/15 px-3 py-5 text-center">
 <X className="w-5 h-5 text-destructive/70 mx-auto mb-2"/>
 <div key={costPerYear} className="anim-pop text-xl sm:text-2xl font-black font-heading text-foreground">{formatRoiCurrency(costPerYear)}</div>
 <div className="text-xs text-muted-foreground mt-0.5">per year</div>
 </div>
 </div>

 <p className="text-center text-foreground font-semibold mb-3">
 LetsBook gives that work back to you by letting customers handle the booking themselves.
 </p>
 <p className="text-center text-xs text-muted-foreground italic">
 Illustrative example — assumes {ROI_WORKING_DAYS_PER_MONTH} working days per month and your time is worth ${ROI_HOURLY_RATE}/hour. Adjust the slider to match your own business.
 </p>
 </div>
 </section>
 );
}

function BuiltForSmallBusinessSection() {
 const items = [
 'Solo cleaners',
 '2–5 person cleaning teams',
 'Residential cleaning companies',
 'Deep cleaning businesses',
 'Move-in / move-out cleaners',
 'Recurring home cleaning services',
 ];
 return (
 <section className="max-w-5xl mx-auto px-5 py-16 lg:py-20">
 <div className="rounded-[2rem] bg-gradient-to-br from-primary/[0.06] via-transparent to-chart-4/[0.06] border border-border p-8 sm:p-12">
 <div className="text-center mb-10">
 <h2 className="text-3xl font-black font-heading text-foreground mb-3">Built for the way small cleaning businesses actually work.</h2>
 <p className="text-muted-foreground max-w-xl mx-auto leading-relaxed">
 You don't need complicated business software. You need something that lets customers book, keeps your schedule organized, and helps you remember who owes you what. LetsBook was built specifically for owner-operated and small home cleaning businesses.
 </p>
 </div>
 <p className="text-center text-xs font-bold uppercase tracking-wide text-muted-foreground mb-5">Perfect for</p>
 <div className="flex flex-wrap justify-center gap-3 max-w-2xl mx-auto">
 {items.map((item) => (
 <span key={item} className="inline-flex items-center gap-2 rounded-full bg-card border border-border px-4 py-2 text-sm font-semibold text-foreground shadow-sm">
 <Check className="w-3.5 h-3.5 text-success shrink-0"/>
 {item}
 </span>
 ))}
 </div>
 </div>
 </section>
 );
}

function WhatYouGetFlow() {
 const items = [
 { label: 'Customer', detail: 'Books online', icon: Users, color: 'bg-chart-4/10 text-chart-4' },
 { label: 'LetsBook', detail: 'Organizes everything', icon: Sparkles, color: 'bg-primary/10 text-primary' },
 { label: 'You', detail: 'Show up and do the job', icon: SprayCan, color: 'bg-success/10 text-success' },
 ];
 return (
 <div className="max-w-3xl mx-auto px-5 mb-14">
 <h2 className="text-center text-2xl font-black font-heading text-foreground mb-8">Everything you need to stop taking bookings manually.</h2>
 <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
 {items.map((item, i) => (
 <div key={item.label} className="contents">
 <div className="rounded-2xl border border-border bg-card p-5 text-center shadow-sm w-full sm:w-40">
 <div className={`w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3 ${item.color}`}>
 <item.icon className="w-5 h-5"/>
 </div>
 <div className="font-bold font-heading text-foreground text-sm">{item.label}</div>
 <div className="text-xs text-muted-foreground mt-0.5">{item.detail}</div>
 </div>
 {i < items.length - 1 && (
 <ArrowDown className="sm:hidden w-4 h-4 text-muted-foreground/40"/>
 )}
 {i < items.length - 1 && (
 <ArrowRight className="hidden sm:block w-4 h-4 text-muted-foreground/40 shrink-0"/>
 )}
 </div>
 ))}
 </div>
 <p className="text-center text-sm text-muted-foreground mt-6 max-w-md mx-auto">
 This isn't just another dashboard. It's a system that removes booking administration.
 </p>
 </div>
 );
}

export default function Welcome() {
 const { auth } = usePage<SharedData>().props;

 return (
 <>
 <Head title={PAGE_TITLE}>
 <meta name="description" content={PAGE_DESCRIPTION}/>
 <meta name="robots" content="index, follow"/>
 <link rel="canonical" href={SITE_URL}/>

 <meta property="og:type" content="website"/>
 <meta property="og:site_name" content="LetsBook"/>
 <meta property="og:title" content={PAGE_TITLE}/>
 <meta property="og:description" content={PAGE_DESCRIPTION}/>
 <meta property="og:url" content={SITE_URL}/>
 <meta property="og:image" content={OG_IMAGE}/>
 <meta property="og:image:width" content="1600"/>
 <meta property="og:image:height" content="875"/>
 <meta property="og:image:alt" content="LetsBook booking dashboard"/>

 <meta name="twitter:card" content="summary_large_image"/>
 <meta name="twitter:title" content={PAGE_TITLE}/>
 <meta name="twitter:description" content={PAGE_DESCRIPTION}/>
 <meta name="twitter:image" content={OG_IMAGE}/>

 <script type="application/ld+json">{JSON.stringify(STRUCTURED_DATA)}</script>

 <link rel="preconnect"href="https://fonts.bunny.net"/>
 <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600|lexend:500,600,700,800"rel="stylesheet"/>
 <link rel="preload" as="image" href="/images/dashboard.jpeg" fetchPriority="low"/>
 <link rel="preload" as="image" href="/images/orders.jpeg" fetchPriority="low"/>
 <link rel="preload" as="image" href="/images/availability.jpeg" fetchPriority="low"/>
 </Head>

 <div className="min-h-dvh bg-background font-sans overflow-x-hidden">

 {/* Nav */}
 <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
 <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
 <div className="flex items-center gap-2">
 <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center shadow-sm shadow-primary/30">
 <AppLogoIcon className="w-5 h-5 text-white"/>
 </div>
 <span className="font-black font-heading text-lg text-foreground">LetsBook</span>
 </div>
 <nav aria-label="Primary" className="flex items-center gap-2">
 {auth.user ? (
 <Link href={route('dashboard')} className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:opacity-90 transition-opacity">
 Dashboard
 </Link>
 ) : (
 <>
 <Link href={route('login')} className="hidden sm:inline-block px-4 py-2 rounded-xl text-sm font-semibold text-foreground hover:bg-accent transition-colors">
 Log in
 </Link>
 <Link href={route('register')} className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:opacity-90 active:scale-95 transition-all">
 Get Started
 </Link>
 </>
 )}
 </nav>
 </div>
 </header>

 <main>
 {/* Hero */}
 <section className="relative max-w-6xl mx-auto px-5 pt-14 pb-20 lg:pt-20 lg:pb-28">
 <div className="absolute top-10 -left-16 w-56 h-56 bg-chart-2/10 rounded-full blur-3xl" aria-hidden="true"/>
 <div className="absolute top-40 -right-10 w-72 h-72 bg-chart-4/10 rounded-3xl rotate-12 blur-3xl" aria-hidden="true"/>

 <div className="relative grid lg:grid-cols-2 gap-14 items-center">
 <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
 <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent text-accent-foreground text-xs font-bold mb-6">
 <SprayCan className="w-3.5 h-3.5"/>
 Built for home cleaning businesses
 </div>
 <h1 className="text-4xl sm:text-5xl lg:text-[3.2rem] font-black font-heading text-foreground leading-[1.05] mb-5">
 Stop managing your cleaning business through <span className="text-primary">texts and DMs.</span>
 </h1>
 <p className="text-lg text-muted-foreground leading-relaxed mb-8 max-w-md">
 Give your customers one simple link where they can choose a service, pick an available time, enter their address, and book themselves — while every job goes straight into your dashboard.
 </p>
 <div className="flex flex-col sm:flex-row gap-3 mb-6">
 <Link
 href={route('register')}
 className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-xl bg-primary text-primary-foreground font-bold shadow-lg shadow-primary/25 hover:opacity-90 active:scale-95 transition-all"
 >
 Get LetsBook — $199 Lifetime
 <ArrowRight className="w-4 h-4"/>
 </Link>
 <a
 href="#how-it-works"
 className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-xl bg-card border border-border text-foreground font-bold hover:bg-accent transition-colors"
 >
 See How It Works
 </a>
 </div>
 <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground font-medium mb-3">
 <span className="flex items-center gap-1.5"><Check className="w-4 h-4 text-success"/> One-time payment</span>
 <span className="flex items-center gap-1.5"><Check className="w-4 h-4 text-success"/> No monthly fees</span>
 <span className="flex items-center gap-1.5"><Check className="w-4 h-4 text-success"/> Lifetime access</span>
 <span className="flex items-center gap-1.5"><Check className="w-4 h-4 text-success"/> Free setup & support</span>
 </div>
 <p className="text-xs text-muted-foreground">Built specifically for home cleaning businesses.</p>
 </div>

 <div className="animate-in fade-in zoom-in-95 duration-700 delay-150">
 <BookingDemoCard/>
 <div className="mt-5 text-center">
 <p className="text-sm font-bold text-foreground">Customer books themselves.</p>
 <p className="text-xs text-muted-foreground mt-0.5">No phone call. No back-and-forth. No manual scheduling.</p>
 </div>
 </div>
 </div>
 </section>

 <BookingFlowSection/>

 <OldWayNewWaySection/>

 <RoiSection/>

 {/* Features */}
 <section className="max-w-6xl mx-auto px-5 py-16 lg:py-20">
 <div className="text-center mb-12">
 <h2 className="text-3xl font-black font-heading text-foreground mb-2">Everything your cleaning business needs to stop chasing bookings</h2>
 <p className="text-muted-foreground max-w-lg mx-auto">One simple system for taking bookings, organizing customers, and keeping your schedule under control.</p>
 </div>
 <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
 <FeatureCard icon={Share2} color="bg-primary/10 text-primary" title="Let customers book themselves" description="Share your booking link on Facebook, Instagram, WhatsApp, Google, text messages, or your website. Customers choose the service, time, and address without waiting for you to reply."/>
 <FeatureCard icon={CalendarClock} color="bg-chart-2/10 text-chart-2" title="Never double-book yourself" description="Set your working hours once. Customers only see times you're actually available."/>
 <FeatureCard icon={MapPin} color="bg-chart-4/10 text-chart-4" title="Know exactly where every job is" description="Every booking includes the customer's address, contact information, service, date, time, and job details. No more searching through old messages."/>
 <FeatureCard icon={Users} color="bg-chart-5/10 text-chart-5" title="Keep every customer in one place" description="See booking history, total spending, outstanding balances, addresses, and contact information from one customer profile."/>
 <FeatureCard icon={BellRing} color="bg-chart-3/10 text-chart-3" title="Fewer no-shows" description="Automatic reminders keep customers informed before their appointment."/>
 <FeatureCard icon={Wallet} color="bg-success/10 text-success" title="Get paid the way you already do" description="Track cash and e-transfer payments without forcing your customers into a complicated payment system."/>
 </div>
 <QrBanner/>
 </section>

 {/* Share anywhere */}
 <section className="max-w-4xl mx-auto px-5 py-16 lg:py-20 text-center">
 <h2 className="text-3xl font-black font-heading text-foreground mb-3">Put your booking link everywhere customers find you.</h2>
 <p className="text-muted-foreground max-w-lg mx-auto mb-6">Your booking page works wherever your customers already find you.</p>
 <p className="font-bold text-foreground mb-8">Facebook · Instagram · WhatsApp · Google · Website · Text · QR Code</p>
 <Link
 href={route('register')}
 className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-xl bg-primary text-primary-foreground font-bold shadow-lg shadow-primary/25 hover:opacity-90 active:scale-95 transition-all"
 >
 Get My Booking Link
 <ArrowRight className="w-4 h-4"/>
 </Link>
 </section>

 <BuiltForSmallBusinessSection/>

 <ProductTour/>

 <EmailStory/>

 {/* How it works */}
 <section id="how-it-works" className="max-w-6xl mx-auto px-5 py-16 lg:py-20">
 <div className="text-center mb-14">
 <h2 className="text-3xl font-black font-heading text-foreground mb-2">Start taking online bookings in minutes.</h2>
 </div>
 <div className="grid md:grid-cols-3 gap-8 relative">
 {[
 { n: '1', title: 'Get your booking page', text: 'Set up your services, prices, hours, and business details.' },
 { n: '2', title: 'Share your link', text: 'Put it on Facebook, Instagram, WhatsApp, your website, or anywhere customers find you.' },
 { n: '3', title: 'Let customers book', text: 'Customers choose their service and time. You get the booking automatically.' },
 ].map((step) => (
 <div key={step.n} className="relative text-center px-4">
 <div className="w-14 h-14 rounded-2xl bg-primary text-primary-foreground font-black font-heading text-xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-primary/25 rotate-3 hover:rotate-0 transition-transform duration-300">
 {step.n}
 </div>
 <h3 className="font-bold font-heading text-foreground mb-1.5">{step.title}</h3>
 <p className="text-sm text-muted-foreground leading-relaxed">{step.text}</p>
 </div>
 ))}
 </div>
 <p className="text-center text-sm font-semibold text-muted-foreground mt-12">
 No complicated setup. No onboarding meetings. No software training.
 </p>
 </section>

 {/* Pricing */}
 <section id="pricing" className="max-w-3xl mx-auto px-5 py-16 lg:py-20">
 <WhatYouGetFlow/>
 <div className="relative rounded-[2rem] border-2 border-primary/20 bg-card shadow-xl overflow-hidden p-8 sm:p-12 text-center">
 <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl" aria-hidden="true"/>
 <div className="relative">
 <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-success/10 text-success text-xs font-bold mb-5">
 <ShieldCheck className="w-3.5 h-3.5"/>
 No subscriptions, ever
 </div>
 <h2 className="text-2xl font-black font-heading text-foreground mb-1">One payment. Your booking system forever.</h2>
 <div className="flex items-end justify-center gap-1 mb-1 mt-4">
 <span className="text-2xl font-black font-heading text-foreground self-start mt-2">$</span>
 <span className="text-6xl font-black font-heading text-foreground">199</span>
 </div>
 <p className="text-muted-foreground font-medium mb-8">One-time payment · Lifetime access</p>

 <ul className="text-left max-w-sm mx-auto space-y-3 mb-9">
 {[
 'Your own booking page',
 'Unlimited bookings',
 'Customer management',
 'Scheduling & availability',
 'Automated reminders',
 'Booking dashboard',
 'Cash & e-transfer tracking',
 'Google Calendar integration',
 'QR code for your business',
 'Free setup',
 'Free lifetime support',
 ].map((f) => (
 <li key={f} className="flex items-center gap-3 text-foreground">
 <span className="w-5 h-5 rounded-full bg-success/15 flex items-center justify-center shrink-0">
 <Check className="w-3 h-3 text-success"/>
 </span>
 <span className="text-sm font-medium">{f}</span>
 </li>
 ))}
 </ul>

 <p className="font-bold text-foreground mb-6">No monthly software bill. Ever.</p>

 <Link
 href={route('register')}
 className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-10 py-4 rounded-xl bg-primary text-primary-foreground font-bold shadow-lg shadow-primary/25 hover:opacity-90 active:scale-95 transition-all"
 >
 Get LetsBook — $199 Lifetime
 <ArrowRight className="w-4 h-4"/>
 </Link>
 <p className="text-xs text-muted-foreground mt-4">
 We'll help you get your booking page set up and ready to share.
 </p>
 </div>
 </div>
 </section>

 {/* Final CTA */}
 <section className="max-w-3xl mx-auto px-5 py-16 lg:py-20 text-center">
 <h2 className="text-3xl font-black font-heading text-foreground mb-3">Ready to stop chasing bookings?</h2>
 <p className="text-muted-foreground max-w-lg mx-auto mb-2">
 Give your customers one link to book your cleaning services — and give yourself one place to manage every job.
 </p>
 <p className="font-bold text-foreground mb-8">One payment. No monthly fees. Lifetime access.</p>
 <div className="flex flex-col sm:flex-row gap-3 justify-center mb-4">
 <Link
 href={route('register')}
 className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-xl bg-primary text-primary-foreground font-bold shadow-lg shadow-primary/25 hover:opacity-90 active:scale-95 transition-all"
 >
 Get LetsBook — $199 Lifetime
 <ArrowRight className="w-4 h-4"/>
 </Link>
 <a
 href="#how-it-works"
 className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-xl bg-card border border-border text-foreground font-bold hover:bg-accent transition-colors"
 >
 See How It Works
 </a>
 </div>
 <p className="text-xs text-muted-foreground">Built for home cleaning businesses.</p>
 </section>
 </main>

 {/* Footer */}
 <footer className="border-t border-border">
 <div className="max-w-6xl mx-auto px-5 py-8 flex flex-col sm:flex-row items-center justify-between gap-3">
 <div className="flex items-center gap-2">
 <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center">
 <AppLogoIcon className="w-4 h-4 text-white"/>
 </div>
 <span className="font-bold font-heading text-sm text-foreground">LetsBook</span>
 </div>
 <p className="text-xs text-muted-foreground">&copy; {new Date().getFullYear()} LetsBook. Made for home cleaning businesses.</p>
 </div>
 </footer>
 </div>

 <style dangerouslySetInnerHTML={{__html: `
 .skeleton-shimmer {
 position: relative;
 overflow: hidden;
 }
 .skeleton-shimmer::after {
 content: '';
 position: absolute;
 inset: 0;
 transform: translateX(-100%);
 background-image: linear-gradient(90deg, transparent, rgba(255,255,255,0.55), transparent);
 animation: skeleton-sweep 1.6s infinite;
 }
 @keyframes skeleton-sweep {
 100% { transform: translateX(100%); }
 }
 .roi-slider {
 -webkit-appearance: none;
 -moz-appearance: none;
 appearance: none;
 height: 8px;
 border-radius: 9999px;
 background: linear-gradient(to right, var(--primary) var(--roi-slider-fill, 0%), var(--border) var(--roi-slider-fill, 0%));
 outline: none;
 cursor: pointer;
 }
 .roi-slider::-webkit-slider-thumb {
 -webkit-appearance: none;
 appearance: none;
 width: 22px;
 height: 22px;
 border-radius: 9999px;
 background: var(--primary);
 border: 3px solid var(--card);
 box-shadow: 0 1px 4px rgba(0,0,0,0.25);
 cursor: pointer;
 }
 .roi-slider::-moz-range-thumb {
 width: 22px;
 height: 22px;
 border-radius: 9999px;
 background: var(--primary);
 border: 3px solid var(--card);
 box-shadow: 0 1px 4px rgba(0,0,0,0.25);
 cursor: pointer;
 }
 `}} />
 </>
 );
}
