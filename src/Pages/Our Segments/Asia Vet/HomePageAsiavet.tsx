import React, { useMemo } from "react";
import HeroSectionSegments from "../components/HeroSection";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";

import DocumentCard from "../components/DocumentCard";
import EventItem from "../components/EventItem";
import PinnedCard from "../components/PinnedCard";
import slide1 from "../../../assets/slide1.png";

interface Document {
  id: number;
  title: string;
  category: string;
  type: "PDF" | "XLSX" | "DOCS";
  isPinned: boolean;
  fileUrl: string; // 👈 add this
}

interface Event {
  id: number;
  title: string;
  time: string;
  date: string; // format: YYYY-MM-DD
}

interface Slide {
  title: string;
  subtitle: string;
  image: string;
}

export default function HomePageAsiavet() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [activeTab, setActiveTab] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const tabs = ["All", "HR & Policies", "Finance", "Operations"];

  const documents: Document[] = [
    {
      id: 1,
      title: "Employee Handbook 2026",
      category: "HR · Updated Today",
      type: "PDF",
      isPinned: true,
      fileUrl: "/documents/employee-handbook-2026.pdf", // 👈 path in /public folder
    },
    {
      id: 2,
      title: "Finance Report 2026",
      category: "Finance · Updated Today",
      type: "XLSX",
      isPinned: false,
      fileUrl: "/documents/finance-report-2026.xlsx",
    },
    {
      id: 3,
      title: "Leave Request Form",
      category: "HR · Standard form",
      type: "DOCS",
      isPinned: true,
      fileUrl: "/documents/leave-request-form.docx",
    },
    // ...repeat for duplicates
  ];

  const pinnedDocs = documents.filter((doc) => doc.isPinned);

  const filteredDocuments = useMemo(() => {
    return documents.filter((doc) => {
      const matchesTab =
        activeTab === "All" ||
        (activeTab === "HR & Policies" && doc.category.startsWith("HR")) ||
        (activeTab === "Finance" && doc.category.startsWith("Finance")) ||
        (activeTab === "Operations" && doc.category.startsWith("Operations"));

      const matchesSearch =
        searchQuery === "" ||
        doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.category.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesTab && matchesSearch;
    });
  }, [activeTab, searchQuery]);

  const events: Event[] = [
    {
      id: 1,
      title: "Meeting with HR for Aisa Vet",
      time: "10:00 AM - Meeting Room",
      date: "2026-04-09",
    },
    {
      id: 1,
      title: "Meeting with HR for Aisa Vet",
      time: "10:00 AM - Meeting Room",
      date: "2026-04-09",
    },
    {
      id: 1,
      title: "Meeting with HR for Aisa Vet",
      time: "10:00 AM - Meeting Room",
      date: "2026-04-09",
    },
    {
      id: 1,
      title: "Meeting with HR for Aisa Vet",
      time: "10:00 AM - Meeting Room",
      date: "2026-04-09",
    },
    {
      id: 2,
      title: "Finance Review Meeting",
      time: "2:00 PM - Board Room",
      date: "2026-04-10",
    },
  ];

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

    return date.toISOString().split("T")[0]; // YYYY-MM-DD
  }

  const selectedDateStr = formatDate(date);

  const filteredEvents = events.filter(
    (event) => event.date === selectedDateStr,
  );
  return (
    <div>
      <HeroSectionSegments slides={slides} />
      <section className="max-w-7xl mx-auto px-2 py-4">
        <div className="grid md:grid-cols-2 gap-10 items-start">
          {/* ================= LEFT ================= */}
          <div>
            <h2 className="text-3xl font-bold text-blue-900 mb-6">Documents</h2>

            {/* Search */}
            <Input
              placeholder="Search Forms & Templates"
              className="mb-4 rounded-full"
              value={searchQuery} // 3️⃣ ADD HERE
              onChange={(e) => setSearchQuery(e.target.value)} // 4️⃣ ADD HERE
            />

            {/* Tabs */}
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

            {/* Documents Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredDocuments.map(
                (
                  doc,
                  i, // 5️⃣ CHANGE documents → filteredDocuments
                ) => (
                  <DocumentCard key={i} {...doc} />
                ),
              )}
              {filteredDocuments.length === 0 && ( // 6️⃣ ADD empty state
                <p className="text-sm text-gray-400 col-span-full py-6 text-center">
                  No documents found
                </p>
              )}
            </div>

            {/* 🔥 Pinned Section */}
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
          <div className="w-full flex flex-col items-end">
            <h2 className="text-3xl font-bold text-blue-900 mb-6 w-full max-w-md">
              Calendar
            </h2>

            <div className="border rounded-xl p-4 shadow-sm w-full max-w-md mb-8">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="w-fit"
              />
            </div>

            <h3 className="text-xl font-semibold text-blue-900 mb-4 w-full max-w-md">
              Up Coming Event
            </h3>

            <div className="w-full max-w-md space-y-4">
              {filteredEvents.length > 0 ? (
                filteredEvents.map((event) => {
                  const eventDate = new Date(event.date);

                  return (
                    <EventItem
                      key={event.id}
                      day={eventDate.getDate().toString()}
                      month={eventDate.toLocaleString("default", {
                        month: "short",
                      })}
                      title={event.title}
                      time={event.time}
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
    </div>
  );
}
