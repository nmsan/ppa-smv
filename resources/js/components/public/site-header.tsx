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
        <header className="bg-maroon-900 sticky top-0 z-40 text-white shadow-md">
            <div className="mx-auto flex h-18 max-w-7xl items-center gap-4 px-4 sm:px-6">
                <Link href="/" className="flex min-w-0 items-center gap-3">
                    <img src="/images/brand/logo.png" alt="" className="size-12 shrink-0 rounded-full bg-white/90 p-0.5" />
                    <span className="min-w-0 leading-tight">
                        <span className="block truncate text-sm font-bold tracking-wide uppercase sm:text-base">{site.name}</span>
                        <span className="text-gold-300 block truncate text-xs">{site.school}</span>
                    </span>
                </Link>

                <nav aria-label="Main" className="ml-auto hidden xl:block">
                    <ul className="flex items-center gap-1">
                        {publicNav.map((item) => {
                            const active = item.href ? isActive(url, item.href) : item.children?.some((c) => isActive(url, c.href));
                            const base = cn(
                                'flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-white/10',
                                active && 'text-gold-300',
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
                                                <ChevronDown className="size-3.5 opacity-70" />
                                            </button>
                                            <ul className="invisible absolute top-full left-0 min-w-52 rounded-lg bg-white py-2 text-neutral-800 opacity-0 shadow-lg ring-1 ring-black/5 transition group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
                                                {item.children?.map((child) => (
                                                    <li key={child.href}>
                                                        <Link
                                                            href={child.href}
                                                            className={cn(
                                                                'hover:bg-maroon-50 hover:text-maroon-800 block px-4 py-2 text-sm',
                                                                isActive(url, child.href) && 'text-maroon-800 font-semibold',
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

                <div className="ml-auto hidden items-center gap-2 sm:flex xl:ml-2">
                    {auth.user ? (
                        <Button asChild size="sm" className="bg-gold-400 text-maroon-950 hover:bg-gold-300">
                            <Link href="/dashboard">My account</Link>
                        </Button>
                    ) : (
                        <>
                            <Link href="/login" className="rounded-md px-3 py-2 text-sm font-medium whitespace-nowrap hover:bg-white/10">
                                Log in
                            </Link>
                            <Button asChild size="sm" className="bg-gold-400 text-maroon-950 hover:bg-gold-300">
                                <Link href="/register">Join</Link>
                            </Button>
                        </>
                    )}
                </div>

                <Sheet>
                    <SheetTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="ml-auto text-white hover:bg-white/10 hover:text-white sm:ml-0 xl:hidden"
                            aria-label="Open menu"
                        >
                            <Menu className="size-6" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="right" className="w-80 overflow-y-auto">
                        <SheetHeader>
                            <SheetTitle className="text-left">Menu</SheetTitle>
                        </SheetHeader>
                        <nav aria-label="Mobile" className="flex flex-col gap-1 px-4 pb-6">
                            {publicNav.map((item) =>
                                item.href ? (
                                    <Link key={item.title} href={item.href} className="hover:bg-maroon-50 rounded-md px-3 py-2 font-medium">
                                        {item.title}
                                    </Link>
                                ) : (
                                    <div key={item.title} className="py-1">
                                        <p className="px-3 pt-2 text-xs font-semibold tracking-wider text-neutral-500 uppercase">{item.title}</p>
                                        {item.children?.map((child) => (
                                            <Link key={child.href} href={child.href} className="hover:bg-maroon-50 block rounded-md px-3 py-2">
                                                {child.title}
                                            </Link>
                                        ))}
                                    </div>
                                ),
                            )}
                            <div className="mt-4 flex gap-2 border-t pt-4">
                                {auth.user ? (
                                    <Button asChild className="bg-maroon-800 hover:bg-maroon-700 flex-1">
                                        <Link href="/dashboard">My account</Link>
                                    </Button>
                                ) : (
                                    <>
                                        <Button asChild variant="outline" className="flex-1">
                                            <Link href="/login">Log in</Link>
                                        </Button>
                                        <Button asChild className="bg-maroon-800 hover:bg-maroon-700 flex-1">
                                            <Link href="/register">Join</Link>
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
