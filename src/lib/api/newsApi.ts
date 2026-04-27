import type { News } from "@/types";
import { authHeaders } from "./authHeaders";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
const API = `${BASE_URL}/api/v1`;

const bearerHeader = () => ({
    Authorization: `Bearer ${localStorage.getItem("admin_token") ?? ""}`,
});

export const getAllNews = async (page = 0, size = 100): Promise<News[]> => {
    const response = await fetch(`${API}/news?page=${page}&size=${size}`);
    if (!response.ok) throw new Error("Failed to fetch news");
    const data = await response.json();
    return data?.content ?? [];
};

export const getNewsById = async (id: number): Promise<News> => {
    const response = await fetch(`${API}/news/${id}`);
    if (!response.ok) throw new Error("Failed to fetch news");
    return response.json();
};

export const createNews = async (formData: FormData): Promise<News> => {
    const response = await fetch(`${API}/news`, {
        method: "POST",
        headers: bearerHeader(), // ✅ no Content-Type for multipart
        body: formData,
    });
    if (!response.ok) throw new Error("Failed to create news");
    return response.json();
};

export const updateNews = async (
    id: number,
    newsDTO: { title: string; description: string; content: string; category: string; isHot: boolean; authorId?: number | null }
): Promise<News> => {
    const response = await fetch(`${API}/news/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("admin_token") ?? ""}`,
        },
        body: JSON.stringify(newsDTO),
    });
    if (!response.ok) throw new Error("Failed to update news");
    return response.json();
};

// ✅ Step 2 — image only (multipart), called separately
export const updateNewsImage = async (id: number, image: File): Promise<News> => {
    const token = localStorage.getItem("admin_token");
    console.log("updateNewsImage token:", token); // ✅ check this

    const formData = new FormData();
    formData.append("image", image);
    const response = await fetch(`${API}/news/${id}/image`, {
        method: "PUT",
        headers: {
            Authorization: `Bearer ${token ?? ""}`,
        },
        body: formData,
    });
    if (!response.ok) throw new Error("Failed to update news image");
    return response.json();
};

export const deleteNews = async (id: number): Promise<void> => {
    const response = await fetch(`${API}/news/${id}`, {
        method: "DELETE",
        headers: authHeaders(), // ✅
    });
    if (!response.ok) throw new Error("Failed to delete news");
};