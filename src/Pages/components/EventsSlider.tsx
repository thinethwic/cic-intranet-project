// components/home/EventsSlider.tsx

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import EventCard from "@/components/EventCard";
import { events } from "@/Mock-data";

const VISIBLE_COUNT = 3;
const INTERVAL = 3500;

export default function EventsSlider() {
  const [current, setCurrent] = useState(0);
  const [visible, setVisible] = useState(VISIBLE_COUNT);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Responsive visible count
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
    startAutoSlide();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [maxIndex]);

  const cardWidthPercent = 100 / visible;

  return (
    <div
      className="relative"
      onMouseEnter={() => {
        if (timerRef.current) clearInterval(timerRef.current);
      }}
      onMouseLeave={startAutoSlide}
    >
      {/* Left Button */}
      <Button
        size="icon"
        variant="secondary"
        onClick={prev}
        disabled={events.length <= visible}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 shadow"
      >
        <ChevronLeft />
      </Button>

      {/* Viewport */}
      {/* Viewport */}
      <div className="overflow-hidden px-10">
        {/* Track */}
        <div
          className="flex gap-4 transition-transform duration-500 ease-in-out" // gap instead of px on cards
          style={{
            transform: `translateX(-${current * (100 / visible)}%)`,
          }}
        >
          {events.map((event, i) => (
            <div
              key={i}
              className="shrink-0 px-3"
              style={{ width: `${cardWidthPercent}%` }}
            >
              <div className="h-full">
                {" "}
                {/* ← wrap to enforce consistent height */}
                <EventCard {...event} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Button */}
      <Button
        size="icon"
        variant="secondary"
        onClick={next}
        disabled={events.length <= visible}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 shadow"
      >
        <ChevronRight />
      </Button>

      {/* Dots */}
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
