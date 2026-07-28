import { useState } from "react";
import { Plus, Pencil, Trash2, FolderTree } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import InlineErrorAlert from "@/components/shared/InlineErrorAlert";
import { getUserFriendlyErrorMessage } from "@/lib/api/apiUtils";
import { useNavItems } from "@/hooks/useNavItems";
import { segmentLabels } from "@/utils/segmentMapper";
import type { NavItem } from "@/types";

const EMPTY_FORM = { label: "", url: "", segment: "" as NavItem["segment"] | "" };

function countDescendants(item: NavItem): number {
  return item.children.reduce(
    (sum, child) => sum + 1 + countDescendants(child),
    0,
  );
}

interface NavItemFormProps {
  form: typeof EMPTY_FORM;
  setForm: React.Dispatch<React.SetStateAction<typeof EMPTY_FORM>>;
}

function NavItemForm({ form, setForm }: NavItemFormProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-slate-600">Label</Label>
        <Input
          placeholder="e.g. HR"
          value={form.label}
          onChange={(e) => setForm((p) => ({ ...p, label: e.target.value }))}
          autoComplete="off"
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-slate-600">Link</Label>
        <Input
          placeholder="/hr (leave blank for a dropdown-only folder)"
          value={form.url}
          onChange={(e) => setForm((p) => ({ ...p, url: e.target.value }))}
          autoComplete="off"
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-slate-600">Segment</Label>
        <Select
          value={form.segment || "ALL"}
          onValueChange={(v) =>
            setForm((p) => ({
              ...p,
              segment: v === "ALL" ? "" : (v as NavItem["segment"]),
            }))
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="All companies" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All companies</SelectItem>
            {(Object.entries(segmentLabels) as [string, string][]).map(
              ([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ),
            )}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

interface NavItemRowProps {
  item: NavItem;
  depth: number;
  onAddChild: (parentId: number) => void;
  onEdit: (item: NavItem) => void;
  onDelete: (item: NavItem) => void;
}

function NavItemRow({ item, depth, onAddChild, onEdit, onDelete }: NavItemRowProps) {
  return (
    <div>
      <div
        className="flex items-center justify-between gap-3 py-2.5 border-b border-slate-100"
        style={{ paddingLeft: depth * 24 }}
      >
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-sm font-medium text-slate-800 truncate">
            {item.label}
          </span>
          {item.segment && (
            <Badge variant="secondary" className="text-[10px]">
              {segmentLabels[item.segment]}
            </Badge>
          )}
          {item.url && (
            <span className="text-xs text-slate-400 truncate">{item.url}</span>
          )}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <Button
            variant="ghost"
            size="icon-sm"
            title="Add child item"
            onClick={() => onAddChild(item.id)}
          >
            <Plus className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            title="Edit"
            onClick={() => onEdit(item)}
          >
            <Pencil className="w-3.5 h-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            className="hover:text-red-600"
            title="Delete"
            onClick={() => onDelete(item)}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
      {item.children.map((child) => (
        <NavItemRow
          key={child.id}
          item={child}
          depth={depth + 1}
          onAddChild={onAddChild}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}

export default function AdminNavItemsPage() {
  const {
    tree,
    loading,
    error: fetchError,
    createItem,
    updateItem,
    deleteItem,
  } = useNavItems();

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [showCreate, setShowCreate] = useState(false);
  const [createParentId, setCreateParentId] = useState<number | null>(null);
  const [createForm, setCreateForm] = useState({ ...EMPTY_FORM });

  const [editingItem, setEditingItem] = useState<NavItem | null>(null);
  const [editForm, setEditForm] = useState({ ...EMPTY_FORM });

  const [deletingItem, setDeletingItem] = useState<NavItem | null>(null);

  const pageError =
    error ||
    (fetchError
      ? getUserFriendlyErrorMessage(
          fetchError,
          "Unable to load navigation items right now.",
        )
      : "");

  const openCreate = (parentId: number | null) => {
    setError("");
    setCreateParentId(parentId);
    setCreateForm({ ...EMPTY_FORM });
    setShowCreate(true);
  };

  const handleCreate = async () => {
    if (!createForm.label.trim()) return;
    try {
      setSaving(true);
      setError("");
      const created = await createItem({
        label: createForm.label.trim(),
        url: createForm.url.trim() || null,
        segment: createForm.segment || null,
        parentId: createParentId,
      });
      if (!created) throw new Error("Failed to create navigation item");
      setShowCreate(false);
    } catch (err) {
      setError(
        getUserFriendlyErrorMessage(err, "Unable to create the navigation item."),
      );
    } finally {
      setSaving(false);
    }
  };

  const openEdit = (item: NavItem) => {
    setError("");
    setEditingItem(item);
    setEditForm({
      label: item.label,
      url: item.url ?? "",
      segment: item.segment ?? "",
    });
  };

  const handleSaveEdit = async () => {
    if (!editingItem || !editForm.label.trim()) return;
    try {
      setSaving(true);
      setError("");
      const updated = await updateItem(editingItem.id, {
        label: editForm.label.trim(),
        url: editForm.url.trim() || null,
        segment: editForm.segment || null,
        parentId: editingItem.parentId,
      });
      if (!updated) throw new Error("Failed to update navigation item");
      setEditingItem(null);
    } catch (err) {
      setError(
        getUserFriendlyErrorMessage(err, "Unable to update the navigation item."),
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingItem) return;
    try {
      setError("");
      const ok = await deleteItem(deletingItem.id);
      if (!ok) throw new Error("Failed to delete navigation item");
      setDeletingItem(null);
    } catch (err) {
      setError(
        getUserFriendlyErrorMessage(err, "Unable to delete the navigation item."),
      );
    }
  };

  const descendantCount = deletingItem ? countDescendants(deletingItem) : 0;

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Navigation Items
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage the top navigation bar's menus and nested dropdown items.
          </p>
        </div>
        <Button
          onClick={() => openCreate(null)}
          className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
        >
          <Plus className="w-4 h-4" /> New root item
        </Button>
      </div>

      {pageError && <InlineErrorAlert message={pageError} />}

      {loading ? (
        <div className="text-center py-20 text-slate-400">
          <p className="text-sm">Loading navigation items...</p>
        </div>
      ) : tree.length === 0 ? (
        <div className="text-center py-20 text-slate-400">
          <FolderTree className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">
            No navigation items yet — create one to get started.
          </p>
        </div>
      ) : (
        <div className="border border-slate-200 rounded-xl px-4">
          {tree.map((item) => (
            <NavItemRow
              key={item.id}
              item={item}
              depth={0}
              onAddChild={(parentId) => openCreate(parentId)}
              onEdit={openEdit}
              onDelete={setDeletingItem}
            />
          ))}
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={showCreate} onOpenChange={(o) => !o && setShowCreate(false)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="w-4 h-4 text-blue-600" />
              {createParentId === null ? "New root item" : "New child item"}
            </DialogTitle>
            <DialogDescription>
              {createParentId === null
                ? "Appears as a top-level menu in the navigation bar."
                : "Appears as a dropdown entry under its parent item."}
            </DialogDescription>
          </DialogHeader>
          <NavItemForm form={createForm} setForm={setCreateForm} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>
              Cancel
            </Button>
            <Button
              disabled={!createForm.label.trim() || saving}
              onClick={handleCreate}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {saving ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog
        open={!!editingItem}
        onOpenChange={(o) => !o && setEditingItem(null)}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pencil className="w-4 h-4 text-blue-600" /> Edit item
            </DialogTitle>
          </DialogHeader>
          <NavItemForm form={editForm} setForm={setEditForm} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingItem(null)}>
              Cancel
            </Button>
            <Button
              disabled={!editForm.label.trim() || saving}
              onClick={handleSaveEdit}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {saving ? "Saving..." : "Save changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog
        open={!!deletingItem}
        onOpenChange={(o) => !o && setDeletingItem(null)}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center mb-2">
              <Trash2 className="w-5 h-5 text-red-600" />
            </div>
            <DialogTitle>Delete "{deletingItem?.label}"?</DialogTitle>
            <DialogDescription>
              {descendantCount > 0
                ? `This will also permanently remove its ${descendantCount} nested item${descendantCount === 1 ? "" : "s"}.`
                : "This item will be permanently removed."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingItem(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
