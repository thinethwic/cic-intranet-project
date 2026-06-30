import { useState, useEffect } from "react";
import type { News } from "../types";
import { getAllNews, getNewsById } from "@/lib/api/newsApi";
import { getCached, setCached } from "@/lib/api/apiCache";

const TTL = 3 * 60 * 1000;

export const useNews = (segment?: string) => {
    const key = `news:${segment ?? "all"}`;
    const [news, setNews] = useState<News[]>(() => getCached<News[]>(key) ?? []);
    const [loading, setLoading] = useState(() => getCached<News[]>(key) === null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const cacheKey = `news:${segment ?? "all"}`;
        const hit = getCached<News[]>(cacheKey);
        if (hit) { setNews(hit); setLoading(false); return; }

        let cancelled = false;
        setLoading(true);
        setError(null);

        getAllNews().then((data) => {
            if (cancelled) return;
            const filtered = segment ? data.filter((n) => n.category === segment) : data;
            setCached(cacheKey, filtered, TTL);
            setNews(filtered);
            setLoading(false);
        }).catch((err) => {
            if (cancelled) return;
            setError("Failed to load news");
            console.error(err);
            setLoading(false);
        });

        return () => { cancelled = true; };
    }, [segment]);

    return { news, loading, error };
};

export const useNewsById = (id: number) => {
    const key = `news:id:${id}`;
    const [news, setNews] = useState<News | null>(() => getCached<News>(key) ?? null);
    const [loading, setLoading] = useState(() => getCached<News>(key) === null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const cacheKey = `news:id:${id}`;
        const hit = getCached<News>(cacheKey);
        if (hit) { setNews(hit); setLoading(false); return; }

        let cancelled = false;
        setLoading(true);
        setError(null);

        getNewsById(id).then((data) => {
            if (cancelled) return;
            setCached(cacheKey, data, TTL);
            setNews(data);
            setLoading(false);
        }).catch((err) => {
            if (cancelled) return;
            setError("Failed to load article");
            console.error(err);
            setLoading(false);
        });

        return () => { cancelled = true; };
    }, [id]);

    return { news, loading, error };
};
