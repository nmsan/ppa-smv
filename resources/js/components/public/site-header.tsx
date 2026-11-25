import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { type SharedData } from '@/types';
import { type SiteInfo } from '@/types/public';
import { Link, usePage } from '@inertiajs/react';
import { ChevronDown, Menu } from 'lucide-react';
import { isActive, publicNav } from './nav-items';

export default function SiteHeader() {
    const { auth, site } = usePage<SharedData & { site: SiteInfo }>().props;
    const url = usePage().url;

    return (
        <header className="sticky top-0 z-40 border-b border-neutral-200 bg-white/85 text-neutral-900 backdrop-blur-md backdrop-saturate-150">
            <div className="mx-auto flex h-[72px] max-w-7xl items-center gap-4 px-4 sm:h-[76px] sm:px-6">
                <Link href="/" className="flex min-w-0 items-center gap-3">
                    <img src="/images/brand/logo.png" alt="" className="size-10 shrink-0 rounded-full sm:size-12" />
                    <span className="min-w-0 leading-tight">
                        <span className="text-maroon-800 block truncate text-[15px] font-extrabold tracking-tight sm:text-[17px]">
                            Senanayake PPA
                        </span>
                        <span className="block truncate text-xs text-neutral-500 sm:text-[13px]">{site.school}</span>
                    </span>
                </Link>

                <nav aria-label="Main" className="ml-auto hidden xl:block">
                    <ul className="flex items-center gap-0.5">
                        {publicNav.map((item) => {
                            const active = item.href ? isActive(url, item.href) : item.children?.some((c) => isActive(url, c.href));
                            const base = cn(
                                'flex items-center gap-1 rounded-lg px-3 py-2 text-[15.5px] font-medium whitespace-nowrap transition-colors hover:bg-neutral-100',
                                active && 'text-maroon-700 font-semibold',
                            );
                            return (
                                <li key={item.title} className="group relative">
                                    {item.href ? (
                                        <Link href={item.href} className={base} aria-current={active ? 'page' : undefined}>
                                            {item.title}
                                        </Link>
                                    ) : (
                                        <>
                                            <button type="button" className={base} aria-haspopup="true">
                                                {item.title}
                                                <ChevronDown className="size-3.5 opacity-60" />
                                            </button>
                                            <ul className="invisible absolute top-full left-0 min-w-56 rounded-xl border border-neutral-200 bg-white p-1.5 text-neutral-800 opacity-0 shadow-[var(--shadow-card)] transition group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
                                                {item.children?.map((child) => (
                                                    <li key={child.href}>
                                                        <Link
                                                            href={child.href}
                                                            className={cn(
                                                                'hover:bg-maroon-50 hover:text-maroon-700 block rounded-lg px-3 py-2 text-[15px]',
                                                                isActive(url, child.href) && 'text-maroon-700 font-semibold',
                                                            )}
                                                        >
                                                            {child.title}
                                                        </Link>
                                                    </li>
                                                ))}
                                            </ul>
                                        </>
                                    )}
                                </li>
                            );
                        })}
                    </ul>
                </nav>

                <div className="ml-auto hidden items-center gap-2 sm:flex xl:ml-3">
                    {auth.user ? (
                        <Button asChild variant="gold" size="brandSm">
                            <Link href="/dashboard">My account</Link>
                        </Button>
                    ) : (
                        <>
                            <Button asChild variant="pill" size="brandSm">
                                <Link href="/login">Member login</Link>
                            </Button>
                            <Button asChild variant="gold" size="brandSm">
                                <Link href="/register">Join PPA</Link>
                            </Button>
                        </>
                    )}
                </div>

                <Sheet>
                    <SheetTrigger asChild>
                        <Button
                            variant="outline"
                            size="icon"
                            className="ml-auto size-11 shrink-0 rounded-xl border-neutral-200 sm:ml-0 xl:hidden"
                            aria-label="Open menu"
                        >
                            <Menu className="size-6" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="right" className="w-80 overflow-y-auto">
                        <SheetHeader>
                            <SheetTitle className="text-left">Menu</SheetTitle>
                        </SheetHeader>
                        <nav aria-label="Mobile" className="flex flex-col px-4 pb-6">
                            {publicNav.map((item) =>
                                item.href ? (
                                    <Link
                                        key={item.title}
                                        href={item.href}
                                        className="flex min-h-12 items-center border-b border-neutral-100 px-1 text-[17px] font-medium"
                                    >
                                        {item.title}
                                    </Link>
                                ) : (
                                    <div key={item.title} className="border-b border-neutral-100 py-2">
                                        <p className="px-1 pt-1 text-xs font-bold tracking-[0.12em] text-neutral-500 uppercase">{item.title}</p>
                                        {item.children?.map((child) => (
                                            <Link key={child.href} href={child.href} className="flex min-h-11 items-center px-1 text-[16px]">
                                                {child.title}
                                            </Link>
                                        ))}
                                    </div>
                                ),
                            )}
                            <div className="mt-5 flex gap-2">
                                {auth.user ? (
                                    <Button asChild variant="gold" size="brand" className="flex-1">
                                        <Link href="/dashboard">My account</Link>
                                    </Button>
                                ) : (
                                    <>
                                        <Button asChild variant="pill" size="brand" className="flex-1">
                                            <Link href="/login">Log in</Link>
                                        </Button>
                                        <Button asChild variant="gold" size="brand" className="flex-1">
                                            <Link href="/register">Join PPA</Link>
                                        </Button>
                                    </>
                                )}
                            </div>
                        </nav>
                    </SheetContent>
                </Sheet>
            </div>
        </header>
    );
}
