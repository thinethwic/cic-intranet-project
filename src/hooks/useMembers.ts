import { useState, useEffect } from "react";
import type { Member } from "../types";
import { getAllMembers } from "@/lib/api/memberApi";
import { getCached, setCached } from "@/lib/api/apiCache";

const TTL = 5 * 60 * 1000;
const CACHE_KEY = "members:all";

export const useMembers = () => {
    const [members, setMembers] = useState<Member[]>(() => getCached<Member[]>(CACHE_KEY) ?? []);
    const [loading, setLoading] = useState(() => getCached<Member[]>(CACHE_KEY) === null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const hit = getCached<Member[]>(CACHE_KEY);
        if (hit) { setMembers(hit); setLoading(false); return; }

        let cancelled = false;
        setLoading(true);
        setError(null);

        getAllMembers().then((data) => {
            if (cancelled) return;
            setCached(CACHE_KEY, data, TTL);
            setMembers(data);
            setLoading(false);
        }).catch((err) => {
            if (cancelled) return;
            setError("Failed to load members");
            console.error(err);
            setLoading(false);
        });

        return () => { cancelled = true; };
    }, []);

    return { members, loading, error };
};
