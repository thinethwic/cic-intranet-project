import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

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
    name: "Amali Jayawardena",
    role: "Finance Lead",
    email: "finance@cicfeeds.lk",
    initials: "AJ",
  },
];

export default function OurPeopleCard() {
  const [index, setIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // ✅ FIX: Auto-resume after 6s of inactivity
  useEffect(() => {
    if (!isPaused) return;
    const resume = setTimeout(() => setIsPaused(false), 6000);
    return () => clearTimeout(resume);
  }, [isPaused]);

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % people.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [isPaused]);

  const next = () => {
    setIndex((p) => (p + 1) % people.length);
    setIsPaused(true);
  };
  const prev = () => {
    setIndex((p) => (p - 1 + people.length) % people.length);
    setIsPaused(true);
  };

  const person = people[index];

  return (
    // ✅ FIX: On mobile, limit width and center it; on md+ fill the column
    <Card className="relative text-center p-4 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 w-full max-w-[260px] mx-auto md:max-w-none">
      <h3 className="text-sm font-semibold text-blue-900 mb-3">Our People</h3>

      <Avatar className="w-20 h-20 mx-auto mb-2">
        <AvatarFallback className="text-lg">{person.initials}</AvatarFallback>
      </Avatar>

      <p className="text-sm font-semibold">{person.name}</p>
      <p className="text-xs text-gray-600 mt-0.5">{person.role}</p>
      <p className="text-xs text-gray-400 mt-1">{person.email}</p>

      <div className="flex justify-between mt-2">
        <Button variant="ghost" size="icon" onClick={prev}>
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={next}>
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      <div className="flex justify-center gap-1.5 mt-2">
        {people.map((_, i) => (
          <span
            key={i}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === index ? "bg-blue-900 w-4" : "bg-gray-300 w-1.5"
            }`}
          />
        ))}
      </div>
    </Card>
  );
}
