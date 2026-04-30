import { useEffect, useMemo, useState } from "react";
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
} from "lucide-react";
import { useLocation, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import type { Ticket, TicketCategory, TicketPriority } from "@/types";
import {
  createTicket,
  getMyTickets,
  addComment,
  getComments,
  type Comment,
} from "@/lib/api/ticketApi";
import { mapPathToSegment } from "@/utils/segmentMapper";
import { getAdminUser, logout } from "@/lib/api/authHeaders";

const CATEGORIES: TicketCategory[] = [
  "IT",
  "HR",
  "FINANCE",
  "FACILITIES",
  "OTHER",
];

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
  CLOSED: {
    label: "Closed",
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
    label: "CIC Vet Care",
    class: "bg-purple-50 text-purple-700 border-purple-200",
  },
  CIC_POULTRY: {
    label: "CIC Poultry",
    class: "bg-orange-50 text-orange-700 border-orange-200",
  },
  AISA_VET: {
    label: "Asia Vet",
    class: "bg-teal-50 text-teal-700 border-teal-200",
  },
};

const CATEGORY_ICONS: Record<TicketCategory, typeof Laptop> = {
  IT: Laptop,
  HR: Users,
  FINANCE: Landmark,
  FACILITIES: Building2,
  OTHER: FileText,
};

const isKnownSegment = (
  segment?: string | null,
): segment is keyof typeof SEGMENT_CONFIG =>
  !!segment && segment in SEGMENT_CONFIG;

