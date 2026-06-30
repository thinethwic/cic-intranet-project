import { useState, useEffect } from "react";
import type { Event } from "../types";
import { getAllEvents } from "@/lib/api/eventApi";
import { getCached, setCached } from "@/lib/api/apiCache";

const TTL = 3 * 60 * 1000;

export const useEvents = (segment?: string) => {
    const key = `events:${segment ?? "all"}`;
    const [events, setEvents] = useState<Event[]>(() => getCached<Event[]>(key) ?? []);
    const [loading, setLoading] = useState(() => getCached<Event[]>(key) === null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const cacheKey = `events:${segment ?? "all"}`;
        const hit = getCached<Event[]>(cacheKey);
        if (hit) { setEvents(hit); setLoading(false); return; }

        let cancelled = false;
        setLoading(true);
        setError(null);

        getAllEvents().then((data) => {
            if (cancelled) return;
            const filtered = segment ? data.filter((e) => e.segment === segment) : data;
            setCached(cacheKey, filtered, TTL);
            setEvents(filtered);
            setLoading(false);
        }).catch((err) => {
            if (cancelled) return;
            setError("Failed to load events");
            console.error(err);
            setLoading(false);
        });

        return () => { cancelled = true; };
    }, [segment]);

    return { events, loading, error };
};
