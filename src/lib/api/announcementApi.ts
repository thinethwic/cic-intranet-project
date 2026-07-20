import type { Announcement } from "@/types";
import { apiFetch } from "./apiFetch";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API = `${BASE_URL}/api/v1`;

// announcementApi.ts
export const getAllAnnouncements = async (page = 0, size = 100): Promise<Announcement[]> => {
    const response = await apiFetch(`${API}/announcements?page=${page}&size=${size}`);
    if (!response.ok) throw new Error("Failed to fetch announcements");
    const data = await response.json();

    // ✅ Handle both paginated and non-paginated responses
    return Array.isArray(data) ? data : (data.content ?? []);
};

export const getAnnouncementById = async (id: number): Promise<Announcement> => {
    const response = await apiFetch(`${API}/announcements/${id}`);
    if (!response.ok) throw new Error("Failed to fetch announcement");
    return response.json();
};

export const createAnnouncement = async (formData: FormData): Promise<Announcement> => {
    const response = await apiFetch(`${API}/announcements`, {
        method: "POST",
        body: formData,
    });
    if (!response.ok) throw new Error("Failed to create announcement");
    return response.json();
};

export const updateAnnouncement = async (id: number, formData: FormData): Promise<Announcement> => {
    const response = await apiFetch(`${API}/announcements/${id}`, {
        method: "PUT",
        body: formData,
    });
    if (!response.ok) throw new Error("Failed to update announcement");
    return response.json();
};

export const deleteAnnouncement = async (id: number): Promise<void> => {
    const response = await apiFetch(`${API}/announcements/${id}`, {
        method: "DELETE",
    });
    if (!response.ok) throw new Error("Failed to delete announcement");
};

export const markAnnouncementAsRead = async (id: number) => {
    const res = await apiFetch(`${API}/announcements/${id}/read`, {
        method: "PATCH",
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
};
