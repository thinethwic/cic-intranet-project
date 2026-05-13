import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMembers } from "@/hooks/useMembers"; // 👈 import the hook
import { roleLabels } from "@/utils/segmentMapper";

function getInitials(firstName?: string, lastName?: string) {
  const f = firstName?.[0] ?? "";
  const l = lastName?.[0] ?? "";
  return (f + l).toUpperCase() || "?";
}

export default function OurPeopleCard() {
  const { members, loading, error } = useMembers(); // 👈 replace all the fetch logic
  const [index, setIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (!isPaused) return;
    const resume = setTimeout(() => setIsPaused(false), 6000);
    return () => clearTimeout(resume);
  }, [isPaused]);

  useEffect(() => {
    if (isPaused || members.length === 0) return;
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % members.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [isPaused, members.length]);

  const next = () => {
    setIndex((p) => (p + 1) % members.length);
    setIsPaused(true);
  };
  const prev = () => {
    setIndex((p) => (p - 1 + members.length) % members.length);
    setIsPaused(true);
  };

  if (loading) {
    return (
      <Card className="relative text-center p-4 rounded-2xl shadow-sm w-full max-w-[260px] mx-auto md:max-w-none">
        <h3 className="text-sm font-semibold text-blue-900 mb-3">Our Staff</h3>
        <div className="w-20 h-20 mx-auto mb-2 rounded-full bg-gray-200 animate-pulse" />
        <div className="h-3 bg-gray-200 rounded animate-pulse mx-auto w-32 mb-2" />
        <div className="h-2 bg-gray-100 rounded animate-pulse mx-auto w-24" />
      </Card>
    );
  }

  if (error || members.length === 0) {
    return (
      <Card className="relative text-center p-4 rounded-2xl shadow-sm w-full max-w-[260px] mx-auto md:max-w-none">
        <h3 className="text-sm font-semibold text-blue-900 mb-3">Our Staff</h3>
        <p className="text-xs text-gray-400">{error ?? "No members found."}</p>
      </Card>
    );
  }

  const person = members[index];

  return (
    <Card className="relative text-center p-4 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 w-full max-w-[260px] mx-auto md:max-w-none">
      <h3 className="text-sm font-semibold text-blue-900 mb-3">Our Staff</h3>
      <Avatar className="w-20 h-20 mx-auto mb-2">
        <AvatarFallback className="text-lg">
          {getInitials(person.firstName, person.lastName)} {/* ✅ */}
        </AvatarFallback>
      </Avatar>
      <p className="text-sm font-semibold">
        {person.title} {person.firstName} {person.lastName}
      </p>{" "}
      {/* ✅ */}
      <p className="text-xs text-gray-600 mt-0.5">
        {roleLabels[person.role] ?? person.role}
      </p>{" "}
      {/* ✅ already correct */}
      <p className="text-xs text-gray-400 mt-1">{person.email}</p>{" "}
      {/* ✅ already correct */}
      {/* 👈 check field name */}
      <div className="flex justify-between mt-2">
        <Button variant="ghost" size="icon" onClick={prev}>
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={next}>
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
      <div className="flex justify-center gap-1.5 mt-2">
        {members.map((_, i) => (
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
