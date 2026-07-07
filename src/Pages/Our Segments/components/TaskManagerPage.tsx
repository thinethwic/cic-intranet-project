import { useEffect, useState } from "react";
import {
  Plus,
  Search,
  Circle,
  Loader2,
  CheckCircle2,
  ListTodo,
  LayoutGrid,
  FileStack,
  Calendar,
  CalendarClock,
  AlertTriangle,
  Layers3,
  Paperclip,
  Download,
  Trash2,
  MoreVertical,
  LogOut,
  Users,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Task, TaskAttachment, TaskPriority, TaskStatus } from "@/types";
import {
  createTask,
  updateTask,
  deleteTask,
  getTaskById,
  uploadTaskAttachment,
  getTaskAttachments,
  deleteTaskAttachment,
  downloadTaskAttachment,
} from "@/lib/api/taskApi";
import { invalidateCache } from "@/lib/api/apiCache";
import { logout } from "@/lib/api/authHeaders";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useTasks } from "@/hooks/useTasks";
import { useTaskDocuments } from "@/hooks/useTaskDocuments";
import { AdminPagination } from "@/Pages/Admin/admin-components";
import logo from "@/assets/Logo.jpg";

const BOARD_PAGE_SIZE = 100;
const DOCS_PAGE_SIZE = 10;
const PRIORITIES: TaskPriority[] = ["LOW", "MEDIUM", "HIGH"];
const COLUMNS: TaskStatus[] = ["TODO", "IN_PROGRESS", "DONE"];

const STATUS_CONFIG: Record<
  TaskStatus,
  { label: string; icon: typeof Circle; class: string; dot: string }
> = {
  TODO: {
    label: "To Do",
    icon: Circle,
    class: "bg-slate-100 text-slate-600 border-slate-200",
    dot: "bg-slate-400",
  },
  IN_PROGRESS: {
    label: "In Progress",
    icon: Loader2,
    class: "bg-amber-50 text-amber-600 border-amber-200",
    dot: "bg-amber-400",
  },
  DONE: {
    label: "Done",
    icon: CheckCircle2,
    class: "bg-emerald-50 text-emerald-600 border-emerald-200",
    dot: "bg-emerald-400",
  },
};

const PRIORITY_CONFIG: Record<TaskPriority, { class: string }> = {
  LOW: { class: "bg-slate-100 text-slate-600 border-slate-200" },
  MEDIUM: { class: "bg-cic-50 text-cic-600 border-cic-200" },
  HIGH: { class: "bg-red-50 text-red-600 border-red-200" },
};

const todayStr = () => new Date().toISOString().slice(0, 10);

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short" });

const fmtBytes = (n: number) =>
  n < 1024
    ? `${n} B`
    : n < 1048576
      ? `${(n / 1024).toFixed(1)} KB`
      : `${(n / 1048576).toFixed(1)} MB`;

const makeEmptyForm = () => ({
  title: "",
  description: "",
  priority: "MEDIUM" as TaskPriority,
  dueDate: "",
});

