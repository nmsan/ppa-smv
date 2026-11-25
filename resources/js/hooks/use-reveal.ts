import { useEffect, useRef, useState } from 'react';

/**
 * Marks a section as "shown" the first time it scrolls into view, so CSS can
 * animate its children in. Without IntersectionObserver it is shown at once.
 */
export function useReveal<T extends HTMLElement>(threshold = 0.15) {
    const ref = useRef<T>(null);
    const [shown, setShown] = useState(false);

    useEffect(() => {
        const el = ref.current;
        if (!el || shown) return;
        if (!('IntersectionObserver' in window)) {
            setShown(true);
            return;
        }
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setShown(true);
                    observer.disconnect();
                }
            },
            { threshold },
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, [shown, threshold]);

    return { ref, reveal: shown ? 'shown' : 'hidden' } as const;
}
