import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { CalendarDays } from "lucide-react";

interface Props {
  name: string;
  role: string;
  joinedDate: string;
}

export default function WelcomeCard({ name, role, joinedDate }: Props) {
  const initials = name.substring(0, 2).toUpperCase();

  const formattedDate = new Date(joinedDate).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <Card className="rounded-2xl bg-white border shadow-sm p-5 flex flex-col items-center gap-3 text-center">
      <Avatar className="w-16 h-16 border-2 border-blue-100">
        <AvatarFallback className="bg-blue-50 text-blue-600 font-bold text-lg">
          {initials}
        </AvatarFallback>
      </Avatar>

      <div>
        <p className="text-[10px] font-extrabold tracking-widest text-blue-600 uppercase mb-1">
          Welcome
        </p>
        <h3 className="text-sm font-bold text-gray-900">{name}</h3>
        <p className="text-xs text-gray-400 mt-0.5">{role}</p>
      </div>

      <div className="flex items-center gap-1.5 text-xs text-gray-400 border border-gray-100 rounded-full px-3 py-1">
        <CalendarDays className="w-3 h-3" />
        <span>Joined {formattedDate}</span>
      </div>
    </Card>
  );
}
