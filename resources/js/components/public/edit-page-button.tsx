import { type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { Pencil } from 'lucide-react';

const editorRoles = ['super-admin', 'content-editor'];

/** Floating "Edit this page" button, shown only to people who can edit website content. */
export default function EditPageButton() {
    const { auth, editContent, editLink } = usePage<
        SharedData & { editContent?: string; editLink?: { href: string; roles: string[]; label?: string } }
    >().props;
    // Content pages open the content editor; other pages (sponsors) say where they are managed.
    const target = editLink ?? (editContent ? { href: `/admin/content/${editContent}`, roles: editorRoles, label: 'Edit this page' } : null);
    const canEdit = target && auth.roles?.some((role) => target.roles.includes(role));

    if (!target || !canEdit) {
        return null;
    }

    return (
        <Link
            href={target.href}
            className="bg-gold-400 text-maroon-950 hover:bg-gold-300 fixed right-4 bottom-[88px] z-50 inline-flex items-center gap-2 rounded-full px-5 py-3 font-semibold shadow-lg ring-2 ring-white sm:right-6 sm:bottom-6 md:bottom-6"
        >
            <Pencil className="size-4" />
            {target.label ?? 'Edit this page'}
        </Link>
    );
}
