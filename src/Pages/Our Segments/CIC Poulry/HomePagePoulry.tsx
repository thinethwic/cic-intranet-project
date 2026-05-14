import { useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import HeroSectionSegments from "../components/HeroSection";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import DocumentCard from "../components/DocumentCard";
import EventItem from "../components/EventItem";
import PinnedCard from "../components/PinnedCard";
import AnnouncementItem from "../components/AnnouncementItem";
import {
  LockIcon,
  Search,
  Bell,
  CalendarDays,
  FileText,
  Pin,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import slide1 from "../../../assets/cic poulry slide.jpg";
import slide2 from "../../../assets/cic poulry slide 2.jpg";

import { mapPathToSegment } from "@/utils/segmentMapper";
import { useDocuments } from "@/hooks/useDocuments";
import { useEvents } from "@/hooks/useEvents";
import { useAnnouncements } from "@/hooks/useAnnouncements";
import { viewDocument, downloadDocument } from "@/lib/api/documentApi";

import { loginAuthorized } from "@/lib/api/authApi";
import ButtonsSection from "../components/ButtonsSection";

interface Slide {
  title: string;
  subtitle: string;
  image: string;
}

export default function HomePageAsiavet() {
  const { pathname } = useLocation();

  // ✅ slice(1) removes leading "/" → "our-segments/aisa-vet"
  const currentPath = pathname.slice(1);
  const currentSegment = mapPathToSegment(currentPath);

  // ✅ Guard — if segment not found, show nothing or fallback

  const [date, setDate] = useState<Date | undefined>(new Date());
  const [activeTab, setActiveTab] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAllAnnouncements, setShowAllAnnouncements] = useState(false);
  const [showPrivate, setShowPrivate] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  // ✅ Real API data filtered by segment
  const { documents, loading: docsLoading } = useDocuments(currentSegment);
  const { events, loading: eventsLoading } = useEvents(currentSegment);
  // ✅ Always default to empty array
  const { announcements = [], loading: announcementsLoading } =
    useAnnouncements(currentSegment);

  const visibleAnnouncements = showAllAnnouncements
    ? announcements
    : announcements.slice(0, 3); // ✅ safe now

  const tabs = ["All", "HR & Policies", "Finance", "Operations"];

  const pinnedDocs = documents.filter((doc) => doc.isPinned);

  const filteredDocuments = useMemo(() => {
    return documents.filter((doc) => {
      // ✅ match backend enum category directly
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

  const eventDates = useMemo(
    () => new Set(events.map((e) => e.date)),
    [events],
  );

  // ✅ View handler
  const handleView = async (id: number) => {
    try {
      const blob = await viewDocument(id);
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");
    } catch {
      alert("Failed to view document");
    }
  };

  // ✅ Download handler
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

  // Replace the hardcoded check in the Sign in button onClick:
  const handleAuthorizedLogin = async () => {
    if (!username || !password) return;
    setAuthError(null);
    setAuthLoading(true);
    try {
      const data = await loginAuthorized(username, password);

      // ✅ Only AUTHORIZED or ADMIN role can access private docs
      if (
        data.role !== "AUTHORIZED" &&
        data.role !== "ADMIN" &&
        data.role !== "SUPER_ADMIN"
      ) {
        setAuthError("You are not authorized to access private documents");
        return;
      }

      // ✅ Store separately from admin token
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

  function formatDate(date: Date | undefined) {
    if (!date) return "";
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  const selectedDateStr = formatDate(date);
  const filteredEvents = events.filter((e) => e.date === selectedDateStr);

  const slides: Slide[] = [
    {
      title: "Welcome to CIC Poulry (Pvt) Ltd",
      subtitle: "Sri Lanka's Leading Livestock Solutions Provider",
      image: slide1,
    },
    {
      title: "Quality You Can Trust",
      subtitle: "Delivering excellence in animal nutrition since 1964",
      image: slide2,
    },
  ];

  return (
    <div className="bg-slate-50 min-h-screen">
      <HeroSectionSegments slides={slides} />
      <ButtonsSection segment={currentSegment ?? undefined} />

      {/* ── Announcements + Calendar ── */}
      <section className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Stack on mobile, side-by-side on lg+ */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_580px] gap-6 items-start">
          {/* LEFT — Announcements */}
          <div className="min-w-0">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-900 flex items-center justify-center flex-shrink-0">
                  <Bell className="w-4 h-4 text-white" />
                </div>
                <h2 className="text-xl sm:text-3xl font-bold text-slate-800 tracking-tight">
                  Announcements
                </h2>
                {announcements.length > 0 && (
                  <span className="text-[11px] font-semibold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                    {announcements.length}
                  </span>
                )}
              </div>
              {announcements.length > 3 && (
                <button
                  onClick={() => setShowAllAnnouncements((prev) => !prev)}
                  className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors"
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

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              {announcementsLoading ? (
                <div className="px-5 py-10 flex items-center justify-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    <p className="text-xs text-slate-400">
                      Loading announcements...
                    </p>
                  </div>
                </div>
              ) : announcements.length === 0 ? (
                <div className="px-5 py-10 flex flex-col items-center justify-center gap-2">
                  <Bell className="w-8 h-8 text-slate-200" />
                  <p className="text-sm text-slate-400">
                    No announcements at this time
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {visibleAnnouncements.map((a) => (
                    <div
                      key={a.id}
                      className="px-4 sm:px-5 py-4 hover:bg-slate-50 transition-colors"
                    >
                      <AnnouncementItem {...a} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT — Calendar + Upcoming Events */}
          <div className="w-full flex flex-col">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-blue-900 flex items-center justify-center flex-shrink-0">
                <CalendarDays className="w-4 h-4 text-white" />
              </div>
              <h2 className="text-xl sm:text-3xl font-bold text-slate-800 tracking-tight">
                Calendar
              </h2>
            </div>

            {/* Mobile: stacked. sm+: side by side with fixed height */}
            <div className="flex flex-col sm:flex-row gap-4 sm:h-[295px]">
              {/* Calendar — full width on mobile, fixed 270px on sm+ */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-3 w-full sm:w-[270px] sm:flex-shrink-0">
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

              {/* Upcoming Events — natural height on mobile, fills sm+ */}
              <div className="flex-1 min-w-0 flex flex-col min-h-[200px] sm:h-full">
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-full overflow-hidden">
                  <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/80 flex-shrink-0">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
                      Upcoming Events
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
            </div>
          </div>
        </div>
      </section>

      {/* ── Documents Section ── */}
      <section className="max-w-[1400px] mx-auto px-4 sm:px-6 pb-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-900 flex items-center justify-center flex-shrink-0">
              <FileText className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-xl sm:text-3xl font-bold text-slate-800 tracking-tight">
              Documents
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
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm px-4 sm:px-5 py-4 mb-5">
          <div className="flex flex-col gap-3">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search forms & templates..."
                className="pl-9 bg-slate-50 border-slate-200 rounded-xl h-9 text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            {/* Horizontally scrollable tabs on mobile */}
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

        {/* Document grid */}
        {docsLoading ? (
          <div className="py-16 flex flex-col items-center gap-3">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-slate-400">Loading documents...</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
            {filteredDocuments.map((doc) => (
              <DocumentCard
                key={doc.id}
                title={doc.title}
                category={doc.category}
                type={doc.type}
                fileUrl={doc.fileUrl}
                allowDownload={doc.allowDownload}
                allowView={doc.allowView}
                onView={() => handleView(doc.id)}
                onDownload={() => handleDownload(doc.id, doc.title)}
              />
            ))}
            {filteredDocuments.length === 0 && (
              <div className="col-span-full py-16 flex flex-col items-center gap-3">
                <FileText className="w-10 h-10 text-slate-200" />
                <p className="text-sm text-slate-400">No documents found</p>
              </div>
            )}
          </div>
        )}

        {/* Pinned docs */}
        {pinnedDocs.length > 0 && (
          <div className="mt-8">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-7 h-7 rounded-lg bg-amber-500 flex items-center justify-center flex-shrink-0">
                <Pin className="w-3.5 h-3.5 text-white" />
              </div>
              <h3 className="text-base font-bold text-slate-800">
                Pinned for you
              </h3>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-100">
              {pinnedDocs.map((doc) => (
                <div
                  key={doc.id}
                  className="px-4 sm:px-5 py-3 hover:bg-slate-50 transition-colors"
                >
                  <PinnedCard title={doc.title} category={doc.category} />
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* ── Auth Modal — slides up from bottom on mobile ── */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center z-50">
          <div className="bg-white rounded-t-3xl sm:rounded-2xl w-full sm:w-[360px] shadow-2xl border border-slate-100 overflow-hidden">
            {/* Mobile drag handle */}
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
