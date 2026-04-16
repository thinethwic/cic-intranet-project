import { useState } from "react";
import { Eye, Link as LinkIcon, Pencil, Play, Trash2, Upload, Video } from "lucide-react";

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
import { videos as mockVideos } from "@/Mock-data";

import {
  ActionDropdown,
  AdminCard,
  AdminSearchInput,
  AdminSectionHeader,
  FilterPillGroup,
  StatCard,
  StatusBadge,
} from "./admin-components";

interface VideoItem {
  id: number;
  title: string;
  description: string;
  videoLink: string;
}

const sourceOptions = ["All", "Facebook", "YouTube", "Other"];

const getSource = (url: string) => {
  const normalized = url.toLowerCase();
  if (normalized.includes("facebook") || normalized.includes("fb.")) {
    return "Facebook";
  }
  if (normalized.includes("youtube") || normalized.includes("youtu.be")) {
    return "YouTube";
  }
  return "Other";
};

const getYouTubeId = (url: string) => {
  if (!url.includes("http")) return url;
  const match = url.match(/(?:youtube\.com\/.*v=|youtu\.be\/)([^&]+)/);
  return match ? match[1] : "";
};

const getEmbedUrl = (url: string) => {
  const source = getSource(url);

  if (source === "Facebook") {
    return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(
      url,
    )}&show_text=false`;
  }

  if (source === "YouTube") {
    const youtubeId = getYouTubeId(url);
    return youtubeId ? `https://www.youtube.com/embed/${youtubeId}` : url;
  }

  return url;
};

const getYouTubeThumb = (url: string) => {
  const youtubeId = getYouTubeId(url);
  return youtubeId ? `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg` : "";
};

export default function AdminVideosPage() {
  const [videos, setVideos] = useState<VideoItem[]>(() =>
    mockVideos.map((video, index) => ({
      id: index + 1,
      title: video.title,
      description: video.description,
      videoLink: video.videoLink,
    })),
  );
  const [search, setSearch] = useState("");
  const [sourceFilter, setSourceFilter] = useState("All");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<VideoItem | null>(null);
  const [previewItem, setPreviewItem] = useState<VideoItem | null>(null);
  const [deleteItem, setDeleteItem] = useState<VideoItem | null>(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    videoLink: "",
  });

  const filtered = videos.filter((video) => {
    const query = search.toLowerCase();
    const matchesSearch =
      video.title.toLowerCase().includes(query) ||
      video.description.toLowerCase().includes(query) ||
      video.videoLink.toLowerCase().includes(query);
    const matchesSource =
      sourceFilter === "All" || getSource(video.videoLink) === sourceFilter;

    return matchesSearch && matchesSource;
  });

  const resetForm = () =>
    setForm({
      title: "",
      description: "",
      videoLink: "",
    });

  const openCreate = () => {
    resetForm();
    setEditingItem(null);
    setDialogOpen(true);
  };

  const openEdit = (video: VideoItem) => {
    setForm({
      title: video.title,
      description: video.description,
      videoLink: video.videoLink,
    });
    setEditingItem(video);
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.title.trim() || !form.videoLink.trim()) return;

    if (editingItem) {
      setVideos((prev) =>
        prev.map((video) =>
          video.id === editingItem.id ? { ...video, ...form } : video,
        ),
      );
    } else {
      setVideos((prev) => [
        {
          id: Date.now(),
          ...form,
        },
        ...prev,
      ]);
    }

    resetForm();
    setEditingItem(null);
    setDialogOpen(false);
  };

  const handleDelete = () => {
    if (!deleteItem) return;
    setVideos((prev) => prev.filter((video) => video.id !== deleteItem.id));
    setDeleteItem(null);
  };

  return (
    <div className="space-y-6 p-6">
      <AdminSectionHeader
        title="Videos"
        description={`${videos.length} videos from the existing intranet mock data.`}
        action={
          <Button onClick={openCreate} className="gap-2 rounded-2xl">
            <Upload className="h-4 w-4" />
            Add Video
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <StatCard title="Total Videos" value={videos.length} icon={Video} tone="violet" />
        <StatCard
          title="Facebook Links"
          value={videos.filter((video) => getSource(video.videoLink) === "Facebook").length}
          icon={Play}
          tone="blue"
        />
        <StatCard
          title="With Description"
          value={videos.filter((video) => video.description.trim()).length}
          icon={LinkIcon}
          tone="emerald"
        />
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <AdminSearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search videos by title, description, or URL..."
        />
        <FilterPillGroup
          options={sourceOptions}
          value={sourceFilter}
          onChange={setSourceFilter}
        />
      </div>

      {filtered.length === 0 ? (
        <AdminCard>
          <CardContent className="flex h-48 items-center justify-center text-sm text-muted-foreground">
            No videos found.
          </CardContent>
        </AdminCard>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((video) => {
            const source = getSource(video.videoLink);
            const youtubeThumb = getYouTubeThumb(video.videoLink);

            return (
              <AdminCard key={video.id} className="overflow-hidden">
                <button
                  type="button"
                  onClick={() => setPreviewItem(video)}
                  className="group relative block aspect-video w-full overflow-hidden bg-muted text-left"
                >
                  {source === "YouTube" && youtubeThumb ? (
                    <img
                      src={youtubeThumb}
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
                        {video.description || "No description added"}
                      </p>
                      <div className="flex flex-wrap items-center gap-2">
                        <StatusBadge tone={source === "Facebook" ? "blue" : "violet"}>
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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingItem ? "Edit video" : "Add video"}</DialogTitle>
            <DialogDescription>
              This form matches the existing mock data fields: title, description, and video link.
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
                placeholder="e.g. Honey Glazed Chicken With CIC Besto Chicken"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Description</Label>
              <Textarea
                value={form.description}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    description: event.target.value,
                  }))
                }
                placeholder="Optional short description"
                className="min-h-24 resize-none"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Video link</Label>
              <Input
                value={form.videoLink}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, videoLink: event.target.value }))
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
              disabled={!form.title.trim() || !form.videoLink.trim()}
            >
              {editingItem ? "Save changes" : "Add video"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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

      <Dialog open={!!deleteItem} onOpenChange={() => setDeleteItem(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete video?</DialogTitle>
            <DialogDescription>
              "{deleteItem?.title}" will be removed from the admin list.
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
