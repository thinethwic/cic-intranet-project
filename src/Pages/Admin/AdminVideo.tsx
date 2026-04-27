import { useState, useEffect } from "react";
import {
  Eye,
  Link as LinkIcon,
  Pencil,
  Play,
  Trash2,
  Upload,
  Video,
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
import {
  ActionDropdown,
  AdminCard,
  AdminSearchInput,
  AdminSectionHeader,
  FilterPillGroup,
  StatCard,
  StatusBadge,
} from "./admin-components";
import {
  getAllVideos,
  createVideo,
  updateVideo,
  deleteVideo,
} from "@/lib/api/videoApi";

import type { video } from "@/types";

const sourceOptions = ["All", "Facebook", "YouTube", "Other"];

const getSource = (url: string) => {
  const n = url.toLowerCase();
  if (n.includes("facebook") || n.includes("fb.")) return "Facebook";
  if (n.includes("youtube") || n.includes("youtu.be")) return "YouTube";
  return "Other";
};

const getYouTubeId = (url: string) => {
  if (!url.includes("http")) return url;
  const match = url.match(/(?:youtube\.com\/.*v=|youtu\.be\/)([^&]+)/);
  return match ? match[1] : "";
};

const getEmbedUrl = (url: string) => {
  const source = getSource(url);
  if (source === "Facebook")
    return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&show_text=false`;
  if (source === "YouTube") {
    const id = getYouTubeId(url);
    return id ? `https://www.youtube.com/embed/${id}` : url;
  }
  return url;
};

const getYouTubeThumb = (url: string) => {
  const id = getYouTubeId(url);
  return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : "";
};

const EMPTY_FORM = { title: "", description: "", videoLink: "" };

