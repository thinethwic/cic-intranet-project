import { useState, useEffect } from "react";
import type { Gallery } from "../types";
import { getAllGalleries } from "@/lib/api/galleryApi";
import { getCached, setCached } from "@/lib/api/apiCache";

const CACHE_KEY = "galleries:all";
const TTL = 5 * 60 * 1000;

export const useGalleries = () => {
    const [galleries, setGalleries] = useState<Gallery[]>(() => getCached<Gallery[]>(CACHE_KEY) ?? []);
    const [loading, setLoading] = useState(() => getCached<Gallery[]>(CACHE_KEY) === null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const hit = getCached<Gallery[]>(CACHE_KEY);
        if (hit) { setGalleries(hit); setLoading(false); return; }

        let cancelled = false;
        setLoading(true);
        setError(null);

        getAllGalleries().then((data) => {
            if (cancelled) return;
            setCached(CACHE_KEY, data, TTL);
            setGalleries(data);
            setLoading(false);
        }).catch((err) => {
            if (cancelled) return;
            setError("Failed to load galleries");
            console.error(err);
            setLoading(false);
        });

        return () => { cancelled = true; };
    }, []);

    return { galleries, loading, error };
};
