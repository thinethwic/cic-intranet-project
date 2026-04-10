import { useMemo } from "react";
import HeroSectionSegments from "../components/HeroSection";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { useLocation } from "react-router-dom"; // ✅ changed from useParams

import DocumentCard from "../components/DocumentCard";
import EventItem from "../components/EventItem";
import PinnedCard from "../components/PinnedCard";
import slide1 from "../../../assets/slide1.png";

import { events, documents, announcements } from "@/Mock-data";
import AnnouncementItem from "../components/AnnouncementItem";

interface Slide {
  title: string;
  subtitle: string;
  image: string;
}

export default function HomePageAsiavet() {
  const { pathname } = useLocation();
  const currentSegment = pathname.slice(1); // "our-segments/asia-vet"

  const [date, setDate] = useState<Date | undefined>(new Date());
  const [activeTab, setActiveTab] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const [showAllAnnouncements, setShowAllAnnouncements] = useState(false);

  const tabs = ["All", "HR & Policies", "Finance", "Operations"];

  // ✅ Pinned docs for this segment only
  const pinnedDocs = documents.filter(
    (doc) => doc.isPinned && doc.segment === currentSegment,
  );

  // ✅ Filtered docs for this segment only
  const filteredDocuments = useMemo(() => {
    return documents.filter((doc) => {
      const matchesSegment = doc.segment === currentSegment;

      const matchesTab =
        activeTab === "All" ||
        (activeTab === "HR & Policies" && doc.category.startsWith("HR")) ||
        (activeTab === "Finance" && doc.category.startsWith("Finance")) ||
        (activeTab === "Operations" && doc.category.startsWith("Operations"));

      const matchesSearch =
        searchQuery === "" ||
        doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.category.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesSegment && matchesTab && matchesSearch;
    });
  }, [activeTab, searchQuery, currentSegment]);

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

  function formatDate(date: Date | undefined) {
    if (!date) return "";
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  const selectedDateStr = formatDate(date);

  const filteredEvents = events.filter(
    (event) =>
      event.date === selectedDateStr && event.segment === currentSegment,
  );

  const segmentAnnouncements = announcements.filter(
    (a) => a.segment === currentSegment,
  );

  const visibleAnnouncements = showAllAnnouncements
    ? segmentAnnouncements
    : segmentAnnouncements.slice(0, 3);

  return (
    <div>
      <HeroSectionSegments slides={slides} />
      <section className="max-w-7xl mx-auto px-2 py-4">
        <div className="grid md:grid-cols-2 gap-10 items-start">
          {/* ================= LEFT ================= */}
          <div>
            <h2 className="text-3xl font-bold text-blue-900 mb-6">Documents</h2>

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
                  className={`px-4 py-2 rounded-full text-sm border ${
                    activeTab === tab
                      ? "bg-blue-900 text-white"
                      : "text-gray-600 bg-white"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredDocuments.map((doc, i) => (
                <DocumentCard key={i} {...doc} />
              ))}
              {filteredDocuments.length === 0 && (
                <p className="text-sm text-gray-400 col-span-full py-6 text-center">
                  No documents found
                </p>
              )}
            </div>

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
              {filteredEvents.length > 0 ? (
                filteredEvents.map((event, i) => {
                  const [year, month, day] = event.date.split("-").map(Number);
                  const eventDate = new Date(year, month - 1, day);

                  return (
                    <EventItem
                      key={i}
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
          {segmentAnnouncements.length > 3 && (
            <button
              onClick={() => setShowAllAnnouncements((prev) => !prev)}
              className="text-sm text-blue-600 hover:underline"
            >
              {showAllAnnouncements ? "Show less ↑" : "View all →"}
            </button>
          )}
        </div>

        <div className="space-y-3">
          {visibleAnnouncements.map((a) => (
            <AnnouncementItem key={a.id} {...a} />
          ))}
          {segmentAnnouncements.length === 0 && (
            <p className="text-sm text-gray-400">No announcements</p>
          )}
        </div>
      </section>
    </div>
  );
}