export default function AdminVideosPage() {
  const [videos, setVideos] = useState<video[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [sourceFilter, setSourceFilter] = useState("All");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<video | null>(null);
  const [previewItem, setPreviewItem] = useState<video | null>(null);
  const [deleteItem, setDeleteItem] = useState<video | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      const data = await getAllVideos();
      setVideos(data);
    } catch (err) {
      console.error("Failed to fetch videos", err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = videos.filter((v) => {
    const q = search.toLowerCase();
    return (
      (v.title.toLowerCase().includes(q) ||
        v.description?.toLowerCase().includes(q) ||
        v.videoLink.toLowerCase().includes(q)) &&
      (sourceFilter === "All" || getSource(v.videoLink) === sourceFilter)
    );
  });

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setEditingItem(null);
    setDialogOpen(true);
  };

  const openEdit = (video: video) => {
    setForm({
      title: video.title,
      description: video.description ?? "",
      videoLink: video.videoLink,
    });
    setEditingItem(video);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.videoLink.trim()) return;
    try {
      setSaving(true);
      if (editingItem) {
        await updateVideo(editingItem.id, form);
      } else {
        await createVideo(form);
      }
      await fetchVideos();
      setDialogOpen(false);
      setForm(EMPTY_FORM);
      setEditingItem(null);
    } catch (err) {
      console.error("Failed to save video", err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteItem) return;
    try {
      await deleteVideo(deleteItem.id);
      await fetchVideos();
      setDeleteItem(null);
    } catch (err) {
      console.error("Failed to delete video", err);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <AdminSectionHeader
        title="Videos"
        description={`${videos.length} videos`}
        action={
          <Button onClick={openCreate} className="gap-2 rounded-2xl">
            <Upload className="h-4 w-4" /> Add Video
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <StatCard
          title="Total Videos"
          value={loading ? "..." : videos.length}
          icon={Video}
          tone="violet"
        />
        <StatCard
          title="Facebook"
          value={
            loading
              ? "..."
              : videos.filter((v) => getSource(v.videoLink) === "Facebook")
                  .length
          }
          icon={Play}
          tone="blue"
        />
        <StatCard
          title="YouTube"
          value={
            loading
              ? "..."
              : videos.filter((v) => getSource(v.videoLink) === "YouTube")
                  .length
          }
          icon={Play}
          tone="emerald"
        />
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <AdminSearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search videos..."
        />
        <FilterPillGroup
          options={sourceOptions}
          value={sourceFilter}
          onChange={setSourceFilter}
        />
      </div>

      {loading ? (
        <AdminCard>
          <CardContent className="flex h-48 items-center justify-center text-sm text-muted-foreground">
            Loading videos...
          </CardContent>
        </AdminCard>
      ) : filtered.length === 0 ? (
        <AdminCard>
          <CardContent className="flex h-48 items-center justify-center text-sm text-muted-foreground">
            No videos found.
          </CardContent>
        </AdminCard>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((video) => {
            const source = getSource(video.videoLink);
            const thumb = getYouTubeThumb(video.videoLink);
            return (
              <AdminCard key={video.id} className="overflow-hidden">
                <button
                  type="button"
                  onClick={() => setPreviewItem(video)}
                  className="group relative block aspect-video w-full overflow-hidden bg-muted text-left"
                >
                  {source === "YouTube" && thumb ? (
                    <img
                      src={thumb}
                      alt=""
                      className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    />
                  ) : source === "Facebook" ? (
                    <iframe
                      title={video.title}
                      src={getEmbedUrl(video.videoLink)}
                      className="h-full w-full pointer-events-none"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-violet-50 text-violet-600">
                      <Video className="h-10 w-10" />
                    </div>
                  )}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-100 transition-colors group-hover:bg-black/35">
                    <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white/90 shadow-sm">
                      <Play className="ml-1 h-6 w-6 text-slate-900" />
                    </span>
                  </div>
                </button>
                <CardContent className="space-y-4 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 space-y-2">
                      <p className="line-clamp-2 text-sm font-medium leading-snug">
                        {video.title}
                      </p>
                      <p className="line-clamp-2 text-xs text-muted-foreground">
                        {video.description || "No description"}
                      </p>
                      <div className="flex flex-wrap items-center gap-2">
                        <StatusBadge
                          tone={source === "Facebook" ? "blue" : "violet"}
                        >
                          {source}
                        </StatusBadge>
                        <a
                          href={video.videoLink}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex min-w-0 items-center gap-1 text-xs text-muted-foreground hover:text-primary"
                        >
                          <LinkIcon className="h-3 w-3 shrink-0" />
                          <span className="truncate">Open link</span>
                        </a>
                      </div>
                    </div>
                    <ActionDropdown
                      actions={[
                        {
                          label: "Preview",
                          icon: Eye,
                          onClick: () => setPreviewItem(video),
                        },
                        {
                          label: "Edit",
                          icon: Pencil,
                          onClick: () => openEdit(video),
                        },
                        {
                          label: "Delete",
                          icon: Trash2,
                          onClick: () => setDeleteItem(video),
                          destructive: true,
                        },
                      ]}
                    />
                  </div>
                </CardContent>
              </AdminCard>
            );
          })}
        </div>
      )}

      {/* Create / Edit dialog */}
      <Dialog
        open={dialogOpen}
        onOpenChange={(o) => {
          if (!o) {
            setDialogOpen(false);
            setEditingItem(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? "Edit video" : "Add video"}
            </DialogTitle>
            <DialogDescription>
              Title, description, and video link.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Title</Label>
              <Input
                value={form.title}
                onChange={(e) =>
                  setForm((p) => ({ ...p, title: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">
                Description
              </Label>
              <Textarea
                value={form.description}
                onChange={(e) =>
                  setForm((p) => ({ ...p, description: e.target.value }))
                }
                className="min-h-24 resize-none"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">
                Video link
              </Label>
              <Input
                value={form.videoLink}
                onChange={(e) =>
                  setForm((p) => ({ ...p, videoLink: e.target.value }))
                }
                placeholder="https://facebook.com/reel/..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!form.title.trim() || !form.videoLink.trim() || saving}
            >
              {saving
                ? "Saving..."
                : editingItem
                  ? "Save changes"
                  : "Add video"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview dialog */}
      <Dialog open={!!previewItem} onOpenChange={() => setPreviewItem(null)}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>{previewItem?.title}</DialogTitle>
            <DialogDescription>
              {previewItem?.description || previewItem?.videoLink}
            </DialogDescription>
          </DialogHeader>
          {previewItem && (
            <div className="overflow-hidden rounded-2xl bg-muted">
              <iframe
                title={previewItem.title}
                src={getEmbedUrl(previewItem.videoLink)}
                className="aspect-video w-full"
                allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete dialog */}
      <Dialog open={!!deleteItem} onOpenChange={() => setDeleteItem(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete video?</DialogTitle>
            <DialogDescription>
              "{deleteItem?.title}" will be permanently removed.
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
