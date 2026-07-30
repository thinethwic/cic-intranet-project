import { useEffect, useState } from "react";
import type { Task, TaskStatus, TaskPriority, TaskCategory } from "@/types";
import { getMyTasks } from "@/lib/api/taskApi";
import { getCached, setCached } from "@/lib/api/apiCache";
import type { PageResponse } from "@/lib/api/apiUtils";

const TTL = 2 * 60 * 1000;

export interface UseTasksFilters {
  status?: TaskStatus;
  priority?: TaskPriority;
  category?: TaskCategory;
  dueDateFrom?: string;
  dueDateTo?: string;
  q?: string;
}

export const useTasks = (
  page: number,
  size: number,
  filters: UseTasksFilters = {},
) => {
  const cacheKey = `tasks:my:${page}:${size}:${filters.status ?? "all"}:${filters.priority ?? "all"}:${filters.category ?? "all"}:${filters.dueDateFrom ?? ""}:${filters.dueDateTo ?? ""}:${filters.q ?? ""}`;
  const [tasks, setTasks] = useState<Task[]>(
    () => getCached<PageResponse<Task>>(cacheKey)?.content ?? [],
  );
  const [totalPages, setTotalPages] = useState(
    () => getCached<PageResponse<Task>>(cacheKey)?.totalPages ?? 0,
  );
  const [totalElements, setTotalElements] = useState(
    () => getCached<PageResponse<Task>>(cacheKey)?.totalElements ?? 0,
  );
  const [loading, setLoading] = useState(
    () => getCached<PageResponse<Task>>(cacheKey) === null,
  );
  const [error, setError] = useState<string | null>(null);
  const [refreshIndex, setRefreshIndex] = useState(0);

  useEffect(() => {
    const hit = getCached<PageResponse<Task>>(cacheKey);
    if (hit && refreshIndex === 0) {
      setTasks(hit.content);
      setTotalPages(hit.totalPages);
      setTotalElements(hit.totalElements);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    getMyTasks(page, size, filters)
      .then((data) => {
        if (cancelled) return;
        setCached(cacheKey, data, TTL);
        setTasks(data.content);
        setTotalPages(data.totalPages);
        setTotalElements(data.totalElements);
        setLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        setError("Failed to load tasks");
        console.error(err);
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cacheKey, refreshIndex]);

  const refetch = () => setRefreshIndex((i) => i + 1);

  return { tasks, totalPages, totalElements, loading, error, refetch };
};
