import type { Member } from "@/types";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8081";

export const getAllMembers = async (page = 0, size = 100): Promise<Member[]> => {
    const response = await fetch(`${BASE_URL}/api/v1/members?page=${page}&size=${size}`);
    if (!response.ok) throw new Error("Failed to fetch members");
    const data = await response.json();
    return data.content;
};

export const getMemberById = async (id: number): Promise<Member> => {
    const response = await fetch(`${BASE_URL}/api/v1/members/${id}`);
    if (!response.ok) throw new Error("Failed to fetch member");
    return response.json();
};

export const createMember = async (memberDTO: Partial<Member>): Promise<Member> => {
    const response = await fetch(`${BASE_URL}/api/v1/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(memberDTO),
    });
    if (!response.ok) throw new Error("Failed to create member");
    return response.json();
};

export const updateMember = async (id: number, memberDTO: Partial<Member>): Promise<Member> => {
    const response = await fetch(`${BASE_URL}/api/v1/members/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(memberDTO),
    });
    if (!response.ok) throw new Error("Failed to update member");
    return response.json();
};

export const deleteMember = async (id: number): Promise<void> => {
    const response = await fetch(`${BASE_URL}/api/v1/members/${id}`, {
        method: "DELETE",
    });
    if (!response.ok) throw new Error("Failed to delete member");
};