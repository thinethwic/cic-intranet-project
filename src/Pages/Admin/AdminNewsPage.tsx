import { useState, useRef, useEffect } from "react";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Flame,
  Calendar,
  ImagePlus,
  ChevronDown,
  Check,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { AdminPagination } from "./admin-components";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { News } from "@/types";
import {
  getAllNews,
  createNews,
  updateNews,
  deleteNews,
  updateNewsImage,
} from "@/lib/api/newsApi";
import { getAdminUser } from "@/lib/api/authHeaders";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

const CATEGORIES = ["CIC_FEEDS", "CIC_VET_CARE", "CIC_POULTRY", "AISA_VET"];
const CAT_FILTER = ["All", ...CATEGORIES];
const HOT_FILTER = ["All news", "Hot only", "Standard only"];

const EMPTY_FORM = {
  title: "",
  description: "",
  content: "",
  category: "CIC_FEEDS",
  isHot: false,
};

// ── FilterDropdown ───────────────────────────────────────────
function FilterDropdown({
  options,
  value,
  onChange,
  className,
}: {
  label?: string;
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
          className={`h-9 gap-2 text-sm font-normal justify-between ${value !== options[0] ? "border-blue-500 text-blue-600" : ""} ${className ?? ""}`}
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

// ── ImageUploadZone ──────────────────────────────────────────
function ImageUploadZone({
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
            alt="Preview"
            className="w-full h-48 object-cover block"
          />
          <div className="absolute inset-0 bg-black/30 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
            <p className="text-white text-sm font-medium flex items-center gap-2">
              <ImagePlus className="w-4 h-4" /> Change image
            </p>
          </div>
        </div>
      ) : (
        <div className="h-36 flex flex-col items-center justify-center gap-2">
          <ImagePlus className="w-7 h-7 text-blue-500" />
          <p className="text-sm text-slate-600 font-medium">
            Click to upload image
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

// ── NewsForm ─────────────────────────────────────────────────
function NewsForm({
  form,
  setForm,
  imagePreview,
  onImageChange,
}: {
  form: typeof EMPTY_FORM;
  setForm: React.Dispatch<React.SetStateAction<typeof EMPTY_FORM>>;
  imagePreview: string | null;
  onImageChange: (file: File) => void;
}) {
  const set = (k: string, v: any) => setForm((p) => ({ ...p, [k]: v }));
  return (
    <div className="space-y-4">
      <ImageUploadZone preview={imagePreview} onFileChange={onImageChange} />

      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-slate-600">Title</Label>
        <Input
          placeholder="Enter article title"
          value={form.title}
          onChange={(e) => set("title", e.target.value)}
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-slate-600">
          Description
        </Label>
        <Textarea
          placeholder="Short summary..."
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
          className="resize-none h-20"
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-slate-600">
          Full content
        </Label>
        <Textarea
          placeholder="Write the full article body here..."
          value={form.content}
          onChange={(e) => set("content", e.target.value)}
          className="resize-none h-32"
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-slate-600">Category</Label>
        <FilterDropdown
          options={CATEGORIES}
          value={form.category}
          onChange={(v) => set("category", v)}
          className="w-full"
        />
      </div>

      <div className="flex items-center justify-between py-3 border-t border-slate-100">
        <div>
          <p className="text-sm font-medium">Mark as hot news</p>
          <p className="text-xs text-slate-400 mt-0.5">
            Shows in the hot news slider
          </p>
        </div>
        <Switch checked={form.isHot} onCheckedChange={(v) => set("isHot", v)} />
      </div>
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────
export default function AdminNewsPage() {
  const PAGE_SIZE = 8;
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("All");
  const [hotFilter, setHotFilter] = useState("All news");
  const [showCreate, setShowCreate] = useState(false);
  const [editItem, setEditItem] = useState<News | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const [createForm, setCreateForm] = useState({ ...EMPTY_FORM });
  const [editForm, setEditForm] = useState({ ...EMPTY_FORM });

  const [createImageFile, setCreateImageFile] = useState<File | null>(null);
  const [createImagePreview, setCreateImagePreview] = useState<string | null>(
    null,
  );
  const [editImageFile, setEditImageFile] = useState<File | null>(null);
  const [editImagePreview, setEditImagePreview] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      setLoading(true);
      const data = await getAllNews();
      setNews(data);
    } catch (err) {
      console.error("Failed to fetch news", err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = news.filter((n) => {
    const q = search.toLowerCase();
    return (
      n.title.toLowerCase().includes(q) &&
      (catFilter === "All" || n.category === catFilter) &&
      (hotFilter === "All news" ||
        (hotFilter === "Hot only" && n.isHot) ||
        (hotFilter === "Standard only" && !n.isHot))
    );
  });

  useEffect(() => {
    setPage(1);
  }, [search, catFilter, hotFilter, news.length]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const hotCount = news.filter((n) => n.isHot).length;
  const catCount = new Set(news.map((n) => n.category)).size;

  const fmtDate = (d: string) => {
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
  };

  // ── Create ───────────────────────────────────────────────
  const handleCreate = async () => {
    if (!createForm.title.trim()) return;
    try {
      setSaving(true);
      const adminUser = getAdminUser();
      const formData = new FormData();
      formData.append(
        "data",
        new Blob(
          [
            JSON.stringify({
              title: createForm.title,
              description: createForm.description,
              content: createForm.content,
              category: createForm.category,
              isHot: createForm.isHot,
              authorId: adminUser?.userId ?? null,
            }),
          ],
          { type: "application/json" },
        ),
      );
      if (createImageFile) {
        formData.append("image", createImageFile);
      }
      await createNews(formData);
      await fetchNews();
      setCreateForm({ ...EMPTY_FORM });
      setCreateImageFile(null);
      setCreateImagePreview(null);
      setShowCreate(false);
    } catch (err) {
      console.error("Failed to create news", err);
    } finally {
      setSaving(false);
    }
  };

  // ── Open Edit ────────────────────────────────────────────
  const openEdit = (item: News) => {
    setEditItem(item);
    setEditForm({
      title: item.title,
      description: item.description,
      content: item.content,
      category: item.category,
      isHot: item.isHot,
    });
    setEditImageFile(null);
    setEditImagePreview(item.image ? `${BASE_URL}${item.image}` : null);
  };

  // ── Save Edit ────────────────────────────────────────────const handleSaveEdit = async () => {
  const handleSaveEdit = async () => {
    console.log("editImageFile:", editImageFile);
    if (!editItem) return;
    try {
      setSaving(true);
      const adminUser = getAdminUser();

      // ✅ Always update metadata
      await updateNews(editItem.id, {
        title: editForm.title,
        description: editForm.description,
        content: editForm.content,
        category: editForm.category,
        isHot: editForm.isHot,
        authorId: adminUser?.userId ?? null,
      });

      // ✅ Only update image if a new one was selected
      if (editImageFile) {
        await updateNewsImage(editItem.id, editImageFile);
      }

      await fetchNews();
      setEditItem(null);
      setEditImageFile(null);
      setEditImagePreview(null);
    } catch (err) {
      console.error("Failed to update news", err);
    } finally {
      setSaving(false);
    }
  };

  // ── Delete ───────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteNews(deleteId);
      await fetchNews();
      setDeleteId(null);
    } catch (err) {
      console.error("Failed to delete news", err);
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">News</h1>
          <p className="text-sm text-slate-500 mt-1 flex items-center gap-2">
            <span>{news.length} articles</span>
            <span className="w-px h-3 bg-slate-300" />
            <Flame className="w-3 h-3 text-red-500" />
            <span>{hotCount} hot</span>
          </p>
        </div>
        <Button
          onClick={() => setShowCreate(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
        >
          <Plus className="w-4 h-4" /> Create news
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total articles", value: loading ? "..." : news.length },
          { label: "Hot news", value: loading ? "..." : hotCount },
          { label: "Categories", value: loading ? "..." : catCount },
        ].map((s) => (
          <div key={s.label} className="bg-slate-50 rounded-lg p-4">
            <p className="text-xs text-slate-500 mb-1">{s.label}</p>
            <p className="text-2xl font-semibold">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            className="pl-9 bg-white h-9"
            placeholder="Search news..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <FilterDropdown
          options={CAT_FILTER}
          value={catFilter}
          onChange={setCatFilter}
          className="min-w-[150px]"
        />
        <FilterDropdown
          options={HOT_FILTER}
          value={hotFilter}
          onChange={setHotFilter}
          className="min-w-[140px]"
        />
      </div>

      {/* Grid */}
      {loading ? (
        <div className="text-center py-20 text-slate-400">
          <p className="text-sm">Loading news...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-slate-400">
          <Search className="w-10 h-10 mx-auto mb-3 opacity-20" />
          <p className="text-sm">No articles found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {paginated.map((item) => (
            <Card
              key={item.id}
              className="overflow-hidden border-slate-200 hover:border-slate-300 transition-colors group"
            >
              {item.image ? (
                <img
                  src={`${BASE_URL}${item.image}`}
                  alt={item.title}
                  className="w-full h-44 object-cover block"
                />
              ) : (
                <div className="w-full h-44 bg-slate-100 flex items-center justify-center">
                  <ImagePlus className="w-8 h-8 text-slate-300" />
                </div>
              )}
              <CardContent className="p-4">
                <div className="flex gap-2 mb-2 flex-wrap">
                  <Badge className="text-[10px] bg-blue-50 text-blue-800 border border-blue-200 hover:bg-blue-50">
                    {item.category}
                  </Badge>
                  {item.isHot && (
                    <Badge className="text-[10px] bg-red-50 text-red-800 border border-red-200 hover:bg-red-50 gap-1">
                      <Flame className="w-2.5 h-2.5" /> Hot
                    </Badge>
                  )}
                </div>
                <p className="text-sm font-medium text-slate-800 line-clamp-2 leading-snug mb-1.5">
                  {item.title}
                </p>
                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-3">
                  {item.description}
                </p>
                <div className="flex items-center gap-3 text-[11px] text-slate-400 mb-3">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {item.createdAt ? fmtDate(item.createdAt) : ""}
                  </span>
                </div>
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
          ))}
        </div>
      )}

      <AdminPagination
        page={page}
        totalPages={totalPages}
        totalItems={filtered.length}
        pageSize={PAGE_SIZE}
        itemLabel="articles"
        onPageChange={setPage}
      />

      {/* ── Create Dialog ── */}
      <Dialog
        open={showCreate}
        onOpenChange={(o) => {
          if (!o) {
            setCreateForm({ ...EMPTY_FORM });
            setCreateImageFile(null);
            setCreateImagePreview(null);
          }
          setShowCreate(o);
        }}
      >
        <DialogContent className="sm:max-w-lg p-0 gap-0 overflow-hidden max-h-[90vh] flex flex-col">
          <DialogHeader className="px-6 py-4 border-b border-slate-100 shrink-0">
            <DialogTitle className="flex items-center gap-2">
              <Plus className="w-4 h-4 text-blue-600" /> Create news article
            </DialogTitle>
            <DialogDescription>
              Fill in the details to publish a new article.
            </DialogDescription>
          </DialogHeader>
          <div className="overflow-y-auto flex-1 px-6 py-5">
            <NewsForm
              form={createForm}
              setForm={setCreateForm}
              imagePreview={createImagePreview}
              onImageChange={(file) => {
                setCreateImageFile(file);
                setCreateImagePreview(URL.createObjectURL(file));
              }}
            />
          </div>
          <DialogFooter className="px-6 py-4 border-t border-slate-100 shrink-0">
            <Button
              variant="outline"
              onClick={() => {
                setCreateForm({ ...EMPTY_FORM });
                setCreateImageFile(null);
                setCreateImagePreview(null);
                setShowCreate(false);
              }}
            >
              Cancel
            </Button>
            <Button
              disabled={!createForm.title.trim() || saving}
              onClick={handleCreate}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {saving ? "Publishing..." : "Publish article"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Edit Dialog ── */}
      <Dialog
        open={!!editItem}
        onOpenChange={(o) => {
          if (!o) {
            setEditItem(null);
            setEditImageFile(null);
            setEditImagePreview(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-lg p-0 gap-0 overflow-hidden max-h-[90vh] flex flex-col">
          <DialogHeader className="px-6 py-4 border-b border-slate-100 shrink-0">
            <DialogTitle className="flex items-center gap-2">
              <Pencil className="w-4 h-4 text-blue-600" /> Edit article
            </DialogTitle>
            <DialogDescription>
              Update the details for this article.
            </DialogDescription>
          </DialogHeader>
          <div className="overflow-y-auto flex-1 px-6 py-5">
            <NewsForm
              form={editForm}
              setForm={setEditForm}
              imagePreview={editImagePreview}
              onImageChange={(file) => {
                setEditImageFile(file);
                setEditImagePreview(URL.createObjectURL(file));
              }}
            />
          </div>
          <DialogFooter className="px-6 py-4 border-t border-slate-100 shrink-0">
            <Button
              variant="outline"
              onClick={() => {
                setEditItem(null);
                setEditImageFile(null);
                setEditImagePreview(null);
              }}
            >
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
            <DialogTitle>Delete article?</DialogTitle>
            <DialogDescription>
              "{news.find((n) => n.id === deleteId)?.title?.substring(0, 60)}
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
