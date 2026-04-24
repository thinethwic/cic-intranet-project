import { useState, useEffect } from "react";
import type { Event } from "../types";
import { getAllEvents } from "@/lib/api/eventApi";

export const useEvents = (segment?: string) => {
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                setLoading(true);
                const data = await getAllEvents();
                const filtered = segment
                    ? data.filter((e) => e.segment === segment)
                    : data;
                setEvents(filtered);
            } catch (err) {
                setError("Failed to load events");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchEvents();
    }, [segment]);

    return { events, loading, error };
};