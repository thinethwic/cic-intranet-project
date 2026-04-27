import { useState, useEffect } from "react";
import { Calendar, MapPin, Pencil, Plus, Trash2, Upload } from "lucide-react";
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
  AdminSearchInput,
  AdminSectionHeader,
  DataTable,
  FilterPillGroup,
  StatCard,
  StatusBadge,
} from "./admin-components";
import type { Event } from "@/types";
import {
  getAllEvents,
  createEvent,
  updateEvent,
  deleteEvent,
} from "@/lib/api/eventApi";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

const SEGMENT_OPTIONS = [
  "All",
  "CIC_FEEDS",
  "CIC_VET_CARE",
  "CIC_POULTRY",
  "AISA_VET",
];

const EMPTY_FORM = {
  title: "",
  date: "",
  time: "",
  location: "",
  segment: "CIC_FEEDS",
};

export default function AdminEventsPage() {
  const [items, setItems] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [segment, setSegment] = useState("All");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Event | null>(null);
  const [deleteItem, setDeleteItem] = useState<Event | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const data = await getAllEvents();
      setItems(data);
    } catch (err) {
      console.error("Failed to fetch events", err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = items.filter((event) => {
    const query = search.toLowerCase();
    return (
      event.title.toLowerCase().includes(query) &&
      (segment === "All" || event.segment === segment)
    );
  });

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setSelectedImage(null);
    setImagePreview(null);
    setDialogOpen(true);
  };

  const openEdit = (event: Event) => {
    setEditing(event);
    setForm({
      title: event.title,
      date: event.date,
      time: event.time,
      location: event.location,
      segment: event.segment,
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

  // ✅ Create — multipart
  const handleSave = async () => {
    if (!form.title.trim()) return;
    try {
      setSaving(true);
      const formData = new FormData();
      formData.append(
        "data",
        new Blob(
          [
            JSON.stringify({
              title: form.title,
              date: form.date,
              time: form.time,
              location: form.location,
              segment: form.segment,
              userId: 1, // TODO: replace with logged-in user id
            }),
          ],
          { type: "application/json" },
        ),
      );

      if (selectedImage) {
        formData.append("image", selectedImage);
      }

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

  // ✅ Delete
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
    <div className="space-y-6 p-6">
      <AdminSectionHeader
        title="Events"
        description="Plan, edit, and publish upcoming intranet events."
        action={
          <Button onClick={openCreate} className="gap-2 rounded-2xl">
            <Plus className="h-4 w-4" /> Create Event
          </Button>
        }
      />

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

      {/* Filters */}
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
      </div>

      {/* Table */}
      <DataTable
        data={filtered}
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
                  <div className="h-12 w-12 rounded-2xl bg-blue-50 flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-blue-400" />
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
          {
            key: "segment",
            header: "Segment",
            cell: (event) => (
              <StatusBadge tone="blue">{event.segment}</StatusBadge>
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

      {/* ── Create / Edit Dialog ── */}
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
            {/* Image upload */}
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">
                Image <span className="text-xs text-slate-400">(optional)</span>
              </Label>
              <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-xl p-4 cursor-pointer hover:border-blue-400 hover:bg-blue-50/40 transition-colors">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    className="h-32 w-full object-cover rounded-lg mb-2"
                  />
                ) : (
                  <Upload className="w-6 h-6 text-blue-400 mb-1" />
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
                  setForm((prev) => ({ ...prev, title: e.target.value }))
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
                    setForm((prev) => ({ ...prev, date: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Time</Label>
                <Input
                  type="time"
                  value={form.time}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, time: e.target.value }))
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
                    setForm((prev) => ({ ...prev, location: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Segment</Label>
                <select
                  value={form.segment}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, segment: e.target.value }))
                  }
                  className="h-10 w-full rounded-2xl border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/40"
                >
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

      {/* ── Delete Dialog ── */}
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
