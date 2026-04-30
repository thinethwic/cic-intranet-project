import { useEffect, useMemo, useState, type ElementType } from "react";
import {
  AlertCircle,
  Check,
  CheckCircle2,
  ChevronDown,
  Circle,
  Clock3,
  Edit3,
  Loader2,
  MessageSquareText,
  Search,
  Send,
  ShieldCheck,
  TicketIcon,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import type { Ticket, TicketCategory, TicketPriority, TicketStatus } from "@/types";
import {
  adminAddComment,
  adminDeleteTicket,
  adminGetComments,
  adminUpdateTicket,
  getAllTickets,
  type Comment,
} from "@/lib/api/ticketApi";

const STATUS_CONFIG: Record<
  TicketStatus,
  { label: string; icon: ElementType; className: string; pill: string }
> = {
  OPEN: {
    label: "Open",
    icon: Circle,
    className: "bg-blue-50 text-blue-700 border-blue-200",
    pill: "bg-blue-900 text-white border-blue-900",
  },
  IN_PROGRESS: {
    label: "In Progress",
    icon: Loader2,
    className: "bg-amber-50 text-amber-700 border-amber-200",
    pill: "bg-amber-500 text-white border-amber-500",
  },
  RESOLVED: {
    label: "Resolved",
    icon: CheckCircle2,
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
    pill: "bg-emerald-600 text-white border-emerald-600",
  },
  CLOSED: {
    label: "Closed",
    icon: AlertCircle,
    className: "bg-slate-100 text-slate-600 border-slate-200",
    pill: "bg-slate-500 text-white border-slate-500",
  },
};

const PRIORITY_CONFIG: Record<TicketPriority, string> = {
  LOW: "bg-slate-100 text-slate-700 border-slate-200",
  MEDIUM: "bg-blue-50 text-blue-700 border-blue-200",
  HIGH: "bg-amber-50 text-amber-700 border-amber-200",
  CRITICAL: "bg-red-50 text-red-700 border-red-200",
};

const CATEGORY_OPTIONS: TicketCategory[] = [
  "IT",
  "HR",
  "FINANCE",
  "FACILITIES",
  "OTHER",
];

const PRIORITY_OPTIONS: TicketPriority[] = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];
const STATUS_OPTIONS: TicketStatus[] = [
  "OPEN",
  "IN_PROGRESS",
  "RESOLVED",
  "CLOSED",
];

const CATEGORY_ICONS: Record<TicketCategory, string> = {
  IT: "IT",
  HR: "HR",
  FINANCE: "FN",
  FACILITIES: "FC",
  OTHER: "OT",
};

const EMPTY_EDIT_FORM = {
  title: "",
  description: "",
  category: "IT" as TicketCategory,
  priority: "MEDIUM" as TicketPriority,
  status: "OPEN" as TicketStatus,
};

