import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import {
 Sparkles,
 SprayCan,
 Link2,
 CalendarClock,
 LayoutDashboard,
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
} from 'lucide-react';

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
 <Head title="Effortless Online Booking for Home Cleaning Businesses">
 <link rel="preconnect"href="https://fonts.bunny.net"/>
 <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600|lexend:500,600,700,800"rel="stylesheet"/>
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
 <div className="flex items-center gap-2">
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
 </div>
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
 { icon: LayoutDashboard, text: 'Every booking lands in one dashboard' },
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
 <FeatureCard icon={LayoutDashboard} color="bg-chart-3/10 text-chart-3" title="One Dashboard" description="Every booking, customer, and job detail lives in a single, simple view."/>
 <FeatureCard icon={BellRing} color="bg-chart-5/10 text-chart-5" title="Automatic Reminders" description="Customers get reminded automatically, so you get fewer no-shows."/>
 <FeatureCard icon={Wallet} color="bg-success/10 text-success" title="Cash & E-transfer" description="Built-in support for how home cleaning businesses actually get paid."/>
 </div>
 </section>

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
