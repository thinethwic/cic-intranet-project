import type { News } from "@/types";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

export const getAllNews = async (page = 0, size = 100): Promise<News[]> => {
    const response = await fetch(`${BASE_URL}/api/v1/news?page=${page}&size=${size}`);
    if (!response.ok) throw new Error("Failed to fetch news");
    const data = await response.json();
    return data.content;
};

export const getNewsById = async (id: number): Promise<News> => {
    const response = await fetch(`${BASE_URL}/api/v1/news/${id}`);
    if (!response.ok) throw new Error("Failed to fetch news");
    return response.json();
};

export const createNews = async (formData: FormData): Promise<News> => {
    const response = await fetch(`${BASE_URL}/api/v1/news`, {
        method: "POST",
        body: formData,         // multipart — image upload
    });
    if (!response.ok) throw new Error("Failed to create news");
    return response.json();
};

export const updateNews = async (id: number, formData: FormData): Promise<News> => {
    const response = await fetch(`${BASE_URL}/api/v1/news/${id}`, {
        method: "PUT",
        body: formData,
    });
    if (!response.ok) throw new Error("Failed to update news");
    return response.json();
};

export const deleteNews = async (id: number): Promise<void> => {
    const response = await fetch(`${BASE_URL}/api/v1/news/${id}`, {
        method: "DELETE",
    });
    if (!response.ok) throw new Error("Failed to delete news");
};