import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem, type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { Globe, HandCoins, IdCard, LayoutGrid, UserCheck } from 'lucide-react';
import AppLogo from './app-logo';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        url: '/dashboard',
        icon: LayoutGrid,
    },
    {
        title: 'My membership',
        url: '/my-membership',
        icon: IdCard,
    },
];

const applicantReviewRoles = ['super-admin', 'membership-secretary', 'batch-representative'];

const contentEditorRoles = ['super-admin', 'content-editor'];

const adminNavItems: NavItem[] = [
    {
        title: 'Applicants',
        url: '/admin/applicants',
        icon: UserCheck,
    },
];

const treasurerRoles = ['super-admin', 'treasurer'];

const treasurerNavItems: NavItem[] = [
    {
        title: 'Supporters',
        url: '/admin/supporters',
        icon: HandCoins,
    },
];

const contentNavItems: NavItem[] = [
    {
        title: 'Website content',
        url: '/admin/content',
        icon: Globe,
    },
];

export function AppSidebar() {
    const { auth } = usePage<SharedData>().props;
    const canReview = auth.roles.some((role) => applicantReviewRoles.includes(role));
    const canEditContent = auth.roles.some((role) => contentEditorRoles.includes(role));
    const canManageSponsors = auth.roles.some((role) => treasurerRoles.includes(role));
    const navItems = [
        ...mainNavItems,
        ...(canReview ? adminNavItems : []),
        ...(canManageSponsors ? treasurerNavItems : []),
        ...(canEditContent ? contentNavItems : []),
    ];

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/dashboard" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={navItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
