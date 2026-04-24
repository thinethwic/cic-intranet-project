// components/home/MembersCarousel.tsx

import { useEffect, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMembers } from "@/hooks/useMembers";

const AUTO_INTERVAL = 3000;

export default function MembersCarousel() {
  const { members, loading, error } = useMembers();

  // ✅ filter only — no .map(), use Member fields directly
  const topManagement = members.filter((m) => m.role === "TOP_MANAGEMENT");

  const scrollRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);

  const scrollToIndex = (i: number) => {
    if (!scrollRef.current) return;
    const cardWidth = 240;
    scrollRef.current.scrollTo({ left: i * cardWidth, behavior: "smooth" });
    setIndex(i);
  };

  const next = () => scrollToIndex((index + 1) % topManagement.length);
  const prev = () =>
    scrollToIndex((index - 1 + topManagement.length) % topManagement.length);

  useEffect(() => {
    if (topManagement.length === 0) return;
    const timer = setInterval(next, AUTO_INTERVAL);
    return () => clearInterval(timer);
  }, [index, topManagement.length]);

  if (loading) {
    return (
      <div className="flex gap-6 px-10 overflow-hidden">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="min-w-[200px]">
            <CardContent className="flex flex-col items-center py-8 gap-3">
              <div className="w-20 h-20 rounded-full bg-gray-200 animate-pulse" />
              <div className="h-3 w-24 bg-gray-200 rounded animate-pulse" />
              <div className="h-2 w-16 bg-gray-100 rounded animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error || topManagement.length === 0) {
    return (
      <p className="text-center text-sm text-gray-400 py-8">
        {error ?? "No top management members found."}
      </p>
    );
  }

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

      <div ref={scrollRef} className="flex gap-6 overflow-hidden px-10">
        {topManagement.map((member, i) => (
          <Card
            key={member.id} // ✅ real id
            className={`min-w-[200px] transition-all duration-300 ${
              i === index ? "scale-105 shadow-xl" : "opacity-70"
            }`}
          >
            <CardContent className="flex flex-col items-center py-8">
              <Avatar className="w-20 h-20 mb-4">
                <AvatarFallback>
                  {member.firstName[0]}
                  {member.lastName[0]} {/* ✅ real initials */}
                </AvatarFallback>
              </Avatar>
              <p className="text-xs text-gray-400">{member.title}</p>
              <h3 className="font-semibold text-sm">
                {member.firstName} {member.lastName} {/* ✅ real name fields */}
              </h3>
              <p className="text-xs text-gray-500 mt-1">{member.role}</p>
              <p className="text-xs text-gray-400 mt-1">{member.email}</p>
            </CardContent>
          </Card>
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
        {topManagement.map((member, i) => (
          <button
            key={member.id} // ✅ real id
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
