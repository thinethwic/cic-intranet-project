import {
  Users,
  FileText,
  Megaphone,
  Calendar,
  Clock,
  TrendingUp,
  Video,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";

// ✅ Import your mock data
import { newsList, HotnewsList, members, events, videos } from "@/Mock-data";

// ── Dynamic Stats ─────────────────────────────────────────────
const stats = [
  {
    label: "News",
    value: newsList.length,
    change: `${HotnewsList.length} hot news`,
    icon: Megaphone,
    iconBg: "bg-amber-50",
    iconColor: "text-amber-600",
    trend: true,
  },
  {
    label: "Videos",
    value: videos.length,
    change: "From social media",
    icon: Video,
    iconBg: "bg-teal-50",
    iconColor: "text-teal-600",
    trend: true,
  },
  {
    label: "Events",
    value: events.length,
    change: "Upcoming events",
    icon: Calendar,
    iconBg: "bg-blue-50",
    iconColor: "text-blue-600",
    trend: false,
  },
  {
    label: "Management",
    value: members.length,
    change: "Team members",
    icon: Users,
    iconBg: "bg-violet-50",
    iconColor: "text-violet-600",
    trend: true,
  },
];

// ── Quick Links ──────────────────────────────────────────────
const quickLinks = [
  { label: "Manage Documents", path: "/admin/documents", icon: FileText },
  { label: "Manage Videos", path: "/admin/videos", icon: Video },
  { label: "Manage Events", path: "/admin/events", icon: Calendar },
  { label: "Manage Gallery", path: "/admin/gallery", icon: FileText },
  { label: "Management", path: "/admin/management", icon: Users },
  { label: "News", path: "/admin/news", icon: Megaphone },
];

// ── Component ────────────────────────────────────────────────
export default function AdminDashboard() {
  const now = new Date();
  const hour = now.getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between flex-wrap gap-3">
        <div>
          <p className="text-sm text-slate-500">{greeting}, Admin 👋</p>
          <h1 className="text-2xl font-bold">Dashboard Overview</h1>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400 bg-white border px-3 py-2 rounded-lg">
          <Clock className="w-3 h-3" />
          {now.toDateString()}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-5">
              <div className="flex justify-between mb-3">
                <div className={`p-2 rounded ${stat.iconBg}`}>
                  <stat.icon className={stat.iconColor} />
                </div>

                {stat.trend && (
                  <span className="text-xs text-green-600 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" /> Up
                  </span>
                )}
              </div>

              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-sm text-gray-500">{stat.label}</p>
              <p className="text-xs text-gray-400">{stat.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Links */}
      <div>
        <h2 className="text-sm font-semibold mb-3">Quick Actions</h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {quickLinks.map((link) => (
            <Link
              key={link.label}
              to={link.path}
              className="flex flex-col items-center gap-2 border rounded-xl p-3 hover:shadow-md"
            >
              <link.icon className="w-5 h-5" />
              <span className="text-xs text-center">{link.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Bottom Sections */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Events */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle>Upcoming Events</CardTitle>
            <span className="text-xs text-gray-400 bg-slate-100 px-2 py-0.5 rounded-full">
              {events.length} items
            </span>
          </CardHeader>

          {/* In your Card's CardContent, replace with: */}
          <CardContent className="p-0">
            <div
              className="flex flex-col gap-0 overflow-y-auto"
              style={{ maxHeight: "260px" }}
            >
              {events.map((event, i) => {
                const date = new Date(event.date);
                return (
                  <div
                    key={i}
                    className="flex gap-3 items-center px-4 py-3 border-b last:border-b-0"
                  >
                    <div className="text-center w-10 bg-slate-50 rounded-md py-1 flex-shrink-0">
                      <p className="text-xs text-slate-400 uppercase tracking-wide">
                        {date.toLocaleString("default", { month: "short" })}
                      </p>
                      <p className="font-bold text-base leading-tight">
                        {date.getDate()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">{event.title}</p>
                      <p className="text-xs text-gray-400">
                        {event.time} · {event.location}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* News */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Latest News</CardTitle>
            <span className="text-xs text-gray-400 bg-slate-100 px-2 py-0.5 rounded-full">
              {newsList.length} items
            </span>
          </CardHeader>

          <CardContent className="p-0">
            <div
              className="flex flex-col overflow-y-auto"
              style={{ maxHeight: "260px" }}
            >
              {newsList.map((news, i) => (
                <div
                  key={i}
                  className="flex gap-3 items-start px-4 py-3 border-b last:border-b-0"
                >
                  <img
                    src={news.image}
                    className="w-11 h-11 rounded-md object-cover flex-shrink-0"
                  />
                  <div>
                    <p className="text-sm font-medium line-clamp-2 leading-snug">
                      {news.title}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Videos */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Recent Videos</CardTitle>
            <span className="text-xs text-gray-400 bg-slate-100 px-2 py-0.5 rounded-full">
              {videos.length} videos
            </span>
          </CardHeader>

          <CardContent className="p-0">
            <div
              className="flex flex-col overflow-y-auto"
              style={{ maxHeight: "260px" }}
            >
              {videos.map((video, i) => (
                <div
                  key={i}
                  className="flex gap-3 items-center px-4 py-3 border-b last:border-b-0"
                >
                  <div className="w-14 h-9 bg-slate-100 rounded-md flex-shrink-0 flex items-center justify-center">
                    <Video className="w-4 h-4 text-slate-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium line-clamp-2 leading-snug">
                      {video.title}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
