// src/lib/api/navItemApi.ts

import type { NavItem } from "@/types";
import { apiFetch } from "./apiFetch";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API = `${BASE_URL}/api/v1`;

// Backend returns a nested `parent: { id, ... } | null` object (to avoid
// re-serializing the whole ancestor chain); the frontend only needs the id.
const mapNavItemFromApi = (raw: any): NavItem => ({
  id: raw.id,
  label: raw.label,
  url: raw.url ?? null,
  segment: raw.segment ?? null,
  sortOrder: raw.sortOrder,
  parentId: raw.parent?.id ?? null,
  children: (raw.children ?? []).map(mapNavItemFromApi),
});

export interface NavItemUpsertDto {
  label: string;
  url?: string | null;
  segment?: NavItem["segment"];
  parentId?: number | null;
}

export const getNavTree = async (): Promise<NavItem[]> => {
  const res = await apiFetch(`${API}/nav-items`);
  if (!res.ok) throw new Error("Failed to fetch navigation items");
  const data = await res.json();
  return (data as any[]).map(mapNavItemFromApi);
};

export const createNavItem = async (
  dto: NavItemUpsertDto,
): Promise<NavItem> => {
  const res = await apiFetch(`${API}/nav-items`, {
    method: "POST",
    body: JSON.stringify(dto),
  });
  if (!res.ok) throw new Error("Failed to create navigation item");
  return mapNavItemFromApi(await res.json());
};

export const updateNavItem = async (
  id: number,
  dto: NavItemUpsertDto,
): Promise<NavItem> => {
  const res = await apiFetch(`${API}/nav-items/${id}`, {
    method: "PUT",
    body: JSON.stringify(dto),
  });
  if (!res.ok) throw new Error("Failed to update navigation item");
  return mapNavItemFromApi(await res.json());
};

export const deleteNavItem = async (id: number): Promise<void> => {
  const res = await apiFetch(`${API}/nav-items/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete navigation item");
};
