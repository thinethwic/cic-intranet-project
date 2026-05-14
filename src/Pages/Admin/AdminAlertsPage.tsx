import { useState, useRef, useEffect } from "react";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  ShieldAlert,
  AlertTriangle,
  Shield,
  ImagePlus,
  ChevronDown,
  Check,
  Bell,
  Clock,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AdminPagination } from "./admin-components";
import { useAlerts } from "@/hooks/useAlerts";
import type { Alert, AlertSeverity } from "@/types";
import InlineErrorAlert from "@/components/shared/InlineErrorAlert";

// ── Constants ─────────────────────────────────────────────────────────────────

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
const PAGE_SIZE_OPTIONS = [8, 12, 24];
const SEVERITY_OPTIONS: AlertSeverity[] = ["critical", "warning", "info"];

const SEVERITY_CONFIG: Record<
  AlertSeverity,
  {
    label: string;
    icon: React.ReactNode;
    badgeBg: string;
    badgeText: string;
    badgeBorder: string;
    iconBg: string;
    iconColor: string;
  }
> = {
  critical: {
    label: "Critical",
    icon: <ShieldAlert className="w-3.5 h-3.5" />,
    badgeBg: "bg-red-50",
    badgeText: "text-red-700",
    badgeBorder: "border-red-200",
    iconBg: "bg-red-50",
    iconColor: "text-red-600",
  },
  warning: {
    label: "Warning",
    icon: <AlertTriangle className="w-3.5 h-3.5" />,
    badgeBg: "bg-amber-50",
    badgeText: "text-amber-700",
    badgeBorder: "border-amber-200",
    iconBg: "bg-amber-50",
    iconColor: "text-amber-500",
  },
  info: {
    label: "Advisory",
    icon: <Shield className="w-3.5 h-3.5" />,
    badgeBg: "bg-blue-50",
    badgeText: "text-blue-800",
    badgeBorder: "border-blue-200",
    iconBg: "bg-blue-50",
    iconColor: "text-blue-900",
  },
};

