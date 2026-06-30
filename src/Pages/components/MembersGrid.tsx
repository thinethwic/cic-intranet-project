import { useEffect, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useMembers } from "@/hooks/useMembers";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";

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

export default function MembersCarousel() {
  const { members, loading, error } = useMembers();
  const [visibleCards, setVisibleCards] = useState<boolean[]>([]);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  const topManagement = members
    .filter((m) => m.role === "TOP_MANAGEMENT")
    .sort((a, b) => {
      const aRole = a.email.split("@")[0].toUpperCase();
      const bRole = b.email.split("@")[0].toUpperCase();
      return ROLE_ORDER.indexOf(aRole) - ROLE_ORDER.indexOf(bRole);
    });

  useEffect(() => {
    if (loading || topManagement.length === 0) return;

    // Initialize all cards as hidden
    setVisibleCards(new Array(topManagement.length).fill(false));

    const observers: IntersectionObserver[] = [];

    cardRefs.current.forEach((card, i) => {
      if (!card) return;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              setVisibleCards((prev) => {
                const next = [...prev];
                next[i] = true;
                return next;
              });
            }, i * 150);
            observer.disconnect();
          }
        },
        { threshold: 0.1 },
      );

      observer.observe(card);
      observers.push(observer);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, [loading, topManagement.length]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardContent className="flex flex-col items-center py-10 gap-3">
              <Skeleton className="w-16 h-16 rounded-full" />
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-2 w-28" />
              <Skeleton className="h-2 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center gap-2 py-8">
        <AlertCircle className="h-4 w-4 text-red-400" />
        <p className="text-sm text-red-400">{error}</p>
      </div>
    );
  }

  if (topManagement.length === 0) {
    return (
      <p className="text-center text-sm text-slate-400 py-8">
        No top management members found.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
      {topManagement.map((member, i) => (
        <div
          key={member.id}
          ref={(el) => {
            cardRefs.current[i] = el;
          }}
          style={{
            opacity: visibleCards[i] ? 1 : 0,
            transform: visibleCards[i] ? "translateY(0)" : "translateY(32px)",
            transition: "opacity 0.6s ease, transform 0.6s ease",
          }}
        >
          <Card className="hover:shadow-lg transition-shadow duration-300 border border-blue-100 h-full">
            <CardContent className="flex flex-col items-center py-6 px-4 gap-1.5">
              <Avatar className="w-26 h-26 mb-1 ring-4 ring-blue-100">
                {member.imgeURL && (
                  <AvatarImage
                    src={member.imgeURL}
                    alt={`${member.firstName} ${member.lastName}`}
                    className="object-cover"
                  />
                )}
                <AvatarFallback className="text-base font-bold text-blue-700 bg-blue-50">
                  {member.firstName[0]}
                  {member.lastName[0]}
                </AvatarFallback>
              </Avatar>
              <h3 className="text-lg font-bold text-blue-900 text-center">
                {member.title}. {member.firstName} {member.lastName}
              </h3>
              <p className="text-[14px] text-lg text-blue-600">
                {getRoleFromEmail(member.email)}
              </p>
            </CardContent>
          </Card>
        </div>
      ))}
    </div>
  );
}
