import { useState, useEffect } from "react";
import type { Gallery } from "../types";
import { getAllGalleries } from "@/lib/api/galleryApi";

export const useGalleries = () => {
    const [galleries, setGalleries] = useState<Gallery[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchGalleries = async () => {
            try {
                setLoading(true);
                const data = await getAllGalleries();
                setGalleries(data);
            } catch (err) {
                setError("Failed to load galleries");
                console.log(err)
            } finally {
                setLoading(false);
            }
        };
        fetchGalleries();
    }, []);

    return { galleries, loading, error };
};