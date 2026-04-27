import type { Document } from "@/types";
import { authHeaders } from "./authHeaders";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
const API = `${BASE_URL}/api/v1`;

const bearerHeader = () => ({
    Authorization: `Bearer ${localStorage.getItem("admin_token") ?? ""}`,
});

export const getAllDocuments = async (page = 0, size = 100): Promise<Document[]> => {
    const response = await fetch(`${API}/documents?page=${page}&size=${size}`);
    if (!response.ok) throw new Error("Failed to fetch documents");
    const data = await response.json();
    return data.content;
};

export const getDocumentById = async (id: number): Promise<Document> => {
    const response = await fetch(`${API}/documents/${id}`);
    if (!response.ok) throw new Error("Failed to fetch document");
    return response.json();
};

export const createDocument = async (formData: FormData): Promise<Document> => {
    const response = await fetch(`${API}/documents`, {
        method: "POST",
        headers: bearerHeader(), // ✅ no Content-Type for multipart
        body: formData,
    });
    if (!response.ok) throw new Error("Failed to create document");
    return response.json();
};

export const updateDocument = async (id: number, documentDTO: Partial<Document>): Promise<Document> => {
    const response = await fetch(`${API}/documents/${id}`, {
        method: "PUT",
        headers: authHeaders(), // ✅ added auth
        body: JSON.stringify(documentDTO),
    });
    if (!response.ok) throw new Error("Failed to update document");
    return response.json();
};

export const deleteDocument = async (id: number): Promise<void> => {
    const response = await fetch(`${API}/documents/${id}`, {
        method: "DELETE",
        headers: authHeaders(), // ✅ added auth
    });
    if (!response.ok) throw new Error("Failed to delete document");
};

export const viewDocument = async (id: number): Promise<Blob> => {
    const response = await fetch(`${API}/documents/${id}/view`, {
        headers: bearerHeader(), // ✅ added auth (no Content-Type for blob)
    });
    if (!response.ok) throw new Error("Failed to view document");
    return response.blob();
};

export const downloadDocument = async (id: number): Promise<Blob> => {
    const response = await fetch(`${API}/documents/${id}/download`, {
        headers: bearerHeader(), // ✅ added auth (no Content-Type for blob)
    });
    if (!response.ok) throw new Error("Failed to download document");
    return response.blob();
};