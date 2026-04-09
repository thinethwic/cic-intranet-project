import {
  Users,
  FileText,
  Megaphone,
  Calendar,
  ChevronRight,
  Clock,
  TrendingUp,
  Video,
  Image,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// ── Stats ────────────────────────────────────────────────────
const stats = [
  {
    label: "Total Employees",
    value: "248",
    change: "+4 this month",
    icon: Users,
    iconBg: "bg-blue-50",
    iconColor: "text-blue-600",
    trend: true,
  },
  {
    label: "Documents",
    value: "1,340",
    change: "+12 this week",
    icon: FileText,
    iconBg: "bg-violet-50",
    iconColor: "text-violet-600",
    trend: true,
  },
  {
    label: "Announcements",
    value: "18",
    change: "3 active now",
    icon: Megaphone,
    iconBg: "bg-amber-50",
    iconColor: "text-amber-600",
    trend: false,
  },
];

// ── Upcoming Events ──────────────────────────────────────────
const upcomingEvents = [
  {
    title: "All Hands Meeting",
    date: "Apr",
    day: "15",
    time: "10:00 AM",
    tag: "Company",
    tagColor: "bg-blue-100 text-blue-700",
  },
  {
    title: "IT Security Workshop",
    date: "Apr",
    day: "18",
    time: "2:00 PM",
    tag: "IT",
    tagColor: "bg-teal-100 text-teal-700",
  },
  {
    title: "Q2 Planning Session",
    date: "Apr",
    day: "22",
    time: "9:00 AM",
    tag: "Management",
    tagColor: "bg-violet-100 text-violet-700",
  },
];

// ── Recent Documents ─────────────────────────────────────────
const recentDocs = [
  {
    name: "Q1 Financial Report 2026",
    type: "PDF",
    date: "Apr 8",
    dept: "Finance",
    typeColor: "bg-red-100 text-red-700",
  },
  {
    name: "HR Policy Update v3.2",
    type: "DOCX",
    date: "Apr 7",
    dept: "HR",
    typeColor: "bg-blue-100 text-blue-700",
  },
  {
    name: "IT Infrastructure Plan",
    type: "PDF",
    date: "Apr 5",
    dept: "IT",
    typeColor: "bg-red-100 text-red-700",
  },
];

// ── Quick Links ──────────────────────────────────────────────
const quickLinks = [
  {
    label: "Manage Documents",
    path: "/admin/documents",
    icon: FileText,
    iconBg: "bg-violet-50",
    iconColor: "text-violet-600",
  },
  {
    label: "Manage Videos",
    path: "/admin/videos",
    icon: Video,
    iconBg: "bg-teal-50",
    iconColor: "text-teal-600",
  },
  {
    label: "Manage Events",
    path: "/admin/events",
    icon: Calendar,
    iconBg: "bg-amber-50",
    iconColor: "text-amber-600",
  },
  {
    label: "Manage Gallery",
    path: "/admin/gallery",
    icon: Image,
    iconBg: "bg-pink-50",
    iconColor: "text-pink-600",
  },
  {
    label: "User Management",
    path: "/admin/management",
    icon: Users,
    iconBg: "bg-blue-50",
    iconColor: "text-blue-600",
  },
  {
    label: "Announcements",
    path: "/admin/announcements",
    icon: Megaphone,
    iconBg: "bg-orange-50",
    iconColor: "text-orange-600",
  },
];

// ── Component ────────────────────────────────────────────────
export default function AdminDashboard() {
  const now = new Date();
  const hour = now.getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="space-y-8">
      {/* ── Page Header ── */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <p className="text-sm text-slate-500 mb-0.5">{greeting}, Admin 👋</p>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
            Dashboard Overview
          </h1>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400 bg-white border border-slate-200 px-3 py-2 rounded-lg shadow-sm">
          <Clock className="w-3.5 h-3.5" />
          {now.toLocaleDateString("en-US", {
            weekday: "short",
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {stats.map((stat) => (
          <Card
            key={stat.label}
            className="border border-slate-100 shadow-sm hover:shadow-md transition-shadow"
          >
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-4">
                <div
                  className={`w-10 h-10 rounded-xl ${stat.iconBg} flex items-center justify-center`}
                >
                  <stat.icon className={`w-5 h-5 ${stat.iconColor}`} />
                </div>
                {stat.trend && (
                  <span className="flex items-center gap-1 text-[10px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                    <TrendingUp className="w-3 h-3" /> Up
                  </span>
                )}
              </div>
              <p className="text-3xl font-bold text-slate-800 leading-none mb-1">
                {stat.value}
              </p>
              <p className="text-sm font-medium text-slate-500 mb-1">
                {stat.label}
              </p>
              <p className="text-xs text-slate-400">{stat.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── Quick Links ── */}
      <div>
        <h2 className="text-sm font-semibold text-slate-600 mb-3 uppercase tracking-wide">
          Quick Actions
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {quickLinks.map((link) => (
            <a
              key={link.label}
              href={link.path}
              className="flex flex-col items-center gap-2 bg-white border border-slate-100 rounded-xl px-3 py-4 hover:shadow-md hover:border-slate-200 transition-all group text-center"
            >
              <div
                className={`w-10 h-10 rounded-xl ${link.iconBg} flex items-center justify-center`}
              >
                <link.icon className={`w-4.5 h-4.5 ${link.iconColor}`} />
              </div>
              <span className="text-[11px] font-medium text-slate-600 group-hover:text-slate-900 leading-tight">
                {link.label}
              </span>
            </a>
          ))}
        </div>
      </div>

      {/* ── Bottom Row ── */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Upcoming Events */}
        <Card className="border border-slate-100 shadow-sm">
          <CardHeader className="px-5 py-4 border-b border-slate-100 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-amber-500" />
              Upcoming Events
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-blue-600 h-auto py-1 px-2 hover:text-blue-700"
            >
              View all <ChevronRight className="w-3 h-3 ml-0.5" />
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            {upcomingEvents.map((event, i) => (
              <div
                key={i}
                className="flex items-center gap-4 px-5 py-3.5 border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                {/* Date block */}
                <div className="text-center shrink-0 w-9">
                  <p className="text-[10px] text-slate-400 leading-none uppercase">
                    {event.date}
                  </p>
                  <p className="text-xl font-bold text-slate-800 leading-tight">
                    {event.day}
                  </p>
                </div>

                {/* Divider */}
                <div className="w-px h-8 bg-slate-100 shrink-0" />

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-slate-700 truncate">
                    {event.title}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {event.time}
                  </p>
                </div>

                {/* Tag */}
                <span
                  className={`text-[10px] font-semibold px-2.5 py-1 rounded-full shrink-0 ${event.tagColor}`}
                >
                  {event.tag}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Documents */}
        <Card className="border border-slate-100 shadow-sm">
          <CardHeader className="px-5 py-4 border-b border-slate-100 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <FileText className="w-4 h-4 text-violet-500" />
              Recent Documents
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-blue-600 h-auto py-1 px-2 hover:text-blue-700"
            >
              View all <ChevronRight className="w-3 h-3 ml-0.5" />
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            {recentDocs.map((doc, i) => (
              <div
                key={i}
                className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                {/* Icon */}
                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                  <FileText className="w-3.5 h-3.5 text-slate-500" />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-slate-700 truncate">
                    {doc.name}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {doc.dept} · {doc.date}
                  </p>
                </div>

                {/* Type badge */}
                <span
                  className={`text-[10px] font-semibold px-2.5 py-1 rounded-full shrink-0 ${doc.typeColor}`}
                >
                  {doc.type}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
