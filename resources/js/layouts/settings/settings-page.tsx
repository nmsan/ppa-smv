import AccountLayout, { AccountCard } from '@/layouts/account-layout';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { type ReactNode } from 'react';

/**
 * Personal settings pages. Profile and password always live under My account on
 * the public site, for members and office bearers alike. Admin-only preferences
 * (appearance) stay in the admin portal for office bearers.
 */
export default function SettingsPage({
    title,
    breadcrumbs,
    account = false,
    children,
}: {
    title: string;
    breadcrumbs: BreadcrumbItem[];
    /** Always show this page under My account, whatever the person's roles. */
    account?: boolean;
    children: ReactNode;
}) {
    const { auth } = usePage<SharedData>().props;

    if (account || !auth.adminPortal) {
        return (
            <AccountLayout title={title} subtitle="Keep your sign-in details up to date.">
                <AccountCard className="space-y-12">{children}</AccountCard>
            </AccountLayout>
        );
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={title} />
            <SettingsLayout>{children}</SettingsLayout>
        </AppLayout>
    );
}
