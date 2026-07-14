// components/home/BirthdayCarousel.tsx

import { useEffect, useRef, useState } from "react";
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

  useEffect(() => {
    if (members.length <= 1) return;
    const timer = setInterval(() => {
      setIndex((prev) => {
        const nextIndex = (prev + 1) % members.length;
        if (scrollRef.current) {
          const cardWidth = scrollRef.current.offsetWidth;
          scrollRef.current.scrollTo({
            left: nextIndex * cardWidth,
            behavior: "smooth",
          });
        }
        return nextIndex;
      });
    }, AUTO_INTERVAL);
    return () => clearInterval(timer);
  }, [members.length]);

  if (members.length === 1) {
    return <BirthdayCard {...members[0]} />;
  }

  return (
    <div className="relative overflow-hidden rounded-2xl">
      {/* Scroll Container — each card is exactly 100% of container width */}
      <div ref={scrollRef} className="flex overflow-hidden">
        {members.map((member, i) => (
          <div
            key={member.name}
            className={`w-full flex-shrink-0 transition-all duration-300 ${
              i === index ? "opacity-100" : "opacity-50"
            }`}
          >
            <BirthdayCard {...member} />
          </div>
        ))}
      </div>

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
