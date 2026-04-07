import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function OurPeopleCard() {
  const people = [
    {
      name: "John Perera",
      role: "CEO - CIC Feeds Group",
      email: "ceo@cicfeeds.lk",
      initials: "JP",
    },
    {
      name: "Nimal Silva",
      role: "HR Manager",
      email: "hr@cicfeeds.lk",
      initials: "NS",
    },
    {
      name: "Kasun Fernando",
      role: "IT Manager",
      email: "it@cicfeeds.lk",
      initials: "KF",
    },
    {
      name: "Kasun Fernando",
      role: "IT Manager",
      email: "it@cicfeeds.lk",
      initials: "KF",
    },
  ];

  const [index, setIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Auto rotate
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % people.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [isPaused]);

  const next = () => {
    setIndex((prev) => (prev + 1) % people.length);
    setIsPaused(true);
  };

  const prev = () => {
    setIndex((prev) => (prev - 1 + people.length) % people.length);
    setIsPaused(true);
  };

  const person = people[index];

  return (
    <Card className="relative text-center p-2 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300">
      <h3 className="text-sm font-semibold text-(--custom-colour) mb-2">
        Our People
      </h3>

      {/* Avatar */}
      <Avatar className="w-20 h-20 mx-auto mb-1">
        <AvatarFallback>{person.initials}</AvatarFallback>
      </Avatar>

      {/* Info */}
      <p className="text-sm font-semibold">{person.name}</p>
      <p className="text-xs text-gray-600">{person.role}</p>
      <p className="text-xs text-gray-400 mt-1">{person.email}</p>

      {/* Controls */}
      <div className="flex justify-between mt-1">
        <Button variant="ghost" size="icon" onClick={prev}>
          <ChevronLeft className="w-4 h-6" />
        </Button>

        <Button variant="ghost" size="icon" onClick={next}>
          <ChevronRight className="w-4 h-6" />
        </Button>
      </div>

      {/* Indicators */}
      <div className="flex justify-center gap-1 mt-2">
        {people.map((_, i) => (
          <span
            key={i}
            className={`h-1.5 w-1.5 rounded-full transition ${
              i === index ? "bg-black w-3" : "bg-gray-300"
            }`}
          />
        ))}
      </div>
    </Card>
  );
}
