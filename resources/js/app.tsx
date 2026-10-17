import { createInertiaApp } from '@inertiajs/react';
import { Provider as ReduxProvider } from 'react-redux';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import DemoBar from '@/components/demo-bar';
import { initializeTheme } from '@/hooks/use-appearance';
import AppLayout from '@/layouts/app-layout';
import AuthLayout from '@/layouts/auth-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { store } from '@/lib/store';

const appName = import.meta.env.VITE_APP_NAME || 'IDENTRIQ';

void createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    layout: (name) => {
        switch (true) {
            case name.startsWith('auth/'):
                return AuthLayout;
            case name.startsWith('settings/'):
                return [AppLayout, SettingsLayout];
            case name === 'dashboard':
                return AppLayout;
            default:
                return null;
        }
    },
    strictMode: true,
    withApp(app) {
        return (
            <ReduxProvider store={store}>
                <TooltipProvider delayDuration={0}>
                    <DemoBar />
                    {app}
                    <Toaster />
                </TooltipProvider>
            </ReduxProvider>
        );
    },
    progress: {
        color: '#4B5563',
    },
});

// This will set light / dark mode on load...
initializeTheme();
