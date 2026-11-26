import { Select, SelectContent, SelectItem, SelectSeparator, SelectTrigger } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { type LucideIcon } from 'lucide-react';

const ALL = '__all';

interface Option {
    value: string;
    label: string;
}

/**
 * A compact filter button for list toolbars: shows "Label" when unset and
 * "Label: Value" (highlighted) when a value is chosen. '' means no filter.
 */
export default function FilterSelect({
    label,
    allLabel,
    value,
    options,
    onChange,
    icon: Icon,
    disabled,
    className,
}: {
    label: string;
    allLabel: string;
    value: string;
    options: Option[];
    onChange: (value: string) => void;
    icon?: LucideIcon;
    disabled?: boolean;
    className?: string;
}) {
    const selected = options.find((o) => o.value === value);

    return (
        <Select value={value || ALL} onValueChange={(v) => onChange(v === ALL ? '' : v)} disabled={disabled}>
            <SelectTrigger
                aria-label={`${label}: ${selected?.label ?? allLabel}`}
                className={cn(
                    'focus-visible:ring-ring/50 h-9 w-auto min-w-0 gap-2 rounded-full px-3.5 shadow-xs transition-colors focus:ring-0 focus:ring-offset-0 focus-visible:ring-2',
                    selected
                        ? 'border-primary/40 bg-primary/5 text-foreground dark:bg-primary/15'
                        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                    className,
                )}
            >
                <span className="flex min-w-0 items-center gap-1.5 whitespace-nowrap">
                    {Icon && <Icon className="size-3.5 shrink-0 opacity-70" />}
                    <span className={cn(selected && 'text-muted-foreground')}>{label}</span>
                    {selected && (
                        <>
                            <span className="text-muted-foreground/60" aria-hidden>
                                ·
                            </span>
                            <span className="truncate font-medium">{selected.label}</span>
                        </>
                    )}
                </span>
            </SelectTrigger>
            <SelectContent className="max-h-72">
                <SelectItem value={ALL}>{allLabel}</SelectItem>
                {options.length > 0 && <SelectSeparator />}
                {options.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                        {o.label}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}
