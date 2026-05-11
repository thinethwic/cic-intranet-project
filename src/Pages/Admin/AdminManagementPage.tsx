import { useState, useEffect } from "react";
import {
  Mail,
  MessageSquareText,
  Pencil,
  Plus,
  Save,
  Trash2,
  Users,
  Crown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ceoMessage, type CEOMessageConfig } from "@/Mock-data";
import {
  ActionDropdown,
  AdminCard,
  AdminPagination,
  AdminSearchInput,
  AdminSectionHeader,
  DataTable,
  StatCard,
  StatusBadge,
} from "./admin-components";
import type { Member } from "@/types";
import {
  getAllMembers,
  createMember,
  updateMember,
  deleteMember,
} from "@/lib/api/memberApi";
import { getAdminUser } from "@/lib/api/authHeaders";

import { Check, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { roleLabels } from "@/utils/segmentMapper";

const ROLE_OPTIONS = [
  "All",
  "TOP_MANAGEMENT",
  "POLICY_MANAGER",
  "PREMIER_MANAGER",
  "SENIOR_MANAGER",
  "MANAGER_LEVEL_1",
  "MANAGER_LEVEL_2",
  "JUNIOR_MANAGER",
  "SENIOR_EXECUTIVE",
  "EXECUTIVE",
  "JUNIOR_EXECUTIVE",
];
const TOP_MANAGEMENT_ROLE = "TOP_MANAGEMENT";
const CEO_MESSAGE_STORAGE_KEY = "admin-ceo-message";

function getStoredCEOMessage() {
  try {
    const stored = localStorage.getItem(CEO_MESSAGE_STORAGE_KEY);
    return stored ? (JSON.parse(stored) as CEOMessageConfig) : ceoMessage;
  } catch {
    return ceoMessage;
  }
}

const EMPTY_FORM = {
  title: "",
  firstName: "",
  lastName: "",
  role: "EXECUTIVE",
  email: "",
  phoneNo: "",
  dob: "",
  joinedDate: "",
};

function FilterDropdown({
  options,
  value,
  onChange,
  className,
}: {
  options: string[];
  value: string;
  onChange: (v: string) => void;
  className?: string;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Button
          variant="outline"
          className={`h-9 gap-2 text-sm font-normal justify-between ${
            value !== "All" ? "border-blue-500 text-blue-600" : ""
          } ${className ?? ""}`}
        >
          <span>{value}</span>
          <ChevronDown className="w-3.5 h-3.5 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-[200px]">
        {options.map((opt) => (
          <DropdownMenuItem
            key={opt}
            onClick={() => onChange(opt)}
            className="flex items-center justify-between text-sm cursor-pointer"
          >
            {opt}
            {value === opt && <Check className="w-3.5 h-3.5 text-blue-600" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function AdminManagementPage() {
  const PAGE_SIZE = 8;
  const adminUser = getAdminUser();
  const loggedUserId = adminUser?.userId ?? null;

  const [items, setItems] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");

  // Top Management pagination
  const [topPage, setTopPage] = useState(1);
  // Other Members pagination
  const [memberPage, setMemberPage] = useState(1);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Member | null>(null);
  const [deleteItem, setDeleteItem] = useState<Member | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [ceoForm, setCeoForm] = useState<CEOMessageConfig>(getStoredCEOMessage);
  const [ceoSaved, setCeoSaved] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const data = await getAllMembers();
      setItems(data);
    } catch (err) {
      console.error("Failed to fetch members", err);
    } finally {
      setLoading(false);
    }
  };

  // Split into Top Management vs everyone else, then apply search/role filter
  const topManagementAll = items.filter((m) => m.role === TOP_MANAGEMENT_ROLE);

  const otherMembersAll = items.filter((m) => m.role !== TOP_MANAGEMENT_ROLE);

  // For top management table, only apply search (role is fixed to TOP_MANAGEMENT)
  const filteredTopManagement = topManagementAll.filter((m) => {
    const query = search.toLowerCase();
    const fullName = `${m.firstName} ${m.lastName}`.toLowerCase();
    return fullName.includes(query) || m.role.toLowerCase().includes(query);
  });

  // For other members table, apply both search and role filter (excluding TOP_MANAGEMENT)
  const filteredOtherMembers = otherMembersAll.filter((m) => {
    const query = search.toLowerCase();
    const fullName = `${m.firstName} ${m.lastName}`.toLowerCase();
    const matchesSearch =
      fullName.includes(query) || m.role.toLowerCase().includes(query);
    const matchesRole =
      roleFilter === "All" ||
      (roleFilter !== TOP_MANAGEMENT_ROLE && m.role === roleFilter);
    return matchesSearch && matchesRole;
  });

  // Reset pages when filters change
  useEffect(() => {
    setTopPage(1);
    setMemberPage(1);
  }, [search, roleFilter, items.length]);

  const topTotalPages = Math.max(
    1,
    Math.ceil(filteredTopManagement.length / PAGE_SIZE),
  );
  const paginatedTop = filteredTopManagement.slice(
    (topPage - 1) * PAGE_SIZE,
    topPage * PAGE_SIZE,
  );

  const memberTotalPages = Math.max(
    1,
    Math.ceil(filteredOtherMembers.length / PAGE_SIZE),
  );
  const paginatedMembers = filteredOtherMembers.slice(
    (memberPage - 1) * PAGE_SIZE,
    memberPage * PAGE_SIZE,
  );

  const openCreate = (defaultRole?: string) => {
    setEditing(null);
    setForm({
      ...EMPTY_FORM,
      role: defaultRole ?? "EXECUTIVE",
    });
    setFormError("");
    setDialogOpen(true);
  };

  const openEdit = (member: Member) => {
    setEditing(member);
    setForm({
      title: member.title ?? "",
      firstName: member.firstName,
      lastName: member.lastName,
      role: member.role,
      email: member.email,
      phoneNo: member.phoneNo ?? "",
      dob: member.dob ?? "",
      joinedDate: member.joinedDate ?? "",
    });
    setFormError("");
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.title.trim()) {
      setFormError("Title is required.");
      return;
    }
    if (!form.firstName.trim() || !form.lastName.trim()) {
      setFormError("First and last name are required.");
      return;
    }
    if (!form.email.trim()) {
      setFormError("Email is required.");
      return;
    }

    setFormError("");

    try {
      setSaving(true);
      const dto = {
        title: form.title.trim(),
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        role: form.role,
        email: form.email.trim(),
        phoneNo: form.phoneNo || undefined,
        dob: form.dob || undefined,
        joinedDate: form.joinedDate || undefined,
        user: loggedUserId ?? undefined,
      };

      if (editing) {
        await updateMember(editing.id, dto);
      } else {
        await createMember(dto);
      }

      await fetchMembers();
      setDialogOpen(false);
    } catch (err) {
      console.error("Failed to save member", err);
      setFormError("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteItem) return;
    try {
      await deleteMember(deleteItem.id);
      await fetchMembers();
      setDeleteItem(null);
    } catch (err) {
      console.error("Failed to delete member", err);
    }
  };

  const updateCEOMessage = (index: number, value: string) => {
    setCeoForm((prev) => ({
      ...prev,
      messages: prev.messages.map((msg, i) => (i === index ? value : msg)),
    }));
    setCeoSaved(false);
  };

  const addCEOMessage = () => {
    setCeoForm((prev) => ({ ...prev, messages: [...prev.messages, ""] }));
    setCeoSaved(false);
  };

  const removeCEOMessage = (index: number) => {
    setCeoForm((prev) => ({
      ...prev,
      messages:
        prev.messages.length > 1
          ? prev.messages.filter((_, i) => i !== index)
          : prev.messages,
    }));
    setCeoSaved(false);
  };

  const saveCEOMessage = () => {
    const cleaned = {
      ...ceoForm,
      name: ceoForm.name.trim(),
      image: ceoForm.image.trim() || ceoMessage.image,
      messages: ceoForm.messages.map((m) => m.trim()).filter(Boolean),
    };
    if (!cleaned.name || cleaned.messages.length === 0) return;
    localStorage.setItem(CEO_MESSAGE_STORAGE_KEY, JSON.stringify(cleaned));
    setCeoForm(cleaned);
    setCeoSaved(true);
  };

  // Shared columns renderer
  const memberColumns = [
    {
      key: "name",
      header: "Name",
      cell: (m: Member) => (
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-violet-50 text-sm font-semibold text-violet-700">
            {m.firstName[0]}
            {m.lastName[0]}
          </div>
          <div>
            <p className="font-medium">
              {m.firstName} {m.lastName}
            </p>
            <p className="text-xs text-muted-foreground">{m.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "role",
      header: "Role",
      cell: (m: Member) => roleLabels[m.role] ?? m.role,
    },
    { key: "title", header: "Title", cell: (m: Member) => m.title ?? "—" },
    { key: "phone", header: "Phone", cell: (m: Member) => m.phoneNo ?? "—" },
    {
      key: "joined",
      header: "Joined",
      cell: (m: Member) =>
        m.joinedDate
          ? new Date(m.joinedDate).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })
          : "—",
    },
    {
      key: "actions",
      header: "",
      className: "text-right",
      cell: (m: Member) => (
        <div className="flex justify-end">
          <ActionDropdown
            actions={[
              { label: "Edit", icon: Pencil, onClick: () => openEdit(m) },
              {
                label: "Delete",
                icon: Trash2,
                onClick: () => setDeleteItem(m),
                destructive: true,
              },
            ]}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 p-6">
      <AdminSectionHeader
        title="Management"
        description="Maintain leadership and management profiles shown across the intranet."
        action={
          <Button onClick={() => openCreate()} className="gap-2 rounded-2xl">
            <Plus className="h-4 w-4" /> Add Member
          </Button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <StatCard
          title="Profiles"
          value={loading ? "..." : items.length}
          icon={Users}
          tone="violet"
        />
        <StatCard
          title="Top Management"
          value={loading ? "..." : topManagementAll.length}
          icon={Crown}
          tone="amber"
        />
        <StatCard
          title="With Accounts"
          value={loading ? "..." : items.filter((m) => m.userId).length}
          icon={Mail}
          tone="emerald"
        />
      </div>

      {/* CEO Message */}
      <AdminCard>
        <CardContent className="space-y-6 p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <MessageSquareText className="h-5 w-5 text-blue-600" />
                <h2 className="text-lg font-medium">CEO Message</h2>
              </div>
              <p className="text-sm text-muted-foreground">
                Update the CEO name, image path, and rotating homepage messages.
              </p>
            </div>
            <Button
              onClick={saveCEOMessage}
              disabled={
                !ceoForm.name.trim() || ceoForm.messages.every((m) => !m.trim())
              }
              className="gap-2 rounded-2xl"
            >
              <Save className="h-4 w-4" /> Save CEO Message
            </Button>
          </div>

          <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
            <div className="space-y-4 rounded-2xl border bg-muted/30 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl bg-blue-50 text-lg font-semibold text-blue-700">
                  {ceoForm.image ? (
                    <img
                      src={ceoForm.image}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    ceoForm.name.charAt(0) || "C"
                  )}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">
                    {ceoForm.name || "Chief Executive Officer"}
                  </p>
                  <p className="text-xs text-muted-foreground">CEO Message</p>
                </div>
              </div>
              <p className="line-clamp-5 text-sm italic leading-relaxed text-blue-800">
                {ceoForm.messages.find((m) => m.trim()) ||
                  "Add at least one message."}
              </p>
              {ceoSaved && (
                <StatusBadge tone="emerald">
                  Saved to admin settings
                </StatusBadge>
              )}
            </div>

            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">
                    CEO name
                  </Label>
                  <Input
                    value={ceoForm.name}
                    onChange={(e) => {
                      setCeoForm((p) => ({ ...p, name: e.target.value }));
                      setCeoSaved(false);
                    }}
                    placeholder="Mr. Ajith Weerasinghe"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">
                    Image path
                  </Label>
                  <Input
                    value={ceoForm.image}
                    onChange={(e) => {
                      setCeoForm((p) => ({ ...p, image: e.target.value }));
                      setCeoSaved(false);
                    }}
                    placeholder="/ceo.jpg"
                  />
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-4">
                  <Label className="text-sm text-muted-foreground">
                    Rotating messages
                  </Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addCEOMessage}
                    className="gap-2 rounded-2xl"
                  >
                    <Plus className="h-4 w-4" /> Add Message
                  </Button>
                </div>
                {ceoForm.messages.map((msg, i) => (
                  <div key={i} className="grid gap-2">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-xs text-muted-foreground">
                        Message {i + 1}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeCEOMessage(i)}
                        disabled={ceoForm.messages.length === 1}
                        className="h-8 rounded-2xl text-destructive hover:text-destructive"
                      >
                        Remove
                      </Button>
                    </div>
                    <Textarea
                      value={msg}
                      onChange={(e) => updateCEOMessage(i, e.target.value)}
                      className="min-h-24 resize-none rounded-2xl"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </AdminCard>

      {/* Search & Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <AdminSearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search management..."
        />
        <FilterDropdown
          options={ROLE_OPTIONS.filter((o) => o !== "TOP_MANAGEMENT").map(
            (o) => (o === "All" ? "All" : (roleLabels[o] ?? o)),
          )}
          value={
            roleFilter === "TOP_MANAGEMENT" || roleFilter === "All"
              ? "All"
              : (roleLabels[roleFilter] ?? roleFilter)
          }
          onChange={(label) => {
            if (label === "All") {
              setRoleFilter("All");
            } else {
              // reverse map label back to the raw role key
              const key =
                Object.entries(roleLabels).find(([, v]) => v === label)?.[0] ??
                label;
              setRoleFilter(key);
            }
          }}
          className="min-w-[180px]"
        />
      </div>

      {/* ── Top Management Table ── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-amber-500" />
            <h2 className="text-base font-semibold">Top Management</h2>
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
              {topManagementAll.length}
            </span>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => openCreate(TOP_MANAGEMENT_ROLE)}
            className="gap-2 rounded-2xl"
          >
            <Plus className="h-4 w-4" /> Add Top Management
          </Button>
        </div>

        <DataTable
          data={paginatedTop}
          getRowKey={(m) => m.id}
          emptyLabel={
            loading
              ? "Loading top management..."
              : "No top management profiles found"
          }
          columns={memberColumns}
        />

        <AdminPagination
          page={topPage}
          totalPages={topTotalPages}
          totalItems={filteredTopManagement.length}
          pageSize={PAGE_SIZE}
          itemLabel="top management profiles"
          onPageChange={setTopPage}
        />
      </div>

      {/* ── Other Members Table ── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-violet-500" />
            <h2 className="text-base font-semibold">Members</h2>
            <span className="rounded-full bg-violet-100 px-2 py-0.5 text-xs font-medium text-violet-700">
              {otherMembersAll.length}
            </span>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => openCreate()}
            className="gap-2 rounded-2xl"
          >
            <Plus className="h-4 w-4" /> Add Member
          </Button>
        </div>

        <DataTable
          data={paginatedMembers}
          getRowKey={(m) => m.id}
          emptyLabel={
            loading ? "Loading members..." : "No management profiles found"
          }
          columns={memberColumns}
        />

        <AdminPagination
          page={memberPage}
          totalPages={memberTotalPages}
          totalItems={filteredOtherMembers.length}
          pageSize={PAGE_SIZE}
          itemLabel="profiles"
          onPageChange={setMemberPage}
        />
      </div>

      {/* Create / Edit Dialog */}
      <Dialog
        open={dialogOpen}
        onOpenChange={(o) => {
          if (!o) setDialogOpen(false);
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit member" : "Add member"}</DialogTitle>
            <DialogDescription>
              Keep profile details concise and ready for publishing.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">
                  Title <span className="text-destructive">*</span>
                </Label>
                <Input
                  placeholder="Mr, Mrs, Dr..."
                  value={form.title}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, title: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Role</Label>
                <select
                  value={form.role}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, role: e.target.value }))
                  }
                  className="h-10 w-full rounded-2xl border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/40"
                >
                  {ROLE_OPTIONS.filter((o) => o !== "All").map((o) => (
                    <option key={o}>{o}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">
                  First name <span className="text-destructive">*</span>
                </Label>
                <Input
                  value={form.firstName}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, firstName: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">
                  Last name <span className="text-destructive">*</span>
                </Label>
                <Input
                  value={form.lastName}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, lastName: e.target.value }))
                  }
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">
                  Email <span className="text-destructive">*</span>
                </Label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, email: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Phone</Label>
                <Input
                  value={form.phoneNo}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, phoneNo: e.target.value }))
                  }
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">
                  Date of birth
                </Label>
                <Input
                  type="date"
                  value={form.dob}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, dob: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">
                  Joined date
                </Label>
                <Input
                  type="date"
                  value={form.joinedDate}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, joinedDate: e.target.value }))
                  }
                />
              </div>
            </div>

            {formError && (
              <p className="text-sm text-destructive">{formError}</p>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!form.title.trim() || !form.firstName.trim() || saving}
            >
              {saving ? "Saving..." : "Save member"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={!!deleteItem} onOpenChange={() => setDeleteItem(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete profile?</DialogTitle>
            <DialogDescription>
              "{deleteItem?.firstName} {deleteItem?.lastName}" will be removed
              from management.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteItem(null)}>
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
