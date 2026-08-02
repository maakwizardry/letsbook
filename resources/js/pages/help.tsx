import AppLogoIcon from '@/components/app-logo-icon';
import BrowserFrame from '@/components/browser-frame';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { CalendarClock, ChevronDown, ClipboardList, LayoutDashboard, Tags, Users, type LucideIcon } from 'lucide-react';
import { useState } from 'react';

interface FaqScreenshot {
 image: string;
 width: number;
 height: number;
 alt: string;
 url: string;
}

interface Faq {
 question: string;
 steps: string[];
 note?: string;
 screenshot?: FaqScreenshot;
}

const faqCategories: { category: string; icon: LucideIcon; items: Faq[] }[] = [
 {
 category: 'Getting Started',
 icon: LayoutDashboard,
 items: [
 {
 question: 'What am I looking at on the Dashboard?',
 steps: [
 'The sidebar on the left is how you get around: Dashboard, Availability, Services, Orders, Customers, and this Help page.',
 'At the top of the Dashboard is your "Your booking page" card — your personal link to copy and share with customers.',
 'Below that are your stats: total and monthly revenue, outstanding (unpaid) amount, average order value, total orders, orders today, and how many need attention (still Pending or In Progress).',
 'Further down, "Orders by status" shows a bar and breakdown of how many bookings are Pending, In Progress, Completed, or Cancelled, and "Payment methods" shows your cash vs. e-transfer split.',
 ],
 note: 'All of this fills in automatically as bookings come in — there\'s nothing to set up here.',
 screenshot: { image: '/images/dashboard.jpeg', width: 1400, height: 686, alt: 'Provider dashboard screenshot', url: 'letsbook.app/dashboard' },
 },
 {
 question: 'How do customers book me directly?',
 steps: [
 'Every account has its own booking link, in the form letsbook.maakhq.com/business/your-business-name.',
 'Find and copy your exact link from the "Your booking page" card on your Dashboard.',
 'Share it anywhere — text, email, social media, and so on.',
 ],
 screenshot: { image: '/images/dashboard.jpeg', width: 1400, height: 686, alt: 'The "Your booking page" card on the dashboard', url: 'letsbook.app/dashboard' },
 },
 {
 question: 'Can I get a QR code for my booking page?',
 steps: [
 'On your Dashboard, click the QR code icon next to Copy and Open in the "Your booking page" card.',
 'Click "Download PNG" to save it — it\'s a high-resolution image with the LetsBook logo in the middle, so it prints cleanly.',
 'Print it and put it wherever customers already see you: your van or car window, a flyer, a door hanger, a business card, or a receipt.',
 ],
 note: 'Anyone who scans it goes straight to your booking page — no typing a URL, no searching for you online.',
 },
 {
 question: 'How do I change my business name or brand color?',
 steps: [
 'Click your name in the bottom-left of the sidebar, then "Settings."',
 'Click "Business" in the settings menu on the left.',
 'Under "Business name," update the name and click "Save" — this is what customers see on your booking page.',
 'Under "Brand color," click any of the five color swatches to pick your theme — it saves instantly, no separate save button.',
 ],
 note: 'Your brand color is used throughout your booking page and QR code, so customers always see it in your colors.',
 },
 ],
 },
 {
 category: 'Availability & Time Off',
 icon: CalendarClock,
 items: [
 {
 question: 'How do I set my availability / working hours?',
 steps: [
 'Go to the Availability page.',
 'Check the box next to each day you want to accept bookings on — unchecked days show as "Unavailable" and won\'t be offered to customers.',
 'For each checked day, set a start and end time. Click "Add hours" if you want more than one block on the same day (e.g. 9:00–12:00 and 1:00–5:00, to leave a lunch gap out of your booking hours).',
 'Click "Save" once you\'re done — it stays disabled until you\'ve made a change, and won\'t let you save if an end time is before its start time.',
 ],
 note: 'Customers booking through your page will only ever see the days and time blocks you\'ve set here — no double-bookings.',
 screenshot: { image: '/images/availability.jpeg', width: 1280, height: 626, alt: 'Weekly availability schedule screenshot', url: 'letsbook.app/availability' },
 },
 {
 question: 'How do I block off a vacation or a day I can\'t work?',
 steps: [
 'Go to the Availability page and scroll down to "Blocked dates," below your weekly schedule.',
 'Pick the date, optionally add a short reason like "Vacation," and click "Block this date."',
 'Repeat for every date you need — you can block as many individual days as you like.',
 'To remove one, click the trash icon next to it in the list.',
 ],
 note: 'This is separate from your weekly hours, so it\'s the right tool for a one-off day off (e.g. August 3rd) — unlike unchecking a weekday, which would block that weekday every week going forward. Customers simply won\'t be able to select a blocked date when booking you.',
 screenshot: { image: '/images/blocked-dates.jpeg', width: 1400, height: 900, alt: 'Blocked dates section on the availability page', url: 'letsbook.app/availability' },
 },
 ],
 },
 {
 category: 'Services & Pricing',
 icon: Tags,
 items: [
 {
 question: 'How do I edit my services and prices?',
 steps: [
 'Go to the Services page.',
 'Click the pencil icon on any item.',
 'Update the name or price and save.',
 ],
 note: 'Services are always grouped in this order: Standard Cleaning, Deep Cleaning, Move-In / Move-Out Cleaning, then Add-ons.',
 screenshot: { image: '/images/services.jpeg', width: 1400, height: 900, alt: 'Services list screenshot', url: 'letsbook.app/services' },
 },
 {
 question: 'How do I add a new service, or stop offering one?',
 steps: [
 'Go to the Services page and click "+ Add service."',
 'Enter a name and price, and optionally a category (e.g. "Add-ons") and a home type — leave the home type blank if it should apply to every home size.',
 'To stop offering something you no longer do, click the "Active" toggle next to it to switch it to "Inactive."',
 ],
 note: 'Marking a service Inactive removes it from what customers see when booking, but keeps it — and its full history in past orders — on your Services page, so you can turn it back on anytime. There\'s no delete option, on purpose: it protects your past bookings\' records.',
 screenshot: { image: '/images/services-add.jpeg', width: 1400, height: 900, alt: 'Add a service form on the Services page', url: 'letsbook.app/services' },
 },
 ],
 },
 {
 category: 'Bookings & Orders',
 icon: ClipboardList,
 items: [
 {
 question: 'How do I add an existing or walk-in client?',
 steps: [
 'Go to Orders and click "+ New booking."',
 'Enter their name, phone or email, and address — there\'s an address search built in, just like the booking page your customers use.',
 'Pick the service, home type, and date/time, then submit.',
 ],
 screenshot: { image: '/images/new-booking.jpeg', width: 1400, height: 900, alt: 'New booking dialog screenshot', url: 'letsbook.app/orders' },
 },
 {
 question: 'How do I set up a regular client (e.g. every Wednesday at 8am)?',
 steps: [
 'Open "+ New booking" and set the date to that Wednesday and the time to 8:00 AM.',
 'Check "Repeat this booking."',
 'Choose a frequency — Weekly, Bi-weekly, or Monthly (Wednesday is auto-selected for you).',
 'Choose when it ends — Never, after a set number of visits, or on a specific date.',
 ],
 note: 'Once it\'s set up, it keeps adding that booking to your schedule on its own — no need to re-enter it every week. If a client\'s schedule ever changes, there\'s a "Stop repeating" option right on that booking.',
 screenshot: { image: '/images/new-booking-repeat.jpeg', width: 1400, height: 900, alt: 'New booking dialog with repeat options screenshot', url: 'letsbook.app/orders' },
 },
 {
 question: 'How do I mark a booking as paid, or cancel one?',
 steps: [
 'Go to Orders and find the booking.',
 'Use the status dropdown on that row to move it between Pending, In Progress, Completed, or Cancelled.',
 'Click "Mark Paid" once you\'ve been paid — it\'ll switch to a "Paid" badge.',
 'To cancel instead, click the small X button on that row and confirm — the customer automatically gets an email letting them know.',
 ],
 note: 'If the booking is part of a repeating series, cancelling only removes that one visit — the rest of the series keeps going. Use "Stop repeating" on that booking if you want to end the whole series.',
 screenshot: { image: '/images/orders.jpeg', width: 1400, height: 684, alt: 'Orders list screenshot', url: 'letsbook.app/orders' },
 },
 ],
 },
 {
 category: 'Customers',
 icon: Users,
 items: [
 {
 question: 'How do I see my customer history?',
 steps: [
 'Go to the Customers page — it\'s built automatically from your bookings, no need to add anyone manually.',
 'Use the search bar to find a customer by name.',
 'Each row shows how many bookings they\'ve had, total spent, and any outstanding balance.',
 'Click a customer to see their full booking history and contact details.',
 ],
 screenshot: { image: '/images/customers.webp', width: 1400, height: 860, alt: 'Customers list screenshot', url: 'letsbook.app/customers' },
 },
 ],
 },
];

