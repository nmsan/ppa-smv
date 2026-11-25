const SINHALA = /[඀-෿]/;

/** True when the text contains Sinhala script. */
export function isSinhala(text: string | null | undefined): boolean {
    return !!text && SINHALA.test(text);
}

/**
 * `lang` attribute for a piece of editor-supplied text, so screen readers pick
 * the right voice and the Sinhala font and leading apply (see app.css).
 */
export function langOf(text: string | null | undefined): { lang?: 'si' } {
    return isSinhala(text) ? { lang: 'si' } : {};
}
