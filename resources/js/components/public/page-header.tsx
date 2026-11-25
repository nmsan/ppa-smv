import { cn } from '@/lib/utils';
import { Link } from '@inertiajs/react';
import { ChevronRight } from 'lucide-react';
import { type ReactNode } from 'react';

interface Crumb {
    title: string;
    href?: string;
}

/**
 * Page title band. An optional `aside` sits in the top-right corner (below the
 * title on phones), and `children` run along the bottom of the same band, so a
 * page's key figures share one continuous background with its title.
 */
export default function PageHeader({
    title,
    subtitle,
    crumbs = [],
    aside,
    children,
}: {
    title: string;
    subtitle?: string;
    crumbs?: Crumb[];
    aside?: ReactNode;
    children?: ReactNode;
}) {
    return (
        <section className="bg-maroon-900 relative overflow-hidden bg-[url('/images/brand/maroon-waves.jpg')] bg-cover bg-center text-white">
            <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-14">
                <div className={cn('grid items-center gap-8', aside && 'lg:grid-cols-[1fr_22rem]')}>
                    <div>
                        <nav aria-label="Breadcrumb" className="mb-3 text-sm text-white/70">
                            <ol className="flex flex-wrap items-center gap-1">
                                <li>
                                    <Link href="/" className="hover:text-gold-300">
                                        Home
                                    </Link>
                                </li>
                                {crumbs.map((c) => (
                                    <li key={c.title} className="flex items-center gap-1">
                                        <ChevronRight className="size-3.5" />
                                        {c.href ? (
                                            <Link href={c.href} className="hover:text-gold-300">
                                                {c.title}
                                            </Link>
                                        ) : (
                                            <span aria-current="page">{c.title}</span>
                                        )}
                                    </li>
                                ))}
                            </ol>
                        </nav>
                        <h1 className="text-3xl font-bold sm:text-5xl">{title}</h1>
                        {subtitle && <p className="mt-4 max-w-2xl text-lg text-white/85">{subtitle}</p>}
                    </div>
                    {aside}
                </div>
                {children && <div className="mt-10">{children}</div>}
            </div>
        </section>
    );
}
