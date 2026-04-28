// src/lib/api/newsApi.ts

import type { News } from "@/types";
import { apiFetch } from "./apiFetch";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
const API = `${BASE_URL}/api/v1`;

export const getAllNews = async (page = 0, size = 100): Promise<News[]> => {
    const res = await apiFetch(`${API}/news?page=${page}&size=${size}`);
    if (!res.ok) throw new Error("Failed to fetch news");
    const data = await res.json();
    return data?.content ?? [];
};

export const getNewsById = async (id: number): Promise<News> => {
    const res = await apiFetch(`${API}/news/${id}`);
    if (!res.ok) throw new Error("Failed to fetch news");
    return res.json();
};

export const createNews = async (formData: FormData): Promise<News> => {
    const res = await apiFetch(`${API}/news`, {
        method: "POST",
        body: formData,
    });
    if (!res.ok) throw new Error("Failed to create news");
    return res.json();
};

export const updateNews = async (
    id: number,
    newsDTO: { title: string; description: string; content: string; category: string; isHot: boolean; authorId?: number | null }
): Promise<News> => {
    const res = await apiFetch(`${API}/news/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newsDTO),
    });
    if (!res.ok) throw new Error("Failed to update news");
    return res.json();
};

export const updateNewsImage = async (id: number, image: File): Promise<News> => {
    const formData = new FormData();
    formData.append("image", image);
    const res = await apiFetch(`${API}/news/${id}/image`, {
        method: "PUT",
        body: formData,
    });
    if (!res.ok) throw new Error("Failed to update news image");
    return res.json();
};

export const deleteNews = async (id: number): Promise<void> => {
    const res = await apiFetch(`${API}/news/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Failed to delete news");
};