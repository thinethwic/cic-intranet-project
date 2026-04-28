const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

export interface AuthorizedUser {
    token: string;
    userId: number;
    name: string;
    email: string;
    username: string;
    role: string;
}

export const loginAuthorized = async (
    email: string,
    password: string
): Promise<AuthorizedUser> => {
    const response = await fetch(`${BASE_URL}/api/public/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
    });
    if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.message || "Invalid credentials");
    }
    return response.json();
};