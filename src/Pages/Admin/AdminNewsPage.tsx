import { useState, useRef } from "react";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Flame,
  Calendar,
  Clock,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { newsList as initialNews } from "@/Mock-data";

// ── Types ────────────────────────────────────────────────────
interface NewsItem {
  id: number;
  title: string;
  description: string;
  content: string;
  image: string;
  category: string;
  author: string;
  date: string;
  readTime: string;
  isHot: boolean;
}

const CATEGORIES = [
  "Agriculture",
  "Education",
  "Corporate",
  "Health",
  "Technology",
];
const CAT_FILTER = ["All", ...CATEGORIES];
const HOT_FILTER = ["All news", "Hot only", "Standard only"];

const EMPTY_FORM = {
  title: "",
  description: "",
  content: "",
  image: "",
  category: "Agriculture",
  author: "",
  date: "",
  readTime: "",
  isHot: false,
};

// ── Reusable dropdown ────────────────────────────────────────
function FilterDropdown({
  options,
  value,
  onChange,
  className,
}: {
  label: string;
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

// ── Image upload zone ────────────────────────────────────────
function ImageUploadZone({
  value,
  onChange,
}: {
  value: string;
  onChange: (src: string) => void;
}) {
  const ref = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => onChange(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <div
      onClick={() => ref.current?.click()}
      className="relative border-2 border-dashed border-slate-200 rounded-xl overflow-hidden cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 transition-colors mb-5"
    >
      {value ? (
        <div className="relative">
          <img
            src={value}
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
        onChange={handleFile}
      />
    </div>
  );
}

// ── News form (shared by create + edit) ──────────────────────
function NewsForm({
  form,
  setForm,
}: {
  form: typeof EMPTY_FORM;
  setForm: React.Dispatch<React.SetStateAction<typeof EMPTY_FORM>>;
}) {
  const set = (k: string, v: any) => setForm((p) => ({ ...p, [k]: v }));

  return (
    <div className="space-y-4">
      <ImageUploadZone value={form.image} onChange={(v) => set("image", v)} />

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
          placeholder="Short summary shown on the card..."
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
          placeholder="Write the full article body here. Use double line breaks for paragraphs."
          value={form.content}
          onChange={(e) => set("content", e.target.value)}
          className="resize-none h-32"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-slate-600">Category</Label>
          <FilterDropdown
            label={form.category}
            options={CATEGORIES}
            value={form.category}
            onChange={(v) => set("category", v)}
            className="w-full"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-slate-600">Author</Label>
          <Input
            placeholder="e.g. CIC Editorial"
            value={form.author}
            onChange={(e) => set("author", e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-slate-600">Date</Label>
          <Input
            type="date"
            value={form.date}
            onChange={(e) => set("date", e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-slate-600">
            Read time
          </Label>
          <Input
            placeholder="e.g. 3 min read"
            value={form.readTime}
            onChange={(e) => set("readTime", e.target.value)}
          />
        </div>
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

// ── Main page ────────────────────────────────────────────────
export default function AdminNewsPage() {
  // Merge both lists, normalize so all items have required fields
  const [news, setNews] = useState<NewsItem[]>(() =>
    initialNews.map((n) => ({ ...n, content: n.content ?? "" })),
  );

  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("All");
  const [hotFilter, setHotFilter] = useState("All news");
  const [showCreate, setShowCreate] = useState(false);
  const [editItem, setEditItem] = useState<NewsItem | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [createForm, setCreateForm] = useState({ ...EMPTY_FORM });
  const [editForm, setEditForm] = useState({ ...EMPTY_FORM });

  // ── Derived data ──────────────────────────────────────────
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

  // ── CRUD handlers ─────────────────────────────────────────
  const handleCreate = () => {
    if (!createForm.title.trim()) return;
    setNews((prev) => [
      {
        id: Date.now(),
        ...createForm,
      },
      ...prev,
    ]);
    setCreateForm({ ...EMPTY_FORM });
    setShowCreate(false);
  };

  const openEdit = (item: NewsItem) => {
    setEditItem(item);
    setEditForm({
      title: item.title,
      description: item.description,
      content: item.content,
      image: item.image,
      category: item.category,
      author: item.author,
      date: item.date,
      readTime: item.readTime,
      isHot: item.isHot,
    });
  };

  const handleSaveEdit = () => {
    if (!editItem) return;
    setNews((prev) =>
      prev.map((n) => (n.id === editItem.id ? { ...n, ...editForm } : n)),
    );
    setEditItem(null);
  };

  const handleDelete = () => {
    setNews((prev) => prev.filter((n) => n.id !== deleteId));
    setDeleteId(null);
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
          { label: "Total articles", value: news.length },
          { label: "Hot news", value: hotCount },
          { label: "Categories", value: catCount },
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
          label="All categories"
          options={CAT_FILTER}
          value={catFilter}
          onChange={setCatFilter}
          className="min-w-[150px]"
        />
        <FilterDropdown
          label="All news"
          options={HOT_FILTER}
          value={hotFilter}
          onChange={setHotFilter}
          className="min-w-[140px]"
        />
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 text-slate-400">
          <Search className="w-10 h-10 mx-auto mb-3 opacity-20" />
          <p className="text-sm">No articles found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtered.map((item) => (
            <Card
              key={item.id}
              className="overflow-hidden border-slate-200 hover:border-slate-300 transition-colors group"
            >
              {item.image ? (
                <img
                  src={item.image}
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
                  {item.readTime && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {item.readTime}
                    </span>
                  )}
                  {item.date && (
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> {fmtDate(item.date)}
                    </span>
                  )}
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

      {filtered.length > 0 && (
        <p className="text-xs text-slate-400 text-right">
          Showing {filtered.length} of {news.length} articles
        </p>
      )}

      {/* ── Create Dialog ───────────────────────────────────── */}
      <Dialog
        open={showCreate}
        onOpenChange={(o) => {
          if (!o) setCreateForm({ ...EMPTY_FORM });
          setShowCreate(o);
        }}
      >
        <DialogContent className="sm:max-w-lg p-0 gap-0 overflow-hidden max-h-[90vh] flex flex-col">
          {/* Sticky header */}
          <DialogHeader className="px-6 py-4 border-b border-slate-100 shrink-0">
            <DialogTitle className="flex items-center gap-2">
              <Plus className="w-4 h-4 text-blue-600" /> Create news article
            </DialogTitle>
            <DialogDescription>
              Fill in the details to publish a new article.
            </DialogDescription>
          </DialogHeader>

          {/* Scrollable body only */}
          <div className="overflow-y-auto flex-1 px-6 py-5">
            <NewsForm form={createForm} setForm={setCreateForm} />
          </div>

          {/* Sticky footer */}
          <DialogFooter className="px-6 py-4 border-t border-slate-100 shrink-0">
            <Button
              variant="outline"
              onClick={() => {
                setCreateForm({ ...EMPTY_FORM });
                setShowCreate(false);
              }}
            >
              Cancel
            </Button>
            <Button
              disabled={!createForm.title.trim()}
              onClick={handleCreate}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Publish article
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Edit Dialog ─────────────────────────────────────── */}
      <Dialog
        open={!!editItem}
        onOpenChange={(o) => {
          if (!o) setEditItem(null);
        }}
      >
        <DialogContent className="sm:max-w-lg p-0 gap-0 overflow-hidden max-h-[90vh] flex flex-col">
          {/* Sticky header */}
          <DialogHeader className="px-6 py-4 border-b border-slate-100 shrink-0">
            <DialogTitle className="flex items-center gap-2">
              <Pencil className="w-4 h-4 text-blue-600" /> Edit article
            </DialogTitle>
            <DialogDescription>
              Update the details for this article.
            </DialogDescription>
          </DialogHeader>

          {/* Scrollable body only */}
          <div className="overflow-y-auto flex-1 px-6 py-5">
            <NewsForm form={editForm} setForm={setEditForm} />
          </div>

          {/* Sticky footer */}
          <DialogFooter className="px-6 py-4 border-t border-slate-100 shrink-0">
            <Button variant="outline" onClick={() => setEditItem(null)}>
              Cancel
            </Button>
            <Button
              disabled={!editForm.title.trim()}
              onClick={handleSaveEdit}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Save changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete Dialog ───────────────────────────────────── */}
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
