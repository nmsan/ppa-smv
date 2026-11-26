import { Button } from '@/components/ui/button';
import { type SiteInfo } from '@/types/public';
import { Link, usePage } from '@inertiajs/react';
import { Facebook, Mail, MapPin } from 'lucide-react';
import { publicNav } from './nav-items';

export default function SiteFooter() {
    const { site } = usePage<{ site: SiteInfo }>().props;
    // Top-level pages go under "Explore"; grouped pages (college, association, projects) under "College & governance".
    const explore = publicNav.filter((item) => item.href).map((item) => ({ title: item.title, href: item.href! }));
    const governance = publicNav.flatMap((item) => item.children ?? []);

    return (
        <footer className="bg-maroon-900 text-[15.5px] text-white/80">
            <div className="mx-auto grid max-w-7xl gap-10 px-4 pt-16 pb-12 sm:grid-cols-2 sm:px-6 lg:grid-cols-[1.4fr_1fr_1.2fr_1.2fr] lg:gap-12">
                <div>
                    <div className="flex items-center gap-3.5">
                        <img src="/images/brand/logo.png" alt="" className="size-14 rounded-full" />
                        <div className="leading-tight">
                            <p className="text-lg font-bold text-white">{site.name}</p>
                            <p lang="si" className="text-gold-400 text-sm">
                                {site.school_si}
                            </p>
                        </div>
                    </div>
                    <p className="mt-4">Serving Senanayake Central College and its past pupils since {site.founded.slice(0, 4)}.</p>
                    {site.facebook && (
                        <a
                            href={site.facebook}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="Facebook"
                            className="hover:border-gold-400 mt-5 inline-grid size-11 place-items-center rounded-xl border border-white/20"
                        >
                            <Facebook className="size-5" />
                        </a>
                    )}
                </div>

                <FooterLinks title="Explore" links={explore} />
                <FooterLinks title="College & governance" links={governance} />

                <div>
                    <h2 className="mb-4 text-sm font-bold tracking-[0.12em] text-white uppercase">Contact</h2>
                    <ul className="space-y-3">
                        <li className="flex gap-2.5">
                            <MapPin className="text-gold-400 mt-1 size-4 shrink-0" />
                            {site.address}
                        </li>
                        <li className="flex gap-2.5">
                            <Mail className="text-gold-400 mt-1 size-4 shrink-0" />
                            <a href={`mailto:${site.email}`} className="hover:text-gold-400 break-all">
                                {site.email}
                            </a>
                        </li>
                    </ul>
                    <Button asChild variant="gold" size="brandSm" className="mt-5">
                        <Link href="/register">Join PPA</Link>
                    </Button>
                </div>
            </div>
            <div className="mx-auto flex max-w-7xl flex-wrap justify-between gap-2 border-t border-white/10 px-4 py-5 text-sm text-white/60 sm:px-6">
                <span>
                    © {new Date().getFullYear()} {site.name}, {site.school}
                </span>
                <span>senanayakeppa.lk</span>
            </div>
        </footer>
    );
}

function FooterLinks({ title, links }: { title: string; links: { title: string; href: string }[] }) {
    return (
        <div>
            <h2 className="mb-4 text-sm font-bold tracking-[0.12em] text-white uppercase">{title}</h2>
            <ul className="space-y-0.5 sm:space-y-2.5">
                {links.map((l) => (
                    <li key={l.href}>
                        <Link href={l.href} className="hover:text-gold-400 flex min-h-11 items-center sm:inline sm:min-h-0">
                            {l.title}
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
}
