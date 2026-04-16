import {
  Calendar,
  Clock,
  FileText,
  Image,
  Megaphone,
  Newspaper,
  Plus,
  Users,
  Video,
} from "lucide-react";
import { Link } from "react-router-dom";

import { CardContent } from "@/components/ui/card";
import { newsList, members, events, videos, documents } from "@/Mock-data";

import {
  AdminCard,
  AdminCardTitle,
  AdminSectionHeader,
  StatCard,
  StatusBadge,
} from "./admin-components";

const quickLinks = [
  {
    label: "Create News",
    description: "Publish a company update",
    path: "/admin/news",
    icon: Newspaper,
    tone: "bg-blue-50 text-blue-600",
  },
  {
    label: "Upload Document",
    description: "Add files for segments",
    path: "/admin/documents",
    icon: FileText,
    tone: "bg-emerald-50 text-emerald-600",
  },
  {
    label: "Add Video",
    description: "Share media content",
    path: "/admin/videos",
    icon: Video,
    tone: "bg-violet-50 text-violet-600",
  },
  {
    label: "Schedule Event",
    description: "Create an upcoming event",
    path: "/admin/events",
    icon: Calendar,
    tone: "bg-amber-50 text-amber-600",
  },
  {
    label: "Manage Gallery",
    description: "Curate visual content",
    path: "/admin/gallery",
    icon: Image,
    tone: "bg-rose-50 text-rose-600",
  },
  {
    label: "Management",
    description: "Update leadership profiles",
    path: "/admin/management",
    icon: Users,
    tone: "bg-slate-100 text-slate-700",
  },
];

export default function AdminDashboard() {
  const now = new Date();
  const greeting =
    now.getHours() < 12
      ? "Good morning"
      : now.getHours() < 17
        ? "Good afternoon"
        : "Good evening";
  const hotCount = newsList.filter((item) => item.isHot).length;

  return (
    <div className="space-y-6 p-6">
      <AdminSectionHeader
        title="Dashboard Overview"
        description={`${greeting}, Admin. Here is what is happening across the intranet.`}
        action={
          <div className="flex items-center gap-2 rounded-2xl border bg-background px-4 py-2 text-sm text-muted-foreground shadow-sm">
            <Clock className="h-4 w-4" />
            {now.toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="News"
          value={newsList.length}
          description={`${hotCount} hot updates`}
          icon={Megaphone}
          tone="amber"
        />
        <StatCard
          title="Videos"
          value={videos.length}
          description="Published media items"
          icon={Video}
          tone="violet"
        />
        <StatCard
          title="Events"
          value={events.length}
          description="Scheduled activities"
          icon={Calendar}
          tone="blue"
        />
        <StatCard
          title="Documents"
          value={documents.length}
          description={`${members.length} management profiles`}
          icon={FileText}
          tone="emerald"
        />
      </div>

      <AdminCard>
        <AdminCardTitle title="Quick Actions" meta="Admin shortcuts" />
        <CardContent className="grid grid-cols-1 gap-4 px-6 sm:grid-cols-2 lg:grid-cols-3">
          {quickLinks.map((link) => (
            <Link
              key={link.label}
              to={link.path}
              className="group flex items-center gap-4 rounded-2xl border border-border/70 bg-background p-4 transition-all hover:scale-[1.02] hover:border-primary/30 hover:shadow-md"
            >
              <div className={`rounded-2xl p-3 ${link.tone}`}>
                <link.icon className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{link.label}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {link.description}
                </p>
              </div>
              <Plus className="h-4 w-4 text-muted-foreground transition-transform group-hover:rotate-90 group-hover:text-primary" />
            </Link>
          ))}
        </CardContent>
      </AdminCard>

      <div className="grid gap-6 lg:grid-cols-3">
        <AdminCard>
          <AdminCardTitle title="Upcoming Events" meta={`${events.length} items`} />
          <CardContent className="max-h-[320px] space-y-0 overflow-y-auto px-6">
            {events.map((event, index) => {
              const date = new Date(event.date);
              return (
                <div
                  key={`${event.title}-${index}`}
                  className="flex gap-4 border-b py-4 last:border-b-0"
                >
                  <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
                    <span className="text-xs font-medium uppercase">
                      {date.toLocaleString("default", { month: "short" })}
                    </span>
                    <span className="text-lg font-semibold">
                      {date.getDate()}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="line-clamp-1 text-sm font-medium">
                      {event.title}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {event.time} / {event.location}
                    </p>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </AdminCard>

        <AdminCard>
          <AdminCardTitle title="Latest News" meta={`${newsList.length} items`} />
          <CardContent className="max-h-[320px] space-y-0 overflow-y-auto px-6">
            {newsList.slice(0, 8).map((news) => (
              <div
                key={news.id}
                className="flex gap-4 border-b py-4 last:border-b-0"
              >
                <img
                  src={news.image}
                  alt=""
                  className="h-12 w-12 shrink-0 rounded-2xl object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 text-sm font-medium leading-snug">
                    {news.title}
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <StatusBadge tone={news.isHot ? "rose" : "slate"}>
                      {news.isHot ? "Hot" : news.category}
                    </StatusBadge>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </AdminCard>

        <AdminCard>
          <AdminCardTitle title="Recent Videos" meta={`${videos.length} videos`} />
          <CardContent className="max-h-[320px] space-y-0 overflow-y-auto px-6">
            {videos.slice(0, 8).map((video, index) => (
              <div
                key={`${video.title}-${index}`}
                className="flex gap-4 border-b py-4 last:border-b-0"
              >
                <div className="flex h-12 w-16 shrink-0 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
                  <Video className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="line-clamp-2 text-sm font-medium leading-snug">
                    {video.title}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Social media video
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </AdminCard>
      </div>
    </div>
  );
}
