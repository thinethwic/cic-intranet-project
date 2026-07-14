// src/lib/api/heroShortcutApi.ts

import type { HeroShortcut, HeroShortcutGroup } from "@/types";
import { apiFetch } from "./apiFetch";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API = `${BASE_URL}/api/v1`;

// Backend stores `color` as an uppercase Java enum (e.g. "BLUE"); the frontend
// uses lowercase color keys — convert at this API boundary, same as `severity`
// is converted in alertApi.ts.
const mapShortcutFromApi = (raw: any): HeroShortcut => ({
  ...raw,
  color: (raw.color ?? "blue").toLowerCase(),
});

const mapGroupFromApi = (raw: any): HeroShortcutGroup => ({
  ...raw,
  shortcuts: (raw.shortcuts ?? []).map(mapShortcutFromApi),
});

const mapShortcutDtoToApi = (dto: Partial<HeroShortcut>) => ({
  ...dto,
  color: dto.color ? dto.color.toUpperCase() : undefined,
});

export const getHeroShortcutGroups = async (): Promise<HeroShortcutGroup[]> => {
  const res = await apiFetch(`${API}/hero-shortcut-groups`);
  if (!res.ok) throw new Error("Failed to fetch hero shortcut groups");
  const data = await res.json();
  return (data as any[]).map(mapGroupFromApi);
};

export const createHeroShortcutGroup = async (
  dto: Partial<HeroShortcutGroup>,
): Promise<HeroShortcutGroup> => {
  const res = await apiFetch(`${API}/hero-shortcut-groups`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dto),
  });
  if (!res.ok) throw new Error("Failed to create group");
  return mapGroupFromApi(await res.json());
};

export const updateHeroShortcutGroup = async (
  id: number,
  dto: Partial<HeroShortcutGroup>,
): Promise<HeroShortcutGroup> => {
  const res = await apiFetch(`${API}/hero-shortcut-groups/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dto),
  });
  if (!res.ok) throw new Error("Failed to update group");
  return mapGroupFromApi(await res.json());
};

export const deleteHeroShortcutGroup = async (id: number): Promise<void> => {
  const res = await apiFetch(`${API}/hero-shortcut-groups/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete group");
};

export const createHeroShortcut = async (
  dto: Partial<HeroShortcut>,
): Promise<HeroShortcut> => {
  const res = await apiFetch(`${API}/hero-shortcuts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(mapShortcutDtoToApi(dto)),
  });
  if (!res.ok) throw new Error("Failed to create shortcut");
  return mapShortcutFromApi(await res.json());
};

export const updateHeroShortcut = async (
  id: number,
  dto: Partial<HeroShortcut>,
): Promise<HeroShortcut> => {
  const res = await apiFetch(`${API}/hero-shortcuts/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(mapShortcutDtoToApi(dto)),
  });
  if (!res.ok) throw new Error("Failed to update shortcut");
  return mapShortcutFromApi(await res.json());
};

export const deleteHeroShortcut = async (id: number): Promise<void> => {
  const res = await apiFetch(`${API}/hero-shortcuts/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete shortcut");
};
