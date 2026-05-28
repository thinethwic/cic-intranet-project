import { useEffect, useMemo, useRef, useState } from "react";
import {
  Plus,
  Search,
  Clock,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Circle,
  Headset,
  Layers3,
  ShieldCheck,
  MessageSquareText,
  Laptop,
  Users,
  Landmark,
  Building2,
  FileText,
  LogOut,
  Bell,
} from "lucide-react";
import { Navigate, useLocation, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  RichDescriptionEditor,
  type AttachedImage,
} from "@/Pages/Our Segments/components/RichDescriptionEditor";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Ticket, TicketPriority } from "@/types";
import {
  createTicket,
  getMyTickets,
  addComment,
  getComments,
  getCategories,
  type Comment,
  type TicketCategory,
} from "@/lib/api/ticketApi";
import { mapPathToSegment } from "@/utils/segmentMapper";
import { getAdminUser, logout } from "@/lib/api/authHeaders";
import { decryptSegment } from "@/utils/segmentEncryption";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import logo from "@/assets/Logo.jpg";
import { AdminPagination } from "@/Pages/Admin/admin-components";

const PRIORITIES: TicketPriority[] = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];

const STATUS_CONFIG = {
  OPEN: {
    label: "Open",
    icon: Circle,
    class: "bg-blue-50 text-blue-600 border-blue-200",
  },
  IN_PROGRESS: {
    label: "In Progress",
    icon: Loader2,
    class: "bg-amber-50 text-amber-600 border-amber-200",
  },
  RESOLVED: {
    label: "Resolved",
    icon: CheckCircle2,
    class: "bg-emerald-50 text-emerald-600 border-emerald-200",
  },
  UNRESOLVED: {
    label: "Unresolved",
    icon: AlertCircle,
    class: "bg-slate-100 text-slate-500 border-slate-200",
  },
};

const PRIORITY_CONFIG = {
  LOW: { class: "bg-slate-100 text-slate-600 border-slate-200" },
  MEDIUM: { class: "bg-blue-50 text-blue-600 border-blue-200" },
  HIGH: { class: "bg-amber-50 text-amber-600 border-amber-200" },
  CRITICAL: { class: "bg-red-50 text-red-600 border-red-200" },
};

const SEGMENT_CONFIG: Record<string, { label: string; class: string }> = {
  CIC_FEEDS: {
    label: "CIC Feeds",
    class: "bg-green-50 text-green-700 border-green-200",
  },
  CIC_VET_CARE: {
    label: "CIC Vetcare",
    class: "bg-purple-50 text-purple-700 border-purple-200",
  },
  CIC_POULTRY: {
    label: "CIC Poultry",
    class: "bg-orange-50 text-orange-700 border-orange-200",
  },
  AISA_VET: {
    label: "Asiavet",
    class: "bg-teal-50 text-teal-700 border-teal-200",
  },
};

// ── Dynamic category icon helper ──────────────────────────────────────────────
const getCategoryIcon = (category: string) => {
  const map: Record<string, typeof Laptop> = {
    IT: Laptop,
    HR: Users,
    FINANCE: Landmark,
    FACILITIES: Building2,
  };
  return map[category] ?? FileText;
};

const isKnownSegment = (
  segment?: string | null,
): segment is keyof typeof SEGMENT_CONFIG =>
  !!segment && segment in SEGMENT_CONFIG;

