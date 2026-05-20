import { useState, useEffect, useCallback } from "react";
import {
  Search,
  LogIn,
  LogOut,
  ShieldAlert,
  Activity,
  Users,
  XCircle,
  Download,
  RefreshCw,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent } from "@/components/ui/card";
import { authHeaders } from "@/lib/api/authHeaders";
import { AdminPagination } from "./admin-components";
import { getUserFriendlyErrorMessage } from "@/lib/api/apiUtils";
import InlineErrorAlert from "@/components/shared/InlineErrorAlert";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
const API = `${BASE_URL}/api/v1/audit-logs`;

// ── Types ─────────────────────────────────────────────────────────────────────

type EventType = "LOGIN" | "LOGOUT" | "LOGIN_FAILED";
type EventStatus = "SUCCESS" | "FAILURE";

interface AuditLog {
  id: number;
  username: string;
  name?: string;
  eventType: EventType;
  status: EventStatus;
  ipAddress: string;
  userAgent?: string;
  failureReason?: string;
  createdAt: string;
}

interface AuditLogPage {
  content: AuditLog[];
  totalElements: number;
  totalPages: number;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const EVENT_FILTER_OPTIONS: { label: string; value: string }[] = [
  { label: "All events", value: "ALL" },
  { label: "Login", value: "LOGIN" },
  { label: "Logout", value: "LOGOUT" },
  { label: "Failed login", value: "LOGIN_FAILED" },
];

const STATUS_FILTER_OPTIONS: { label: string; value: string }[] = [
  { label: "All status", value: "ALL" },
  { label: "Success", value: "SUCCESS" },
  { label: "Failure", value: "FAILURE" },
];

// ── Stat card ─────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <div className="bg-slate-50 rounded-xl p-4 flex items-center gap-4">
      <div
        className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}
      >
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-xs text-slate-500">{label}</p>
        <p className="text-2xl font-semibold">{value}</p>
      </div>
    </div>
  );
}

// ── Event badge ───────────────────────────────────────────────────────────────

function EventBadge({ type }: { type: EventType }) {
  const map: Record<
    EventType,
    { label: string; icon: React.ElementType; cls: string }
  > = {
    LOGIN: {
      label: "Login",
      icon: LogIn,
      cls: "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
    LOGOUT: {
      label: "Logout",
      icon: LogOut,
      cls: "bg-slate-100  text-slate-600   border-slate-200",
    },
    LOGIN_FAILED: {
      label: "Failed login",
      icon: ShieldAlert,
      cls: "bg-red-50     text-red-700     border-red-200",
    },
  };
  const { label, icon: Icon, cls } = map[type] ?? map.LOGIN;
  return (
    <Badge
      variant="outline"
      className={`text-[10px] font-medium px-2 gap-1 ${cls}`}
    >
      <Icon className="w-2.5 h-2.5 inline" />
      {label}
    </Badge>
  );
}

// ── Status badge ──────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: EventStatus }) {
  return status === "SUCCESS" ? (
    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
      Success
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-red-500">
      <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block" />
      Failure
    </span>
  );
}

// ── Format date ───────────────────────────────────────────────────────────────

