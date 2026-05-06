import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import WelcomeCard from "@/components/WelcomeCard";
import { roleLabels } from "@/utils/segmentMapper";

interface Person {
  name: string;
  role: string;
  joinedDate: string;
}

interface Props {
  people: Person[]; // ✅ object array not string array
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

  if (!people.length) return null;

  return (
    <div className="relative">
      <Button
        size="icon"
        variant="secondary"
        onClick={prev}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10"
      >
        <ChevronLeft />
      </Button>

      <div ref={scrollRef} className="flex gap-6 overflow-hidden px-5">
        {people.map((person, i) => (
          <div
            key={i}
            className={`min-w-65 transition-all duration-300 ${
              i === index ? "scale-105 shadow-xl" : "opacity-70"
            }`}
          >
            <WelcomeCard
              name={person.name}
              role={roleLabels[person.role] ?? person.role}
              joinedDate={person.joinedDate}
            />
          </div>
        ))}
      </div>

      <Button
        size="icon"
        variant="secondary"
        onClick={next}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10"
      >
        <ChevronRight />
      </Button>

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
