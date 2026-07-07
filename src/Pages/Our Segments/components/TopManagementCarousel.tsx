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

interface Props {
  visible?: boolean;
}

export default function TopManagementCarousel({ visible = true }: Props) {
  const { members, loading, error } = useMembers();

  const topManagement = members
    .filter((m) => m.role === "TOP_MANAGEMENT")
    .sort((a, b) => {
      const aRole = a.email.split("@")[0].toUpperCase();
      const bRole = b.email.split("@")[0].toUpperCase();
      return ROLE_ORDER.indexOf(aRole) - ROLE_ORDER.indexOf(bRole);
    });

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl p-6 flex flex-col items-center gap-4"
          >
            <Skeleton className="w-28 h-28 rounded-full" />
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-3 w-28" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl p-6 flex flex-col items-center justify-center gap-2">
        <AlertCircle className="h-4 w-4 text-red-400" />
        <p className="text-sm text-red-400">Failed to load management.</p>
      </div>
    );
  }

  if (topManagement.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-6 flex items-center justify-center">
        <p className="text-sm text-slate-400">
          No top management members found.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4">
      {topManagement.map((member, index) => (
        <div
          key={member.id}
          className="bg-[#ffffff] rounded-2xl shadow-sm flex flex-col items-center px-6 pt-8 pb-6 gap-4"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(30px)",
            transition: `opacity 0.7s ease ${index * 0.15}s, transform 0.7s ease ${index * 0.15}s`,
          }}
        >
          {/* Avatar */}
          <div className="ring-4 ring-white/20 rounded-full">
            <Avatar className="w-32 h-32">
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
      ))}
    </div>
  );
}
