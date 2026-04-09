// components/home/WelcomeCarousel.tsx

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import WelcomeCard from "@/components/WelcomeCard";

interface Props {
  people: string[];
}

const AUTO_INTERVAL = 3000;
const CARD_WIDTH = 240;

export default function WelcomeCarousel({ people }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);

  const scrollToIndex = (i: number) => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTo({ left: i * CARD_WIDTH, behavior: "smooth" });
    setIndex(i);
  };

  const next = () => scrollToIndex((index + 1) % people.length);
  const prev = () => scrollToIndex((index - 1 + people.length) % people.length);

  useEffect(() => {
    const timer = setInterval(next, AUTO_INTERVAL);
    return () => clearInterval(timer);
  }, [index]);

  return (
    <div className="relative">
      {/* Left Arrow */}
      <Button
        size="icon"
        variant="secondary"
        onClick={prev}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10"
      >
        <ChevronLeft />
      </Button>

      {/* Scroll Container */}
      <div ref={scrollRef} className="flex gap-6 overflow-hidden px-5">
        {people.map((name, i) => (
          <div
            key={i}
            className={`min-w-65 transition-all duration-300 ${
              i === index ? "scale-105 shadow-xl" : "opacity-70"
            }`}
          >
            <WelcomeCard
              name={name}
              description="Lorem Ipsum Lorem Ipsum Lorem Ipsum"
            />
          </div>
        ))}
      </div>

      {/* Right Arrow */}
      <Button
        size="icon"
        variant="secondary"
        onClick={next}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10"
      >
        <ChevronRight />
      </Button>

      {/* Pagination Dots */}
      <div className="flex justify-center mt-6 gap-2">
        {people.map((_, i) => (
          <button
            key={i}
            onClick={() => scrollToIndex(i)}
            className={`transition-all rounded-full ${
              i === index ? "w-6 h-2 bg-blue-600" : "w-2 h-2 bg-gray-300"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
