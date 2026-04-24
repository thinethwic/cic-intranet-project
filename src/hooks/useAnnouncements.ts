import { useState, useEffect } from "react";
import type { Announcement } from "../types";
import { getAllAnnouncements } from "@/lib/api/announcementApi";

export const useAnnouncements = (segment?: string) => {
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchAnnouncements = async () => {
            try {
                setLoading(true);
                const data = await getAllAnnouncements();
                const filtered = segment
                    ? data.filter((a) => a.segment === segment)
                    : data;
                setAnnouncements(filtered);
            } catch (err) {
                setError("Failed to load announcements");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchAnnouncements();
    }, [segment]);

    return { announcements, loading, error };
};