import AppLogoIcon from '@/components/app-logo-icon';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';

const faqs: { question: string; steps: string[]; note?: string }[] = [
 {
 question: 'What am I looking at on the Dashboard?',
 steps: [
 'The sidebar on the left is how you get around: Dashboard, Availability, Services, Orders, Customers, and this Help page.',
 'At the top of the Dashboard is your "Your booking page" card — your personal link to copy and share with customers.',
 'Below that are your stats: total and monthly revenue, outstanding (unpaid) amount, average order value, total orders, orders today, and how many need attention (still Pending or In Progress).',
 'Further down, "Orders by status" shows a bar and breakdown of how many bookings are Pending, In Progress, Completed, or Cancelled, and "Payment methods" shows your cash vs. e-transfer split.',
 ],
 note: 'All of this fills in automatically as bookings come in — there\'s nothing to set up here.',
 },
 {
 question: 'How do I set my availability / working hours?',
 steps: [
 'Go to the Availability page.',
 'Check the box next to each day you want to accept bookings on — unchecked days show as "Unavailable" and won\'t be offered to customers.',
 'For each checked day, set a start and end time. Click "Add hours" if you want more than one block on the same day (e.g. 9:00–12:00 and 1:00–5:00, to leave a lunch gap out of your booking hours).',
 'Click "Save" once you\'re done — it stays disabled until you\'ve made a change, and won\'t let you save if an end time is before its start time.',
 ],
 note: 'Customers booking through your page will only ever see the days and time blocks you\'ve set here — no double-bookings.',
 },
 {
 question: 'How do I edit my services and prices?',
 steps: [
 'Go to the Services page.',
 'Click the pencil icon on any item.',
 'Update the name or price and save.',
 ],
 note: 'Services are always grouped in this order: Standard Cleaning, Deep Cleaning, Move-In / Move-Out Cleaning, then Add-ons.',
 },
 {
 question: 'How do I add an existing or walk-in client?',
 steps: [
 'Go to Orders and click "+ New booking."',
 'Enter their name, phone or email, and address — there\'s an address search built in, just like the booking page your customers use.',
 'Pick the service, home type, and date/time, then submit.',
 ],
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
 },
 {
 question: 'How do I see my customer history?',
 steps: [
 'Go to the Customers page — it\'s built automatically from your bookings, no need to add anyone manually.',
 'Use the search bar to find a customer by name.',
 'Each row shows how many bookings they\'ve had, total spent, and any outstanding balance.',
 'Click a customer to see their full booking history and contact details.',
 ],
 },
 {
 question: 'How do customers book me directly?',
 steps: [
 'Every account has its own booking link, in the form letsbook.maakhq.com/business/your-business-name.',
 'Find and copy your exact link from the "Your booking page" card on your Dashboard.',
 'Share it anywhere — text, email, social media, and so on.',
 ],
 },
];

function FaqItem({ question, steps, note }: { question: string; steps: string[]; note?: string }) {
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
 {note && (
 <p className="mt-4 border-t border-border pt-3 text-xs leading-relaxed text-muted-foreground">
 {note}
 </p>
 )}
 </CollapsibleContent>
 </Collapsible>
 );
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

 <div className="space-y-3">
 {faqs.map(faq => (
 <FaqItem key={faq.question} question={faq.question} steps={faq.steps} note={faq.note}/>
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
