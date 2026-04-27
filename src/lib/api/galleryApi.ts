import type { Gallery } from "@/types";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
const API = `${BASE_URL}/api/v1`;

const getAuthHeader = () => ({
    Authorization: `Bearer ${localStorage.getItem("admin_token") ?? ""}`,
});

export const getAllGalleries = async (page = 0, size = 100): Promise<Gallery[]> => {
    const response = await fetch(`${API}/images?page=${page}&size=${size}`);
    if (!response.ok) throw new Error("Failed to fetch galleries");
    const data = await response.json();
    return data?.content ?? [];
};

export const getGalleryById = async (id: number): Promise<Gallery> => {
    const response = await fetch(`${API}/images/${id}`);
    if (!response.ok) throw new Error("Failed to fetch gallery");
    return response.json();
};

export const createGallery = async (formData: FormData): Promise<Gallery> => {
    const response = await fetch(`${API}/images`, {
        method: "POST",
        headers: { ...getAuthHeader() },    // ✅ auth
        body: formData,
    });
    if (!response.ok) throw new Error("Failed to create gallery");
    return response.json();
};

export const updateGallery = async (id: number, formData: FormData): Promise<Gallery> => {
    const response = await fetch(`${API}/images/${id}`, {
        method: "PUT",
        headers: { ...getAuthHeader() },    // ✅ auth
        body: formData,
    });
    if (!response.ok) throw new Error("Failed to update gallery");
    return response.json();
};

export const deleteGallery = async (id: number): Promise<void> => {
    const response = await fetch(`${API}/images/${id}`, {
        method: "DELETE",
        headers: { ...getAuthHeader() },    // ✅ auth
    });
    if (!response.ok) throw new Error("Failed to delete gallery");
};