function FilterDropdown({
  options,
  value,
  onChange,
  className,
}: {
  options: string[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}) {
  const isActive = value !== options[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Button
          variant="outline"
          className={`h-9 min-w-[130px] justify-between gap-2 text-sm font-normal ${
            isActive ? "border-blue-500 text-blue-600" : ""
          } ${className ?? ""}`}
        >
          <span>{value === "IN_PROGRESS" ? "In Progress" : value}</span>
          <ChevronDown className="h-3.5 w-3.5 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-[160px]">
        {options.map((option) => (
          <DropdownMenuItem
            key={option}
            onClick={() => onChange(option)}
            className="flex cursor-pointer items-center justify-between text-sm"
          >
            {option === "IN_PROGRESS" ? "In Progress" : option}
            {value === option && <Check className="h-3.5 w-3.5 text-blue-600" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: number | string;
  icon: ElementType;
  color: string;
}) {
  return (
    <div className="rounded-xl bg-slate-50 p-4 flex items-center gap-4">
      <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${color}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-xs text-slate-500">{label}</p>
        <p className="text-2xl font-semibold">{value}</p>
      </div>
    </div>
  );
}

const fmtDate = (value: string) =>
  new Date(value).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

const fmtDateTime = (value: string) =>
  new Date(value).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

export default function AdminTicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");

  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);

  const [editTicket, setEditTicket] = useState<Ticket | null>(null);
  const [editForm, setEditForm] = useState({ ...EMPTY_EDIT_FORM });
  const [deleteTicket, setDeleteTicket] = useState<Ticket | null>(null);

  const [comment, setComment] = useState("");
  const [sendingComment, setSendingComment] = useState(false);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const data = await getAllTickets();
      setTickets(data);
    } catch (err) {
      console.error("Failed to fetch tickets", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async (ticketId: number) => {
    try {
      setCommentsLoading(true);
      const data = await adminGetComments(ticketId);
      setComments(data);
    } catch (err) {
      console.error("Failed to fetch comments", err);
    } finally {
      setCommentsLoading(false);
    }
  };

  const filtered = useMemo(() => {
    const q = search.toLowerCase();

    return tickets.filter((ticket) => {
      return (
        (ticket.title.toLowerCase().includes(q) ||
          ticket.ticketNumber.toLowerCase().includes(q) ||
          ticket.submittedBy.name.toLowerCase().includes(q)) &&
        (statusFilter === "All" || ticket.status === statusFilter) &&
        (categoryFilter === "All" || ticket.category === categoryFilter) &&
        (priorityFilter === "All" || ticket.priority === priorityFilter)
      );
    });
  }, [tickets, search, statusFilter, categoryFilter, priorityFilter]);

  const stats = [
    {
      label: "Total tickets",
      value: loading ? "..." : tickets.length,
      icon: TicketIcon,
      color: "bg-blue-50 text-blue-600",
    },
    {
      label: "Open",
      value: loading ? "..." : tickets.filter((ticket) => ticket.status === "OPEN").length,
      icon: Circle,
      color: "bg-sky-50 text-sky-600",
    },
    {
      label: "In progress",
      value:
        loading
          ? "..."
          : tickets.filter((ticket) => ticket.status === "IN_PROGRESS").length,
      icon: Loader2,
      color: "bg-amber-50 text-amber-600",
    },
    {
      label: "Resolved",
      value:
        loading
          ? "..."
          : tickets.filter((ticket) => ticket.status === "RESOLVED").length,
      icon: ShieldCheck,
      color: "bg-emerald-50 text-emerald-600",
    },
  ];

  const openDetails = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setComment("");
    fetchComments(ticket.id);
  };

  const closeDetails = () => {
    setSelectedTicket(null);
    setComments([]);
    setComment("");
  };

  const openEdit = (ticket: Ticket) => {
    setEditTicket(ticket);
    setEditForm({
      title: ticket.title,
      description: ticket.description,
      category: ticket.category,
      priority: ticket.priority,
      status: ticket.status,
    });
  };

  const handleSaveEdit = async () => {
    if (!editTicket || !editForm.title.trim() || !editForm.description.trim()) {
      return;
    }

    try {
      setSaving(true);
      const updated = await adminUpdateTicket(editTicket.id, editForm);

      setTickets((prev) =>
        prev.map((ticket) => (ticket.id === updated.id ? updated : ticket)),
      );

      if (selectedTicket?.id === updated.id) {
        setSelectedTicket(updated);
      }

      setEditTicket(null);
    } catch (err) {
      console.error("Failed to update ticket", err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTicket) return;

    try {
      setSaving(true);
      await adminDeleteTicket(deleteTicket.id);
      setTickets((prev) =>
        prev.filter((ticket) => ticket.id !== deleteTicket.id),
      );

      if (selectedTicket?.id === deleteTicket.id) {
        closeDetails();
      }

      setDeleteTicket(null);
    } catch (err) {
      console.error("Failed to delete ticket", err);
    } finally {
      setSaving(false);
    }
  };

  const handleStatusUpdate = async (ticketId: number, status: TicketStatus) => {
    try {
      const updated = await adminUpdateTicket(ticketId, { status });

      setTickets((prev) =>
        prev.map((ticket) => (ticket.id === updated.id ? updated : ticket)),
      );

      if (selectedTicket?.id === updated.id) {
        setSelectedTicket(updated);
      }
    } catch (err) {
      console.error("Failed to update status", err);
    }
  };

  const handleAddComment = async () => {
    if (!selectedTicket || !comment.trim()) return;

    try {
      setSendingComment(true);
      await adminAddComment(selectedTicket.id, {
        message: comment,
        isInternal: false,
      });
      setComment("");
      await fetchComments(selectedTicket.id);
    } catch (err) {
      console.error("Failed to add comment", err);
    } finally {
      setSendingComment(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Support Tickets</h1>
          <p className="mt-1 text-sm text-slate-500">
            Review, update, edit, and remove employee support requests.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((item) => (
          <StatCard key={item.label} {...item} />
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[220px] flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            className="h-9 pl-9"
            placeholder="Search by ticket, title or employee..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <FilterDropdown
          options={["All", ...STATUS_OPTIONS]}
          value={statusFilter}
          onChange={setStatusFilter}
        />
        <FilterDropdown
          options={["All", ...CATEGORY_OPTIONS]}
          value={categoryFilter}
          onChange={setCategoryFilter}
        />
        <FilterDropdown
          options={["All", ...PRIORITY_OPTIONS]}
          value={priorityFilter}
          onChange={setPriorityFilter}
        />
      </div>

      <Card className="overflow-hidden border border-slate-200 shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 hover:bg-slate-50">
                <TableHead className="pl-5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Ticket
                </TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Category
                </TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Priority
                </TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Status
                </TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Submitted By
                </TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Updated
                </TableHead>
                <TableHead className="pr-5 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="py-14 text-center text-sm text-slate-400"
                  >
                    Loading tickets...
                  </TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="py-14 text-center text-sm text-slate-400"
                  >
                    <TicketIcon className="mx-auto mb-2 h-8 w-8 opacity-25" />
                    No tickets found
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((ticket) => {
                  const status = STATUS_CONFIG[ticket.status];
                  const StatusIcon = status.icon;

                  return (
                    <TableRow
                      key={ticket.id}
                      className="group border-b border-slate-100 hover:bg-slate-50/70"
                    >
                      <TableCell className="pl-5 py-3.5">
                        <div className="min-w-0">
                          <span className="block text-[10px] font-mono text-slate-400">
                            {ticket.ticketNumber}
                          </span>
                          <p className="truncate text-sm font-medium text-slate-800">
                            {ticket.title}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="py-3.5">
                        <span className="inline-flex items-center gap-2 text-xs text-slate-600">
                          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-slate-100 text-[10px] font-semibold text-slate-500">
                            {CATEGORY_ICONS[ticket.category]}
                          </span>
                          {ticket.category}
                        </span>
                      </TableCell>
                      <TableCell className="py-3.5">
                        <Badge
                          variant="outline"
                          className={`px-2 text-[10px] ${PRIORITY_CONFIG[ticket.priority]}`}
                        >
                          {ticket.priority}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-3.5">
                        <Badge
                          variant="outline"
                          className={`px-2 text-[10px] ${status.className}`}
                        >
                          <StatusIcon className="mr-1 h-3 w-3" />
                          {status.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-3.5 text-sm text-slate-600">
                        {ticket.submittedBy.name}
                      </TableCell>
                      <TableCell className="py-3.5 text-xs text-slate-400">
                        {fmtDate(ticket.updatedAt)}
                      </TableCell>
                      <TableCell className="pr-5 py-3.5">
                        <div className="flex justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 hover:bg-blue-50 hover:text-blue-600"
                            onClick={() => openDetails(ticket)}
                            title="View ticket"
                          >
                            <MessageSquareText className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 hover:bg-amber-50 hover:text-amber-600"
                            onClick={() => openEdit(ticket)}
                            title="Edit ticket"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 hover:bg-red-50 hover:text-red-600"
                            onClick={() => setDeleteTicket(ticket)}
                            title="Delete ticket"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {filtered.length > 0 && !loading && (
        <p className="text-right text-xs text-slate-400">
          Showing {filtered.length} of {tickets.length} tickets
        </p>
      )}

      <Dialog
        open={!!selectedTicket}
        onOpenChange={(open) => {
          if (!open) closeDetails();
        }}
      >
        <DialogContent className="flex max-h-[90vh] flex-col gap-0 p-0 sm:max-w-2xl">
          {selectedTicket &&
            (() => {
              const status = STATUS_CONFIG[selectedTicket.status];
              const StatusIcon = status.icon;

              return (
                <>
                  <DialogHeader className="shrink-0 border-b border-slate-100 px-6 py-4">
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-mono text-slate-400">
                        {selectedTicket.ticketNumber}
                      </span>
                      <Badge
                        variant="outline"
                        className={`px-2 text-[10px] ${status.className}`}
                      >
                        <StatusIcon className="mr-1 h-3 w-3" />
                        {status.label}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={`px-2 text-[10px] ${PRIORITY_CONFIG[selectedTicket.priority]}`}
                      >
                        {selectedTicket.priority}
                      </Badge>
                    </div>
                    <DialogTitle className="text-left text-blue-900">
                      {selectedTicket.title}
                    </DialogTitle>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-400">
                      <span>{selectedTicket.category}</span>
                      <span>•</span>
                      <span>By {selectedTicket.submittedBy.name}</span>
                      <span>•</span>
                      <span>{fmtDateTime(selectedTicket.createdAt)}</span>
                      {selectedTicket.assignedTo && (
                        <>
                          <span>•</span>
                          <span>Assigned to {selectedTicket.assignedTo.name}</span>
                        </>
                      )}
                    </div>
                  </DialogHeader>

                  <div className="flex-1 space-y-5 overflow-y-auto px-6 py-4">
                    <div className="rounded-2xl bg-slate-50 p-4">
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Description
                      </p>
                      <p className="text-sm leading-relaxed text-slate-700">
                        {selectedTicket.description}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Quick Status Update
                      </Label>
                      <div className="flex flex-wrap gap-2">
                        {STATUS_OPTIONS.map((value) => {
                          const config = STATUS_CONFIG[value];
                          const active = selectedTicket.status === value;

                          return (
                            <button
                              key={value}
                              type="button"
                              onClick={() => handleStatusUpdate(selectedTicket.id, value)}
                              disabled={active}
                              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-all disabled:cursor-not-allowed ${
                                active
                                  ? config.pill
                                  : "border-slate-200 bg-white text-slate-500 hover:border-blue-300 hover:text-blue-600"
                              }`}
                            >
                              {value === "IN_PROGRESS" ? "In Progress" : value}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-3">
                        <Label className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                          Conversation
                        </Label>
                        <span className="text-xs text-slate-400">
                          {comments.length} comment{comments.length === 1 ? "" : "s"}
                        </span>
                      </div>

                      {commentsLoading ? (
                        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-10 text-center text-sm text-slate-400">
                          Loading comments...
                        </div>
                      ) : comments.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-10 text-center text-sm text-slate-400">
                          No comments yet
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {comments.map((entry) => (
                            <div
                              key={entry.id}
                              className={`flex ${
                                entry.commentedById === selectedTicket.submittedBy.id
                                  ? "justify-start"
                                  : "justify-end"
                              }`}
                            >
                              <div
                                className={`max-w-[85%] rounded-[20px] border px-4 py-3 text-sm shadow-sm ${
                                  entry.commentedById === selectedTicket.submittedBy.id
                                    ? "rounded-bl-md border-slate-200 bg-white"
                                    : "rounded-br-md border-blue-100 bg-blue-50"
                                }`}
                              >
                                <div className="mb-1.5 flex items-center gap-2">
                                  <span className="text-xs font-semibold text-slate-700">
                                    {entry.commentedByName}
                                  </span>
                                  <span className="ml-auto inline-flex items-center gap-1 text-[11px] text-slate-400">
                                    <Clock3 className="h-3 w-3" />
                                    {fmtDateTime(entry.createdAt)}
                                  </span>
                                </div>
                                <p className="whitespace-pre-wrap break-words leading-relaxed text-slate-600">
                                  {entry.message}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="shrink-0 border-t border-slate-100 px-6 py-4">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Reply to this ticket..."
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        onKeyDown={(e) =>
                          e.key === "Enter" && !e.shiftKey && handleAddComment()
                        }
                        className="rounded-2xl"
                      />
                      <Button
                        onClick={handleAddComment}
                        disabled={!comment.trim() || sendingComment}
                        className="shrink-0 gap-1.5 rounded-2xl bg-blue-600 text-white hover:bg-blue-700"
                      >
                        <Send className="h-3.5 w-3.5" />
                        {sendingComment ? "Sending..." : "Send"}
                      </Button>
                    </div>
                  </div>
                </>
              );
            })()}
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!editTicket}
        onOpenChange={(open) => {
          if (!open) setEditTicket(null);
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit3 className="h-4 w-4 text-blue-600" />
              Edit ticket
            </DialogTitle>
            <DialogDescription>
              Update ticket details and workflow status.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-slate-600">Title</Label>
              <Input
                value={editForm.title}
                onChange={(e) =>
                  setEditForm((prev) => ({ ...prev, title: e.target.value }))
                }
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-slate-600">
                Description
              </Label>
              <Textarea
                value={editForm.description}
                onChange={(e) =>
                  setEditForm((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                className="min-h-28 resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-slate-600">
                  Category
                </Label>
                <FilterDropdown
                  options={CATEGORY_OPTIONS}
                  value={editForm.category}
                  onChange={(value) =>
                    setEditForm((prev) => ({
                      ...prev,
                      category: value as TicketCategory,
                    }))
                  }
                  className="w-full"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-slate-600">
                  Priority
                </Label>
                <FilterDropdown
                  options={PRIORITY_OPTIONS}
                  value={editForm.priority}
                  onChange={(value) =>
                    setEditForm((prev) => ({
                      ...prev,
                      priority: value as TicketPriority,
                    }))
                  }
                  className="w-full"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-slate-600">Status</Label>
              <FilterDropdown
                options={STATUS_OPTIONS}
                value={editForm.status}
                onChange={(value) =>
                  setEditForm((prev) => ({
                    ...prev,
                    status: value as TicketStatus,
                  }))
                }
                className="w-full"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditTicket(null)}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveEdit}
              disabled={
                saving ||
                !editForm.title.trim() ||
                !editForm.description.trim()
              }
              className="bg-blue-600 text-white hover:bg-blue-700"
            >
              {saving ? "Saving..." : "Save changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!deleteTicket}
        onOpenChange={(open) => {
          if (!open) setDeleteTicket(null);
        }}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-red-50">
              <Trash2 className="h-5 w-5 text-red-600" />
            </div>
            <DialogTitle>Delete ticket?</DialogTitle>
            <DialogDescription>
              "{deleteTicket?.title}" will be permanently removed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTicket(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={saving}
            >
              {saving ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
