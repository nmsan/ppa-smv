import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';

/** Active on the page itself, its sub-pages (/admin/supporters/12) and filtered or paged views (?page=2). */
function isCurrent(currentUrl: string, href: string): boolean {
    const path = currentUrl.split('?')[0];
    return path === href || path.startsWith(href + '/');
}

export function NavMain({ items = [] }: { items: NavItem[] }) {
    const page = usePage();
    return (
        <SidebarGroup className="px-2 py-0">
            <SidebarGroupLabel>Platform</SidebarGroupLabel>
            <SidebarMenu>
                {items.map((item) => (
                    <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                            asChild
                            isActive={isCurrent(page.url, item.url)}
                            tooltip={item.title}
                            className="data-[active=true]:text-gold-300 data-[active=true]:before:bg-gold-400 relative data-[active=true]:before:absolute data-[active=true]:before:inset-y-1.5 data-[active=true]:before:left-0 data-[active=true]:before:w-[3px] data-[active=true]:before:rounded-full data-[active=true]:before:content-['']"
                        >
                            <Link href={item.url} prefetch aria-current={isCurrent(page.url, item.url) ? 'page' : undefined}>
                                {item.icon && <item.icon />}
                                <span>{item.title}</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                ))}
            </SidebarMenu>
        </SidebarGroup>
    );
}
