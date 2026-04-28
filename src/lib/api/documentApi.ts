// src/lib/api/documentApi.ts

import type { Document } from "@/types";
import { apiFetch } from "./apiFetch";
import { authHeaders } from "./authHeaders";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
const API = `${BASE_URL}/api/v1`;

export interface DocumentAccessLog {
    id: number;
    action: "VIEW" | "DOWNLOAD";
    accessedAt: string;
    ipAddress: string;
    user: {
        id: number;
        name: string;
        username: string;
        email: string;
    };
    document: {
        id: number;
        title: string;
    };
}

export const getDocumentLogs = async (
    documentId: number,
    page = 0,
    size = 50
): Promise<{ content: DocumentAccessLog[]; totalElements: number }> => {
    const response = await fetch(
        `${API}/documents/${documentId}/logs?page=${page}&size=${size}`,
        { headers: authHeaders() }
    );
    if (!response.ok) throw new Error("Failed to fetch document logs");
    return response.json();
};



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

// ✅ Use whichever token is available — admin or authorized user
const getToken = () =>
    localStorage.getItem("admin_token") ||
    localStorage.getItem("authorized_token") ||
    "";

export const viewDocument = async (id: number): Promise<Blob> => {
    const response = await fetch(`${API}/documents/${id}/view`, {
        headers: { Authorization: `Bearer ${getToken()}` },
    });
    if (!response.ok) throw new Error("Failed to view document");
    return response.blob();
};

export const downloadDocument = async (id: number): Promise<Blob> => {
    const response = await fetch(`${API}/documents/${id}/download`, {
        headers: { Authorization: `Bearer ${getToken()}` },
    });
    if (!response.ok) throw new Error("Failed to download document");
    return response.blob();
};