const fmtDate = (d: string) => {
  const date = new Date(d);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (minutes < 5) return "Just now";
  if (minutes < 60) return `${minutes}min ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
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

const getLatestCommentSnapshot = (entries: Comment[]) => {
  if (entries.length === 0) return null;
  const latest = entries[entries.length - 1];
  return {
    id: latest.id,
    authorId: latest.commentedBy.id,
  };
};

export default function HelpDeskPage() {
  const TICKET_PAGE_SIZE = 8;
  const [page, setPage] = useState(1);

  const { pathname } = useLocation();
  const currentUser = useCurrentUser();
  const [searchParams] = useSearchParams();

  const pathSegment = mapPathToSegment(pathname.slice(1));
  const encryptedParam = searchParams.get("s");
  const decryptedParam = encryptedParam ? decryptSegment(encryptedParam) : null;

  const currentSegment = isKnownSegment(decryptedParam)
    ? decryptedParam
    : pathSegment && isKnownSegment(pathSegment)
      ? pathSegment
      : undefined;

  // ── State ─────────────────────────────────────────────────────────────────
  const [categories, setCategories] = useState<TicketCategory[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [segmentFilter, setSegmentFilter] = useState<string>(
    currentSegment ?? "All",
  );
  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [showCreate, setShowCreate] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [saving, setSaving] = useState(false);
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [newMessageAlert, setNewMessageAlert] = useState(false);

  const currentViewer = getAdminUser();
  const activeUserId = currentUser?.userId ?? currentViewer?.userId ?? null;

  const notifKey = `helpdesk_notifications_${activeUserId ?? "guest"}`;

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    try {
      const stored = localStorage.getItem(notifKey);
      if (!stored) return [];
      return JSON.parse(stored) as NotificationItem[];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(notifKey, JSON.stringify(notifications));
    } catch {
      // silent
    }
  }, [notifications, notifKey]);

  const hasAdminReply = comments.some(
    (c) => String(c.commentedBy.id) !== String(activeUserId),
  );
  const unreadNotificationCount = loading
    ? 0
    : notifications.filter((item) => item.unread).length;

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

  // ── Form ──────────────────────────────────────────────────────────────────
  // In makeEmptyForm()
  const makeEmptyForm = () => ({
    title: "",
    description: "",
    category: categories[0]?.name ?? "",
    priority: "MEDIUM" as TicketPriority,
    segment: currentSegment ?? "",
    department: currentUser?.department ?? (null as string | null),
    attachments: [] as AttachedImage[], // ← add this
  });

  const [form, setForm] = useState(makeEmptyForm);

  // ── Refs ──────────────────────────────────────────────────────────────────
  const commentsEndRef = useRef<HTMLDivElement>(null);
  const commentsContainerRef = useRef<HTMLDivElement>(null);
  const shouldScrollRef = useRef(false);
  const selectedTicketRef = useRef<Ticket | null>(null);
  const latestCommentIdRef = useRef<Record<number, number | null>>({});
  const isSeededRef = useRef(false);

  // ── Effects ───────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!currentSegment) return;
    getCategories(currentSegment, currentUser?.department)
      .then((data) => {
        setCategories(data);
        setForm((prev) => ({
          ...prev,
          category: prev.category || data[0]?.name || "",
        }));
      })
      .catch(console.error);
  }, [currentSegment, currentUser?.department]);

  useEffect(() => {
    fetchMyTickets();
  }, []);

  useEffect(() => {
    selectedTicketRef.current = selectedTicket;
  }, [selectedTicket]);

  useEffect(() => {
    setSegmentFilter(currentSegment ?? "All");
    setForm((prev) => ({ ...prev, segment: currentSegment ?? "" }));
  }, [currentSegment]);

  useEffect(() => {
    if (!selectedTicket) return;
    const interval = setInterval(() => {
      fetchComments(selectedTicket.id);
    }, 5000);
    return () => clearInterval(interval);
  }, [selectedTicket?.id]);

  useEffect(() => {
    const interval = setInterval(async () => {
      if (!isSeededRef.current) return;

      try {
        const fresh = await getMyTickets();
        setTickets(fresh);

        const myTickets = fresh.filter(
          (t) => !currentSegment || t.segment === currentSegment,
        );
        for (const ticket of myTickets) {
          try {
            const commentData = await getComments(ticket.id);
            const latestComment = getLatestCommentSnapshot(commentData);

            // ✅ Read FIRST, then update
            const previousCommentId = latestCommentIdRef.current[ticket.id];
            latestCommentIdRef.current[ticket.id] = latestComment?.id ?? -1;

            if (
              latestComment &&
              previousCommentId !== undefined && // seeded
              latestComment.id !== previousCommentId && // actually new
              latestComment.authorId !== activeUserId // not own message
            ) {
              appendNotification({
                id: `ticket-${ticket.id}-comment-${latestComment.id}`,
                ticketId: ticket.id,
                ticketNumber: ticket.ticketNumber,
                title: ticket.title,
                description: "New message received on this ticket.",
                createdAt: new Date().toISOString(),
              });
            }
          } catch {
            // silent
          }
        }
      } catch (err) {
        console.error(err);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [activeUserId]);

  // ── Data fetchers ─────────────────────────────────────────────────────────

  const fetchMyTickets = async () => {
    try {
      setLoading(true);
      const data = await getMyTickets();
      setTickets(data);

      const lastActive = localStorage.getItem("helpdesk_last_active");

      await Promise.all(
        data.map(async (ticket) => {
          try {
            const commentData = await getComments(ticket.id);
            const snapshot = getLatestCommentSnapshot(commentData);
            latestCommentIdRef.current[ticket.id] = snapshot?.id ?? -1;

            // ✅ Check for missed messages while logged out
            if (lastActive) {
              const missedComments = commentData.filter(
                (c) =>
                  new Date(c.createdAt) > new Date(lastActive) &&
                  String(c.commentedBy.id) !== String(activeUserId),
              );
              missedComments.forEach((c) => {
                appendNotification({
                  id: `ticket-${ticket.id}-comment-${c.id}`,
                  ticketId: ticket.id,
                  ticketNumber: ticket.ticketNumber,
                  title: ticket.title,
                  description: `${c.commentedBy.name}: ${c.message.slice(0, 80)}`,
                  createdAt: c.createdAt,
                });
              });
            }
          } catch {
            latestCommentIdRef.current[ticket.id] = -1;
          }
        }),
      );

      // ✅ Clear last_active after processing missed notifications
      localStorage.removeItem("helpdesk_last_active");

      isSeededRef.current = true;
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async (ticketId: number, isInitial = false) => {
    const container = commentsContainerRef.current;
    const prevScrollTop = container?.scrollTop ?? 0;
    const prevScrollHeight = container?.scrollHeight ?? 0;

    try {
      if (isInitial) setCommentsLoading(true);

      const data = await getComments(ticketId);
      const latestComment = getLatestCommentSnapshot(data);
      latestCommentIdRef.current[ticketId] = latestComment?.id ?? null;

      setComments((prev) => {
        if (!isInitial) {
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
                title: selectedTicketRef.current?.title ?? "Help desk ticket",
                description: `${entry.commentedBy.name}: ${entry.message.slice(0, 80)}`,
                createdAt: entry.createdAt,
              });
            });
            setNewMessageAlert(true);
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
      console.error(err);
    } finally {
      if (isInitial) setCommentsLoading(false);
    }
  };

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleLogout = () => {
    localStorage.setItem("helpdesk_last_active", new Date().toISOString());
    logout();
    window.location.replace("/");
  };

  const handleCreate = async () => {
    if (!form.title.trim() || !form.description.trim()) return;
    try {
      setSaving(true);
      await createTicket({
        title: form.title.trim(),
        description: form.description.trim(),
        category: form.category,
        priority: form.priority,
        segment: form.segment,
        department: form.department?.trim() || null,
        attachments:
          form.attachments.length > 0
            ? JSON.stringify(
                form.attachments.map((a) => ({
                  name: a.name,
                  dataUrl: a.dataUrl,
                })),
              )
            : null,
      });
      await fetchMyTickets();
      setForm(makeEmptyForm());
      setShowCreate(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const openTicket = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setNewMessageAlert(false);
    shouldScrollRef.current = true;
    fetchComments(ticket.id, true);
  };

  const handleAddComment = async () => {
    if (!comment.trim() || !selectedTicket) return;
    try {
      setNewMessageAlert(false);
      shouldScrollRef.current = true;
      await addComment(selectedTicket.id, { message: comment });
      setComment("");
      await fetchComments(selectedTicket.id, false);
    } catch (err) {
      console.error(err);
    }
  };

  // ── Comment appearance ────────────────────────────────────────────────────

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

  // ── Derived state ─────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    return tickets.filter((t) => {
      const q = search.toLowerCase();
      return (
        (t.title.toLowerCase().includes(q) ||
          t.ticketNumber.toLowerCase().includes(q)) &&
        (statusFilter === "All" || t.status === statusFilter) &&
        (segmentFilter === "All" || t.segment === segmentFilter) &&
        (categoryFilter === "All" || t.category === categoryFilter)
      );
    });
  }, [tickets, search, statusFilter, segmentFilter, categoryFilter]);

  // ✅ These must come AFTER filtered is declared
  const totalPages = Math.max(1, Math.ceil(filtered.length / TICKET_PAGE_SIZE));
  const paginated = filtered.slice(
    (page - 1) * TICKET_PAGE_SIZE,
    page * TICKET_PAGE_SIZE,
  );

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [search, statusFilter, segmentFilter, categoryFilter]);

  const statusTabs = ["All", "OPEN", "IN_PROGRESS", "RESOLVED", "UNRESOLVED"];

  const currentSegmentLabel = currentSegment
    ? (SEGMENT_CONFIG[currentSegment]?.label ?? currentSegment)
    : "All segments";

  const statsData = [
    {
      label: "Total Tickets",
      value: filtered.length,
      icon: Layers3,
      iconClass: "bg-slate-100 text-slate-700",
      valueClass: "text-slate-800",
    },
    {
      label: "Open Cases",
      value: filtered.filter((t) => t.status === "OPEN").length,
      icon: Headset,
      iconClass: "bg-blue-50 text-blue-700",
      valueClass: "text-blue-800",
    },
    {
      label: "In Progress",
      value: filtered.filter((t) => t.status === "IN_PROGRESS").length,
      icon: MessageSquareText,
      iconClass: "bg-amber-50 text-amber-700",
      valueClass: "text-amber-800",
    },
    {
      label: "Resolved",
      value: filtered.filter((t) => t.status === "RESOLVED").length,
      icon: ShieldCheck,
      iconClass: "bg-emerald-50 text-emerald-700",
      valueClass: "text-emerald-800",
    },
  ];

  // ── Guard ─────────────────────────────────────────────────────────────────
  if (!currentSegment) {
    return <Navigate to="/" replace />;
  }
  const parseAttachments = (raw?: string | null): string[] => {
    if (!raw) return [];
    try {
      return JSON.parse(raw) as string[];
    } catch {
      return [];
    }
  };
  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="bg-white">
      {/* ── Hero ── */}
      <section className="max-w-7xl mx-auto px-4 py-6 md:py-8">
        <div className="rounded-[28px] border border-slate-200 bg-[linear-gradient(135deg,#f8fbff_0%,#eef5ff_45%,#ffffff_100%)] p-6 shadow-sm md:p-8">
          <img
            src={logo}
            alt="CIC Livestock Solutions"
            className="h-14 w-auto object-contain"
          />
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between mt-8">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                <Headset className="h-3.5 w-3.5" />
                Employee Support Center
              </div>
              <h1 className="mt-4 text-3xl font-bold text-blue-900 md:text-4xl">
                Help Desk
              </h1>
              {currentUser?.isService ? (
                <p className="mt-3 text-sm leading-relaxed text-slate-600 md:text-base">
                  Manage, respond to, and resolve support tickets submitted by
                  employees across all segments.
                </p>
              ) : (
                <p className="mt-3 text-sm leading-relaxed text-slate-600 md:text-base">
                  Submit support requests, follow progress, and keep every
                  update organized in one place for your segment team.
                </p>
              )}
              <div className="mt-5 flex flex-wrap items-center gap-3">
                <div className="rounded-full border border-blue-100 bg-white px-3 py-1.5 text-xs font-medium text-slate-600">
                  Segment:{" "}
                  <span className="font-semibold text-blue-900">
                    {currentSegmentLabel}
                  </span>
                </div>
                <div className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600">
                  Visible tickets:{" "}
                  <span className="font-semibold text-slate-900">
                    {filtered.length}
                  </span>
                </div>
                {currentUser && (
                  <div className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600">
                    Logged in as:{" "}
                    <span className="font-semibold text-slate-900">
                      {currentUser.name}
                    </span>
                  </div>
                )}
                {currentUser && (
                  <div className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600">
                    Department:{" "}
                    <span className="font-semibold text-slate-900">
                      {currentUser.department}
                    </span>
                  </div>
                )}
              </div>
            </div>
            <div className="grid gap-3 sm:min-w-72">
              <div className="flex justify-end">
                <DropdownMenu>
                  <DropdownMenuTrigger>
                    <Button
                      variant="outline"
                      className="relative h-11 rounded-2xl border-slate-200 bg-white px-4 text-slate-600 hover:border-blue-200 hover:text-blue-700"
                    >
                      <Bell className="h-2 w-2 justify-center" />
                      {unreadNotificationCount > 0 && (
                        <span className="absolute right-1 top-3 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white" />
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
                              if (ticket) openTicket(ticket);
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
                                {fmtDate(notification.createdAt)}
                              </p>
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <Button
                onClick={() => {
                  setForm(makeEmptyForm());
                  setShowCreate(true);
                }}
                className="h-11 rounded-2xl bg-emerald-700 px-4 text-white hover:bg-emerald-600"
              >
                <Plus className="mr-2 h-4 w-4" />
                Create New Ticket
              </Button>
              <Button
                variant="outline"
                onClick={handleLogout}
                className="h-11 rounded-2xl border-slate-200 bg-white px-4 text-slate-600 hover:border-red-200 hover:text-red-600"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="max-w-7xl mx-auto px-4 py-2">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {statsData.map((s) => {
            const StatIcon = s.icon;
            return (
              <Card
                key={s.label}
                className="border border-slate-200 bg-white shadow-sm"
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-400">
                        {s.label}
                      </p>
                      <p
                        className={`mt-3 text-3xl font-semibold ${s.valueClass}`}
                      >
                        {s.value}
                      </p>
                    </div>
                    <div
                      className={`flex h-11 w-11 items-center justify-center rounded-2xl ${s.iconClass}`}
                    >
                      <StatIcon className="h-5 w-5" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* ── Filters + Ticket List ── */}
      <section className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid gap-6 xl:grid-cols-[0.9fr_1.55fr]">
          <Card className="h-fit border border-slate-200 bg-white shadow-sm">
            <CardContent className="space-y-5 p-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                  Filters
                </p>
                <h2 className="mt-2 text-xl font-semibold text-slate-900">
                  Search your requests
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Narrow down tickets by keyword, status, and segment.
                </p>
              </div>
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    className="h-11 rounded-2xl border-slate-200 bg-slate-50/70 pl-9 shadow-none focus-visible:ring-blue-200"
                    placeholder="Search by title or ticket number"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                    Status
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {statusTabs.map((s) => (
                      <button
                        key={s}
                        onClick={() => setStatusFilter(s)}
                        className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                          statusFilter === s
                            ? "border-blue-900 bg-blue-900 text-white"
                            : "border-slate-200 bg-white text-slate-500 hover:border-blue-200 hover:text-blue-700"
                        }`}
                      >
                        {s === "All" ? "All Statuses" : s.replace(/_/g, " ")}
                      </button>
                    ))}
                  </div>
                  {categories.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                        Category
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => setCategoryFilter("All")}
                          className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                            categoryFilter === "All"
                              ? "border-blue-900 bg-blue-900 text-white"
                              : "border-slate-200 bg-white text-slate-500 hover:border-blue-200 hover:text-blue-700"
                          }`}
                        >
                          All Categories
                        </button>
                        {categories.map((cat) => {
                          const CatIcon = getCategoryIcon(cat.name);
                          return (
                            <button
                              key={cat.id}
                              onClick={() => setCategoryFilter(cat.name)}
                              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                                categoryFilter === cat.name
                                  ? "border-blue-900 bg-blue-900 text-white"
                                  : "border-slate-200 bg-white text-slate-500 hover:border-blue-200 hover:text-blue-700"
                              }`}
                            >
                              <CatIcon className="h-3 w-3" />
                              {cat.name}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                  Ticket List
                </p>
                <h2 className="mt-1 text-2xl font-semibold text-slate-900">
                  Support requests
                </h2>
              </div>
              <div className="hidden items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-500 shadow-sm sm:flex">
                <Circle className="h-3 w-3 fill-emerald-500 text-emerald-500" />
                {filtered.length} records
              </div>
            </div>

            {loading ? (
              <Card className="border border-slate-200 bg-white shadow-sm">
                <CardContent className="flex min-h-72 flex-col items-center justify-center gap-3 text-center">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-700" />
                  <div>
                    <p className="font-medium text-slate-700">
                      Loading tickets
                    </p>
                    <p className="text-sm text-slate-400">
                      Please wait while we prepare your support queue.
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : filtered.length === 0 ? (
              <Card className="border border-dashed border-slate-200 bg-slate-50 shadow-sm">
                <CardContent className="flex min-h-72 flex-col items-center justify-center px-6 text-center">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-blue-50 text-blue-400">
                    <AlertCircle className="h-7 w-7" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-800">
                    No tickets found
                  </h3>
                  <p className="mt-2 max-w-md text-sm leading-relaxed text-slate-400">
                    There are no requests matching the current filters. Try
                    changing your filters or submit a new ticket.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {paginated.map((ticket) => {
                  const status = STATUS_CONFIG[ticket.status];
                  const priority = PRIORITY_CONFIG[ticket.priority];
                  const segment = SEGMENT_CONFIG[ticket.segment];
                  const StatusIcon = status.icon;
                  const CategoryIcon = getCategoryIcon(ticket.category);
                  return (
                    <Card
                      key={ticket.id}
                      className="group cursor-pointer border border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
                    >
                      <CardContent className="p-5">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                          <div className="flex min-w-0 gap-4">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-800 ring-1 ring-blue-100">
                              <CategoryIcon className="h-5 w-5" />
                            </div>
                            <div className="min-w-0">
                              <div className="mb-2 flex flex-wrap items-center gap-2">
                                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold tracking-[0.14em] text-slate-500">
                                  {ticket.ticketNumber}
                                </span>
                                <Badge
                                  variant="outline"
                                  className={`rounded-full px-2.5 text-[10px] ${status.class}`}
                                >
                                  <StatusIcon className="mr-1 h-3 w-3" />
                                  {status.label}
                                </Badge>
                                <Badge
                                  variant="outline"
                                  className={`rounded-full px-2.5 text-[10px] ${priority.class}`}
                                >
                                  {ticket.priority}
                                </Badge>
                                {segment && (
                                  <Badge
                                    variant="outline"
                                    className={`rounded-full px-2.5 text-[10px] ${segment.class}`}
                                  >
                                    {segment.label}
                                  </Badge>
                                )}
                                {ticket.department && (
                                  <Badge
                                    variant="outline"
                                    className="rounded-full px-2.5 text-[10px] bg-slate-50 text-slate-600 border-slate-200"
                                  >
                                    <Building2 className="mr-1 h-3 w-3" />
                                    {ticket.department}
                                  </Badge>
                                )}
                              </div>
                              <p className="text-base font-semibold text-slate-900 transition-colors group-hover:text-blue-900">
                                {ticket.title}
                              </p>
                              <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-slate-500">
                                {ticket.description}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center justify-between gap-4 border-t border-slate-100 pt-3 lg:border-t-0 lg:pt-0">
                            <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
                              <Clock className="h-3.5 w-3.5" />
                              {fmtDate(ticket.createdAt)}
                            </div>
                            <button
                              onClick={() => openTicket(ticket)}
                              className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-400 transition-colors hover:bg-blue-50 hover:text-blue-600"
                            >
                              <ChevronRight className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}

            <AdminPagination
              page={page}
              totalPages={totalPages}
              totalItems={filtered.length}
              pageSize={TICKET_PAGE_SIZE}
              itemLabel="tickets"
              onPageChange={setPage}
            />
          </div>{" "}
          {/* closes the right column space-y-4 div */}
        </div>
      </section>

      {/* ── Create Ticket Dialog ── */}
      <Dialog
        open={showCreate}
        onOpenChange={(open) => {
          if (!open) setForm(makeEmptyForm());
          setShowCreate(open);
        }}
      >
        <DialogContent className="rounded-[28px] border-0 p-0 shadow-[0_24px_80px_-36px_rgba(15,23,42,0.45)] flex flex-col max-h-[92vh] w-[calc(100vw-1rem)] max-w-[calc(100vw-1rem)] sm:w-full sm:max-w-xl overflow-hidden">
          <div className="rounded-[28px] bg-white flex flex-col min-h-0 overflow-hidden">
            <DialogHeader>
              <div className="rounded-t-[28px] bg-linear-to-r from-slate-950 via-blue-950 to-blue-900 px-5 py-5 sm:px-6 text-white shrink-0">
                <DialogTitle className="flex items-center gap-2 text-left text-xl text-white">
                  <Plus className="h-4 w-4" /> Submit a Ticket
                </DialogTitle>
                <DialogDescription className="mt-2 text-left text-blue-100/80">
                  Describe your issue clearly and route it to the right support
                  team.
                </DialogDescription>
              </div>
            </DialogHeader>

            {/* Scrollable form body */}
            <div className="space-y-5 px-4 py-4 sm:px-6 sm:py-6 overflow-y-auto flex-1 min-h-0">
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                <div className="space-y-1.5 sm:col-span-2">
                  <Label className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                    Title <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    placeholder="Brief summary of your issue"
                    value={form.title}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, title: e.target.value }))
                    }
                    className="h-11 rounded-2xl border-slate-200 bg-slate-50/70 shadow-none focus-visible:ring-blue-200"
                  />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                    Description <span className="text-red-500">*</span>
                  </Label>
                  <RichDescriptionEditor
                    value={form.description}
                    onChange={(text) =>
                      setForm((prev) => ({ ...prev, description: text }))
                    }
                    attachments={form.attachments}
                    onAttach={(img) =>
                      setForm((prev) => ({
                        ...prev,
                        attachments: [...prev.attachments, img],
                      }))
                    }
                    onDetach={(id) =>
                      setForm((prev) => ({
                        ...prev,
                        attachments: prev.attachments.filter(
                          (a) => a.id !== id,
                        ),
                      }))
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                    Category
                  </Label>
                  <select
                    value={form.category}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, category: e.target.value }))
                    }
                    className="h-11 w-full rounded-2xl border border-slate-200 bg-slate-50/70 px-3 text-sm outline-none focus:ring-2 focus:ring-blue-200"
                  >
                    {categories.length === 0 ? (
                      <option value="" disabled>
                        Loading categories...
                      </option>
                    ) : (
                      categories.map((cat) => (
                        <option key={cat.id} value={cat.name}>
                          {cat.name}
                        </option>
                      ))
                    )}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                    Priority
                  </Label>
                  <select
                    value={form.priority}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        priority: e.target.value as TicketPriority,
                      }))
                    }
                    className="h-11 w-full rounded-2xl border border-slate-200 bg-slate-50/70 px-3 text-sm outline-none focus:ring-2 focus:ring-blue-200"
                  >
                    {PRIORITIES.map((p) => (
                      <option key={p}>{p}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                    Department
                  </Label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input
                      placeholder="e.g. Sales, Engineering, Operations"
                      value={form.department ?? ""}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          department: e.target.value,
                        }))
                      }
                      readOnly={!!currentUser?.department}
                      className={`h-11 rounded-2xl border-slate-200 bg-slate-50/70 pl-9 shadow-none focus-visible:ring-blue-200 ${currentUser?.department ? "cursor-default opacity-70" : ""}`}
                    />
                  </div>
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                    Segment
                  </Label>
                  <div
                    className={`flex h-11 w-full items-center rounded-2xl border px-3 text-sm font-medium ${SEGMENT_CONFIG[form.segment]?.class ?? "bg-slate-50 text-slate-500 border-slate-200"}`}
                  >
                    {SEGMENT_CONFIG[form.segment]?.label ?? form.segment ?? "-"}
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter className="border-t border-slate-100 px-4 py-3 sm:px-6 sm:py-4 shrink-0">
              <Button
                variant="outline"
                onClick={() => {
                  setForm(makeEmptyForm());
                  setShowCreate(false);
                }}
                className="rounded-2xl border-slate-200"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreate}
                disabled={
                  !form.title.trim() || !form.description.trim() || saving
                }
                className="rounded-2xl bg-blue-900 text-white hover:bg-blue-800"
              >
                {saving ? "Submitting..." : "Submit Ticket"}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Ticket Detail Dialog ── */}
      <Dialog
        open={!!selectedTicket}
        onOpenChange={(open) => {
          if (!open) {
            if (selectedTicket) {
              setNotifications((prev) =>
                prev.map((item) =>
                  item.ticketId === selectedTicket.id
                    ? { ...item, unread: false }
                    : item,
                ),
              );
            }
            setSelectedTicket(null);
            setComments([]);
            setComment("");
            setNewMessageAlert(false);
          }
        }}
      >
        <DialogContent className="flex flex-col h-[92vh] w-[calc(100vw-1rem)] max-w-[calc(100vw-1rem)] rounded-[28px] border-0 p-0 shadow-[0_24px_80px_-36px_rgba(15,23,42,0.45)] sm:h-[85vh] sm:max-h-[85vh] sm:w-full sm:max-w-3xl overflow-hidden">
          {selectedTicket &&
            (() => {
              const status = STATUS_CONFIG[selectedTicket.status];
              const segment = SEGMENT_CONFIG[selectedTicket.segment];
              const StatusIcon = status.icon;
              const CategoryIcon = getCategoryIcon(selectedTicket.category);

              // ✅ Lock check — based on saved status
              const isTicketClosed =
                selectedTicket.status === "RESOLVED" ||
                selectedTicket.status === "UNRESOLVED";

              return (
                <>
                  {/* ── Dialog Header ── */}
                  <DialogHeader className="shrink-0 border-b border-slate-100 bg-linear-to-r from-slate-950 via-blue-950 to-blue-900 px-6 py-5 text-white">
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/15">
                        <CategoryIcon className="h-5 w-5 text-white" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="mb-2.5 flex flex-wrap items-center gap-2">
                          <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs font-semibold text-blue-100">
                            {selectedTicket.ticketNumber}
                          </span>
                          <Badge
                            variant="outline"
                            className="border-white/15 bg-white/10 px-2 text-[10px] text-white"
                          >
                            <StatusIcon className="mr-1 h-3 w-3" />
                            {status.label}
                          </Badge>
                          <Badge
                            variant="outline"
                            className="border-white/15 bg-white/10 px-2 text-[10px] text-white"
                          >
                            {selectedTicket.priority}
                          </Badge>
                          {segment && (
                            <Badge
                              variant="outline"
                              className="border-white/15 bg-white/10 px-2 text-[10px] text-white"
                            >
                              {segment.label}
                            </Badge>
                          )}
                          {selectedTicket.department && (
                            <Badge
                              variant="outline"
                              className="border-white/15 bg-white/10 px-2 text-[10px] text-white"
                            >
                              <Building2 className="mr-1 h-3 w-3" />
                              {selectedTicket.department}
                            </Badge>
                          )}
                        </div>
                        <DialogTitle className="text-left text-2xl font-semibold leading-tight text-white">
                          {selectedTicket.title}
                        </DialogTitle>
                        <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-blue-100/75">
                          <span className="inline-flex items-center gap-1.5">
                            <CategoryIcon className="h-3.5 w-3.5" />
                            {selectedTicket.category}
                          </span>
                          <span className="text-blue-100/40">•</span>
                          <span>
                            Submitted {fmtDate(selectedTicket.createdAt)}
                          </span>
                          {selectedTicket.assignedTo && (
                            <>
                              <span className="text-blue-100/40">•</span>
                              <span>
                                Assigned to {selectedTicket.assignedTo.name}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="w-8 shrink-0" />
                    </div>
                  </DialogHeader>

                  {/* ── Scrollable body ── */}
                  <div
                    ref={commentsContainerRef}
                    style={{ flex: 1, overflowY: "auto", minHeight: 0 }}
                    className="space-y-4 bg-slate-50/80 px-6 py-5"
                  >
                    {/* Description */}
                    <Card className="border border-slate-200/80 bg-white shadow-sm">
                      <CardContent className="p-4">
                        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                          Description
                        </p>
                        <p className="text-sm leading-relaxed text-slate-700">
                          {selectedTicket.description}
                        </p>
                      </CardContent>
                    </Card>

                    {/* ── Attachments ── */}
                    {(() => {
                      const urls = parseAttachments(selectedTicket.attachments);
                      if (urls.length === 0) return null;
                      return (
                        <Card className="border border-slate-200/80 bg-white shadow-sm">
                          <CardContent className="p-4">
                            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                              Attachments ({urls.length})
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {urls.map((url, i) => (
                                <a
                                  key={i}
                                  href={url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="group flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-1.5 pr-3 hover:border-blue-200 hover:bg-blue-50 transition-colors"
                                >
                                  <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-white">
                                    <img
                                      src={url}
                                      alt={`attachment-${i}`}
                                      className="h-full w-full object-cover"
                                    />
                                  </div>
                                  <span className="max-w-[120px] truncate text-xs font-medium text-slate-600 group-hover:text-blue-700">
                                    {url
                                      .substring(url.lastIndexOf("/") + 1)
                                      .replace(/^\d+_/, "")}
                                  </span>
                                </a>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })()}

                    {/* Conversation */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                            Conversation
                          </p>
                          {/* ✅ Hide Live indicator when ticket is closed */}
                          {!isTicketClosed && (
                            <span className="flex items-center gap-1.5 text-xs text-emerald-500 font-medium">
                              <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                              </span>
                              Live
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-slate-400">
                          {comments.length} comment
                          {comments.length === 1 ? "" : "s"}
                        </span>
                      </div>

                      {newMessageAlert && (
                        <Alert className="rounded-2xl border-blue-200 bg-blue-50 text-blue-800">
                          <Bell className="h-4 w-4 text-blue-600" />
                          <AlertDescription className="flex items-center justify-between">
                            <span className="text-sm font-medium">
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
                        <div className="rounded-3xl border border-slate-200 bg-white px-4 py-10 text-center text-sm text-slate-400">
                          Loading conversation...
                        </div>
                      ) : comments.length === 0 ? (
                        <div className="rounded-3xl border border-dashed border-slate-200 bg-white px-4 py-10 text-center text-sm text-slate-400">
                          No comments yet
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {comments.map((c) => {
                            const appearance = getCommentAppearance(c);
                            return (
                              <div
                                key={c.id}
                                className={`flex ${appearance.align}`}
                              >
                                <div
                                  className={`max-w-[92%] rounded-[22px] border px-4 py-3 text-sm shadow-sm sm:max-w-[78%] ${appearance.bubble}`}
                                >
                                  <div className="mb-2 flex flex-wrap items-center gap-2">
                                    <span
                                      className={`text-xs font-semibold ${appearance.name}`}
                                    >
                                      {c.commentedBy.name}
                                    </span>
                                    <span
                                      className={`rounded-full px-2 py-0.5 text-[10px] ${appearance.badge}`}
                                    >
                                      {appearance.badgeLabel}
                                    </span>
                                    <span className="ml-auto text-[11px] text-slate-400">
                                      {fmtDate(c.createdAt)}
                                    </span>
                                  </div>
                                  <p className="whitespace-pre-wrap break-words leading-relaxed text-current">
                                    {c.message}
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

                  {/* ── Reply footer ── */}
                  {isTicketClosed ? (
                    // ✅ Ticket is RESOLVED or UNRESOLVED — show locked message
                    <div className="shrink-0 border-t border-slate-100 bg-white px-4 py-4 sm:px-6">
                      <div className="flex items-center gap-2 rounded-[24px] border border-slate-200 bg-slate-50 px-4 py-3">
                        <ShieldCheck className="h-4 w-4 shrink-0 text-slate-300" />
                        <p className="text-sm text-slate-400">
                          This ticket is {selectedTicket.status.toLowerCase()}{" "}
                          and no longer accepts replies.
                        </p>
                      </div>
                    </div>
                  ) : (
                    // ✅ Ticket is OPEN or IN_PROGRESS — show reply box
                    <div className="shrink-0 border-t border-slate-100 bg-white px-4 py-4 sm:px-6">
                      {!commentsLoading && !hasAdminReply ? (
                        <div className="flex items-center justify-center gap-2 rounded-[24px] border border-dashed border-slate-200 bg-slate-50 py-3 text-xs text-slate-400">
                          <Bell className="h-3.5 w-3.5" />
                          Waiting for admin to reply before you can respond
                        </div>
                      ) : (
                        <div className="rounded-[24px] border border-slate-200 bg-slate-50/80 p-2">
                          <div className="flex flex-col gap-2 sm:flex-row">
                            <Input
                              placeholder="Type your message..."
                              value={comment}
                              onChange={(e) => setComment(e.target.value)}
                              onKeyDown={(e) =>
                                e.key === "Enter" &&
                                !e.shiftKey &&
                                handleAddComment()
                              }
                              className="h-11 flex-1 rounded-2xl border-0 bg-white shadow-none"
                            />
                            <Button
                              onClick={handleAddComment}
                              disabled={!comment.trim()}
                              className="h-11 rounded-2xl bg-blue-900 px-5 text-white hover:bg-blue-800 sm:shrink-0"
                            >
                              Send
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </>
              );
            })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}
