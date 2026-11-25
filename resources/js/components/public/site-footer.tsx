import { type SiteInfo } from '@/types/public';
import { Link, usePage } from '@inertiajs/react';
import { Facebook, Mail, MapPin } from 'lucide-react';
import { publicNav } from './nav-items';

export default function SiteFooter() {
    const { site } = usePage<{ site: SiteInfo }>().props;
    const links = publicNav.flatMap((item) => (item.href ? [{ title: item.title, href: item.href }] : (item.children ?? [])));

    return (
        <footer className="bg-maroon-950 text-white/80">
            <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-3">
                <div>
                    <div className="flex items-center gap-3">
                        <img src="/images/brand/logo.png" alt="" className="size-12 rounded-full bg-white/90 p-0.5" />
                        <div className="leading-tight">
                            <p className="font-bold text-white uppercase">{site.name}</p>
                            <p className="text-gold-300 text-sm">{site.school_si}</p>
                        </div>
                    </div>
                    <p className="mt-4 text-sm">Serving Senanayake Central College and its past pupils since {site.founded.slice(0, 4)}.</p>
                </div>

                <div>
                    <h2 className="font-semibold text-white">Quick links</h2>
                    <ul className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                        {links.map((l) => (
                            <li key={l.href}>
                                <Link href={l.href} className="hover:text-gold-300">
                                    {l.title}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>

                <div>
                    <h2 className="font-semibold text-white">Contact</h2>
                    <ul className="mt-3 space-y-3 text-sm">
                        <li className="flex gap-2">
                            <MapPin className="text-gold-400 mt-0.5 size-4 shrink-0" />
                            {site.address}
                        </li>
                        <li className="flex gap-2">
                            <Mail className="text-gold-400 mt-0.5 size-4 shrink-0" />
                            <a href={`mailto:${site.email}`} className="hover:text-gold-300">
                                {site.email}
                            </a>
                        </li>
                        <li className="flex gap-2">
                            <Facebook className="text-gold-400 mt-0.5 size-4 shrink-0" />
                            <a href={site.facebook} target="_blank" rel="noopener noreferrer" className="hover:text-gold-300">
                                facebook.com/PPASENANAYAKE
                            </a>
                        </li>
                    </ul>
                </div>
            </div>
            <div className="border-t border-white/10 py-4 text-center text-xs text-white/60">
                © {new Date().getFullYear()} {site.name}, {site.school}
            </div>
        </footer>
    );
}
