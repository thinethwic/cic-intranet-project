import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, AlertCircle } from "lucide-react";
import { useMembers } from "@/hooks/useMembers";
import { roleLabels } from "@/utils/segmentMapper";
import { Skeleton } from "@/components/ui/skeleton";

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
        <Skeleton className="w-20 h-20 mx-auto mb-2 rounded-full" />
        <Skeleton className="h-3 w-32 mx-auto mb-2" />
        <Skeleton className="h-2 w-24 mx-auto" />
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="relative text-center p-4 rounded-2xl shadow-sm w-full max-w-[260px] mx-auto md:max-w-none">
        <h3 className="text-sm font-semibold text-blue-900 mb-3">Our Staff</h3>
        <div className="flex flex-col items-center gap-1.5 py-2">
          <AlertCircle className="h-4 w-4 text-red-400" />
          <p className="text-xs text-red-400">Failed to load staff.</p>
        </div>
      </Card>
    );
  }

  if (members.length === 0) {
    return (
      <Card className="relative text-center p-4 rounded-2xl shadow-sm w-full max-w-[260px] mx-auto md:max-w-none">
        <h3 className="text-sm font-semibold text-blue-900 mb-3">Our Staff</h3>
        <p className="text-xs text-slate-400">No members found.</p>
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
