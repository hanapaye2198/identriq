import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

function csrfToken(): string {
    return (
        document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')
            ?.content ?? ''
    );
}

export const api = createApi({
    reducerPath: 'api',
    baseQuery: fetchBaseQuery({
        baseUrl: '/',
        prepareHeaders: (headers) => {
            const token = csrfToken();
            if (token) headers.set('X-CSRF-TOKEN', token);
            headers.set('Accept', 'application/json');
            return headers;
        },
    }),
    tagTypes: ['Registrant', 'Appointment', 'Identity', 'Center', 'AuthEvent', 'Notification'],
    endpoints: () => ({}),
});
