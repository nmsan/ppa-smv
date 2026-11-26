import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useInitials } from '@/hooks/use-initials';
import { cn } from '@/lib/utils';
import { Building2 } from 'lucide-react';

/** A person's profile photo, falling back to their initials (or a building for organisations). */
export default function PersonAvatar({
    name,
    src,
    organisation = false,
    className,
}: {
    name: string;
    src?: string | null;
    organisation?: boolean;
    className?: string;
}) {
    const getInitials = useInitials();

    return (
        <Avatar className={cn('size-8', className)}>
            {src && <AvatarImage src={src} alt="" className="object-cover" />}
            <AvatarFallback className="bg-muted text-muted-foreground text-xs font-medium">
                {organisation ? <Building2 className="size-1/2" /> : getInitials(name)}
            </AvatarFallback>
        </Avatar>
    );
}
