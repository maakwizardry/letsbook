import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import {
 Sparkles,
 SprayCan,
 Link2,
 CalendarClock,
 BellRing,
 Wallet,
 MapPin,
 ShieldCheck,
 Check,
 ArrowRight,
 PhoneCall,
 MessageSquareText,
 ClipboardList,
 Share2,
 CheckCircle2,
 Clock3,
 Mail,
} from 'lucide-react';
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
 image: '/images/dashboard.jpeg',
 imageWidth: 1400,
 imageHeight: 686,
 url: 'letsbook.app/dashboard',
 title: 'Your business, at a glance',
 description: "Revenue, outstanding balances, completion rate, and order status — updated the moment a booking comes in. No spreadsheets, no guessing.",
 points: ['Total & monthly revenue', 'Outstanding payments to collect', 'Orders broken down by status', 'Cash vs. e-transfer split'],
 },
 {
 key: 'orders',
 label: 'Orders',
 icon: ClipboardList,
 image: '/images/orders.jpeg',
 imageWidth: 1400,
 imageHeight: 684,
 url: 'letsbook.app/orders',
 title: 'Every booking, organized',
 description: 'Filter by status, payment, or date range. See the customer, home type, schedule, and total for every job — and update status in one click.',
 points: ['Filter by status, payment & date', "Customer name and phone on every row", 'Update job status right from the list'],
 },
 {
 key: 'availability',
 label: 'Availability',
 icon: CalendarClock,
 image: '/images/availability.jpeg',
 imageWidth: 1280,
 imageHeight: 626,
 url: 'letsbook.app/availability',
 title: 'Set your hours once',
 description: "Toggle the days you work and set custom hours per day. Customers only ever see times you're actually free.",
 points: ['Turn any day on or off', 'Multiple time ranges per day', 'Changes reflect instantly on your booking page'],
 },
] as const;

