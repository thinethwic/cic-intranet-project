export const authHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("admin_token") ?? ""}`,
});

export const getAdminUser = (): { userId: number; name: string; email: string; username: string } | null => {
    const raw = localStorage.getItem("admin_user");
    if (!raw) return null;
    try {
        return JSON.parse(raw);
    } catch {
        return null;
    }
};