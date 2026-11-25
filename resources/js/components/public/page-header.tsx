import { langOf } from '@/lib/lang';
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
        <section className="bg-maroon-900 relative isolate overflow-hidden text-white">
            <span
                aria-hidden
                className="absolute inset-0 -z-10 bg-[radial-gradient(70%_120%_at_100%_0%,rgb(229_185_76/0.18),transparent_55%),radial-gradient(60%_100%_at_0%_100%,var(--color-maroon-700),transparent_70%)]"
            />
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
                        <h1
                            {...langOf(title)}
                            className="text-[34px] leading-tight font-extrabold tracking-tight sm:text-5xl [&[lang=si]]:leading-snug [&[lang=si]]:tracking-normal"
                        >
                            {title}
                        </h1>
                        {subtitle && (
                            <p {...langOf(subtitle)} className="mt-4 max-w-2xl text-lg text-white/85">
                                {subtitle}
                            </p>
                        )}
                    </div>
                    {aside}
                </div>
                {children && <div className="mt-10">{children}</div>}
            </div>
        </section>
    );
}
