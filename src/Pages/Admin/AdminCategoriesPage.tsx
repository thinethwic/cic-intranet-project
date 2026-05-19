import { useEffect, useMemo, useState } from "react";
import {
  Building2,
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
import {
  adminGetDepartments,
  adminCreateDepartment,
  adminUpdateDepartment,
  adminDeleteDepartment,
  type Department,
  type SegmentValue,
  adminGetDepartmentsPaged,
} from "@/lib/api/departmentApi";
import { AdminPagination } from "./admin-components";
import { useSearchParams } from "react-router-dom";

// ── Shared config ─────────────────────────────────────────────────────────────

const SEGMENT_OPTIONS = [
  {
    value: "CIC_FEEDS" as SegmentValue,
    label: "CIC Feeds",
    className: "bg-green-50 text-green-700 border-green-200",
  },
  {
    value: "CIC_VET_CARE" as SegmentValue,
    label: "CIC Vetcare",
    className: "bg-purple-50 text-purple-700 border-purple-200",
  },
  {
    value: "CIC_POULTRY" as SegmentValue,
    label: "CIC Poultry",
    className: "bg-orange-50 text-orange-700 border-orange-200",
  },
  {
    value: "AISA_VET" as SegmentValue,
    label: "Asiavet",
    className: "bg-teal-50 text-teal-700 border-teal-200",
  },
];

const SEGMENT_MAP = Object.fromEntries(
  SEGMENT_OPTIONS.map((s) => [s.value, s]),
);

const EMPTY_CAT_FORM = { name: "", segment: "", department: "" };
const EMPTY_DEPT_FORM = {
  name: "",
  code: "",
  segment: "" as SegmentValue | "",
};
const CATEGORY_PAGE_SIZE = 10;
const DEPARTMENT_PAGE_SIZE = 10;

// ── Reusable sub-components ───────────────────────────────────────────────────

function StatCard({
  label,
  value,
  color,
  icon: Icon,
}: {
  label: string;
  value: number | string;
  color: string;
  icon?: React.ElementType;
}) {
  const IconComponent = Icon ?? Layers;
  return (
    <div className="rounded-xl bg-slate-50 p-4 flex items-center gap-4">
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-lg ${color}`}
      >
        <IconComponent className="h-5 w-5" />
      </div>
      <div>
        <p className="text-xs text-slate-500">{label}</p>
        <p className="text-2xl font-semibold">{value}</p>
      </div>
    </div>
  );
}

function SegmentBadge({ segment }: { segment?: string | null }) {
  if (!segment) return <span className="text-xs text-slate-300">All</span>;
  const seg = SEGMENT_MAP[segment];
  if (!seg) return <span className="text-xs text-slate-400">{segment}</span>;
  return (
    <Badge variant="outline" className={`px-2 text-[10px] ${seg.className}`}>
      {seg.label}
    </Badge>
  );
}

function FilterDropdown({
  options,
  value,
  onChange,
}: {
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
}) {
  const isActive = value !== options[0].value;
  const current = options.find((o) => o.value === value) ?? options[0];
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Button
          variant="outline"
          className={`h-9 min-w-[140px] justify-between gap-2 text-sm font-normal ${isActive ? "border-blue-500 text-blue-600" : ""}`}
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

function TabPill({
  active,
  onClick,
  icon: Icon,
  label,
  count,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ElementType;
  label: string;
  count?: number;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
        active
          ? "bg-white text-slate-900 shadow-sm border border-slate-200"
          : "text-slate-500 hover:text-slate-700"
      }`}
    >
      <Icon className="h-4 w-4" />
      {label}
      {count !== undefined && (
        <span
          className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
            active ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-500"
          }`}
        >
          {count}
        </span>
      )}
    </button>
  );
}

// ── Category form — defined OUTSIDE CategoriesTab so it never remounts ────────

interface CatFormProps {
  form: typeof EMPTY_CAT_FORM;
  setForm: React.Dispatch<React.SetStateAction<typeof EMPTY_CAT_FORM>>;
  segmentDepartments: Department[];
  loadingDepts: boolean;
  error: string;
}

function CategoryForm({
  form,
  setForm,
  segmentDepartments,
  loadingDepts,
  error,
}: CatFormProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-slate-600">
          Name <span className="text-red-500">*</span>
        </Label>
        <Input
          placeholder="e.g. Network Issue, Payroll Query"
          value={form.name}
          onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
          autoComplete="off"
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-slate-600">
          Segment <span className="text-slate-400">(optional)</span>
        </Label>
        <select
          value={form.segment}
          onChange={(e) =>
            setForm((p) => ({ ...p, segment: e.target.value, department: "" }))
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

      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-slate-600">
          Department <span className="text-slate-400">(optional)</span>
        </Label>
        {/* Show a select when a segment is chosen, otherwise a plain text input */}
        {form.segment ? (
          <select
            value={form.department}
            onChange={(e) =>
              setForm((p) => ({ ...p, department: e.target.value }))
            }
            disabled={loadingDepts}
            className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-blue-200 disabled:opacity-50"
          >
            <option value="">
              {loadingDepts ? "Loading departments…" : "Select Department"}
            </option>
            {segmentDepartments.map((d) => (
              <option key={d.id} value={d.name}>
                {d.name}
              </option>
            ))}
          </select>
        ) : (
          <Input
            placeholder="e.g. Engineering, HR, Finance"
            value={form.department}
            onChange={(e) =>
              setForm((p) => ({ ...p, department: e.target.value }))
            }
            autoComplete="off"
          />
        )}
      </div>

      {error && (
        <p className="text-xs text-red-500 bg-red-50 rounded px-3 py-2">
          {error}
        </p>
      )}
    </div>
  );
}

// ── Dept form — defined OUTSIDE DepartmentsTab so it never remounts ───────────

interface DeptFormProps {
  form: typeof EMPTY_DEPT_FORM;
  setForm: React.Dispatch<React.SetStateAction<typeof EMPTY_DEPT_FORM>>;
  error: string;
}

const autoCode = (name: string) =>
  name
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "_")
    .replace(/^_|_$/g, "")
    .slice(0, 20);

function DeptForm({ form, setForm, error }: DeptFormProps) {
  const handleNameChange = (name: string) => {
    setForm((p) => ({
      ...p,
      name,
      // Only auto-fill code if it still matches the previous auto-generated value
      ...(p.code === "" || p.code === autoCode(p.name)
        ? { code: autoCode(name) }
        : {}),
    }));
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5 col-span-2">
          <Label className="text-xs font-medium text-slate-600">
            Name <span className="text-red-500">*</span>
          </Label>
          <Input
            placeholder="e.g. Human Resources"
            value={form.name}
            onChange={(e) => handleNameChange(e.target.value)}
            autoComplete="off"
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-slate-600">
            Code <span className="text-red-500">*</span>
            <span className="text-slate-400 font-normal ml-1">
              (unique, uppercase)
            </span>
          </Label>
          <Input
            placeholder="e.g. HR"
            value={form.code}
            onChange={(e) =>
              setForm((p) => ({
                ...p,
                code: e.target.value.toUpperCase().replace(/[^A-Z0-9_\-]/g, ""),
              }))
            }
            autoComplete="off"
            className="font-mono text-sm"
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-slate-600">
            Segment <span className="text-red-500">*</span>
          </Label>
          <select
            value={form.segment}
            onChange={(e) =>
              setForm((p) => ({
                ...p,
                segment: e.target.value as SegmentValue | "",
              }))
            }
            className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-blue-200"
          >
            <option value="">Select segment</option>
            {SEGMENT_OPTIONS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <p className="text-xs text-red-500 bg-red-50 rounded px-3 py-2">
          {error}
        </p>
      )}
    </div>
  );
}

// ── Categories tab ────────────────────────────────────────────────────────────

function CategoriesTab() {
  const [categories, setCategories] = useState<TicketCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [segmentFilter, setSegmentFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [showCreate, setShowCreate] = useState(false);
  const [editItem, setEditItem] = useState<TicketCategory | null>(null);
  const [deleteItem, setDeleteItem] = useState<TicketCategory | null>(null);
  const [form, setForm] = useState({ ...EMPTY_CAT_FORM });
  const [error, setError] = useState("");

  // Departments for the currently-selected segment in the form
  const [segmentDepartments, setSegmentDepartments] = useState<Department[]>(
    [],
  );
  const [loadingDepts, setLoadingDepts] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  // Re-fetch departments whenever the chosen segment changes
  useEffect(() => {
    if (!form.segment) {
      setSegmentDepartments([]);
      return;
    }
    let cancelled = false;
    setLoadingDepts(true);
    adminGetDepartments(form.segment as SegmentValue)
      .then((depts) => {
        if (!cancelled) setSegmentDepartments(depts);
      })
      .catch(console.error)
      .finally(() => {
        if (!cancelled) setLoadingDepts(false);
      });
    return () => {
      cancelled = true;
    };
  }, [form.segment]);

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

  useEffect(() => {
    setPage(1);
  }, [search, segmentFilter, statusFilter, categories.length]);

  const totalPages = Math.max(
    1,
    Math.ceil(filtered.length / CATEGORY_PAGE_SIZE),
  );
  const paginated = filtered.slice(
    (page - 1) * CATEGORY_PAGE_SIZE,
    page * CATEGORY_PAGE_SIZE,
  );

  const stats = [
    {
      label: "Total",
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

  const handleCreate = async () => {
    if (!form.name.trim()) return;
    try {
      setSaving(true);
      setError("");
      await adminCreateCategory({
        name: form.name.trim(),
        segment: form.segment || null,
        department: form.department.trim() || null,
      });
      await fetchCategories();
      setForm({ ...EMPTY_CAT_FORM });
      setShowCreate(false);
    } catch (err: any) {
      setError(err.message ?? "Failed to create");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = async () => {
    if (!editItem || !form.name.trim()) return;
    try {
      setSaving(true);
      setError("");
      await adminUpdateCategory(editItem.id, {
        name: form.name.trim(),
        segment: form.segment || null,
        department: form.department.trim() || null,
        active: editItem.active,
      });
      await fetchCategories();
      setEditItem(null);
    } catch (err: any) {
      setError(err.message ?? "Failed to update");
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
    setError("");
  };

  const sharedFormProps: CatFormProps = {
    form,
    setForm,
    segmentDepartments,
    loadingDepts,
    error,
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[220px] flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            className="h-9 pl-9"
            placeholder="Search by name, segment or department..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoComplete="off"
            type="search"
          />
        </div>
        <FilterDropdown
          options={[
            { value: "ALL", label: "All Segments" },
            { value: "NONE", label: "No Segment" },
            ...SEGMENT_OPTIONS.map((s) => ({ value: s.value, label: s.label })),
          ]}
          value={segmentFilter}
          onChange={setSegmentFilter}
        />
        <FilterDropdown
          options={[
            { value: "ALL", label: "All Status" },
            { value: "ACTIVE", label: "Active" },
            { value: "INACTIVE", label: "Inactive" },
          ]}
          value={statusFilter}
          onChange={setStatusFilter}
        />
        <Button
          onClick={() => {
            setForm({ ...EMPTY_CAT_FORM });
            setError("");
            setShowCreate(true);
          }}
          className="gap-2 bg-blue-900 text-white hover:bg-blue-800 ml-auto"
        >
          <Plus className="h-4 w-4" /> Add Category
        </Button>
      </div>

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
                paginated.map((cat) => (
                  <TableRow
                    key={cat.id}
                    className="group border-b border-slate-100 hover:bg-slate-50/70"
                  >
                    <TableCell className="pl-5 py-3.5 text-sm font-medium text-slate-800">
                      {cat.name}
                    </TableCell>
                    <TableCell className="py-3.5">
                      <SegmentBadge segment={cat.segment} />
                    </TableCell>
                    <TableCell className="py-3.5 text-sm text-slate-600">
                      {cat.department ?? (
                        <span className="text-xs text-slate-300">All</span>
                      )}
                    </TableCell>
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
                    <TableCell className="pr-5 py-3.5">
                      <div className="flex justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 hover:bg-amber-50 hover:text-amber-600"
                          onClick={() => openEdit(cat)}
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 hover:bg-red-50 hover:text-red-600"
                          onClick={() => setDeleteItem(cat)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
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

      <AdminPagination
        page={page}
        totalPages={totalPages}
        totalItems={filtered.length}
        pageSize={CATEGORY_PAGE_SIZE}
        itemLabel="categories"
        onPageChange={setPage}
      />

      {/* Create Dialog */}
      <Dialog
        open={showCreate}
        onOpenChange={(o) => {
          if (!o) {
            setShowCreate(false);
            setError("");
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-4 w-4 text-blue-600" /> Add Category
            </DialogTitle>
          </DialogHeader>
          <CategoryForm {...sharedFormProps} />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowCreate(false);
                setError("");
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={!form.name.trim() || saving}
              className="bg-blue-900 text-white hover:bg-blue-800"
            >
              {saving ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog
        open={!!editItem}
        onOpenChange={(o) => {
          if (!o) {
            setEditItem(null);
            setError("");
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit3 className="h-4 w-4 text-blue-600" /> Edit Category
            </DialogTitle>
          </DialogHeader>
          <CategoryForm {...sharedFormProps} />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setEditItem(null);
                setError("");
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleEdit}
              disabled={!form.name.trim() || saving}
              className="bg-blue-900 text-white hover:bg-blue-800"
            >
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
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

// ── Departments tab ───────────────────────────────────────────────────────────

function DepartmentsTab() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [segmentFilter, setSegmentFilter] = useState("ALL");
  const [showCreate, setShowCreate] = useState(false);
  const [editItem, setEditItem] = useState<Department | null>(null);
  const [deleteItem, setDeleteItem] = useState<Department | null>(null);
  const [form, setForm] = useState({ ...EMPTY_DEPT_FORM });
  const [error, setError] = useState("");

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const data = await adminGetDepartmentsPaged(0, 100); // ← use paged
      setDepartments(data.content);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return departments.filter((d) => {
      const matchSearch =
        d.name.toLowerCase().includes(q) ||
        d.code.toLowerCase().includes(q) ||
        d.segment.toLowerCase().includes(q);
      const matchSegment =
        segmentFilter === "ALL" || d.segment === segmentFilter;
      return matchSearch && matchSegment;
    });
  }, [departments, search, segmentFilter]);

  useEffect(() => {
    setPage(1);
  }, [search, segmentFilter, departments.length]);

  const totalPages = Math.max(
    1,
    Math.ceil(filtered.length / DEPARTMENT_PAGE_SIZE),
  );
  const paginated = filtered.slice(
    (page - 1) * DEPARTMENT_PAGE_SIZE,
    page * DEPARTMENT_PAGE_SIZE,
  );

  const segmentCounts = useMemo(
    () =>
      SEGMENT_OPTIONS.map((s) => ({
        ...s,
        count: departments.filter((d) => d.segment === s.value).length,
      })),
    [departments],
  );

  const handleCreate = async () => {
    if (!form.name.trim() || !form.code.trim() || !form.segment) return;
    try {
      setSaving(true);
      setError("");
      await adminCreateDepartment({
        name: form.name.trim(),
        code: form.code.trim().toUpperCase(),
        segment: form.segment as SegmentValue,
      });
      await fetchDepartments();
      setForm({ ...EMPTY_DEPT_FORM });
      setShowCreate(false);
    } catch (err: any) {
      setError(err.message ?? "Failed to create department");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = async () => {
    if (!editItem || !form.name.trim() || !form.code.trim() || !form.segment)
      return;
    try {
      setSaving(true);
      setError("");
      await adminUpdateDepartment(editItem.id, {
        name: form.name.trim(),
        code: form.code.trim().toUpperCase(),
        segment: form.segment as SegmentValue,
      });
      await fetchDepartments();
      setEditItem(null);
    } catch (err: any) {
      setError(err.message ?? "Failed to update department");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteItem) return;
    try {
      setSaving(true);
      await adminDeleteDepartment(deleteItem.id);
      await fetchDepartments();
      setDeleteItem(null);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const openEdit = (dept: Department) => {
    setEditItem(dept);
    setForm({ name: dept.name, code: dept.code, segment: dept.segment });
    setError("");
  };

  const fmtDate = (d?: string) => {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const sharedDeptProps: DeptFormProps = { form, setForm, error };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {segmentCounts.map((s) => (
          <div
            key={s.value}
            className="rounded-xl bg-slate-50 p-4 flex items-center gap-3"
          >
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                s.value === "CIC_FEEDS"
                  ? "bg-green-50 text-green-600"
                  : s.value === "CIC_VET_CARE"
                    ? "bg-purple-50 text-purple-600"
                    : s.value === "CIC_POULTRY"
                      ? "bg-orange-50 text-orange-600"
                      : "bg-teal-50 text-teal-600"
              }`}
            >
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500">{s.label}</p>
              <p className="text-2xl font-semibold">
                {loading ? "..." : s.count}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[220px] flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            className="h-9 pl-9"
            placeholder="Search by name or code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoComplete="off"
            type="search"
          />
        </div>
        <FilterDropdown
          options={[
            { value: "ALL", label: "All Segments" },
            ...SEGMENT_OPTIONS.map((s) => ({ value: s.value, label: s.label })),
          ]}
          value={segmentFilter}
          onChange={setSegmentFilter}
        />
        <Button
          onClick={() => {
            setForm({ ...EMPTY_DEPT_FORM });
            setError("");
            setShowCreate(true);
          }}
          className="gap-2 bg-blue-900 text-white hover:bg-blue-800 ml-auto"
        >
          <Plus className="h-4 w-4" /> Add Department
        </Button>
      </div>

      <Card className="overflow-hidden border border-slate-200 shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 hover:bg-slate-50">
                <TableHead className="pl-5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Name
                </TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Code
                </TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Segment
                </TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Created
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
                    Loading departments...
                  </TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="py-14 text-center text-sm text-slate-400"
                  >
                    <Building2 className="mx-auto mb-2 h-8 w-8 opacity-25" />
                    No departments found
                  </TableCell>
                </TableRow>
              ) : (
                paginated.map((dept) => (
                  <TableRow
                    key={dept.id}
                    className="group border-b border-slate-100 hover:bg-slate-50/70"
                  >
                    <TableCell className="pl-5 py-3.5 text-sm font-medium text-slate-800">
                      {dept.name}
                    </TableCell>
                    <TableCell className="py-3.5">
                      <span className="font-mono text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded">
                        {dept.code}
                      </span>
                    </TableCell>
                    <TableCell className="py-3.5">
                      <SegmentBadge segment={dept.segment} />
                    </TableCell>
                    <TableCell className="py-3.5 text-xs text-slate-400">
                      {fmtDate(dept.createdAt)}
                    </TableCell>
                    <TableCell className="pr-5 py-3.5">
                      <div className="flex justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 hover:bg-amber-50 hover:text-amber-600"
                          onClick={() => openEdit(dept)}
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 hover:bg-red-50 hover:text-red-600"
                          onClick={() => setDeleteItem(dept)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {filtered.length > 0 && !loading && (
        <p className="text-right text-xs text-slate-400">
          Showing {filtered.length} of {departments.length} departments
        </p>
      )}

      <AdminPagination
        page={page}
        totalPages={totalPages}
        totalItems={filtered.length}
        pageSize={DEPARTMENT_PAGE_SIZE}
        itemLabel="departments"
        onPageChange={setPage}
      />

      {/* Create Dialog */}
      <Dialog
        open={showCreate}
        onOpenChange={(o) => {
          if (!o) {
            setShowCreate(false);
            setError("");
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-blue-600" /> Add Department
            </DialogTitle>
          </DialogHeader>
          <DeptForm {...sharedDeptProps} />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowCreate(false);
                setError("");
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={
                !form.name.trim() ||
                !form.code.trim() ||
                !form.segment ||
                saving
              }
              className="bg-blue-900 text-white hover:bg-blue-800"
            >
              {saving ? "Saving..." : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog
        open={!!editItem}
        onOpenChange={(o) => {
          if (!o) {
            setEditItem(null);
            setError("");
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit3 className="h-4 w-4 text-blue-600" /> Edit Department
            </DialogTitle>
          </DialogHeader>
          <DeptForm {...sharedDeptProps} />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setEditItem(null);
                setError("");
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleEdit}
              disabled={
                !form.name.trim() ||
                !form.code.trim() ||
                !form.segment ||
                saving
              }
              className="bg-blue-900 text-white hover:bg-blue-800"
            >
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
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
            <DialogTitle>Delete department?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-slate-500">
            <strong>{deleteItem?.name}</strong> ({deleteItem?.code}) will be
            permanently removed.
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

// ── Page shell ────────────────────────────────────────────────────────────────

type Tab = "categories" | "departments";

export default function AdminCategoriesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = (searchParams.get("tab") as Tab) ?? "categories";

  const setActiveTab = (tab: Tab) => {
    setSearchParams({ tab });
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Categories &amp; Departments
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Manage ticket categories and organisational departments by segment.
        </p>
      </div>

      <div className="flex items-center gap-1 rounded-xl bg-slate-100 p-1 w-fit">
        <TabPill
          active={activeTab === "categories"}
          onClick={() => setActiveTab("categories")}
          icon={Layers}
          label="Categories"
        />
        <TabPill
          active={activeTab === "departments"}
          onClick={() => setActiveTab("departments")}
          icon={Building2}
          label="Departments"
        />
      </div>

      <div className={activeTab === "categories" ? "" : "hidden"}>
        <CategoriesTab />
      </div>
      <div className={activeTab === "departments" ? "" : "hidden"}>
        <DepartmentsTab />
      </div>
    </div>
  );
}
