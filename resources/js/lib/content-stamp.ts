import { type Stamp } from '@/types/content';

export function formatStamp(stamp: Stamp | null): string {
    if (!stamp?.at) return 'Not edited yet';
    const when = new Date(stamp.at).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    return stamp.by ? `Last edited ${when} by ${stamp.by}` : `Imported ${when}`;
}
