import PageHeader from '@/components/public/page-header';
import { useInitials } from '@/hooks/use-initials';
import PublicLayout from '@/layouts/public-layout';
import { cn } from '@/lib/utils';
import { type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { IdCard, KeyRound, LayoutDashboard, LogOut, UserRound } from 'lucide-react';
import { type ReactNode } from 'react';

const tabs = [
    { href: '/my-membership', label: 'Membership', Icon: IdCard },
    { href: '/settings/profile', label: 'Profile', Icon: UserRound },
    { href: '/settings/password', label: 'Password', Icon: KeyRound },
];

/**
 * My account, on the public site. Members and applicants never see the admin
 * portal: their membership, profile and password live here, under the same
 * header, footer and colours as the rest of the website.
 */
export default function AccountLayout({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
    const { auth } = usePage<SharedData>().props;
    const path = usePage().url.split('?')[0];
    const initials = useInitials();

    const identity = (
        <div className="rounded-2xl border border-white/15 bg-white/[0.07] p-5 backdrop-blur">
            <div className="flex items-center gap-3">
                {auth.user.avatar ? (
                    <img src={auth.user.avatar} alt="" className="size-12 shrink-0 rounded-full object-cover ring-2 ring-white/25" />
                ) : (
                    <span className="bg-gold-500 text-gold-ink grid size-12 shrink-0 place-items-center rounded-full text-lg font-bold">
                        {initials(auth.user.name)}
                    </span>
                )}
                <span className="min-w-0">
                    <span className="block truncate font-semibold">{auth.user.name}</span>
                    <span className="block truncate text-sm text-white/70">{auth.user.email}</span>
                </span>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
                {auth.adminPortal && (
                    <Link
                        href="/dashboard"
                        className="inline-flex h-10 items-center gap-2 rounded-full border border-white/35 bg-white/10 px-4 text-[15px] font-semibold hover:bg-white/20"
                    >
                        <LayoutDashboard className="size-4" />
                        Admin portal
                    </Link>
                )}
                <Link
                    href={route('logout')}
                    method="post"
                    as="button"
                    className="hover:text-gold-300 inline-flex h-10 items-center gap-2 rounded-full px-3 text-[15px] font-semibold text-white/85"
                >
                    <LogOut className="size-4" />
                    Log out
                </Link>
            </div>
        </div>
    );

    return (
        <PublicLayout title={title}>
            <PageHeader title="My account" subtitle={subtitle} crumbs={[{ title: 'My account' }]} aside={identity} />

            <nav aria-label="My account" className="sticky top-[72px] z-30 border-b border-neutral-200 bg-white sm:top-[76px]">
                <ul className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-4 sm:px-6">
                    {tabs.map(({ href, label, Icon }) => {
                        const active = path === href;
                        return (
                            <li key={href}>
                                <Link
                                    href={href}
                                    prefetch
                                    preserveScroll
                                    aria-current={active ? 'page' : undefined}
                                    className={cn(
                                        'flex min-h-14 items-center gap-2 border-b-2 px-3 text-[15.5px] font-medium whitespace-nowrap text-neutral-600 transition-colors hover:text-neutral-900',
                                        active ? 'border-gold-500 text-maroon-800 font-semibold' : 'border-transparent',
                                    )}
                                >
                                    <Icon className="size-[18px]" />
                                    {label}
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            <div className="theme-light mx-auto max-w-3xl px-4 py-10 text-neutral-900 sm:px-6 sm:py-14">{children}</div>
        </PublicLayout>
    );
}

/** White card used for each block on the My account pages. */
export function AccountCard({ className, children }: { className?: string; children: ReactNode }) {
    return <div className={cn('rounded-2xl border border-neutral-200 bg-white p-5 shadow-[var(--shadow-card)] sm:p-6', className)}>{children}</div>;
}
