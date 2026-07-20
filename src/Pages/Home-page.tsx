import HeroSection from "./components/Hero-section";
import OurPeopleCard from "./components/OurPeople";
import UpcomingBirthdays from "./components/UpComingBirthDay";
import {
  Flame,
  FileText,
  Pin,
  LockIcon,
  Search,
  Bell,
  Cake,
  Video as VideoIcon,
} from "lucide-react";

import { ChevronDown, ChevronUp } from "lucide-react";
import visionImg from "@/assets/vision.jpg";
import missionImg from "@/assets/mission.jpg";
import GallerySection from "./components/GallerySection";
import {
  useRef,
  useState,
  useMemo,
  useEffect,
  useSyncExternalStore,
} from "react";
import VideoCard, { VideoModal } from "./components/VideoCard";
import { Input } from "@/components/ui/input";
import WelcomeCarousel from "./components/WelcomeMembers";
import { useMembers } from "@/hooks/useMembers";
import type { Member as BirthdayMember } from "@/utils/birthday";
import NoBirthdayCard from "./components/NoBirthdayCard";
import { getTodayBirthdays, getUpcomingBirthdays } from "@/utils/birthday";
import BirthdayCarousel from "./components/BirthdayCarousel";
import { useVideos } from "@/hooks/useVideos";
import { useNews } from "@/hooks/useNews";
import { useDocuments } from "@/hooks/useDocuments";
import { AlertOrCEOCard } from "./components/Alertorceocard";
import { Skeleton } from "@/components/ui/skeleton";
import InlineErrorAlert from "@/components/shared/InlineErrorAlert";
import FeaturedNewsPanel from "./components/FeaturedNewsPanel";
import PinnedCard from "./Our Segments/components/PinnedCard";
import { viewDocument, downloadDocument } from "@/lib/api/documentApi";
import { resolveFileUrl } from "@/lib/api/fileUtils";
import { getAdminSession } from "@/lib/api/authSession";
import {
  getLoginDialogSnapshot,
  openLoginDialog,
  subscribeLoginDialog,
} from "@/lib/loginDialogStore";
import DocGrid from "./Our Segments/components/DocGrid";
import { useAnnouncements } from "@/hooks/useAnnouncements";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Announcement } from "@/types";

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
                <Skeleton className="w-28 h-20 rounded-md shrink-0 bg-white" />
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
    <div className="flex flex-col gap-3">
      {/* Today's birthday card skeleton */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center gap-4 px-6 pt-6 pb-4">
          <Skeleton className="h-16 w-16 rounded-full shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-3 w-28" />
          </div>
        </div>
        <div className="h-px bg-slate-100 mx-6" />
        <div className="px-6 py-4 space-y-2">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-2/3" />
        </div>
        <div className="flex items-center justify-between px-6 pb-5">
          <Skeleton className="h-8 w-36 rounded-full" />
          <Skeleton className="h-8 w-24 rounded-lg" />
        </div>
      </div>

      {/* Upcoming birthdays card skeleton */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <Skeleton className="h-5 w-32" />
        <div className="mt-4 space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
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
    <div className="divide-y divide-slate-100">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 px-4 py-3">
          <Skeleton className="w-16 h-14 rounded-lg shrink-0 bg-slate-100" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-full bg-slate-100" />
            <Skeleton className="h-3 w-2/3 bg-slate-100" />
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
          <Skeleton className="w-9 h-9 rounded-lg shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

function DocGridSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm space-y-3"
        >
          <Skeleton className="w-9 h-9 rounded-lg" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      ))}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

const VIDEO_VISIBLE = 6;

