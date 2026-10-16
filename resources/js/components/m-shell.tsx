import { Head, Link, usePage } from '@inertiajs/react';
import { ScanLine, Wallet } from 'lucide-react';

export default function MShell({ children, tab }: { children: React.ReactNode; tab: 'wallet' | 'verify' }) {
    const { url } = usePage();
    void url;
    return (
        <>
            <Head title="IDENTRIQ mobile" />
            <div className="min-h-dvh bg-[#F7F5EF] text-[#14201B]">
                <div className="mx-auto min-h-dvh w-full max-w-[430px] bg-[#F7F5EF] pb-24 shadow-xl">
                    <header className="flex items-center justify-between bg-[#0E2A26] px-4 py-3 text-white">
                        <Link href="/" className="font-bold">IDENTRIQ</Link>
                        <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs">Demo · simulated</span>
                    </header>
                    <main className="px-4 py-5">{children}</main>
                    <nav className="fixed inset-x-0 bottom-0 z-40 mx-auto grid w-full max-w-[430px] grid-cols-2 border-t border-[#14201B]/10 bg-white">
                        <Link
                            href="/m/wallet"
                            className={`flex min-h-[56px] flex-col items-center justify-center text-sm font-semibold ${tab === 'wallet' ? 'text-[#0E2A26]' : 'text-[#14201B]/50'}`}
                        >
                            <Wallet className="size-5" />Wallet
                        </Link>
                        <Link
                            href="/m/verify"
                            className={`flex min-h-[56px] flex-col items-center justify-center text-sm font-semibold ${tab === 'verify' ? 'text-[#0E2A26]' : 'text-[#14201B]/50'}`}
                        >
                            <ScanLine className="size-5" />Verify
                        </Link>
                    </nav>
                </div>
            </div>
        </>
    );
}