function fmtDateTime(d?: string) {
  if (!d) return "—";
  try {
    return new Date(d).toLocaleString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  } catch {
    return d;
  }
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AdminAuditLogPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [eventFilter, setEventFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [exporting, setExporting] = useState(false);

  // ── Stats (derived from current page — backend can provide totals too) ──
  const [stats, setStats] = useState({
    totalLogins: 0,
    totalLogouts: 0,
    totalFailed: 0,
    uniqueUsers: 0,
  });

  // ── Fetch ─────────────────────────────────────────────────────────────────

  const fetchLogs = useCallback(
    async (pageNumber = page, size = pageSize) => {
      try {
        setLoading(true);
        setError("");

        const params = new URLSearchParams({
          page: String(pageNumber - 1),
          size: String(size),
          ...(search && { username: search }),
          ...(eventFilter !== "ALL" && { eventType: eventFilter }),
          ...(statusFilter !== "ALL" && { status: statusFilter }),
          ...(dateFrom && { from: dateFrom }),
          ...(dateTo && { to: dateTo }),
        });

        const res = await fetch(`${API}?${params}`, { headers: authHeaders() });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data: AuditLogPage = await res.json();
        setLogs(data.content ?? []);
        setTotalItems(data.totalElements ?? 0);
        setTotalPages(Math.max(1, data.totalPages ?? 1));
      } catch (err) {
        setLogs([]);
        setTotalItems(0);
        setTotalPages(1);
        setError(
          getUserFriendlyErrorMessage(err, "Unable to load audit logs."),
        );
      } finally {
        setLoading(false);
      }
    },
    [page, pageSize, search, eventFilter, statusFilter, dateFrom, dateTo],
  );

  // ── Fetch stats summary ───────────────────────────────────────────────────

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch(`${API}/stats`, { headers: authHeaders() });
      if (!res.ok) return;
      const data = await res.json();
      setStats(data);
    } catch {
      /* silently ignore */
    }
  }, []);

  useEffect(() => {
    fetchLogs(page, pageSize);
  }, [page, pageSize, search, eventFilter, statusFilter, dateFrom, dateTo]); // ← add all filters

  useEffect(() => {
    fetchStats();
  }, []);

  // ── CSV Export ────────────────────────────────────────────────────────────

  const handleExport = async () => {
    try {
      setExporting(true);
      const params = new URLSearchParams({
        ...(search && { username: search }),
        ...(eventFilter !== "ALL" && { eventType: eventFilter }),
        ...(statusFilter !== "ALL" && { status: statusFilter }),
        ...(dateFrom && { from: dateFrom }),
        ...(dateTo && { to: dateTo }),
      });
      const res = await fetch(`${API}/export?${params}`, {
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `audit-logs-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError("Failed to export. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  // ── Clear filters ─────────────────────────────────────────────────────────

  const hasActiveFilters =
    search ||
    eventFilter !== "ALL" ||
    statusFilter !== "ALL" ||
    dateFrom ||
    dateTo;

  const clearFilters = () => {
    setSearch("");
    setEventFilter("ALL");
    setStatusFilter("ALL");
    setDateFrom("");
    setDateTo("");
  };

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Audit Logs</h1>
          <p className="text-sm text-slate-500 mt-1">
            Monitor user login activity and authentication events
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="gap-2 h-9 text-sm"
            onClick={() => fetchLogs(page, pageSize)}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button
            variant="outline"
            className="gap-2 h-9 text-sm"
            onClick={handleExport}
            disabled={exporting}
          >
            <Download className="w-4 h-4" />
            {exporting ? "Exporting..." : "Export CSV"}
          </Button>
        </div>
      </div>

      {error && <InlineErrorAlert message={error} />}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          label="Total logins"
          value={stats.totalLogins}
          icon={LogIn}
          color="bg-emerald-50 text-emerald-600"
        />
        <StatCard
          label="Total logouts"
          value={stats.totalLogouts}
          icon={LogOut}
          color="bg-slate-100  text-slate-500"
        />
        <StatCard
          label="Failed attempts"
          value={stats.totalFailed}
          icon={ShieldAlert}
          color="bg-red-50    text-red-600"
        />
        <StatCard
          label="Unique users"
          value={stats.uniqueUsers}
          icon={Users}
          color="bg-blue-50   text-blue-600"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            className="pl-9 h-9"
            placeholder="Search by username..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoComplete="nope"
            type="search"
          />
        </div>

        {/* Event type */}
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Button
              variant="outline"
              className={`h-9 text-sm gap-1.5 ${eventFilter !== "ALL" ? "border-blue-500 text-blue-600" : ""}`}
            >
              {EVENT_FILTER_OPTIONS.find((o) => o.value === eventFilter)?.label}
              <ChevronDown className="w-3.5 h-3.5 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {EVENT_FILTER_OPTIONS.map((o) => (
              <DropdownMenuItem
                key={o.value}
                onClick={() => setEventFilter(o.value)}
              >
                {o.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Status */}
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Button
              variant="outline"
              className={`h-9 text-sm gap-1.5 ${statusFilter !== "ALL" ? "border-blue-500 text-blue-600" : ""}`}
            >
              {
                STATUS_FILTER_OPTIONS.find((o) => o.value === statusFilter)
                  ?.label
              }
              <ChevronDown className="w-3.5 h-3.5 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {STATUS_FILTER_OPTIONS.map((o) => (
              <DropdownMenuItem
                key={o.value}
                onClick={() => setStatusFilter(o.value)}
              >
                {o.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Date range */}
        <div className="flex items-center gap-2">
          <Input
            type="date"
            className="h-9 text-sm w-[140px]"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            title="From date"
          />
          <span className="text-slate-400 text-xs">to</span>
          <Input
            type="date"
            className="h-9 text-sm w-[140px]"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            title="To date"
          />
        </div>

        {/* Clear filters */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            className="h-9 text-sm text-slate-500 gap-1.5 hover:text-red-500"
            onClick={clearFilters}
          >
            <XCircle className="w-4 h-4" />
            Clear
          </Button>
        )}
      </div>

      {/* Table */}
      <Card className="border border-slate-200 shadow-sm overflow-hidden">
        <CardContent className="p-0">
          <div className="w-full overflow-hidden">
            <Table className="w-full table-fixed">
              <colgroup>
                <col className="w-[18%]" /> {/* User */}
                <col className="w-[15%]" /> {/* Event */}
                <col className="w-[11%]" /> {/* Status */}
                <col className="w-[14%]" /> {/* IP Address */}
                <col className="w-[24%]" /> {/* Reason / Agent */}
                <col className="w-[18%]" /> {/* Time */}
              </colgroup>
              <TableHeader>
                <TableRow className="bg-slate-50 hover:bg-slate-50">
                  <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wide pl-5">
                    User
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Event
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Status
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    IP Address
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Details
                  </TableHead>
                  <TableHead className="text-xs font-semibold text-slate-500 uppercase tracking-wide pr-5">
                    Time
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center py-14 text-slate-400 text-sm"
                    >
                      <Activity className="w-6 h-6 mx-auto mb-2 opacity-25 animate-pulse" />
                      Loading audit logs...
                    </TableCell>
                  </TableRow>
                ) : logs.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center py-14 text-slate-400 text-sm"
                    >
                      <Activity className="w-8 h-8 mx-auto mb-2 opacity-25" />
                      No audit logs found
                    </TableCell>
                  </TableRow>
                ) : (
                  logs.map((log) => (
                    <TableRow
                      key={log.id}
                      className={`border-b border-slate-100 hover:bg-slate-50/70 ${
                        log.eventType === "LOGIN_FAILED" ? "bg-red-50/30" : ""
                      }`}
                    >
                      {/* User */}
                      <TableCell className="pl-5 py-3.5">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                            <span className="text-[11px] font-semibold text-blue-700">
                              {(log.name ?? log.username)
                                .charAt(0)
                                .toUpperCase()}
                            </span>
                          </div>
                          <div className="min-w-0">
                            {log.name && (
                              <p className="text-xs font-medium text-slate-700 truncate">
                                {log.name}
                              </p>
                            )}
                            <p className="text-[11px] text-slate-400 truncate">
                              @{log.username}
                            </p>
                          </div>
                        </div>
                      </TableCell>

                      {/* Event */}
                      <TableCell className="py-3.5">
                        <EventBadge type={log.eventType} />
                      </TableCell>

                      {/* Status */}
                      <TableCell className="py-3.5">
                        <StatusBadge status={log.status} />
                      </TableCell>

                      {/* IP */}
                      <TableCell className="py-3.5">
                        <span className="text-xs font-mono text-slate-600 truncate block">
                          {log.ipAddress || "—"}
                        </span>
                      </TableCell>

                      {/* Details — failure reason or truncated user agent */}
                      <TableCell className="py-3.5">
                        {log.failureReason ? (
                          <span className="text-[11px] text-red-500 truncate block">
                            {log.failureReason}
                          </span>
                        ) : log.userAgent ? (
                          <span
                            className="text-[11px] text-slate-400 truncate block"
                            title={log.userAgent}
                          >
                            {parseUserAgent(log.userAgent)}
                          </span>
                        ) : (
                          <span className="text-slate-300 text-xs">—</span>
                        )}
                      </TableCell>

                      {/* Time */}
                      <TableCell className="py-3.5 pr-5 text-xs text-slate-400 whitespace-nowrap">
                        {fmtDateTime(log.createdAt)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <AdminPagination
        page={page}
        totalPages={totalPages}
        totalItems={totalItems}
        pageSize={pageSize}
        itemLabel="events"
        onPageChange={setPage}
        onPageSizeChange={(nextSize) => {
          setPage(1);
          setPageSize(nextSize);
        }}
      />
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function parseUserAgent(ua: string): string {
  if (!ua) return "—";
  if (/Chrome/i.test(ua)) return "Chrome";
  if (/Firefox/i.test(ua)) return "Firefox";
  if (/Safari/i.test(ua)) return "Safari";
  if (/Edge/i.test(ua)) return "Edge";
  if (/MSIE|Trident/i.test(ua)) return "Internet Explorer";
  return ua.slice(0, 40);
}
