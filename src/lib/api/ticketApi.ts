import type { Ticket, TicketStatus, TicketPriority } from "@/types";
import { apiFetch } from "./apiFetch";
import { authHeaders, getAdminUser } from "./authHeaders";
import {
    buildApiError,
    normalizePageResponse,
    parseJsonSafely,
    type PageResponse,
} from "./apiUtils";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

// ─── Shared types ─────────────────────────────────────────────────────────────

export interface CreateTicketPayload {
    title: string;
    description: string;
    category: string;
    priority: TicketPriority;
    segment: string,
    department: string | null;
    attachments: string | null;
}

export interface UpdateTicketPayload {
    title?: string;
    description?: string;
    category?: TicketCategory;
    priority?: TicketPriority;
    status?: TicketStatus;
}

export interface Comment {
    id: number;
    message: string;
    commentedBy: {
        id: number;
        name: string;
        role: "SUPER_ADMIN" | "ADMIN" | "AUTHORIZED" | "SERVICE";
    };
    isInternal: boolean;
    createdAt: string;
}

export interface CommentPayload {
    message: string;
    isInternal?: boolean;
}

export interface AdminUser {
    id: number;
    name: string;
    email: string;
    username: string;
    role: "SUPER_ADMIN" | "ADMIN" | "AUTHORIZED";
    active: boolean;
    segment?: string;
}

export const getAdminUsers = async (): Promise<AdminUser[]> => {
    const res = await apiFetch(`${BASE_URL}/api/v1/users?page=0&size=100`, {
        headers: authHeaders(),
    });
    if (!res.ok) throw new Error("Failed to fetch admin users");
    const data = await res.json();
    // Only return active users so you don't assign to inactive accounts
    return (data.content ?? []).filter((u: AdminUser) => u.active);
};

export const getAdminUsersPage = async (
    page = 0,
    size = 8
): Promise<PageResponse<AdminUser>> => {
    const res = await apiFetch(`${BASE_URL}/api/v1/users?page=${page}&size=${size}`, {
        headers: authHeaders(),
    });
    const data = await parseJsonSafely<unknown>(res);
    if (!res.ok) throw buildApiError(res, data, "Failed to fetch users");
    return normalizePageResponse<AdminUser>(data, page, size);
};

// ─── Employee endpoints ───────────────────────────────────────────────────────

