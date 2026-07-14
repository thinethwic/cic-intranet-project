import { useState, useEffect, useCallback } from "react";
import type { HeroShortcut, HeroShortcutGroup } from "@/types";
import {
  getHeroShortcutGroups,
  createHeroShortcutGroup,
  updateHeroShortcutGroup,
  deleteHeroShortcutGroup,
  createHeroShortcut,
  updateHeroShortcut,
  deleteHeroShortcut,
} from "@/lib/api/heroShortcutApi";

interface UseHeroShortcutsReturn {
  groups: HeroShortcutGroup[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
  createGroup: (
    dto: Partial<HeroShortcutGroup>,
  ) => Promise<HeroShortcutGroup | null>;
  updateGroup: (
    id: number,
    dto: Partial<HeroShortcutGroup>,
  ) => Promise<HeroShortcutGroup | null>;
  deleteGroup: (id: number) => Promise<boolean>;
  createShortcut: (
    dto: Partial<HeroShortcut>,
  ) => Promise<HeroShortcut | null>;
  updateShortcut: (
    id: number,
    dto: Partial<HeroShortcut>,
  ) => Promise<HeroShortcut | null>;
  deleteShortcut: (id: number) => Promise<boolean>;
}

export const useHeroShortcuts = (): UseHeroShortcutsReturn => {
  const [groups, setGroups] = useState<HeroShortcutGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchGroups = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getHeroShortcutGroups();
      setGroups(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch hero shortcuts",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  const createGroup = async (
    dto: Partial<HeroShortcutGroup>,
  ): Promise<HeroShortcutGroup | null> => {
    try {
      const created = await createHeroShortcutGroup(dto);
      setGroups((prev) => [...prev, { ...created, shortcuts: [] }]);
      return created;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create group");
      return null;
    }
  };

  const updateGroup = async (
    id: number,
    dto: Partial<HeroShortcutGroup>,
  ): Promise<HeroShortcutGroup | null> => {
    try {
      const updated = await updateHeroShortcutGroup(id, dto);
      setGroups((prev) =>
        prev.map((g) => (g.id === id ? { ...g, ...updated } : g)),
      );
      return updated;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update group");
      return null;
    }
  };

  const deleteGroup = async (id: number): Promise<boolean> => {
    try {
      await deleteHeroShortcutGroup(id);
      setGroups((prev) => prev.filter((g) => g.id !== id));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete group");
      return false;
    }
  };

  const createShortcut = async (
    dto: Partial<HeroShortcut>,
  ): Promise<HeroShortcut | null> => {
    try {
      const created = await createHeroShortcut(dto);
      setGroups((prev) =>
        prev.map((g) =>
          g.id === created.groupId
            ? { ...g, shortcuts: [...g.shortcuts, created] }
            : g,
        ),
      );
      return created;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create shortcut",
      );
      return null;
    }
  };

  const updateShortcut = async (
    id: number,
    dto: Partial<HeroShortcut>,
  ): Promise<HeroShortcut | null> => {
    try {
      const updated = await updateHeroShortcut(id, dto);
      setGroups((prev) =>
        prev.map((g) => {
          const withoutOld = g.shortcuts.filter((s) => s.id !== id);
          if (g.id === updated.groupId) {
            return { ...g, shortcuts: [...withoutOld, updated] };
          }
          if (withoutOld.length !== g.shortcuts.length) {
            return { ...g, shortcuts: withoutOld };
          }
          return g;
        }),
      );
      return updated;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update shortcut",
      );
      return null;
    }
  };

  const deleteShortcut = async (id: number): Promise<boolean> => {
    try {
      await deleteHeroShortcut(id);
      setGroups((prev) =>
        prev.map((g) => ({
          ...g,
          shortcuts: g.shortcuts.filter((s) => s.id !== id),
        })),
      );
      return true;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete shortcut",
      );
      return false;
    }
  };

  return {
    groups,
    loading,
    error,
    refresh: fetchGroups,
    createGroup,
    updateGroup,
    deleteGroup,
    createShortcut,
    updateShortcut,
    deleteShortcut,
  };
};
