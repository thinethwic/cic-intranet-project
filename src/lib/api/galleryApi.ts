import type { Gallery } from "@/types";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

export const getAllGalleries = async (page = 0, size = 100): Promise<Gallery[]> => {
    const response = await fetch(`${BASE_URL}/api/v1/images?page=${page}&size=${size}`);
    if (!response.ok) throw new Error("Failed to fetch galleries");
    const data = await response.json();
    return data.content;
};

export const getGalleryById = async (id: number): Promise<Gallery> => {
    const response = await fetch(`${BASE_URL}/api/v1/images/${id}`);
    if (!response.ok) throw new Error("Failed to fetch gallery");
    return response.json();
};

export const createGallery = async (formData: FormData): Promise<Gallery> => {
    const response = await fetch(`${BASE_URL}/api/v1/images`, {
        method: "POST",
        body: formData,         // multipart — image upload
    });
    if (!response.ok) throw new Error("Failed to create gallery");
    return response.json();
};

export const updateGallery = async (id: number, formData: FormData): Promise<Gallery> => {
    const response = await fetch(`${BASE_URL}/api/v1/images/${id}`, {
        method: "PUT",
        body: formData,
    });
    if (!response.ok) throw new Error("Failed to update gallery");
    return response.json();
};

export const deleteGallery = async (id: number): Promise<void> => {
    const response = await fetch(`${BASE_URL}/api/v1/images/${id}`, {
        method: "DELETE",
    });
    if (!response.ok) throw new Error("Failed to delete gallery");
};