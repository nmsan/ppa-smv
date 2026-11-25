import { AlertCircle } from 'lucide-react';

/** A clear banner when a form was not sent, so a small field error is never missed. */
export default function FormErrorSummary({ errors, action = 'sent' }: { errors: Partial<Record<string, string>>; action?: string }) {
    const fieldErrors = Object.keys(errors).filter((k) => k !== 'form').length;
    const general = errors.form;

    if (!fieldErrors && !general) {
        return null;
    }

    return (
        <div role="alert" className="border-destructive/40 bg-destructive/5 text-destructive flex gap-3 rounded-lg border px-4 py-3 text-sm">
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            <div>
                <p className="font-medium">This was not {action}.</p>
                {general && <p className="mt-1">{general}</p>}
                {fieldErrors > 0 && (
                    <p className="mt-1">
                        {fieldErrors === 1 ? 'One field needs' : `${fieldErrors} fields need`} attention. They are marked in red below.
                    </p>
                )}
            </div>
        </div>
    );
}

/** Moves the cursor to the first field with an error, scrolling it into view. */
export function focusFirstError() {
    window.requestAnimationFrame(() => {
        const field = document.querySelector<HTMLElement>('[aria-invalid="true"]');
        if (field) {
            field.scrollIntoView({ behavior: 'smooth', block: 'center' });
            field.focus({ preventScroll: true });
        } else {
            document.querySelector('[role="alert"]')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    });
}
