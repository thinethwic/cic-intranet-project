import { Card, CardContent } from "@/components/ui/card";
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

export default function MembersCarousel() {
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
      ))}
    </div>
  );
}
