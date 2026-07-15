import {
  useState,
  useEffect,
  useMemo,
  useRef,
  type ComponentProps,
} from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight, Link2 } from "lucide-react";
import { Link } from "react-router-dom";

import slide1 from "../../assets/chicken_farm.png";
import slide3 from "../../assets/Mask-group3.avif";
import slide4 from "../../assets/poulry image.png";
import slide5 from "../../assets/video1.mp4";
import slide6 from "../../assets/video2.mp4";

import { CalendarDays } from "lucide-react";
import { Calendar, CalendarDayButton } from "@/components/ui/calendar";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { useEvents } from "@/hooks/useEvents";
import { useHeroShortcuts } from "@/hooks/useHeroShortcuts";
import {
  HERO_SHORTCUT_ICONS,
  HERO_SHORTCUT_COLORS,
} from "@/lib/heroShortcutIcons";
import EventItem from "../Our Segments/components/EventItem";
import { getHoliday } from "@/data/sriLankanHolidays";
import type { Event } from "@/types";

interface Slide {
  type: "image" | "video";
  src: string;
}

function formatDate(d: Date | undefined) {
  if (!d) return "";
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// Wraps each calendar day cell so hovering a date with an event or holiday
// shows a tooltip badge naming it, instead of requiring a click to find out.
function CalendarDayBadgeButton({
  eventsByDate,
  ...props
}: ComponentProps<typeof CalendarDayButton> & {
  eventsByDate: Map<string, Event[]>;
}) {
  const dateStr = formatDate(props.day.date);
  const dayEvents = eventsByDate.get(dateStr) ?? [];
  const holiday = getHoliday(dateStr);

  if (dayEvents.length === 0 && !holiday) {
    return <CalendarDayButton {...props} />;
  }

  const labels = [
    ...(holiday ? [holiday.name] : []),
    ...dayEvents.map((e) => e.title),
  ];

  return (
    <Tooltip>
      <TooltipTrigger render={<CalendarDayButton {...props} />} />
      <TooltipContent side="top" className="flex-col items-start gap-0.5">
        {labels.map((label, i) => (
          <span key={i}>{label}</span>
        ))}
      </TooltipContent>
    </Tooltip>
  );
}

const slides: Slide[] = [
  {
    type: "image",
    src: slide1,
  },
  {
    type: "video",
    src: slide5,
  },
  {
    type: "image",
    src: slide3,
  },
  {
    type: "video",
    src: slide6,
  },
  {
    type: "image",
    src: slide4,
  },
];

const IMAGE_SLIDE_DURATION = 4000;

export default function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [cardsVisible, setCardsVisible] = useState(false);
  const [openGroup, setOpenGroup] = useState<number | null>(null);
  const { groups: categoryGroups } = useHeroShortcuts();
  const activeGroup = categoryGroups.find((g) => g.id === openGroup);
  // Keyed by slide index — there can be multiple video slides, each needs
  // its own element reference (a single shared ref would only ever point
  // at whichever <video> mounted last).
  const videoRefs = useRef<Record<number, HTMLVideoElement | null>>({});

  const goToNextSlide = () =>
    setCurrentSlide((prev) => (prev + 1) % slides.length);

  // Image slides auto-advance on a fixed timer; video slides advance
  // themselves (via onEnded below) once they're actually finished playing.
  useEffect(() => {
    if (slides[currentSlide].type === "video") return;
    const timer = setTimeout(goToNextSlide, IMAGE_SLIDE_DURATION);
    return () => clearTimeout(timer);
  }, [currentSlide]);

  // Only play the current slide's video — otherwise it plays unseen in the
  // background and may already be near the end (or have fired onEnded) by
  // the time the carousel reaches it.
  useEffect(() => {
    Object.entries(videoRefs.current).forEach(([indexStr, video]) => {
      if (!video) return;
      if (Number(indexStr) === currentSlide) {
        video.currentTime = 0;
        video.play().catch(() => {});
      } else {
        video.pause();
      }
    });
  }, [currentSlide]);

  useEffect(() => {
    const timeout = setTimeout(() => setCardsVisible(true), 300);
    return () => clearTimeout(timeout);
  }, []);

  const { events, loading: eventsLoading } = useEvents();
  const [date, setDate] = useState<Date | undefined>(new Date());

  const selectedDateStr = formatDate(date);

  const eventDates = useMemo(
    () => new Set(events.map((e) => e.date)),
    [events],
  );

  const eventsByDate = useMemo(() => {
    const map = new Map<string, Event[]>();
    for (const e of events) {
      const list = map.get(e.date);
      if (list) list.push(e);
      else map.set(e.date, [e]);
    }
    return map;
  }, [events]);

  const filteredEvents = events.filter((e) => e.date === selectedDateStr);
  const selectedHoliday = getHoliday(selectedDateStr);

  return (
    <>
      {/* Hero — three columns: shortcuts (left) | image banner (middle) | upcoming events (right) */}
      <div className="max-w-full mx-auto px-6 sm:px-8 py-4 sm:py-4">
        <div className="max-w-[1800px] mx-auto flex flex-col lg:flex-row items-stretch gap-4">
          {/* LEFT — category shortcuts, grouped into Android-style folders */}
          <div className="w-full lg:w-64 shrink-0">
            <div className="h-60 lg:h-[420px] overflow-y-auto rounded-2xl border border-slate-200 bg-slate-50 shadow-sm p-2.5 grid grid-cols-2 gap-2 content-start">
              {categoryGroups.map((group, i) => (
                <button
                  key={group.id}
                  type="button"
                  onClick={() => setOpenGroup(group.id)}
                  className="w-full text-left"
                  style={{
                    opacity: cardsVisible ? 1 : 0,
                    transform: cardsVisible
                      ? "translateY(0)"
                      : "translateY(10px)",
                    transition: `opacity 0.4s ease, transform 0.4s ease`,
                    transitionDelay: `${150 + i * 60}ms`,
                  }}
                >
                  <Card className="bg-white border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all cursor-pointer group shadow-sm h-full">
                    <CardContent className="flex flex-col items-center justify-center gap-1.5 py-2.5 px-2 text-center">
                      <div className="grid grid-cols-2 gap-1 p-1.5 rounded-xl bg-slate-100 transition-all group-hover:scale-110 shrink-0">
                        {group.shortcuts.slice(0, 4).map((item) => {
                          const ItemIcon =
                            HERO_SHORTCUT_ICONS[item.iconName] ?? Link2;
                          const palette = HERO_SHORTCUT_COLORS[item.color];
                          return (
                            <div
                              key={item.id}
                              className={`w-3.5 h-3.5 rounded-[4px] flex items-center justify-center ${palette.iconBg}`}
                            >
                              <ItemIcon
                                className={`w-2.5 h-2.5 ${palette.iconColor}`}
                              />
                            </div>
                          );
                        })}
                      </div>
                      <p className="text-[11px] sm:text-xs font-semibold text-slate-800 leading-tight line-clamp-2 wrap-break-word w-full">
                        {group.name}
                      </p>
                    </CardContent>
                  </Card>
                </button>
              ))}
            </div>
          </div>

          {/* Folder pop-out — shows the group's shortcuts */}
          <Dialog
            open={!!openGroup}
            onOpenChange={(o) => !o && setOpenGroup(null)}
          >
            <DialogContent className="sm:max-w-sm">
              <DialogHeader>
                <DialogTitle>{activeGroup?.name}</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-3 gap-3 pt-1">
                {activeGroup?.shortcuts.map((item) => {
                  const ItemIcon = HERO_SHORTCUT_ICONS[item.iconName] ?? Link2;
                  const palette = HERO_SHORTCUT_COLORS[item.color];
                  return (
                    <Link
                      to={item.url}
                      key={item.id}
                      onClick={() => setOpenGroup(null)}
                      className="flex flex-col items-center gap-1.5 text-center group"
                    >
                      <div
                        className={`p-2.5 rounded-xl transition-all group-hover:scale-110 ${palette.iconBg}`}
                      >
                        <ItemIcon
                          className={`w-5 h-5 stroke-[1.5] ${palette.iconColor}`}
                        />
                      </div>
                      <p className="text-[11px] font-semibold text-slate-700 leading-tight line-clamp-2">
                        {item.label}
                      </p>
                    </Link>
                  );
                })}
              </div>
            </DialogContent>
          </Dialog>

          {/* MIDDLE — image banner */}
          <section className="relative flex-1 min-w-0 rounded-2xl overflow-hidden h-[220px] lg:h-[420px]">
            {slides.map((slide, i) => (
              <div
                key={i}
                className="absolute inset-0 transition-opacity duration-700"
                style={{ opacity: i === currentSlide ? 1 : 0 }}
              >
                {slide.type === "video" ? (
                  <video
                    ref={(el) => {
                      videoRefs.current[i] = el;
                    }}
                    src={slide.src}
                    className="w-full h-full object-cover"
                    muted
                    playsInline
                    preload="metadata"
                    onEnded={goToNextSlide}
                  />
                ) : (
                  <img
                    src={slide.src}
                    className="w-full h-full object-cover"
                    loading={i === 0 ? "eager" : "lazy"}
                    decoding={i === 0 ? "sync" : "async"}
                  />
                )}
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

          {/* RIGHT — upcoming events: calendar first, event list below */}
          <div
            className="w-full lg:w-75 shrink-0 flex flex-col gap-3
                       bg-slate-50 rounded-2xl border border-slate-200 shadow-sm p-4 lg:h-[420px] lg:overflow-y-auto"
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
              <h2 className="text-lg sm:text-xl font-bold text-cic-900 tracking-tight">
                Upcoming Events
              </h2>
            </div>

            {/* Calendar (top) */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-3 shrink-0 overflow-hidden">
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
                components={{
                  DayButton: (props) => (
                    <CalendarDayBadgeButton
                      {...props}
                      eventsByDate={eventsByDate}
                    />
                  ),
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

            {/* Event list (below calendar) */}
            <div className="shrink-0 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
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
              <div className="overflow-y-auto p-3 space-y-2 max-h-55">
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
