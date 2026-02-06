import { RefreshTokenExpiredError } from "./errors";

let refreshPromise = null;

export default async function apiFetch(url, options ={}) {
    // Refresh recursion protection
    if (url.includes('/auth/refresh')) {
        throw new Error('Refresh recursion stopped');
    }

    const response = await fetch(url, {
        ...options,
        credentials: 'include',
    });

    if (response.status !== 401) {
        return response;
    }

    // Single refresh in flight (Refresh Lock)
    if (!refreshPromise) {
        // Try refresh
        refreshPromise = fetch(
            `${API_BASE}/auth/refresh`,
            {
                method: 'POST',
                credentials: 'include',
            }
        )
            .then(res => {
                if (!res.ok) {
                    throw new RefreshTokenExpiredError();
                }
            })
            .finally(() => {
                refreshPromise = null;
            });
    }

    // Wait for the refresh to finish
    await refreshPromise;

    // Retry original request
    return apiFetch(url, options);
}