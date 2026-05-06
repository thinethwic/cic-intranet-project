import { useEffect, useMemo, useState } from "react";
import {
  Check,
  ChevronDown,
  Edit3,
  Layers,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  adminGetCategories,
  adminCreateCategory,
  adminUpdateCategory,
  adminDeleteCategory,
  type TicketCategory,
} from "@/lib/api/ticketApi";

// ── Configs ──────────────────────────────────────────────────────────────────

const SEGMENT_OPTIONS = [
  {
    value: "CIC_FEEDS",
    label: "CIC Feeds",
    className: "bg-green-50 text-green-700 border-green-200",
  },
  {
    value: "CIC_VET_CARE",
    label: "CIC Vet Care",
    className: "bg-purple-50 text-purple-700 border-purple-200",
  },
  {
    value: "CIC_POULTRY",
    label: "CIC Poultry",
    className: "bg-orange-50 text-orange-700 border-orange-200",
  },
  {
    value: "AISA_VET",
    label: "Asia Vet",
    className: "bg-teal-50 text-teal-700 border-teal-200",
  },
];

const SEGMENT_MAP = Object.fromEntries(
  SEGMENT_OPTIONS.map((s) => [s.value, s]),
);

const EMPTY_FORM = { name: "", segment: "", department: "" };

