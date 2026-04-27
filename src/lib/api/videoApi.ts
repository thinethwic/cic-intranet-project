import type { video } from "@/types";
import { getAdminUser } from "@/lib/api/authHeaders";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

const getAuthHeader = () => ({
    Authorization: `Bearer ${localStorage.getItem("admin_token") ?? ""}`,
    "Content-Type": "application/json",
});

export const getAllVideos = async (page = 0, size = 100): Promise<video[]> => {
    const response = await fetch(
        `${BASE_URL}/api/v1/videos?page=${page}&size=${size}&sort=createdAt,desc`,
        { headers: getAuthHeader() }
    );
    if (!response.ok) throw new Error("Failed to fetch videos");
    const data = await response.json();
    return (data.content as video[]).sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
};

export const getVideoById = async (id: number): Promise<video> => {
    const response = await fetch(`${BASE_URL}/api/v1/videos/${id}`, {
        headers: getAuthHeader(),
    });
    if (!response.ok) throw new Error("Failed to fetch video");
    return response.json();
};

export const createVideo = async (videoDTO: Partial<video>): Promise<video> => {
    const adminUser = getAdminUser();
    const response = await fetch(`${BASE_URL}/api/v1/videos`, {
        method: "POST",
        headers: getAuthHeader(),
        body: JSON.stringify({
            ...videoDTO,
            userId: adminUser?.userId ?? null,
        }),
    });
    if (!response.ok) throw new Error("Failed to create video");
    return response.json();
};

export const updateVideo = async (id: number, videoDTO: Partial<video>): Promise<video> => {
    const adminUser = getAdminUser();
    const response = await fetch(`${BASE_URL}/api/v1/videos/${id}`, {
        method: "PUT",
        headers: getAuthHeader(),
        body: JSON.stringify({
            ...videoDTO,
            userId: adminUser?.userId ?? null,
        }),
    });
    if (!response.ok) throw new Error("Failed to update video");
    return response.json();
};

export const deleteVideo = async (id: number): Promise<void> => {
    const response = await fetch(`${BASE_URL}/api/v1/videos/${id}`, {
        method: "DELETE",
        headers: getAuthHeader(),
    });
    if (!response.ok) throw new Error("Failed to delete video");
};