function HomePage() {
  const [activeVideo, setActiveVideo] = useState<string | null>(null);
  const [videoStartIndex, setVideoStartIndex] = useState(0);
  const [activeAnnouncement, setActiveAnnouncement] =
    useState<Announcement | null>(null);

  // ── Data hooks ──────────────────────────────────────────────────────────────
  const { videos, loading: videosLoading, error: videosError } = useVideos();
  const { news, loading: newsLoading, error: newsError } = useNews();
  const {
    members = [],
    loading: membersLoading,
    error: membersError,
  } = useMembers();
  // ▼ NEW — global documents (no segment filter)
  const {
    documents,
    loading: docsLoading,
    error: docsError,
  } = useDocuments(undefined);

  // ── Document section state ──────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [showPrivate, setShowPrivate] = useState(false);
  const [privateAccessError, setPrivateAccessError] = useState<string | null>(
    null,
  );

  // Re-render whenever the global LoginDialog opens/closes so we notice a
  // session that just appeared (e.g. the user just signed in via the popup).
  useSyncExternalStore(subscribeLoginDialog, getLoginDialogSnapshot);
  const session = getAdminSession();
  const isAuthorized =
    !!session &&
    (session.user.role === "AUTHORIZED" ||
      session.user.role === "ADMIN" ||
      session.user.role === "SUPER_ADMIN");

  // Once the user is authorized (e.g. just signed in via the popup), enable
  // the private documents view automatically.
  useEffect(() => {
    if (isAuthorized) {
      setShowPrivate(true);
      setPrivateAccessError(null);
    }
  }, [isAuthorized]);

  const handlePrivateClick = () => {
    if (isAuthorized) {
      setShowPrivate(true);
      return;
    }
    if (session) {
      // Already signed in, but this account's role (e.g. SERVICE/helpdesk)
      // isn't allowed to view private documents — reopening the popup with
      // the same account would just loop, so surface it instead.
      setPrivateAccessError(
        "Your account isn't authorized to view private documents.",
      );
      return;
    }
    setPrivateAccessError(null);
    openLoginDialog();
  };

  const {
    announcements = [],
    loading: announcementsLoading,
    error: announcementsError,
  } = useAnnouncements();

  const tabs = ["All", "HR & Policies", "Finance", "Operations"];

  // ── Document filtering ──────────────────────────────────────────────────────
  const pinnedDocs = documents.filter((doc) => doc.isPinned);

  const filteredDocuments = useMemo(() => {
    return documents.filter((doc) => {
      const matchesTab =
        activeTab === "All" ||
        (activeTab === "HR & Policies" && doc.category === "HR") ||
        (activeTab === "Finance" && doc.category === "FINANCE") ||
        (activeTab === "Operations" && doc.category === "OPERATION");

      const matchesSearch =
        searchQuery === "" ||
        doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.category.toLowerCase().includes(searchQuery.toLowerCase());

      const isPrivate = doc.access === "PRIVATE";
      const matchesAccess = !isPrivate || (showPrivate && isAuthorized);

      return matchesTab && matchesSearch && matchesAccess;
    });
  }, [documents, activeTab, searchQuery, showPrivate, isAuthorized]);

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
    () => sortedNews.find((n) => n.isHot) ?? sortedNews[0] ?? null,
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

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div>
      <HeroSection />

      {/* Birthdays (left) + Announcements (middle) + Alert (right) — mirrors the hero's 3-column row */}
      <section className="max-w-full mx-auto px-6 sm:px-8 py-4 sm:py-4">
        <div className="flex flex-col lg:flex-row items-start gap-4">
          {/* LEFT — Birthdays + Upcoming Birthdays */}
          <div className="w-full lg:w-90 shrink-0 flex flex-col gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-pink-500 flex items-center justify-center shrink-0">
                <Cake className="w-4 h-4 text-white" />
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-cic-900 tracking-tight">
                Birthdays
              </h2>
            </div>
            {membersLoading ? (
              <BirthdaySkeleton />
            ) : membersError ? (
              <InlineErrorAlert message={membersError} />
            ) : (
              <div className="flex flex-col gap-3">
                {todayBirthdays.length === 0 ? (
                  <NoBirthdayCard />
                ) : (
                  <BirthdayCarousel members={todayBirthdays} />
                )}
                <UpcomingBirthdays list={upcomingList} />
              </div>
            )}
          </div>

          {/* MIDDLE — Announcements */}
          <div
            ref={announcementsReveal.ref}
            className="w-full lg:flex-1 min-w-0 flex flex-col gap-3"
            style={{
              opacity: announcementsReveal.visible ? 1 : 0,
              transform: announcementsReveal.visible
                ? "translateY(0)"
                : "translateY(30px)",
              transition: "opacity 0.7s ease, transform 0.7s ease",
            }}
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-cic-900 flex items-center justify-center shrink-0">
                <Bell className="w-4 h-4 text-white" />
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-cic-900 tracking-tight">
                Announcements
              </h2>
              {announcements.length > 0 && (
                <span className="text-xs font-semibold bg-cic-100 text-cic-700 px-2 py-0.5 rounded-full">
                  {announcements.length}
                </span>
              )}
            </div>

            <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-200">
              {announcementsLoading ? (
                <AnnouncementsSkeleton />
              ) : announcementsError ? (
                <div className="px-4 py-3">
                  <InlineErrorAlert message={announcementsError} />
                </div>
              ) : announcements.length === 0 ? (
                <div className="px-5 py-10 flex flex-col items-center justify-center gap-2">
                  <Bell className="w-8 h-8 text-slate-300" />
                  <p className="text-sm text-slate-400">
                    No announcements at this time
                  </p>
                </div>
              ) : (
                <div
                  className={`divide-y divide-slate-100 ${
                    announcements.length > 7 ? "max-h-160 overflow-y-auto" : ""
                  }`}
                >
                  {announcements.map((a) => (
                    <div
                      key={a.id}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-cic-50 transition-colors cursor-pointer"
                    >
                      {/* Thumbnail */}
                      {a.image ? (
                        <img
                          src={resolveFileUrl(a.image)}
                          alt={a.title}
                          onClick={() => setActiveAnnouncement(a)}
                          className="w-16 h-14 rounded-lg object-cover shrink-0"
                        />
                      ) : (
                        <button
                          type="button"
                          onClick={() => setActiveAnnouncement(a)}
                          className="w-16 h-14 rounded-lg bg-slate-50 flex items-center justify-center shrink-0"
                          aria-label="View announcement details"
                        >
                          <Bell className="w-5 h-5 text-cic-800" />
                        </button>
                      )}
                      {/* Text */}
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-cic-800 leading-snug line-clamp-2">
                          {a.title}
                        </p>
                        {a.description && (
                          <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                            {a.description}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Announcement details modal */}
            <Dialog
              open={!!activeAnnouncement}
              onOpenChange={(o) => !o && setActiveAnnouncement(null)}
            >
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>{activeAnnouncement?.title}</DialogTitle>
                </DialogHeader>
                {activeAnnouncement?.image && (
                  <img
                    src={resolveFileUrl(activeAnnouncement.image)}
                    alt={activeAnnouncement.title}
                    className="w-full max-h-80 rounded-lg object-cover"
                  />
                )}
                {activeAnnouncement?.description && (
                  <p className="text-sm text-slate-600 whitespace-pre-wrap">
                    {activeAnnouncement.description}
                  </p>
                )}
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-xs font-semibold bg-cic-100 text-cic-700 px-2.5 py-1 rounded-full">
                    {activeAnnouncement?.category}
                  </span>
                  <span className="text-xs font-medium text-slate-400">
                    {activeAnnouncement?.segment}
                  </span>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* RIGHT — Alert / CEO message (width unchanged) */}
          <div className="w-full lg:w-80 shrink-0">
            <AlertOrCEOCard />
          </div>
        </div>
      </section>

      {/* News */}
      <section className="bg-cic-800 max-w-full mx-auto px-2 py-4">
        {newsLoading ? (
          <FeaturedNewsSkeleton />
        ) : newsError ? (
          <InlineErrorAlert message={newsError} />
        ) : featuredItem ? (
          <FeaturedNewsPanel featured={featuredItem} sideItems={sideItems} />
        ) : (
          <div className="w-full min-h-55 flex flex-col items-center justify-center gap-3 border border-dashed border-slate-200 rounded-2xl bg-slate-50">
            <Flame className="w-5 h-5 text-slate-300" />
            <p className="text-sm font-medium text-slate-400">
              No news available
            </p>
          </div>
        )}
      </section>

      {/* ── Upcoming Events (left) + Document Center (right) ──────────────── */}
      <section className="max-w-full mx-auto px-6 sm:px-8 py-4 sm:py-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {/* ── LEFT: Upcoming Events + Calendar ─────────────────────────── */}
          <div className="flex flex-col gap-4">
            <div ref={pinnedReveal.ref} className="flex flex-col gap-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center shrink-0">
                  <Pin className="w-4 h-4 text-cic-900" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-cic-900 tracking-tight">
                  Pinned For You
                </h2>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/80">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
                    Pinned Documents
                  </p>
                </div>
                {docsLoading ? (
                  <PinnedDocsSkeleton />
                ) : docsError ? (
                  <div className="px-4 py-3">
                    <InlineErrorAlert message={docsError} />
                  </div>
                ) : pinnedDocs.length === 0 ? (
                  <div className="px-5 py-10 flex flex-col items-center justify-center gap-2">
                    <Pin className="w-8 h-8 text-slate-200" />
                    <p className="text-sm text-slate-400">
                      No pinned documents
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {pinnedDocs.slice(0, 5).map((doc) => (
                      <div
                        key={doc.id}
                        className="px-4 py-3 hover:bg-cic-50 transition-colors cursor-pointer"
                      >
                        <PinnedCard title={doc.title} category={doc.category} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── RIGHT: Document Center ────────────────────────────────────── */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-cic-900 flex items-center justify-center shrink-0">
                  <FileText className="w-4 h-4 text-white" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-cic-900 tracking-tight">
                  Document Center
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowPrivate(false)}
                  className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all ${
                    !showPrivate
                      ? "bg-cic-900 text-white border-cic-900 shadow-sm"
                      : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <span>👁</span> Public
                </button>
                <button
                  onClick={handlePrivateClick}
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

            {privateAccessError && (
              <p className="text-xs text-red-500 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                {privateAccessError}
              </p>
            )}

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
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all whitespace-nowrap shrink-0 ${
                        activeTab === tab
                          ? "bg-cic-900 text-white border-cic-900 shadow-sm"
                          : "bg-white text-slate-500 border-slate-200 hover:border-cic-200 hover:text-cic-700"
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
              <DocGridSkeleton />
            ) : docsError ? (
              <InlineErrorAlert message={docsError} />
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

      {/* Welcome */}
      <section className="max-w-full mx-auto px-6 sm:px-8 py-4 sm:py-4">
        <div
          className="flex flex-col md:grid gap-6"
          style={{ gridTemplateColumns: "1fr 350px" }}
        >
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-cic-900 tracking-tight mb-4">
              Welcome to CIC Feeds Group
            </h2>
            <div className="w-12 h-0.5 bg-cic-900 rounded mb-5" />
            {membersLoading ? (
              <CarouselSkeleton />
            ) : membersError ? (
              <InlineErrorAlert message={membersError} />
            ) : recentMembers.length === 0 ? (
              <p className="text-sm text-slate-400 py-6 text-center">
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
      <section className="bg-cic-800 max-w-full mx-auto px-2 py-4">
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
              <span className="inline-block text-xs font-semibold text-cic-300 uppercase tracking-[0.15em] mb-3">
                Who We Are
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-3">
                OUR Vision
              </h2>
              <div className="w-10 h-0.5 bg-cic-300/60 rounded mb-5" />
              <p className="text-cic-100 leading-relaxed text-sm font-medium">
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
              <div className="absolute top-4 right-4 w-60 h-50 rounded-2xl overflow-hidden opacity-40 z-0">
                <img
                  src={visionImg}
                  className="w-full h-full object-cover"
                  alt="Vision accent"
                />
              </div>
              {/* Front image — offset bottom-left */}
              <div className="absolute bottom-4 right-16 w-70 h-50 rounded-2xl overflow-hidden z-10 shadow-2xl ring-2 ring-white/10">
                <img
                  src={visionImg}
                  className="w-full h-full object-cover"
                  alt="Vision"
                />
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 mx-10">
            <div className="flex-1 h-px bg-cic-700/50" />
            <div className="flex gap-1.5">
              <div className="w-1 h-1 rounded-full bg-cic-400/50" />
              <div className="w-1.5 h-1.5 rounded-full bg-cic-300/60" />
              <div className="w-1 h-1 rounded-full bg-cic-400/50" />
            </div>
            <div className="flex-1 h-px bg-cic-700/50" />
          </div>

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
              <div className="absolute top-4 left-4 w-60 h-50 rounded-2xl overflow-hidden opacity-40 z-0">
                <img
                  src={missionImg}
                  className="w-full h-full object-cover"
                  alt="Mission accent"
                />
              </div>
              {/* Front image — offset bottom-right */}
              <div className="absolute bottom-4 left-16 w-70 h-50 rounded-2xl overflow-hidden z-10 shadow-2xl ring-2 ring-white/10">
                <img
                  src={missionImg}
                  className="w-full h-full object-cover"
                  alt="Mission"
                />
              </div>
            </div>

            {/* Right — Text */}
            <div className="px-10 py-12 md:py-16 order-1 md:order-2 text-right">
              <span className="inline-block text-xs font-semibold text-cic-300 uppercase tracking-[0.15em] mb-3">
                Our Purpose
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-3">
                OUR Mission
              </h2>
              <div className="w-10 h-0.5 bg-cic-300/60 rounded mb-5 ml-auto" />
              <p className="text-cic-100 leading-relaxed text-sm font-medium">
                To become the national leader in providing products, services
                and expertise for the growth and care of livestock by
                understanding, creating and communicating superior value for our
                customers while prioritizing food safety technologies.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Gallery (left) + Videos (right) ─────────────────────────────── */}
      <section className="max-w-full mx-auto px-6 sm:px-8 py-4 sm:py-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* ── LEFT: Gallery ── */}
          <GallerySection />

          {/* ── RIGHT: Videos ── */}
          <div className="w-full flex flex-col">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center shrink-0">
                <VideoIcon className="w-4 h-4 text-white" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-cic-900 tracking-tight">
                Video
              </h2>
            </div>
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
              (() => {
                const playableVideos = videos.filter((v) => v.videoLink);
                const canScrollVideoUp = videoStartIndex > 0;
                const canScrollVideoDown =
                  videoStartIndex + VIDEO_VISIBLE < playableVideos.length;
                const visibleVideos = playableVideos.slice(
                  videoStartIndex,
                  videoStartIndex + VIDEO_VISIBLE,
                );

                return (
                  <div className="flex gap-2">
                    <div className="flex-1 grid grid-cols-2 gap-2">
                      {visibleVideos.map((video) => (
                        <VideoCard
                          key={video.id}
                          title={video.title}
                          description={video.description}
                          videoLink={video.videoLink}
                          onClick={() => setActiveVideo(video.videoLink)}
                        />
                      ))}
                    </div>

                    {playableVideos.length > VIDEO_VISIBLE && (
                      <div className="flex flex-col justify-center gap-2 pl-1">
                        <button
                          onClick={() =>
                            setVideoStartIndex((i) => Math.max(0, i - 1))
                          }
                          disabled={!canScrollVideoUp}
                          className={`w-7 h-7 rounded-full flex items-center justify-center border transition-colors ${
                            canScrollVideoUp
                              ? "border-slate-300 text-cic-900 hover:bg-slate-100"
                              : "border-slate-100 text-slate-300 cursor-not-allowed"
                          }`}
                          aria-label="Scroll up"
                        >
                          <ChevronUp className="w-4 h-4" />
                        </button>

                        <div className="flex flex-col items-center gap-1 py-1">
                          {Array.from({
                            length: playableVideos.length - VIDEO_VISIBLE + 1,
                          }).map((_, i) => (
                            <button
                              key={i}
                              onClick={() => setVideoStartIndex(i)}
                              className={`w-1.5 rounded-full transition-all ${
                                i === videoStartIndex
                                  ? "h-4 bg-cic-900"
                                  : "h-1.5 bg-slate-300 hover:bg-slate-400"
                              }`}
                              aria-label={`Go to page ${i + 1}`}
                            />
                          ))}
                        </div>

                        <button
                          onClick={() =>
                            setVideoStartIndex((i) =>
                              Math.min(
                                playableVideos.length - VIDEO_VISIBLE,
                                i + 1,
                              ),
                            )
                          }
                          disabled={!canScrollVideoDown}
                          className={`w-7 h-7 rounded-full flex items-center justify-center border transition-colors ${
                            canScrollVideoDown
                              ? "border-slate-300 text-cic-900 hover:bg-slate-100"
                              : "border-slate-100 text-slate-300 cursor-not-allowed"
                          }`}
                          aria-label="Scroll down"
                        >
                          <ChevronDown className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })()
            )}
          </div>
        </div>

        {/* Modal stays outside the grid */}
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
    </div>
  );
}

export default HomePage;
