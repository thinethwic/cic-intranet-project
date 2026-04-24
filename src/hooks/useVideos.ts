import { useState, useEffect } from "react";
import type { Video } from "@/types";

const BASE_URL = "http://localhost:8080/api/v1";

export const useVideos = () => {
    const [videos, setVideos] = useState<Video[]>([]);  // ✅ empty array not undefined
    const [loading, setLoading] = useState(false);      // ✅ false not true — prevents flash
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchVideos = async () => {
            try {
                setLoading(true);
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