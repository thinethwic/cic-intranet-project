import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import HotNewsCard from "@/components/HotnewsCrad";

interface NewsItem {
  id: number;
  title: string;
  description: string;
  image: string;
  date?: string;
  category?: string;
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
  const [visible, setVisible] = useState(1);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

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

  const maxIndex = Math.max(0, items.length - visible);

  const next = () => setIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  const prev = () => setIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));

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

  const cardWidthPercent = 100 / visible;

  return (
    <div
      className="relative"
      onMouseEnter={() => {
        if (timerRef.current) clearInterval(timerRef.current);
      }}
      onMouseLeave={startAutoSlide}
    >
      {/* Viewport — horizontal padding clears the nav buttons */}
      <div className="overflow-hidden rounded-2xl px-10">
        {/* Track */}
        <div
          className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${index * cardWidthPercent}%)` }}
        >
          {items.map((item, i) => (
            <div
              key={i}
              className="flex-shrink-0 px-2"
              style={{ width: `${cardWidthPercent}%` }}
            >
              <HotNewsCard
                id={item.id}
                title={item.title}
                description={item.description}
                image={item.image}
                date={item.date}
                category={item.category}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Left button — sits inside the px-10 gutter */}
      <Button
        size="icon"
        variant="secondary"
        onClick={prev}
        disabled={items.length <= visible}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 shadow w-8 h-8 md:w-10 md:h-10"
      >
        <ChevronLeft className="w-4 h-4" />
      </Button>

      {/* Right button */}
      <Button
        size="icon"
        variant="secondary"
        onClick={next}
        disabled={items.length <= visible}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 shadow w-8 h-8 md:w-10 md:h-10"
      >
        <ChevronRight className="w-4 h-4" />
      </Button>

      {/* Dots */}
      <div className="flex justify-center mt-5 gap-2">
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
