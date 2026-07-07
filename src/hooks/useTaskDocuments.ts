import { useEffect, useState } from "react";
import type { TaskDocument } from "@/types";
import { getMyTaskDocuments } from "@/lib/api/taskApi";
import { getCached, setCached } from "@/lib/api/apiCache";
import type { PageResponse } from "@/lib/api/apiUtils";

const TTL = 2 * 60 * 1000;

export const useTaskDocuments = (page: number, size: number, q?: string) => {
  const cacheKey = `tasks:documents:${page}:${size}:${q ?? ""}`;
  const [documents, setDocuments] = useState<TaskDocument[]>(
    () => getCached<PageResponse<TaskDocument>>(cacheKey)?.content ?? [],
  );
  const [totalPages, setTotalPages] = useState(
    () => getCached<PageResponse<TaskDocument>>(cacheKey)?.totalPages ?? 0,
  );
  const [totalElements, setTotalElements] = useState(
    () => getCached<PageResponse<TaskDocument>>(cacheKey)?.totalElements ?? 0,
  );
  const [loading, setLoading] = useState(
    () => getCached<PageResponse<TaskDocument>>(cacheKey) === null,
  );
  const [error, setError] = useState<string | null>(null);
  const [refreshIndex, setRefreshIndex] = useState(0);

  useEffect(() => {
    const hit = getCached<PageResponse<TaskDocument>>(cacheKey);
    if (hit && refreshIndex === 0) {
      setDocuments(hit.content);
      setTotalPages(hit.totalPages);
      setTotalElements(hit.totalElements);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    getMyTaskDocuments(page, size, q)
      .then((data) => {
        if (cancelled) return;
        setCached(cacheKey, data, TTL);
        setDocuments(data.content);
        setTotalPages(data.totalPages);
        setTotalElements(data.totalElements);
        setLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        setError("Failed to load documents");
        console.error(err);
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cacheKey, refreshIndex]);

  const refetch = () => setRefreshIndex((i) => i + 1);

  return { documents, totalPages, totalElements, loading, error, refetch };
};
