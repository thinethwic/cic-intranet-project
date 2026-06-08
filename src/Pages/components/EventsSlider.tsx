// components/home/EventsSlider.tsx

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import EventCard from "@/components/EventCard";
import type { Event } from "@/types"; // ✅ import your type
import { resolveFileUrl } from "@/lib/api/fileUtils";

const VISIBLE_COUNT = 3;
const INTERVAL = 3500;
const GAP_PX = 16;

interface Props {
  events: Event[]; // ✅ was "event", fixed to "events"
}

export default function EventsSlider({ events }: Props) {
  const [current, setCurrent] = useState(0);
  const [visible, setVisible] = useState(VISIBLE_COUNT);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) setVisible(1);
      else if (window.innerWidth < 1024) setVisible(2);
      else setVisible(VISIBLE_COUNT);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const maxIndex = Math.max(0, events.length - visible);

  const next = () => setCurrent((p) => (p >= maxIndex ? 0 : p + 1));
  const prev = () => setCurrent((p) => (p <= 0 ? maxIndex : p - 1));

  const startAutoSlide = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCurrent((p) => (p >= maxIndex ? 0 : p + 1));
    }, INTERVAL);
  };

  useEffect(() => {
    if (events.length === 0) return;
    startAutoSlide();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [maxIndex, events.length]);

  return (
    <div
      className="relative"
      onMouseEnter={() => {
        if (timerRef.current) clearInterval(timerRef.current);
      }}
      onMouseLeave={startAutoSlide}
    >
      <Button
        size="icon"
        variant="secondary"
        onClick={prev}
        disabled={events.length <= visible}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 shadow"
      >
        <ChevronLeft />
      </Button>

      <div className="overflow-hidden px-10">
        <div
          className="flex transition-transform duration-500 ease-in-out"
          style={{
            gap: `${GAP_PX}px`,
            transform: `translateX(calc(-${current} * (${100 / visible}% + ${GAP_PX - GAP_PX / visible}px)))`,
          }}
        >
          {events.map((event) => (
            <div
              key={event.id}
              className="shrink-0"
              style={{
                width: `calc(${100 / visible}% - ${(GAP_PX * (visible - 1)) / visible}px)`,
              }}
            >
              <EventCard
                image={resolveFileUrl(event.image)}
                title={event.title}
                date={event.date}
                time={event.time}
                location={event.location}
              />
            </div>
          ))}
        </div>
      </div>

      <Button
        size="icon"
        variant="secondary"
        onClick={next}
        disabled={events.length <= visible}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 shadow"
      >
        <ChevronRight />
      </Button>

      <div className="flex justify-center mt-6 gap-2">
        {Array.from({ length: maxIndex + 1 }).map((_, i) => (
          <button
            key={i}
            onClick={() => {
              setCurrent(i);
              startAutoSlide();
            }}
            className={`transition-all duration-300 rounded-full ${
              i === current ? "w-6 h-2 bg-blue-900" : "w-2 h-2 bg-gray-300"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
