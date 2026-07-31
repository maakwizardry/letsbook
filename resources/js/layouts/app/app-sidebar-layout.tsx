import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { AppSidebar } from '@/components/app-sidebar';
import { AppSidebarHeader } from '@/components/app-sidebar-header';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { usePage } from '@inertiajs/react';

export default function AppSidebarLayout({ children, breadcrumbs = [] }: { children: React.ReactNode; breadcrumbs?: BreadcrumbItem[] }) {
 const { auth } = usePage<SharedData>().props;
 const brandColor = auth.user.brand_color;

 const brandStyle = brandColor
 ? ({
 // Both layers: the semantic vars themselves, and Tailwind's
 // `--color-*` theme tokens the `bg-primary`/`ring-*` utilities
 // actually consume — chained `var()` custom properties resolve
 // using the cascade where the *referencing* property is declared
 // (`:root`), not the element that ends up using it, so overriding
 // only `--primary` here never reaches `.bg-primary` etc.
 '--primary': brandColor,
 '--ring': brandColor,
 '--sidebar-primary': brandColor,
 '--sidebar-ring': brandColor,
 '--chart-1': brandColor,
 '--color-primary': brandColor,
 '--color-ring': brandColor,
 '--color-sidebar-primary': brandColor,
 '--color-sidebar-ring': brandColor,
 '--color-chart-1': brandColor,
 } as React.CSSProperties)
 : undefined;

 return (
 <div style={brandStyle}>
 <AppShell variant="sidebar">
 <AppSidebar />
 <AppContent variant="sidebar">
 <AppSidebarHeader breadcrumbs={breadcrumbs} />
 {children}
 </AppContent>
 </AppShell>
 </div>
 );
}
