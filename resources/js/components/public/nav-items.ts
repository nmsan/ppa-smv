export interface PublicNavItem {
    title: string;
    href?: string;
    children?: { title: string; href: string }[];
}

export const publicNav: PublicNavItem[] = [
    { title: 'Home', href: '/' },
    {
        title: 'College',
        children: [
            { title: 'Founder and history', href: '/college/history' },
            { title: 'Principals', href: '/college/principals' },
        ],
    },
    {
        title: 'Association',
        children: [
            { title: 'Goals and objectives', href: '/association/goals' },
            { title: 'Office bearers', href: '/association/office-bearers' },
        ],
    },
    { title: 'Membership', href: '/membership' },
    {
        title: 'Projects',
        children: [
            { title: 'Projects', href: '/projects' },
            { title: 'Main sponsors', href: '/projects/sponsors' },
            { title: 'Best donors', href: '/projects/donors' },
        ],
    },
    { title: 'News', href: '/news' },
    { title: 'Contact', href: '/contact' },
];

export function isActive(currentUrl: string, href: string): boolean {
    const path = currentUrl.split('?')[0];
    return href === '/' ? path === '/' : path === href || path.startsWith(href + '/');
}
