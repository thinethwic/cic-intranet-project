import { useState, useEffect, useMemo } from "react";
import {
  Bell,
  Calendar,
  Check,
  ChevronDown,
  MapPin,
  Megaphone,
  Pencil,
  Plus,
  Trash2,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
import {
  ActionDropdown,
  AdminPagination,
  AdminSearchInput,
  AdminSectionHeader,
  DataTable,
  FilterPillGroup,
  StatCard,
  StatusBadge,
} from "./admin-components";
import type { Event, Announcement } from "@/types";
import {
  getAllEvents,
  createEvent,
  updateEvent,
  deleteEvent,
} from "@/lib/api/eventApi";
import {
  getAllAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
} from "@/lib/api/announcementApi";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { useSearchParams } from "react-router-dom";

import { getAdminUser } from "@/lib/api/authHeaders";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

const SEGMENT_OPTIONS = [
  "All",
  "CIC_FEEDS",
  "CIC_VET_CARE",
  "CIC_POULTRY",
  "AISA_VET",
];

const CATEGORIES = [
  "All",
  "HR",
  "FINANCE",
  "IT",
  "OPERATIONS",
  "LEGAL",
  "GENERAL",
];

// FIX #2: Define TYPES constant (was referenced but never declared)
const TYPES = ["All", "Unread", "Read"];

const EMPTY_EVENT_FORM = {
  title: "",
  date: "",
  time: "",
  location: "",
  segment: "",
};

const EMPTY_ANN_FORM = {
  title: "",
  category: "GENERAL",
  segment: "CIC_FEEDS",
};

// ── Tab pill ──────────────────────────────────────────────────────────────────

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

// ── Events tab ────────────────────────────────────────────────────────────────

function EventsTab() {
  const PAGE_SIZE = 8;
  const [items, setItems] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [segment, setSegment] = useState("All");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Event | null>(null);
  const [deleteItem, setDeleteItem] = useState<Event | null>(null);
  const [form, setForm] = useState(EMPTY_EVENT_FORM);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setItems(await getAllEvents());
    } catch (err) {
      console.error("Failed to fetch events", err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(
    () =>
      items.filter((event) => {
        const q = search.toLowerCase();
        return (
          event.title.toLowerCase().includes(q) &&
          (segment === "All" || event.segment === segment)
        );
      }),
    [items, search, segment],
  );

  useEffect(() => {
    setPage(1);
  }, [search, segment, items.length]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_EVENT_FORM);
    setSelectedImage(null);
    setImagePreview(null);
    setDialogOpen(true);
  };

  // openEdit — handle null segment from backend
  const openEdit = (event: Event) => {
    setEditing(event);
    setForm({
      title: event.title,
      date: event.date,
      time: event.time,
      location: event.location,
      segment: event.segment ?? "", // null → empty string so select shows "— None —"
    });
    setSelectedImage(null);
    setImagePreview(event.image ? `${BASE_URL}${event.image}` : null);
    setDialogOpen(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setSelectedImage(file);
    if (file) setImagePreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    if (!form.title.trim()) return;
    try {
      setSaving(true);
      const adminUser = getAdminUser();
      const payload = {
        ...form,
        userId: adminUser?.userId,
        segment: form.segment || undefined,
      };
      const formData = new FormData();
      formData.append(
        "data",
        new Blob([JSON.stringify(payload)], { type: "application/json" }),
      );
      if (selectedImage) formData.append("image", selectedImage);
      if (editing) {
        await updateEvent(editing.id, formData);
      } else {
        await createEvent(formData);
      }
      await fetchEvents();
      setDialogOpen(false);
    } catch (err) {
      console.error("Failed to save event", err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteItem) return;
    try {
      await deleteEvent(deleteItem.id);
      await fetchEvents();
      setDeleteItem(null);
    } catch (err) {
      console.error("Failed to delete event", err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <StatCard
          title="Total Events"
          value={loading ? "..." : items.length}
          icon={Calendar}
          tone="blue"
        />
        <StatCard
          title="Locations"
          value={loading ? "..." : new Set(items.map((e) => e.location)).size}
          icon={MapPin}
          tone="emerald"
        />
        <StatCard
          title="Segments"
          value={loading ? "..." : new Set(items.map((e) => e.segment)).size}
          icon={Calendar}
          tone="amber"
        />
      </div>

      {/* Filters + Create */}
      <div className="flex flex-wrap items-center gap-4">
        <AdminSearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search events..."
        />
        <FilterPillGroup
          options={SEGMENT_OPTIONS}
          value={segment}
          onChange={setSegment}
        />
        <Button onClick={openCreate} className="ml-auto gap-2 rounded-2xl">
          <Plus className="h-4 w-4" /> Create Event
        </Button>
      </div>

      {/* Table */}
      <DataTable
        data={paginated}
        getRowKey={(event) => event.id}
        emptyLabel={loading ? "Loading events..." : "No events found"}
        columns={[
          {
            key: "event",
            header: "Event",
            cell: (event) => (
              <div className="flex items-center gap-3">
                {event.image ? (
                  <img
                    src={`${BASE_URL}${event.image}`}
                    alt=""
                    className="h-12 w-12 rounded-2xl object-cover"
                  />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50">
                    <Calendar className="h-5 w-5 text-blue-400" />
                  </div>
                )}
                <div>
                  <p className="font-medium">{event.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {event.date} / {event.time}
                  </p>
                </div>
              </div>
            ),
          },
          {
            key: "location",
            header: "Location",
            cell: (event) => event.location,
          },
          // Table segment cell — show "No Segment" badge when null/empty
          {
            key: "segment",
            header: "Segment",
            cell: (event) =>
              event.segment ? (
                <StatusBadge tone="blue">{event.segment}</StatusBadge>
              ) : (
                <StatusBadge tone="emerald">No Segment</StatusBadge>
              ),
          },
          {
            key: "actions",
            header: "",
            className: "text-right",
            cell: (event) => (
              <div className="flex justify-end">
                <ActionDropdown
                  actions={[
                    {
                      label: "Edit",
                      icon: Pencil,
                      onClick: () => openEdit(event),
                    },
                    {
                      label: "Delete",
                      icon: Trash2,
                      onClick: () => setDeleteItem(event),
                      destructive: true,
                    },
                  ]}
                />
              </div>
            ),
          },
        ]}
      />

      <AdminPagination
        page={page}
        totalPages={totalPages}
        totalItems={filtered.length}
        pageSize={PAGE_SIZE}
        itemLabel="events"
        onPageChange={setPage}
      />

      {/* Create / Edit Dialog */}
      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setDialogOpen(false);
            setSelectedImage(null);
            setImagePreview(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit event" : "Create event"}</DialogTitle>
            <DialogDescription>
              Add the details visitors will see in the events section.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4">
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">
                Image <span className="text-xs text-slate-400">(optional)</span>
              </Label>
              <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 p-4 transition-colors hover:border-blue-400 hover:bg-blue-50/40">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    className="mb-2 h-32 w-full rounded-lg object-cover"
                  />
                ) : (
                  <Upload className="mb-1 h-6 w-6 text-blue-400" />
                )}
                <p className="text-xs text-slate-400">
                  {selectedImage?.name || "Click to upload image"}
                </p>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
              </label>
            </div>

            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Title</Label>
              <Input
                value={form.title}
                onChange={(e) =>
                  setForm((p) => ({ ...p, title: e.target.value }))
                }
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Date</Label>
                <Input
                  type="date"
                  value={form.date}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, date: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Time</Label>
                <Input
                  type="time"
                  value={form.time}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, time: e.target.value }))
                  }
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">
                  Location
                </Label>
                <Input
                  value={form.location}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, location: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Segment</Label>
                <select
                  value={form.segment}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, segment: e.target.value }))
                  }
                  className="h-10 w-full rounded-2xl border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/40"
                >
                  <option value="">— None —</option>
                  {SEGMENT_OPTIONS.filter((o) => o !== "All").map((o) => (
                    <option key={o}>{o}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!form.title.trim() || saving}
            >
              {saving ? "Saving..." : "Save event"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={!!deleteItem} onOpenChange={() => setDeleteItem(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete event?</DialogTitle>
            <DialogDescription>
              "{deleteItem?.title}" will be removed from the event list.
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

// ── Announcements tab ─────────────────────────────────────────────────────────

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
            value !== "All" && value !== options[0]
              ? "border-blue-500 text-blue-600"
              : ""
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

function AnnouncementsTab() {
  const PAGE_SIZE = 8;
  const [items, setItems] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");

  // FIX #2: Declare all filter state variables that were referenced but missing
  const [segFilter, setSegFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [catFilter, setCatFilter] = useState("All");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Announcement | null>(null);
  const [deleteItem, setDeleteItem] = useState<Announcement | null>(null);
  const [form, setForm] = useState(EMPTY_ANN_FORM);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      setItems(await getAllAnnouncements());
    } catch (err) {
      console.error("Failed to fetch announcements", err);
    } finally {
      setLoading(false);
    }
  };

  // FIX #4: Apply all three filters (segFilter, catFilter, typeFilter) in the memo
  const filtered = useMemo(
    () =>
      items.filter((ann) => {
        const q = search.toLowerCase();
        const matchesSearch =
          ann.title.toLowerCase().includes(q) ||
          ann.category.toLowerCase().includes(q);
        const matchesSeg = segFilter === "All" || ann.segment === segFilter;
        const matchesCat = catFilter === "All" || ann.category === catFilter;
        const matchesType =
          typeFilter === "All" ||
          (typeFilter === "Read" && ann.isRead) ||
          (typeFilter === "Unread" && !ann.isRead);
        return matchesSearch && matchesSeg && matchesCat && matchesType;
      }),
    [items, search, segFilter, catFilter, typeFilter],
  );

  // FIX #5: Include all filter variables in the reset dep array
  useEffect(() => {
    setPage(1);
  }, [search, segFilter, catFilter, typeFilter, items.length]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_ANN_FORM);
    setError("");
    setDialogOpen(true);
  };

  const openEdit = (ann: Announcement) => {
    setEditing(ann);
    setForm({
      title: ann.title,
      category: ann.category,
      segment: ann.segment,
    });
    setError("");
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.category.trim()) return;
    try {
      setSaving(true);
      setError("");
      if (editing) {
        await updateAnnouncement(editing.id, form);
      } else {
        await createAnnouncement(form);
      }
      await fetchAnnouncements();
      setDialogOpen(false);
    } catch (err: any) {
      setError(err.message ?? "Failed to save announcement");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteItem) return;
    try {
      await deleteAnnouncement(deleteItem.id);
      await fetchAnnouncements();
      setDeleteItem(null);
    } catch (err) {
      console.error("Failed to delete announcement", err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <StatCard
          title="Total"
          value={loading ? "..." : items.length}
          icon={Megaphone}
          tone="blue"
        />
        <StatCard
          title="Segments"
          value={
            loading
              ? "..."
              : new Set(items.map((a) => a.segment).filter(Boolean)).size
          }
          icon={Megaphone}
          tone="amber"
        />
        <StatCard
          title="Unread"
          value={loading ? "..." : items.filter((a) => !a.isRead).length}
          icon={Bell}
          tone="emerald"
        />
      </div>

      {/* FIX #1: Filters + Create button are now inside a single wrapper div */}
      <div className="flex flex-wrap items-center gap-4">
        <AdminSearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search announcements..."
        />
        <FilterDropdown
          options={SEGMENT_OPTIONS}
          value={segFilter}
          onChange={setSegFilter}
          className="min-w-[140px]"
        />
        <FilterDropdown
          options={TYPES}
          value={typeFilter}
          onChange={setTypeFilter}
          className="min-w-[120px]"
        />
        <FilterDropdown
          options={CATEGORIES}
          value={catFilter}
          onChange={setCatFilter}
          className="min-w-[150px]"
        />
        <Button onClick={openCreate} className="ml-auto gap-2 rounded-2xl">
          <Plus className="h-4 w-4" /> New Announcement
        </Button>
      </div>

      {/* Table */}
      <DataTable
        data={paginated}
        getRowKey={(ann) => ann.id}
        emptyLabel={
          loading ? "Loading announcements..." : "No announcements found"
        }
        columns={[
          {
            key: "announcement",
            header: "Announcement",
            cell: (ann) => (
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-amber-50">
                  <Megaphone className="h-4 w-4 text-amber-500" />
                </div>
                <div className="min-w-0">
                  <p className="truncate font-medium text-slate-800">
                    {ann.title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {ann.category}
                  </p>
                </div>
              </div>
            ),
          },
          {
            key: "segment",
            header: "Segment",
            cell: (ann) => <StatusBadge tone="blue">{ann.segment}</StatusBadge>,
          },
          {
            key: "status",
            header: "Status",
            cell: (ann) => (
              <StatusBadge tone={ann.isRead ? "emerald" : "amber"}>
                {ann.isRead ? "Read" : "Unread"}
              </StatusBadge>
            ),
          },
          {
            key: "actions",
            header: "",
            className: "text-right",
            cell: (ann) => (
              <div className="flex justify-end">
                <ActionDropdown
                  actions={[
                    {
                      label: "Edit",
                      icon: Pencil,
                      onClick: () => openEdit(ann),
                    },
                    {
                      label: "Delete",
                      icon: Trash2,
                      onClick: () => setDeleteItem(ann),
                      destructive: true,
                    },
                  ]}
                />
              </div>
            ),
          },
        ]}
      />

      <AdminPagination
        page={page}
        totalPages={totalPages}
        totalItems={filtered.length}
        pageSize={PAGE_SIZE}
        itemLabel="announcements"
        onPageChange={setPage}
      />

      {/* Create / Edit Dialog */}
      <Dialog
        open={dialogOpen}
        onOpenChange={(o) => {
          if (!o) {
            setDialogOpen(false);
            setError("");
          }
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Megaphone className="h-4 w-4 text-amber-500" />
              {editing ? "Edit Announcement" : "New Announcement"}
            </DialogTitle>
            <DialogDescription>
              This will be visible to employees in the selected segment.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-slate-600">
                Title <span className="text-red-500">*</span>
              </Label>
              <Input
                placeholder="e.g. Office closed on Monday"
                value={form.title}
                onChange={(e) =>
                  setForm((p) => ({ ...p, title: e.target.value }))
                }
              />
            </div>

            {/* FIX #3: Category is now a <select> using the CATEGORIES enum for consistency */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-slate-600">
                Category <span className="text-red-500">*</span>
              </Label>
              <select
                value={form.category}
                onChange={(e) =>
                  setForm((p) => ({ ...p, category: e.target.value }))
                }
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/40"
              >
                {CATEGORIES.filter((o) => o !== "All").map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-slate-600">
                Segment <span className="text-red-500">*</span>
              </Label>
              <select
                value={form.segment}
                onChange={(e) =>
                  setForm((p) => ({ ...p, segment: e.target.value }))
                }
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/40"
              >
                {SEGMENT_OPTIONS.filter((o) => o !== "All").map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
            </div>

            {error && (
              <p className="rounded bg-red-50 px-3 py-2 text-xs text-red-500">
                {error}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDialogOpen(false);
                setError("");
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!form.title.trim() || !form.category.trim() || saving}
            >
              {saving ? "Saving..." : editing ? "Save Changes" : "Publish"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={!!deleteItem} onOpenChange={() => setDeleteItem(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-red-50">
              <Trash2 className="h-5 w-5 text-red-600" />
            </div>
            <DialogTitle>Delete announcement?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-slate-500">
            "{deleteItem?.title}" will be permanently removed.
          </p>
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

// ── Page shell ────────────────────────────────────────────────────────────────

type Tab = "events" | "announcements";

export default function AdminEventsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = (searchParams.get("tab") as Tab) ?? "events";

  const setActiveTab = (tab: Tab) => {
    setSearchParams({ tab });
  };

  return (
    <div className="space-y-6 p-6">
      <AdminSectionHeader
        title="Events & Announcements"
        description="Plan, edit, and publish upcoming events and company announcements."
      />

      {/* Tab switcher */}
      <div className="flex w-fit items-center gap-1 rounded-xl bg-slate-100 p-1">
        <TabPill
          active={activeTab === "events"}
          onClick={() => setActiveTab("events")}
          icon={Calendar}
          label="Events"
        />
        <TabPill
          active={activeTab === "announcements"}
          onClick={() => setActiveTab("announcements")}
          icon={Megaphone}
          label="Announcements"
        />
      </div>

      <div className={activeTab === "events" ? "" : "hidden"}>
        <EventsTab />
      </div>
      <div className={activeTab === "announcements" ? "" : "hidden"}>
        <AnnouncementsTab />
      </div>
    </div>
  );
}
