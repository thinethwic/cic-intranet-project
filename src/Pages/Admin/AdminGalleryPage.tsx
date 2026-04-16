import { useState } from "react";
import { Eye, Image, Pencil, Plus, Trash2 } from "lucide-react";

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
import { images } from "@/Mock-data";

import {
  ActionDropdown,
  AdminCard,
  AdminSearchInput,
  AdminSectionHeader,
  StatCard,
} from "./admin-components";

interface GalleryItem {
  id: number;
  key: string;
  description: string;
}

const initialGallery: GalleryItem[] = images.map((item, index) => ({
  id: index + 1,
  key: item.key,
  description: item.description,
}));

export default function AdminGalleryPage() {
  const [items, setItems] = useState<GalleryItem[]>(initialGallery);
  const [search, setSearch] = useState("");
  const [preview, setPreview] = useState<GalleryItem | null>(null);
  const [editing, setEditing] = useState<GalleryItem | null>(null);
  const [deleteItem, setDeleteItem] = useState<GalleryItem | null>(null);
  const [form, setForm] = useState({ description: "" });

  const filtered = items.filter((item) =>
    item.description.toLowerCase().includes(search.toLowerCase()),
  );

  const openEdit = (item: GalleryItem) => {
    setEditing(item);
    setForm({ description: item.description });
  };

  const openCreate = () => {
    setEditing({ id: 0, key: "", description: "" });
    setForm({ description: "" });
  };

  const handleSave = () => {
    if (!editing) return;

    if (editing.id === 0) {
      setItems((prev) => [{ id: Date.now(), key: "", ...form }, ...prev]);
    } else {
      setItems((prev) =>
        prev.map((item) =>
          item.id === editing.id ? { ...item, ...form } : item,
        ),
      );
    }
    setEditing(null);
  };

  const handleDelete = () => {
    if (!deleteItem) return;
    setItems((prev) => prev.filter((item) => item.id !== deleteItem.id));
    setDeleteItem(null);
  };

  return (
    <div className="space-y-6 p-6">
      <AdminSectionHeader
        title="Gallery"
        description="Curate images for homepage and segment visual sections."
        action={
          <Button onClick={openCreate} className="gap-2 rounded-2xl">
            <Plus className="h-4 w-4" />
            Add Image
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <StatCard
          title="Total Images"
          value={items.length}
          icon={Image}
          tone="rose"
        />
        <StatCard
          title="Visible"
          value={filtered.length}
          icon={Eye}
          tone="emerald"
        />
      </div>

      <AdminSearchInput
        value={search}
        onChange={setSearch}
        placeholder="Search by description..."
      />

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.map((item) => (
          <AdminCard key={item.id} className="overflow-hidden">
            <img
              src={item.key}
              alt={item.description}
              className="aspect-video w-full object-cover"
            />
            <CardContent className="space-y-4 p-4">
              <div className="flex items-start justify-between gap-3">
                <p className="line-clamp-2 text-sm font-medium leading-snug text-muted-foreground">
                  {item.description || "No description"}
                </p>
                <ActionDropdown
                  actions={[
                    {
                      label: "Preview",
                      icon: Eye,
                      onClick: () => setPreview(item),
                    },
                    {
                      label: "Edit",
                      icon: Pencil,
                      onClick: () => openEdit(item),
                    },
                    {
                      label: "Delete",
                      icon: Trash2,
                      onClick: () => setDeleteItem(item),
                      destructive: true,
                    },
                  ]}
                />
              </div>
            </CardContent>
          </AdminCard>
        ))}
      </div>

      {/* Preview Dialog */}
      <Dialog open={!!preview} onOpenChange={() => setPreview(null)}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              {preview?.description || "No description"}
            </DialogTitle>
          </DialogHeader>
          {preview && (
            <img
              src={preview.key}
              alt={preview.description}
              className="max-h-[70vh] w-full rounded-2xl object-cover"
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Edit / Create Dialog */}
      <Dialog open={!!editing} onOpenChange={() => setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editing?.id === 0 ? "Add Image" : "Edit Image"}
            </DialogTitle>
            <DialogDescription>
              {editing?.id === 0
                ? "Add a new image to the gallery."
                : "Update the image description."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground">Description</Label>
            <Input
              value={form.description}
              onChange={(e) => setForm({ description: e.target.value })}
              placeholder="Enter image description"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={!!deleteItem} onOpenChange={() => setDeleteItem(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Image?</DialogTitle>
            <DialogDescription>
              This image will be permanently removed from the gallery.
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
