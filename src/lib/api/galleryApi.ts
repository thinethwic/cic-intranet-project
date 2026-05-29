// src/lib/api/galleryApi.ts

import type { Gallery } from "@/types";
import { apiFetch } from "./apiFetch";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API = `${BASE_URL}/api/v1`;

export const getAllGalleries = async (page = 0, size = 100): Promise<Gallery[]> => {
    const res = await apiFetch(`${API}/images?page=${page}&size=${size}`);
    if (!res.ok) throw new Error("Failed to fetch galleries");
    const data = await res.json();
    return data?.content ?? [];
};

export const getGalleryById = async (id: number): Promise<Gallery> => {
    const res = await apiFetch(`${API}/images/${id}`);
    if (!res.ok) throw new Error("Failed to fetch gallery");
    return res.json();
};

export const createGallery = async (formData: FormData): Promise<Gallery> => {
    const res = await apiFetch(`${API}/images`, {
        method: "POST",
        body: formData,
    });
    if (!res.ok) throw new Error("Failed to create gallery");
    return res.json();
};

export const updateGallery = async (id: number, formData: FormData): Promise<Gallery> => {
    const res = await apiFetch(`${API}/images/${id}`, {
        method: "PUT",
        body: formData,
    });
    if (!res.ok) throw new Error("Failed to update gallery");
    return res.json();
};

export const deleteGallery = async (id: number): Promise<void> => {
    const res = await apiFetch(`${API}/images/${id}`, {
        method: "DELETE",
    });
    if (!res.ok) throw new Error("Failed to delete gallery");
};