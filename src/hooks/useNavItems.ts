import { useState, useEffect, useCallback } from "react";
import type { NavItem } from "@/types";
import {
  getNavTree,
  createNavItem,
  updateNavItem,
  deleteNavItem,
  type NavItemUpsertDto,
} from "@/lib/api/navItemApi";

interface UseNavItemsReturn {
  tree: NavItem[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
  createItem: (dto: NavItemUpsertDto) => Promise<NavItem | null>;
  updateItem: (id: number, dto: NavItemUpsertDto) => Promise<NavItem | null>;
  deleteItem: (id: number) => Promise<boolean>;
}

export const useNavItems = (): UseNavItemsReturn => {
  const [tree, setTree] = useState<NavItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTree = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getNavTree();
      setTree(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch navigation items",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTree();
  }, [fetchTree]);

  // Mutations refetch the whole tree afterward — simplest correct way to keep
  // a recursively-nested structure in sync without hand-patching nested state.
  const createItem = async (
    dto: NavItemUpsertDto,
  ): Promise<NavItem | null> => {
    try {
      const created = await createNavItem(dto);
      await fetchTree();
      return created;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create navigation item",
      );
      return null;
    }
  };

  const updateItem = async (
    id: number,
    dto: NavItemUpsertDto,
  ): Promise<NavItem | null> => {
    try {
      const updated = await updateNavItem(id, dto);
      await fetchTree();
      return updated;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update navigation item",
      );
      return null;
    }
  };

  const deleteItem = async (id: number): Promise<boolean> => {
    try {
      await deleteNavItem(id);
      await fetchTree();
      return true;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete navigation item",
      );
      return false;
    }
  };

  return {
    tree,
    loading,
    error,
    refresh: fetchTree,
    createItem,
    updateItem,
    deleteItem,
  };
};
