import { cn } from '@workspace/ui/lib/utils';

interface LogoProps {
    className?: string;
}

export function Logo({ className }: LogoProps) {
    return (
        <div className={cn('text-primary font-bold text-3xl', className)}>
            GanzAfrica
        </div>
    );
}