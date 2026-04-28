// src/lib/api/memberApi.ts

import type { Member } from "@/types";
import { apiFetch } from "./apiFetch";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
const API = `${BASE_URL}/api/v1`;

export const getAllMembers = async (page = 0, size = 100): Promise<Member[]> => {
    const res = await apiFetch(`${API}/members?page=${page}&size=${size}`);
    if (!res.ok) throw new Error("Failed to fetch members");
    const data = await res.json();
    return data.content;
};

export const getMemberById = async (id: number): Promise<Member> => {
    const res = await apiFetch(`${API}/members/${id}`);
    if (!res.ok) throw new Error("Failed to fetch member");
    return res.json();
};

export const createMember = async (memberDTO: Partial<Member>): Promise<Member> => {
    const res = await apiFetch(`${API}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(memberDTO),
    });
    if (!res.ok) throw new Error("Failed to create member");
    return res.json();
};

export const updateMember = async (id: number, memberDTO: Partial<Member>): Promise<Member> => {
    const res = await apiFetch(`${API}/members/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(memberDTO),
    });
    if (!res.ok) throw new Error("Failed to update member");
    return res.json();
};

export const deleteMember = async (id: number): Promise<void> => {
    const res = await apiFetch(`${API}/members/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Failed to delete member");
};