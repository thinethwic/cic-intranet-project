// components/home/NewsSlider.tsx

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import HotNewsCard from "@/components/HotnewsCrad";

interface NewsItem {
  title: string;
  description: string;
  image: string;
}

interface Props {
  items: NewsItem[];
  visibleCount?: number;
  autoInterval?: number;
}

export default function NewsSlider({
  items,
  visibleCount = 3,
  autoInterval = 3500,
}: Props) {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(visibleCount);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ✅ Responsive visible count
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) setVisible(1);
      else if (window.innerWidth < 1024) setVisible(2);
      else setVisible(visibleCount);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [visibleCount]);

  // ✅ Safe max index
  const maxIndex = Math.max(0, items.length - visible);

  // ✅ Navigation
  const next = () => setIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));

  const prev = () => setIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));

  // ✅ Auto Slide
  const startAutoSlide = () => {
    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      setIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
    }, autoInterval);
  };

  useEffect(() => {
    startAutoSlide();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [maxIndex]);

  // ✅ Card width
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
        disabled={items.length <= visible}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 shadow"
      >
        <ChevronLeft />
      </Button>

      {/* Viewport */}
      <div className="overflow-hidden rounded-2xl">
        {/* Track */}
        <div
          className="flex transition-transform duration-500 ease-in-out"
          style={{
            transform: `translateX(-${index * (100 / visible)}%)`,
          }}
        >
          {items.map((item, i) => (
            <div
              key={i}
              className="flex-shrink-0 px-3"
              style={{
                width: `${cardWidthPercent}%`,
              }}
            >
              <HotNewsCard
                title={item.title}
                description={item.description}
                image={item.image}
                onClick={() => console.log("Clicked:", item.title)}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Right Button */}
      <Button
        size="icon"
        variant="secondary"
        onClick={next}
        disabled={items.length <= visible}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 shadow"
      >
        <ChevronRight />
      </Button>

      {/* Dots */}
      <div className="flex justify-center mt-6 gap-2">
        {Array.from({ length: maxIndex + 1 }).map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            className={`transition-all duration-300 rounded-full ${
              i === index ? "w-6 h-2 bg-blue-900" : "w-2 h-2 bg-gray-300"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
