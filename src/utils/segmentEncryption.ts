const SALT = "cic_intranet_2024"; // change this to your own secret

// Encode: segment → encrypted URL-safe string
export const encryptSegment = (segment: string): string => {
    const salted = `${SALT}:${segment}`;
    return btoa(salted)
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");
};

// Decode: encrypted string → segment (returns null if invalid)
export const decryptSegment = (encrypted: string): string | null => {
    try {
        const padded = encrypted
            .replace(/-/g, "+")
            .replace(/_/g, "/")
            .padEnd(encrypted.length + ((4 - (encrypted.length % 4)) % 4), "=");
        const decoded = atob(padded);
        if (!decoded.startsWith(`${SALT}:`)) return null;
        return decoded.slice(SALT.length + 1);
    } catch {
        return null;
    }
};