const BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

/**
 * Converts any file URL to a displayable URL.
 * Handles both old GCS URLs and new local /uploads/ URLs.
 */
export function resolveFileUrl(url: string | null | undefined): string {
    if (!url) return "";

    // Already a full URL (GCS or external) — return as is
    if (url.startsWith("http://") || url.startsWith("https://")) {
        return url;
    }

    // Local relative path — prepend base URL
    if (url.startsWith("/uploads/")) {
        return `${BASE_URL}${url}`;
    }

    return url;
}