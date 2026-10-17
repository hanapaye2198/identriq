import { usePage } from '@inertiajs/react';
import AppLogoIcon from '@/components/app-logo-icon';

export default function AppLogo() {
    const { name } = usePage().props;

    return (
        <div className="flex items-center gap-2">
            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sky-500/10 p-1 border border-sky-500/20 shadow-xs">
                <AppLogoIcon className="size-6 object-contain" />
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-black tracking-tight text-foreground">
                    {name || 'IDENTRIQ'}
                </span>
                <span className="truncate text-[10px] font-medium text-muted-foreground">
                    PNG National ID
                </span>
            </div>
        </div>
    );
}
