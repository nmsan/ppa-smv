import { router, usePage } from '@inertiajs/react';
import { Camera, LoaderCircle, Trash2 } from 'lucide-react';
import { ChangeEvent, useRef, useState } from 'react';

import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useInitials } from '@/hooks/use-initials';
import { type SharedData } from '@/types';

const MAX_BYTES = 2 * 1024 * 1024;

export default function ProfilePhoto() {
    const { auth } = usePage<SharedData>().props;
    const getInitials = useInitials();
    const input = useRef<HTMLInputElement>(null);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | undefined>();

    const upload = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        e.target.value = '';
        if (!file) return;

        if (file.size > MAX_BYTES) {
            setError('The photo must be 2 MB or smaller.');
            return;
        }

        setError(undefined);
        router.post(
            route('profile.avatar.update'),
            { avatar: file },
            {
                forceFormData: true,
                preserveScroll: true,
                onStart: () => setBusy(true),
                onFinish: () => setBusy(false),
                onError: (errors) => setError(errors.avatar),
            },
        );
    };

    const remove = () => {
        setError(undefined);
        router.delete(route('profile.avatar.destroy'), {
            preserveScroll: true,
            onStart: () => setBusy(true),
            onFinish: () => setBusy(false),
        });
    };

    return (
        <div className="space-y-6">
            <HeadingSmall title="Profile photo" description="Shown next to your name in the member list and around your account" />

            <div className="flex items-center gap-5">
                <Avatar className="size-20">
                    <AvatarImage src={auth.user.avatar ?? undefined} alt={auth.user.name} className="object-cover" />
                    <AvatarFallback className="bg-neutral-200 text-xl text-black dark:bg-neutral-700 dark:text-white">
                        {getInitials(auth.user.name)}
                    </AvatarFallback>
                </Avatar>

                <div className="space-y-2">
                    <div className="flex flex-wrap gap-2">
                        <Button type="button" variant="outline" size="sm" disabled={busy} onClick={() => input.current?.click()}>
                            {busy ? <LoaderCircle className="animate-spin" /> : <Camera />}
                            {auth.user.avatar ? 'Change photo' : 'Upload photo'}
                        </Button>

                        {auth.user.avatar && (
                            <Button type="button" variant="ghost" size="sm" disabled={busy} onClick={remove}>
                                <Trash2 />
                                Remove
                            </Button>
                        )}
                    </div>
                    <p className="text-muted-foreground text-xs">JPG, PNG or WebP, up to 2 MB. A square photo works best.</p>
                    <input ref={input} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={upload} />
                </div>
            </div>

            <InputError message={error} />
        </div>
    );
}
