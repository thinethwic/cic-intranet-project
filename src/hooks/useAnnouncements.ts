import { useState, useEffect } from "react";
import type { Announcement } from "../types";
import { getAllAnnouncements } from "@/lib/api/announcementApi";
import { getCached, setCached } from "@/lib/api/apiCache";

const TTL = 3 * 60 * 1000;

export const useAnnouncements = (segment?: string) => {
    const key = `announcements:${segment ?? "all"}`;
    const [announcements, setAnnouncements] = useState<Announcement[]>(() => getCached<Announcement[]>(key) ?? []);
    const [loading, setLoading] = useState(() => getCached<Announcement[]>(key) === null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const cacheKey = `announcements:${segment ?? "all"}`;
        const hit = getCached<Announcement[]>(cacheKey);
        if (hit) { setAnnouncements(hit); setLoading(false); return; }

        let cancelled = false;
        setLoading(true);
        setError(null);

        getAllAnnouncements().then((data) => {
            if (cancelled) return;
            const filtered = segment ? data.filter((a) => a.segment === segment) : data;
            setCached(cacheKey, filtered, TTL);
            setAnnouncements(filtered);
            setLoading(false);
        }).catch((err) => {
            if (cancelled) return;
            setError("Failed to load announcements");
            console.error(err);
            setLoading(false);
        });

        return () => { cancelled = true; };
    }, [segment]);

    return { announcements, loading, error };
};
