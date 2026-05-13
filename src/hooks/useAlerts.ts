import { useState, useEffect, useCallback } from "react";
import type { Alert } from "@/types";
import {
    getAllAlerts,
    getAlertById,
    createAlert,
    updateAlert,
    updateAlertFlyer,
    deleteAlert,
    getAllAlertsAdmin,
} from "@/lib/api/alertApi";

interface UseAlertsReturn {
    alerts: Alert[];
    loading: boolean;
    error: string | null;
    refresh: () => void;
    fetchById: (id: number) => Promise<Alert | null>;
    create: (dto: Partial<Alert>, flyer?: File) => Promise<Alert | null>;
    update: (id: number, dto: Partial<Alert>) => Promise<Alert | null>;
    updateFlyer: (id: number, flyer: File) => Promise<Alert | null>;
    remove: (id: number) => Promise<boolean>;
}

export const useAlerts = (page = 0, size = 100, adminMode = false): UseAlertsReturn => {
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchAlerts = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = adminMode
                ? await getAllAlertsAdmin(page, size)
                : await getAllAlerts(page, size);
            setAlerts(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to fetch alerts");
        } finally {
            setLoading(false);
        }
    }, [page, size, adminMode]);

    useEffect(() => {
        fetchAlerts();
    }, [fetchAlerts]);

    const fetchById = async (id: number): Promise<Alert | null> => {
        try {
            return await getAlertById(id);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to fetch alert");
            return null;
        }
    };

    const create = async (dto: Partial<Alert>, flyer?: File): Promise<Alert | null> => {
        try {
            const created = await createAlert(dto, flyer);
            setAlerts((prev) => [created, ...prev]);
            return created;
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to create alert");
            return null;
        }
    };

    const update = async (id: number, dto: Partial<Alert>): Promise<Alert | null> => {
        try {
            const updated = await updateAlert(id, dto);
            setAlerts((prev) => prev.map((a) => (Number(a.id) === id ? updated : a)));
            return updated;
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to update alert");
            return null;
        }
    };

    const updateFlyer = async (id: number, flyer: File): Promise<Alert | null> => {
        try {
            const updated = await updateAlertFlyer(id, flyer);
            setAlerts((prev) => prev.map((a) => (Number(a.id) === id ? updated : a)));
            return updated;
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to update flyer");
            return null;
        }
    };

    const remove = async (id: number): Promise<boolean> => {
        try {
            await deleteAlert(id);
            setAlerts((prev) => prev.filter((a) => Number(a.id) !== id));
            return true;
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to delete alert");
            return false;
        }
    };

    return { alerts, loading, error, refresh: fetchAlerts, fetchById, create, update, updateFlyer, remove };
};