import { useState, useEffect } from "react";
import type { Member } from "../types";
import { getAllMembers } from "@/lib/api/memberApi";

export const useMembers = () => {
    const [members, setMembers] = useState<Member[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchMembers = async () => {
            try {
                setLoading(true);
                setError(null);
                const data = await getAllMembers();
                setMembers(data);
            } catch (err) {
                setError("Failed to load members");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchMembers();
    }, []);

    return { members, loading, error };
};
