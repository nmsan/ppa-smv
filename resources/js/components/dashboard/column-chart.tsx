import { useMemo, useState } from 'react';

export interface Datum {
    label: string;
    value: number;
}

interface Props {
    title: string;
    data: Datum[];
    valueLabel: string;
    /** Show every nth x label so they never collide. */
    labelEvery?: number;
    height?: number;
    emptyText?: string;
}

/** Single-series column chart: one maroon hue, values read from length, hover tooltip, table view. */
export default function ColumnChart({ title, data, valueLabel, labelEvery = 1, height = 220, emptyText = 'No data yet.' }: Props) {
    const [hover, setHover] = useState<number | null>(null);
    const [asTable, setAsTable] = useState(false);
    const max = Math.max(1, ...data.map((d) => d.value));
    const ticks = useMemo(() => niceTicks(max), [max]);
    const top = ticks[ticks.length - 1];
    const total = data.reduce((sum, d) => sum + d.value, 0);

    const W = 640;
    const pad = { left: 32, right: 8, top: 12, bottom: 28 };
    const plotW = W - pad.left - pad.right;
    const plotH = height - pad.top - pad.bottom;
    const slot = plotW / Math.max(1, data.length);
    const barW = Math.max(2, slot - 2); // 2px gap between bars
    const y = (v: number) => pad.top + plotH - (v / top) * plotH;

    return (
        <figure className="rounded-xl border p-5">
            <div className="flex items-start justify-between gap-4">
                <figcaption className="font-semibold">{title}</figcaption>
                {total > 0 && (
                    <button
                        type="button"
                        className="text-muted-foreground text-xs underline-offset-2 hover:underline"
                        onClick={() => setAsTable(!asTable)}
                    >
                        {asTable ? 'Show chart' : 'Show as table'}
                    </button>
                )}
            </div>

            {total === 0 ? (
                <p className="text-muted-foreground mt-6 text-sm">{emptyText}</p>
            ) : asTable ? (
                <div className="mt-4 max-h-64 overflow-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-muted-foreground text-left">
                                <th className="py-1 font-medium">{title.split(' by ').pop()}</th>
                                <th className="py-1 text-right font-medium">{valueLabel}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((d) => (
                                <tr key={d.label} className="border-t">
                                    <td className="py-1">{d.label}</td>
                                    <td className="py-1 text-right tabular-nums">{d.value}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="relative mt-4">
                    <svg
                        viewBox={`0 0 ${W} ${height}`}
                        className="w-full"
                        role="img"
                        aria-label={`${title}. ${total} ${valueLabel.toLowerCase()} in total.`}
                    >
                        {ticks.map((t) => (
                            <g key={t}>
                                <line x1={pad.left} x2={W - pad.right} y1={y(t)} y2={y(t)} stroke="var(--viz-grid)" strokeWidth={1} />
                                <text x={pad.left - 6} y={y(t) + 4} textAnchor="end" className="fill-muted-foreground text-[11px]">
                                    {t}
                                </text>
                            </g>
                        ))}
                        {data.map((d, i) => {
                            const x = pad.left + i * slot + (slot - barW) / 2;
                            const h = y(0) - y(d.value);
                            const r = Math.min(4, barW / 2, h);
                            return (
                                <g key={d.label} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}>
                                    {/* hit target wider and taller than the mark */}
                                    <rect x={pad.left + i * slot} y={pad.top} width={slot} height={plotH} fill="transparent" />
                                    {d.value > 0 && (
                                        <path
                                            d={roundedTop(x, y(d.value), barW, h, r)}
                                            fill={hover === null || hover === i ? 'var(--viz-bar)' : 'var(--viz-bar-muted)'}
                                        />
                                    )}
                                    {i % labelEvery === 0 && (
                                        <text x={x + barW / 2} y={height - 8} textAnchor="middle" className="fill-muted-foreground text-[11px]">
                                            {d.label}
                                        </text>
                                    )}
                                </g>
                            );
                        })}
                        <line x1={pad.left} x2={W - pad.right} y1={y(0)} y2={y(0)} stroke="currentColor" strokeOpacity={0.35} />
                    </svg>
                    {hover !== null && (
                        <div
                            className="bg-popover text-popover-foreground pointer-events-none absolute -translate-x-1/2 -translate-y-full rounded-md border px-2.5 py-1.5 text-xs shadow-md"
                            style={{ left: `${((pad.left + hover * slot + slot / 2) / W) * 100}%`, top: `${(y(data[hover].value) / height) * 100}%` }}
                        >
                            <p className="font-medium">{data[hover].label}</p>
                            <p className="tabular-nums">
                                {data[hover].value} {valueLabel.toLowerCase()}
                            </p>
                        </div>
                    )}
                </div>
            )}
        </figure>
    );
}

function roundedTop(x: number, y: number, w: number, h: number, r: number) {
    return `M${x},${y + h} V${y + r} Q${x},${y} ${x + r},${y} H${x + w - r} Q${x + w},${y} ${x + w},${y + r} V${y + h} Z`;
}

function niceTicks(max: number): number[] {
    const step = [1, 2, 5, 10, 20, 25, 50, 100, 200, 500].find((s) => max / s <= 5) ?? Math.ceil(max / 5);
    const ticks = [];
    for (let t = 0; t <= max + step - 1; t += step) ticks.push(t);
    if (ticks[ticks.length - 1] < max) ticks.push(ticks[ticks.length - 1] + step);
    return ticks;
}
