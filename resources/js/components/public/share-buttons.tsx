import { cn } from '@/lib/utils';
import { Check, Link2, Share2 } from 'lucide-react';
import { type ReactNode, useEffect, useState } from 'react';

export interface ShareMeta {
    title: string;
    description: string;
    url: string;
}

const brands: { name: string; href: (url: string, text: string) => string; className: string; icon: ReactNode }[] = [
    {
        name: 'Facebook',
        href: (url) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
        className: 'bg-[#1877F2] hover:bg-[#0f63d6]',
        icon: <path d="M14 13.5h2.5l1-4H14v-2c0-1.03 0-2 2-2h1.5V2.14c-.33-.04-1.57-.14-2.88-.14C11.9 2 10 3.66 10 6.7v2.8H7v4h3V22h4v-8.5Z" />,
    },
    {
        name: 'WhatsApp',
        href: (url, text) => `https://wa.me/?text=${encodeURIComponent(`${text}\n${url}`)}`,
        className: 'bg-[#25D366] hover:bg-[#1eb957]',
        icon: (
            <path d="M12.04 2a9.9 9.9 0 0 0-8.5 15l-1.4 5.1 5.24-1.37A9.9 9.9 0 1 0 12.04 2Zm5.8 14.06c-.24.68-1.42 1.3-1.95 1.34-.5.05-.97.23-3.27-.68-2.77-1.1-4.52-3.94-4.66-4.12-.13-.18-1.1-1.47-1.1-2.8 0-1.33.7-1.99.95-2.26.24-.27.53-.34.71-.34l.51.01c.17 0 .38-.06.6.46.23.54.77 1.87.84 2 .07.14.11.3.02.48-.09.18-.13.3-.27.45-.13.16-.28.35-.4.47-.13.13-.27.28-.12.55.16.27.7 1.15 1.5 1.86 1.03.92 1.9 1.2 2.17 1.34.27.14.43.11.59-.07.16-.18.68-.79.86-1.06.18-.27.36-.23.6-.14.25.09 1.57.74 1.84.88.27.13.45.2.52.31.07.11.07.65-.17 1.32Z" />
        ),
    },
    {
        name: 'X',
        href: (url, text) => `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
        className: 'bg-neutral-900 hover:bg-black',
        icon: (
            <path d="M17.75 3h3.07l-6.7 7.66L22 21h-6.17l-4.83-6.32L5.47 21H2.4l7.17-8.2L2 3h6.32l4.37 5.78L17.75 3Zm-1.08 16.2h1.7L7.4 4.73H5.58L16.67 19.2Z" />
        ),
    },
];

/** Share links for an article: the phone's own share sheet where there is one, plus Facebook, WhatsApp, X and copy link. */
export default function ShareButtons({ share, className }: { share: ShareMeta; className?: string }) {
    const [canNativeShare, setCanNativeShare] = useState(false);
    const [copied, setCopied] = useState(false);

    // Decided after mount so the server-rendered HTML matches the first client render.
    useEffect(() => setCanNativeShare(typeof navigator !== 'undefined' && 'share' in navigator), []);

    const nativeShare = () => navigator.share({ title: share.title, text: share.title, url: share.url }).catch(() => {});

    const copy = async () => {
        try {
            await navigator.clipboard.writeText(share.url);
        } catch {
            window.prompt('Copy this link', share.url);
            return;
        }
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const circle = 'flex size-10 items-center justify-center rounded-full text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md';

    return (
        <div className={cn('flex flex-wrap items-center gap-3', className)}>
            <p className="mr-1 text-sm font-semibold text-neutral-700">Share</p>
            {canNativeShare && (
                <button
                    type="button"
                    onClick={nativeShare}
                    className={cn(circle, 'bg-maroon-800 hover:bg-maroon-900')}
                    aria-label="Share…"
                    title="Share…"
                >
                    <Share2 className="size-[18px]" />
                </button>
            )}
            {brands.map((b) => (
                <a
                    key={b.name}
                    href={b.href(share.url, share.title)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(circle, b.className)}
                    aria-label={`Share on ${b.name}`}
                    title={`Share on ${b.name}`}
                >
                    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className="size-[18px]">
                        {b.icon}
                    </svg>
                </a>
            ))}
            <button
                type="button"
                onClick={copy}
                className={cn(
                    circle,
                    'bg-white text-neutral-700 ring-1 ring-neutral-200 hover:bg-neutral-50',
                    copied && 'text-green-700 ring-green-300',
                )}
                aria-label="Copy link"
                title={copied ? 'Link copied' : 'Copy link'}
            >
                {copied ? <Check className="size-[18px]" /> : <Link2 className="size-[18px]" />}
            </button>
            <span role="status" className={cn('text-sm text-green-700 transition-opacity', copied ? 'opacity-100' : 'opacity-0')}>
                Link copied
            </span>
        </div>
    );
}
