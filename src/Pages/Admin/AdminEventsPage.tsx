import { useState } from "react";
import { Calendar, MapPin, Pencil, Plus, Trash2 } from "lucide-react";

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
import { events as initialEvents } from "@/Mock-data";

import {
  ActionDropdown,
  AdminSearchInput,
  AdminSectionHeader,
  DataTable,
  FilterPillGroup,
  StatCard,
  StatusBadge,
} from "./admin-components";

interface EventItem {
  id: number;
  image: string;
  title: string;
  date: string;
  time: string;
  location: string;
  segment: string;
}

const segmentOptions = ["All", "our-segments/asia-vet", "our-segments/cic-feeds"];

export default function AdminEventsPage() {
  const [items, setItems] = useState<EventItem[]>(() =>
    initialEvents.map((event, index) => ({ ...event, id: index + 1 })),
  );
  const [search, setSearch] = useState("");
  const [segment, setSegment] = useState("All");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<EventItem | null>(null);
  const [deleteItem, setDeleteItem] = useState<EventItem | null>(null);
  const [form, setForm] = useState({
    title: "",
    date: "",
    time: "",
    location: "",
    segment: "our-segments/asia-vet",
  });

  const filtered = items.filter((event) => {
    const query = search.toLowerCase();
    return (
      event.title.toLowerCase().includes(query) &&
      (segment === "All" || event.segment === segment)
    );
  });

  const openCreate = () => {
    setEditing(null);
    setForm({
      title: "",
      date: "",
      time: "",
      location: "",
      segment: "our-segments/asia-vet",
    });
    setDialogOpen(true);
  };

  const openEdit = (event: EventItem) => {
    setEditing(event);
    setForm({
      title: event.title,
      date: event.date,
      time: event.time,
      location: event.location,
      segment: event.segment,
    });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.title.trim()) return;

    if (editing) {
      setItems((prev) =>
        prev.map((event) =>
          event.id === editing.id ? { ...event, ...form } : event,
        ),
      );
    } else {
      setItems((prev) => [
        {
          id: Date.now(),
          image: initialEvents[0]?.image ?? "",
          ...form,
        },
        ...prev,
      ]);
    }

    setDialogOpen(false);
  };

  const handleDelete = () => {
    if (!deleteItem) return;
    setItems((prev) => prev.filter((event) => event.id !== deleteItem.id));
    setDeleteItem(null);
  };

  return (
    <div className="space-y-6 p-6">
      <AdminSectionHeader
        title="Events"
        description="Plan, edit, and publish upcoming intranet events."
        action={
          <Button onClick={openCreate} className="gap-2 rounded-2xl">
            <Plus className="h-4 w-4" />
            Create Event
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <StatCard title="Total Events" value={items.length} icon={Calendar} tone="blue" />
        <StatCard
          title="Locations"
          value={new Set(items.map((event) => event.location)).size}
          icon={MapPin}
          tone="emerald"
        />
        <StatCard
          title="Segments"
          value={new Set(items.map((event) => event.segment)).size}
          icon={Calendar}
          tone="amber"
        />
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <AdminSearchInput value={search} onChange={setSearch} placeholder="Search events..." />
        <FilterPillGroup options={segmentOptions} value={segment} onChange={setSegment} />
      </div>

      <DataTable
        data={filtered}
        getRowKey={(event) => event.id}
        emptyLabel="No events found"
        columns={[
          {
            key: "event",
            header: "Event",
            cell: (event) => (
              <div className="flex items-center gap-3">
                <img
                  src={event.image}
                  alt=""
                  className="h-12 w-12 rounded-2xl object-cover"
                />
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
            cell: (event) => <StatusBadge tone="blue">{event.segment}</StatusBadge>,
          },
          {
            key: "actions",
            header: "",
            className: "text-right",
            cell: (event) => (
              <div className="flex justify-end">
                <ActionDropdown
                  actions={[
                    { label: "Edit", icon: Pencil, onClick: () => openEdit(event) },
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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit event" : "Create event"}</DialogTitle>
            <DialogDescription>
              Add the details visitors will see in the events section.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Title</Label>
              <Input
                value={form.title}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, title: event.target.value }))
                }
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Date</Label>
                <Input
                  type="date"
                  value={form.date}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, date: event.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Time</Label>
                <Input
                  value={form.time}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, time: event.target.value }))
                  }
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Location</Label>
                <Input
                  value={form.location}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, location: event.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Segment</Label>
                <select
                  value={form.segment}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, segment: event.target.value }))
                  }
                  className="h-10 w-full rounded-2xl border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring/40"
                >
                  {segmentOptions
                    .filter((option) => option !== "All")
                    .map((option) => (
                      <option key={option}>{option}</option>
                    ))}
                </select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!form.title.trim()}>
              Save event
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
