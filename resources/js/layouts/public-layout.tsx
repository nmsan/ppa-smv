import EditPageButton from '@/components/public/edit-page-button';
import MobileTabBar from '@/components/public/mobile-tab-bar';
import SiteFooter from '@/components/public/site-footer';
import SiteHeader from '@/components/public/site-header';
import { Head } from '@inertiajs/react';
import { type ReactNode } from 'react';

export default function PublicLayout({ title, children }: { title: string; children: ReactNode }) {
    return (
        <div className="flex min-h-screen flex-col bg-neutral-50 pb-[72px] text-neutral-900 md:pb-0">
            <Head title={title} />
            <a
                href="#main"
                className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:m-2 focus:rounded focus:bg-white focus:px-3 focus:py-2"
            >
                Skip to content
            </a>
            <SiteHeader />
            <main id="main" className="flex-1">
                {children}
            </main>
            <SiteFooter />
            <EditPageButton />
            <MobileTabBar />
        </div>
    );
}
