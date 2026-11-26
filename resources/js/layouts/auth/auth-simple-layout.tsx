import { type SharedData } from '@/types';
import { type SiteInfo } from '@/types/public';
import { Link, usePage } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';

interface AuthLayoutProps {
    children: React.ReactNode;
    name?: string;
    title?: string;
    description?: string;
}

/**
 * Auth screens in the public-site brand: a maroon panel carrying the school crest
 * beside the form on large screens, and the crest above the form on phones.
 */
export default function AuthSimpleLayout({ children, title, description }: AuthLayoutProps) {
    const { site } = usePage<SharedData & { site?: SiteInfo }>().props;
    const school = site?.school ?? 'Senanayake College, Madampe';

    return (
        <div className="grid min-h-svh bg-neutral-50 text-neutral-900 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
            {/* Brand panel */}
            <aside className="bg-maroon-900 relative isolate hidden overflow-hidden text-white lg:flex lg:flex-col">
                <span
                    aria-hidden
                    className="absolute inset-0 -z-10 bg-[radial-gradient(70%_60%_at_100%_0%,rgb(229_185_76/0.2),transparent_60%),radial-gradient(70%_70%_at_0%_100%,var(--color-maroon-700),transparent_70%)]"
                />
                <div className="flex items-center justify-between p-10">
                    <Link href="/" className="hover:text-gold-300 flex items-center gap-2 text-sm font-medium text-white/80">
                        <ArrowLeft className="size-4" />
                        Back to website
                    </Link>
                </div>

                <div className="flex flex-1 flex-col items-center justify-center px-10 text-center">
                    <div className="relative grid size-80 place-items-center">
                        <span aria-hidden className="border-gold-400/25 absolute inset-0 rounded-full border" />
                        <span aria-hidden className="border-gold-400/15 absolute inset-9 rounded-full border" />
                        <img src="/images/brand/logo.png" alt={`${school} crest`} className="size-44 rounded-full shadow-2xl shadow-black/30" />
                    </div>
                    <p className="text-gold-400 mt-10 text-xs font-bold tracking-[0.18em] uppercase">Past Pupils' Association</p>
                    <p className="mt-3 text-3xl font-extrabold tracking-tight">Senanayake PPA</p>
                    <p className="mt-2 text-white/75">{school}</p>
                </div>

                <p className="p-10 text-sm text-white/60">Reconnect with your batch, keep your membership up to date and support the school.</p>
            </aside>

            {/* Form panel */}
            <main className="flex flex-col">
                <div className="flex items-center justify-between px-4 pt-5 sm:px-8 lg:hidden">
                    <Link href="/" className="hover:text-maroon-700 flex items-center gap-2 text-sm font-medium text-neutral-600">
                        <ArrowLeft className="size-4" />
                        Back to website
                    </Link>
                </div>

                <div className="flex flex-1 items-center justify-center px-4 py-10 sm:px-8">
                    <div className="w-full max-w-md">
                        <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
                            <Link href="/" className="flex items-center gap-3 lg:hidden">
                                <img src="/images/brand/logo.png" alt="" className="size-20 rounded-full" />
                                <span className="sr-only">Senanayake PPA home</span>
                            </Link>
                            <p className="text-maroon-700 mt-5 text-xs font-bold tracking-[0.18em] uppercase lg:mt-0">Senanayake PPA</p>
                            <h1 className="mt-2 text-[28px] leading-tight font-extrabold tracking-tight sm:text-[32px]">{title}</h1>
                            {description && <p className="mt-2 text-neutral-600">{description}</p>}
                        </div>

                        <div className="mt-8 rounded-[20px] border border-neutral-200 bg-white p-6 shadow-[var(--shadow-card)] sm:p-8">
                            {children}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
