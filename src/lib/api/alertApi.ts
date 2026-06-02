import type { Alert } from "@/types";
import { getAdminUser } from "./authHeaders";
import { apiFetch } from "./apiFetch";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

function normalize(raw: any): Alert {
    return {
        ...raw,
        severity: (raw.alertSeverity ?? raw.severity ?? "info").toLowerCase(),
    };
}

export const getAllAlerts = async (page = 0, size = 100): Promise<Alert[]> => {
    const response = await apiFetch(
        `${BASE_URL}/api/v1/alerts?page=${page}&size=${size}`
    );
    if (!response.ok) throw new Error("Failed to fetch alerts");
    const data = await response.json();
    const raw = Array.isArray(data) ? data : (data.content ?? []);
    return raw.map(normalize);
};

export const getAlertById = async (id: number): Promise<Alert> => {
    const response = await apiFetch(`${BASE_URL}/api/v1/alerts/${id}`);
    if (!response.ok) throw new Error("Failed to fetch alert");
    return normalize(await response.json());
};

export const getAllAlertsAdmin = async (page = 0, size = 100): Promise<Alert[]> => {
    const response = await apiFetch(
        `${BASE_URL}/api/v1/alerts/all?page=${page}&size=${size}`
    );
    if (!response.ok) throw new Error("Failed to fetch alerts");
    const data = await response.json();
    const raw = Array.isArray(data) ? data : (data.content ?? []);
    return raw.map(normalize);
};

export const createAlert = async (
    dto: Partial<Alert>,
    flyer?: File,
): Promise<Alert> => {
    const adminUser = getAdminUser();

    const formData = new FormData();
    formData.append(
        "data",
        new Blob(
            [
                JSON.stringify({
                    title: dto.title,
                    body: dto.body,
                    alertSeverity: (dto.severity ?? "info").toUpperCase(),
                    date: dto.date || null,
                    href: dto.href || null,
                    userId: adminUser?.userId ?? null,
                }),
            ],
            { type: "application/json" },
        ),
    );

    if (flyer) formData.append("flyer", flyer);

    const response = await apiFetch(`${BASE_URL}/api/v1/alerts`, {
        method: "POST",
        body: formData,
        // no Content-Type — browser sets multipart boundary automatically
    });
    if (!response.ok) throw new Error("Failed to create alert");
    return normalize(await response.json());
};

export const updateAlert = async (
    id: number,
    dto: Partial<Alert>,
): Promise<Alert> => {
    const adminUser = getAdminUser();

    const response = await apiFetch(`${BASE_URL}/api/v1/alerts/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            title: dto.title,
            body: dto.body,
            alertSeverity: (dto.severity ?? "info").toUpperCase(),
            date: dto.date || null,
            href: dto.href || null,
            userId: adminUser?.userId ?? null,
        }),
    });
    if (!response.ok) throw new Error("Failed to update alert");
    return normalize(await response.json());
};

export const updateAlertFlyer = async (
    id: number,
    flyer: File,
): Promise<Alert> => {
    const formData = new FormData();
    formData.append("flyer", flyer);

    const response = await apiFetch(`${BASE_URL}/api/v1/alerts/${id}/flyer`, {
        method: "PUT",
        body: formData,
    });
    if (!response.ok) throw new Error("Failed to update alert flyer");
    return normalize(await response.json());
};

export const deleteAlert = async (id: number): Promise<void> => {
    const response = await apiFetch(`${BASE_URL}/api/v1/alerts/${id}`, {
        method: "DELETE",
    });
    if (!response.ok) throw new Error("Failed to delete alert");
};