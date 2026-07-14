import { useState } from "react";
import { Plus, Pencil, Trash2, Link2, Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { useHeroShortcuts } from "@/hooks/useHeroShortcuts";
import {
  HERO_SHORTCUT_ICONS,
  HERO_SHORTCUT_ICON_NAMES,
  HERO_SHORTCUT_COLORS,
  HERO_SHORTCUT_COLOR_NAMES,
} from "@/lib/heroShortcutIcons";
import type { HeroShortcut, HeroShortcutGroup, HeroShortcutColor } from "@/types";

const EMPTY_SHORTCUT_FORM = {
  label: "",
  url: "",
  groupId: 0,
  color: "blue" as HeroShortcutColor,
  iconName: "Link2",
};

// ── ShortcutForm ─────────────────────────────────────────────────────────────

interface ShortcutFormProps {
  form: typeof EMPTY_SHORTCUT_FORM;
  setForm: React.Dispatch<React.SetStateAction<typeof EMPTY_SHORTCUT_FORM>>;
  groups: HeroShortcutGroup[];
  iconSearch: string;
  setIconSearch: (v: string) => void;
}

function ShortcutForm({
  form,
  setForm,
  groups,
  iconSearch,
  setIconSearch,
}: ShortcutFormProps) {
  const set = <K extends keyof typeof EMPTY_SHORTCUT_FORM>(
    key: K,
    value: (typeof EMPTY_SHORTCUT_FORM)[K],
  ) => setForm((p) => ({ ...p, [key]: value }));

  const filteredIcons = HERO_SHORTCUT_ICON_NAMES.filter((name) =>
    name.toLowerCase().includes(iconSearch.toLowerCase()),
  );

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-slate-600">Label</Label>
        <Input
          placeholder="e.g. Help Desk"
          value={form.label}
          onChange={(e) => set("label", e.target.value)}
          autoComplete="off"
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-slate-600">Link</Label>
        <Input
          placeholder="/helpdesk or https://..."
          value={form.url}
          onChange={(e) => set("url", e.target.value)}
          autoComplete="off"
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-slate-600">Group</Label>
        <Select
          value={String(form.groupId)}
          onValueChange={(v) => set("groupId", Number(v))}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a group" />
          </SelectTrigger>
          <SelectContent>
            {groups.map((g) => (
              <SelectItem key={g.id} value={String(g.id)}>
                {g.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-slate-600">Color</Label>
        <div className="flex gap-2 flex-wrap">
          {HERO_SHORTCUT_COLOR_NAMES.map((color) => {
            const palette = HERO_SHORTCUT_COLORS[color];
            const active = form.color === color;
            return (
              <button
                key={color}
                type="button"
                onClick={() => set("color", color)}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${palette.iconBg} ${
                  active ? "ring-2 ring-offset-2 ring-cic-900" : ""
                }`}
                aria-label={color}
              >
                <span className={`w-2.5 h-2.5 rounded-full ${palette.iconColor} bg-current`} />
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-slate-600">Icon</Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <Input
            className="pl-8 h-8 text-sm"
            placeholder="Search icons..."
            value={iconSearch}
            onChange={(e) => setIconSearch(e.target.value)}
          />
        </div>
        <div className="grid grid-cols-6 gap-2 max-h-40 overflow-y-auto p-1 border border-slate-100 rounded-lg">
          {filteredIcons.map((name) => {
            const IconComp = HERO_SHORTCUT_ICONS[name];
            const active = form.iconName === name;
            return (
              <button
                key={name}
                type="button"
                title={name}
                onClick={() => set("iconName", name)}
                className={`w-9 h-9 rounded-lg flex items-center justify-center border transition-all ${
                  active
                    ? "border-cic-900 bg-cic-50 text-cic-900"
                    : "border-transparent text-slate-500 hover:bg-slate-100"
                }`}
              >
                <IconComp className="w-4 h-4" />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function AdminHeroShortcutsPage() {
  const {
    groups,
    loading,
    error: fetchError,
    refresh,
    createGroup,
    updateGroup,
    deleteGroup,
    createShortcut,
    updateShortcut,
    deleteShortcut,
  } = useHeroShortcuts();

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [groupNameForm, setGroupNameForm] = useState("");
  const [editGroup, setEditGroup] = useState<HeroShortcutGroup | null>(null);
  const [editGroupName, setEditGroupName] = useState("");
  const [deleteGroupId, setDeleteGroupId] = useState<number | null>(null);

  const [showCreateShortcut, setShowCreateShortcut] = useState(false);
  const [createForm, setCreateForm] = useState({ ...EMPTY_SHORTCUT_FORM });
  const [editShortcut, setEditShortcut] = useState<HeroShortcut | null>(null);
  const [editForm, setEditForm] = useState({ ...EMPTY_SHORTCUT_FORM });
  const [deleteShortcutId, setDeleteShortcutId] = useState<number | null>(
    null,
  );
  const [iconSearch, setIconSearch] = useState("");

  const pageError =
    error ||
    (fetchError
      ? getUserFriendlyErrorMessage(
          fetchError,
          "Unable to load hero shortcuts right now.",
        )
      : "");

  // ── Group actions ────────────────────────────────────────────────────────
  const handleCreateGroup = async () => {
    if (!groupNameForm.trim()) return;
    try {
      setSaving(true);
      setError("");
      const created = await createGroup({
        name: groupNameForm.trim(),
        sortOrder: groups.length,
      });
      if (!created) throw new Error("Failed to create group");
      setShowCreateGroup(false);
      setGroupNameForm("");
      refresh();
    } catch (err) {
      setError(
        getUserFriendlyErrorMessage(err, "Unable to create the group."),
      );
    } finally {
      setSaving(false);
    }
  };

  const openEditGroup = (group: HeroShortcutGroup) => {
    setError("");
    setEditGroup(group);
    setEditGroupName(group.name);
  };

  const handleSaveGroupEdit = async () => {
    if (!editGroup || !editGroupName.trim()) return;
    try {
      setSaving(true);
      setError("");
      const updated = await updateGroup(editGroup.id, {
        name: editGroupName.trim(),
        sortOrder: editGroup.sortOrder,
      });
      if (!updated) throw new Error("Failed to update group");
      setEditGroup(null);
      refresh();
    } catch (err) {
      setError(
        getUserFriendlyErrorMessage(err, "Unable to update the group."),
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteGroup = async () => {
    if (deleteGroupId === null) return;
    try {
      setError("");
      const ok = await deleteGroup(deleteGroupId);
      if (!ok) throw new Error("Failed to delete group");
      setDeleteGroupId(null);
    } catch (err) {
      setError(
        getUserFriendlyErrorMessage(err, "Unable to delete the group."),
      );
    }
  };

  // ── Shortcut actions ─────────────────────────────────────────────────────
  const openAddShortcut = (groupId: number) => {
    setError("");
    setIconSearch("");
    setCreateForm({ ...EMPTY_SHORTCUT_FORM, groupId });
    setShowCreateShortcut(true);
  };

  const handleCreateShortcut = async () => {
    if (!createForm.label.trim() || !createForm.url.trim()) return;
    try {
      setSaving(true);
      setError("");
      const group = groups.find((g) => g.id === createForm.groupId);
      const created = await createShortcut({
        label: createForm.label.trim(),
        url: createForm.url.trim(),
        groupId: createForm.groupId,
        color: createForm.color,
        iconName: createForm.iconName,
        sortOrder: group?.shortcuts.length ?? 0,
      });
      if (!created) throw new Error("Failed to create shortcut");
      setShowCreateShortcut(false);
      refresh();
    } catch (err) {
      setError(
        getUserFriendlyErrorMessage(err, "Unable to create the shortcut."),
      );
    } finally {
      setSaving(false);
    }
  };

  const openEditShortcut = (item: HeroShortcut) => {
    setError("");
    setIconSearch("");
    setEditShortcut(item);
    setEditForm({
      label: item.label,
      url: item.url,
      groupId: item.groupId,
      color: item.color,
      iconName: item.iconName,
    });
  };

  const handleSaveShortcutEdit = async () => {
    if (!editShortcut || !editForm.label.trim() || !editForm.url.trim())
      return;
    try {
      setSaving(true);
      setError("");
      const updated = await updateShortcut(editShortcut.id, {
        label: editForm.label.trim(),
        url: editForm.url.trim(),
        groupId: editForm.groupId,
        color: editForm.color,
        iconName: editForm.iconName,
        sortOrder: editShortcut.sortOrder,
      });
      if (!updated) throw new Error("Failed to update shortcut");
      setEditShortcut(null);
      refresh();
    } catch (err) {
      setError(
        getUserFriendlyErrorMessage(err, "Unable to update the shortcut."),
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteShortcut = async () => {
    if (deleteShortcutId === null) return;
    try {
      setError("");
      const ok = await deleteShortcut(deleteShortcutId);
      if (!ok) throw new Error("Failed to delete shortcut");
      setDeleteShortcutId(null);
    } catch (err) {
      setError(
        getUserFriendlyErrorMessage(err, "Unable to delete the shortcut."),
      );
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Hero Shortcuts
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage the quick-link folders and buttons shown on the home page.
          </p>
        </div>
        <Button
          onClick={() => {
            setError("");
            setGroupNameForm("");
            setShowCreateGroup(true);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
        >
          <Plus className="w-4 h-4" /> New group
        </Button>
      </div>

      {pageError && <InlineErrorAlert message={pageError} />}

      {loading ? (
        <div className="text-center py-20 text-slate-400">
          <p className="text-sm">Loading shortcuts...</p>
        </div>
      ) : groups.length === 0 ? (
        <div className="text-center py-20 text-slate-400">
          <p className="text-sm">No groups yet — create one to get started.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {groups.map((group) => (
            <div key={group.id} className="space-y-3">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <h2 className="text-base font-semibold text-slate-800">
                  {group.name}
                </h2>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs gap-1.5"
                    onClick={() => openAddShortcut(group.id)}
                  >
                    <Plus className="w-3.5 h-3.5" /> Add shortcut
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => openEditGroup(group)}
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="hover:text-red-600"
                    onClick={() => setDeleteGroupId(group.id)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>

              {group.shortcuts.length === 0 ? (
                <p className="text-xs text-slate-400 italic">
                  No shortcuts in this group yet.
                </p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {group.shortcuts.map((item) => {
                    const ItemIcon =
                      HERO_SHORTCUT_ICONS[item.iconName] ?? Link2;
                    const palette = HERO_SHORTCUT_COLORS[item.color];
                    return (
                      <Card
                        key={item.id}
                        className="border border-slate-200 shadow-sm"
                      >
                        <CardContent className="p-4 flex flex-col gap-3">
                          <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center ${palette.iconBg}`}
                          >
                            <ItemIcon
                              className={`w-5 h-5 ${palette.iconColor}`}
                            />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-slate-800 truncate">
                              {item.label}
                            </p>
                            <p className="text-xs text-slate-400 truncate">
                              {item.url}
                            </p>
                          </div>
                          <div className="flex gap-2 pt-2 border-t border-slate-100">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="flex-1 h-8 text-xs hover:bg-blue-50 hover:text-blue-700"
                              onClick={() => openEditShortcut(item)}
                            >
                              <Pencil className="w-3.5 h-3.5 mr-1.5" /> Edit
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="flex-1 h-8 text-xs hover:bg-red-50 hover:text-red-700"
                              onClick={() => setDeleteShortcutId(item.id)}
                            >
                              <Trash2 className="w-3.5 h-3.5 mr-1.5" /> Delete
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── Create Group Dialog ── */}
      <Dialog
        open={showCreateGroup}
        onOpenChange={(o) => !o && setShowCreateGroup(false)}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="w-4 h-4 text-blue-600" /> New group
            </DialogTitle>
            <DialogDescription>
              Groups appear as folders in the Hero section.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-slate-600">
              Group name
            </Label>
            <Input
              placeholder="e.g. Work Tools"
              value={groupNameForm}
              onChange={(e) => setGroupNameForm(e.target.value)}
              autoComplete="off"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCreateGroup(false)}
            >
              Cancel
            </Button>
            <Button
              disabled={!groupNameForm.trim() || saving}
              onClick={handleCreateGroup}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {saving ? "Creating..." : "Create group"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Edit Group Dialog ── */}
      <Dialog open={!!editGroup} onOpenChange={(o) => !o && setEditGroup(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pencil className="w-4 h-4 text-blue-600" /> Edit group
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-slate-600">
              Group name
            </Label>
            <Input
              value={editGroupName}
              onChange={(e) => setEditGroupName(e.target.value)}
              autoComplete="off"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditGroup(null)}>
              Cancel
            </Button>
            <Button
              disabled={!editGroupName.trim() || saving}
              onClick={handleSaveGroupEdit}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {saving ? "Saving..." : "Save changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete Group Dialog ── */}
      <Dialog
        open={deleteGroupId !== null}
        onOpenChange={() => setDeleteGroupId(null)}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center mb-2">
              <Trash2 className="w-5 h-5 text-red-600" />
            </div>
            <DialogTitle>Delete group?</DialogTitle>
            <DialogDescription>
              "{groups.find((g) => g.id === deleteGroupId)?.name}" and all of
              its shortcuts will be permanently removed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteGroupId(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteGroup}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Create Shortcut Dialog ── */}
      <Dialog
        open={showCreateShortcut}
        onOpenChange={(o) => !o && setShowCreateShortcut(false)}
      >
        <DialogContent className="sm:max-w-lg p-0 gap-0 overflow-hidden max-h-[90vh] flex flex-col">
          <DialogHeader className="px-6 py-4 border-b border-slate-100 shrink-0">
            <DialogTitle className="flex items-center gap-2">
              <Plus className="w-4 h-4 text-blue-600" /> Add shortcut
            </DialogTitle>
            <DialogDescription>
              Add a new quick-link button to this group.
            </DialogDescription>
          </DialogHeader>
          <div className="overflow-y-auto flex-1 px-6 py-5">
            <ShortcutForm
              form={createForm}
              setForm={setCreateForm}
              groups={groups}
              iconSearch={iconSearch}
              setIconSearch={setIconSearch}
            />
          </div>
          <DialogFooter className="px-6 py-4 border-t border-slate-100 shrink-0">
            <Button
              variant="outline"
              onClick={() => setShowCreateShortcut(false)}
            >
              Cancel
            </Button>
            <Button
              disabled={
                !createForm.label.trim() || !createForm.url.trim() || saving
              }
              onClick={handleCreateShortcut}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {saving ? "Adding..." : "Add shortcut"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Edit Shortcut Dialog ── */}
      <Dialog
        open={!!editShortcut}
        onOpenChange={(o) => !o && setEditShortcut(null)}
      >
        <DialogContent className="sm:max-w-lg p-0 gap-0 overflow-hidden max-h-[90vh] flex flex-col">
          <DialogHeader className="px-6 py-4 border-b border-slate-100 shrink-0">
            <DialogTitle className="flex items-center gap-2">
              <Pencil className="w-4 h-4 text-blue-600" /> Edit shortcut
            </DialogTitle>
          </DialogHeader>
          <div className="overflow-y-auto flex-1 px-6 py-5">
            <ShortcutForm
              form={editForm}
              setForm={setEditForm}
              groups={groups}
              iconSearch={iconSearch}
              setIconSearch={setIconSearch}
            />
          </div>
          <DialogFooter className="px-6 py-4 border-t border-slate-100 shrink-0">
            <Button variant="outline" onClick={() => setEditShortcut(null)}>
              Cancel
            </Button>
            <Button
              disabled={
                !editForm.label.trim() || !editForm.url.trim() || saving
              }
              onClick={handleSaveShortcutEdit}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {saving ? "Saving..." : "Save changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete Shortcut Dialog ── */}
      <Dialog
        open={deleteShortcutId !== null}
        onOpenChange={() => setDeleteShortcutId(null)}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center mb-2">
              <Trash2 className="w-5 h-5 text-red-600" />
            </div>
            <DialogTitle>Delete shortcut?</DialogTitle>
            <DialogDescription>
              "
              {
                groups
                  .flatMap((g) => g.shortcuts)
                  .find((s) => s.id === deleteShortcutId)?.label
              }
              " will be permanently removed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteShortcutId(null)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteShortcut}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
