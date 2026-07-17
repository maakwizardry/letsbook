import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import { ClipboardList, Clock } from 'lucide-react';
import AppLogo from './app-logo';
import { DashboardIcon } from './icons/dashboard-icon';

const mainNavItems: NavItem[] = [
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
 title: 'Orders',
 url: '/orders',
 icon: ClipboardList,
 },
];

export function AppSidebar() {
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
