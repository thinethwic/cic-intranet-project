import type { Ticket, TicketStatus, TicketCategory, TicketPriority } from "@/types";
import { apiFetch } from "./apiFetch";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

// ─── Shared types ─────────────────────────────────────────────────────────────

export interface CreateTicketPayload {
    title: string;
    description: string;
    category: TicketCategory;
    priority: TicketPriority;
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
    ticketId: number;
    message: string;
    commentedById: number;
    commentedByName: string;
    isInternal: boolean;
    createdAt: string;
}

export interface CommentPayload {
    message: string;
    isInternal?: boolean;
}

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

export const getAllTickets = async (page = 0, size = 20): Promise<Ticket[]> => {
    const response = await apiFetch(
        `${BASE_URL}/api/admin/tickets?page=${page}&size=${size}&sort=createdAt,desc`
    );
    if (!response.ok) throw new Error("Failed to fetch all tickets");
    const data = await response.json();
    return Array.isArray(data) ? data : (data.content ?? []);
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

export const adminUpdateTicket = async (
    ticketId: number,
    payload: UpdateTicketPayload
): Promise<Ticket> => {
    const response = await apiFetch(`${BASE_URL}/api/admin/tickets/${ticketId}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error("Failed to update ticket");
    return response.json();
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
