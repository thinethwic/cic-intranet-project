import { useMemo } from "react";

export type UserRole = "ADMIN" | "SERVICE" | "AUTHORIZED";

export interface CurrentUser {
    userId: number;
    name: string;
    email: string;
    username: string;
    role: UserRole | null;
    department: string | null;
    segment: string | null;
    isAdmin: boolean;
    isService: boolean;
    isUser: boolean;
}

export const useCurrentUser = (): CurrentUser | null => {
    const token = localStorage.getItem("admin_token");

    return useMemo(() => {
        if (!token) return null;
        try {
            const payload = JSON.parse(atob(token.split(".")[1]));
            const role = payload.role ?? payload.roles?.[0] ?? null;
            return {
                userId: payload.userId,
                name: payload.name,
                email: payload.email,
                username: payload.sub,
                role,
                department: payload.department ?? null, // ← add this
                segment: payload.location ?? null, // ← add this
                isAdmin: role === "ADMIN",
                isService: role === "SERVICE",
                isUser: role === "AUTHORIZED",
            };
        } catch {
            return null;
        }
    }, [token]);
};