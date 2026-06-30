import HeroSection from "./components/Hero-section";
import OurPeopleCard from "./components/OurPeople";
import StatsSection from "./components/StatesSection";
import UpcomingBirthdays from "./components/UpComingBirthDay";
import {
  Flame,
  CalendarDays,
  FileText,
  Pin,
  LockIcon,
  Search,
  Bell,
} from "lucide-react";

import { Users, ChevronDown, ChevronUp } from "lucide-react";
import visionImg from "@/assets/vision.jpg";
import missionImg from "@/assets/mission.jpg";
import GallerySection from "./components/GallerySection";
import { useRef, useState, useMemo, useEffect } from "react";
import VideoCard, { VideoModal } from "./components/VideoCard";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import FaqCalendarSection from "@/components/shared/FaqCalendarSection";
import WelcomeCarousel from "./components/WelcomeMembers";
import { useMembers } from "@/hooks/useMembers";
import type { Member as BirthdayMember } from "@/utils/birthday";
import NoBirthdayCard from "./components/NoBirthdayCard";
import { getTodayBirthdays, getUpcomingBirthdays } from "@/utils/birthday";
import BirthdayCarousel from "./components/BirthdayCarousel";
import { useVideos } from "@/hooks/useVideos";
import { useNews } from "@/hooks/useNews";
import { useEvents } from "@/hooks/useEvents";
import { useDocuments } from "@/hooks/useDocuments";
import { AlertOrCEOCard } from "./components/Alertorceocard";
import { Skeleton } from "@/components/ui/skeleton";
import InlineErrorAlert from "@/components/shared/InlineErrorAlert";
import FeaturedNewsPanel from "./components/FeaturedNewsPanel";
import EventItem from "./Our Segments/components/EventItem";
import PinnedCard from "./Our Segments/components/PinnedCard";
import { viewDocument, downloadDocument } from "@/lib/api/documentApi";
import { loginAuthorized } from "@/lib/api/authApi";
import DocGrid from "./Our Segments/components/DocGrid";
import { useAnnouncements } from "@/hooks/useAnnouncements";
import TopManagementCarousel from "./Our Segments/components/TopManagementCarousel";

// ─── Skeleton helpers (unchanged) ────────────────────────────────────────────

function FeaturedNewsSkeleton() {
  return (
    <div className="rounded-2xl p-6 md:p-8">
      <Skeleton className="h-6 w-16 mb-6 bg-white" />
      <div className="flex flex-col md:flex-row gap-8">
        <div className="md:w-1/2 flex flex-col">
          <Skeleton className="w-full h-64 md:h-72 rounded-md mb-3 bg-white" />
          <Skeleton className="h-3 w-20 mb-3 bg-white" />
          <Skeleton className="h-5 w-full mb-2 bg-white" />
          <Skeleton className="h-5 w-3/4 mb-3 bg-white" />
          <Skeleton className="h-4 w-full mb-2 bg-white" />
          <Skeleton className="h-4 w-2/3 mb-4 bg-white" />
          <Skeleton className="h-3 w-16 bg-white" />
        </div>
        <div className="md:w-1/2 flex flex-col">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i}>
              <div className="flex gap-4 py-4">
                <Skeleton className="w-28 h-20 rounded-md flex-shrink-0 bg-white" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-full bg-white" />
                  <Skeleton className="h-4 w-2/3 bg-white" />
                  <Skeleton className="h-3 w-1/3 bg-white" />
                </div>
              </div>
              {i < 2 && <div className="h-px bg-white" />}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function CarouselSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
        >
          <Skeleton className="mx-auto h-24 w-24 rounded-full" />
          <div className="mt-4 space-y-3 text-center">
            <Skeleton className="mx-auto h-5 w-3/4" />
            <Skeleton className="mx-auto h-4 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

function BirthdaySkeleton() {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      <div className="md:col-span-2 overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex gap-4">
          <Skeleton className="h-28 w-28 rounded-2xl" />
          <div className="flex-1 space-y-3">
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>
      </div>
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <Skeleton className="h-5 w-32" />
        <div className="mt-4 space-y-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function VideoSkeleton() {
  return (
    <div className="flex gap-4 sm:gap-6 overflow-hidden px-0 sm:px-10">
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={index}
          className="min-w-[280px] flex-1 overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
        >
          <Skeleton className="h-44 w-full rounded-xl" />
          <div className="mt-4 space-y-3">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

function AnnouncementsSkeleton() {
  return (
    <div className="divide-y divide-blue-800">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 px-4 py-3">
          <Skeleton className="w-16 h-14 rounded-lg flex-shrink-0 bg-blue-700/60" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-full bg-blue-700/60" />
            <Skeleton className="h-3 w-2/3 bg-blue-700/60" />
          </div>
        </div>
      ))}
    </div>
  );
}

