import { useEffect, useMemo, useRef, useState, type ElementType } from "react";
import {
  AlertCircle,
  Bell,
  Building2,
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
  UserCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
import type { Ticket, TicketPriority, TicketStatus } from "@/types";
import {
  adminAddComment,
  adminDeleteTicket,
  adminGetComments,
  adminUpdateTicket,
  getAllTickets,
  getAdminUsers,
  type Comment,
} from "@/lib/api/ticketApi";
import type { AdminUser } from "@/lib/api/ticketApi";
import { getAdminUser } from "@/lib/api/authHeaders";
import { AdminPagination } from "./admin-components";
import { getUserFriendlyErrorMessage } from "@/lib/api/apiUtils";

// ── Configs ─────────────────────────────────────────────────────────────────

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

const SEGMENT_CONFIG: Record<string, { label: string; className: string }> = {
  CIC_FEEDS: {
    label: "CIC Feeds",
    className: "bg-green-50 text-green-700 border-green-200",
  },
  CIC_VET_CARE: {
    label: "CIC Vet Care",
    className: "bg-purple-50 text-purple-700 border-purple-200",
  },
  CIC_POULTRY: {
    label: "CIC Poultry",
    className: "bg-orange-50 text-orange-700 border-orange-200",
  },
  AISA_VET: {
    label: "Asia Vet",
    className: "bg-teal-50 text-teal-700 border-teal-200",
  },
};

const CATEGORY_OPTIONS = ["IT", "HR", "FINANCE", "FACILITIES", "OTHER"];
const PRIORITY_OPTIONS: TicketPriority[] = [
  "LOW",
  "MEDIUM",
  "HIGH",
  "CRITICAL",
];
const STATUS_OPTIONS: TicketStatus[] = [
  "OPEN",
  "IN_PROGRESS",
  "RESOLVED",
  "CLOSED",
];

const CATEGORY_ICONS: Record<string, string> = {
  IT: "IT",
  HR: "HR",
  FINANCE: "FN",
  FACILITIES: "FC",
  OTHER: "OT",
};

const EMPTY_EDIT_FORM = {
  title: "",
  description: "",
  category: "",
  priority: "MEDIUM" as TicketPriority,
  status: "OPEN" as TicketStatus,
  department: "",
  assignedToId: null as number | null,
};

const getLatestCommentSnapshot = (entries: Comment[]) => {
  if (entries.length === 0) return null;

  const latest = entries[entries.length - 1];
  return {
    id: latest.id,
    authorId: latest.commentedBy.id,
  };
};

interface NotificationItem {
  id: string;
  ticketId: number;
  ticketNumber: string;
  title: string;
  description: string;
  createdAt: string;
  unread: boolean;
}

// ── Sub-components ───────────────────────────────────────────────────────────

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
            {value === option && (
              <Check className="h-3.5 w-3.5 text-blue-600" />
            )}
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
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-lg ${color}`}
      >
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-xs text-slate-500">{label}</p>
        <p className="text-2xl font-semibold">{value}</p>
      </div>
    </div>
  );
}

// ── Helpers ──────────────────────────────────────────────────────────────────

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

// ── Page ─────────────────────────────────────────────────────────────────────

export default function AdminTicketsPage() {
  const currentViewer = getAdminUser();
  const isAdmin = currentViewer?.role === "ADMIN";
  const adminSegment = currentViewer?.segment ?? null;
  const activeUserId = currentViewer?.userId ?? null;

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [segmentFilter, setSegmentFilter] = useState("All");

  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [newMessageAlert, setNewMessageAlert] = useState(false);

  const [editTicket, setEditTicket] = useState<Ticket | null>(null);
  const [editForm, setEditForm] = useState({ ...EMPTY_EDIT_FORM });
  const [deleteTicket, setDeleteTicket] = useState<Ticket | null>(null);

  const [comment, setComment] = useState("");
  const [sendingComment, setSendingComment] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // ── Refs ─────────────────────────────────────────────────────────────────
  const commentsEndRef = useRef<HTMLDivElement>(null);
  const commentsContainerRef = useRef<HTMLDivElement>(null);
  const shouldScrollRef = useRef(false);
  const selectedTicketRef = useRef<Ticket | null>(null);
  const lastUpdatedAtRef = useRef<Record<number, string>>({});
  const latestCommentIdRef = useRef<Record<number, number | null>>({});
  const isSeededRef = useRef(false);

  const [pageAlert, setPageAlert] = useState<{
    ticketNumber: string;
    title: string;
  } | null>(null);
  const unreadNotificationCount = notifications.filter(
    (item) => item.unread,
  ).length;

  const appendNotification = (
    notification: Omit<NotificationItem, "unread">,
  ) => {
    setNotifications((prev) => {
      if (prev.some((item) => item.id === notification.id)) {
        return prev;
      }

      return [{ ...notification, unread: true }, ...prev].slice(0, 10);
    });
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((item) => (item.id === id ? { ...item, unread: false } : item)),
    );
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) =>
      prev.map((item) => ({ ...item, unread: false })),
    );
  };

  useEffect(() => {
    selectedTicketRef.current = selectedTicket;
  }, [selectedTicket]);

  // ── Initial load ─────────────────────────────────────────────────────────
  useEffect(() => {
    fetchTickets();
    fetchAdminUsers();
  }, []);

  // ── Dialog comment polling ────────────────────────────────────────────────
  useEffect(() => {
    if (!selectedTicket) return;
    const interval = setInterval(() => {
      fetchComments(selectedTicket.id);
    }, 5000);
    return () => clearInterval(interval);
  }, [selectedTicket?.id]);

  // ── Page-level polling ────────────────────────────────────────────────────
  useEffect(() => {
    const interval = setInterval(async () => {
      if (!isSeededRef.current) return;
      try {
        const fresh = await getAllTickets();
        for (const ticket of fresh) {
          const lastSeen = lastUpdatedAtRef.current[ticket.id];
          if (lastSeen === undefined) {
            lastUpdatedAtRef.current[ticket.id] = ticket.updatedAt;
          } else if (lastSeen !== ticket.updatedAt) {
            if (selectedTicketRef.current?.id === ticket.id) {
              lastUpdatedAtRef.current[ticket.id] = ticket.updatedAt;
              continue;
            }

            const commentData = await adminGetComments(ticket.id);
            const latestComment = getLatestCommentSnapshot(commentData);
            const previousCommentId =
              latestCommentIdRef.current[ticket.id] ?? null;

            if (latestComment) {
              latestCommentIdRef.current[ticket.id] = latestComment.id;
            }

            if (
              latestComment &&
              latestComment.id !== previousCommentId &&
              latestComment.authorId !== activeUserId
            ) {
              appendNotification({
                id: `ticket-${ticket.id}-comment-${latestComment.id}`,
                ticketId: ticket.id,
                ticketNumber: ticket.ticketNumber,
                title: ticket.title,
                description: "New message received on this ticket.",
                createdAt: ticket.updatedAt,
              });
              setPageAlert({
                ticketNumber: ticket.ticketNumber,
                title: ticket.title,
              });
            }

            lastUpdatedAtRef.current[ticket.id] = ticket.updatedAt;
          }
        }
        setTickets(fresh);
      } catch {
        // silent
      }
    }, 10000);
    return () => clearInterval(interval);
  }, [activeUserId]);
  // ── Data fetchers ─────────────────────────────────────────────────────────

  const fetchTickets = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getAllTickets();
      setTickets(data);
      data.forEach((t) => {
        lastUpdatedAtRef.current[t.id] = t.updatedAt;
      });
      isSeededRef.current = true;
    } catch (err) {
      console.error("Failed to fetch tickets", err);
      setTickets([]);
      setError(
        getUserFriendlyErrorMessage(err, "Unable to load tickets right now."),
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchAdminUsers = async () => {
    try {
      const data = await getAdminUsers();
      setAdminUsers(data);
    } catch (err) {
      console.error("Failed to fetch admin users", err);
    }
  };

  const fetchComments = async (ticketId: number, isInitial = false) => {
    const container = commentsContainerRef.current;
    const prevScrollTop = container?.scrollTop ?? 0;
    const prevScrollHeight = container?.scrollHeight ?? 0;
    try {
      if (isInitial) setCommentsLoading(true);
      const data = await adminGetComments(ticketId);
      const latestComment = getLatestCommentSnapshot(data);
      latestCommentIdRef.current[ticketId] = latestComment?.id ?? null;
      setComments((prev) => {
        if (
          prev.length === data.length &&
          prev.every(
            (c, i) => c.id === data[i].id && c.message === data[i].message,
          )
        ) {
          return prev;
        }
        if (!isInitial && prev.length > 0) {
          const prevIds = new Set(prev.map((c) => c.id));
          const newFromOther = data.filter(
            (c) => !prevIds.has(c.id) && c.commentedBy.id !== activeUserId,
          );
          if (newFromOther.length > 0) {
            newFromOther.forEach((entry) => {
              appendNotification({
                id: `ticket-${ticketId}-comment-${entry.id}`,
                ticketId,
                ticketNumber:
                  selectedTicketRef.current?.ticketNumber ??
                  `Ticket ${ticketId}`,
                title: selectedTicketRef.current?.title ?? "Support ticket",
                description: `${entry.commentedBy.name}: ${entry.message.slice(0, 80)}`,
                createdAt: entry.createdAt,
              });
            });
            setTimeout(() => setNewMessageAlert(true), 0);
          }
        }
        return data;
      });
      requestAnimationFrame(() => {
        if (!commentsContainerRef.current) return;
        if (shouldScrollRef.current) {
          commentsEndRef.current?.scrollIntoView({ behavior: "smooth" });
          shouldScrollRef.current = false;
        } else {
          const newScrollHeight = commentsContainerRef.current.scrollHeight;
          commentsContainerRef.current.scrollTop =
            prevScrollTop + (newScrollHeight - prevScrollHeight);
        }
      });
    } catch (err) {
      console.error("Failed to fetch comments", err);
    } finally {
      if (isInitial) setCommentsLoading(false);
    }
  };

  // ── Derived state ─────────────────────────────────────────────────────────

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return tickets.filter((ticket) => {
      // ADMIN: always restrict to their segment only
      if (isAdmin && adminSegment && ticket.segment !== adminSegment)
        return false;

      return (
        (ticket.title.toLowerCase().includes(q) ||
          ticket.ticketNumber.toLowerCase().includes(q) ||
          ticket.submittedBy.name.toLowerCase().includes(q) ||
          (ticket.department ?? "").toLowerCase().includes(q)) &&
        (statusFilter === "All" || ticket.status === statusFilter) &&
        (categoryFilter === "All" || ticket.category === categoryFilter) &&
        (priorityFilter === "All" || ticket.priority === priorityFilter) &&
        // Segment filter only applies to SUPER_ADMIN
        (!isAdmin
          ? segmentFilter === "All" || ticket.segment === segmentFilter
          : true)
      );
    });
  }, [
    tickets,
    search,
    statusFilter,
    categoryFilter,
    priorityFilter,
    segmentFilter,
    isAdmin,
    adminSegment,
  ]);

  useEffect(() => {
    setPage(1);
  }, [
    search,
    statusFilter,
    categoryFilter,
    priorityFilter,
    segmentFilter,
    pageSize,
  ]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginatedTickets = filtered.slice(
    (page - 1) * pageSize,
    page * pageSize,
  );

  const stats = useMemo(
    () => [
      {
        label: "Total tickets",
        value: loading ? "..." : filtered.length,
        icon: TicketIcon,
        color: "bg-blue-50 text-blue-600",
      },
      {
        label: "Open",
        value: loading
          ? "..."
          : filtered.filter((t) => t.status === "OPEN").length,
        icon: Circle,
        color: "bg-sky-50 text-sky-600",
      },
      {
        label: "In progress",
        value: loading
          ? "..."
          : filtered.filter((t) => t.status === "IN_PROGRESS").length,
        icon: Loader2,
        color: "bg-amber-50 text-amber-600",
      },
      {
        label: "Resolved",
        value: loading
          ? "..."
          : filtered.filter((t) => t.status === "RESOLVED").length,
        icon: ShieldCheck,
        color: "bg-emerald-50 text-emerald-600",
      },
    ],
    [filtered, loading],
  );

  // ── Handlers ──────────────────────────────────────────────────────────────

  const openDetails = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setComment("");
    setPageAlert(null);
    setNewMessageAlert(false);
    setNotifications((prev) =>
      prev.map((item) =>
        item.ticketId === ticket.id ? { ...item, unread: false } : item,
      ),
    );
    shouldScrollRef.current = true;
    fetchComments(ticket.id, true);
  };

  const closeDetails = () => {
    setSelectedTicket(null);
    setComments([]);
    setComment("");
    setNewMessageAlert(false);
  };

  const openEdit = (ticket: Ticket) => {
    setEditTicket(ticket);
    setEditForm({
      title: ticket.title,
      description: ticket.description,
      category: ticket.category,
      priority: ticket.priority,
      status: ticket.status,
      department: ticket.department ?? "",
      assignedToId: ticket.assignedTo?.id ?? null,
    });
  };

  const handleSaveEdit = async () => {
    if (!editTicket || !editForm.title.trim() || !editForm.description.trim())
      return;
    try {
      setSaving(true);
      const updated = await adminUpdateTicket(editTicket.id, editForm);
      setTickets((prev) =>
        prev.map((t) => (t.id === updated.id ? updated : t)),
      );
      if (selectedTicket?.id === updated.id) setSelectedTicket(updated);
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
      setTickets((prev) => prev.filter((t) => t.id !== deleteTicket.id));
      if (selectedTicket?.id === deleteTicket.id) closeDetails();
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
        prev.map((t) => (t.id === updated.id ? updated : t)),
      );
      if (selectedTicket?.id === updated.id) setSelectedTicket(updated);
    } catch (err) {
      console.error("Failed to update status", err);
    }
  };

  const handleAddComment = async () => {
    if (!selectedTicket || !comment.trim()) return;
    try {
      setSendingComment(true);
      setNewMessageAlert(false);
      shouldScrollRef.current = true;
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

  // ── Comment helpers ───────────────────────────────────────────────────────

  const getCommentRole = (entry: Comment) => {
    if (entry.commentedBy.role === "AUTHORIZED") return "AUTHORIZED" as const;
    if (entry.commentedBy.role === "SERVICE") return "SERVICE" as const;
    return "ADMIN" as const;
  };

  const getCommentAppearance = (entry: Comment) => {
    const isMine = String(entry.commentedBy.id) === String(activeUserId);
    const role = getCommentRole(entry);
    if (role === "SERVICE") {
      return {
        align: isMine ? "justify-end" : "justify-start",
        bubble:
          "rounded-bl-md border-emerald-200 bg-emerald-50/95 text-emerald-950",
        name: "text-emerald-900",
        badge: "bg-emerald-100 text-emerald-700",
        badgeLabel: "Service",
      };
    }
    if (role === "AUTHORIZED") {
      return {
        align: isMine ? "justify-end" : "justify-start",
        bubble:
          "rounded-bl-md border-violet-200 bg-violet-50/95 text-violet-950",
        name: "text-violet-900",
        badge: "bg-violet-100 text-violet-700",
        badgeLabel: "Authorized",
      };
    }
    return {
      align: isMine ? "justify-end" : "justify-start",
      bubble: "rounded-bl-md border-blue-200 bg-blue-50/95 text-blue-950",
      name: "text-blue-900",
      badge: "bg-blue-100 text-blue-700",
      badgeLabel: "Admin",
    };
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6 p-6">
      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Support Tickets
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Review, update, edit, and remove employee support requests.
            {isAdmin && adminSegment && (
              <span className="ml-2 inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700 border border-blue-200">
                {SEGMENT_CONFIG[adminSegment]?.label ?? adminSegment}
              </span>
            )}
          </p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Button
              variant="outline"
              size="icon"
              className="relative h-10 w-10 rounded-xl"
            >
              <Bell className="h-4 w-4" />
              {unreadNotificationCount > 0 && (
                <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white" />
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 p-0">
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
              <div>
                <p className="text-sm font-medium text-slate-900">
                  Notifications
                </p>
                <p className="text-xs text-slate-400">
                  {unreadNotificationCount} unread
                </p>
              </div>
              {notifications.length > 0 && (
                <button
                  type="button"
                  onClick={markAllNotificationsRead}
                  className="text-xs text-blue-600 hover:text-blue-800"
                >
                  Mark all read
                </button>
              )}
            </div>
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="px-4 py-6 text-sm text-slate-400">
                  No notifications yet
                </div>
              ) : (
                notifications.map((notification) => (
                  <button
                    key={notification.id}
                    type="button"
                    onClick={() => {
                      markNotificationRead(notification.id);
                      const ticket = tickets.find(
                        (item) => item.id === notification.ticketId,
                      );
                      if (ticket) openDetails(ticket);
                    }}
                    className="flex w-full items-start gap-3 border-b border-slate-100 px-4 py-3 text-left hover:bg-slate-50"
                  >
                    <div className="relative mt-1">
                      <Bell className="h-4 w-4 text-slate-400" />
                      {notification.unread && (
                        <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-red-500" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-slate-900">
                        {notification.ticketNumber}
                      </p>
                      <p className="truncate text-xs text-slate-500">
                        {notification.title}
                      </p>
                      <p className="mt-1 line-clamp-2 text-xs text-slate-400">
                        {notification.description}
                      </p>
                      <p className="mt-1 text-[11px] text-slate-400">
                        {fmtDateTime(notification.createdAt)}
                      </p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* ── Page-level alert ── */}
      {pageAlert && (
        <Alert className="border-blue-200 bg-blue-50">
          <Bell className="h-4 w-4 text-blue-600" />
          <AlertDescription className="flex items-center justify-between">
            <span className="text-sm text-blue-800">
              <span className="font-semibold">{pageAlert.ticketNumber}</span>
              {" — "}
              <span className="font-medium">{pageAlert.title}</span>
              {" has a new update."}
            </span>
            <div className="ml-4 flex items-center gap-3">
              <button
                onClick={() => {
                  const ticket = tickets.find(
                    (t) => t.ticketNumber === pageAlert.ticketNumber,
                  );
                  if (ticket) openDetails(ticket);
                  setPageAlert(null);
                }}
                className="text-xs font-medium text-blue-700 underline hover:text-blue-900"
              >
                View ticket
              </button>
              <button
                onClick={() => setPageAlert(null)}
                className="text-xs text-blue-500 underline hover:text-blue-700"
              >
                Dismiss
              </button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((item) => (
          <StatCard key={item.label} {...item} />
        ))}
      </div>

      {/* ── Filters ── */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[220px] flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            className="h-9 pl-9"
            placeholder="Search by ticket, title, employee or department..."
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

        {/* Segment filter — SUPER_ADMIN only */}
        {!isAdmin && (
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Button
                variant="outline"
                className={`h-9 min-w-[130px] justify-between gap-2 text-sm font-normal ${
                  segmentFilter !== "All" ? "border-blue-500 text-blue-600" : ""
                }`}
              >
                <span>
                  {segmentFilter === "All"
                    ? "All Segments"
                    : (SEGMENT_CONFIG[segmentFilter]?.label ?? segmentFilter)}
                </span>
                <ChevronDown className="h-3.5 w-3.5 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="min-w-[160px]">
              {["All", ...Object.keys(SEGMENT_CONFIG)].map((key) => (
                <DropdownMenuItem
                  key={key}
                  onClick={() => setSegmentFilter(key)}
                  className="flex cursor-pointer items-center justify-between text-sm"
                >
                  {key === "All"
                    ? "All Segments"
                    : (SEGMENT_CONFIG[key]?.label ?? key)}
                  {segmentFilter === key && (
                    <Check className="h-3.5 w-3.5 text-blue-600" />
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* ── Tickets Table ── */}
      <Card className="overflow-hidden border border-slate-200 shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 hover:bg-slate-50">
                <TableHead className="pl-5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Ticket
                </TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Department
                </TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Segment
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
                  Assigned To
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
                    colSpan={10}
                    className="py-14 text-center text-sm text-slate-400"
                  >
                    Loading tickets...
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="py-14 text-center text-sm text-slate-400"
                  >
                    {error}
                  </TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={10}
                    className="py-14 text-center text-sm text-slate-400"
                  >
                    <TicketIcon className="mx-auto mb-2 h-8 w-8 opacity-25" />
                    No tickets found
                  </TableCell>
                </TableRow>
              ) : (
                paginatedTickets.map((ticket) => {
                  const status = STATUS_CONFIG[ticket.status];
                  const StatusIcon = status.icon;
                  const seg = ticket.segment
                    ? SEGMENT_CONFIG[ticket.segment]
                    : null;
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
                        {ticket.department ? (
                          <span className="inline-flex items-center gap-1.5 text-xs text-slate-600">
                            <Building2 className="h-3.5 w-3.5 text-slate-400" />
                            {ticket.department}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-300">—</span>
                        )}
                      </TableCell>
                      <TableCell className="py-3.5">
                        {seg ? (
                          <Badge
                            variant="outline"
                            className={`px-2 text-[10px] ${seg.className}`}
                          >
                            {seg.label}
                          </Badge>
                        ) : (
                          <span className="text-xs text-slate-300">—</span>
                        )}
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
                      <TableCell className="py-3.5">
                        {ticket.assignedTo ? (
                          <span className="inline-flex items-center gap-1.5 text-xs text-slate-600">
                            <UserCheck className="h-3.5 w-3.5 text-emerald-500" />
                            {ticket.assignedTo.name}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-300">
                            Unassigned
                          </span>
                        )}
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
          Showing {filtered.length} of{" "}
          {isAdmin ? filtered.length : tickets.length} tickets
        </p>
      )}

      <AdminPagination
        page={page}
        totalPages={totalPages}
        totalItems={filtered.length}
        pageSize={pageSize}
        itemLabel="tickets"
        onPageChange={setPage}
        onPageSizeChange={(nextSize) => {
          setPage(1);
          setPageSize(nextSize);
        }}
      />

      {/* ── Ticket Detail Dialog ── */}
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
              const seg = selectedTicket.segment
                ? SEGMENT_CONFIG[selectedTicket.segment]
                : null;
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
                      {seg && (
                        <Badge
                          variant="outline"
                          className={`px-2 text-[10px] ${seg.className}`}
                        >
                          {seg.label}
                        </Badge>
                      )}
                      {selectedTicket.department && (
                        <Badge
                          variant="outline"
                          className="px-2 text-[10px] bg-slate-50 text-slate-600 border-slate-200"
                        >
                          <Building2 className="mr-1 h-3 w-3" />
                          {selectedTicket.department}
                        </Badge>
                      )}
                    </div>
                    <DialogTitle className="text-left text-blue-900">
                      {selectedTicket.title}
                    </DialogTitle>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-400">
                      <span>Category: {selectedTicket.category}</span>
                      <span>•</span>
                      <span>Created By: {selectedTicket.submittedBy.name}</span>
                      <span>•</span>
                      <span>
                        Created At: {fmtDateTime(selectedTicket.createdAt)}
                      </span>
                      {selectedTicket.assignedTo ? (
                        <>
                          <span>•</span>
                          <span className="inline-flex items-center gap-1 text-emerald-600 font-medium">
                            <UserCheck className="h-3 w-3" />
                            Assigned to {selectedTicket.assignedTo.name}
                          </span>
                        </>
                      ) : (
                        <>
                          <span>•</span>
                          <span className="text-slate-300">Unassigned</span>
                        </>
                      )}
                    </div>
                  </DialogHeader>

                  <div
                    ref={commentsContainerRef}
                    className="flex-1 space-y-5 overflow-y-auto px-6 py-4"
                  >
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
                              onClick={() =>
                                handleStatusUpdate(selectedTicket.id, value)
                              }
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
                        <div className="flex items-center gap-2">
                          <Label className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                            Conversation
                          </Label>
                          <span className="flex items-center gap-1.5 text-xs text-emerald-500 font-medium">
                            <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                            </span>
                            Live
                          </span>
                        </div>
                        <span className="text-xs text-slate-400">
                          {comments.length} comment
                          {comments.length === 1 ? "" : "s"}
                        </span>
                      </div>

                      {newMessageAlert && (
                        <Alert className="border-blue-200 bg-blue-50">
                          <Bell className="h-4 w-4 text-blue-600" />
                          <AlertDescription className="flex items-center justify-between">
                            <span className="text-sm font-medium text-blue-800">
                              New reply received
                            </span>
                            <button
                              onClick={() => setNewMessageAlert(false)}
                              className="ml-4 text-xs text-blue-500 underline hover:text-blue-700"
                            >
                              Dismiss
                            </button>
                          </AlertDescription>
                        </Alert>
                      )}

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
                          {comments.map((entry) => {
                            const appearance = getCommentAppearance(entry);
                            return (
                              <div
                                key={entry.id}
                                className={`flex ${appearance.align}`}
                              >
                                <div
                                  className={`max-w-[85%] rounded-[20px] border px-4 py-3 text-sm shadow-sm ${appearance.bubble}`}
                                >
                                  <div className="mb-1.5 flex items-center gap-2">
                                    <span
                                      className={`text-xs font-semibold ${appearance.name}`}
                                    >
                                      {entry.commentedBy.name}
                                    </span>
                                    <span
                                      className={`rounded-full px-2 py-0.5 text-[10px] ${appearance.badge}`}
                                    >
                                      {appearance.badgeLabel}
                                    </span>
                                    <span className="ml-auto inline-flex items-center gap-1 text-[11px] text-slate-400">
                                      <Clock3 className="h-3 w-3" />
                                      {fmtDateTime(entry.createdAt)}
                                    </span>
                                  </div>
                                  <p className="whitespace-pre-wrap break-words leading-relaxed text-current">
                                    {entry.message}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                          <div ref={commentsEndRef} />
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

      {/* ── Edit Ticket Dialog ── */}
      <Dialog
        open={!!editTicket}
        onOpenChange={(open) => {
          if (!open) setEditTicket(null);
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit3 className="h-4 w-4 text-blue-600" /> Edit ticket
            </DialogTitle>
            <DialogDescription>
              Update ticket details, assignment, and workflow status.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-slate-600">
                Title
              </Label>
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
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-slate-600">
                Department
              </Label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  value={editForm.department}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      department: e.target.value,
                    }))
                  }
                  placeholder="e.g. Sales, Engineering, Operations"
                  className="pl-9"
                />
              </div>
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
                    setEditForm((prev) => ({ ...prev, category: value }))
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
              <Label className="text-xs font-medium text-slate-600">
                Status
              </Label>
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
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-slate-600">
                Assign To
              </Label>
              <div className="relative">
                <UserCheck className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <select
                  value={editForm.assignedToId ?? ""}
                  onChange={(e) =>
                    setEditForm((prev) => ({
                      ...prev,
                      assignedToId: e.target.value
                        ? Number(e.target.value)
                        : null,
                    }))
                  }
                  className="h-10 w-full rounded-md border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-blue-200"
                >
                  {adminUsers.length === 0 ? (
                    <option value="" disabled>
                      Loading users...
                    </option>
                  ) : (
                    <>
                      <option value="">Unassigned</option>
                      {adminUsers.map((user) => (
                        <option key={user.id} value={user.id}>
                          {user.name} ({user.role})
                        </option>
                      ))}
                    </>
                  )}
                </select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditTicket(null)}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveEdit}
              disabled={
                saving || !editForm.title.trim() || !editForm.description.trim()
              }
              className="bg-blue-600 text-white hover:bg-blue-700"
            >
              {saving ? "Saving..." : "Save changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirm Dialog ── */}
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
