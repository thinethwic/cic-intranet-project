import { useMemo, useRef, useState, useCallback } from "react";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { BarChart2, Download, FileText, Printer, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import type { Ticket } from "@/types";

// ── Types ────────────────────────────────────────────────────────────────────

interface ReportDialogProps {
  open: boolean;
  onClose: () => void;
  tickets: Ticket[];
  adminName?: string;
  logoUrl?: string; // ← add this
}

type GroupBy = "status" | "priority" | "category" | "department" | "segment";

// ── Constants ─────────────────────────────────────────────────────────────────

const PRESET_RANGES = [
  { label: "Last 7 days", days: 7 },
  { label: "Last 30 days", days: 30 },
  { label: "Last 90 days", days: 90 },
  { label: "All time", days: 0 },
] as const;

const GROUP_OPTIONS: { value: GroupBy; label: string }[] = [
  { value: "status", label: "Status" },
  { value: "priority", label: "Priority" },
  { value: "category", label: "Category" },
  { value: "department", label: "Department" },
  { value: "segment", label: "Segment" },
];

// Colour palettes for charts
const CHART_COLORS: Record<string, string> = {
  // status
  OPEN: "#3b82f6",
  IN_PROGRESS: "#f59e0b",
  RESOLVED: "#10b981",
  UNRESOLVED: "#94a3b8",
  // priority
  LOW: "#94a3b8",
  MEDIUM: "#3b82f6",
  HIGH: "#f59e0b",
  CRITICAL: "#ef4444",
};

const FALLBACK_COLORS = [
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#8b5cf6",
  "#ef4444",
  "#06b6d4",
  "#ec4899",
  "#84cc16",
];

const colorFor = (key: string, idx: number) =>
  CHART_COLORS[key] ?? FALLBACK_COLORS[idx % FALLBACK_COLORS.length];

// ── Helpers ───────────────────────────────────────────────────────────────────

const fmtDate = (d: Date) =>
  d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

const groupTickets = (tickets: Ticket[], by: GroupBy) => {
  const counts: Record<string, number> = {};
  for (const t of tickets) {
    const key =
      by === "status"
        ? t.status
        : by === "priority"
          ? t.priority
          : by === "category"
            ? (t.category ?? "Unknown")
            : by === "department"
              ? (t.department ?? "Unknown")
              : (t.segment ?? "Unknown");
    counts[key] = (counts[key] ?? 0) + 1;
  }
  return Object.entries(counts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
};

// Bucket tickets into daily counts over a date range
const dailyTimeline = (tickets: Ticket[], from: Date, to: Date) => {
  const map: Record<string, number> = {};
  const cursor = new Date(from);
  while (cursor <= to) {
    map[cursor.toISOString().slice(0, 10)] = 0;
    cursor.setDate(cursor.getDate() + 1);
  }
  for (const t of tickets) {
    const day = t.createdAt.slice(0, 10);
    if (day in map) map[day] = (map[day] ?? 0) + 1;
  }
  return Object.entries(map).map(([date, count]) => ({
    date: new Date(date).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
    }),
    count,
  }));
};

// ── Summary stat helpers ──────────────────────────────────────────────────────

const avgResolutionDays = (tickets: Ticket[]) => {
  const resolved = tickets.filter(
    (t) => t.status === "RESOLVED" && t.updatedAt,
  );
  if (!resolved.length) return null;
  const total = resolved.reduce(
    (sum, t) =>
      sum + (new Date(t.updatedAt).getTime() - new Date(t.createdAt).getTime()),
    0,
  );
  return (total / resolved.length / 86_400_000).toFixed(1);
};

