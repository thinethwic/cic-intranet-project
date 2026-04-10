// components/home/EventsSlider.tsx

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import EventCard from "@/components/EventCard";
import { events } from "@/Mock-data";

const VISIBLE_COUNT = 3;
const INTERVAL = 3500;
const GAP_PX = 16; // matches gap-4

export default function EventsSlider() {
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

  // ✅ FIX: Reset current when visible count changes (e.g. resize past maxIndex)
  useEffect(() => {
    setCurrent((p) => Math.min(p, maxIndex));
  }, [maxIndex]);

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

      {/* Viewport — px-10 reserves space for the nav buttons */}
      <div className="overflow-hidden px-10">
        {/*
          ✅ FIX: Use a CSS custom property for the gap so the translation
          accounts for the actual rendered gap, not just a percentage guess.
          Each card slot = (100% - gap * (visible-1)) / visible
          We translate by (cardSlotWidth + gap) * current
        */}
        <div
          className="flex transition-transform duration-500 ease-in-out"
          style={{
            gap: `${GAP_PX}px`,
            // Translate exactly one card-slot + one gap per step
            transform: `translateX(calc(-${current} * (${100 / visible}% + ${
              GAP_PX - GAP_PX / visible // distributes gap correctly
            }px)))`,
          }}
        >
          {events.map((event, i) => (
            <div
              key={i}
              // ✅ FIX: No extra px padding — gap handles spacing
              className="shrink-0"
              style={{
                // Subtract the total gap distributed among visible cards
                width: `calc(${100 / visible}% - ${
                  (GAP_PX * (visible - 1)) / visible
                }px)`,
              }}
            >
              <EventCard {...event} />
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
