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
import { Skeleton } from "@/components/ui/skeleton";
import { Navigate } from "react-router-dom";
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
import { getAdminUser, logout } from "@/lib/api/authHeaders";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import logo from "@/assets/Logo.jpg";
import { AdminPagination } from "@/Pages/Admin/admin-components";
import { resolveFileUrl } from "@/lib/api/fileUtils";

const PRIORITIES: TicketPriority[] = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];

const STATUS_CONFIG = {
  OPEN: {
    label: "Open",
    icon: Circle,
    class: "bg-cic-50 text-cic-600 border-cic-200",
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
  MEDIUM: { class: "bg-cic-50 text-cic-600 border-cic-200" },
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

  const currentUser = useCurrentUser();

  // ✅ No more URL-path / query-param based segment detection — the help desk
  // now lives on a general page, so the segment always comes from the
  // logged-in user's own profile. Used for both viewing tickets and creating them.
  const currentSegment = isKnownSegment(currentUser?.segment)
    ? currentUser?.segment
    : undefined;

  // ── State ─────────────────────────────────────────────────────────────────
  const [categories, setCategories] = useState<TicketCategory[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
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
  // ✅ Segment in the create-ticket form is always the logged-in user's own segment,
  // not the URL/path segment the help desk page happens to be viewed under.
  const makeEmptyForm = () => ({
    title: "",
    description: "",
    category: categories[0]?.name ?? "",
    priority: "MEDIUM" as TicketPriority,
    segment: currentSegment ?? "",
    department: currentUser?.department ?? (null as string | null),
    attachments: [] as AttachedImage[],
    submittedByName: "",
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

  // ✅ Keep the form's segment in sync with the user's own segment
  // (guards against currentUser resolving asynchronously after first render).
  useEffect(() => {
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
        // ✅ Always send the logged-in user's own segment, never the URL/page segment.
        segment: currentSegment ?? form.segment,
        department: form.department?.trim() || null,
        submittedByName: form.submittedByName.trim(),
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
      bubble: "rounded-bl-md border-cic-200 bg-cic-50/95 text-blue-950",
      name: "text-cic-900",
      badge: "bg-cic-100 text-cic-700",
      badgeLabel: "Admin",
    };
  };

  // ── Derived state ─────────────────────────────────────────────────────────
  // ✅ Always restricted to the user's own segment — no "All segments" escape hatch.
  const filtered = useMemo(() => {
    return tickets.filter((t) => {
      const q = search.toLowerCase();
      return (
        (t.title.toLowerCase().includes(q) ||
          t.ticketNumber.toLowerCase().includes(q)) &&
        (statusFilter === "All" || t.status === statusFilter) &&
        t.segment === currentSegment &&
        (categoryFilter === "All" || t.category === categoryFilter)
      );
    });
  }, [tickets, search, statusFilter, categoryFilter, currentSegment]);

  // ✅ These must come AFTER filtered is declared
  const totalPages = Math.max(1, Math.ceil(filtered.length / TICKET_PAGE_SIZE));
  const paginated = filtered.slice(
    (page - 1) * TICKET_PAGE_SIZE,
    page * TICKET_PAGE_SIZE,
  );

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [search, statusFilter, categoryFilter]);

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
      iconClass: "bg-cic-50 text-cic-700",
      valueClass: "text-cic-800",
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
  // While the user is still being resolved (currentUser is undefined on first
  // render), show a loading state instead of redirecting — otherwise this page
  // would bounce back to "/" before the user's segment ever loads.
  if (currentUser === undefined) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-cic-700" />
      </div>
    );
  }

  // Only once the user has actually resolved and still has no known segment
  // do we send them away.
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
    <div className="min-h-screen bg-slate-50">
      {/* ── Top Navigation Bar ── */}
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 backdrop-blur-sm shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src={logo} alt="CIC" className="h-12 w-auto object-contain" />
            <span className="text-slate-200 text-lg font-light select-none">
              |
            </span>
            <div className="flex items-center gap-2">
              <Headset className="h-4 w-4 text-cic-600" />
              <span className="text-base font-semibold text-slate-800">
                Help Desk
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Notifications */}
            <DropdownMenu>
              <DropdownMenuTrigger>
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative h-9 w-9 rounded-xl text-slate-500 hover:bg-slate-100"
                >
                  <Bell className="h-4.5 w-4.5" />
                  {unreadNotificationCount > 0 && (
                    <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500 ring-1 ring-white" />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80 p-0">
                <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
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
                      className="text-xs text-cic-600 hover:text-cic-800"
                    >
                      Mark all read
                    </button>
                  )}
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="px-4 py-8 text-center text-sm text-slate-400">
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
                        <div className="relative mt-0.5 shrink-0">
                          <div
                            className={`flex h-7 w-7 items-center justify-center rounded-lg ${notification.unread ? "bg-cic-50" : "bg-slate-100"}`}
                          >
                            <Bell className="h-3.5 w-3.5 text-slate-400" />
                          </div>
                          {notification.unread && (
                            <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-red-500" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-semibold text-slate-400">
                            {notification.ticketNumber}
                          </p>
                          <p className="truncate text-sm font-medium text-slate-800">
                            {notification.title}
                          </p>
                          <p className="mt-0.5 line-clamp-2 text-xs text-slate-400">
                            {notification.description}
                          </p>
                          <p className="mt-1 text-xs text-slate-300">
                            {fmtDate(notification.createdAt)}
                          </p>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* User pill */}
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

            {/* New Ticket */}
            <Button
              onClick={() => {
                setForm(makeEmptyForm());
                setShowCreate(true);
              }}
              className="hidden sm:flex h-9 rounded-xl bg-cic-900 px-4 text-sm text-white hover:bg-blue-800"
            >
              <Plus className="mr-1.5 h-4 w-4" />
              New Ticket
            </Button>

            {/* Logout */}
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
        {/* ── Page Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2.5">
              <Badge
                variant="outline"
                className="rounded-full bg-emerald-50 text-emerald-700 border-emerald-200 text-xs font-semibold px-3 py-1"
              >
                <Headset className="mr-1.5 h-3.5 w-3.5" />
                {currentSegmentLabel}
              </Badge>
              {currentUser?.department && (
                <Badge
                  variant="outline"
                  className="rounded-full bg-slate-100 text-slate-600 border-slate-200 text-xs font-semibold px-3 py-1"
                >
                  <Building2 className="mr-1.5 h-3.5 w-3.5" />
                  {currentUser.department}
                </Badge>
              )}
            </div>
            <h1 className="text-2xl font-bold text-slate-900">
              Support Requests
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              {currentUser?.isService
                ? "Manage and respond to support tickets from your team."
                : "Submit and track support requests for your segment."}
            </p>
          </div>
          <Button
            onClick={() => {
              setForm(makeEmptyForm());
              setShowCreate(true);
            }}
            className="sm:hidden h-10 rounded-xl bg-cic-900 px-5 text-sm text-white hover:bg-blue-800"
          >
            <Plus className="mr-2 h-4 w-4" />
            New Ticket
          </Button>
        </div>

        {/* ── Stats ── */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {statsData.map((s) => {
            const StatIcon = s.icon;
            return (
              <Card
                key={s.label}
                className="border border-slate-200 bg-white shadow-sm"
              >
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                      {s.label}
                    </p>
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-xl ${s.iconClass}`}
                    >
                      <StatIcon className="h-5 w-5" />
                    </div>
                  </div>
                  <p className={`text-3xl font-bold ${s.valueClass}`}>
                    {s.value}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* ── Filters + Ticket List ── */}
        <div className="grid gap-6 xl:grid-cols-[320px_1fr]">
          {/* Filter Panel */}
          <Card className="h-fit border border-slate-200 bg-white shadow-sm">
            <CardContent className="p-5 space-y-5">
              <div>
                <h2 className="text-base font-semibold text-slate-900">
                  Filters
                </h2>
                <p className="text-sm text-slate-400 mt-0.5">
                  Narrow by keyword, status, or category.
                </p>
              </div>
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  className="h-10 rounded-xl border-slate-200 bg-slate-50 pl-10 text-sm shadow-none focus-visible:ring-cic-200"
                  placeholder="Search tickets..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="space-y-4">
                <div className="space-y-2.5">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Status
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {statusTabs.map((s) => (
                      <button
                        key={s}
                        onClick={() => setStatusFilter(s)}
                        className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                          statusFilter === s
                            ? "border-cic-900 bg-cic-900 text-white"
                            : "border-slate-200 bg-white text-slate-500 hover:border-cic-200 hover:text-cic-700"
                        }`}
                      >
                        {s === "All" ? "All" : s.replace(/_/g, " ")}
                      </button>
                    ))}
                  </div>
                </div>
                {categories.length > 0 && (
                  <div className="space-y-2.5">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Category
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => setCategoryFilter("All")}
                        className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                          categoryFilter === "All"
                            ? "border-cic-900 bg-cic-900 text-white"
                            : "border-slate-200 bg-white text-slate-500 hover:border-cic-200 hover:text-cic-700"
                        }`}
                      >
                        All
                      </button>
                      {categories.map((cat) => {
                        const CatIcon = getCategoryIcon(cat.name);
                        return (
                          <button
                            key={cat.id}
                            onClick={() => setCategoryFilter(cat.name)}
                            className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                              categoryFilter === cat.name
                                ? "border-cic-900 bg-cic-900 text-white"
                                : "border-slate-200 bg-white text-slate-500 hover:border-cic-200 hover:text-cic-700"
                            }`}
                          >
                            <CatIcon className="h-3.5 w-3.5" />
                            {cat.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Ticket List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-500 font-medium">
                {filtered.length} ticket{filtered.length === 1 ? "" : "s"} found
              </p>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => (
                  <Card
                    key={i}
                    className="border border-slate-200 bg-white shadow-sm"
                  >
                    <CardContent className="p-5">
                      <div className="flex gap-4">
                        <Skeleton className="h-12 w-12 rounded-xl shrink-0" />
                        <div className="flex-1 space-y-2.5">
                          <div className="flex gap-2">
                            <Skeleton className="h-5 w-24 rounded-md" />
                            <Skeleton className="h-5 w-18 rounded-md" />
                            <Skeleton className="h-5 w-16 rounded-md" />
                          </div>
                          <Skeleton className="h-5 w-2/3" />
                          <Skeleton className="h-4 w-full" />
                          <div className="flex gap-3">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-4 w-20" />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <Card className="border border-dashed border-slate-200 bg-white shadow-sm">
                <CardContent className="flex min-h-64 flex-col items-center justify-center gap-4 text-center px-6">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
                    <Headset className="h-7 w-7 text-slate-300" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-slate-700">
                      No tickets found
                    </h3>
                    <p className="mt-1.5 text-sm text-slate-400 max-w-xs">
                      No requests match the current filters. Adjust your search
                      or create a new ticket.
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {paginated.map((ticket) => {
                  const status = STATUS_CONFIG[ticket.status];
                  const priority = PRIORITY_CONFIG[ticket.priority];
                  const segment = SEGMENT_CONFIG[ticket.segment];
                  const StatusIcon = status.icon;
                  const CategoryIcon = getCategoryIcon(ticket.category);
                  return (
                    <Card
                      key={ticket.id}
                      className="group cursor-pointer border border-slate-200 bg-white shadow-sm transition-all hover:border-cic-200 hover:shadow-md"
                    >
                      <CardContent className="p-5">
                        <div className="flex items-start gap-4">
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500 group-hover:bg-cic-50 group-hover:text-cic-700 transition-colors">
                            <CategoryIcon className="h-5 w-5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                              <span className="font-mono text-xs font-semibold text-slate-400">
                                {ticket.ticketNumber}
                              </span>
                              <Badge
                                variant="outline"
                                className={`rounded-md px-2.5 h-6 text-xs ${status.class}`}
                              >
                                <StatusIcon className="mr-1 h-3 w-3" />
                                {status.label}
                              </Badge>
                              <Badge
                                variant="outline"
                                className={`rounded-md px-2.5 h-6 text-xs ${priority.class}`}
                              >
                                {ticket.priority}
                              </Badge>
                              {segment && (
                                <Badge
                                  variant="outline"
                                  className={`rounded-md px-2.5 h-6 text-xs ${segment.class}`}
                                >
                                  {segment.label}
                                </Badge>
                              )}
                              {ticket.submittedByName && (
                                <Badge
                                  variant="outline"
                                  className="rounded-md px-2.5 h-6 text-xs bg-slate-50 text-slate-500 border-slate-200"
                                >
                                  <Users className="mr-1 h-3 w-3" />
                                  {ticket.submittedByName}
                                </Badge>
                              )}
                            </div>
                            <p className="text-base font-semibold text-slate-800 group-hover:text-cic-900 transition-colors">
                              {ticket.title}
                            </p>
                            <p className="mt-1 text-sm text-slate-400 line-clamp-2">
                              {ticket.description}
                            </p>
                            <div className="mt-2.5 flex flex-wrap items-center gap-4 text-xs text-slate-400">
                              <span className="flex items-center gap-1.5">
                                <Clock className="h-3.5 w-3.5" />
                                {fmtDate(ticket.createdAt)}
                              </span>
                              {ticket.department && (
                                <span className="flex items-center gap-1.5">
                                  <Building2 className="h-3.5 w-3.5" />
                                  {ticket.department}
                                </span>
                              )}
                            </div>
                          </div>
                          <ChevronRight
                            className="h-5 w-5 text-slate-300 self-center shrink-0 group-hover:text-cic-500 transition-colors"
                            onClick={() => openTicket(ticket)}
                          />
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
          </div>
        </div>
      </div>

      {/* ── Create Ticket Dialog ── */}
      <Dialog
        open={showCreate}
        onOpenChange={(open) => {
          if (!open) setForm(makeEmptyForm());
          setShowCreate(open);
        }}
      >
        <DialogContent className="rounded-3xl border-0 p-0 shadow-[0_24px_80px_-36px_rgba(15,23,42,0.45)] flex flex-col max-h-[92vh] w-[calc(100vw-1rem)] max-w-[calc(100vw-1rem)] sm:w-full sm:max-w-2xl overflow-hidden">
          <div className="rounded-3xl bg-white flex flex-col min-h-0 overflow-hidden">
            <DialogHeader className="shrink-0">
              <div className="rounded-t-[28px] bg-linear-to-r from-slate-950 via-blue-950 to-blue-900 px-6 py-6 text-white">
                <div className="flex items-center gap-3 mb-1">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/20">
                    <Plus className="h-5 w-5 text-white" />
                  </div>
                  <DialogTitle className="text-left text-xl font-semibold text-white">
                    Submit a Support Ticket
                  </DialogTitle>
                </div>
                <DialogDescription className="mt-2 text-left text-slate-300 text-sm pl-12">
                  Fill in the details below to route your issue to the right
                  team.
                </DialogDescription>
              </div>
            </DialogHeader>

            <div className="overflow-y-auto flex-1 min-h-0 px-6 py-6">
              <div className="space-y-6">
                {/* Ticket Info section */}
                <div className="space-y-4">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
                    Ticket Details
                  </p>
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium text-slate-700">
                      Title <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      placeholder="Brief summary of your issue"
                      value={form.title}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, title: e.target.value }))
                      }
                      className="h-11 rounded-xl border-slate-200 bg-slate-50 shadow-none focus-visible:ring-cic-200 text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium text-slate-700">
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
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-sm font-medium text-slate-700">
                        Category
                      </Label>
                      <select
                        value={form.category}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            category: e.target.value,
                          }))
                        }
                        className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-cic-200"
                      >
                        {categories.length === 0 ? (
                          <option value="" disabled>
                            Loading...
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
                      <Label className="text-sm font-medium text-slate-700">
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
                        className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-cic-200"
                      >
                        {PRIORITIES.map((p) => (
                          <option key={p}>{p}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-100" />

                {/* Contact & Routing section */}
                <div className="space-y-4">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
                    Contact & Routing
                  </p>
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium text-slate-700">
                      Your Name <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <Users className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <Input
                        placeholder="Full name"
                        value={form.submittedByName}
                        onChange={(e) => {
                          const val = e.target.value;
                          const formatted =
                            val.length > 0
                              ? val.charAt(0).toUpperCase() +
                                val.slice(1).toLowerCase()
                              : "";
                          setForm((prev) => ({
                            ...prev,
                            submittedByName: formatted,
                          }));
                        }}
                        className="h-11 rounded-xl border-slate-200 bg-slate-50 pl-10 shadow-none focus-visible:ring-cic-200 text-sm"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-sm font-medium text-slate-700">
                        Department
                      </Label>
                      <div className="relative">
                        <Building2 className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <Input
                          placeholder="e.g. Sales, HR"
                          value={form.department ?? ""}
                          onChange={(e) =>
                            setForm((prev) => ({
                              ...prev,
                              department: e.target.value,
                            }))
                          }
                          readOnly={!!currentUser?.department}
                          className={`h-11 rounded-xl border-slate-200 bg-slate-50 pl-10 shadow-none focus-visible:ring-cic-200 text-sm ${currentUser?.department ? "cursor-default opacity-60" : ""}`}
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-sm font-medium text-slate-700">
                        Segment
                      </Label>
                      <div
                        className={`flex h-11 w-full items-center rounded-xl border px-3 text-sm font-medium ${SEGMENT_CONFIG[currentSegment ?? ""]?.class ?? "bg-slate-50 text-slate-500 border-slate-200"}`}
                      >
                        {SEGMENT_CONFIG[currentSegment ?? ""]?.label ??
                          currentSegment ??
                          "-"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter className="border-t border-slate-100 px-6 py-4 shrink-0 bg-slate-50/60">
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
                disabled={
                  !form.title.trim() ||
                  !form.description.trim() ||
                  !form.submittedByName.trim() ||
                  saving
                }
                className="rounded-xl bg-cic-900 text-white hover:bg-blue-800 h-10 px-6"
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
        <DialogContent className="flex flex-col h-[92vh] w-[calc(100vw-1rem)] max-w-[calc(100vw-1rem)] rounded-3xl border-0 p-0 shadow-[0_24px_80px_-36px_rgba(15,23,42,0.45)] sm:h-[85vh] sm:max-h-[85vh] sm:w-full sm:max-w-3xl overflow-hidden">
          {selectedTicket &&
            (() => {
              const status = STATUS_CONFIG[selectedTicket.status];
              const segment = SEGMENT_CONFIG[selectedTicket.segment];
              const StatusIcon = status.icon;
              const CategoryIcon = getCategoryIcon(selectedTicket.category);
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
                          <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs font-semibold text-cic-100">
                            {selectedTicket.ticketNumber}
                          </span>
                          <Badge
                            variant="outline"
                            className="border-white/15 bg-white/10 px-2 text-xs text-white"
                          >
                            <StatusIcon className="mr-1 h-3 w-3" />
                            {status.label}
                          </Badge>
                          <Badge
                            variant="outline"
                            className="border-white/15 bg-white/10 px-2 text-xs text-white"
                          >
                            {selectedTicket.priority}
                          </Badge>
                          {segment && (
                            <Badge
                              variant="outline"
                              className="border-white/15 bg-white/10 px-2 text-xs text-white"
                            >
                              {segment.label}
                            </Badge>
                          )}
                          {selectedTicket.department && (
                            <Badge
                              variant="outline"
                              className="border-white/15 bg-white/10 px-2 text-xs text-white"
                            >
                              <Building2 className="mr-1 h-3 w-3" />
                              {selectedTicket.department}
                            </Badge>
                          )}
                        </div>
                        <DialogTitle className="text-left text-2xl font-semibold leading-tight text-white">
                          {selectedTicket.title}
                        </DialogTitle>
                        <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-cic-100/75">
                          <span className="inline-flex items-center gap-1.5">
                            <CategoryIcon className="h-3.5 w-3.5" />
                            {selectedTicket.category}
                          </span>
                          <span className="text-cic-100/40">•</span>
                          <span>
                            Submitted {fmtDate(selectedTicket.createdAt)}
                          </span>
                          {selectedTicket.assignedTo && (
                            <>
                              <span className="text-cic-100/40">•</span>
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
                                  href={resolveFileUrl(url)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="group flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-1.5 pr-3 hover:border-cic-200 hover:bg-cic-50 transition-colors"
                                >
                                  <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-white">
                                    <img
                                      src={resolveFileUrl(url)}
                                      alt={`attachment-${i}`}
                                      className="h-full w-full object-cover"
                                    />
                                  </div>
                                  <span className="max-w-30 truncate text-xs font-medium text-slate-600 group-hover:text-cic-700">
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
                        <Alert className="rounded-2xl border-cic-200 bg-cic-50 text-cic-800">
                          <Bell className="h-4 w-4 text-cic-600" />
                          <AlertDescription className="flex items-center justify-between">
                            <span className="text-sm font-medium">
                              New reply received
                            </span>
                            <button
                              onClick={() => setNewMessageAlert(false)}
                              className="ml-4 text-xs text-cic-500 underline hover:text-cic-700"
                            >
                              Dismiss
                            </button>
                          </AlertDescription>
                        </Alert>
                      )}

                      {commentsLoading ? (
                        <div className="space-y-3">
                          {[...Array(3)].map((_, i) => (
                            <div
                              key={i}
                              className={`flex ${i % 2 === 0 ? "justify-start" : "justify-end"}`}
                            >
                              <div className="max-w-72 space-y-2 rounded-2xl border border-slate-200 bg-white p-3">
                                <div className="flex items-center gap-2">
                                  <Skeleton className="h-3 w-24" />
                                  <Skeleton className="h-4 w-14 rounded-full" />
                                </div>
                                <Skeleton className="h-3 w-full" />
                                <Skeleton className="h-3 w-3/4" />
                              </div>
                            </div>
                          ))}
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
                                      className={`rounded-full px-2 py-0.5 text-xs ${appearance.badge}`}
                                    >
                                      {appearance.badgeLabel}
                                    </span>
                                    <span className="ml-auto text-xs text-slate-400">
                                      {fmtDate(c.createdAt)}
                                    </span>
                                  </div>
                                  <p className="whitespace-pre-wrap wrap-break-word leading-relaxed text-current">
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
                              className="h-11 rounded-2xl bg-cic-900 px-5 text-white hover:bg-blue-800 sm:shrink-0"
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