// ── Sub-components ────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  sub,
  color,
}: {
  label: string;
  value: string | number;
  sub?: string;
  color: string;
}) {
  return (
    <div className="rounded-xl bg-slate-50 p-4 flex flex-col gap-1">
      <p className="text-xs text-slate-500">{label}</p>
      <p className={`text-2xl font-semibold ${color}`}>{value}</p>
      {sub && <p className="text-[11px] text-slate-400">{sub}</p>}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function ReportDialog({
  open,
  onClose,
  tickets,
  adminName,
  logoUrl, // ← add this
}: ReportDialogProps) {
  const printRef = useRef<HTMLDivElement>(null);
  const [rangeDays, setRangeDays] = useState<number>(30);
  const [groupBy, setGroupBy] = useState<GroupBy>("status");
  const [printing, setPrinting] = useState(false);

  // ── Date range ───────────────────────────────────────────────────────────
  const { from, to, rangeLabel, inRange } = useMemo(() => {
    const to = new Date();
    const from =
      rangeDays === 0
        ? new Date(
            Math.min(...tickets.map((t) => new Date(t.createdAt).getTime())) ||
              Date.now(),
          )
        : new Date(Date.now() - rangeDays * 86_400_000);
    return {
      from,
      to,
      rangeLabel:
        rangeDays === 0 ? "All time" : `${fmtDate(from)} – ${fmtDate(to)}`,
      inRange: (t: Ticket) => {
        const d = new Date(t.createdAt).getTime();
        return d >= from.getTime() && d <= to.getTime();
      },
    };
  }, [rangeDays, tickets]);

  // ── Filtered tickets ─────────────────────────────────────────────────────
  const rangeTickets = useMemo(
    () => tickets.filter(inRange),
    [tickets, inRange],
  );

  // ── KPIs ─────────────────────────────────────────────────────────────────
  const kpis = useMemo(() => {
    const total = rangeTickets.length;
    const open = rangeTickets.filter((t) => t.status === "OPEN").length;
    const inProgress = rangeTickets.filter(
      (t) => t.status === "IN_PROGRESS",
    ).length;
    const resolved = rangeTickets.filter((t) => t.status === "RESOLVED").length;
    const critical = rangeTickets.filter(
      (t) => t.priority === "CRITICAL",
    ).length;
    const resolutionRate = total ? Math.round((resolved / total) * 100) : 0;
    const avgDays = avgResolutionDays(rangeTickets);
    return {
      total,
      open,
      inProgress,
      resolved,
      critical,
      resolutionRate,
      avgDays,
    };
  }, [rangeTickets]);

  // ── Chart data ────────────────────────────────────────────────────────────
  const groupData = useMemo(
    () => groupTickets(rangeTickets, groupBy),
    [rangeTickets, groupBy],
  );

  const timeline = useMemo(
    () => dailyTimeline(rangeTickets, from, to),
    [rangeTickets, from, to],
  );

  // Only show timeline when it won't be too noisy (≤ 90 days)
  const showTimeline = rangeDays > 0 && rangeDays <= 90;

  // ── Export ────────────────────────────────────────────────────────────────
  const exportCSV = () => {
    const headers = [
      "Ticket #",
      "Title",
      "Status",
      "Priority",
      "Category",
      "Department",
      "Segment",
      "Submitted By",
      "Assigned To",
      "Created At",
      "Updated At",
    ];
    const rows = rangeTickets.map((t) => [
      t.ticketNumber,
      `"${t.title.replace(/"/g, '""')}"`,
      t.status,
      t.priority,
      t.category ?? "",
      t.department ?? "",
      t.segment ?? "",
      t.submittedBy.name,
      t.assignedTo?.name ?? "",
      t.createdAt,
      t.updatedAt,
    ]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ticket-report-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const printReport = useCallback(async () => {
    if (printing) return;

    try {
      setPrinting(true);

      // ── Group breakdown rows ────────────────────────────────────────────
      const maxGroupVal = Math.max(...groupData.map((d) => d.value), 1);
      const groupRows = groupData
        .map((d, i) => {
          const barPct = Math.round((d.value / maxGroupVal) * 100);
          const tickPct = kpis.total
            ? Math.round((d.value / kpis.total) * 100)
            : 0;
          const color = colorFor(d.name, i);
          return `
        <tr>
          <td class="td-label">${d.name}</td>
          <td class="td-bar">
            <div class="bar-track">
              <div class="bar-fill" style="width:${barPct}%;background:${color}"></div>
            </div>
          </td>
          <td class="td-num">${d.value}</td>
          <td class="td-pct">${tickPct}%</td>
        </tr>`;
        })
        .join("");

      // ── Status pill rows ────────────────────────────────────────────────
      const STATUS_LIST = [
        "OPEN",
        "IN_PROGRESS",
        "RESOLVED",
        "UNRESOLVED",
      ] as const;
      const statusPills = STATUS_LIST.map((s) => {
        const count = rangeTickets.filter((t) => t.status === s).length;
        const pct = kpis.total ? Math.round((count / kpis.total) * 100) : 0;
        const color = colorFor(s, 0);
        const label = s === "IN_PROGRESS" ? "In Progress" : s;
        return `
        <div class="pill">
          <span class="dot" style="background:${color}"></span>
          <span class="pill-label">${label}</span>
          <span class="pill-count">${count}</span>
          <span class="pill-pct">(${pct}%)</span>
        </div>`;
      }).join("");

      // ── Ticket table rows ───────────────────────────────────────────────
      const ticketRows = rangeTickets
        .slice()
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        )
        .map((t) => {
          const sc = colorFor(t.status, 0);
          const pc = colorFor(t.priority, 0);
          const statusLabel =
            t.status === "IN_PROGRESS" ? "In Progress" : t.status;
          const created = new Date(t.createdAt).toLocaleDateString("en-GB", {
            day: "numeric",
            month: "short",
            year: "numeric",
          });
          return `
          <tr>
            <td style="padding:7px 10px">
              <div style="font-family:monospace;font-size:9px;color:#94a3b8;margin-bottom:2px">${t.ticketNumber}</div>
              <div style="font-size:11px;color:#1e293b;font-weight:500;max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${t.title}</div>
            </td>
            <td style="padding:7px 10px">
              <span class="badge" style="border-color:${sc}55;color:${sc};background:${sc}15">${statusLabel}</span>
            </td>
            <td style="padding:7px 10px">
              <span class="badge" style="border-color:${pc}55;color:${pc};background:${pc}15">${t.priority}</span>
            </td>
            <td style="padding:7px 10px;font-size:11px;color:#475569">${t.category ?? "—"}</td>
            <td style="padding:7px 10px;font-size:11px;color:#475569">${t.department ?? "—"}</td>
            <td style="padding:7px 10px;font-size:11px;color:#475569">${t.submittedBy.name}</td>
            <td style="padding:7px 10px;font-size:11px;color:#64748b">${created}</td>
          </tr>`;
        })
        .join("");

      // ── Logo HTML ───────────────────────────────────────────────────────
      const logoHtml = logoUrl
        ? `<img src="${logoUrl}" alt="Company logo" style="height:55px;max-width:140px;object-fit:contain;display:block" />`
        : `<span style="font-size:18px;font-weight:800;color:#fff;letter-spacing:-0.5px">${adminName ?? "Report"}</span>`;

      // ── Full HTML document ──────────────────────────────────────────────
      const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <title>Ticket Report – ${rangeLabel}</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
      color: #1e293b;
      background: #fff;
      font-size: 12px;
      line-height: 1.5;
    }

    /* ── Corporate header bar ── */
    .header {
      background: #1e3a5f;
      padding: 18px 32px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .header-right {
      text-align: right;
    }
    .header-right .report-title {
      font-size: 16px;
      font-weight: 700;
      color: #fff;
    }
    .header-right .report-range {
      font-size: 11px;
      color: #93c5fd;
      margin-top: 2px;
    }

    /* ── Page body ── */
    .body { padding: 24px 32px 32px; }

    /* ── Section divider ── */
    .section-title {
      font-size: 9px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: #94a3b8;
      margin-bottom: 10px;
      padding-bottom: 5px;
      border-bottom: 1px solid #e2e8f0;
    }
    .section { margin-bottom: 22px; }

    /* ── KPI grid ── */
    .kpis {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 10px;
      margin-bottom: 22px;
    }
    .kpi {
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 14px 16px;
      border-top: 3px solid #1e3a5f;
    }
    .kpi-label { font-size: 9px; color: #64748b; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 6px; }
    .kpi-value { font-size: 26px; font-weight: 800; line-height: 1; }
    .kpi-sub   { font-size: 9px; color: #94a3b8; margin-top: 4px; }

    /* ── Status pills ── */
    .pills { display: flex; flex-wrap: wrap; gap: 8px; }
    .pill {
      display: flex; align-items: center; gap: 6px;
      padding: 5px 12px;
      border: 1px solid #e2e8f0;
      border-radius: 20px;
      background: #f8fafc;
    }
    .dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; flex-shrink: 0; }
    .pill-label { font-size: 11px; color: #475569; }
    .pill-count { font-size: 11px; font-weight: 700; color: #1e293b; }
    .pill-pct   { font-size: 10px; color: #94a3b8; }

    /* ── Breakdown bars ── */
    .bar-track { background: #f1f5f9; border-radius: 4px; height: 12px; overflow: hidden; width: 200px; }
    .bar-fill  { height: 100%; border-radius: 4px; }
    .td-label  { padding: 5px 8px; font-size: 11px; color: #475569; width: 130px; font-weight: 500; }
    .td-bar    { padding: 5px 8px; }
    .td-num    { padding: 5px 8px; font-size: 11px; font-weight: 700; color: #1e293b; width: 40px; }
    .td-pct    { padding: 5px 8px; font-size: 10px; color: #94a3b8; width: 45px; }

    /* ── Ticket table ── */
    .ticket-table { width: 100%; border-collapse: collapse; }
    .ticket-table thead tr { background: #f8fafc; border-top: 2px solid #1e3a5f; }
    .ticket-table th {
      text-align: left;
      font-size: 9px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.07em;
      color: #64748b;
      padding: 8px 10px;
      border-bottom: 1px solid #e2e8f0;
    }
    .ticket-table tbody tr { border-bottom: 1px solid #f1f5f9; }
    .ticket-table tbody tr:last-child { border-bottom: none; }
    .ticket-table tbody tr:nth-child(even) { background: #fafbfc; }

    .badge {
      display: inline-block;
      font-size: 9px;
      font-weight: 600;
      padding: 2px 7px;
      border-radius: 4px;
      border: 1px solid;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    /* ── Footer ── */
    .footer {
      border-top: 1px solid #e2e8f0;
      margin-top: 24px;
      padding-top: 12px;
      display: flex;
      justify-content: space-between;
      font-size: 9px;
      color: #94a3b8;
    }

    /* ── Print overrides ── */
    @media print {
      body { font-size: 11px; }
      .header { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .kpi { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .bar-fill { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .dot { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .badge { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .ticket-table thead tr { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .ticket-table tbody tr:nth-child(even) { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    }
  </style>
</head>
<body>

  <!-- Corporate header bar -->
  <div class="header">
    ${logoHtml}
    <div class="header-right">
      <div class="report-title">Ticket Report</div>
      <div class="report-range">${rangeLabel}</div>
    </div>
  </div>

  <div class="body">

    <!-- KPI cards -->
    <div class="kpis">
      <div class="kpi">
        <div class="kpi-label">Total Tickets</div>
        <div class="kpi-value" style="color:#1e293b">${kpis.total}</div>
      </div>
      <div class="kpi">
        <div class="kpi-label">Resolution Rate</div>
        <div class="kpi-value" style="color:#10b981">${kpis.resolutionRate}%</div>
        <div class="kpi-sub">${kpis.resolved} resolved</div>
      </div>
      <div class="kpi">
        <div class="kpi-label">Avg. Resolution</div>
        <div class="kpi-value" style="color:#3b82f6">${kpis.avgDays ? `${kpis.avgDays}d` : "—"}</div>
        <div class="kpi-sub">days to close</div>
      </div>
      <div class="kpi">
        <div class="kpi-label">Critical Tickets</div>
        <div class="kpi-value" style="color:#ef4444">${kpis.critical}</div>
        <div class="kpi-sub">${kpis.open} still open</div>
      </div>
    </div>

    <!-- Status breakdown -->
    <div class="section">
      <div class="section-title">Status Breakdown</div>
      <div class="pills">${statusPills}</div>
    </div>

    <!-- Group breakdown chart -->
    <div class="section">
      <div class="section-title">Breakdown by ${groupBy.charAt(0).toUpperCase() + groupBy.slice(1)}</div>
      <table><tbody>${groupRows}</tbody></table>
    </div>

    <!-- Ticket list -->
    <div class="section">
      <div class="section-title">
        Ticket List
        <span style="font-weight:400;text-transform:none;letter-spacing:0;color:#cbd5e1;margin-left:6px">
          ${rangeTickets.length} ticket${rangeTickets.length !== 1 ? "s" : ""}
        </span>
      </div>
      <table class="ticket-table">
        <thead>
          <tr>
            ${[
              "Ticket",
              "Status",
              "Priority",
              "Category",
              "Dept.",
              "Submitted By",
              "Created",
            ]
              .map((h) => `<th>${h}</th>`)
              .join("")}
          </tr>
        </thead>
        <tbody>${ticketRows}</tbody>
      </table>
    </div>

    <!-- Footer -->
    <div class="footer">
      <span>Generated ${new Date().toLocaleString("en-GB")}${adminName ? ` by ${adminName}` : ""}</span>
      <span>Confidential</span>
    </div>

  </div>

  <script>window.onload = () => { window.print(); }</script>
</body>
</html>`;

      const win = window.open("", "_blank");
      if (!win) {
        alert(
          "Pop-up blocked — please allow pop-ups for this site and try again.",
        );
        return;
      }
      win.document.write(html);
      win.document.close();
    } catch (err) {
      console.error("PDF export failed", err);
    } finally {
      setPrinting(false);
    }
  }, [
    printing,
    rangeLabel,
    groupData,
    kpis,
    rangeTickets,
    adminName,
    groupBy,
    logoUrl,
  ]);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="flex max-h-[92vh] flex-col gap-0 p-0 sm:max-w-4xl overflow-hidden [&>button:last-child]:hidden">
        {/* ── Header ── */}
        <DialogHeader className="shrink-0 border-b border-slate-100 px-6 py-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50">
                <BarChart2 className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <DialogTitle className="text-base">Ticket Report</DialogTitle>
                <p className="text-xs text-slate-400 mt-0.5">{rangeLabel}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Date range pills */}
              <div className="hidden sm:flex items-center gap-1 rounded-lg border border-slate-200 p-1">
                {PRESET_RANGES.map((r) => (
                  <button
                    key={r.days}
                    type="button"
                    onClick={() => setRangeDays(r.days)}
                    className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                      rangeDays === r.days
                        ? "bg-blue-600 text-white"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>

              {/* Export menu */}
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 gap-1.5 text-xs"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Export
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={exportCSV}
                    className="gap-2 text-sm cursor-pointer"
                  >
                    <FileText className="h-3.5 w-3.5" />
                    Download CSV
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={printReport}
                    className="gap-2 text-sm cursor-pointer"
                  >
                    <Printer className="h-3.5 w-3.5" />
                    Print / Save PDF
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Explicit close button */}
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 shrink-0"
                onClick={onClose}
                aria-label="Close report"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        {/* ── Scrollable body ── */}
        <div
          ref={printRef}
          className="flex-1 overflow-y-auto px-6 py-5 space-y-6 print:overflow-visible"
        >
          {/* Mobile range picker */}
          <div className="flex sm:hidden items-center gap-1 rounded-lg border border-slate-200 p-1 w-full">
            {PRESET_RANGES.map((r) => (
              <button
                key={r.days}
                type="button"
                onClick={() => setRangeDays(r.days)}
                className={`flex-1 rounded-md py-1 text-xs font-medium transition-colors ${
                  rangeDays === r.days
                    ? "bg-blue-600 text-white"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>

          {/* ── KPI cards ── */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatCard
              label="Total tickets"
              value={kpis.total}
              color="text-slate-800"
            />
            <StatCard
              label="Resolution rate"
              value={`${kpis.resolutionRate}%`}
              sub={`${kpis.resolved} resolved`}
              color="text-emerald-600"
            />
            <StatCard
              label="Avg. resolution"
              value={kpis.avgDays ? `${kpis.avgDays}d` : "—"}
              sub="days to close"
              color="text-blue-600"
            />
            <StatCard
              label="Critical tickets"
              value={kpis.critical}
              sub={`${kpis.open} still open`}
              color="text-red-600"
            />
          </div>

          {/* ── Status breakdown row ── */}
          <div className="flex flex-wrap gap-3">
            {(["OPEN", "IN_PROGRESS", "RESOLVED", "UNRESOLVED"] as const).map(
              (s) => {
                const count = rangeTickets.filter((t) => t.status === s).length;
                const pct = kpis.total
                  ? Math.round((count / kpis.total) * 100)
                  : 0;
                return (
                  <div
                    key={s}
                    className="flex items-center gap-2 rounded-lg border border-slate-100 bg-white px-3 py-2"
                  >
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ background: colorFor(s, 0) }}
                    />
                    <span className="text-xs text-slate-500">
                      {s === "IN_PROGRESS" ? "In Progress" : s}
                    </span>
                    <span className="text-xs font-medium text-slate-800">
                      {count}
                    </span>
                    <span className="text-[10px] text-slate-400">({pct}%)</span>
                  </div>
                );
              },
            )}
          </div>

          {/* ── Charts ── */}
          <div
            className={`grid gap-5 ${showTimeline ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1"}`}
          >
            {/* Group-by bar/pie chart */}
            <div className="rounded-xl border border-slate-100 bg-white p-4 space-y-3 min-w-0">
              <div className="flex flex-col gap-2">
                <Label className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Breakdown
                </Label>
                {/* Group-by toggle — wraps on narrow panels */}
                <div className="flex flex-wrap items-center gap-1">
                  {GROUP_OPTIONS.map((g) => (
                    <button
                      key={g.value}
                      type="button"
                      onClick={() => setGroupBy(g.value)}
                      className={`rounded-md px-3 py-1.5 text-[11px] font-medium transition-colors border ${
                        groupBy === g.value
                          ? "bg-blue-600 text-white border-blue-600"
                          : "text-slate-500 border-slate-200 hover:border-slate-300 hover:text-slate-700 bg-white"
                      }`}
                    >
                      {g.label}
                    </button>
                  ))}
                </div>
              </div>

              {groupData.length === 0 ? (
                <p className="py-10 text-center text-sm text-slate-400">
                  No data for this range
                </p>
              ) : groupData.length <= 5 ? (
                // Pie chart for ≤ 5 groups
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={groupData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={90}
                      paddingAngle={3}
                      dataKey="value"
                      label={false}
                      labelLine={false}
                    >
                      {groupData.map((entry, i) => (
                        <Cell key={entry.name} fill={colorFor(entry.name, i)} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(v) => [v ?? 0, "tickets"] as [number, string]}
                      contentStyle={{
                        fontSize: 12,
                        borderRadius: 8,
                        border: "0.5px solid #e2e8f0",
                      }}
                    />
                    <Legend
                      iconType="circle"
                      iconSize={8}
                      wrapperStyle={{ fontSize: 12 }}
                      formatter={(value) => {
                        const entry = groupData.find((d) => d.name === value);
                        const pct =
                          entry && kpis.total
                            ? Math.round((entry.value / kpis.total) * 100)
                            : 0;
                        return `${value}  ${entry?.value ?? 0} (${pct}%)`;
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                // Horizontal bar chart for > 5 groups
                <ResponsiveContainer
                  width="100%"
                  height={Math.max(200, groupData.length * 36)}
                >
                  <BarChart
                    data={groupData}
                    layout="vertical"
                    margin={{ left: 16, right: 24, top: 4, bottom: 4 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      horizontal={false}
                      stroke="#f1f5f9"
                    />
                    <XAxis type="number" tick={{ fontSize: 11 }} />
                    <YAxis
                      type="category"
                      dataKey="name"
                      width={90}
                      tick={{ fontSize: 11 }}
                    />
                    <Tooltip
                      formatter={(v) => [v ?? 0, "tickets"] as [number, string]}
                      contentStyle={{
                        fontSize: 12,
                        borderRadius: 8,
                        border: "0.5px solid #e2e8f0",
                      }}
                    />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                      {groupData.map((entry, i) => (
                        <Cell key={entry.name} fill={colorFor(entry.name, i)} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Timeline chart — only for 7/30/90 day ranges */}
            {showTimeline && (
              <div className="rounded-xl border border-slate-100 bg-white p-4 space-y-3 min-w-0">
                <Label className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Volume over time
                </Label>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart
                    data={timeline}
                    margin={{ left: 0, right: 16, top: 4, bottom: 4 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#f1f5f9"
                    />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 10 }}
                      interval={rangeDays === 7 ? 0 : rangeDays === 30 ? 4 : 9}
                      padding={{ right: 4 }}
                    />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                    <Tooltip
                      formatter={(v) => [v ?? 0, "tickets"] as [number, string]}
                      contentStyle={{
                        fontSize: 12,
                        borderRadius: 8,
                        border: "0.5px solid #e2e8f0",
                      }}
                    />
                    <Bar
                      dataKey="count"
                      fill="#3b82f6"
                      radius={[4, 4, 0, 0]}
                      maxBarSize={32}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* ── Summary table ── */}
          <div className="rounded-xl border border-slate-100 bg-white overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
              <Label className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Ticket list
              </Label>
              <span className="text-xs text-slate-400">
                {rangeTickets.length} ticket
                {rangeTickets.length !== 1 ? "s" : ""}
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-slate-50">
                    {[
                      "Ticket",
                      "Status",
                      "Priority",
                      "Category",
                      "Dept.",
                      "Submitted by",
                      "Created",
                    ].map((h) => (
                      <th
                        key={h}
                        className="px-4 py-2.5 text-left font-semibold uppercase tracking-wide text-slate-400"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rangeTickets.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="py-10 text-center text-slate-400"
                      >
                        No tickets in this range
                      </td>
                    </tr>
                  ) : (
                    rangeTickets
                      .slice()
                      .sort(
                        (a, b) =>
                          new Date(b.createdAt).getTime() -
                          new Date(a.createdAt).getTime(),
                      )
                      .map((t) => (
                        <tr
                          key={t.id}
                          className="border-t border-slate-50 hover:bg-slate-50/60"
                        >
                          <td className="px-4 py-2.5">
                            <span className="font-mono text-[10px] text-slate-400 block">
                              {t.ticketNumber}
                            </span>
                            <span className="text-slate-700 font-medium truncate block max-w-[180px]">
                              {t.title}
                            </span>
                          </td>
                          <td className="px-4 py-2.5">
                            <Badge
                              variant="outline"
                              className="text-[10px] px-1.5"
                              style={{
                                borderColor: `${colorFor(t.status, 0)}44`,
                                color: colorFor(t.status, 0),
                                background: `${colorFor(t.status, 0)}12`,
                              }}
                            >
                              {t.status === "IN_PROGRESS"
                                ? "In Progress"
                                : t.status}
                            </Badge>
                          </td>
                          <td className="px-4 py-2.5">
                            <Badge
                              variant="outline"
                              className="text-[10px] px-1.5"
                              style={{
                                borderColor: `${colorFor(t.priority, 0)}44`,
                                color: colorFor(t.priority, 0),
                                background: `${colorFor(t.priority, 0)}12`,
                              }}
                            >
                              {t.priority}
                            </Badge>
                          </td>
                          <td className="px-4 py-2.5 text-slate-600">
                            {t.category ?? "—"}
                          </td>
                          <td className="px-4 py-2.5 text-slate-600">
                            {t.department ?? "—"}
                          </td>
                          <td className="px-4 py-2.5 text-slate-600">
                            {t.submittedBy.name}
                          </td>
                          <td className="px-4 py-2.5 text-slate-400">
                            {new Date(t.createdAt).toLocaleDateString("en-GB", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </td>
                        </tr>
                      ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* ── Print footer ── */}
          <div className="hidden print:block text-xs text-slate-400 pt-4 border-t border-slate-200">
            Generated {new Date().toLocaleString("en-GB")}
            {adminName ? ` by ${adminName}` : ""}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
