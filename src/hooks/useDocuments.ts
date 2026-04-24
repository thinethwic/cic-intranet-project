import { useState, useEffect } from "react";
import type { Document } from "@/types";
import type { Segment } from "@/utils/segmentMapper";
import { getAllDocuments } from "@/lib/api/documentApi";

export const useDocuments = (segment?: Segment) => {
    const [documents, setDocuments] = useState<Document[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchDocuments = async () => {
            try {
                setLoading(true);
                const data = await getAllDocuments();
                const filtered = segment
                    ? data.filter((doc) => doc.segment === segment)  // ✅ "CIC_FEEDS" === "CIC_FEEDS"
                    : data;
                setDocuments(filtered);
            } catch (err) {
                setError("Failed to load documents");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchDocuments();
    }, [segment]);

    return { documents, loading, error };
};