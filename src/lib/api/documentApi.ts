// src/lib/api/documentApi.ts

import type { Document } from "@/types";
import { apiFetch } from "./apiFetch";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
const API = `${BASE_URL}/api/v1`;

export const getAllDocuments = async (page = 0, size = 100): Promise<Document[]> => {
    const res = await apiFetch(`${API}/documents?page=${page}&size=${size}`);
    if (!res.ok) throw new Error("Failed to fetch documents");
    const data = await res.json();
    return data.content;
};

export const getDocumentById = async (id: number): Promise<Document> => {
    const res = await apiFetch(`${API}/documents/${id}`);
    if (!res.ok) throw new Error("Failed to fetch document");
    return res.json();
};

export const createDocument = async (formData: FormData): Promise<Document> => {
    const res = await apiFetch(`${API}/documents`, {
        method: "POST",
        body: formData,
    });
    if (!res.ok) throw new Error("Failed to create document");
    return res.json();
};

export const updateDocument = async (id: number, documentDTO: Partial<Document>): Promise<Document> => {
    const res = await apiFetch(`${API}/documents/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(documentDTO),
    });
    if (!res.ok) throw new Error("Failed to update document");
    return res.json();
};

export const deleteDocument = async (id: number): Promise<void> => {
    const res = await apiFetch(`${API}/documents/${id}`, {
        method: "DELETE",
    });
    if (!res.ok) throw new Error("Failed to delete document");
};

export const viewDocument = async (id: number): Promise<Blob> => {
    const res = await apiFetch(`${API}/documents/${id}/view`);
    if (!res.ok) throw new Error("Failed to view document");
    return res.blob();
};

export const downloadDocument = async (id: number): Promise<Blob> => {
    const res = await apiFetch(`${API}/documents/${id}/download`);
    if (!res.ok) throw new Error("Failed to download document");
    return res.blob();
};