import { SessionExpireError } from "./errors";

export default async function apiFetch(url, options ={}) {
    // Refresh recursion protection
    if (url.includes('/auth/refresh')) {
        throw new SessionExpireError();
    }

    const response = await fetch(url, {
        ...options,
        credentials: 'include',
    });

    if (response.status != 401) {
        return response;
    }

    // Try refresh
    const refreshResponse = await fetch('http://localhost:3000/auth/refresh', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
    });

    if (!refreshResponse.ok) {
        throw new SessionExpireError();
    }

    // Retry original request once
    const retryResponse = await fetch(url, {
        ...options,
        credentials: 'include',
    });

    return retryResponse;
}