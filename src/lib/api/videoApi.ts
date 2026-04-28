// src/lib/api/videoApi.ts

import type { video } from "@/types";
import { apiFetch } from "./apiFetch";
import { getAdminUser } from "./authHeaders";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
const API = `${BASE_URL}/api/v1`;

export const getAllVideos = async (page = 0, size = 100): Promise<video[]> => {
    const res = await apiFetch(`${API}/videos?page=${page}&size=${size}&sort=createdAt,desc`, {
        headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) throw new Error("Failed to fetch videos");
    const data = await res.json();
    return (data.content as video[]).sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
};

export const getVideoById = async (id: number): Promise<video> => {
    const res = await apiFetch(`${API}/videos/${id}`, {
        headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) throw new Error("Failed to fetch video");
    return res.json();
};

export const createVideo = async (videoDTO: Partial<video>): Promise<video> => {
    const adminUser = getAdminUser();
    const res = await apiFetch(`${API}/videos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...videoDTO, userId: adminUser?.userId ?? null }),
    });
    if (!res.ok) throw new Error("Failed to create video");
    return res.json();
};

export const updateVideo = async (id: number, videoDTO: Partial<video>): Promise<video> => {
    const adminUser = getAdminUser();
    const res = await apiFetch(`${API}/videos/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...videoDTO, userId: adminUser?.userId ?? null }),
    });
    if (!res.ok) throw new Error("Failed to update video");
    return res.json();
};

export const deleteVideo = async (id: number): Promise<void> => {
    const res = await apiFetch(`${API}/videos/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Failed to delete video");
};