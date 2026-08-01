import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem, type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { CircleHelp, ClipboardList, Clock, Tags, UserRound, Users } from 'lucide-react';
import AppLogo from './app-logo';
import { DashboardIcon } from './icons/dashboard-icon';

const baseNavItems: NavItem[] = [
 {
 title: 'Dashboard',
 url: '/dashboard',
 icon: DashboardIcon,
 },
 {
 title: 'Availability',
 url: '/availability',
 icon: Clock,
 },
 {
 title: 'Services',
 url: '/services',
 icon: Tags,
 },
 {
 title: 'Orders',
 url: '/orders',
 icon: ClipboardList,
 },
 {
 title: 'Customers',
 url: '/customers',
 icon: Users,
 },
 {
 title: 'Help',
 url: '/help',
 icon: CircleHelp,
 },
];

const staffNavItem: NavItem = {
 title: 'Staff',
 url: '/staff',
 icon: UserRound,
};

export function AppSidebar() {
 // uses_staff_scheduling is off for every provider unless explicitly
 // flagged on for them (see Provider::uses_staff_scheduling) — this nav
 // item stays invisible for every current provider.
 const { auth } = usePage<SharedData>().props;
 const mainNavItems = auth.user.uses_staff_scheduling
 ? [...baseNavItems.slice(0, 2), staffNavItem, ...baseNavItems.slice(2)]
 : baseNavItems;

 return (
 <Sidebar collapsible="icon">
 <SidebarHeader>
 <SidebarMenu>
 <SidebarMenuItem>
 <SidebarMenuButton size="lg"asChild>
 <Link href="/dashboard"prefetch>
 <AppLogo />
 </Link>
 </SidebarMenuButton>
 </SidebarMenuItem>
 </SidebarMenu>
 </SidebarHeader>

 <SidebarContent>
 <NavMain items={mainNavItems} />
 </SidebarContent>

 <SidebarFooter>
 <NavUser />
 </SidebarFooter>
 </Sidebar>
 );
}
