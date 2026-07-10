import { useState, useEffect, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  ToolCaseIcon,
  Globe,
  Headset,
  ListTodo,
  FileIcon,
  MailIcon,
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
  {
    label: "Help Desk",
    icon: Headset,
    Link: "/helpdesk",
    iconBg: "bg-blue-100 group-hover:bg-blue-200",
    iconColor: "text-blue-600",
  },
  {
    label: "To-Do Tasks",
    icon: ListTodo,
    Link: "/tasks",
    iconBg: "bg-violet-100 group-hover:bg-violet-200",
    iconColor: "text-violet-600",
  },
  {
    label: "Gallery HR",
    icon: FaHouseDamage,
    Link: "https://app.galleryhr.com/",
    iconBg: "bg-orange-100 group-hover:bg-orange-200",
    iconColor: "text-orange-600",
  },
  {
    label: "Asset Tool",
    icon: ToolCaseIcon,
    Link: "https://192.168.120.10:81",
    iconBg: "bg-teal-100 group-hover:bg-teal-200",
    iconColor: "text-teal-600",
  },
  {
    label: "Official Website",
    icon: Globe,
    Link: "https://www.cic.lk/",
    iconBg: "bg-indigo-100 group-hover:bg-indigo-200",
    iconColor: "text-indigo-600",
  },
  {
    label: "Facebook Page",
    icon: FaFacebookF,
    Link: "https://web.facebook.com/cicfeedsgrp",
    iconBg: "bg-sky-100 group-hover:bg-sky-200",
    iconColor: "text-sky-600",
  },
  {
    label: "Youtube Page",
    icon: FaYoutube,
    Link: "https://youtube.com/@cicfeedsgroup",
    iconBg: "bg-red-100 group-hover:bg-red-200",
    iconColor: "text-red-600",
  },
  {
    label: "Google Docs",
    icon: FileIcon,
    Link: "https://docs.google.com/document",
    iconBg: "bg-blue-100 group-hover:bg-blue-200",
    iconColor: "text-blue-600",
  },
  {
    label: "Google Sheets",
    icon: FileIcon,
    Link: "https://docs.google.com/spreadsheets",
    iconBg: "bg-emerald-100 group-hover:bg-emerald-200",
    iconColor: "text-emerald-600",
  },
  {
    label: "Google Slides",
    icon: FileIcon,
    Link: "https://docs.google.com/presentation",
    iconBg: "bg-amber-100 group-hover:bg-amber-200",
    iconColor: "text-amber-600",
  },
  {
    label: "Gmail",
    icon: MailIcon,
    Link: "https://mail.google.com",
    iconBg: "bg-red-100 group-hover:bg-red-200",
    iconColor: "text-red-600",
  },
];

const AUTO_SLIDE_INTERVAL = 8000;

