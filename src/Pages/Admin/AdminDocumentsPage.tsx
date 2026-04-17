import { useState, useRef, useEffect } from "react";
import {
  FileText,
  Upload,
  Search,
  Trash2,
  Pencil,
  Download,
  Eye,
  Pin,
  FilePlus2,
  ChevronDown,
  Check,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { documents as initialDocs } from "@/Mock-data";

// FIX 1: proper types instead of literal value types
interface Document {
  id: number;
  title: string;
  category: string;
  type: "PDF" | "DOCS" | "XLSX";
  isPinned: boolean;
  fileUrl: string;
  segment: string;
  access: "public" | "private";
  allowDownload: boolean;
  allowView: boolean;
}

const TYPE_STYLES: Record<string, string> = {
  PDF: "bg-red-50 text-red-800 border-red-200",
  DOCS: "bg-blue-50 text-blue-800 border-blue-200",
  XLSX: "bg-emerald-50 text-emerald-800 border-emerald-200",
};

const SEGMENTS = ["All", "cic-feeds", "asia-vet"];
const TYPES = ["All", "PDF", "DOCS", "XLSX"] as const;
const CATEGORIES = ["All", "General", "Finance", "Legal", "Operations", "HR"];

function normalizeSegment(seg: string) {
  return seg.replace("our-segments/", "");
}

// FIX 2: removed unused `label` prop from the interface
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

export default function AdminDocumentsPage() {
  const [docs, setDocs] = useState<Document[]>(() =>
    initialDocs.map((d) => ({ ...d, segment: normalizeSegment(d.segment) })),
  );

  useEffect(() => {
    localStorage.setItem("admin-docs", JSON.stringify(docs));
  }, [docs]);

  const [search, setSearch] = useState("");
  const [segFilter, setSegFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [catFilter, setCatFilter] = useState("All");
  const [showUpload, setShowUpload] = useState(false);
  const [editDoc, setEditDoc] = useState<Document | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState<"PDF" | "DOCS" | "XLSX">("PDF");
  const [newCat, setNewCat] = useState("General");
  const [newSeg, setNewSeg] = useState("cic-feeds");
  const [newPinned, setNewPinned] = useState(false);
  const [fileName, setFileName] = useState("");
  const [newAccess, setNewAccess] = useState<"public" | "private">("public");
  const [newAllowDownload, setNewAllowDownload] = useState(true);
  const [newAllowView, setNewAllowView] = useState(true);

  // FIX 4: use split(" · ")[0] for reliable category matching
  const filtered = docs.filter((d) => {
    const q = search.toLowerCase();
    return (
      d.title.toLowerCase().includes(q) &&
      (segFilter === "All" || d.segment === segFilter) &&
      (typeFilter === "All" || d.type === typeFilter) &&
      (catFilter === "All" || d.category.split(" · ")[0] === catFilter)
    );
  });

  const pinnedCount = docs.filter((d) => d.isPinned).length;

  // FIX 3: reset access/download/view state too
  const resetUploadForm = () => {
    setNewName("");
    setNewType("PDF");
    setNewCat("General");
    setNewSeg("cic-feeds");
    setNewPinned(false);
    setFileName("");
    setNewAccess("public");
    setNewAllowDownload(true);
    setNewAllowView(true);
  };

  const handleUpload = () => {
    if (!newName.trim()) return;
    setDocs((prev) => [
      {
        id: Date.now(),
        title: newName,
        category: `${newCat} · Uploaded`,
        type: newType,
        isPinned: newPinned,
        fileUrl: "#",
        segment: newSeg,
        access: newAccess,
        allowDownload: newAllowDownload,
        allowView: newAllowView,
      },
      ...prev,
    ]);
    resetUploadForm();
    setShowUpload(false);
  };

  const handleSaveEdit = () => {
    if (!editDoc) return;
    setDocs((prev) => prev.map((d) => (d.id === editDoc.id ? editDoc : d)));
    setEditDoc(null);
  };

  const handleDelete = () => {
    setDocs((prev) => prev.filter((d) => d.id !== deleteId));
    setDeleteId(null);
  };

  const togglePin = (id: number) =>
    setDocs((prev) =>
      prev.map((d) => (d.id === id ? { ...d, isPinned: !d.isPinned } : d)),
    );

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Documents</h1>
          <p className="text-sm text-slate-500 mt-1 flex items-center gap-2">
            <span>{docs.length} total</span>
            <span className="w-px h-3 bg-slate-300" />
            <Pin className="w-3 h-3" />
            <span>{pinnedCount} pinned</span>
          </p>
        </div>
        <Button
          onClick={() => setShowUpload(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
        >
          <FilePlus2 className="w-4 h-4" /> Upload document
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            className="pl-9 bg-white h-9"
            placeholder="Search documents..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <FilterDropdown
          options={SEGMENTS}
          value={segFilter}
          onChange={setSegFilter}
          className="min-w-[140px]"
        />
        <FilterDropdown
          options={[...TYPES]}
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
      </div>

      {/* Table */}
      <Card className="border border-slate-200 shadow-sm overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 hover:bg-slate-50">
                <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wide pl-5 w-[38%]">
                  Name
                </TableHead>
                <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wide w-[10%]">
                  Type
                </TableHead>
                <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wide w-[18%]">
                  Category
                </TableHead>
                <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wide w-[16%]">
                  Segment
                </TableHead>
                <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wide text-right pr-5 w-[18%]">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-14 text-slate-400 text-sm"
                  >
                    <FileText className="w-8 h-8 mx-auto mb-2 opacity-25" />
                    No documents found
                  </TableCell>
                </TableRow>
              )}
              {filtered.map((doc) => (
                <TableRow
                  key={doc.id}
                  className="group border-b border-slate-100 hover:bg-slate-50/70"
                >
                  <TableCell className="pl-5 py-3.5">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-7 h-7 rounded-md bg-slate-100 flex items-center justify-center shrink-0">
                        <FileText className="w-3.5 h-3.5 text-slate-500" />
                      </div>
                      <span className="text-sm font-medium truncate">
                        {doc.title}
                      </span>
                      {doc.isPinned && (
                        <Badge className="text-[10px] bg-amber-50 text-amber-700 border border-amber-200 gap-1 px-1.5 shrink-0">
                          <Pin className="w-2.5 h-2.5" /> Pinned
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="py-3.5">
                    <Badge
                      variant="outline"
                      className={`text-[10px] font-medium px-2 ${TYPE_STYLES[doc.type]}`}
                    >
                      {doc.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-3.5 text-xs text-slate-500">
                    {doc.category}
                  </TableCell>
                  <TableCell className="py-3.5">
                    <span className="text-[11px] bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full">
                      {doc.segment}
                    </span>
                  </TableCell>
                  <TableCell className="py-3.5 pr-5 text-right">
                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 hover:bg-amber-50 hover:text-amber-600"
                        onClick={() => togglePin(doc.id)}
                        title={doc.isPinned ? "Unpin" : "Pin"}
                      >
                        <Pin className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 hover:bg-blue-50 hover:text-blue-600"
                        onClick={() => window.open(doc.fileUrl, "_blank")}
                        title="Preview"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 hover:bg-emerald-50 hover:text-emerald-600"
                        onClick={() => window.open(doc.fileUrl)}
                        title="Download"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 hover:bg-slate-100"
                        onClick={() => setEditDoc({ ...doc })}
                        title="Edit"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 hover:bg-red-50 hover:text-red-600"
                        onClick={() => setDeleteId(doc.id)}
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {filtered.length > 0 && (
        <p className="text-xs text-slate-400 text-right">
          Showing {filtered.length} of {docs.length} documents
        </p>
      )}

      {/* ── Upload Dialog ─────────────────────────────────── */}
      {/* ── Upload Dialog ─────────────────────────────────── */}
      <Dialog
        open={showUpload}
        onOpenChange={(open) => {
          if (!open) resetUploadForm();
          setShowUpload(open);
        }}
      >
        <DialogContent className="w-[calc(100vw-2rem)] sm:max-w-lg max-h-[90dvh] flex flex-col p-0 gap-0 rounded-xl">
          {/* Fixed header */}
          <DialogHeader className="px-5 pt-5 pb-3 border-b border-slate-100 shrink-0">
            <DialogTitle className="flex items-center gap-2 text-base">
              <Upload className="w-4 h-4 text-blue-600" /> Upload document
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Add a new document to a segment.
            </DialogDescription>
          </DialogHeader>

          {/* Scrollable body */}
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
            {/* Drop zone */}
            <div
              className="border-2 border-dashed border-slate-200 rounded-xl p-5 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/40 transition-colors"
              onClick={() => fileRef.current?.click()}
            >
              <Upload className="w-6 h-6 text-blue-500 mx-auto mb-1.5" />
              <p className="text-sm font-medium text-slate-700 break-all">
                {fileName || "Click to upload or drag & drop"}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                PDF, DOCS, XLSX supported
              </p>
              <input
                ref={fileRef}
                type="file"
                className="hidden"
                accept=".pdf,.doc,.docx,.xlsx"
                onChange={(e) => setFileName(e.target.files?.[0]?.name ?? "")}
              />
            </div>

            {/* Document name */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-slate-600">
                Document name
              </Label>
              <Input
                placeholder="e.g. Q2 Financial Report"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
            </div>

            {/* Type + Category — stack on mobile */}
            <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-slate-600">
                  Type
                </Label>
                <FilterDropdown
                  options={["PDF", "DOCS", "XLSX"]}
                  value={newType}
                  onChange={(v) => setNewType(v as "PDF" | "DOCS" | "XLSX")}
                  className="w-full"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-slate-600">
                  Category
                </Label>
                <FilterDropdown
                  options={["General", "Finance", "Legal", "Operations", "HR"]}
                  value={newCat}
                  onChange={setNewCat}
                  className="w-full"
                />
              </div>
            </div>

            {/* Segment */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-slate-600">
                Segment
              </Label>
              <FilterDropdown
                options={["cic-feeds", "asia-vet"]}
                value={newSeg}
                onChange={setNewSeg}
                className="w-full"
              />
            </div>

            {/* Toggles */}
            <div className="rounded-lg border border-slate-100 divide-y divide-slate-100">
              <div className="flex items-center justify-between px-3 py-3">
                <div>
                  <p className="text-sm font-medium">Pin document</p>
                  <p className="text-xs text-slate-400">Show at top of list</p>
                </div>
                <Switch checked={newPinned} onCheckedChange={setNewPinned} />
              </div>

              <div className="flex items-center justify-between px-3 py-3">
                <div>
                  <p className="text-sm font-medium">Private document</p>
                  <p className="text-xs text-slate-400">
                    Restrict to logged-in users
                  </p>
                </div>
                <Switch
                  checked={newAccess === "private"}
                  onCheckedChange={(v) =>
                    setNewAccess(v ? "private" : "public")
                  }
                />
              </div>

              <div className="flex items-center justify-between px-3 py-3">
                <p className="text-sm font-medium">Allow download</p>
                <Switch
                  checked={newAllowDownload}
                  onCheckedChange={setNewAllowDownload}
                />
              </div>

              <div className="flex items-center justify-between px-3 py-3">
                <p className="text-sm font-medium">Allow preview</p>
                <Switch
                  checked={newAllowView}
                  onCheckedChange={setNewAllowView}
                />
              </div>
            </div>
          </div>

          {/* Fixed footer */}
          <DialogFooter className="px-5 py-4 border-t border-slate-100 shrink-0 flex flex-row justify-end gap-2">
            <Button
              variant="outline"
              className="flex-1 sm:flex-none"
              onClick={() => {
                resetUploadForm();
                setShowUpload(false);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              disabled={!newName.trim()}
              className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 text-white"
            >
              Add document
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Edit Dialog ───────────────────────────────────── */}
      <Dialog
        open={!!editDoc}
        onOpenChange={(open) => {
          if (!open) setEditDoc(null);
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pencil className="w-4 h-4 text-blue-600" /> Edit document
            </DialogTitle>
            <DialogDescription>
              Update the details for this document.
            </DialogDescription>
          </DialogHeader>
          {editDoc && (
            <div className="grid gap-4 py-1">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-slate-600">
                  Document name
                </Label>
                <Input
                  value={editDoc.title}
                  onChange={(e) =>
                    setEditDoc({ ...editDoc, title: e.target.value })
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-slate-600">
                    Type
                  </Label>
                  <FilterDropdown
                    options={["PDF", "DOCS", "XLSX"]}
                    value={editDoc.type}
                    onChange={(v) =>
                      setEditDoc({
                        ...editDoc,
                        type: v as "PDF" | "DOCS" | "XLSX",
                      })
                    }
                    className="w-full"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-slate-600">
                    Category
                  </Label>
                  <FilterDropdown
                    options={[
                      "General",
                      "Finance",
                      "Legal",
                      "Operations",
                      "HR",
                    ]}
                    value={editDoc.category.split(" · ")[0]}
                    onChange={(v) => setEditDoc({ ...editDoc, category: v })}
                    className="w-full"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-slate-600">
                  Segment
                </Label>
                <FilterDropdown
                  options={["cic-feeds", "asia-vet"]}
                  value={editDoc.segment}
                  onChange={(v) => setEditDoc({ ...editDoc, segment: v })}
                  className="w-full"
                />
              </div>
              <div className="flex items-center justify-between py-2 border-t border-slate-100">
                <div>
                  <p className="text-sm font-medium">Pinned</p>
                  <p className="text-xs text-slate-400">
                    Show at the top of the list
                  </p>
                </div>
                <Switch
                  checked={editDoc.isPinned}
                  onCheckedChange={(v) =>
                    setEditDoc({ ...editDoc, isPinned: v })
                  }
                />
              </div>

              <div className="flex items-center justify-between py-2 border-t">
                <div>
                  <p className="text-sm font-medium">Private</p>
                </div>
                <Switch
                  checked={editDoc.access === "private"}
                  onCheckedChange={(v) =>
                    setEditDoc({ ...editDoc, access: v ? "private" : "public" })
                  }
                />
              </div>

              <div className="flex items-center justify-between py-2">
                <p className="text-sm">Allow Download</p>
                <Switch
                  checked={editDoc.allowDownload}
                  onCheckedChange={(v) =>
                    setEditDoc({ ...editDoc, allowDownload: v })
                  }
                />
              </div>

              <div className="flex items-center justify-between py-2">
                <p className="text-sm">Allow Preview</p>
                <Switch
                  checked={editDoc.allowView}
                  onCheckedChange={(v) =>
                    setEditDoc({ ...editDoc, allowView: v })
                  }
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDoc(null)}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveEdit}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Save changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirm Dialog ─────────────────────────── */}
      <Dialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center mb-2">
              <Trash2 className="w-5 h-5 text-red-600" />
            </div>
            <DialogTitle>Delete document?</DialogTitle>
            <DialogDescription>
              "{docs.find((d) => d.id === deleteId)?.title}" will be permanently
              removed. This cannot be undone.
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
