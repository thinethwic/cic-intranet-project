import type {
  Task,
  TaskStatus,
  TaskPriority,
  TaskAttachment,
  TaskDocument,
} from "@/types";
import { apiFetch } from "./apiFetch";
import {
  buildApiError,
  normalizePageResponse,
  parseJsonSafely,
  type PageResponse,
} from "./apiUtils";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export interface CreateTaskPayload {
  title: string;
  description?: string | null;
  priority: TaskPriority;
  dueDate?: string | null;
}

export interface UpdateTaskPayload {
  title?: string;
  description?: string | null;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string | null;
}

export interface TaskFilters {
  status?: TaskStatus;
  priority?: TaskPriority;
  q?: string;
}

export const getMyTasks = async (
  page = 0,
  size = 20,
  filters: TaskFilters = {},
): Promise<PageResponse<Task>> => {
  const params = new URLSearchParams({
    page: String(page),
    size: String(size),
    sort: "createdAt,desc",
  });
  if (filters.status) params.set("status", filters.status);
  if (filters.priority) params.set("priority", filters.priority);
  if (filters.q) params.set("q", filters.q);

  const res = await apiFetch(`${BASE_URL}/api/tasks/my?${params}`);
  const data = await parseJsonSafely<unknown>(res);
  if (!res.ok) throw buildApiError(res, data, "Failed to fetch tasks");
  return normalizePageResponse<Task>(data, page, size);
};

export const getTaskById = async (id: number): Promise<Task> => {
  const res = await apiFetch(`${BASE_URL}/api/tasks/${id}`);
  if (!res.ok) throw new Error("Failed to fetch task");
  return res.json();
};

export const createTask = async (payload: CreateTaskPayload): Promise<Task> => {
  const res = await apiFetch(`${BASE_URL}/api/tasks`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to create task");
  return res.json();
};

export const updateTask = async (
  id: number,
  payload: UpdateTaskPayload,
): Promise<Task> => {
  const res = await apiFetch(`${BASE_URL}/api/tasks/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to update task");
  return res.json();
};

export const deleteTask = async (id: number): Promise<void> => {
  const res = await apiFetch(`${BASE_URL}/api/tasks/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete task");
};

export const uploadTaskAttachment = async (
  taskId: number,
  file: File,
): Promise<TaskAttachment> => {
  const formData = new FormData();
  formData.append("file", file);
  const res = await apiFetch(`${BASE_URL}/api/tasks/${taskId}/attachments`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) throw new Error("Failed to upload attachment");
  return res.json();
};

export const getTaskAttachments = async (
  taskId: number,
): Promise<TaskAttachment[]> => {
  const res = await apiFetch(`${BASE_URL}/api/tasks/${taskId}/attachments`);
  if (!res.ok) throw new Error("Failed to fetch attachments");
  return res.json();
};

export const getMyTaskDocuments = async (
  page = 0,
  size = 20,
  q?: string,
): Promise<PageResponse<TaskDocument>> => {
  const params = new URLSearchParams({
    page: String(page),
    size: String(size),
    sort: "uploadedAt,desc",
  });
  if (q) params.set("q", q);

  const res = await apiFetch(`${BASE_URL}/api/tasks/attachments/my?${params}`);
  const data = await parseJsonSafely<unknown>(res);
  if (!res.ok) throw buildApiError(res, data, "Failed to fetch documents");
  return normalizePageResponse<TaskDocument>(data, page, size);
};

export const deleteTaskAttachment = async (
  taskId: number,
  attachmentId: number,
): Promise<void> => {
  const res = await apiFetch(
    `${BASE_URL}/api/tasks/${taskId}/attachments/${attachmentId}`,
    { method: "DELETE" },
  );
  if (!res.ok) throw new Error("Failed to delete attachment");
};

// ✅ Use whichever token is available — same convention as documentApi's blob downloads
const getToken = () =>
  localStorage.getItem("admin_token") ||
  localStorage.getItem("authorized_token") ||
  "";

export const downloadTaskAttachment = async (
  taskId: number,
  attachmentId: number,
): Promise<Blob> => {
  const res = await fetch(
    `${BASE_URL}/api/tasks/${taskId}/attachments/${attachmentId}/download`,
    { headers: { Authorization: `Bearer ${getToken()}` } },
  );
  if (!res.ok) throw new Error("Failed to download attachment");
  return res.blob();
};
