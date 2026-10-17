import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { csrfToken, xsrfCookie } from './csrf';
import type { RootState } from './store';

export interface WalletIdentity {
    full_name: string | null;
    dob: string | null;
    gender?: string | null;
    mobile: string;
    status: string;
    credential_state: string;
    biosure_id_number: string | null;
    card_personalized_at?: string | null;
    qr_token: string | null;
    photo_url?: string | null;
    province?: string | null;
    /** Spec §3.3 — the booked registration appointment, once one exists. */
    appointment?: WalletAppointment | null;
}

export interface WalletAppointment {
    center: string | null;
    center_location: string | null;
    center_province: string | null;
    slot_at: string | null;
    reference: string | null;
    status: string | null;
}

export interface TimelineStage {
    stage: string;
    at: string | null;
    done: boolean;
}

export interface WalletNotification {
    id: number;
    channel: string;
    title: string;
    body: string | null;
    read_at: string | null;
    sent_at: string | null;
    created_at: string | null;
}

export interface TimelinePayload {
    timeline: TimelineStage[];
    notifications: WalletNotification[];
}

export interface ActivityEvent {
    id: number;
    at: string | null;
    mode: string;
    result: string;
    verifier: string | null;
    purpose: string | null;
    reason: string | null;
    state: string | null;
    fields: string[] | null;
    checked_at: string | null;
    offline: boolean;
}

export interface PendingConsent {
    id: number;
    verifier_name: string;
    purpose: string | null;
    fields: string[] | null;
    expires_at: string;
}

export interface WalletDevice {
    id: number;
    name: string | null;
    created_at: string | null;
    last_used_at: string | null;
    current: boolean;
}

export const api = createApi({
    reducerPath: 'api',
    baseQuery: fetchBaseQuery({
        baseUrl: '/',
        prepareHeaders: (headers, { getState }) => {
            const token = csrfToken();
            if (token) headers.set('X-CSRF-TOKEN', token);
            const xsrf = xsrfCookie();
            if (xsrf) headers.set('X-XSRF-TOKEN', xsrf);
            headers.set('Accept', 'application/json');

            // Wallet calls authenticate with the linked-device bearer token
            // from localStorage — independent of the web session used by the
            // admin portal and verifier pages.
            const walletToken = (getState() as RootState).wallet.token;
            if (walletToken) {
                headers.set('Authorization', `Bearer ${walletToken}`);
            }
            return headers;
        },
    }),
    tagTypes: [
        'Registrant',
        'Appointment',
        'Identity',
        'Center',
        'AuthEvent',
        'Notification',
        'Timeline',
        'Consent',
        'Device',
    ],
    endpoints: (builder) => ({
        getWalletIdentity: builder.query<WalletIdentity, void>({
            query: () => '/api/me/identity',
            providesTags: ['Identity'],
        }),
        getQrSvg: builder.query<
            { svg: string | null },
            { fields?: string } | void
        >({
            query: (arg) => ({
                url: '/api/me/qr-svg',
                params: arg?.fields ? { fields: arg.fields } : undefined,
            }),
        }),
        getTimeline: builder.query<TimelinePayload, void>({
            query: () => '/api/me/timeline',
            providesTags: ['Timeline', 'Notification'],
        }),
        getActivity: builder.query<{ events: ActivityEvent[] }, void>({
            query: () => '/api/mobile/activity',
            providesTags: ['AuthEvent'],
        }),
        getPendingConsent: builder.query<
            { request: PendingConsent | null },
            void
        >({
            query: () => '/api/mobile/consent/pending',
            providesTags: ['Consent'],
        }),
        decideConsent: builder.mutation<
            { status: string; decided_at: string },
            { id: number; allow: boolean }
        >({
            query: ({ id, allow }) => ({
                url: `/api/mobile/consent/${id}/decide`,
                method: 'POST',
                body: { allow },
            }),
            invalidatesTags: ['Consent', 'AuthEvent'],
        }),
        getDevices: builder.query<{ devices: WalletDevice[] }, void>({
            query: () => '/api/mobile/devices',
            providesTags: ['Device'],
        }),
        removeDevice: builder.mutation<
            { removed: boolean; current: boolean },
            number
        >({
            query: (id) => ({
                url: `/api/mobile/devices/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Device'],
        }),
        reportLost: builder.mutation<{ state: string }, void>({
            query: () => ({ url: '/api/mobile/report-lost', method: 'POST' }),
            invalidatesTags: ['Identity', 'Timeline', 'Notification'],
        }),
        unlink: builder.mutation<{ revoked: boolean }, void>({
            query: () => ({ url: '/api/mobile/unlink', method: 'POST' }),
        }),
        // Demo control (D6 fallback): the wallet asks itself for consent so
        // the Allow/Deny story can be rehearsed without a second window. It
        // hits the same public verifier endpoint the /verify/online page uses.
        simulateConsent: builder.mutation<
            { id: number; status: string; expires_at: string },
            {
                query: string;
                verifier_name: string;
                purpose: string;
                fields: string;
            }
        >({
            query: (body) => ({
                url: '/verify/online/consent',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['Consent'],
        }),
    }),
});

export const {
    useGetWalletIdentityQuery,
    useGetQrSvgQuery,
    useGetTimelineQuery,
    useGetActivityQuery,
    useGetPendingConsentQuery,
    useDecideConsentMutation,
    useGetDevicesQuery,
    useRemoveDeviceMutation,
    useReportLostMutation,
    useUnlinkMutation,
    useSimulateConsentMutation,
} = api;