const EMPTY_FORM = {
  title: "",
  body: "",
  severity: "info" as AlertSeverity,
  date: "",
  href: "",
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtDate(d?: string | null) {
  if (!d) return "";
  try {
    return new Date(d).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return d;
  }
}

function fmtDateTime(d?: string | null) {
  if (!d) return "";
  try {
    return new Date(d).toLocaleString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return d;
  }
}

function resolveImageUrl(path?: string | null): string {
  if (!path) return "";
  if (/^https?:\/\//.test(path)) return path; // ✅ GCS URL — used as-is
  return `${BASE_URL}${path.startsWith("/") ? "" : "/"}${path}`; // old local path fallback
}

function getSeverity(item: Alert): AlertSeverity {
  const raw: string =
    (item as any).severity ?? (item as any).alertSeverity ?? "info";
  const lower = raw.toLowerCase();
  if (lower === "critical" || lower === "warning" || lower === "info") {
    return lower as AlertSeverity;
  }
  return "info";
}

function isScheduled(item: Alert): boolean {
  if (!item.date) return false;
  return new Date(item.date) > new Date();
}

// ── FilterDropdown ────────────────────────────────────────────────────────────

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
            value !== options[0] ? "border-blue-500 text-blue-600" : ""
          } ${className ?? ""}`}
        >
          <span>{value}</span>
          <ChevronDown className="w-3.5 h-3.5 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-[160px]">
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

// ── FlyerUploadZone ───────────────────────────────────────────────────────────

function FlyerUploadZone({
  preview,
  onFileChange,
}: {
  preview: string | null;
  onFileChange: (file: File) => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div
      onClick={() => ref.current?.click()}
      className="relative border-2 border-dashed border-slate-200 rounded-xl overflow-hidden cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 transition-colors mb-5"
    >
      {preview ? (
        <div className="relative">
          <img
            src={preview}
            alt="Flyer preview"
            className="w-full max-h-64 object-contain block bg-slate-50"
          />
          <div className="absolute inset-0 bg-black/30 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
            <p className="text-white text-sm font-medium flex items-center gap-2">
              <ImagePlus className="w-4 h-4" /> Change flyer
            </p>
          </div>
        </div>
      ) : (
        <div className="h-36 flex flex-col items-center justify-center gap-2">
          <ImagePlus className="w-7 h-7 text-blue-500" />
          <p className="text-sm text-slate-600 font-medium">
            Click to upload flyer image
          </p>
          <p className="text-xs text-slate-400">JPG, PNG, WEBP supported</p>
        </div>
      )}
      <input
        ref={ref}
        type="file"
        className="hidden"
        accept="image/*"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onFileChange(f);
        }}
      />
    </div>
  );
}

// ── AlertForm ─────────────────────────────────────────────────────────────────

interface AlertFormProps {
  form: typeof EMPTY_FORM;
  setForm: React.Dispatch<React.SetStateAction<typeof EMPTY_FORM>>;
  flyerPreview: string | null;
  onFlyerChange: (file: File) => void;
}

function AlertForm({
  form,
  setForm,
  flyerPreview,
  onFlyerChange,
}: AlertFormProps) {
  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  return (
    <div className="space-y-4">
      {/* Flyer upload */}
      <FlyerUploadZone preview={flyerPreview} onFileChange={onFlyerChange} />

      {/* Title */}
      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-slate-600">Title</Label>
        <Input
          placeholder="e.g. Be Alert. Be Smart. Be Secure."
          value={form.title}
          onChange={(e) => set("title", e.target.value)}
          autoComplete="off"
        />
      </div>

      {/* Body */}
      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-slate-600">
          Body message{" "}
          <span className="text-slate-400 font-normal">
            (shown when no flyer)
          </span>
        </Label>
        <Textarea
          placeholder="Describe the alert in detail..."
          value={form.body}
          onChange={(e) => set("body", e.target.value)}
          className="resize-none h-24"
        />
      </div>

      {/* Severity */}
      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-slate-600">Severity</Label>
        <div className="flex gap-2 flex-wrap">
          {SEVERITY_OPTIONS.map((sev) => {
            const cfg = SEVERITY_CONFIG[sev];
            const active = form.severity === sev;
            return (
              <button
                key={sev}
                type="button"
                onClick={() => set("severity", sev)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                  active
                    ? `${cfg.badgeBg} ${cfg.badgeText} ${cfg.badgeBorder} shadow-sm`
                    : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
                }`}
              >
                {cfg.icon}
                {cfg.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Publish date */}
      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-slate-600">
          Publish date{" "}
          <span className="text-slate-400 font-normal">
            (leave empty to publish immediately)
          </span>
        </Label>
        <Input
          type="date"
          value={form.date}
          onChange={(e) => set("date", e.target.value)}
        />
        {form.date && new Date(form.date) > new Date() ? (
          <p className="text-[11px] text-amber-600 flex items-center gap-1 mt-1">
            <Clock className="w-3 h-3" />
            Will go live on{" "}
            {new Date(form.date).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </p>
        ) : form.date ? (
          <p className="text-[11px] text-green-600 flex items-center gap-1 mt-1">
            <Check className="w-3 h-3" />
            Published immediately (date is today or past)
          </p>
        ) : (
          <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-1">
            <Bell className="w-3 h-3" />
            No date set — publishes immediately
          </p>
        )}
      </div>

      {/* Link */}
      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-slate-600">
          Advisory link{" "}
          <span className="text-slate-400 font-normal">(optional)</span>
        </Label>
        <Input
          placeholder="https://..."
          value={form.href}
          onChange={(e) => set("href", e.target.value)}
          autoComplete="off"
        />
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function AdminAlertsPage() {
  // ← adminMode: true — fetches ALL alerts including scheduled ones
  const {
    alerts,
    loading,
    error,
    refresh,
    create,
    update,
    updateFlyer,
    remove,
  } = useAlerts(0, 100, true);

  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [severityFilter, setSeverityFilter] = useState("All");
  const [showCreate, setShowCreate] = useState(false);
  const [editItem, setEditItem] = useState<Alert | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);

  const [createForm, setCreateForm] = useState({ ...EMPTY_FORM });
  const [editForm, setEditForm] = useState({ ...EMPTY_FORM });

  const [createFlyerFile, setCreateFlyerFile] = useState<File | null>(null);
  const [createFlyerPreview, setCreateFlyerPreview] = useState<string | null>(
    null,
  );
  const [editFlyerFile, setEditFlyerFile] = useState<File | null>(null);
  const [editFlyerPreview, setEditFlyerPreview] = useState<string | null>(null);

  // ── Filters ───────────────────────────────────────────────────────────────
  const filtered = alerts.filter((a) => {
    const q = search.toLowerCase();
    const matchSearch =
      a.title.toLowerCase().includes(q) ||
      (a.body ?? "").toLowerCase().includes(q);

    const scheduled = isScheduled(a);
    const matchStatus =
      statusFilter === "All" ||
      (statusFilter === "Live" && !scheduled) ||
      (statusFilter === "Scheduled" && scheduled);

    const matchSeverity =
      severityFilter === "All" ||
      getSeverity(a) === severityFilter.toLowerCase();

    return matchSearch && matchStatus && matchSeverity;
  });

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter, severityFilter, pageSize]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  // Stats
  const scheduledCount = alerts.filter((a) => isScheduled(a)).length;
  const liveCount = alerts.filter((a) => !isScheduled(a)).length;
  const criticalCount = alerts.filter(
    (a) => getSeverity(a) === "critical",
  ).length;
  const warningCount = alerts.filter(
    (a) => getSeverity(a) === "warning",
  ).length;

  // ── Create ────────────────────────────────────────────────────────────────
  const handleCreate = async () => {
    if (!createForm.title.trim()) return;
    setSaving(true);
    await create(
      {
        title: createForm.title,
        body: createForm.body,
        severity: createForm.severity,
        date: createForm.date
          ? new Date(createForm.date).toISOString()
          : undefined,
        href: createForm.href || undefined,
      },
      createFlyerFile ?? undefined,
    );
    setSaving(false);
    resetCreate();
    refresh();
  };

  // ── Edit ──────────────────────────────────────────────────────────────────
  const openEdit = (item: Alert) => {
    setEditItem(item);
    // Convert ISO datetime back to datetime-local format for the input
    const dateValue = item.date
      ? new Date(item.date).toISOString().slice(0, 16)
      : "";
    setEditForm({
      title: item.title,
      body: item.body ?? "",
      severity: getSeverity(item),
      date: dateValue,
      href: item.href ?? "",
    });
    setEditFlyerFile(null);
    setEditFlyerPreview(
      item.flyerImage ? resolveImageUrl(item.flyerImage) : null,
    );
  };

  const handleSaveEdit = async () => {
    if (!editItem) return;
    setSaving(true);
    await update(Number(editItem.id), {
      title: editForm.title,
      body: editForm.body,
      severity: editForm.severity,
      date: editForm.date ? new Date(editForm.date).toISOString() : undefined,
      href: editForm.href || undefined,
    });
    if (editFlyerFile) await updateFlyer(Number(editItem.id), editFlyerFile);
    setSaving(false);
    resetEdit();
    refresh();
  };

  // ── Delete ────────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteId) return;
    await remove(Number(deleteId));
    setDeleteId(null);
    refresh();
  };

  // ── Resets ────────────────────────────────────────────────────────────────
  const resetCreate = () => {
    setCreateForm({ ...EMPTY_FORM });
    setCreateFlyerFile(null);
    setCreateFlyerPreview(null);
    setShowCreate(false);
  };

  const resetEdit = () => {
    setEditItem(null);
    setEditFlyerFile(null);
    setEditFlyerPreview(null);
  };

  return (
    <div className="space-y-6 p-6">
      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Alerts</h1>
          <p className="text-sm text-slate-500 mt-1 flex items-center gap-2">
            <span>{alerts.length} total</span>
            <span className="w-px h-3 bg-slate-300" />
            <span className="text-green-600 font-medium">{liveCount} live</span>
            <span className="w-px h-3 bg-slate-300" />
            <Clock className="w-3 h-3 text-amber-500" />
            <span className="text-amber-600 font-medium">
              {scheduledCount} scheduled
            </span>
          </p>
        </div>
        <Button
          onClick={() => setShowCreate(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
        >
          <Plus className="w-4 h-4" /> Create alert
        </Button>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          {
            label: "Total",
            value: loading ? "..." : alerts.length,
            icon: <Bell className="w-4 h-4" />,
            color: "text-blue-600 bg-blue-50",
          },
          {
            label: "Live",
            value: loading ? "..." : liveCount,
            icon: <Check className="w-4 h-4" />,
            color: "text-green-600 bg-green-50",
          },
          {
            label: "Scheduled",
            value: loading ? "..." : scheduledCount,
            icon: <Clock className="w-4 h-4" />,
            color: "text-amber-500 bg-amber-50",
          },
          {
            label: "Critical",
            value: loading ? "..." : criticalCount,
            icon: <ShieldAlert className="w-4 h-4" />,
            color: "text-red-600 bg-red-50",
          },
          {
            label: "Warning",
            value: loading ? "..." : warningCount,
            icon: <AlertTriangle className="w-4 h-4" />,
            color: "text-amber-500 bg-amber-50",
          },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-slate-50 rounded-lg p-4 flex items-center gap-3"
          >
            <div
              className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${s.color}`}
            >
              {s.icon}
            </div>
            <div>
              <p className="text-xs text-slate-500">{s.label}</p>
              <p className="text-2xl font-semibold">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Filters ── */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            className="pl-9 bg-white h-9"
            placeholder="Search alerts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <FilterDropdown
          options={["All", "Live", "Scheduled"]}
          value={statusFilter}
          onChange={setStatusFilter}
          className="min-w-[130px]"
        />
        <FilterDropdown
          options={["All", "Critical", "Warning", "Info"]}
          value={severityFilter}
          onChange={setSeverityFilter}
          className="min-w-[130px]"
        />
      </div>

      {/* ── Grid ── */}
      {error && <InlineErrorAlert message={error} />}

      {loading ? (
        <div className="text-center py-20 text-slate-400">
          <p className="text-sm">Loading alerts...</p>
        </div>
      ) : paginated.length === 0 ? (
        <div className="text-center py-20 text-slate-400">
          <Bell className="w-10 h-10 mx-auto mb-3 opacity-20" />
          <p className="text-sm">No alerts found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {paginated.map((item) => {
            const severity = getSeverity(item);
            const cfg = SEVERITY_CONFIG[severity];
            const pending = isScheduled(item);

            return (
              <Card
                key={item.id}
                className={`overflow-hidden border transition-colors group relative ${
                  pending
                    ? "border-amber-200 border-dashed"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                {/* Scheduled ribbon */}
                {pending && (
                  <div className="absolute top-2 left-2 z-10 flex items-center gap-1 bg-amber-500 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full shadow-sm">
                    <Clock className="w-2.5 h-2.5" />
                    Scheduled
                  </div>
                )}

                {/* Flyer or placeholder — blurred/dimmed when scheduled */}
                <div className={pending ? "opacity-45 blur-[1px]" : ""}>
                  {item.flyerImage ? (
                    <img
                      src={resolveImageUrl(item.flyerImage)}
                      alt={item.title}
                      className="w-full h-44 object-cover object-top block"
                    />
                  ) : (
                    <div
                      className={`w-full h-44 flex items-center justify-center ${cfg.iconBg}`}
                    >
                      <div className={`${cfg.iconColor} scale-[2]`}>
                        {cfg.icon}
                      </div>
                    </div>
                  )}
                </div>

                <CardContent className={`p-4 ${pending ? "opacity-60" : ""}`}>
                  {/* Severity badge */}
                  <div className="flex gap-2 mb-2 flex-wrap">
                    <Badge
                      className={`text-[10px] border gap-1 ${cfg.badgeBg} ${cfg.badgeText} ${cfg.badgeBorder} hover:${cfg.badgeBg}`}
                    >
                      {cfg.icon}
                      {cfg.label}
                    </Badge>
                  </div>

                  {/* Status indicator */}
                  {pending ? (
                    <div className="flex items-center gap-1 text-[11px] text-amber-600 mb-2 font-medium">
                      <Clock className="w-3 h-3" />
                      Goes live: {fmtDateTime(item.date)}
                    </div>
                  ) : item.date ? (
                    <div className="flex items-center gap-1 text-[11px] text-green-600 mb-2">
                      <Check className="w-3 h-3" />
                      Live since {fmtDate(item.date)}
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-[11px] text-green-600 mb-2">
                      <Check className="w-3 h-3" />
                      Live now
                    </div>
                  )}

                  {/* Title */}
                  <p className="text-sm font-medium text-slate-800 line-clamp-2 leading-snug mb-1.5">
                    {item.title}
                  </p>

                  {/* Body */}
                  {item.body && (
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-3">
                      {item.body}
                    </p>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 pt-3 border-t border-slate-100">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex-1 h-8 text-xs hover:bg-blue-50 hover:text-blue-700"
                      onClick={() => openEdit(item)}
                    >
                      <Pencil className="w-3.5 h-3.5 mr-1.5" /> Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex-1 h-8 text-xs hover:bg-red-50 hover:text-red-700"
                      onClick={() => setDeleteId(item.id)}
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

      <AdminPagination
        page={page}
        totalPages={totalPages}
        totalItems={filtered.length}
        pageSize={pageSize}
        itemLabel="alerts"
        onPageChange={setPage}
        pageSizeOptions={PAGE_SIZE_OPTIONS}
        onPageSizeChange={(nextSize) => {
          setPage(1);
          setPageSize(nextSize);
        }}
      />

      {/* ── Create Dialog ── */}
      <Dialog
        open={showCreate}
        onOpenChange={(o) => {
          if (!o) resetCreate();
          else setShowCreate(true);
        }}
      >
        <DialogContent className="sm:max-w-lg p-0 gap-0 overflow-hidden max-h-[90vh] flex flex-col">
          <DialogHeader className="px-6 py-4 border-b border-slate-100 shrink-0">
            <DialogTitle className="flex items-center gap-2">
              <Plus className="w-4 h-4 text-blue-600" /> Create alert
            </DialogTitle>
            <DialogDescription>
              Fill in the details to publish a new security alert.
            </DialogDescription>
          </DialogHeader>
          <div className="overflow-y-auto flex-1 px-6 py-5">
            <AlertForm
              form={createForm}
              setForm={setCreateForm}
              flyerPreview={createFlyerPreview}
              onFlyerChange={(file) => {
                setCreateFlyerFile(file);
                setCreateFlyerPreview(URL.createObjectURL(file));
              }}
            />
          </div>
          <DialogFooter className="px-6 py-4 border-t border-slate-100 shrink-0">
            <Button variant="outline" onClick={resetCreate}>
              Cancel
            </Button>
            <Button
              disabled={!createForm.title.trim() || saving}
              onClick={handleCreate}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {saving ? "Publishing..." : "Publish alert"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Edit Dialog ── */}
      <Dialog
        open={!!editItem}
        onOpenChange={(o) => {
          if (!o) resetEdit();
        }}
      >
        <DialogContent className="sm:max-w-lg p-0 gap-0 overflow-hidden max-h-[90vh] flex flex-col">
          <DialogHeader className="px-6 py-4 border-b border-slate-100 shrink-0">
            <DialogTitle className="flex items-center gap-2">
              <Pencil className="w-4 h-4 text-blue-600" /> Edit alert
            </DialogTitle>
            <DialogDescription>
              Update the details for this alert.
            </DialogDescription>
          </DialogHeader>
          <div className="overflow-y-auto flex-1 px-6 py-5">
            <AlertForm
              form={editForm}
              setForm={setEditForm}
              flyerPreview={editFlyerPreview}
              onFlyerChange={(file) => {
                setEditFlyerFile(file);
                setEditFlyerPreview(URL.createObjectURL(file));
              }}
            />
          </div>
          <DialogFooter className="px-6 py-4 border-t border-slate-100 shrink-0">
            <Button variant="outline" onClick={resetEdit}>
              Cancel
            </Button>
            <Button
              disabled={!editForm.title.trim() || saving}
              onClick={handleSaveEdit}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {saving ? "Saving..." : "Save changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete Dialog ── */}
      <Dialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center mb-2">
              <Trash2 className="w-5 h-5 text-red-600" />
            </div>
            <DialogTitle>Delete alert?</DialogTitle>
            <DialogDescription>
              "{alerts.find((a) => a.id === deleteId)?.title?.substring(0, 60)}
              ..." will be permanently removed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>
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
