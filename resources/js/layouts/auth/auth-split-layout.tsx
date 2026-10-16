import { Link, usePage } from '@inertiajs/react';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';

export default function AuthSplitLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    const { name } = usePage().props;

    return (
        <div className="relative grid min-h-dvh bg-[#F7F5EF] text-[#14201B] lg:grid-cols-2">
            <div className="relative hidden overflow-hidden lg:block">
                <img
                    src="/images/png-hero-photo.png"
                    alt="Papua New Guineans holding their national ID cards"
                    className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0E2A26] via-[#0E2A26]/60 to-[#0E2A26]/20" />
                <div className="absolute inset-x-0 top-0 p-10">
                    <Link href={home()} className="text-lg font-bold text-white">
                        IDENTRIQ <span className="font-normal text-white/60">· PNG National ID</span>
                    </Link>
                </div>
                <div className="absolute inset-x-0 bottom-0 p-10">
                    <p className="max-w-md text-2xl font-bold leading-snug text-white">
                        One identity. Every Papua New Guinean.
                    </p>
                    <p className="mt-2 text-sm text-[#2FD6A3]">Staff & administrator sign-in</p>
                </div>
            </div>
            <div className="flex w-full items-center justify-center p-8">
                <div className="w-full max-w-[380px]">
                    <Link href={home()} className="text-lg font-bold lg:hidden">
                        IDENTRIQ
                    </Link>
                    <h1 className="mt-4 text-2xl font-bold">{title || name}</h1>
                    {description && (
                        <p className="mt-1 text-sm text-[#14201B]/60">{description}</p>
                    )}
                    <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm [&_button[type=submit]]:bg-[#2FD6A3] [&_button[type=submit]]:text-[#0E2A26] [&_button[type=submit]]:hover:brightness-110">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}
