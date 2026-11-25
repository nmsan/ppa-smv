import { useEffect, useState } from 'react';

/** Counts from 0 to `target` once `start` is true. Jumps straight there when motion is reduced. */
export function useCountUp(target: number, start: boolean, duration = 1200) {
    const [value, setValue] = useState(0);

    useEffect(() => {
        if (!start) return;
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            setValue(target);
            return;
        }
        let frame = 0;
        const began = performance.now();
        const tick = (now: number) => {
            const t = Math.min(1, (now - began) / duration);
            setValue(Math.round(target * (1 - Math.pow(1 - t, 3)))); // ease-out
            if (t < 1) frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(frame);
    }, [target, start, duration]);

    return value;
}