export default function TaskManagerPage() {
  const currentUser = useCurrentUser();
  const [activeTab, setActiveTab] = useState<"board" | "documents">("board");

  // ── Board state ────────────────────────────────────────────────────────────
  const [search, setSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | "All">(
    "All",
  );

  const {
    tasks,
    loading: tasksLoading,
    error: tasksError,
    refetch: refetchTasks,
  } = useTasks(0, BOARD_PAGE_SIZE, {
    priority: priorityFilter === "All" ? undefined : priorityFilter,
    q: search || undefined,
  });

  const today = todayStr();
  const stats = {
    total: tasks.length,
    dueToday: tasks.filter((t) => t.dueDate === today && t.status !== "DONE")
      .length,
    overdue: tasks.filter(
      (t) => t.dueDate && t.dueDate < today && t.status !== "DONE",
    ).length,
    completed: tasks.filter((t) => t.status === "DONE").length,
  };

  // ── Documents state ────────────────────────────────────────────────────────
  const [docsPage, setDocsPage] = useState(1);
  const [docsSearch, setDocsSearch] = useState("");
  const {
    documents,
    totalPages: docsTotalPages,
    totalElements: docsTotalElements,
    loading: docsLoading,
    error: docsError,
    refetch: refetchDocuments,
  } = useTaskDocuments(docsPage - 1, DOCS_PAGE_SIZE, docsSearch || undefined);

  useEffect(() => {
    setDocsPage(1);
  }, [docsSearch]);

  // ── Create dialog ──────────────────────────────────────────────────────────
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState(makeEmptyForm);
  const [saving, setSaving] = useState(false);

  // ── Edit dialog ────────────────────────────────────────────────────────────
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editForm, setEditForm] = useState(makeEmptyForm);
  const [editStatus, setEditStatus] = useState<TaskStatus>("TODO");
  const [attachments, setAttachments] = useState<TaskAttachment[]>([]);
  const [attachmentsLoading, setAttachmentsLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!editingTask) return;
    setAttachmentsLoading(true);
    getTaskAttachments(editingTask.id)
      .then(setAttachments)
      .catch(console.error)
      .finally(() => setAttachmentsLoading(false));
  }, [editingTask]);

  const handleLogout = () => {
    logout();
    window.location.replace("/");
  };

  const refreshEverything = () => {
    invalidateCache("tasks:");
    refetchTasks();
    refetchDocuments();
  };

  const handleCreate = async () => {
    if (!form.title.trim()) return;
    try {
      setSaving(true);
      await createTask({
        title: form.title.trim(),
        description: form.description.trim() || null,
        priority: form.priority,
        dueDate: form.dueDate || null,
      });
      refreshEverything();
      setForm(makeEmptyForm());
      setShowCreate(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const openEdit = (task: Task) => {
    setEditingTask(task);
    setEditForm({
      title: task.title,
      description: task.description ?? "",
      priority: task.priority,
      dueDate: task.dueDate ?? "",
    });
    setEditStatus(task.status);
  };

  const openEditById = async (taskId: number) => {
    try {
      const task = await getTaskById(taskId);
      openEdit(task);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdate = async () => {
    if (!editingTask || !editForm.title.trim()) return;
    try {
      setSaving(true);
      await updateTask(editingTask.id, {
        title: editForm.title.trim(),
        description: editForm.description.trim() || null,
        priority: editForm.priority,
        dueDate: editForm.dueDate || null,
        status: editStatus,
      });
      refreshEverything();
      setEditingTask(null);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleQuickStatusChange = async (task: Task, status: TaskStatus) => {
    try {
      // Send the full current values (not just status) — the backend
      // treats an omitted dueDate as "clear it", so a sparse patch here
      // would silently wipe the task's due date.
      await updateTask(task.id, {
        title: task.title,
        description: task.description,
        priority: task.priority,
        dueDate: task.dueDate,
        status,
      });
      refreshEverything();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (task: Task) => {
    try {
      await deleteTask(task.id);
      refreshEverything();
      if (editingTask?.id === task.id) setEditingTask(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpload = async (file: File) => {
    if (!editingTask) return;
    try {
      setUploading(true);
      const attachment = await uploadTaskAttachment(editingTask.id, file);
      setAttachments((prev) => [...prev, attachment]);
      invalidateCache("tasks:");
      refetchDocuments();
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteAttachment = async (taskId: number, attachmentId: number) => {
    try {
      await deleteTaskAttachment(taskId, attachmentId);
      setAttachments((prev) => prev.filter((a) => a.id !== attachmentId));
      invalidateCache("tasks:");
      refetchDocuments();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDownload = async (taskId: number, attachment: TaskAttachment) => {
    try {
      const blob = await downloadTaskAttachment(taskId, attachment.id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = attachment.fileName;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
    }
  };

  const statTiles = [
    { label: "Total Tasks", value: stats.total, icon: Layers3, class: "bg-slate-100 text-slate-700" },
    { label: "Due Today", value: stats.dueToday, icon: CalendarClock, class: "bg-cic-50 text-cic-700" },
    { label: "Overdue", value: stats.overdue, icon: AlertTriangle, class: "bg-red-50 text-red-700" },
    { label: "Completed", value: stats.completed, icon: CheckCircle2, class: "bg-emerald-50 text-emerald-700" },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ── Top Navigation Bar ── */}
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 backdrop-blur-sm shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src={logo} alt="CIC" className="h-12 w-auto object-contain" />
            <span className="text-slate-200 text-lg font-light select-none">|</span>
            <div className="flex items-center gap-2">
              <ListTodo className="h-4 w-4 text-cic-600" />
              <span className="text-base font-semibold text-slate-800">
                Task Manager
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {currentUser && (
              <div className="hidden sm:flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-cic-100 shrink-0">
                  <Users className="h-3 w-3 text-cic-700" />
                </div>
                <span className="text-sm font-medium text-slate-700 max-w-36 truncate">
                  {currentUser.name}
                </span>
              </div>
            )}

            <Button
              onClick={() => {
                setForm(makeEmptyForm());
                setShowCreate(true);
              }}
              className="h-9 rounded-xl bg-cic-900 px-4 text-sm text-white hover:bg-blue-800"
            >
              <Plus className="mr-1.5 h-4 w-4" />
              <span className="hidden sm:inline">New Task</span>
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="h-9 w-9 rounded-xl text-slate-400 hover:bg-red-50 hover:text-red-500"
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        {/* ── Page Header + Tabs ── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">My Workspace</h1>
            <p className="mt-1 text-sm text-slate-500">
              Track your personal tasks and manage the documents attached to them.
            </p>
          </div>
          <div className="inline-flex rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
            <button
              onClick={() => setActiveTab("board")}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors ${
                activeTab === "board"
                  ? "bg-cic-900 text-white"
                  : "text-slate-500 hover:text-cic-700"
              }`}
            >
              <LayoutGrid className="h-4 w-4" />
              Board
            </button>
            <button
              onClick={() => setActiveTab("documents")}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors ${
                activeTab === "documents"
                  ? "bg-cic-900 text-white"
                  : "text-slate-500 hover:text-cic-700"
              }`}
            >
              <FileStack className="h-4 w-4" />
              My Documents
              {docsTotalElements > 0 && (
                <span
                  className={`rounded-full px-1.5 text-xs ${
                    activeTab === "documents"
                      ? "bg-white/20"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {docsTotalElements}
                </span>
              )}
            </button>
          </div>
        </div>

        {activeTab === "board" ? (
          <>
            {/* ── Stats ── */}
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {statTiles.map((s) => {
                const StatIcon = s.icon;
                return (
                  <Card key={s.label} className="border border-slate-200 bg-white shadow-sm">
                    <CardContent className="p-5">
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                          {s.label}
                        </p>
                        <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${s.class}`}>
                          <StatIcon className="h-4.5 w-4.5" />
                        </div>
                      </div>
                      <p className="text-3xl font-bold text-slate-800">{s.value}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* ── Toolbar ── */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="relative sm:w-72">
                <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  className="h-10 rounded-xl border-slate-200 bg-white pl-10 text-sm shadow-sm focus-visible:ring-cic-200"
                  placeholder="Search tasks..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {(["All", ...PRIORITIES] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPriorityFilter(p)}
                    className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                      priorityFilter === p
                        ? "border-cic-900 bg-cic-900 text-white"
                        : "border-slate-200 bg-white text-slate-500 hover:border-cic-200 hover:text-cic-700"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* ── Kanban Board ── */}
            {tasksError ? (
              <Card className="border border-dashed border-red-200 bg-white shadow-sm">
                <CardContent className="flex min-h-48 flex-col items-center justify-center gap-3 text-center px-6">
                  <p className="text-sm font-medium text-red-500">{tasksError}</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {COLUMNS.map((col) => {
                  const config = STATUS_CONFIG[col];
                  const colTasks = tasks.filter((t) => t.status === col);
                  return (
                    <div key={col} className="flex flex-col gap-3">
                      <div className="flex items-center gap-2 px-1">
                        <span className={`h-2 w-2 rounded-full ${config.dot}`} />
                        <h3 className="text-sm font-semibold text-slate-700">
                          {config.label}
                        </h3>
                        <span className="text-xs font-medium text-slate-400">
                          {colTasks.length}
                        </span>
                      </div>

                      <div className="flex flex-col gap-3 max-h-[70vh] overflow-y-auto pr-1">
                        {tasksLoading ? (
                          [...Array(2)].map((_, i) => (
                            <Card key={i} className="border border-slate-200 bg-white shadow-sm">
                              <CardContent className="p-4 space-y-2.5">
                                <Skeleton className="h-4 w-16 rounded-md" />
                                <Skeleton className="h-5 w-3/4" />
                                <Skeleton className="h-4 w-full" />
                              </CardContent>
                            </Card>
                          ))
                        ) : colTasks.length === 0 ? (
                          <div className="rounded-xl border border-dashed border-slate-200 bg-white/60 py-8 text-center">
                            <p className="text-xs text-slate-400">No tasks here</p>
                          </div>
                        ) : (
                          colTasks.map((task) => {
                            const priority = PRIORITY_CONFIG[task.priority];
                            const isOverdue =
                              !!task.dueDate &&
                              task.dueDate < today &&
                              task.status !== "DONE";
                            return (
                              <Card
                                key={task.id}
                                onClick={() => openEdit(task)}
                                className="group cursor-pointer border border-slate-200 bg-white shadow-sm transition-all hover:border-cic-200 hover:shadow-md"
                              >
                                <CardContent className="p-4 space-y-2.5">
                                  <div className="flex items-start justify-between gap-2">
                                    <Badge
                                      variant="outline"
                                      className={`rounded-full text-xs font-semibold px-2.5 py-0.5 ${priority.class}`}
                                    >
                                      {task.priority}
                                    </Badge>
                                    <DropdownMenu>
                                      <DropdownMenuTrigger onClick={(e) => e.stopPropagation()}>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-7 w-7 shrink-0 rounded-lg text-slate-400 hover:bg-slate-100"
                                        >
                                          <MoreVertical className="h-4 w-4" />
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => openEdit(task)}>
                                          Edit
                                        </DropdownMenuItem>
                                        {COLUMNS.filter((c) => c !== task.status).map((c) => (
                                          <DropdownMenuItem
                                            key={c}
                                            onClick={() => handleQuickStatusChange(task, c)}
                                          >
                                            Move to {STATUS_CONFIG[c].label}
                                          </DropdownMenuItem>
                                        ))}
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                          variant="destructive"
                                          onClick={() => handleDelete(task)}
                                        >
                                          Delete
                                        </DropdownMenuItem>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  </div>
                                  <h4 className="text-sm font-semibold text-slate-900 leading-snug">
                                    {task.title}
                                  </h4>
                                  {task.description && (
                                    <p className="text-xs text-slate-500 line-clamp-2">
                                      {task.description}
                                    </p>
                                  )}
                                  <div className="flex items-center justify-between pt-1">
                                    {task.dueDate ? (
                                      <div
                                        className={`flex items-center gap-1 text-xs ${
                                          isOverdue ? "text-red-500 font-medium" : "text-slate-400"
                                        }`}
                                      >
                                        <Calendar className="h-3.5 w-3.5" />
                                        {fmtDate(task.dueDate)}
                                      </div>
                                    ) : (
                                      <span />
                                    )}
                                    {task.attachments.length > 0 && (
                                      <div className="flex items-center gap-1 text-xs text-slate-400">
                                        <Paperclip className="h-3.5 w-3.5" />
                                        {task.attachments.length}
                                      </div>
                                    )}
                                  </div>
                                </CardContent>
                              </Card>
                            );
                          })
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        ) : (
          <>
            {/* ── My Documents ── */}
            <div className="relative sm:w-80">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                className="h-10 rounded-xl border-slate-200 bg-white pl-10 text-sm shadow-sm focus-visible:ring-cic-200"
                placeholder="Search documents..."
                value={docsSearch}
                onChange={(e) => setDocsSearch(e.target.value)}
              />
            </div>

            <Card className="border border-slate-200 bg-white shadow-sm overflow-hidden">
              {docsLoading ? (
                <div className="divide-y divide-slate-100">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex items-center gap-3 px-5 py-4">
                      <Skeleton className="h-9 w-9 rounded-lg shrink-0" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-1/2" />
                        <Skeleton className="h-3 w-1/3" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : docsError ? (
                <div className="flex min-h-48 flex-col items-center justify-center gap-3 text-center px-6">
                  <p className="text-sm font-medium text-red-500">{docsError}</p>
                </div>
              ) : documents.length === 0 ? (
                <div className="flex min-h-64 flex-col items-center justify-center gap-4 text-center px-6">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
                    <FileStack className="h-7 w-7 text-slate-300" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-slate-700">
                      No documents yet
                    </h3>
                    <p className="mt-1.5 text-sm text-slate-400 max-w-xs">
                      Files you attach to your tasks will show up here.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center gap-3 px-5 py-4 hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cic-50 shrink-0">
                        <Paperclip className="h-4 w-4 text-cic-700" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-slate-800 truncate">
                          {doc.fileName}
                        </p>
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-0.5">
                          <span className="text-xs text-slate-400">
                            {fmtBytes(doc.fileSize)}
                          </span>
                          <span className="text-xs text-slate-300">·</span>
                          <button
                            onClick={() => openEditById(doc.taskId)}
                            className="text-xs font-medium text-cic-600 hover:text-cic-800 hover:underline truncate"
                          >
                            {doc.taskTitle}
                          </button>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 shrink-0 text-slate-400 hover:text-cic-700"
                        onClick={() => handleDownload(doc.taskId, doc)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 shrink-0 text-slate-400 hover:text-red-500"
                        onClick={() => handleDeleteAttachment(doc.taskId, doc.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            <AdminPagination
              page={docsPage}
              totalPages={docsTotalPages}
              totalItems={docsTotalElements}
              pageSize={DOCS_PAGE_SIZE}
              itemLabel="documents"
              onPageChange={setDocsPage}
            />
          </>
        )}
      </div>

      {/* ── Create Task Dialog ── */}
      <Dialog
        open={showCreate}
        onOpenChange={(open) => {
          if (!open) setForm(makeEmptyForm());
          setShowCreate(open);
        }}
      >
        <DialogContent className="rounded-2xl sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>New Task</DialogTitle>
            <DialogDescription>
              Add a personal task. You can attach files once it's created.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-slate-700">
                Title <span className="text-red-500">*</span>
              </Label>
              <Input
                placeholder="What needs to be done?"
                value={form.title}
                onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                className="h-11 rounded-xl border-slate-200 bg-slate-50 shadow-none focus-visible:ring-cic-200 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-slate-700">Description</Label>
              <Textarea
                placeholder="Add any details..."
                value={form.description}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, description: e.target.value }))
                }
                className="rounded-xl border-slate-200 bg-slate-50 shadow-none focus-visible:ring-cic-200 text-sm"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-slate-700">Priority</Label>
                <select
                  value={form.priority}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, priority: e.target.value as TaskPriority }))
                  }
                  className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-cic-200"
                >
                  {PRIORITIES.map((p) => (
                    <option key={p}>{p}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-slate-700">Due Date</Label>
                <Input
                  type="date"
                  value={form.dueDate}
                  onChange={(e) => setForm((prev) => ({ ...prev, dueDate: e.target.value }))}
                  className="h-11 rounded-xl border-slate-200 bg-slate-50 shadow-none focus-visible:ring-cic-200 text-sm"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setForm(makeEmptyForm());
                setShowCreate(false);
              }}
              className="rounded-xl border-slate-200 h-10 px-5"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={!form.title.trim() || saving}
              className="rounded-xl bg-cic-900 text-white hover:bg-blue-800 h-10 px-6"
            >
              {saving ? "Creating..." : "Create Task"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Edit Task Dialog ── */}
      <Dialog open={!!editingTask} onOpenChange={(open) => !open && setEditingTask(null)}>
        <DialogContent className="rounded-2xl sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
            <DialogDescription>
              Update task details or manage its attachments.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-slate-700">
                Title <span className="text-red-500">*</span>
              </Label>
              <Input
                value={editForm.title}
                onChange={(e) => setEditForm((prev) => ({ ...prev, title: e.target.value }))}
                className="h-11 rounded-xl border-slate-200 bg-slate-50 shadow-none focus-visible:ring-cic-200 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-slate-700">Description</Label>
              <Textarea
                value={editForm.description}
                onChange={(e) =>
                  setEditForm((prev) => ({ ...prev, description: e.target.value }))
                }
                className="rounded-xl border-slate-200 bg-slate-50 shadow-none focus-visible:ring-cic-200 text-sm"
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-slate-700">Status</Label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as TaskStatus)}
                  className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-cic-200"
                >
                  {(Object.keys(STATUS_CONFIG) as TaskStatus[]).map((s) => (
                    <option key={s} value={s}>
                      {STATUS_CONFIG[s].label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-slate-700">Priority</Label>
                <select
                  value={editForm.priority}
                  onChange={(e) =>
                    setEditForm((prev) => ({ ...prev, priority: e.target.value as TaskPriority }))
                  }
                  className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-cic-200"
                >
                  {PRIORITIES.map((p) => (
                    <option key={p}>{p}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-slate-700">Due Date</Label>
                <Input
                  type="date"
                  value={editForm.dueDate}
                  onChange={(e) =>
                    setEditForm((prev) => ({ ...prev, dueDate: e.target.value }))
                  }
                  className="h-11 rounded-xl border-slate-200 bg-slate-50 shadow-none focus-visible:ring-cic-200 text-sm"
                />
              </div>
            </div>

            <div className="border-t border-slate-100 pt-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
                  Attachments
                </p>
                <label className="cursor-pointer text-xs font-semibold text-cic-700 hover:text-cic-900">
                  {uploading ? "Uploading..." : "+ Add file"}
                  <input
                    type="file"
                    className="hidden"
                    disabled={uploading}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleUpload(file);
                      e.target.value = "";
                    }}
                  />
                </label>
              </div>
              {attachmentsLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-10 w-full rounded-lg" />
                  <Skeleton className="h-10 w-full rounded-lg" />
                </div>
              ) : attachments.length === 0 ? (
                <p className="text-sm text-slate-400 py-2">No attachments yet.</p>
              ) : (
                <div className="space-y-2">
                  {attachments.map((a) => (
                    <div
                      key={a.id}
                      className="flex items-center gap-3 rounded-lg border border-slate-200 px-3 py-2"
                    >
                      <Paperclip className="h-4 w-4 text-slate-400 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-slate-700 truncate">
                          {a.fileName}
                        </p>
                        <p className="text-xs text-slate-400">{fmtBytes(a.fileSize)}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 shrink-0 text-slate-400 hover:text-cic-700"
                        onClick={() => editingTask && handleDownload(editingTask.id, a)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 shrink-0 text-slate-400 hover:text-red-500"
                        onClick={() => editingTask && handleDeleteAttachment(editingTask.id, a.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <DialogFooter className="justify-between sm:justify-between">
            <Button
              variant="ghost"
              onClick={() => editingTask && handleDelete(editingTask)}
              className="rounded-xl text-red-500 hover:bg-red-50 hover:text-red-600 h-10 px-5"
            >
              Delete Task
            </Button>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setEditingTask(null)}
                className="rounded-xl border-slate-200 h-10 px-5"
              >
                Cancel
              </Button>
              <Button
                onClick={handleUpdate}
                disabled={!editForm.title.trim() || saving}
                className="rounded-xl bg-cic-900 text-white hover:bg-blue-800 h-10 px-6"
              >
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
