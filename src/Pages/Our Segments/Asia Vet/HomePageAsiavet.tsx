import { useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import HeroSectionSegments from "../components/HeroSection";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import DocumentCard from "../components/DocumentCard";
import EventItem from "../components/EventItem";
import PinnedCard from "../components/PinnedCard";
import AnnouncementItem from "../components/AnnouncementItem";
import { LockIcon } from "lucide-react";
import slide1 from "../../../assets/slide1.png";

import { mapPathToSegment } from "@/utils/segmentMapper";
import { useDocuments } from "@/hooks/useDocuments";
import { useEvents } from "@/hooks/useEvents";
import { useAnnouncements } from "@/hooks/useAnnouncements";
import { viewDocument, downloadDocument } from "@/lib/api/documentApi";

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
      title: "Welcome to Asia Vet (Pvt) Ltd",
      subtitle: "Sri Lanka's Leading Livestock Solutions Provider",
      image: slide1,
    },
    {
      title: "Quality You Can Trust",
      subtitle: "Delivering excellence in animal nutrition since 1964",
      image: slide1,
    },
  ];

  return (
    <div>
      <HeroSectionSegments slides={slides} />
      <section className="max-w-7xl mx-auto px-2 py-4">
        <div className="grid md:grid-cols-2 gap-10 items-start">
          {/* ================= LEFT ================= */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <h2 className="text-3xl font-bold text-blue-900">Documents</h2>
              <button
                onClick={() => setShowPrivate(false)}
                className={`text-xs px-2 py-1 rounded-full border ${!showPrivate ? "bg-blue-900 text-white" : "text-gray-500"}`}
              >
                👁 Public
              </button>
              <button
                onClick={() => {
                  if (!isAuthorized) {
                    setShowAuthModal(true);
                  } else {
                    setShowPrivate(true);
                  }
                }}
                className={`text-xs px-2 py-1 rounded-full border ${showPrivate ? "bg-red-600 text-white" : "text-gray-500"}`}
              >
                🔒 Private
              </button>
            </div>

            <Input
              placeholder="Search Forms & Templates"
              className="mb-4 rounded-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />

            <div className="flex gap-2 mb-6 flex-wrap">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-full text-sm border ${activeTab === tab ? "bg-blue-900 text-white" : "text-gray-600 bg-white"}`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {docsLoading ? (
              <p className="text-sm text-gray-400 py-6 text-center">
                Loading documents...
              </p>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
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
                  <p className="text-sm text-gray-400 col-span-full py-6 text-center">
                    No documents found
                  </p>
                )}
              </div>
            )}

            {pinnedDocs.length > 0 && (
              <>
                <h3 className="text-xl font-semibold text-blue-900 mt-10 mb-4">
                  Pinned for you
                </h3>
                <div className="space-y-3">
                  {pinnedDocs.map((doc) => (
                    <PinnedCard
                      key={doc.id}
                      title={doc.title}
                      category={doc.category}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          {/* ================= RIGHT ================= */}
          <div className="w-full flex flex-col">
            <h2 className="text-3xl font-bold text-blue-900 mb-6">Calendar</h2>
            <div className="border rounded-xl p-4 shadow-sm w-full mb-8">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="w-full [--cell-size:--spacing(10)]"
                classNames={{
                  month: "w-full",
                  table: "w-full",
                  weekdays: "w-full",
                  week: "w-full",
                  day: "flex-1",
                }}
              />
            </div>

            <h3 className="text-xl font-semibold text-blue-900 mb-4">
              Upcoming Events
            </h3>
            <div className="w-full space-y-4">
              {eventsLoading ? (
                <p className="text-sm text-gray-400">Loading events...</p>
              ) : filteredEvents.length > 0 ? (
                filteredEvents.map((event) => {
                  const [year, month, day] = event.date.split("-").map(Number);
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
                <p className="text-sm text-gray-400">
                  No events for selected date
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-2 pt-2 pb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-3xl font-bold text-blue-900 mb-6">
            Announcements
          </h2>
          {announcements.length > 3 && (
            <button
              onClick={() => setShowAllAnnouncements((prev) => !prev)}
              className="text-sm text-blue-600 hover:underline"
            >
              {showAllAnnouncements ? "Show less ↑" : "View all →"}
            </button>
          )}
        </div>
        <div className="space-y-3">
          {announcementsLoading ? (
            <p className="text-sm text-gray-400">Loading announcements...</p>
          ) : (
            <>
              {visibleAnnouncements.map((a) => (
                <AnnouncementItem key={a.id} {...a} />
              ))}
              {announcements.length === 0 && (
                <p className="text-sm text-gray-400">No announcements</p>
              )}
            </>
          )}
        </div>
      </section>

      {/* Auth Modal — unchanged */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-zinc-900 p-7 rounded-2xl w-80 shadow-sm border border-zinc-100 dark:border-zinc-800">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-9 h-9 rounded-full bg-blue-50 dark:bg-blue-950 flex items-center justify-center">
                <LockIcon className="w-4 h-4 text-blue-500" />
              </div>
              <div>
                <p className="font-medium text-sm text-zinc-900 dark:text-zinc-100">
                  Private access
                </p>
                <p className="text-xs text-zinc-400">
                  Enter your credentials to continue
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-3 mb-5">
              <div>
                <label className="text-xs text-zinc-400 mb-1 block">
                  Username
                </label>
                <input
                  placeholder="your username"
                  className="w-full border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm bg-transparent focus:outline-none focus:ring-1 focus:ring-zinc-300"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs text-zinc-400 mb-1 block">
                  Password
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm bg-transparent focus:outline-none focus:ring-1 focus:ring-zinc-300"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
            <div className="flex justify-end items-center gap-2">
              <button
                onClick={() => setShowAuthModal(false)}
                className="text-sm text-zinc-400 hover:text-zinc-600 px-3 py-1.5"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (username === "admin" && password === "1234") {
                    setIsAuthorized(true);
                    setShowPrivate(true);
                    setShowAuthModal(false);
                  } else {
                    alert("Invalid credentials");
                  }
                }}
                className="bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-sm font-medium px-4 py-1.5 rounded-lg hover:opacity-90 transition-opacity"
              >
                Sign in
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
