import type { Event } from "@/types";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
const API = `${BASE_URL}/api/v1`;

export const getAllEvents = async (page = 0, size = 100): Promise<Event[]> => {
    const response = await fetch(`${API}/events?page=${page}&size=${size}`);
    if (!response.ok) throw new Error("Failed to fetch events");
    const data = await response.json();
    return data?.content ?? [];
};


export const getEventById = async (id: number): Promise<Event> => {
    const response = await fetch(`${API}/events/${id}`);
    if (!response.ok) throw new Error("Failed to fetch event");
    return response.json();
};

export const createEvent = async (formData: FormData): Promise<Event> => {
    const response = await fetch(`${API}/events`, {
        method: "POST",
        body: formData,         // ✅ multipart
    });
    if (!response.ok) throw new Error("Failed to create event");
    return response.json();
};

export const updateEvent = async (id: number, formData: FormData): Promise<Event> => {
    const response = await fetch(`${API}/events/${id}`, {
        method: "PUT",
        body: formData,         // ✅ multipart
    });
    if (!response.ok) throw new Error("Failed to update event");
    return response.json();
};

export const deleteEvent = async (id: number): Promise<void> => {
    const response = await fetch(`${API}/events/${id}`, {
        method: "DELETE",
    });
    if (!response.ok) throw new Error("Failed to delete event");
};