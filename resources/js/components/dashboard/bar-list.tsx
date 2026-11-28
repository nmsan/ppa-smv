import { type ReactNode } from 'react';

export interface BarItem {
    label: string;
    value: number;
    /** Text shown at the end of the row; defaults to the value. */
    display?: string;
}

interface Props {
    title: string;
    description?: ReactNode;
    items: BarItem[];
    /** Bars are drawn against this; defaults to the largest value. */
    max?: number;
    emptyText?: string;
    footer?: ReactNode;
}

/** Horizontal bars with the label and value as text, so the numbers are always readable. */
export default function BarList({ title, description, items, max, emptyText = 'Nothing to show yet.', footer }: Props) {
    const top = max ?? Math.max(1, ...items.map((i) => i.value));

    return (
        <section className="admin-panel rounded-xl border p-5">
            <h3 className="font-semibold">{title}</h3>
            {description && <p className="text-muted-foreground mt-1 text-sm">{description}</p>}
            {items.length === 0 ? (
                <p className="text-muted-foreground mt-4 text-sm">{emptyText}</p>
            ) : (
                <ul className="mt-4 space-y-3">
                    {items.map((item) => (
                        <li key={item.label} title={`${item.label}: ${item.display ?? item.value}`}>
                            <div className="flex justify-between gap-3 text-sm">
                                <span>{item.label}</span>
                                <span className="text-muted-foreground tabular-nums">{item.display ?? item.value}</span>
                            </div>
                            <div className="bg-muted mt-1 h-2 rounded-full">
                                <div
                                    className="h-2 rounded-full bg-[var(--viz-bar)]"
                                    style={{ width: `${Math.max(item.value > 0 ? 2 : 0, (item.value / top) * 100)}%` }}
                                />
                            </div>
                        </li>
                    ))}
                </ul>
            )}
            {footer && <div className="text-muted-foreground mt-4 text-xs">{footer}</div>}
        </section>
    );
}