function PinnedDocsSkeleton() {
  return (
    <div className="divide-y divide-slate-100">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 px-4 py-3">
          <Skeleton className="w-9 h-9 rounded-lg flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

function HomePage() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeVideo, setActiveVideo] = useState<string | null>(null);

  // ── Data hooks ──────────────────────────────────────────────────────────────
  const { videos, loading: videosLoading, error: videosError } = useVideos();
  // Pass no segment (or null/undefined) to get ALL events / documents
  const { events, loading: eventsLoading } = useEvents();
  const { news, loading: newsLoading, error: newsError } = useNews();
  const {
    members = [],
    loading: membersLoading,
    error: membersError,
  } = useMembers();
  // ▼ NEW — global documents (no segment filter)
  const { documents, loading: docsLoading } = useDocuments(undefined);

  // ── Calendar state (was missing — caused TS errors) ─────────────────────────
  const [date, setDate] = useState<Date | undefined>(new Date());

  // ── Document section state ──────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [showPrivate, setShowPrivate] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  const { announcements = [], loading: announcementsLoading } =
    useAnnouncements();
  const [showAllAnnouncements, setShowAllAnnouncements] = useState(false);

  const tabs = ["All", "HR & Policies", "Finance", "Operations"];

  // ── Helpers ─────────────────────────────────────────────────────────────────
  function formatDate(d: Date | undefined) {
    if (!d) return "";
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  const selectedDateStr = formatDate(date);

  const eventDates = useMemo(
    () => new Set(events.map((e) => e.date)),
    [events],
  );

  const filteredEvents = events.filter((e) => e.date === selectedDateStr);

  // ── Document filtering ──────────────────────────────────────────────────────
  const pinnedDocs = documents.filter((doc) => doc.isPinned);

  const filteredDocuments = useMemo(() => {
    return documents.filter((doc) => {
      const matchesTab =
        activeTab === "All" ||
        (activeTab === "HR & Policies" && doc.category === "HR") ||
        (activeTab === "Finance" && doc.category === "FINANCE") ||
        (activeTab === "Operations" && doc.category === "OPERATIONS");

      const matchesSearch =
        searchQuery === "" ||
        doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.category.toLowerCase().includes(searchQuery.toLowerCase());

      const isPrivate = doc.access === "PRIVATE";
      const matchesAccess = !isPrivate || (showPrivate && isAuthorized);

      return matchesTab && matchesSearch && matchesAccess;
    });
  }, [documents, activeTab, searchQuery, showPrivate, isAuthorized]);

  // ── Auth ────────────────────────────────────────────────────────────────────
  const handleAuthorizedLogin = async () => {
    if (!username || !password) return;
    setAuthError(null);
    setAuthLoading(true);
    try {
      const data = await loginAuthorized(username, password);
      if (
        data.role !== "AUTHORIZED" &&
        data.role !== "ADMIN" &&
        data.role !== "SUPER_ADMIN"
      ) {
        setAuthError("You are not authorized to access private documents");
        return;
      }
      localStorage.setItem("authorized_token", data.token);
      localStorage.setItem("authorized_user", JSON.stringify(data));
      setIsAuthorized(true);
      setShowPrivate(true);
      setShowAuthModal(false);
      setUsername("");
      setPassword("");
    } catch (err: any) {
      setAuthError(err.message || "Invalid credentials");
    } finally {
      setAuthLoading(false);
    }
  };

  // ── Document actions ────────────────────────────────────────────────────────
  const handleView = async (id: number) => {
    try {
      const blob = await viewDocument(id);
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");
    } catch {
      alert("Failed to view document");
    }
  };

  const handleDownload = async (id: number, title: string) => {
    try {
      const blob = await downloadDocument(id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = title;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert("Failed to download document");
    }
  };

  // ── Members / birthdays ─────────────────────────────────────────────────────
  const birthdayMembers: BirthdayMember[] = useMemo(
    () =>
      members.map((m) => ({
        name: `${m.firstName} ${m.lastName}`,
        role: m.role,
        dob: m.dob,
      })),
    [members],
  );

  const todayBirthdays = useMemo(
    () => getTodayBirthdays(birthdayMembers),
    [birthdayMembers],
  );

  const upcomingList = useMemo(
    () => getUpcomingBirthdays(birthdayMembers, 5),
    [birthdayMembers],
  );

  const recentMembers = useMemo(() => {
    return [...members]
      .filter((m) => m.joinedDate)
      .sort(
        (a, b) =>
          new Date(b.joinedDate).getTime() - new Date(a.joinedDate).getTime(),
      )
      .slice(0, 10);
  }, [members]);

  const welcomePeople = recentMembers.map((m) => ({
    name: `${m.firstName} ${m.lastName}`,
    role: m.role,
    joinedDate: m.joinedDate,
    image: null,
  }));

  // ── News ────────────────────────────────────────────────────────────────────
  const sortedNews = useMemo(
    () =>
      [...news].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
    [news],
  );

  const featuredRaw = useMemo(
    () => sortedNews.find((n) => n.isHot) ?? null,
    [sortedNews],
  );

  const sideRaw = useMemo(
    () => sortedNews.filter((n) => n.id !== featuredRaw?.id).slice(0, 5),
    [sortedNews, featuredRaw],
  );

  const mapNewsItem = (n: (typeof news)[0]) => ({
    id: n.id,
    title: n.title,
    description: n.description,
    content: n.content,
    image: n.image,
    category: n.category,
    isHot: n.isHot,
    createdAt: n.createdAt,
  });

  const featuredItem = featuredRaw ? mapNewsItem(featuredRaw) : null;
  const sideItems = sideRaw.map(mapNewsItem);

  // ── Video ───────────────────────────────────────────────────────────────────
  const isYouTube =
    activeVideo &&
    !activeVideo.includes("facebook") &&
    !activeVideo.includes("fb");

  const getEmbedUrl = (url: string) => {
    if (isYouTube) {
      const regExp = /(?:youtube\.com\/.*v=|youtu\.be\/)([^&]+)/;
      const match = url.match(regExp);
      const id = match ? match[1] : url;
      return `https://www.youtube.com/embed/${id}`;
    } else {
      return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&show_text=false&width=800`;
    }
  };

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollBy({
      left: dir === "left" ? -300 : 300,
      behavior: "smooth",
    });
  };

  // ── Scroll-reveal ───────────────────────────────────────────────────────────
  function useScrollReveal(threshold = 0.15) {
    const ref = useRef<HTMLDivElement>(null);
    const [visible, setVisible] = useState(false);
    useEffect(() => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.disconnect();
          }
        },
        { threshold },
      );
      if (ref.current) observer.observe(ref.current);
      return () => observer.disconnect();
    }, [threshold]);
    return { ref, visible };
  }

  const visionText = useScrollReveal();
  const visionImage = useScrollReveal();
  const missionText = useScrollReveal();
  const missionImage = useScrollReveal();

  const announcementsReveal = useScrollReveal();
  const pinnedReveal = useScrollReveal();
  const topManagementReveal = useScrollReveal();

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div>
      <HeroSection />

      {/* News + Alert */}
      <section className="bg-[#0E4E96] max-w-full mx-auto px-2 py-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="w-full md:w-3/4">
            {newsLoading ? (
              <FeaturedNewsSkeleton />
            ) : newsError ? (
              <InlineErrorAlert message={newsError} />
            ) : featuredItem ? (
              <FeaturedNewsPanel
                featured={featuredItem}
                sideItems={sideItems}
              />
            ) : (
              <div className="w-full min-h-55 flex flex-col items-center justify-center gap-3 border border-dashed border-slate-200 rounded-2xl bg-slate-50">
                <Flame className="w-5 h-5 text-slate-300" />
                <p className="text-sm font-medium text-slate-400">
                  No news available
                </p>
              </div>
            )}
          </div>
          <div className="w-full md:w-1/4">
            <AlertOrCEOCard />
          </div>
        </div>
      </section>

      {/* ── Upcoming Events (left) + Document Center (right) ──────────────── */}
      <section className="max-w-full mx-auto px-6 sm:px-8 py-4 sm:py-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {/* ── LEFT: Upcoming Events + Calendar ─────────────────────────── */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-900 flex items-center justify-center flex-shrink-0">
                <CalendarDays className="w-4 h-4 text-white" />
              </div>
              <h2 className="text-xl sm:text-3xl font-bold text-blue-900 tracking-tight">
                Upcoming Events
              </h2>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 sm:h-[340px]">
              {/* Events list */}
              <div className="flex-1 min-w-0 flex flex-col min-h-[200px] sm:h-full">
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-full overflow-hidden">
                  <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/80 flex-shrink-0">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
                      Events
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {date?.toLocaleDateString("en-GB", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                      })}
                    </p>
                  </div>
                  <div className="overflow-y-auto flex-1 p-3 space-y-2">
                    {eventsLoading ? (
                      <div className="h-full flex items-center justify-center py-8">
                        <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                      </div>
                    ) : filteredEvents.length > 0 ? (
                      filteredEvents.map((event) => {
                        const [year, month, day] = event.date
                          .split("-")
                          .map(Number);
                        const eventDate = new Date(year, month - 1, day);
                        return (
                          <EventItem
                            key={event.id}
                            day={eventDate.getDate().toString()}
                            month={eventDate.toLocaleString("default", {
                              month: "short",
                            })}
                            title={event.title}
                            time={event.time}
                            location={event.location}
                          />
                        );
                      })
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center gap-2 py-8">
                        <CalendarDays className="w-7 h-7 text-slate-200" />
                        <p className="text-xs text-slate-400 text-center">
                          No events for selected date
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Calendar */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-3 w-full sm:w-[260px] sm:flex-shrink-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  className="w-full"
                  modifiers={{
                    hasEvent: (day) => eventDates.has(formatDate(day)),
                  }}
                  modifiersClassNames={{
                    hasEvent:
                      "bg-blue-100 text-blue-800 rounded-full font-bold",
                  }}
                  classNames={{
                    month: "w-full",
                    table: "w-full border-collapse",
                    weekdays: "w-full",
                    week: "w-full",
                    day: "flex-1 text-center",
                    day_selected: "bg-blue-900 text-white rounded-full",
                    day_today: "font-bold text-blue-900",
                  }}
                />
              </div>
            </div>
          </div>

          {/* ── RIGHT: Document Center ────────────────────────────────────── */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-900 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-4 h-4 text-white" />
                </div>
                <h2 className="text-xl sm:text-3xl font-bold text-blue-900 tracking-tight">
                  Document Center
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowPrivate(false)}
                  className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all ${
                    !showPrivate
                      ? "bg-blue-900 text-white border-blue-900 shadow-sm"
                      : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <span>👁</span> Public
                </button>
                <button
                  onClick={() => {
                    if (!isAuthorized) setShowAuthModal(true);
                    else setShowPrivate(true);
                  }}
                  className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all ${
                    showPrivate
                      ? "bg-red-600 text-white border-red-600 shadow-sm"
                      : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <LockIcon className="w-3 h-3" /> Private
                </button>
              </div>
            </div>

            {/* Search + Tabs */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm px-4 sm:px-5 py-4">
              <div className="flex flex-col gap-3">
                <div className="relative w-full">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    placeholder="Search documents..."
                    className="pl-9 bg-slate-50 border-slate-200 rounded-xl h-9 text-sm"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div
                  className="flex gap-1.5 overflow-x-auto pb-0.5"
                  style={{ scrollbarWidth: "none" }}
                >
                  {tabs.map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all whitespace-nowrap flex-shrink-0 ${
                        activeTab === tab
                          ? "bg-blue-900 text-white border-blue-900 shadow-sm"
                          : "bg-white text-slate-500 border-slate-200 hover:border-blue-200 hover:text-blue-700"
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Document grid with pagination */}
            {docsLoading ? (
              <div className="py-12 flex flex-col items-center gap-3">
                <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-slate-400">Loading documents...</p>
              </div>
            ) : (
              <DocGrid
                documents={filteredDocuments}
                onView={handleView}
                onDownload={handleDownload}
              />
            )}
          </div>
        </div>
      </section>

      {/* ── Announcements (left) + Pinned For You (center) + Top Management (right) ── */}
      <section className="bg-[#0E4E96] max-w-full mx-auto px-6 sm:px-8 py-4 sm:py-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* ── LEFT: Announcements ───────────────────────────────────────── */}
          <div
            ref={announcementsReveal.ref}
            className="flex flex-col gap-4"
            style={{
              opacity: announcementsReveal.visible ? 1 : 0,
              transform: announcementsReveal.visible
                ? "translateY(0)"
                : "translateY(30px)",
              transition: "opacity 0.7s ease, transform 0.7s ease",
            }}
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#0E4E96] flex items-center justify-center flex-shrink-0">
                <Bell className="w-4 h-4 text-white" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Announcements
              </h2>
              {announcements.length > 0 && (
                <span className="text-[11px] font-semibold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                  {announcements.length}
                </span>
              )}
            </div>

            <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
              {announcementsLoading ? (
                <AnnouncementsSkeleton />
              ) : announcements.length === 0 ? (
                <div className="px-5 py-10 flex flex-col items-center justify-center gap-2">
                  <Bell className="w-8 h-8 text-blue-300" />
                  <p className="text-sm text-blue-200">
                    No announcements at this time
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-blue-800">
                  {(showAllAnnouncements
                    ? announcements
                    : announcements.slice(0, 4)
                  ).map((a) => (
                    <div
                      key={a.id}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-blue-50 transition-colors cursor-pointer"
                    >
                      {/* Thumbnail */}
                      {a.image ? (
                        <img
                          src={a.image}
                          alt={a.title}
                          className="w-16 h-14 rounded-lg object-cover flex-shrink-0"
                        />
                      ) : (
                        <div className="w-16 h-14 rounded-lg bg-white flex items-center justify-center flex-shrink-0">
                          <Bell className="w-5 h-5 text-[#0E4E96]" />
                        </div>
                      )}
                      {/* Text */}
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-[#0E4E96] leading-snug line-clamp-2">
                          {a.title}
                        </p>
                        {(a.time || a.location) && (
                          <p className="text-xs text-blue-200 mt-0.5">
                            {[a.time, a.location].filter(Boolean).join(" · ")}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Show more / less */}
              {announcements.length > 4 && (
                <button
                  onClick={() => setShowAllAnnouncements((prev) => !prev)}
                  className="w-full py-2.5 text-xs font-semibold text-blue-200 hover:text-white hover:bg-blue-800 transition-colors flex items-center justify-center gap-1 border-t border-blue-800"
                >
                  {showAllAnnouncements ? (
                    <>
                      <ChevronUp className="w-3.5 h-3.5" /> Show less
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-3.5 h-3.5" /> View all
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* ── CENTER: Pinned For You ────────────────────────────────────── */}
          <div
            ref={pinnedReveal.ref}
            className="flex flex-col gap-4"
            style={{
              opacity: pinnedReveal.visible ? 1 : 0,
              transform: pinnedReveal.visible
                ? "translateY(0)"
                : "translateY(30px)",
              transition: "opacity 0.7s ease 0.15s, transform 0.7s ease 0.15s",
            }}
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center flex-shrink-0">
                <Pin className="w-4 h-4 text-white" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Pinned For You
              </h2>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              {docsLoading ? (
                <PinnedDocsSkeleton />
              ) : pinnedDocs.length === 0 ? (
                <div className="px-5 py-10 flex flex-col items-center justify-center gap-2">
                  <Pin className="w-8 h-8 text-slate-200" />
                  <p className="text-sm text-slate-400">No pinned documents</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {pinnedDocs.slice(0, 5).map((doc) => (
                    <div
                      key={doc.id}
                      className="px-4 py-3 hover:bg-slate-50 transition-colors"
                    >
                      <PinnedCard title={doc.title} category={doc.category} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── RIGHT: Top Management ─────────────────────────────────────── */}
          <div
            ref={topManagementReveal.ref}
            className="flex flex-col gap-4"
            style={{
              opacity: topManagementReveal.visible ? 1 : 0,
              transform: topManagementReveal.visible
                ? "translateY(0)"
                : "translateY(30px)",
              transition: "opacity 0.7s ease 0.3s, transform 0.7s ease 0.3s",
            }}
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center flex-shrink-0">
                <Users className="w-4 h-4 text-blue-900" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Top Management
              </h2>
            </div>

            <div className="bg-[#f7f7f7] rounded-2xl overflow-hidden shadow-sm">
              <TopManagementCarousel />
            </div>
          </div>
        </div>
      </section>

      {/* Birthdays */}
      <section className="max-w-full mx-auto px-6 sm:px-8 py-4 sm:py-4">
        <h2 className="text-4xl font-bold text-blue-900 mb-6">Birthdays</h2>
        <div className="w-12 h-0.5 bg-blue-900 rounded mb-5" />
        {membersLoading ? (
          <BirthdaySkeleton />
        ) : membersError ? (
          <InlineErrorAlert message={membersError} />
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2 flex flex-col gap-4">
              {todayBirthdays.length === 0 ? (
                <NoBirthdayCard />
              ) : (
                <BirthdayCarousel members={todayBirthdays} />
              )}
            </div>
            <UpcomingBirthdays list={upcomingList} />
          </div>
        )}
      </section>

      <StatsSection />

      {/* Welcome */}
      <section className="max-w-full mx-auto px-6 sm:px-8 py-4 sm:py-4">
        <div
          className="flex flex-col md:grid gap-6"
          style={{ gridTemplateColumns: "1fr 350px" }}
        >
          <div>
            <h2 className="text-4xl font-bold text-blue-900 mb-6">
              Welcome to CIC Feeds Group
            </h2>
            <div className="w-12 h-0.5 bg-blue-900 rounded mb-5" />
            {membersLoading ? (
              <CarouselSkeleton />
            ) : membersError ? (
              <InlineErrorAlert message={membersError} />
            ) : recentMembers.length === 0 ? (
              <p className="text-sm text-gray-400 py-6 text-center">
                No new members
              </p>
            ) : (
              <WelcomeCarousel people={welcomePeople} />
            )}
          </div>
          <div className="max-w-sm">
            <OurPeopleCard />
          </div>
        </div>
      </section>

      {/* ── Vision / Mission ──────────────────────────────────────────────── */}
      <section className="bg-[#0E4E96] max-w-full mx-auto px-2 py-4">
        <div className="rounded-tr-[80px] rounded-bl-[80px] overflow-hidden relative">
          {/* ── VISION ─────────────────────────────────────────────────────── */}
          <div
            ref={visionText.ref}
            className="grid md:grid-cols-2 gap-0 items-center"
            style={{
              opacity: visionText.visible ? 1 : 0,
              transform: visionText.visible
                ? "translateY(0)"
                : "translateY(30px)",
              transition: "opacity 0.7s ease, transform 0.7s ease",
            }}
          >
            {/* Left — Text */}
            <div className="px-10 py-12 md:py-16">
              <h2 className="text-4xl font-bold text-white mb-5">OUR Vision</h2>
              <p className="text-blue-100 leading-relaxed text-sm font-medium">
                To raise living standards around the country by delivering
                increased value to producers and consumers while optimizing
                benefits to our customers, shareholders, employees and other
                stakeholders.
              </p>
            </div>

            {/* Right — Overlapping images */}
            <div
              ref={visionImage.ref}
              className="relative h-64 md:h-72"
              style={{
                opacity: visionImage.visible ? 1 : 0,
                transform: visionImage.visible
                  ? "translateX(0)"
                  : "translateX(40px)",
                transition: "opacity 0.7s ease 0.2s, transform 0.7s ease 0.2s",
              }}
            >
              {/* Back image — offset top-right */}
              <div className="absolute top-4 right-4 w-60 h-50 rounded-2xl overflow-hidden opacity-60 z-0">
                <img
                  src={visionImg}
                  className="w-full h-full object-cover"
                  alt="Vision accent"
                />
              </div>
              {/* Front image — offset bottom-left */}
              <div className="absolute bottom-4 right-16 w-70 h-50 rounded-2xl overflow-hidden z-10 shadow-xl">
                <img
                  src={visionImg}
                  className="w-full h-full object-cover"
                  alt="Vision"
                />
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="mx-10 h-px bg-blue-700" />

          {/* ── MISSION ────────────────────────────────────────────────────── */}
          <div
            ref={missionText.ref}
            className="grid md:grid-cols-2 gap-0 items-center"
            style={{
              opacity: missionText.visible ? 1 : 0,
              transform: missionText.visible
                ? "translateY(0)"
                : "translateY(30px)",
              transition: "opacity 0.7s ease 0.2s, transform 0.7s ease 0.2s",
            }}
          >
            {/* Left — Overlapping images */}
            <div
              ref={missionImage.ref}
              className="relative h-64 md:h-72 order-2 md:order-1"
              style={{
                opacity: missionImage.visible ? 1 : 0,
                transform: missionImage.visible
                  ? "translateX(0)"
                  : "translateX(-40px)",
                transition: "opacity 0.7s ease, transform 0.7s ease",
              }}
            >
              {/* Back image — offset top-left */}
              <div className="absolute top-4 left-4 w-60 h-50 rounded-2xl overflow-hidden opacity-60 z-0">
                <img
                  src={missionImg}
                  className="w-full h-full object-cover"
                  alt="Mission accent"
                />
              </div>
              {/* Front image — offset bottom-right */}
              <div className="absolute bottom-4 left-16 w-70 h-50 rounded-2xl overflow-hidden z-10 shadow-xl">
                <img
                  src={missionImg}
                  className="w-full h-full object-cover"
                  alt="Mission"
                />
              </div>
            </div>

            {/* Right — Text */}
            <div className="px-10 py-12 md:py-16 order-1 md:order-2 text-right">
              <h2 className="text-4xl font-bold text-white mb-5">
                OUR Mission
              </h2>
              <p className="text-blue-100 leading-relaxed text-sm font-medium">
                To become the national leader in providing products, services
                and expertise for the growth and care of livestock by
                understanding, creating and communicating superior value for our
                customers while prioritizing food safety technologies.
              </p>
            </div>
          </div>
        </div>
      </section>

      <GallerySection />

      {/* Videos */}
      <section className="max-w-full mx-auto px-6 sm:px-8 py-4 sm:py-4">
        <h2 className="text-4xl font-bold text-blue-900 mb-6">Video</h2>
        <div className="w-12 h-0.5 bg-blue-900 rounded mb-5" />
        {videosLoading ? (
          <VideoSkeleton />
        ) : videosError ? (
          <InlineErrorAlert message={videosError} />
        ) : videos.length === 0 ? (
          <div className="w-full min-h-55 flex flex-col items-center justify-center gap-3 border border-dashed border-slate-200 rounded-2xl bg-slate-50">
            <p className="text-sm font-medium text-slate-400">
              No videos available
            </p>
          </div>
        ) : (
          <div className="relative">
            <Button
              size="icon"
              variant="secondary"
              onClick={() => scroll("left")}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 hidden sm:flex"
            >
              <ChevronLeft />
            </Button>
            <div
              ref={scrollRef}
              className="flex gap-4 sm:gap-6 overflow-x-auto no-scrollbar px-0 sm:px-10"
            >
              {videos
                .filter((v) => v.videoLink)
                .map((video) => (
                  <VideoCard
                    key={video.id}
                    title={video.title}
                    description={video.description}
                    videoLink={video.videoLink}
                    onClick={() => setActiveVideo(video.videoLink)}
                  />
                ))}
            </div>
            <Button
              size="icon"
              variant="secondary"
              onClick={() => scroll("right")}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 hidden sm:flex"
            >
              <ChevronRight />
            </Button>
          </div>
        )}
        {activeVideo && (
          <VideoModal
            activeVideo={activeVideo}
            videos={videos.filter((v) => v.videoLink).map((v) => v.videoLink)}
            onClose={() => setActiveVideo(null)}
            onNavigate={setActiveVideo}
            getEmbedUrl={getEmbedUrl}
          />
        )}
      </section>

      <FaqCalendarSection />

      {/* ── Auth Modal ──────────────────────────────────────────────────────── */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center z-50">
          <div className="bg-white rounded-t-3xl sm:rounded-2xl w-full sm:w-[360px] shadow-2xl border border-slate-100 overflow-hidden">
            <div className="flex justify-center pt-3 pb-1 sm:hidden">
              <div className="w-10 h-1 bg-slate-200 rounded-full" />
            </div>
            <div className="bg-gradient-to-br from-blue-900 to-blue-800 px-6 py-5">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center mb-3">
                <LockIcon className="w-5 h-5 text-white" />
              </div>
              <p className="font-semibold text-white">Private Access</p>
              <p className="text-xs text-blue-200 mt-0.5">
                Enter your credentials to continue
              </p>
            </div>
            <div className="px-6 py-5 flex flex-col gap-4">
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1.5 block">
                  Email
                </label>
                <input
                  placeholder="your@email.com"
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1.5 block">
                  Password
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-all"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              {authError && (
                <p className="text-xs text-red-500 bg-red-50 border border-red-100 rounded-lg px-3 py-2 text-center">
                  {authError}
                </p>
              )}
            </div>
            <div className="px-6 pb-8 sm:pb-5 flex gap-2">
              <button
                onClick={() => {
                  setShowAuthModal(false);
                  setAuthError(null);
                  setUsername("");
                  setPassword("");
                }}
                className="flex-1 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 px-4 py-2.5 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAuthorizedLogin}
                disabled={authLoading}
                className="flex-1 bg-blue-900 hover:bg-blue-800 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors disabled:opacity-50"
              >
                {authLoading ? "Signing in..." : "Sign in"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default HomePage;
