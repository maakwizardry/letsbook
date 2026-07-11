import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { CheckCircle2, Circle, MoreHorizontal, Plus } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
 {
 title: 'Today',
 href: '/dashboard',
 },
];

const mockTasks = [
 { id: 1, title: 'Clean the kitchen', time: '10:00 AM', project: 'Home Cleaning', done: false },
 { id: 2, title: 'Deep clean bathrooms', time: '1:00 PM', project: 'Office Cleaning', done: false },
 { id: 3, title: 'Organize living room', time: '3:30 PM', project: 'Home Cleaning', done: true },
];

export default function Dashboard() {
 return (
 <AppLayout breadcrumbs={breadcrumbs}>
 <Head title="Today"/>
 <div className="mx-auto w-full max-w-3xl px-4 py-8">
 <div className="mb-6 flex items-center justify-between">
 <div>
 <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
 Today <span className="text-sm font-normal text-gray-500">Wed 11 Jul</span>
 </h1>
 </div>
 </div>

 <div className="space-y-1">
 {mockTasks.map((task) => (
 <div key={task.id} className="group flex items-start gap-3 border-b border-gray-100 py-3 transition-colors hover:bg-gray-50 rounded-sm px-2 -mx-2 cursor-pointer">
 <button className="mt-0.5 text-gray-400 hover:text-primary transition-colors">
 {task.done ? <CheckCircle2 className="h-5 w-5 text-gray-300"/> : <Circle className="h-5 w-5"/>}
 </button>
 <div className="flex-1">
 <p className={`text-sm ${task.done ? 'text-gray-400 line-through' : 'text-gray-900 '}`}>
 {task.title}
 </p>
 <div className="mt-1 flex items-center gap-3 text-xs text-gray-500">
 <span className={task.time.includes('AM') ? 'text-green-600' : 'text-orange-500'}>{task.time}</span>
 <span>{task.project}</span>
 </div>
 </div>
 <button className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-gray-700 transition-opacity p-1">
 <MoreHorizontal className="h-4 w-4"/>
 </button>
 </div>
 ))}
 
 <button className="mt-4 flex items-center gap-2 text-gray-500 hover:text-primary transition-colors text-sm px-2 -mx-2 py-2 group w-full text-left">
 <span className="flex h-5 w-5 items-center justify-center rounded-full text-primary group-hover:bg-primary group-hover:text-white transition-colors">
 <Plus className="h-4 w-4"/>
 </span>
 Add task
 </button>
 </div>
 </div>
 </AppLayout>
 );
}
