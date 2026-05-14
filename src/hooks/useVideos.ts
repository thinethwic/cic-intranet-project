import { useState, useEffect } from "react";
import type { video as Video } from "@/types";

const BASE_IMAGE_URL =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

const BASE_URL = `${BASE_IMAGE_URL}/api/v1`;

export const useVideos = () => {
    const [videos, setVideos] = useState<Video[]>([]);  // ✅ empty array not undefined
    const [loading, setLoading] = useState(false);      // ✅ false not true — prevents flash
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchVideos = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await fetch(`${BASE_URL}/videos?page=0&size=100`);
                if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
                const data = await response.json();
                setVideos(data?.content ?? []);
            } catch (err) {
                console.error("Videos fetch error:", err);
                setVideos([]);                          // ✅ always array on error
                setError("Failed to load videos");
            } finally {
                setLoading(false);
            }
        };
        fetchVideos();
    }, []);

    return { videos, loading, error };
};