// ── Sub-components ────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number | string;
  color: string;
}) {
  return (
    <div className="rounded-xl bg-slate-50 p-4 flex items-center gap-4">
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-lg ${color}`}
      >
        <Layers className="h-5 w-5" />
      </div>
      <div>
        <p className="text-xs text-slate-500">{label}</p>
        <p className="text-2xl font-semibold">{value}</p>
      </div>
    </div>
  );
}

function FilterDropdown({
  options,
  value,
  onChange,
  className,
}: {
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}) {
  const isActive = value !== options[0].value;
  const current = options.find((o) => o.value === value) ?? options[0];
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className={`h-9 min-w-[140px] justify-between gap-2 text-sm font-normal ${
            isActive ? "border-blue-500 text-blue-600" : ""
          } ${className ?? ""}`}
        >
          <span>{current.label}</span>
          <ChevronDown className="h-3.5 w-3.5 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-[160px]">
        {options.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onClick={() => onChange(option.value)}
            className="flex cursor-pointer items-center justify-between text-sm"
          >
            {option.label}
            {value === option.value && (
              <Check className="h-3.5 w-3.5 text-blue-600" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<TicketCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");
  const [segmentFilter, setSegmentFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [showCreate, setShowCreate] = useState(false);
  const [editItem, setEditItem] = useState<TicketCategory | null>(null);
  const [deleteItem, setDeleteItem] = useState<TicketCategory | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setCategories(await adminGetCategories());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ── Derived ───────────────────────────────────────────────────────────────

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return categories.filter((cat) => {
      const matchSearch =
        cat.name.toLowerCase().includes(q) ||
        (cat.department ?? "").toLowerCase().includes(q) ||
        (cat.segment ?? "").toLowerCase().includes(q);
      const matchSegment =
        segmentFilter === "ALL" ||
        cat.segment === segmentFilter ||
        (!cat.segment && segmentFilter === "NONE");
      const matchStatus =
        statusFilter === "ALL" ||
        (statusFilter === "ACTIVE" && cat.active) ||
        (statusFilter === "INACTIVE" && !cat.active);
      return matchSearch && matchSegment && matchStatus;
    });
  }, [categories, search, segmentFilter, statusFilter]);

  const stats = [
    {
      label: "Total categories",
      value: loading ? "..." : categories.length,
      color: "bg-blue-50 text-blue-600",
    },
    {
      label: "Active",
      value: loading ? "..." : categories.filter((c) => c.active).length,
      color: "bg-emerald-50 text-emerald-600",
    },
    {
      label: "Inactive",
      value: loading ? "..." : categories.filter((c) => !c.active).length,
      color: "bg-slate-100 text-slate-500",
    },
    {
      label: "Segments covered",
      value: loading
        ? "..."
        : new Set(categories.map((c) => c.segment).filter(Boolean)).size,
      color: "bg-violet-50 text-violet-600",
    },
  ];

  // ── Handlers ─────────────────────────────────────────────────────────────

  const handleCreate = async () => {
    if (!form.name.trim()) return;
    try {
      setSaving(true);
      await adminCreateCategory({
        name: form.name.trim(),
        segment: form.segment || null,
        department: form.department.trim() || null,
      });
      await fetchCategories();
      setForm({ ...EMPTY_FORM });
      setShowCreate(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = async () => {
    if (!editItem || !form.name.trim()) return;
    try {
      setSaving(true);
      await adminUpdateCategory(editItem.id, {
        name: form.name.trim(),
        segment: form.segment || null,
        department: form.department.trim() || null,
        active: editItem.active,
      });
      await fetchCategories();
      setEditItem(null);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (cat: TicketCategory) => {
    try {
      await adminUpdateCategory(cat.id, { ...cat, active: !cat.active });
      await fetchCategories();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async () => {
    if (!deleteItem) return;
    try {
      setSaving(true);
      await adminDeleteCategory(deleteItem.id);
      await fetchCategories();
      setDeleteItem(null);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const openEdit = (cat: TicketCategory) => {
    setEditItem(cat);
    setForm({
      name: cat.name,
      segment: cat.segment ?? "",
      department: cat.department ?? "",
    });
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6 p-6">
      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Ticket Categories
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage categories shown to employees when submitting tickets.
          </p>
        </div>
        <Button
          onClick={() => {
            setForm({ ...EMPTY_FORM });
            setShowCreate(true);
          }}
          className="gap-2 bg-blue-900 text-white hover:bg-blue-800"
        >
          <Plus className="h-4 w-4" />
          Add Category
        </Button>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      {/* ── Filters ── */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[220px] flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            className="h-9 pl-9"
            placeholder="Search by name, segment or department..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Segment filter */}
        <FilterDropdown
          options={[
            { value: "ALL", label: "All Segments" },
            { value: "NONE", label: "No Segment" },
            ...SEGMENT_OPTIONS.map((s) => ({ value: s.value, label: s.label })),
          ]}
          value={segmentFilter}
          onChange={setSegmentFilter}
        />

        {/* Status filter */}
        <FilterDropdown
          options={[
            { value: "ALL", label: "All Status" },
            { value: "ACTIVE", label: "Active" },
            { value: "INACTIVE", label: "Inactive" },
          ]}
          value={statusFilter}
          onChange={setStatusFilter}
        />
      </div>

      {/* ── Table ── */}
      <Card className="overflow-hidden border border-slate-200 shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 hover:bg-slate-50">
                <TableHead className="pl-5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Name
                </TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Segment
                </TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Department
                </TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Status
                </TableHead>
                <TableHead className="pr-5 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="py-14 text-center text-sm text-slate-400"
                  >
                    Loading categories...
                  </TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="py-14 text-center text-sm text-slate-400"
                  >
                    <Layers className="mx-auto mb-2 h-8 w-8 opacity-25" />
                    No categories found
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((cat) => {
                  const seg = cat.segment ? SEGMENT_MAP[cat.segment] : null;
                  return (
                    <TableRow
                      key={cat.id}
                      className="group border-b border-slate-100 hover:bg-slate-50/70"
                    >
                      {/* Name */}
                      <TableCell className="pl-5 py-3.5 text-sm font-medium text-slate-800">
                        {cat.name}
                      </TableCell>

                      {/* Segment */}
                      <TableCell className="py-3.5">
                        {seg ? (
                          <Badge
                            variant="outline"
                            className={`px-2 text-[10px] ${seg.className}`}
                          >
                            {seg.label}
                          </Badge>
                        ) : (
                          <span className="text-xs text-slate-300">All</span>
                        )}
                      </TableCell>

                      {/* Department */}
                      <TableCell className="py-3.5 text-sm text-slate-600">
                        {cat.department ?? (
                          <span className="text-xs text-slate-300">All</span>
                        )}
                      </TableCell>

                      {/* Status toggle */}
                      <TableCell className="py-3.5">
                        <button
                          onClick={() => handleToggleActive(cat)}
                          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-medium transition-colors ${
                            cat.active
                              ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                              : "border-slate-200 bg-slate-100 text-slate-500 hover:bg-slate-200"
                          }`}
                        >
                          {cat.active ? (
                            <Check className="h-3 w-3" />
                          ) : (
                            <X className="h-3 w-3" />
                          )}
                          {cat.active ? "Active" : "Inactive"}
                        </button>
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="pr-5 py-3.5">
                        <div className="flex justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 hover:bg-amber-50 hover:text-amber-600"
                            onClick={() => openEdit(cat)}
                            title="Edit category"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 hover:bg-red-50 hover:text-red-600"
                            onClick={() => setDeleteItem(cat)}
                            title="Delete category"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {filtered.length > 0 && !loading && (
        <p className="text-right text-xs text-slate-400">
          Showing {filtered.length} of {categories.length} categories
        </p>
      )}

      {/* ── Create / Edit Dialog ── */}
      {(
        [
          {
            open: showCreate,
            onClose: () => setShowCreate(false),
            onSave: handleCreate,
            title: "Add Category",
          },
          {
            open: !!editItem,
            onClose: () => setEditItem(null),
            onSave: handleEdit,
            title: "Edit Category",
          },
        ] as const
      ).map(({ open, onClose, onSave, title }) => (
        <Dialog
          key={title}
          open={open}
          onOpenChange={(o) => {
            if (!o) onClose();
          }}
        >
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {title === "Add Category" ? (
                  <Plus className="h-4 w-4 text-blue-600" />
                ) : (
                  <Edit3 className="h-4 w-4 text-blue-600" />
                )}
                {title}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              {/* Name */}
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-slate-600">
                  Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  placeholder="e.g. Network Issue, Payroll Query"
                  value={form.name}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, name: e.target.value }))
                  }
                />
              </div>

              {/* Segment */}
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-slate-600">
                  Segment{" "}
                  <span className="text-slate-400">
                    (optional — leave blank for all)
                  </span>
                </Label>
                <select
                  value={form.segment}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, segment: e.target.value }))
                  }
                  className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-blue-200"
                >
                  <option value="">All Segments</option>
                  {SEGMENT_OPTIONS.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Department */}
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-slate-600">
                  Department{" "}
                  <span className="text-slate-400">
                    (optional — leave blank for all)
                  </span>
                </Label>
                <Input
                  placeholder="e.g. Engineering, HR, Finance"
                  value={form.department}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, department: e.target.value }))
                  }
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                onClick={onSave}
                disabled={!form.name.trim() || saving}
                className="bg-blue-900 text-white hover:bg-blue-800"
              >
                {saving ? "Saving..." : "Save"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      ))}

      {/* ── Delete Dialog ── */}
      <Dialog
        open={!!deleteItem}
        onOpenChange={(o) => {
          if (!o) setDeleteItem(null);
        }}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-red-50">
              <Trash2 className="h-5 w-5 text-red-600" />
            </div>
            <DialogTitle>Delete category?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-slate-500">
            "{deleteItem?.name}" will be permanently removed.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteItem(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={saving}
            >
              {saving ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