function FaqItem({ question, steps, note, screenshot }: { question: string; steps: string[]; note?: string; screenshot?: FaqScreenshot }) {
 const [open, setOpen] = useState(false);

 return (
 <Collapsible open={open} onOpenChange={setOpen} className="rounded-2xl border border-border bg-card shadow-sm">
 <CollapsibleTrigger className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-sm font-semibold text-foreground">
 {question}
 <ChevronDown className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`}/>
 </CollapsibleTrigger>
 <CollapsibleContent className="px-5 pb-5 text-sm text-muted-foreground">
 <ol className="space-y-2.5">
 {steps.map((step, index) => (
 <li key={index} className="flex gap-3">
 <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
 {index + 1}
 </span>
 <span className="leading-relaxed">{step}</span>
 </li>
 ))}
 </ol>
 {screenshot && (
 <div className="mt-4">
 <BrowserFrame
 glow={false}
 url={screenshot.url}
 image={screenshot.image}
 imageWidth={screenshot.width}
 imageHeight={screenshot.height}
 alt={screenshot.alt}
 />
 </div>
 )}
 {note && (
 <p className="mt-4 border-t border-border pt-3 text-xs leading-relaxed text-muted-foreground">
 {note}
 </p>
 )}
 </CollapsibleContent>
 </Collapsible>
 );
}

function categorySlug(category: string) {
 return category.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export default function Help() {
 const { auth } = usePage<SharedData>().props;

 return (
 <>
 <Head title="Help & FAQ"/>

 <div className="min-h-dvh bg-background font-sans">
 <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
 <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-5">
 <Link href="/"className="flex items-center gap-2">
 <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary shadow-sm shadow-primary/30">
 <AppLogoIcon className="h-5 w-5 text-white"/>
 </div>
 <span className="font-heading text-lg font-black text-foreground">LetsBook</span>
 </Link>
 <Link
 href={auth.user ? route('dashboard') : '/'}
 className="rounded-xl px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-accent"
 >
 {auth.user ? 'Back to Dashboard' : 'Home'}
 </Link>
 </div>
 </header>

 <main className="mx-auto w-full max-w-3xl px-5 py-12">
 <div className="mb-8">
 <h1 className="font-heading text-3xl font-bold text-foreground">Help & FAQ</h1>
 <p className="mt-2 text-sm text-muted-foreground">
 Answers to the most common questions about running your bookings on LetsBook.
 </p>
 </div>

 <nav aria-label="Jump to category" className="mb-10 flex flex-wrap gap-2">
 {faqCategories.map(({ category, icon: Icon }) => (
 <a
 key={category}
 href={`#${categorySlug(category)}`}
 className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground transition-colors hover:bg-accent"
 >
 <Icon className="h-3.5 w-3.5 text-muted-foreground"/>
 {category}
 </a>
 ))}
 </nav>

 <div className="space-y-10">
 {faqCategories.map(({ category, icon: Icon, items }) => (
 <div key={category} id={categorySlug(category)} className="scroll-mt-20">
 <div className="mb-3 flex items-center gap-2">
 <Icon className="h-4 w-4 text-muted-foreground"/>
 <h2 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">{category}</h2>
 </div>
 <div className="space-y-3">
 {items.map(faq => (
 <FaqItem key={faq.question} question={faq.question} steps={faq.steps} note={faq.note} screenshot={faq.screenshot}/>
 ))}
 </div>
 </div>
 ))}
 </div>

 <p className="mt-10 text-sm leading-relaxed text-muted-foreground">
 We don't have a training video just yet, but we're happy to hop on and walk you through anything,
 or answer a quick question directly — just reach out anytime.
 </p>
 </main>
 </div>
 </>
 );
}
