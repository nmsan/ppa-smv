import SectionLabel from '@/components/admin/section-label';
import BarList from '@/components/dashboard/bar-list';
import ColumnChart from '@/components/dashboard/column-chart';
import StatTile from '@/components/dashboard/stat-tile';
import FlashMessage from '@/components/domain/flash-message';
import HeadingSmall from '@/components/heading-small';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { CalendarDays, Clock, ExternalLink, Globe, IdCard, Plus, UserCheck } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Dashboard', href: '/dashboard' }];

interface Count {
    count: number;
    year?: number;
    month?: string;
    label?: string;
}

interface Dashboard {
    me?: { number: string | null; status: string; batch: number | null; batch_members: number };
    events?: { title: string; date: string }[];
    membership?: {
        scope: string;
        totals: {
            members: number;
            pending: number;
            oldest_pending_days: number | null;
            this_month: number;
            last_month: number;
            approval_days: number | null;
            batches: number;
        };
        by_batch: Count[];
        by_month: Count[];
        by_channel: Count[];
        by_category: Count[];
        without_representative: Count[];
        without_representative_total: number;
        strongest: Count[];
        recent_years: Count[];
        completeness: { total: number; missing_email: number; missing_phone: number; missing_nic: number; missing_batch: number; overseas: number };
    };
    website?: { last_news_days: number | null; stale: { type: string; days: number | null }[]; stale_after_days: number };
    activity?: { at: string; who: string | null; what: string; kind: string }[];
    roles?: Record<string, number>;
}

const roleNames: Record<string, string> = {
    Accounts: 'All accounts',
    'super-admin': 'Super admins',
    'membership-secretary': 'Membership secretaries',
    'batch-representative': 'Batch representatives',
    treasurer: 'Treasurers',
    'content-editor': 'Content editors',
    'committee-member': 'Committee members',
    member: 'Members',
};

const statusNames: Record<string, string> = {
    applied: 'Waiting for approval',
    approved: 'Approved',
    active: 'Active',
    expiring: 'Renewal due soon',
    lapsed: 'Lapsed',
    rejected: 'Not approved',
};

