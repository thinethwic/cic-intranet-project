// components/home/BirthdayCarousel.tsx

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import BirthdayCard from "@/components/BirthdayCard";

interface Member {
  name: string;
  role: string;
  dob: string;
}

interface Props {
  members: Member[];
}

const AUTO_INTERVAL = 3000;

export default function BirthdayCarousel({ members }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);

  const scrollToIndex = (i: number) => {
    if (!scrollRef.current) return;
    const cardWidth = scrollRef.current.offsetWidth; // ← use container width
    scrollRef.current.scrollTo({ left: i * cardWidth, behavior: "smooth" });
    setIndex(i);
  };

  const next = () => scrollToIndex((index + 1) % members.length);
  const prev = () =>
    scrollToIndex((index - 1 + members.length) % members.length);

  useEffect(() => {
    const timer = setInterval(next, AUTO_INTERVAL);
    return () => clearInterval(timer);
  }, [index]);

  if (members.length === 1) {
    return <BirthdayCard {...members[0]} />;
  }

  return (
    <div className="relative">
      {/* Left Arrow */}
      <Button
        size="icon"
        variant="secondary"
        onClick={prev}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 shadow-md"
      >
        <ChevronLeft />
      </Button>

      {/* Scroll Container — each card is exactly 100% of container width */}
      <div ref={scrollRef} className="flex overflow-hidden">
        {members.map((member, i) => (
          <div
            key={member.name}
            className={`w-full flex-shrink-0 transition-all duration-300 px-10 ${
              i === index ? "opacity-100" : "opacity-50"
            }`}
          >
            <BirthdayCard {...member} />
          </div>
        ))}
      </div>

      {/* Right Arrow */}
      <Button
        size="icon"
        variant="secondary"
        onClick={next}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 shadow-md"
      >
        <ChevronRight />
      </Button>

      {/* Pagination Dots */}
      <div className="flex justify-center mt-6 gap-2">
        {members.map((_, i) => (
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
