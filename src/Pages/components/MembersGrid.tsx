// components/home/MembersCarousel.tsx

import { useEffect, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface Member {
  name: string;
  role: string;
}

interface Props {
  members: Member[];
}

const AUTO_INTERVAL = 3000;

export default function MembersCarousel({ members }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);

  const scrollToIndex = (i: number) => {
    if (!scrollRef.current) return;

    const cardWidth = 240; // card width + gap
    scrollRef.current.scrollTo({
      left: i * cardWidth,
      behavior: "smooth",
    });

    setIndex(i);
  };

  const next = () => {
    const newIndex = (index + 1) % members.length;
    scrollToIndex(newIndex);
  };

  const prev = () => {
    const newIndex = (index - 1 + members.length) % members.length;
    scrollToIndex(newIndex);
  };

  // 🔁 Auto slide
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
      <div ref={scrollRef} className="flex gap-6 overflow-hidden px-10">
        {members.map((member, i) => (
          <Card
            key={i}
            className={`min-w-[220px] transition-all duration-300 ${
              i === index ? "scale-105 shadow-xl" : "opacity-70"
            }`}
          >
            <CardContent className="flex flex-col items-center py-8">
              <Avatar className="w-20 h-20 mb-4">
                <AvatarFallback>{member.name.substring(0, 2)}</AvatarFallback>
              </Avatar>

              <h3 className="font-semibold text-sm">{member.name}</h3>

              <p className="text-xs text-gray-500 mt-1">{member.role}</p>
            </CardContent>
          </Card>
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
        {members.map((_, i) => (
          <button
            key={i}
            onClick={() => scrollToIndex(i)}
            className={`transition-all rounded-full ${
              i === index
                ? "w-6 h-2 bg-(--custom-colour)"
                : "w-2 h-2 bg-gray-300"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
