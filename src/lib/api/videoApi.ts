import type { Video } from "@/types";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

export const getAllVideos = async (page = 0, size = 100): Promise<Video[]> => {
    const response = await fetch(`${BASE_URL}/api/v1/videos?page=${page}&size=${size}`);
    if (!response.ok) throw new Error("Failed to fetch videos");
    const data = await response.json();
    return data.content;
};

export const getVideoById = async (id: number): Promise<Video> => {
    const response = await fetch(`${BASE_URL}/api/v1/videos/${id}`);
    if (!response.ok) throw new Error("Failed to fetch video");
    return response.json();
};

export const createVideo = async (videoDTO: Partial<Video>): Promise<Video> => {
    const response = await fetch(`${BASE_URL}/api/v1/videos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(videoDTO),
    });
    if (!response.ok) throw new Error("Failed to create video");
    return response.json();
};

export const updateVideo = async (id: number, videoDTO: Partial<Video>): Promise<Video> => {
    const response = await fetch(`${BASE_URL}/api/v1/videos/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(videoDTO),
    });
    if (!response.ok) throw new Error("Failed to update video");
    return response.json();
};

export const deleteVideo = async (id: number): Promise<void> => {
    const response = await fetch(`${BASE_URL}/api/v1/videos/${id}`, {
        method: "DELETE",
    });
    if (!response.ok) throw new Error("Failed to delete video");
};