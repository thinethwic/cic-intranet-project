import { useState, useEffect } from "react";
import type { Document } from "@/types";
import type { Segment } from "@/utils/segmentMapper";
import { getAllDocuments } from "@/lib/api/documentApi";
import { getCached, setCached } from "@/lib/api/apiCache";

const TTL = 3 * 60 * 1000;

export const useDocuments = (segment?: Segment) => {
    const key = `documents:${segment ?? "all"}`;
    const [documents, setDocuments] = useState<Document[]>(() => getCached<Document[]>(key) ?? []);
    const [loading, setLoading] = useState(() => getCached<Document[]>(key) === null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const cacheKey = `documents:${segment ?? "all"}`;
        const hit = getCached<Document[]>(cacheKey);
        if (hit) { setDocuments(hit); setLoading(false); return; }

        let cancelled = false;
        setLoading(true);
        setError(null);

        getAllDocuments().then((data) => {
            if (cancelled) return;
            const filtered = segment ? data.filter((doc) => doc.segment === segment) : data;
            setCached(cacheKey, filtered, TTL);
            setDocuments(filtered);
            setLoading(false);
        }).catch((err) => {
            if (cancelled) return;
            setError("Failed to load documents");
            console.error(err);
            setLoading(false);
        });

        return () => { cancelled = true; };
    }, [segment]);

    return { documents, loading, error };
};
