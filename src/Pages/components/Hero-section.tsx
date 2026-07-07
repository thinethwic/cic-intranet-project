import { useState, useEffect, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  ChevronLeft,
  ChevronRight,
  ToolCaseIcon,
  Globe,
  Headset,
  ListTodo,
} from "lucide-react";
import { FaFacebookF, FaHouseDamage, FaYoutube } from "react-icons/fa";
import { Link } from "react-router-dom";

import slide1 from "../../assets/chicken_farm.png";
import slide2 from "../../assets/Mask-group5.avif";
import slide3 from "../../assets/Mask-group3.avif";
import slide4 from "../../assets/poulry image.png";

import { CalendarDays } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { useEvents } from "@/hooks/useEvents";
import EventItem from "../Our Segments/components/EventItem";
import { getHoliday } from "@/data/sriLankanHolidays";

interface Slide {
  image: string;
}

const slides: Slide[] = [
  {
    image: slide1,
  },
  {
    image: slide2,
  },
  {
    image: slide3,
  },
  {
    image: slide4,
  },
];

const categories = [
  { label: "Help Desk", icon: Headset, Link: "/helpdesk" },
  { label: "To-Do Tasks", icon: ListTodo, Link: "/tasks" },
  {
    label: "Gallery HR",
    icon: FaHouseDamage,
    Link: "https://app.galleryhr.com/",
  },
  {
    label: "Asset Tool",
    icon: ToolCaseIcon,
    Link: "https://cicinventory.netlify.app",
  },
  { label: "Official Website", icon: Globe, Link: "https://www.cic.lk/" },
  {
    label: "Facebook Page",
    icon: FaFacebookF,
    Link: "https://web.facebook.com/cicfeedsgrp",
  },
  {
    label: "Youtube Page",
    icon: FaYoutube,
    Link: "https://youtube.com/@cicfeedsgroup",
  },
];

const AUTO_SLIDE_INTERVAL = 8000;

