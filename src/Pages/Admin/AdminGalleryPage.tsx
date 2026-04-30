import { useState, useEffect } from "react";
import {
  Eye,
  Image,
  ImagePlus,
  Pencil,
  Plus,
  Trash2,
  Upload,
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
import {
  ActionDropdown,
  AdminCard,
  AdminPagination,
  AdminSearchInput,
  AdminSectionHeader,
  StatCard,
} from "./admin-components";
import type { Gallery } from "@/types";
import {
  getAllGalleries,
  createGallery,
  updateGallery,
  deleteGallery,
} from "@/lib/api/galleryApi";
import { getAdminUser } from "@/lib/api/authHeaders";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

export default function AdminGalleryPage() {
  const PAGE_SIZE = 6;
  const [items, setItems] = useState<Gallery[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [preview, setPreview] = useState<Gallery | null>(null);
  const [editing, setEditing] = useState<Gallery | null>(null);
  const [deleteItem, setDeleteItem] = useState<Gallery | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // Form state
  const [description, setDescription] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchGalleries();
  }, []);

  const fetchGalleries = async () => {
    try {
      setLoading(true);
      const data = await getAllGalleries();
      setItems(data);
    } catch (err) {
      console.error("Failed to fetch galleries", err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = items.filter((item) =>
    item.description?.toLowerCase().includes(search.toLowerCase()),
  );

  useEffect(() => {
    setPage(1);
  }, [search, items.length]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const resetForm = () => {
    setDescription("");
    setSelectedFile(null);
    setImagePreview(null);
  };

  const openCreate = () => {
    resetForm();
    setIsCreating(true);
  };

  const openEdit = (item: Gallery) => {
    setEditing(item);
    setDescription(item.description ?? "");
    setSelectedFile(null);
    setImagePreview(item.image ? `${BASE_URL}${item.image}` : null);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setSelectedFile(file);
    if (file) setImagePreview(URL.createObjectURL(file));
  };

  // ── Create ───────────────────────────────────────────────
  const handleCreate = async () => {
    if (!selectedFile) return;
    try {
      setSaving(true);
      const formData = new FormData();
      const adminUser = getAdminUser();
      formData.append("image", selectedFile);
      formData.append(
        "data",
        new Blob(
          [JSON.stringify({ description, userId: adminUser?.userId ?? null })],
          {
            type: "application/json",
          },
        ),
      );
      await createGallery(formData);
      await fetchGalleries();
      resetForm();
      setIsCreating(false);
    } catch (err) {
      console.error("Failed to create gallery item", err);
    } finally {
      setSaving(false);
    }
  };

  // ── Update ───────────────────────────────────────────────
  const handleSaveEdit = async () => {
    if (!editing) return;
    try {
      setSaving(true);
      const formData = new FormData();
      const adminUser = getAdminUser();
      formData.append(
        "data",
        new Blob(
          [
            JSON.stringify({
              description,
              userId: adminUser?.userId ?? null,
            }),
          ],
          {
            type: "application/json",
          },
        ),
      );
      if (selectedFile) {
        formData.append("image", selectedFile);
      }
      await updateGallery(editing.id, formData);
      await fetchGalleries();
      setEditing(null);
      resetForm();
    } catch (err) {
      console.error("Failed to update gallery item", err);
    } finally {
      setSaving(false);
    }
  };

  // ── Delete ───────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteItem) return;
    try {
      await deleteGallery(deleteItem.id);
      await fetchGalleries();
      setDeleteItem(null);
    } catch (err) {
      console.error("Failed to delete gallery item", err);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <AdminSectionHeader
        title="Gallery"
        description="Curate images for homepage and segment visual sections."
        action={
          <Button onClick={openCreate} className="gap-2 rounded-2xl">
            <Plus className="h-4 w-4" /> Add Image
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <StatCard
          title="Total Images"
          value={loading ? "..." : items.length}
          icon={Image}
          tone="rose"
        />
        <StatCard
          title="Visible"
          value={loading ? "..." : filtered.length}
          icon={Eye}
          tone="emerald"
        />
      </div>

      <AdminSearchInput
        value={search}
        onChange={setSearch}
        placeholder="Search by description..."
      />

      {loading ? (
        <div className="text-center py-20 text-slate-400 text-sm">
          Loading gallery...
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-slate-400 text-sm">
          No images found
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {paginated.map((item) => (
            <AdminCard key={item.id} className="overflow-hidden">
              {item.image ? (
                <img
                  src={`${BASE_URL}${item.image}`}
                  alt={item.description}
                  className="aspect-video w-full object-cover"
                />
              ) : (
                <div className="aspect-video w-full bg-slate-100 flex items-center justify-center">
                  <ImagePlus className="w-8 h-8 text-slate-300" />
                </div>
              )}
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
      )}

      {/* ── Preview Dialog ── */}
      <AdminPagination
        page={page}
        totalPages={totalPages}
        totalItems={filtered.length}
        pageSize={PAGE_SIZE}
        itemLabel="images"
        onPageChange={setPage}
      />

      <Dialog open={!!preview} onOpenChange={() => setPreview(null)}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              {preview?.description || "No description"}
            </DialogTitle>
          </DialogHeader>
          {preview && (
            <img
              src={`${BASE_URL}${preview.image}`}
              alt={preview.description}
              className="max-h-[70vh] w-full rounded-2xl object-cover"
            />
          )}
        </DialogContent>
      </Dialog>

      {/* ── Create Dialog ── */}
      <Dialog
        open={isCreating}
        onOpenChange={(o) => {
          if (!o) {
            resetForm();
            setIsCreating(false);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="w-4 h-4 text-blue-600" /> Add image
            </DialogTitle>
            <DialogDescription>
              Upload an image to the gallery.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-xl p-4 cursor-pointer hover:border-blue-400 hover:bg-blue-50/40 transition-colors">
              {imagePreview ? (
                <img
                  src={imagePreview}
                  className="h-40 w-full object-cover rounded-lg mb-2"
                />
              ) : (
                <Upload className="w-6 h-6 text-blue-400 mb-1" />
              )}
              <p className="text-xs text-slate-400">
                {selectedFile?.name || "Click to upload image"}
              </p>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
            </label>
            <div className="space-y-1.5">
              <Label className="text-sm text-muted-foreground">
                Description
              </Label>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter image description"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                resetForm();
                setIsCreating(false);
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={!selectedFile || saving}>
              {saving ? "Uploading..." : "Add image"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Edit Dialog ── */}
      <Dialog
        open={!!editing}
        onOpenChange={(o) => {
          if (!o) {
            setEditing(null);
            resetForm();
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pencil className="w-4 h-4 text-blue-600" /> Edit image
            </DialogTitle>
            <DialogDescription>
              Update the image or its description.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-xl p-4 cursor-pointer hover:border-blue-400 hover:bg-blue-50/40 transition-colors">
              {imagePreview ? (
                <img
                  src={imagePreview}
                  className="h-40 w-full object-cover rounded-lg mb-2"
                />
              ) : (
                <Upload className="w-6 h-6 text-blue-400 mb-1" />
              )}
              <p className="text-xs text-slate-400">
                {selectedFile?.name || "Click to change image"}
              </p>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
            </label>
            <div className="space-y-1.5">
              <Label className="text-sm text-muted-foreground">
                Description
              </Label>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter image description"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setEditing(null);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} disabled={saving}>
              {saving ? "Saving..." : "Save changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete Dialog ── */}
      <Dialog open={!!deleteItem} onOpenChange={() => setDeleteItem(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete image?</DialogTitle>
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
