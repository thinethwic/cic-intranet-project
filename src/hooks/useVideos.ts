import { useState, useEffect } from "react";
import type { video as Video } from "@/types";
import { getCached, setCached } from "@/lib/api/apiCache";

const BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/api/v1`;
const CACHE_KEY = "videos:all";
const TTL = 5 * 60 * 1000;

export const useVideos = () => {
    const [videos, setVideos] = useState<Video[]>(() => getCached<Video[]>(CACHE_KEY) ?? []);
    const [loading, setLoading] = useState(() => getCached<Video[]>(CACHE_KEY) === null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const hit = getCached<Video[]>(CACHE_KEY);
        if (hit) { setVideos(hit); setLoading(false); return; }

        let cancelled = false;
        setLoading(true);
        setError(null);

        fetch(`${BASE_URL}/videos?page=0&size=100`)
            .then((res) => {
                if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
                return res.json();
            })
            .then((data) => {
                if (cancelled) return;
                const list: Video[] = data?.content ?? [];
                setCached(CACHE_KEY, list, TTL);
                setVideos(list);
                setLoading(false);
            })
            .catch((err) => {
                if (cancelled) return;
                console.error("Videos fetch error:", err);
                setVideos([]);
                setError("Failed to load videos");
                setLoading(false);
            });

        return () => { cancelled = true; };
    }, []);

    return { videos, loading, error };
};
