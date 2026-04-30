export const authHeaders = (): Record<string, string> => {
    const token = localStorage.getItem("admin_token");
    return {
        "Content-Type": "application/json",  // ← ADD THIS
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
};

export const getAdminUser = (): {
    userId: number;
    name: string;
    email: string;
    username: string;
    role: string; // ✅ add role
} | null => {
    const raw = localStorage.getItem("admin_user");
    if (!raw) return null;
    try {
        return JSON.parse(raw);
    } catch {
        return null;
    }
};

// ✅ Shared logout — clears storage and redirects
export const logout = () => {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_user");
    window.location.replace("/admin/login");
};