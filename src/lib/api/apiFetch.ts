// src/lib/api/apiFetch.ts

import { authHeaders, logout } from "./authHeaders";

export const apiFetch = async (
    url: string,
    options: RequestInit = {}
): Promise<Response> => {
    const response = await fetch(url, {
        ...options,
        headers: {
            ...authHeaders(),
            ...options.headers, // allow overrides
        },
    });

    if (response.status === 401) {
        logout(); // ✅ token expired → auto logout
        throw new Error("Session expired. Please log in again.");
    }

    return response;
};