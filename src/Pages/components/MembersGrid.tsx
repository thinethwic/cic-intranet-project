import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useMembers } from "@/hooks/useMembers";
import { roleLabels } from "@/utils/segmentMapper";

const ROLE_ORDER = ["CEO", "COO", "CFO"];

export default function MembersCarousel() {
  const { members, loading, error } = useMembers();

  const topManagement = members
    .filter((m) => m.role === "TOP_MANAGEMENT")
    .sort((a, b) => ROLE_ORDER.indexOf(a.title) - ROLE_ORDER.indexOf(b.title));

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardContent className="flex flex-col items-center py-10 gap-3">
              <div className="w-16 h-16 rounded-full bg-gray-200 animate-pulse" />
              <div className="h-3 w-20 bg-gray-200 rounded animate-pulse" />
              <div className="h-2 w-28 bg-gray-100 rounded animate-pulse" />
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
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
      {topManagement.map((member) => (
        <Card
          key={member.id}
          className="hover:shadow-lg transition-shadow duration-300 border border-blue-100"
        >
          <CardContent className="flex flex-col items-center py-6 px-4 gap-1.5">
            {" "}
            {/* py-10 → py-6, added px-4, gap-2 → gap-1.5 */}
            <Avatar className="w-16 h-16 mb-1 ring-4 ring-blue-100">
              {" "}
              {/* w-24 h-24 → w-16 h-16 */}
              <AvatarFallback className="text-base font-bold text-blue-700 bg-blue-50">
                {" "}
                {/* text-xl → text-base */}
                {member.firstName[0]}
                {member.lastName[0]}
              </AvatarFallback>
            </Avatar>
            <span className="text-[10px] font-semibold tracking-widest text-blue-400 uppercase">
              {member.title}
            </span>
            <h3 className="text-sm font-bold text-blue-900 text-center">
              {" "}
              {/* text-lg → text-sm */}
              {member.firstName} {member.lastName}
            </h3>
            <p className="text-[11px] text-gray-500">
              {roleLabels[member.role] ?? member.role}
            </p>
            <p className="text-[11px] text-gray-400">{member.email}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
