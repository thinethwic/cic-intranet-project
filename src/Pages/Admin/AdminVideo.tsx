import { useState } from "react";
import {
  Upload,
  Search,
  Trash2,
  Pencil,
  Eye,
  X,
  Check,
  Filter,
  Play,
  Clock,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// ── Types ────────────────────────────────────────────────────
interface VideoItem {
  id: number;
  title: string;
  category: string;
  duration: string;
  uploadedBy: string;
  date: string;
  thumbnail: string;
}

// ── Mock Data ────────────────────────────────────────────────
const initialVideos: VideoItem[] = [
  {
    id: 1,
    title: "CIC Annual General Meeting 2026",
    category: "Company",
    duration: "45:12",
    uploadedBy: "Admin",
    date: "Apr 8, 2026",
    thumbnail: "bg-blue-200",
  },
  {
    id: 2,
    title: "New Employee Onboarding Guide",
    category: "HR",
    duration: "12:34",
    uploadedBy: "Admin",
    date: "Apr 5, 2026",
    thumbnail: "bg-teal-200",
  },
  {
    id: 3,
    title: "IT Security Best Practices",
    category: "IT",
    duration: "28:07",
    uploadedBy: "Admin",
    date: "Apr 3, 2026",
    thumbnail: "bg-violet-200",
  },
  {
    id: 4,
    title: "Q1 Financial Summary Presentation",
    category: "Finance",
    duration: "18:50",
    uploadedBy: "Admin",
    date: "Mar 30, 2026",
    thumbnail: "bg-amber-200",
  },
  {
    id: 5,
    title: "CIC Vetcare Product Launch",
    category: "Marketing",
    duration: "9:22",
    uploadedBy: "Admin",
    date: "Mar 25, 2026",
    thumbnail: "bg-pink-200",
  },
  {
    id: 6,
    title: "Safety Training Module 1",
    category: "Operations",
    duration: "33:45",
    uploadedBy: "Admin",
    date: "Mar 20, 2026",
    thumbnail: "bg-orange-200",
  },
];

const categories = [
  "All",
  "Company",
  "HR",
  "IT",
  "Finance",
  "Marketing",
  "Operations",
];

const catStyles: Record<string, string> = {
  Company: "bg-blue-100 text-blue-700",
  HR: "bg-amber-100 text-amber-700",
  IT: "bg-teal-100 text-teal-700",
  Finance: "bg-violet-100 text-violet-700",
  Marketing: "bg-pink-100 text-pink-700",
  Operations: "bg-orange-100 text-orange-700",
};

// ── Component ────────────────────────────────────────────────
export default function AdminVideosPage() {
  const [videos, setVideos] = useState<VideoItem[]>(initialVideos);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("All");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [showUpload, setShowUpload] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState("IT");
  const [newDuration, setNewDuration] = useState("");
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [previewId, setPreviewId] = useState<number | null>(null);

  const filtered = videos.filter((v) => {
    const matchSearch = v.title.toLowerCase().includes(search.toLowerCase());
    const matchCat = catFilter === "All" || v.category === catFilter;
    return matchSearch && matchCat;
  });

  const handleDelete = (id: number) => {
    setVideos((prev) => prev.filter((v) => v.id !== id));
    setDeleteConfirmId(null);
  };

  const handleRename = (id: number) => {
    setVideos((prev) =>
      prev.map((v) => (v.id === id ? { ...v, title: editTitle } : v)),
    );
    setEditingId(null);
  };

  const handleUpload = () => {
    if (!newTitle.trim()) return;
    const colors = [
      "bg-blue-200",
      "bg-teal-200",
      "bg-violet-200",
      "bg-amber-200",
      "bg-pink-200",
    ];
    const newVideo: VideoItem = {
      id: Date.now(),
      title: newTitle,
      category: newCategory,
      duration: newDuration || "—",
      uploadedBy: "Admin",
      date: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      thumbnail: colors[Math.floor(Math.random() * colors.length)],
    };
    setVideos((prev) => [newVideo, ...prev]);
    setNewTitle("");
    setNewDuration("");
    setShowUpload(false);
  };

  const previewVideo = videos.find((v) => v.id === previewId);

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
            Videos
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {videos.length} videos uploaded
          </p>
        </div>
        <Button
          onClick={() => setShowUpload(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
        >
          <Upload className="w-4 h-4" /> Upload Video
        </Button>
      </div>

      {/* ── Upload Modal ── */}
      {showUpload && (
        <Card className="border border-blue-200 shadow-md">
          <CardHeader className="px-5 py-4 border-b border-slate-100 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-semibold text-slate-700">
              Upload New Video
            </CardTitle>
            <button
              onClick={() => setShowUpload(false)}
              className="text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          </CardHeader>
          <CardContent className="p-5 grid sm:grid-cols-3 gap-4">
            <div className="sm:col-span-3">
              <label className="text-xs font-medium text-slate-600 block mb-1">
                Video Title
              </label>
              <Input
                placeholder="e.g. Q2 Town Hall Meeting"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">
                Category
              </label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {categories
                  .filter((c) => c !== "All")
                  .map((c) => (
                    <option key={c}>{c}</option>
                  ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">
                Duration
              </label>
              <Input
                placeholder="e.g. 15:30"
                value={newDuration}
                onChange={(e) => setNewDuration(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button
                onClick={handleUpload}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                Add Video
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Preview Modal ── */}
      {previewVideo && (
        <Card className="border border-slate-200 shadow-md">
          <CardHeader className="px-5 py-4 border-b border-slate-100 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-semibold text-slate-700 truncate pr-4">
              {previewVideo.title}
            </CardTitle>
            <button
              onClick={() => setPreviewId(null)}
              className="text-slate-400 hover:text-slate-600 shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </CardHeader>
          <CardContent className="p-5">
            <div
              className={`w-full h-52 rounded-xl ${previewVideo.thumbnail} flex items-center justify-center`}
            >
              <div className="w-14 h-14 rounded-full bg-white/80 flex items-center justify-center shadow">
                <Play className="w-6 h-6 text-slate-700 ml-1" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-4 text-xs text-slate-500">
              <span
                className={`font-semibold px-2.5 py-1 rounded-full text-[10px] ${catStyles[previewVideo.category]}`}
              >
                {previewVideo.category}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {previewVideo.duration}
              </span>
              <span>Uploaded {previewVideo.date}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Search & Filter ── */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            className="pl-9"
            placeholder="Search videos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="w-4 h-4 text-slate-400" />
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCatFilter(c)}
              className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-all ${
                catFilter === c
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-slate-500 border-slate-200 hover:border-blue-300 hover:text-blue-600"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* ── Video Grid ── */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-sm text-slate-400">
          No videos found.
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((video) => (
            <Card
              key={video.id}
              className="border border-slate-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
            >
              {/* Thumbnail */}
              <div
                className={`relative w-full h-36 ${video.thumbnail} flex items-center justify-center group`}
              >
                <button
                  onClick={() => setPreviewId(video.id)}
                  className="w-12 h-12 rounded-full bg-white/80 flex items-center justify-center shadow hover:scale-105 transition-transform"
                >
                  <Play className="w-5 h-5 text-slate-700 ml-0.5" />
                </button>
                <span className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded font-medium flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {video.duration}
                </span>
              </div>

              {/* Info */}
              <CardContent className="p-4">
                {editingId === video.id ? (
                  <div className="flex items-center gap-2 mb-2">
                    <Input
                      className="h-7 text-xs flex-1"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      autoFocus
                    />
                    <button
                      onClick={() => handleRename(video.id)}
                      className="text-emerald-600"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="text-slate-400"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <p className="text-sm font-semibold text-slate-700 mb-1 line-clamp-2 leading-snug">
                    {video.title}
                  </p>
                )}

                <div className="flex items-center justify-between mt-2">
                  <span
                    className={`text-[10px] font-semibold px-2.5 py-1 rounded-full ${catStyles[video.category]}`}
                  >
                    {video.category}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {video.date}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 mt-3 pt-3 border-t border-slate-100">
                  <button
                    onClick={() => setPreviewId(video.id)}
                    className="flex-1 flex items-center justify-center gap-1.5 text-xs text-slate-500 hover:text-blue-600 hover:bg-blue-50 py-1.5 rounded-lg transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" /> Preview
                  </button>
                  <button
                    onClick={() => {
                      setEditingId(video.id);
                      setEditTitle(video.title);
                    }}
                    className="flex-1 flex items-center justify-center gap-1.5 text-xs text-slate-500 hover:text-amber-600 hover:bg-amber-50 py-1.5 rounded-lg transition-colors"
                  >
                    <Pencil className="w-3.5 h-3.5" /> Edit
                  </button>
                  {deleteConfirmId === video.id ? (
                    <div className="flex-1 flex items-center justify-center gap-1 bg-red-50 py-1.5 rounded-lg">
                      <span className="text-[10px] text-red-600 font-medium">
                        Sure?
                      </span>
                      <button
                        onClick={() => handleDelete(video.id)}
                        className="text-red-600"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(null)}
                        className="text-slate-400"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeleteConfirmId(video.id)}
                      className="flex-1 flex items-center justify-center gap-1.5 text-xs text-slate-500 hover:text-red-600 hover:bg-red-50 py-1.5 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
