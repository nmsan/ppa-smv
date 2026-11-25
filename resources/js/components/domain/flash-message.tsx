import { type SharedData } from '@/types';
import { usePage } from '@inertiajs/react';
import { CheckCircle2 } from 'lucide-react';

export default function FlashMessage() {
    const { flash } = usePage<SharedData>().props;

    if (!flash.success) {
        return null;
    }

    return (
        <div role="status" className="flex items-center gap-2 rounded-lg border border-green-600/30 bg-green-50 px-4 py-3 text-sm text-green-900 dark:bg-green-950 dark:text-green-100">
            <CheckCircle2 className="size-4 shrink-0" />
            {flash.success}
        </div>
    );
}