function formatDate(iso: string) {
    return new Date(iso + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

function daysUntil(iso: string) {
    const days = Math.round((new Date(iso + 'T00:00:00').getTime() - new Date(new Date().toDateString()).getTime()) / 86400000);
    return days === 0 ? 'today' : days === 1 ? 'tomorrow' : `in ${days} days`;
}

function timeAgo(iso: string) {
    const mins = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
    if (mins < 60) return `${Math.max(1, mins)} min ago`;
    if (mins < 1440) return `${Math.round(mins / 60)} h ago`;
    return `${Math.round(mins / 1440)} days ago`;
}

function percent(part: number, total: number) {
    if (total === 0 || part === 0) return '0%';
    const p = (part / total) * 100;
    return p < 1 ? 'under 1%' : `${Math.round(p)}%`;
}

function monthLabel(ym: string) {
    const [y, m] = ym.split('-').map(Number);
    return new Date(y, m - 1, 1).toLocaleDateString('en-GB', { month: 'short' });
}

function Section({ title, aside, children }: { title: string; aside?: React.ReactNode; children: React.ReactNode }) {
    return (
        <section className="space-y-4">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
                <SectionLabel>{title}</SectionLabel>
                {aside}
            </div>
            {children}
        </section>
    );
}

function QuickActions({ roles }: { roles: string[] }) {
    const has = (...r: string[]) => roles.some((x) => r.includes(x));
    const actions = [
        has('super-admin', 'content-editor') && { title: 'Edit website', href: '/admin/content', icon: Globe },
        has('super-admin', 'content-editor') && { title: 'Add news or event', href: '/admin/content/news/create', icon: Plus },
        has('super-admin', 'membership-secretary', 'batch-representative') && { title: 'Applicants', href: '/admin/applicants', icon: UserCheck },
        { title: 'My membership', href: '/my-membership', icon: IdCard },
    ].filter(Boolean) as { title: string; href: string; icon: typeof Globe }[];

    return (
        <div className="flex flex-wrap gap-2">
            {actions.map((a) => (
                <Link
                    key={a.href}
                    href={a.href}
                    className="hover:bg-muted inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium"
                >
                    <a.icon className="size-4" /> {a.title}
                </Link>
            ))}
            <a
                href="/"
                target="_blank"
                rel="noreferrer"
                className="hover:bg-muted inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium"
            >
                <ExternalLink className="size-4" /> View website
            </a>
        </div>
    );
}

function Membership({ m }: { m: NonNullable<Dashboard['membership']> }) {
    const t = m.totals;
    const c = m.completeness;
    const pendingTone = t.pending > 0 && (t.oldest_pending_days ?? 0) >= 7 ? 'attention' : 'default';

    return (
        <Section title={`Membership · ${m.scope}`}>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(12rem,1fr))] gap-4">
                <StatTile label="Members" value={t.members} detail={`Approved and active, from ${t.batches} batches`} />
                <StatTile
                    label="Waiting for approval"
                    value={t.pending}
                    tone={pendingTone}
                    detail={t.oldest_pending_days !== null ? `Oldest waiting ${t.oldest_pending_days} days` : 'No one waiting'}
                />
                <StatTile
                    label="Applications this month"
                    value={t.this_month}
                    trend={{ current: t.this_month, previous: t.last_month, label: 'last month' }}
                />
                <StatTile
                    label="Average approval time"
                    value={t.approval_days !== null ? `${t.approval_days} days` : '–'}
                    detail="From applying to approval, on this website"
                />
                <StatTile label="Living overseas" value={c.overseas} detail={`${percent(c.overseas, c.total)} of members`} />
            </div>

            <ColumnChart
                title="Members by batch (A/L year)"
                valueLabel="Members"
                data={m.by_batch.map((d) => ({ label: String(d.year), value: d.count }))}
                labelEvery={Math.max(1, Math.ceil(m.by_batch.length / 12))}
                emptyText="No members with a batch year yet. Import the register to fill this chart."
            />

            <div className="grid gap-4 lg:grid-cols-2">
                <ColumnChart
                    title="Applications by month"
                    valueLabel="Applications"
                    height={180}
                    data={m.by_month.map((d) => ({ label: monthLabel(d.month!), value: d.count }))}
                    emptyText="No applications through the website in the last 12 months."
                />
                <BarList
                    title="Recent batches"
                    description="Members from the last 10 A/L batches. Low numbers are recruitment targets."
                    items={m.recent_years.map((d) => ({ label: `A/L ${d.year}`, value: d.count }))}
                />
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
                <BarList
                    title="Batches without a representative"
                    description="No one can approve applicants from these batches except the secretary."
                    items={m.without_representative.map((d) => ({ label: `A/L ${d.year}`, value: d.count, display: `${d.count} members` }))}
                    footer={
                        m.without_representative_total > m.without_representative.length
                            ? `Largest ${m.without_representative.length} of ${m.without_representative_total} batches shown.`
                            : undefined
                    }
                    emptyText="Every batch with members has a representative."
                />
                <BarList title="Strongest batches" items={m.strongest.map((d) => ({ label: `A/L ${d.year}`, value: d.count }))} />
                <BarList
                    title="Missing details"
                    description={`Share of ${c.total} members with nothing recorded.`}
                    max={c.total || 1}
                    items={[
                        { label: 'Email', value: c.missing_email, display: percent(c.missing_email, c.total) },
                        { label: 'Phone', value: c.missing_phone, display: percent(c.missing_phone, c.total) },
                        { label: 'NIC', value: c.missing_nic, display: percent(c.missing_nic, c.total) },
                        { label: 'Batch year', value: c.missing_batch, display: percent(c.missing_batch, c.total) },
                    ]}
                />
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
                <BarList title="How members joined" items={m.by_channel.map((d) => ({ label: d.label!, value: d.count }))} />
                <BarList title="Membership categories" items={m.by_category.map((d) => ({ label: d.label!, value: d.count }))} />
            </div>
        </Section>
    );
}