function ProductTour() {
 const [active, setActive] = useState<(typeof TOUR_TABS)[number]['key']>('dashboard');
 const tab = TOUR_TABS.find((t) => t.key === active)!;

 return (
 <section className="max-w-6xl mx-auto px-5 py-16 lg:py-20">
 <div className="text-center mb-10">
 <h2 className="text-3xl font-black font-heading text-foreground mb-2">See exactly what you'll get</h2>
 <p className="text-muted-foreground max-w-lg mx-auto">Peek inside the dashboard your business will run on, before you sign up.</p>
 </div>

 <div className="flex justify-center gap-2 mb-10 flex-wrap">
 {TOUR_TABS.map((t) => (
 <button
 key={t.key}
 onClick={() => setActive(t.key)}
 className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
 active === t.key
 ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25'
 : 'bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-accent'
 }`}
 >
 <t.icon className="w-4 h-4"/>
 {t.label}
 </button>
 ))}
 </div>

 <div className="grid lg:grid-cols-5 gap-10 lg:gap-14 items-center">
 <div key={tab.key} className="lg:col-span-3 relative animate-in fade-in zoom-in-95 duration-300">
 <div className="absolute -inset-4 bg-gradient-to-br from-primary/20 via-chart-4/10 to-chart-2/20 rounded-[2.5rem] blur-2xl" aria-hidden="true"/>
 <div className="relative bg-card border border-border rounded-2xl shadow-xl overflow-hidden">
 <div className="flex items-center gap-1.5 px-4 py-3 border-b border-border bg-muted/50">
 <span className="w-2.5 h-2.5 rounded-full bg-destructive/40"/>
 <span className="w-2.5 h-2.5 rounded-full bg-chart-3/40"/>
 <span className="w-2.5 h-2.5 rounded-full bg-success/40"/>
 <span className="ml-3 text-xs font-medium text-muted-foreground truncate">{tab.url}</span>
 </div>
 <img
 src={tab.image}
 alt={`${tab.label} screenshot`}
 width={tab.imageWidth}
 height={tab.imageHeight}
 loading="lazy"
 decoding="async"
 className="w-full h-auto block"
 />
 </div>
 </div>

 <div key={`${tab.key}-copy`} className="lg:col-span-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
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
 </div>
 </section>
 );
}

const EMAIL_STORY = [
 {
 key: 'booking-confirmed',
 audience: 'customer' as const,
 subject: 'Your booking is confirmed',
 narrative: "Jordan books a cleaning through Sparkle Clean Co.'s page. Within seconds, a confirmation lands in their inbox — the date, the address, and every service itemized, so there's no surprise later.",
 image: '/images/emails/booking-confirmed.webp',
 width: 900,
 height: 1226,
 },
 {
 key: 'new-booking',
 audience: 'provider' as const,
 subject: 'New booking received',
 narrative: 'At the very same moment, Sparkle Clean Co. gets notified too — customer details, address, and a link straight into their dashboard. No missed calls, no double-booking.',
 image: '/images/emails/new-booking.webp',
 width: 900,
 height: 1333,
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
 <h2 className="text-3xl font-black font-heading text-foreground mb-2">A booking's story, told in emails</h2>
 <p className="text-muted-foreground max-w-lg mx-auto">Follow one real booking from click to completion — every email your business and your customer actually receive, sent automatically.</p>
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
 'Give your home cleaning business a booking page customers love. Automated scheduling, reminders, and one dashboard for every job — $129 one-time, no monthly fees.';
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
 price: '129',
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
 <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-sm shadow-primary/30">
 <Sparkles className="w-4.5 h-4.5 text-primary-foreground"/>
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
 <h1 className="text-4xl sm:text-5xl lg:text-[3.4rem] font-black font-heading text-foreground leading-[1.05] mb-5">
 Stop chasing bookings<br/>
 by <span className="text-primary">phone.</span>
 </h1>
 <p className="text-lg text-muted-foreground leading-relaxed mb-8 max-w-md">
 Give your cleaning business a booking page customers actually love. Share the link or embed it on your website — every job lands straight in one dashboard. No more calls, no more texting back and forth, no more spreadsheets.
 </p>
 <div className="flex flex-col sm:flex-row gap-3 mb-6">
 <Link
 href={route('register')}
 className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-xl bg-primary text-primary-foreground font-bold shadow-lg shadow-primary/25 hover:opacity-90 active:scale-95 transition-all"
 >
 Get Yours Now — $129 Lifetime
 <ArrowRight className="w-4 h-4"/>
 </Link>
 <a
 href="#how-it-works"
 className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-xl bg-card border border-border text-foreground font-bold hover:bg-accent transition-colors"
 >
 See how it works
 </a>
 </div>
 <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground font-medium">
 <span className="flex items-center gap-1.5"><Check className="w-4 h-4 text-success"/> One-time payment</span>
 <span className="flex items-center gap-1.5"><Check className="w-4 h-4 text-success"/> Lifetime access</span>
 <span className="flex items-center gap-1.5"><Check className="w-4 h-4 text-success"/> Free support</span>
 </div>
 </div>

 <div className="animate-in fade-in zoom-in-95 duration-700 delay-150">
 <BookingDemoCard/>
 </div>
 </div>
 </section>

 {/* Old way vs LetsBook way */}
 <section className="max-w-6xl mx-auto px-5 py-16 lg:py-20">
 <div className="text-center mb-12">
 <h2 className="text-3xl font-black font-heading text-foreground mb-2">You're running a cleaning business, not a call center.</h2>
 <p className="text-muted-foreground max-w-lg mx-auto">Here's what changes once your customers can book you online.</p>
 </div>
 <div className="grid md:grid-cols-2 gap-6">
 <div className="rounded-2xl border border-border bg-card p-6">
 <span className="inline-block text-xs font-bold uppercase tracking-wide text-muted-foreground mb-4">The old way</span>
 <ul className="space-y-4">
 {[
 { icon: PhoneCall, text: 'Customers call just to check if you’re free' },
 { icon: MessageSquareText, text: 'You text back and forth to confirm a time' },
 { icon: ClipboardList, text: 'Jobs scattered across notebooks, texts, and calendars' },
 ].map((item, i) => (
 <li key={i} className="flex items-start gap-3 text-muted-foreground">
 <item.icon className="w-5 h-5 shrink-0 mt-0.5"/>
 <span className="text-sm">{item.text}</span>
 </li>
 ))}
 </ul>
 </div>
 <div className="rounded-2xl border-2 border-primary/30 bg-primary/[0.04] p-6 relative overflow-hidden">
 <span className="inline-block text-xs font-bold uppercase tracking-wide text-primary mb-4">The LetsBook way</span>
 <ul className="space-y-4">
 {[
 { icon: Share2, text: 'Share one booking link, anywhere' },
 { icon: CalendarClock, text: 'Customers pick an open time instantly' },
 { icon: DashboardIcon, text: 'Every booking lands in one dashboard' },
 ].map((item, i) => (
 <li key={i} className="flex items-start gap-3 text-foreground font-medium">
 <item.icon className="w-5 h-5 shrink-0 mt-0.5 text-primary"/>
 <span className="text-sm">{item.text}</span>
 </li>
 ))}
 </ul>
 </div>
 </div>
 </section>

 {/* Features */}
 <section className="max-w-6xl mx-auto px-5 py-16 lg:py-20">
 <div className="text-center mb-12">
 <h2 className="text-3xl font-black font-heading text-foreground mb-2">Everything you need to get booked</h2>
 <p className="text-muted-foreground max-w-lg mx-auto">One simple tool. No monthly fees, no learning curve.</p>
 </div>
 <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
 <FeatureCard icon={Link2} color="bg-primary/10 text-primary" title="Share Anywhere" description="Send your booking link by text, or embed it right on your website."/>
 <FeatureCard icon={MapPin} color="bg-chart-4/10 text-chart-4" title="Address Verification" description="Customers confirm their exact address so your team always knows where to go."/>
 <FeatureCard icon={CalendarClock} color="bg-chart-2/10 text-chart-2" title="Smart Scheduling" description="Customers only see times you're actually free. No double-bookings, ever."/>
 <FeatureCard icon={DashboardIcon} color="bg-chart-3/10 text-chart-3" title="One Dashboard" description="Every booking, customer, and job detail lives in a single, simple view."/>
 <FeatureCard icon={BellRing} color="bg-chart-5/10 text-chart-5" title="Automatic Reminders" description="Customers get reminded automatically, so you get fewer no-shows."/>
 <FeatureCard icon={Wallet} color="bg-success/10 text-success" title="Cash & E-transfer" description="Built-in support for how home cleaning businesses actually get paid."/>
 </div>
 </section>

 <ProductTour/>

 <EmailStory/>

 {/* How it works */}
 <section id="how-it-works" className="max-w-6xl mx-auto px-5 py-16 lg:py-20">
 <div className="text-center mb-14">
 <h2 className="text-3xl font-black font-heading text-foreground mb-2">Up and running in minutes</h2>
 <p className="text-muted-foreground max-w-lg mx-auto">No setup calls, no onboarding meetings. Just three steps.</p>
 </div>
 <div className="grid md:grid-cols-3 gap-8 relative">
 {[
 { n: '1', title: 'Get your link', text: 'Sign up and get your own personalized booking page in minutes.' },
 { n: '2', title: 'Share it', text: 'Text it to customers or add it to your website and social bio.' },
 { n: '3', title: 'Get booked', text: 'Customers book themselves instantly. You see every job in your dashboard.' },
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
 </section>

 {/* Pricing */}
 <section id="pricing" className="max-w-3xl mx-auto px-5 py-16 lg:py-20">
 <div className="relative rounded-[2rem] border-2 border-primary/20 bg-card shadow-xl overflow-hidden p-8 sm:p-12 text-center">
 <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl" aria-hidden="true"/>
 <div className="relative">
 <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-success/10 text-success text-xs font-bold mb-5">
 <ShieldCheck className="w-3.5 h-3.5"/>
 No subscriptions, ever
 </div>
 <div className="flex items-end justify-center gap-1 mb-1">
 <span className="text-2xl font-black font-heading text-foreground self-start mt-2">$</span>
 <span className="text-6xl font-black font-heading text-foreground">129</span>
 </div>
 <p className="text-muted-foreground font-medium mb-8">one-time payment · lifetime access</p>

 <ul className="text-left max-w-sm mx-auto space-y-3 mb-9">
 {[
 'Your own booking link & embeddable widget',
 'Unlimited bookings, forever',
 'Centralized booking dashboard',
 'Automated customer reminders',
 'Cash & e-transfer payment options',
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

 <Link
 href={route('register')}
 className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-10 py-4 rounded-xl bg-primary text-primary-foreground font-bold shadow-lg shadow-primary/25 hover:opacity-90 active:scale-95 transition-all"
 >
 Get Started Today
 <ArrowRight className="w-4 h-4"/>
 </Link>
 <p className="text-xs text-muted-foreground mt-4">
 Questions first? Email <a href="mailto:workwithmaak@gmail.com" className="font-semibold text-primary hover:underline">workwithmaak@gmail.com</a>
 </p>
 </div>
 </div>
 </section>
 </main>

 {/* Footer */}
 <footer className="border-t border-border">
 <div className="max-w-6xl mx-auto px-5 py-8 flex flex-col sm:flex-row items-center justify-between gap-3">
 <div className="flex items-center gap-2">
 <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center">
 <Sparkles className="w-3.5 h-3.5 text-primary-foreground"/>
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
 `}} />
 </>
 );
}
