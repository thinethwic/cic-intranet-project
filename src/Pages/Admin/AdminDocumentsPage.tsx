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
import type { Document } from "@/types";
import {
  getAllDocuments,
  createDocument,
  updateDocument,
  deleteDocument,
  viewDocument,
  downloadDocument,
} from "@/lib/api/documentApi";
import { getAdminUser } from "@/lib/api/authHeaders";
import { AdminPagination } from "./admin-components";
import InlineErrorAlert from "@/components/shared/InlineErrorAlert";
import { getUserFriendlyErrorMessage } from "@/lib/api/apiUtils";

import { History } from "lucide-react";
import { getDocumentLogs, type DocumentAccessLog } from "@/lib/api/documentApi";

const TYPE_STYLES: Record<string, string> = {
  PDF: "bg-red-50 text-red-800 border-red-200",
  DOCS: "bg-blue-50 text-blue-800 border-blue-200",
  XLSX: "bg-emerald-50 text-emerald-800 border-emerald-200",
};

const SEGMENTS = [
  "All",
  "CIC_FEEDS",
  "CIC_VET_CARE",
  "CIC_POULTRY",
  "AISA_VET",
];
const TYPES = ["All", "PDF", "DOCS", "XLSX"] as const;
const CATEGORIES = ["All", "HR", "FINANCE", "OPERATION"];
const ACCESS_OPTIONS = ["PUBLIC", "PRIVATE"];

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
  const PAGE_SIZE = 8;
  const LOGS_PAGE_SIZE = 10;
  const [docs, setDocs] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [segFilter, setSegFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [catFilter, setCatFilter] = useState("All");
  const [showUpload, setShowUpload] = useState(false);
  const [editDoc, setEditDoc] = useState<Document | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Upload form state
  const [newTitle, setNewTitle] = useState("");
  const [newType, setNewType] = useState<"PDF" | "DOCS" | "XLSX">("PDF");
  const [newCategory, setNewCategory] = useState("HR");
  const [newSegment, setNewSegment] = useState("CIC_FEEDS");
  const [newAccess, setNewAccess] = useState("PUBLIC");
  const [newIsPinned, setNewIsPinned] = useState(false);
  const [newAllowDownload, setNewAllowDownload] = useState(false);
  const [newAllowView, setNewAllowView] = useState(true);

  // Add these state variables alongside existing ones
  const [logsDoc, setLogsDoc] = useState<Document | null>(null);
  const [logs, setLogs] = useState<DocumentAccessLog[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [logsPage, setLogsPage] = useState(1);
  const [logsTotalElements, setLogsTotalElements] = useState(0);
  const [page, setPage] = useState(1);

  const adminUser = getAdminUser();

  // ✅ Fetch from API on mount
  useEffect(() => {
    fetchDocs();
  }, []);

  const fetchDocs = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getAllDocuments();
      setDocs(data);
    } catch (err) {
      console.error("Failed to fetch documents", err);
      setError(
        getUserFriendlyErrorMessage(err, "Unable to load documents right now."),
      );
    } finally {
      setLoading(false);
    }
  };

  const resetUploadForm = () => {
    setNewTitle("");
    setNewType("PDF");
    setNewCategory("GENERAL");
    setNewSegment("CIC_FEEDS");
    setNewAccess("PUBLIC");
    setNewIsPinned(false);
    setNewAllowDownload(false);
    setNewAllowView(true);
    setSelectedFile(null);
  };

  // ✅ Create — multipart
  const handleUpload = async () => {
    if (!newTitle.trim() || !selectedFile) return;
    try {
      setSaving(true);
      setError("");
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append(
        "data",
        new Blob(
          [
            JSON.stringify({
              title: newTitle,
              type: newType,
              category: newCategory,
              segment: newSegment,
              access: newAccess,
              isPinned: newIsPinned,
              allowDownload: newAllowDownload,
              allowView: newAllowView,
              createdById: adminUser?.userId ?? null, // ✅ real user id
            }),
          ],
          { type: "application/json" },
        ),
      );

      await createDocument(formData);
      await fetchDocs(); // ✅ refresh list
      resetUploadForm();
      setShowUpload(false);
    } catch (err) {
      console.error("Failed to create document", err);
      setError(
        getUserFriendlyErrorMessage(
          err,
          "Unable to upload the document right now.",
        ),
      );
    } finally {
      setSaving(false);
    }
  };

  // ✅ Update — JSON only (no file change)
  const handleSaveEdit = async () => {
    if (!editDoc) return;
    try {
      setSaving(true);
      setError("");
      await updateDocument(editDoc.id, {
        title: editDoc.title,
        type: editDoc.type,
        category: editDoc.category,
        segment: editDoc.segment,
        access: editDoc.access,
        isPinned: editDoc.isPinned,
        allowDownload: editDoc.allowDownload,
        allowView: editDoc.allowView,
      });
      await fetchDocs();
      setEditDoc(null);
    } catch (err) {
      console.error("Failed to update document", err);
      setError(
        getUserFriendlyErrorMessage(
          err,
          "Unable to update the document right now.",
        ),
      );
    } finally {
      setSaving(false);
    }
  };

  // ✅ Delete
  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      setError("");
      await deleteDocument(deleteId);
      await fetchDocs();
      setDeleteId(null);
    } catch (err) {
      console.error("Failed to delete document", err);
      setError(
        getUserFriendlyErrorMessage(
          err,
          "Unable to delete the document right now.",
        ),
      );
    }
  };

  // ✅ Toggle pin
  const togglePin = async (doc: Document) => {
    try {
      setError("");
      await updateDocument(doc.id, { isPinned: !doc.isPinned });
      await fetchDocs();
    } catch (err) {
      console.error("Failed to toggle pin", err);
      setError(
        getUserFriendlyErrorMessage(
          err,
          "Unable to update the pinned state right now.",
        ),
      );
    }
  };

  // ✅ View
  const handleView = async (id: number) => {
    try {
      setError("");
      const blob = await viewDocument(id);
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");
    } catch (err) {
      setError(
        getUserFriendlyErrorMessage(
          err,
          "Unable to preview the document right now.",
        ),
      );
    }
  };

  // ✅ Download
  const handleDownload = async (id: number, title: string) => {
    try {
      setError("");
      const blob = await downloadDocument(id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = title;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(
        getUserFriendlyErrorMessage(
          err,
          "Unable to download the document right now.",
        ),
      );
    }
  };

  // ✅ Filter
  const filtered = docs.filter((d) => {
    const q = search.toLowerCase();
    return (
      d.title.toLowerCase().includes(q) &&
      (segFilter === "All" || d.segment === segFilter) &&
      (typeFilter === "All" || d.type === typeFilter) &&
      (catFilter === "All" || d.category === catFilter)
    );
  });

  useEffect(() => {
    setPage(1);
  }, [search, segFilter, typeFilter, catFilter, docs.length]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Add this handler
  const handleViewLogs = async (doc: Document, pageNum = 1) => {
    setLogsDoc(doc);
    setLogsLoading(true);
    try {
      setError("");
      const data = await getDocumentLogs(doc.id, pageNum - 1, LOGS_PAGE_SIZE);
      setLogs(data.content);
      setLogsTotalElements(data.totalElements);
      setLogsPage(pageNum);
    } catch (err) {
      console.error("Failed to fetch logs", err);
      setError(
        getUserFriendlyErrorMessage(
          err,
          "Unable to load document access logs right now.",
        ),
      );
      setLogs([]);
      setLogsTotalElements(0);
    } finally {
      setLogsLoading(false);
    }
  };

  const fmtDateTime = (d: string) => {
    try {
      return new Date(d).toLocaleString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return d;
    }
  };

  const pinnedCount = docs.filter((d) => d.isPinned).length;

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

      {error && <InlineErrorAlert message={error} />}

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
                <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wide w-[18%]">
                  Visibility
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
              {loading ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-14 text-slate-400 text-sm"
                  >
                    Loading documents...
                  </TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-14 text-slate-400 text-sm"
                  >
                    <FileText className="w-8 h-8 mx-auto mb-2 opacity-25" />
                    No documents found
                  </TableCell>
                </TableRow>
              ) : (
                paginated.map((doc) => (
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
                    <TableCell className="py-3.5 text-xs text-slate-500">
                      {doc.access}
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
                          onClick={() => togglePin(doc)}
                          title={doc.isPinned ? "Unpin" : "Pin"}
                        >
                          <Pin className="w-3.5 h-3.5" />
                        </Button>
                        {doc.allowView && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 hover:bg-blue-50 hover:text-blue-600"
                            onClick={() => handleView(doc.id)}
                            title="Preview"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Button>
                        )}
                        {doc.allowDownload && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 hover:bg-emerald-50 hover:text-emerald-600"
                            onClick={() => handleDownload(doc.id, doc.title)}
                            title="Download"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </Button>
                        )}
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
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 hover:bg-purple-50 hover:text-purple-600"
                          onClick={() => handleViewLogs(doc)}
                          title="View access logs"
                        >
                          <History className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <AdminPagination
        page={page}
        totalPages={totalPages}
        totalItems={filtered.length}
        pageSize={PAGE_SIZE}
        itemLabel="documents"
        onPageChange={setPage}
      />

      {/* ── Upload Dialog ── */}
      <Dialog
        open={showUpload}
        onOpenChange={(open) => {
          if (!open) resetUploadForm();
          setShowUpload(open);
        }}
      >
        <DialogContent className="w-[calc(100vw-2rem)] sm:max-w-lg max-h-[90dvh] flex flex-col p-0 gap-0 rounded-xl">
          <DialogHeader className="px-5 pt-5 pb-3 border-b border-slate-100 shrink-0">
            <DialogTitle className="flex items-center gap-2 text-base">
              <Upload className="w-4 h-4 text-blue-600" /> Upload document
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Add a new document to a segment.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
            {/* Drop zone */}
            <div
              className="border-2 border-dashed border-slate-200 rounded-xl p-5 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/40 transition-colors"
              onClick={() => fileRef.current?.click()}
            >
              <Upload className="w-6 h-6 text-blue-500 mx-auto mb-1.5" />
              <p className="text-sm font-medium text-slate-700 break-all">
                {selectedFile?.name || "Click to upload or drag & drop"}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">
                PDF, DOCS, XLSX supported
              </p>
              <input
                ref={fileRef}
                type="file"
                className="hidden"
                accept=".pdf,.doc,.docx,.xlsx"
                onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-slate-600">
                Document name
              </Label>
              <Input
                placeholder="e.g. Q2 Financial Report"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
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
                  options={["HR", "FINANCE", "OPERATION"]}
                  value={newCategory}
                  onChange={setNewCategory}
                  className="w-full"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-slate-600">
                Segment
              </Label>
              <FilterDropdown
                options={[
                  "CIC_FEEDS",
                  "CIC_VET_CARE",
                  "CIC_POULTRY",
                  "AISA_VET",
                ]}
                value={newSegment}
                onChange={setNewSegment}
                className="w-full"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-slate-600">
                Access
              </Label>
              <FilterDropdown
                options={ACCESS_OPTIONS}
                value={newAccess}
                onChange={setNewAccess}
                className="w-full"
              />
            </div>

            <div className="rounded-lg border border-slate-100 divide-y divide-slate-100">
              <div className="flex items-center justify-between px-3 py-3">
                <div>
                  <p className="text-sm font-medium">Pin document</p>
                  <p className="text-xs text-slate-400">Show at top of list</p>
                </div>
                <Switch
                  checked={newIsPinned}
                  onCheckedChange={setNewIsPinned}
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
              disabled={!newTitle.trim() || !selectedFile || saving}
              className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 text-white"
            >
              {saving ? "Uploading..." : "Add document"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Edit Dialog ── */}
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
                    options={["HR", "FINANCE", "OPERATION"]}
                    value={editDoc.category}
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
                  options={[
                    "CIC_FEEDS",
                    "CIC_VET_CARE",
                    "CIC_POULTRY",
                    "AISA_VET",
                  ]}
                  value={editDoc.segment}
                  onChange={(v) => setEditDoc({ ...editDoc, segment: v })}
                  className="w-full"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-slate-600">
                  Access
                </Label>
                <FilterDropdown
                  options={ACCESS_OPTIONS}
                  value={editDoc.access}
                  onChange={(v) =>
                    setEditDoc({
                      ...editDoc,
                      access: v as "PUBLIC" | "PRIVATE",
                    })
                  }
                  className="w-full"
                />
              </div>
              <div className="rounded-lg border border-slate-100 divide-y divide-slate-100">
                <div className="flex items-center justify-between px-3 py-3">
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
                <div className="flex items-center justify-between px-3 py-3">
                  <p className="text-sm font-medium">Allow Download</p>
                  <Switch
                    checked={editDoc.allowDownload}
                    onCheckedChange={(v) =>
                      setEditDoc({ ...editDoc, allowDownload: v })
                    }
                  />
                </div>
                <div className="flex items-center justify-between px-3 py-3">
                  <p className="text-sm font-medium">Allow Preview</p>
                  <Switch
                    checked={editDoc.allowView}
                    onCheckedChange={(v) =>
                      setEditDoc({ ...editDoc, allowView: v })
                    }
                  />
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDoc(null)}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveEdit}
              disabled={saving}
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
            <DialogTitle>Delete document?</DialogTitle>
            <DialogDescription>
              "{docs.find((d) => d.id === deleteId)?.title}" will be permanently
              removed.
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

      {/* ── Logs Dialog ── */}
      <Dialog
        open={!!logsDoc}
        onOpenChange={(o) => {
          if (!o) {
            setLogsDoc(null);
            setLogs([]);
            setLogsPage(1);
            setLogsTotalElements(0);
          }
        }}
      >
        <DialogContent className="sm:max-w-2xl max-h-[80vh] flex flex-col p-0 gap-0">
          <DialogHeader className="px-5 pt-5 pb-3 border-b border-slate-100 shrink-0">
            <DialogTitle className="flex items-center gap-2">
              <History className="w-4 h-4 text-purple-600" />
              Access logs — {logsDoc?.title}
            </DialogTitle>
            <DialogDescription>
              View and download activity for this document.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto">
            {logsLoading ? (
              <div className="py-16 text-center text-sm text-slate-400">
                Loading logs...
              </div>
            ) : logs.length === 0 ? (
              <div className="py-16 text-center text-sm text-slate-400">
                No access logs yet
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50 hover:bg-slate-50">
                    <TableHead className="text-xs font-semibold text-slate-500 uppercase pl-5">
                      User
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-slate-500 uppercase">
                      Action
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-slate-500 uppercase">
                      IP Address
                    </TableHead>
                    <TableHead className="text-xs font-semibold text-slate-500 uppercase pr-5">
                      Time
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow
                      key={log.id}
                      className="border-b border-slate-100"
                    >
                      <TableCell className="pl-5 py-3">
                        <p className="text-sm font-medium">{log.user.name}</p>
                        <p className="text-xs text-slate-400">
                          {log.user.email}
                        </p>
                      </TableCell>
                      <TableCell className="py-3">
                        <Badge
                          className={`text-[10px] ${
                            log.action === "DOWNLOAD"
                              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                              : "bg-blue-50 text-blue-800 border-blue-200"
                          } border`}
                        >
                          {log.action === "DOWNLOAD" ? (
                            <>
                              <Download className="w-2.5 h-2.5 mr-1" /> Download
                            </>
                          ) : (
                            <>
                              <Eye className="w-2.5 h-2.5 mr-1" /> View
                            </>
                          )}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-3 text-xs text-slate-500">
                        {log.ipAddress || "—"}
                      </TableCell>
                      <TableCell className="py-3 pr-5 text-xs text-slate-500">
                        {fmtDateTime(log.accessedAt)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>

          <div className="px-5 py-3 border-t border-slate-100 shrink-0 space-y-3">
            {logsTotalElements > 0 && (
              <AdminPagination
                page={logsPage}
                totalPages={Math.max(
                  1,
                  Math.ceil(logsTotalElements / LOGS_PAGE_SIZE),
                )}
                totalItems={logsTotalElements}
                pageSize={LOGS_PAGE_SIZE}
                itemLabel="log entries"
                onPageChange={(p) => logsDoc && handleViewLogs(logsDoc, p)}
              />
            )}
            <div className="flex justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setLogsDoc(null);
                  setLogs([]);
                  setLogsPage(1);
                  setLogsTotalElements(0);
                }}
              >
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
