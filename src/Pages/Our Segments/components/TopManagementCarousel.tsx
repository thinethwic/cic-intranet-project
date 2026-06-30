import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useMembers } from "@/hooks/useMembers";

const ROLE_ORDER = ["CEO", "COO", "CFO"];
const ROLE_LABELS: Record<string, string> = {
  CEO: "Chief Executive Officer",
  COO: "Chief Operating Officer",
  CFO: "Chief Financial Officer",
};

function getRoleFromEmail(email: string): string {
  const prefix = email.split("@")[0].toUpperCase();
  return ROLE_LABELS[prefix] ?? prefix;
}

export default function TopManagementCarousel() {
  const { members, loading, error } = useMembers();
  const [current, setCurrent] = useState(0);
  const [animating, setAnimating] = useState(false);

  const topManagement = members
    .filter((m) => m.role === "TOP_MANAGEMENT")
    .sort((a, b) => {
      const aRole = a.email.split("@")[0].toUpperCase();
      const bRole = b.email.split("@")[0].toUpperCase();
      return ROLE_ORDER.indexOf(aRole) - ROLE_ORDER.indexOf(bRole);
    });

  // Auto-advance every 3 seconds
  useEffect(() => {
    if (topManagement.length <= 1) return;
    const interval = setInterval(() => {
      goTo((prev) => (prev + 1) % topManagement.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [topManagement.length]);

  function goTo(indexOrUpdater: number | ((prev: number) => number)) {
    setAnimating(true);
    setTimeout(() => {
      setCurrent(indexOrUpdater as any);
      setAnimating(false);
    }, 600);
  }

  // ── Loading skeleton ────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="bg-[#ffffff] rounded-2xl p-6 flex flex-col items-center gap-4">
        <div className="w-28 h-28 rounded-full bg-[#0E4E96] animate-pulse" />
        <div className="h-4 w-36 bg-[#0E4E96]rounded animate-pulse" />
        <div className="h-3 w-28 bg-[#0E4E96] rounded animate-pulse" />
      </div>
    );
  }

  if (error || topManagement.length === 0) {
    return (
      <div className="bg-[#0E4E96] rounded-2xl p-6 flex items-center justify-center">
        <p className="text-sm text-blue-300">
          No top management members found.
        </p>
      </div>
    );
  }

  const member = topManagement[current];

  return (
    <div className="bg-[#ffffff] rounded-2xl shadow-sm overflow-hidden">
      {/* Card */}
      <div
        className="flex flex-col items-center px-6 pt-8 pb-6 gap-4"
        style={{
          opacity: animating ? 0 : 1,
          transform: animating ? "translateY(8px)" : "translateY(0)",
          transition: "opacity 0.25s ease, transform 0.25s ease",
        }}
      >
        {/* Avatar */}
        <div className="ring-4 ring-white/20 rounded-full">
          <Avatar className="w-40 h-40">
            {member.imgeURL && (
              <AvatarImage
                src={member.imgeURL}
                alt={`${member.firstName} ${member.lastName}`}
                className="object-cover w-full h-full"
              />
            )}
            <AvatarFallback className="text-2xl font-bold text-[#0E4E96] bg-blue-100">
              {member.firstName[0]}
              {member.lastName[0]}
            </AvatarFallback>
          </Avatar>
        </div>

        {/* Name */}
        <div className="text-center">
          <h3 className="text-xl font-bold text-[#0E4E96] leading-snug">
            {member.title}. {member.firstName} {member.lastName}
          </h3>
          <p className="text-lg text-[#1e4c7f] mt-1">
            {getRoleFromEmail(member.email)}
          </p>
        </div>
      </div>

      {/* Dot indicators */}
      {topManagement.length > 1 && (
        <div className="flex items-center justify-center gap-2 pb-5">
          {topManagement.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`rounded-full transition-all duration-300 ${
                i === current
                  ? "w-6 h-2.5 bg-white"
                  : "w-2.5 h-2.5 bg-white/30 hover:bg-white/60"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
