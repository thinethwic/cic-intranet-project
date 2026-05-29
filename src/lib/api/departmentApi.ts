import { authHeaders } from "@/lib/api/authHeaders";
import { apiFetch } from "./apiFetch";
import {
  buildApiError,
  normalizePageResponse,
  parseJsonSafely,
} from "./apiUtils";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API = `${BASE_URL}/api/v1/departments`;

export type SegmentValue =
  | "CIC_FEEDS"
  | "CIC_VET_CARE"
  | "CIC_POULTRY"
  | "AISA_VET";

export interface Department {
  id: number;
  name: string;
  code: string;
  segment: SegmentValue;
  createdAt: string;
  updatedAt: string;
}

export interface DepartmentRequest {
  name: string;
  code: string;
  segment: SegmentValue;
}

export interface DepartmentPage {
  content: Department[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export async function adminGetDepartmentsPaged(
  page = 0,
  size = 10,
): Promise<DepartmentPage> {
  const res = await apiFetch(`${API}?page=${page}&size=${size}`, {
    headers: authHeaders(),
  });
  const data = await parseJsonSafely<unknown>(res);

  if (!res.ok) {
    throw buildApiError(res, data, "Failed to fetch departments");
  }

  return normalizePageResponse<Department>(data, page, size);
}

export async function adminGetDepartments(
  segment?: SegmentValue,
): Promise<Department[]> {
  if (!segment) return [];

  const res = await apiFetch(`${API}/by-segment/${segment}`, {
    headers: authHeaders(),
  });

  if (!res.ok) throw new Error("Failed to fetch departments");
  return res.json();
}

export async function adminCreateDepartment(
  data: DepartmentRequest,
): Promise<Department> {
  const res = await apiFetch(API, {
    method: "POST",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to create department");
  }

  return res.json();
}

export async function adminUpdateDepartment(
  id: number,
  data: DepartmentRequest,
): Promise<Department> {
  const res = await apiFetch(`${API}/${id}`, {
    method: "PUT",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to update department");
  }

  return res.json();
}

export async function adminDeleteDepartment(id: number): Promise<void> {
  const res = await apiFetch(`${API}/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });

  if (!res.ok) throw new Error("Failed to delete department");
}