function Website({ w }: { w: NonNullable<Dashboard['website']> }) {
    return (
        <Section title="Website">
            <div className="grid gap-4 sm:grid-cols-2">
                <StatTile
                    label="Last news posted"
                    value={w.last_news_days === null ? 'Never' : w.last_news_days === 0 ? 'Today' : `${w.last_news_days} days ago`}
                    tone={(w.last_news_days ?? 999) > 60 ? 'attention' : 'default'}
                    detail={
                        <Link href="/admin/content/news/create" className="underline">
                            Post news or an event
                        </Link>
                    }
                />
                <StatTile
                    label={`Pages not updated in ${w.stale_after_days} days`}
                    value={w.stale.length}
                    detail={
                        w.stale.length
                            ? w.stale
                                  .slice(0, 4)
                                  .map((s) => s.type)
                                  .join(', ') + (w.stale.length > 4 ? '…' : '')
                            : 'Everything is up to date'
                    }
                />
            </div>
        </Section>
    );
}

export default function DashboardPage({ dashboard }: { dashboard: Dashboard }) {
    const { auth } = usePage<SharedData>().props;
    const { me, events = [], membership, website, activity = [], roles } = dashboard;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="space-y-10 p-4">
                <div className="space-y-4">
                    <HeadingSmall title={`Welcome, ${auth.user.name}`} description="Here is what is happening in the association." />
                    <FlashMessage />
                    <QuickActions roles={auth.roles} />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <div className="admin-panel rounded-xl border p-5">
                        <p className="text-muted-foreground text-sm">Your membership</p>
                        {me ? (
                            <>
                                <p className="mt-1 text-2xl font-semibold">{me.number ?? 'No number yet'}</p>
                                <p className="text-muted-foreground mt-1 text-sm">
                                    {statusNames[me.status] ?? me.status}
                                    {me.batch && ` · A/L ${me.batch} batch, ${me.batch_members} members`}
                                </p>
                            </>
                        ) : (
                            <p className="mt-2 text-sm">
                                You are not a member yet.{' '}
                                <Link href="/my-membership" className="font-medium underline">
                                    Become a member
                                </Link>
                            </p>
                        )}
                    </div>
                    <div className="admin-panel rounded-xl border p-5">
                        <p className="text-muted-foreground flex items-center gap-2 text-sm">
                            <CalendarDays className="size-4" /> Upcoming events
                        </p>
                        {events.length === 0 ? (
                            <p className="mt-2 text-sm">No upcoming events.</p>
                        ) : (
                            <ul className="mt-2 space-y-2">
                                {events.map((e) => (
                                    <li key={e.title + e.date}>
                                        <p className="font-medium">{e.title}</p>
                                        <p className="text-muted-foreground text-sm">
                                            {formatDate(e.date)} · {daysUntil(e.date)}
                                        </p>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>

                {membership && <Membership m={membership} />}
                {website && <Website w={website} />}

                {(activity.length > 0 || roles) && (
                    <div className="grid gap-4 lg:grid-cols-3">
                        {dashboard.activity && (
                            <section className="admin-panel rounded-xl border p-5 lg:col-span-2">
                                <h3 className="flex items-center gap-2 font-semibold">
                                    <Clock className="size-4" /> Recent activity
                                </h3>
                                {activity.length === 0 ? (
                                    <p className="text-muted-foreground mt-4 text-sm">Nothing yet.</p>
                                ) : (
                                    <ul className="mt-4 divide-y">
                                        {activity.map((a, i) => (
                                            <li key={i} className="flex justify-between gap-4 py-2 text-sm">
                                                <span>
                                                    <span className="font-medium">{a.who ?? 'Someone'}</span> {a.what}
                                                </span>
                                                <span className="text-muted-foreground shrink-0 text-xs">{timeAgo(a.at)}</span>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </section>
                        )}
                        {roles && (
                            <BarList
                                title="People with access"
                                items={Object.entries(roles)
                                    .filter(([k]) => k !== 'Accounts')
                                    .map(([k, v]) => ({ label: roleNames[k] ?? k, value: v }))}
                                footer={`${roles.Accounts} accounts in total. Roles are given with the command line for now.`}
                            />
                        )}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