export default function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [cardsVisible, setCardsVisible] = useState(false);

  const CATEGORY_VISIBLE = 8;
  const categoryTotalPages = Math.ceil(categories.length / CATEGORY_VISIBLE);
  const [categoryPage, setCategoryPage] = useState(0);
  const categoryStart = categoryPage * CATEGORY_VISIBLE;
  const canScrollCategoryUp = categoryPage > 0;
  const canScrollCategoryDown = categoryPage < categoryTotalPages - 1;
  const visibleCategories = categories.slice(
    categoryStart,
    categoryStart + CATEGORY_VISIBLE,
  );

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
    <>
      {/* Banner — image slides only */}
      <section className="relative w-full h-[280px] sm:h-[280px] md:h-[300px] lg:h-[280px] overflow-hidden">
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

        {/* Prev button */}
        <div className="absolute inset-y-0 left-3 z-30 flex items-center">
          <button
            onClick={() =>
              setCurrentSlide(
                (prev) => (prev - 1 + slides.length) % slides.length,
              )
            }
            className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/70 hover:bg-white border border-white/50 shadow-md backdrop-blur-sm flex items-center justify-center transition-all hover:scale-105"
          >
            <ChevronLeft className="w-5 h-5 md:w-6 md:h-6 text-gray-700" />
          </button>
        </div>

        {/* Next button */}
        <div className="absolute inset-y-0 right-3 z-30 flex items-center">
          <button
            onClick={() =>
              setCurrentSlide((prev) => (prev + 1) % slides.length)
            }
            className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/70 hover:bg-white border border-white/50 shadow-md backdrop-blur-sm flex items-center justify-center transition-all hover:scale-105"
          >
            <ChevronRight className="w-5 h-5 md:w-6 md:h-6 text-gray-700" />
          </button>
        </div>

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
      </section>

      {/* Below banner — category shortcuts + upcoming events */}
      <div className="max-w-full mx-auto px-6 sm:px-8 py-4 sm:py-4">
        <div className="max-w-[1800px] mx-auto flex flex-col lg:flex-row items-start gap-4">
          {/* Category cards — responsive grid; paginates a full set at a time once a 9th card is added */}
          <div className="min-w-0 w-full lg:max-w-[620px] shrink pt-7">
            <div className="flex gap-1 sm:gap-2 items-center">
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 sm:gap-3 w-full min-w-0">
                {visibleCategories.map(
                  ({ label, icon: Icon, Link: link, iconBg, iconColor }, i) => (
                    <Link to={link} key={categoryStart + i} className="min-w-0">
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
                        <Card className="bg-white border border-slate-200 hover:border-slate-300 hover:shadow-lg hover:opacity-100 transition-all cursor-pointer group shadow-sm w-full">
                          <CardContent className="flex flex-col items-center justify-center py-3 sm:py-4 px-1 sm:px-2">
                            <div
                              className={`mb-1.5 sm:mb-2 p-2 sm:p-2.5 rounded-2xl transition-all group-hover:scale-110 ${iconBg}`}
                            >
                              <Icon
                                className={`w-4 h-4 md:w-7 md:h-7 stroke-[1.5] ${iconColor}`}
                              />
                            </div>
                            <p className="text-[10px] sm:text-sm font-semibold tracking-wide text-center opacity-0 group-hover:opacity-100 leading-tight text-gray-700 truncate w-full">
                              {label}
                            </p>
                          </CardContent>
                        </Card>
                      </div>
                    </Link>
                  ),
                )}
              </div>

              {/* Scroll buttons — vertical, right side (mirrors NEWS panel) */}
              {categories.length > CATEGORY_VISIBLE && (
                <div className="flex flex-col justify-center gap-1.5 sm:gap-2 shrink-0">
                  <button
                    onClick={() => setCategoryPage((p) => Math.max(0, p - 1))}
                    disabled={!canScrollCategoryUp}
                    className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center border transition-colors ${
                      canScrollCategoryUp
                        ? "border-slate-300 text-slate-600 hover:bg-slate-100"
                        : "border-slate-100 text-slate-300 cursor-not-allowed"
                    }`}
                    aria-label="Previous set"
                  >
                    <ChevronUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </button>

                  <div className="flex flex-col items-center gap-1 py-1">
                    {Array.from({ length: categoryTotalPages }).map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCategoryPage(i)}
                        className={`w-1.5 rounded-full transition-all ${
                          i === categoryPage
                            ? "h-4 bg-cic-900"
                            : "h-1.5 bg-slate-300 hover:bg-slate-400"
                        }`}
                        aria-label={`Go to set ${i + 1}`}
                      />
                    ))}
                  </div>

                  <button
                    onClick={() =>
                      setCategoryPage((p) =>
                        Math.min(categoryTotalPages - 1, p + 1),
                      )
                    }
                    disabled={!canScrollCategoryDown}
                    className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center border transition-colors ${
                      canScrollCategoryDown
                        ? "border-slate-300 text-slate-600 hover:bg-slate-100"
                        : "border-slate-100 text-slate-300 cursor-not-allowed"
                    }`}
                    aria-label="Next set"
                  >
                    <ChevronDown className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Upcoming Events */}
          <div
            className="flex flex-col gap-3 w-full lg:flex-1
                       bg-slate-50 rounded-2xl border border-slate-200 shadow-sm p-4"
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
              <h2 className="text-xl sm:text-2xl font-bold text-cic-900 tracking-tight">
                Upcoming Events
              </h2>
            </div>

            {/* Events (left) + Calendar (right) */}
            <div className="flex flex-col md:flex-row gap-3 flex-1 min-h-0">
              {/* Events list */}
              <div className="flex-1 min-w-0 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
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
                <div className="overflow-y-auto flex-1 p-3 space-y-2 max-h-[280px]">
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
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-3 w-full md:w-[250px] shrink-0 overflow-hidden">
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
                    poyaDay:
                      "bg-amber-200 text-amber-700 rounded-full font-bold",
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
                    <span className="text-[10px] text-slate-500">
                      Event day
                    </span>
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
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.5s ease forwards;
        }
      `}</style>
    </>
  );
}
