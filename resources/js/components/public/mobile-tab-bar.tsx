import { cn } from '@/lib/utils';
import { type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { CalendarDays, HeartHandshake, Home, Plus, UserRound } from 'lucide-react';
import { isActive } from './nav-items';

/** Thumb-zone actions on phones: Home, Events, Donate, Join (or My account). Hidden from 768px up. */
export default function MobileTabBar() {
    const { auth } = usePage<SharedData>().props;
    const url = usePage().url;

    const items = [
        { href: '/', label: 'Home', Icon: Home },
        { href: '/news', label: 'Events', Icon: CalendarDays },
        { href: '/projects', label: 'Donate', Icon: HeartHandshake },
    ];

    return (
        <nav
            aria-label="Quick actions"
            className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-4 border-t border-neutral-200 bg-white/95 px-1.5 pt-1.5 pb-[calc(6px+env(safe-area-inset-bottom))] backdrop-blur-md md:hidden"
        >
            {items.map(({ href, label, Icon }) => (
                <Link
                    key={href}
                    href={href}
                    aria-current={isActive(url, href) ? 'page' : undefined}
                    className={cn(
                        'flex min-h-[52px] flex-col items-center justify-center gap-0.5 rounded-xl text-xs font-semibold text-neutral-500',
                        isActive(url, href) && 'text-maroon-700',
                    )}
                >
                    <Icon className="size-[22px]" />
                    {label}
                </Link>
            ))}
            <Link
                href={auth.user ? '/dashboard' : '/register'}
                className="bg-gold-500 text-gold-ink flex min-h-[52px] flex-col items-center justify-center gap-0.5 rounded-xl text-xs font-semibold"
            >
                {auth.user ? <UserRound className="size-[22px]" /> : <Plus className="size-[22px]" />}
                {auth.user ? 'Account' : 'Join'}
            </Link>
        </nav>
    );
}
