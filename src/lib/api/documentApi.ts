import type { Document } from "@/types";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

export const getAllDocuments = async (page = 0, size = 100): Promise<Document[]> => {
    const response = await fetch(`${BASE_URL}/api/v1/documents?page=${page}&size=${size}`);
    if (!response.ok) throw new Error("Failed to fetch documents");
    const data = await response.json();
    return data.content;
};

export const getDocumentById = async (id: number): Promise<Document> => {
    const response = await fetch(`${BASE_URL}/api/v1/documents/${id}`);
    if (!response.ok) throw new Error("Failed to fetch document");
    return response.json();
};

export const createDocument = async (formData: FormData): Promise<Document> => {
    const response = await fetch(`${BASE_URL}/api/v1/documents`, {
        method: "POST",
        body: formData,         // multipart — no Content-Type header needed
    });
    if (!response.ok) throw new Error("Failed to create document");
    return response.json();
};

export const updateDocument = async (id: number, documentDTO: Partial<Document>): Promise<Document> => {
    const response = await fetch(`${BASE_URL}/api/v1/documents/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(documentDTO),
    });
    if (!response.ok) throw new Error("Failed to update document");
    return response.json();
};

export const deleteDocument = async (id: number): Promise<void> => {
    const response = await fetch(`${BASE_URL}/documents/${id}`, {
        method: "DELETE",
    });
    if (!response.ok) throw new Error("Failed to delete document");
};

export const viewDocument = async (id: number): Promise<Blob> => {
    const response = await fetch(`${BASE_URL}/documents/${id}/view`);
    if (!response.ok) throw new Error("Failed to view document");
    return response.blob();
};

export const downloadDocument = async (id: number): Promise<Blob> => {
    const response = await fetch(`${BASE_URL}/documents/${id}/download`);
    if (!response.ok) throw new Error("Failed to download document");
    return response.blob();
};