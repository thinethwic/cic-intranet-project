import { useState, useEffect } from "react";
import type { News } from "../types";
import { getAllNews, getNewsById } from "@/lib/api/newsApi";

export const useNews = (segment?: string) => {
    const [news, setNews] = useState<News[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchNews = async () => {
            try {
                setLoading(true);
                setError(null);
                const data = await getAllNews();
                const filtered = segment
                    ? data.filter((n) => n.category === segment)
                    : data;
                setNews(filtered);
            } catch (err) {
                setError("Failed to load news");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchNews();
    }, [segment]);

    return { news, loading, error };
};

export const useNewsById = (id: number) => {
    const [news, setNews] = useState<News | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetch = async () => {
            try {
                setLoading(true);
                setError(null);
                const data = await getNewsById(id);
                setNews(data);
            } catch (err) {
                setError("Failed to load article");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, [id]);

    return { news, loading, error };
};
