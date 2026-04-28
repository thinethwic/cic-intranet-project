// src/lib/api/eventApi.ts

import type { Event } from "@/types";
import { apiFetch } from "./apiFetch";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
const API = `${BASE_URL}/api/v1`;

export const getAllEvents = async (page = 0, size = 100): Promise<Event[]> => {
    const res = await apiFetch(`${API}/events?page=${page}&size=${size}`);
    if (!res.ok) throw new Error("Failed to fetch events");
    const data = await res.json();
    return data?.content ?? [];
};

export const getEventById = async (id: number): Promise<Event> => {
    const res = await apiFetch(`${API}/events/${id}`);
    if (!res.ok) throw new Error("Failed to fetch event");
    return res.json();
};

export const createEvent = async (formData: FormData): Promise<Event> => {
    const res = await apiFetch(`${API}/events`, {
        method: "POST",
        body: formData,
    });
    if (!res.ok) throw new Error("Failed to create event");
    return res.json();
};

export const updateEvent = async (id: number, formData: FormData): Promise<Event> => {
    const res = await apiFetch(`${API}/events/${id}`, {
        method: "PUT",
        body: formData,
    });
    if (!res.ok) throw new Error("Failed to update event");
    return res.json();
};

export const deleteEvent = async (id: number): Promise<void> => {
    const res = await apiFetch(`${API}/events/${id}`, {
        method: "DELETE",
    });
    if (!res.ok) throw new Error("Failed to delete event");
};