export default function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [cardsVisible, setCardsVisible] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, AUTO_SLIDE_INTERVAL);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => setCardsVisible(true), 300);
    return () => clearTimeout(timeout);
  }, []);

  const { events, loading: eventsLoading } = useEvents();
  const [date, setDate] = useState<Date | undefined>(new Date());

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
  const selectedHoliday = getHoliday(selectedDateStr);

  return (
    <section className="relative w-full min-h-[520px] md:min-h-[440px] lg:min-h-[480px] overflow-hidden flex flex-col">
      {/* Background slides — no overlays */}
      {slides.map((slide, i) => (
        <div
          key={i}
          className="absolute inset-0 transition-opacity duration-700"
          style={{ opacity: i === currentSlide ? 1 : 0 }}
        >
          <img
            src={slide.image}
            className="w-full h-full object-cover"
            loading={i === 0 ? "eager" : "lazy"}
            decoding={i === 0 ? "sync" : "async"}
          />
        </div>
      ))}

      {/*
        Shared responsive row — both the category cards and the events panel
        now live inside ONE flex container instead of two independent
        `absolute` blocks. This is the key fix:
          - `justify-between` lets flexbox negotiate the space between them,
            so they can never physically overlap on narrower (14") screens.
          - `max-w-[1800px] mx-auto` caps how far apart they can drift on
            very wide / ultrawide monitors, instead of leaving a dead gap.
      */}
      <div
        className="absolute inset-0 z-20 flex items-center justify-between gap-4
                   px-4 sm:px-6 md:px-10 lg:px-16
                   max-w-[1800px] mx-auto"
      >
        {/* Category cards — left side, 3x3 grid with horizontal scroll for overflow */}
        <div className="min-w-0 max-w-[362px] sm:max-w-[410px] md:max-w-[620px] shrink">
          <div className="overflow-x-auto category-scroll pb-1.5 pr-1">
            <div className="grid grid-rows-2 grid-flow-col gap-3 w-max">
              {categories.map(({ label, icon: Icon, Link: link }, i) => (
                <Link to={link} key={i}>
                  <div
                    style={{
                      opacity: cardsVisible ? 1 : 0,
                      transform: cardsVisible
                        ? "translateY(0)"
                        : "translateY(20px)",
                      transition: `opacity 0.5s ease, transform 0.5s ease`,
                      transitionDelay: `${300 + i * 120}ms`,
                    }}
                  >
                    <Card className="bg-white/36 backdrop-blur-sm border border-white/60 hover:bg-white/60 transition-all cursor-pointer group shadow-md w-28 sm:w-32 md:w-36">
                      <CardContent className="flex flex-col items-center justify-center py-4 px-2">
                        <div className="mb-2 p-2.5 rounded-2xl bg-blue-50 group-hover:bg-blue-100 transition-all group-hover:scale-110">
                          <Icon className="w-4 h-4 md:w-7 md:h-7 stroke-[1.5] text-[oklch(37.9%_0.146_265.522)]" />
                        </div>
                        <p className="text-xs sm:text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity tracking-wide text-center leading-tight text-gray-700">
                          {label}
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Upcoming Events — right side, with glass background panel */}
        <div
          className="hidden lg:flex flex-col gap-3
                     w-full max-w-[700px] lg:w-[46vw] xl:w-[42vw] min-w-[420px]
                     h-[calc(100%-2rem)]
                     bg-white/50 backdrop-blur-md rounded-2xl border border-white/60 shadow-xl p-4"
          style={{
            opacity: cardsVisible ? 1 : 0,
            transform: cardsVisible ? "translateY(0)" : "translateY(20px)",
            transition: "opacity 0.5s ease 0.4s, transform 0.5s ease 0.4s",
          }}
        >
          {/* Header — icon box + title */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cic-900 flex items-center justify-center shrink-0">
              <CalendarDays className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-cic-900 tracking-tight drop-shadow-sm">
              Upcoming Events
            </h2>
          </div>

          {/* Events (left) + Calendar (right) */}
          <div className="flex gap-3 flex-1 min-h-0">
            {/* Events list */}
            <div className="flex-1 min-w-0 bg-white rounded-2xl border border-slate-200 shadow-lg flex flex-col overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/80 shrink-0">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
                  Events
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {date?.toLocaleDateString("en-GB", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                  })}
                </p>
                {selectedHoliday && (
                  <p
                    className={`text-xs font-semibold mt-1 ${
                      selectedHoliday.type === "poya"
                        ? "text-amber-600"
                        : "text-red-600"
                    }`}
                  >
                    {selectedHoliday.type === "poya" ? "🌕" : "🎉"}{" "}
                    {selectedHoliday.name}
                  </p>
                )}
              </div>
              <div className="overflow-y-auto flex-1 p-3 space-y-2">
                {eventsLoading ? (
                  <div className="h-full flex items-center justify-center py-8">
                    <div className="w-5 h-5 border-2 border-cic-600 border-t-transparent rounded-full animate-spin" />
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

            {/* Calendar */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-lg p-3 w-[250px] shrink-0 overflow-hidden">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="w-full p-0 [--cell-size:1.85rem]"
                modifiers={{
                  hasEvent: (day) => eventDates.has(formatDate(day)),
                  publicHoliday: (day) =>
                    getHoliday(formatDate(day))?.type === "public",
                  poyaDay: (day) =>
                    getHoliday(formatDate(day))?.type === "poya",
                }}
                modifiersClassNames={{
                  hasEvent: "bg-cic-100 text-cic-800 rounded-full font-bold",
                  publicHoliday:
                    "bg-red-100 text-red-700 rounded-full font-bold",
                  poyaDay: "bg-amber-200 text-amber-700 rounded-full font-bold",
                }}
                classNames={{
                  month: "w-full",
                  table: "w-full border-collapse",
                  weekdays: "w-full",
                  week: "w-full",
                  day: "flex-1 text-center",
                  day_selected: "bg-cic-900 text-white rounded-full",
                  day_today: "font-bold text-cic-900",
                }}
              />

              {/* Legend */}
              <div className="mt-2 pt-2 border-t border-slate-100 space-y-1">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-cic-100 border border-cic-200 shrink-0" />
                  <span className="text-[10px] text-slate-500">Event day</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-red-100 border border-red-200 shrink-0" />
                  <span className="text-[10px] text-slate-500">
                    Public holiday
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-amber-200 border border-amber-300 shrink-0" />
                  <span className="text-[10px] text-slate-500">Poya day</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Prev button */}
      <button
        onClick={() =>
          setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
        }
        className="absolute left-3 top-1/2 -translate-y-1/2 z-30 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/70 hover:bg-white border border-white/50 shadow-md backdrop-blur-sm flex items-center justify-center transition-all hover:scale-105"
      >
        <ChevronLeft className="w-5 h-5 md:w-6 md:h-6 text-gray-700" />
      </button>

      {/* Next button */}
      <button
        onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)}
        className="absolute right-3 top-1/2 -translate-y-1/2 z-30 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/70 hover:bg-white border border-white/50 shadow-md backdrop-blur-sm flex items-center justify-center transition-all hover:scale-105"
      >
        <ChevronRight className="w-5 h-5 md:w-6 md:h-6 text-gray-700" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentSlide(i)}
            className={`transition-all rounded-full ${
              i === currentSlide
                ? "w-5 h-2 bg-white shadow-sm"
                : "w-2 h-2 bg-white/50"
            }`}
          />
        ))}
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.5s ease forwards;
        }
        .category-scroll {
          scrollbar-width: thin;
          scrollbar-color: rgba(255, 255, 255, 0.6) transparent;
        }
        .category-scroll::-webkit-scrollbar {
          height: 5px;
        }
        .category-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .category-scroll::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.6);
          border-radius: 9999px;
        }
        .category-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.85);
        }
      `}</style>
    </section>
  );
}
