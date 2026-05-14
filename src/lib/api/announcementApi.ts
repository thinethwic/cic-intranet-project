import type { Announcement } from "@/types";
import { authHeaders } from "./authHeaders";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

// announcementApi.ts
export const getAllAnnouncements = async (page = 0, size = 100): Promise<Announcement[]> => {
    const response = await fetch(`${BASE_URL}/api/v1/announcements?page=${page}&size=${size}`
    );
    if (!response.ok) throw new Error("Failed to fetch announcements");
    const data = await response.json();

    // ✅ Handle both paginated and non-paginated responses
    return Array.isArray(data) ? data : (data.content ?? []);
};
export const getAnnouncementById = async (id: number): Promise<Announcement> => {
    const response = await fetch(`${BASE_URL}/api/v1/announcements/${id}`, {
        headers: authHeaders()
    });
    if (!response.ok) throw new Error("Failed to fetch announcement");
    return response.json();
};

export const createAnnouncement = async (announcementDTO: Partial<Announcement>): Promise<Announcement> => {
    const response = await fetch(`${BASE_URL}/api/v1/announcements`, {
        method: "POST",
        headers: { ...authHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify(announcementDTO),
    });
    if (!response.ok) throw new Error("Failed to create announcement");
    return response.json();
};

export const updateAnnouncement = async (id: number, announcementDTO: Partial<Announcement>): Promise<Announcement> => {
    const response = await fetch(`${BASE_URL}/api/v1/announcements/${id}`, {
        method: "PUT",
        headers: { ...authHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify(announcementDTO),
    });
    if (!response.ok) throw new Error("Failed to update announcement");
    return response.json();
};

export const deleteAnnouncement = async (id: number): Promise<void> => {
    const response = await fetch(`${BASE_URL}/announcements/${id}`, {
        method: "DELETE",
        headers: authHeaders()
    });
    if (!response.ok) throw new Error("Failed to delete announcement");
};

export const markAnnouncementAsRead = async (id: number) => {
    const res = await fetch(`${BASE_URL}/api/v1/announcements/${id}/read`, {
        method: "PATCH",
        headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
};