const fmtDate = (d: string) => {
  const date = new Date(d);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (hours < 1) return "Just now";
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;

  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

export default function HelpDeskPage() {
  const { pathname } = useLocation();
  const [searchParams] = useSearchParams();

  const pathSegment = mapPathToSegment(pathname.slice(1));
  const querySegment = searchParams.get("segment");
  const currentSegment = isKnownSegment(querySegment)
    ? querySegment
    : pathSegment && isKnownSegment(pathSegment)
      ? pathSegment
      : undefined;

  const EMPTY_FORM = {
    title: "",
    description: "",
    category: "IT" as TicketCategory,
    priority: "MEDIUM" as TicketPriority,
    segment: currentSegment ?? "",
  };

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [segmentFilter, setSegmentFilter] = useState<string>(
    currentSegment ?? "All",
  );
  const [showCreate, setShowCreate] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const currentViewer = getAdminUser();

  useEffect(() => {
    fetchMyTickets();
  }, []);

  useEffect(() => {
    setSegmentFilter(currentSegment ?? "All");
    setForm((prev) => ({
      ...prev,
      segment: currentSegment ?? "",
    }));
  }, [currentSegment]);

  const fetchMyTickets = async () => {
    try {
      setLoading(true);
      const data = await getMyTickets();
      setTickets(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    window.location.replace("/");
  };

  const filtered = useMemo(() => {
    return tickets.filter((t) => {
      const q = search.toLowerCase();
      return (
        (t.title.toLowerCase().includes(q) ||
          t.ticketNumber.toLowerCase().includes(q)) &&
        (statusFilter === "All" || t.status === statusFilter) &&
        (segmentFilter === "All" || t.segment === segmentFilter)
      );
    });
  }, [tickets, search, statusFilter, segmentFilter]);

  const handleCreate = async () => {
    if (!form.title.trim() || !form.description.trim()) return;

    try {
      setSaving(true);
      await createTicket(form);
      await fetchMyTickets();
      setForm({ ...EMPTY_FORM });
      setShowCreate(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const fetchComments = async (ticketId: number) => {
    try {
      setCommentsLoading(true);
      const data = await getComments(ticketId);
      setComments(data);
    } catch (err) {
      console.error(err);
    } finally {
      setCommentsLoading(false);
    }
  };

  const openTicket = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    fetchComments(ticket.id);
  };

  const handleAddComment = async () => {
    if (!comment.trim() || !selectedTicket) return;

    try {
      await addComment(selectedTicket.id, { message: comment });
      setComment("");
      await fetchComments(selectedTicket.id);
    } catch (err) {
      console.error(err);
    }
  };

  const statusTabs = ["All", "OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"];
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

  return (
    <div className="bg-white">
      <section className="max-w-7xl mx-auto px-4 py-6 md:py-8">
        <div className="rounded-[28px] border border-slate-200 bg-[linear-gradient(135deg,#f8fbff_0%,#eef5ff_45%,#ffffff_100%)] p-6 shadow-sm md:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                <Headset className="h-3.5 w-3.5" />
                Employee Support Center
              </div>
              <h1 className="mt-4 text-3xl font-bold text-blue-900 md:text-4xl">
                Help Desk
              </h1>
              <p className="mt-3 text-sm leading-relaxed text-slate-600 md:text-base">
                Submit support requests, follow progress, and keep every update
                organized in one place for your segment team.
              </p>
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
              </div>
            </div>

            <div className="grid gap-3 sm:min-w-72">
              <Button
                onClick={() => setShowCreate(true)}
                className="h-11 rounded-2xl bg-blue-900 px-4 text-white hover:bg-blue-800"
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
                {filtered.map((ticket) => {
                  const status = STATUS_CONFIG[ticket.status];
                  const priority = PRIORITY_CONFIG[ticket.priority];
                  const segment = SEGMENT_CONFIG[ticket.segment];
                  const StatusIcon = status.icon;
                  const CategoryIcon = CATEGORY_ICONS[ticket.category];

                  return (
                    <Card
                      key={ticket.id}
                      onClick={() => openTicket(ticket)}
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

                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-400 transition-colors group-hover:bg-blue-50 group-hover:text-blue-600">
                              <ChevronRight className="h-4 w-4" />
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </section>

      <Dialog
        open={showCreate}
        onOpenChange={(open) => {
          if (!open) setForm({ ...EMPTY_FORM });
          setShowCreate(open);
        }}
      >
        <DialogContent className="rounded-[28px] border-0 p-0 shadow-[0_24px_80px_-36px_rgba(15,23,42,0.45)] sm:max-w-xl">
          <div className="rounded-[28px] bg-white">
            <DialogHeader>
              <div className="rounded-t-[28px] bg-linear-to-r from-slate-950 via-blue-950 to-blue-900 px-6 py-6 text-white">
                <DialogTitle className="flex items-center gap-2 text-left text-xl text-white">
                  <Plus className="h-4 w-4" /> Submit a Ticket
                </DialogTitle>
                <DialogDescription className="mt-2 text-left text-blue-100/80">
                  Describe your issue clearly and route it to the right support
                  team.
                </DialogDescription>
              </div>
            </DialogHeader>

            <div className="space-y-5 px-6 py-6">
              <div className="grid gap-5 md:grid-cols-2">
                <div className="space-y-1.5 md:col-span-2">
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

                <div className="space-y-1.5 md:col-span-2">
                  <Label className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                    Description <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    placeholder="Describe the issue, impact, and any details the support team should know..."
                    value={form.description}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    className="h-32 resize-none rounded-2xl border-slate-200 bg-slate-50/70 shadow-none focus-visible:ring-blue-200"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                    Category
                  </Label>
                  <select
                    value={form.category}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        category: e.target.value as TicketCategory,
                      }))
                    }
                    className="h-11 w-full rounded-2xl border border-slate-200 bg-slate-50/70 px-3 text-sm outline-none focus:ring-2 focus:ring-blue-200"
                  >
                    {CATEGORIES.map((category) => (
                      <option key={category}>{category}</option>
                    ))}
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
                    {PRIORITIES.map((priority) => (
                      <option key={priority}>{priority}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5 md:col-span-2">
                  <Label className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                    Segment
                  </Label>
                  <div
                    className={`flex h-11 w-full items-center rounded-2xl border px-3 text-sm font-medium ${
                      SEGMENT_CONFIG[form.segment]?.class ??
                      "bg-slate-50 text-slate-500 border-slate-200"
                    }`}
                  >
                    {(SEGMENT_CONFIG[form.segment]?.label ?? form.segment) ||
                      "-"}
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter className="border-t border-slate-100 px-6 py-4">
              <Button
                variant="outline"
                onClick={() => {
                  setForm({ ...EMPTY_FORM });
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

      <Dialog
        open={!!selectedTicket}
        onOpenChange={(open) => {
          if (!open) setSelectedTicket(null);
        }}
      >
        <DialogContent className="h-[92vh] w-[calc(100vw-1rem)] max-w-[calc(100vw-1rem)] rounded-[28px] border-0 p-0 shadow-[0_24px_80px_-36px_rgba(15,23,42,0.45)] sm:h-auto sm:max-h-[90vh] sm:w-full sm:max-w-3xl">
          {selectedTicket &&
            (() => {
              const status = STATUS_CONFIG[selectedTicket.status];
              const segment = SEGMENT_CONFIG[selectedTicket.segment];
              const StatusIcon = status.icon;
              const CategoryIcon = CATEGORY_ICONS[selectedTicket.category];

              return (
                <>
                  <DialogHeader className="shrink-0 border-b border-slate-100 bg-linear-to-r from-slate-950 via-blue-950 to-blue-900 px-6 py-5 text-white">
                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/15">
                        <CategoryIcon className="h-5 w-5 text-white" />
                      </div>

                      {/* Main content — takes all remaining width */}
                      <div className="min-w-0 flex-1">
                        {/* Badges row */}
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
                        </div>

                        {/* Title */}
                        <DialogTitle className="text-left text-2xl font-semibold leading-tight text-white">
                          {selectedTicket.title}
                        </DialogTitle>

                        {/* Meta row */}
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

                      {/* Close button placeholder space — so title doesn't collide with X */}
                      <div className="w-8 shrink-0" />
                    </div>
                  </DialogHeader>

                  <div className="flex-1 space-y-4 overflow-y-auto bg-slate-50/80 px-6 py-5">
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

                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                          Conversation
                        </p>
                        <span className="text-xs text-slate-400">
                          {comments.length} comment
                          {comments.length === 1 ? "" : "s"}
                        </span>
                      </div>

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
                          {comments.map((c) => (
                            <div
                              key={c.id}
                              className={`flex ${
                                c.commentedById === currentViewer?.userId
                                  ? "justify-end"
                                  : "justify-start"
                              }`}
                            >
                              <div
                                className={`max-w-[92%] rounded-[22px] border px-4 py-3 text-sm shadow-sm sm:max-w-[78%] ${
                                  c.commentedById ===
                                  selectedTicket.submittedBy.id
                                    ? "rounded-br-md border-blue-100 bg-blue-50/90"
                                    : "rounded-bl-md border-emerald-100 bg-emerald-50/90"
                                }`}
                              >
                                <div className="mb-2 flex flex-wrap items-center gap-2">
                                  <span
                                    className={`text-xs font-semibold ${
                                      c.commentedById ===
                                      selectedTicket.submittedBy.id
                                        ? "text-blue-900"
                                        : "text-emerald-900"
                                    }`}
                                  >
                                    {c.commentedByName}
                                  </span>
                                  {c.commentedById ===
                                  selectedTicket.submittedBy.id ? (
                                    <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] text-blue-700">
                                      User
                                    </span>
                                  ) : (
                                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] text-emerald-700">
                                      Support
                                    </span>
                                  )}
                                  <span className="ml-auto text-[11px] text-slate-400">
                                    {fmtDate(c.createdAt)}
                                  </span>
                                </div>
                                <p className="whitespace-pre-wrap break-words leading-relaxed text-slate-700">
                                  {c.message}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {selectedTicket.status !== "CLOSED" && (
                    <div className="shrink-0 border-t border-slate-100 bg-white px-4 py-4 sm:px-6">
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