export const createTicket = async (payload: CreateTicketPayload): Promise<Ticket> => {
    const response = await apiFetch(`${BASE_URL}/api/tickets`, {
        method: "POST",
        body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error("Failed to create ticket");
    return response.json();
};

export const getMyTickets = async (page = 0, size = 20): Promise<Ticket[]> => {
    const response = await apiFetch(
        `${BASE_URL}/api/tickets/my?page=${page}&size=${size}&sort=createdAt,desc`
    );
    if (!response.ok) throw new Error("Failed to fetch tickets");
    const data = await response.json();
    return Array.isArray(data) ? data : (data.content ?? []);
};

export const getTicketById = async (id: number): Promise<Ticket> => {
    const response = await apiFetch(`${BASE_URL}/api/tickets/${id}`);
    if (!response.ok) throw new Error("Failed to fetch ticket");
    return response.json();
};

export const updateMyTicket = async (
    id: number,
    payload: UpdateTicketPayload
): Promise<Ticket> => {
    const response = await apiFetch(`${BASE_URL}/api/tickets/${id}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error("Failed to update ticket");
    return response.json();
};

export const deleteMyTicket = async (id: number): Promise<void> => {
    const response = await apiFetch(`${BASE_URL}/api/tickets/${id}`, {
        method: "DELETE",
    });
    if (!response.ok) throw new Error("Failed to delete ticket");
};

export const addComment = async (
    ticketId: number,
    payload: CommentPayload
): Promise<Comment> => {
    const response = await apiFetch(`${BASE_URL}/api/tickets/${ticketId}/comments`, {
        method: "POST",
        body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error("Failed to add comment");
    return response.json();
};

export const getComments = async (
    ticketId: number,
    page = 0,
    size = 50
): Promise<Comment[]> => {
    const response = await apiFetch(
        `${BASE_URL}/api/tickets/${ticketId}/comments?page=${page}&size=${size}&sort=createdAt,asc`
    );
    if (!response.ok) throw new Error("Failed to fetch comments");
    const data = await response.json();
    return Array.isArray(data) ? data : (data.content ?? []);
};

// ─── Admin endpoints ──────────────────────────────────────────────────────────

export const getAllTickets = async (): Promise<Ticket[]> => {
    const user = getAdminUser();
    const isAdmin = user?.role === "ADMIN";

    const url = isAdmin
        ? `${BASE_URL}/api/admin/tickets/my-segment?page=0&size=100`
        : `${BASE_URL}/api/admin/tickets?page=0&size=100`;

    const res = await apiFetch(url, { headers: authHeaders() });
    if (!res.ok) throw new Error("Failed to fetch tickets");
    const data = await res.json();
    return data.content ?? [];
};

export const getTicketsPage = async (
    page = 0,
    size = 10
): Promise<PageResponse<Ticket>> => {
    const user = getAdminUser();
    const isAdmin = user?.role === "ADMIN";

    const url = isAdmin
        ? `${BASE_URL}/api/admin/tickets/my-segment?page=${page}&size=${size}`
        : `${BASE_URL}/api/admin/tickets?page=${page}&size=${size}`;

    const res = await apiFetch(url, { headers: authHeaders() });
    const data = await parseJsonSafely<unknown>(res);
    if (!res.ok) throw buildApiError(res, data, "Failed to fetch tickets");
    return normalizePageResponse<Ticket>(data, page, size);
};

export const getTicketsByStatus = async (
    status: TicketStatus,
    page = 0,
    size = 20
): Promise<Ticket[]> => {
    const response = await apiFetch(
        `${BASE_URL}/api/admin/tickets/status/${status}?page=${page}&size=${size}`
    );
    if (!response.ok) throw new Error("Failed to fetch tickets by status");
    const data = await response.json();
    return Array.isArray(data) ? data : (data.content ?? []);
};

export const getTicketsByCategory = async (
    category: TicketCategory,
    page = 0,
    size = 20
): Promise<Ticket[]> => {
    const response = await apiFetch(
        `${BASE_URL}/api/admin/tickets/category/${category}?page=${page}&size=${size}`
    );
    if (!response.ok) throw new Error("Failed to fetch tickets by category");
    const data = await response.json();
    return Array.isArray(data) ? data : (data.content ?? []);
};

export const updateTicketStatus = async (
    ticketId: number,
    status: TicketStatus
): Promise<Ticket> => {
    const response = await apiFetch(
        `${BASE_URL}/api/admin/tickets/${ticketId}/status?status=${status}`,
        { method: "PATCH" }
    );
    if (!response.ok) throw new Error("Failed to update ticket status");
    return response.json();
};

export const assignTicket = async (
    ticketId: number,
    userId: number
): Promise<Ticket> => {
    const response = await apiFetch(
        `${BASE_URL}/api/admin/tickets/${ticketId}/assign/${userId}`,
        { method: "PATCH" }
    );
    if (!response.ok) throw new Error("Failed to assign ticket");
    return response.json();
};

export const adminUpdateTicket = async (ticketId: number, data: any) => {
    // Reshape assignedToId → assignedTo object that Spring expects
    const { assignedToId, ...rest } = data;

    const payload = {
        ...rest,
        ...(assignedToId !== undefined && {
            assignedTo: assignedToId ? { id: assignedToId } : null,
        }),
    };

    const res = await fetch(
        `${BASE_URL}/api/admin/tickets/${ticketId}`,
        {
            method: "PATCH",
            headers: {
                ...authHeaders(),
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        },
    );

    if (!res.ok) throw new Error("Failed to update ticket");
    return res.json();
};

export const adminDeleteTicket = async (ticketId: number): Promise<void> => {
    const response = await apiFetch(`${BASE_URL}/api/admin/tickets/${ticketId}`, {
        method: "DELETE",
    });
    if (!response.ok) throw new Error("Failed to delete ticket");
};

export const adminAddComment = async (
    ticketId: number,
    payload: CommentPayload
): Promise<Comment> => {
    const response = await apiFetch(
        `${BASE_URL}/api/admin/tickets/${ticketId}/comments`,
        {
            method: "POST",
            body: JSON.stringify(payload),
        }
    );
    if (!response.ok) throw new Error("Failed to add comment");
    return response.json();
};

export const adminGetComments = async (
    ticketId: number,
    page = 0,
    size = 50
): Promise<Comment[]> => {
    const response = await apiFetch(
        `${BASE_URL}/api/admin/tickets/${ticketId}/comments?page=${page}&size=${size}&sort=createdAt,asc`
    );
    if (!response.ok) throw new Error("Failed to fetch comments");
    const data = await response.json();
    return Array.isArray(data) ? data : (data.content ?? []);
};

export interface TicketCategory {
    id: number;
    name: string;
    cat_code: string;
    segment: string | null;
    department: string | null;
    active: boolean;
}

// For employees — filtered
export async function getCategories(
    segment: string,
    department?: string | null
): Promise<TicketCategory[]> {
    const params = new URLSearchParams({ segment });
    if (department) params.set("department", department);

    const res = await apiFetch(
        `${BASE_URL}/api/v1/public/ticket-categories?${params}`,
        { headers: authHeaders() }
    );
    if (!res.ok) throw new Error("Failed to fetch categories");
    return res.json();
}

// For admin — all categories
export async function adminGetCategories(): Promise<TicketCategory[]> {
    const res = await apiFetch(`${BASE_URL}/api/v1/admin/ticket-categories`, {
        headers: authHeaders(),
    });
    if (!res.ok) throw new Error("Failed to fetch categories");
    return res.json();
}

export async function adminCreateCategory(
    data: Omit<TicketCategory, "id" | "active">
): Promise<TicketCategory> {
    const res = await apiFetch(`${BASE_URL}/api/v1/admin/ticket-categories`, {
        method: "POST",
        headers: { ...authHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to create category");
    return res.json();
}

export async function adminUpdateCategory(
    id: number,
    data: Partial<TicketCategory>
): Promise<TicketCategory> {
    const res = await apiFetch(`${BASE_URL}/api/v1/admin/ticket-categories/${id}`, {
        method: "PUT",
        headers: { ...authHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Failed to update category");
    return res.json();
}

export async function adminDeleteCategory(id: number): Promise<void> {
    const res = await apiFetch(`${BASE_URL}/api/v1/admin/ticket-categories/${id}`, {
        method: "DELETE",
        headers: authHeaders(),
    });
    if (!res.ok) throw new Error("Failed to delete category");
}
