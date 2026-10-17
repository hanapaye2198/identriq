export function xsrfCookie(): string {
    const match = document.cookie.match(/(?:^|;\s*)XSRF-TOKEN=([^;]+)/);

    if (!match) return '';

    try {
        return decodeURIComponent(match[1]);
    } catch {
        return match[1];
    }
}

export function csrfToken(): string {
    return (
        document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')
            ?.content ?? ''
    );
}

export function jsonHeaders(
    extra: Record<string, string> = {},
): Record<string, string> {
    const token = csrfToken();
    const xsrf = xsrfCookie();

    return {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        // The meta token is the plain session token; the cookie is the
        // encrypted variant Laravel decrypts from X-XSRF-TOKEN. Send whichever
        // exists — pages without the meta tag still work via the cookie.
        ...(token ? { 'X-CSRF-TOKEN': token } : {}),
        ...(xsrf ? { 'X-XSRF-TOKEN': xsrf } : {}),
        ...extra,
    };
}
