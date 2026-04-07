import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface Props {
  name: string;
  role: string;
  message: string;
  date: string;
  daysAway?: string;
}

export default function BirthdayCard({
  name,
  role,
  message,
  date,
  daysAway,
}: Props) {
  const initials = name.substring(0, 2).toUpperCase();

  return (
    <Card className="rounded-2xl bg-white border shadow-sm p-5 flex flex-col gap-4 ">
      {/* Top section */}
      <div className="flex items-center gap-4 px-6 pt-6 pb-4">
        {/* Avatar */}
        <Avatar className="w-16 h-16 border-2 border-orange-200 shrink-0">
          <AvatarFallback className="bg-orange-100 text-orange-600 font-bold text-lg">
            {initials}
          </AvatarFallback>
        </Avatar>

        {/* Name & role */}
        <div className="flex-1">
          <p className="text-[11px] font-extrabold tracking-widest text-blue-600 uppercase mb-0.5">
            Today's Birthday
          </p>
          <h2 className="text-lg font-bold text-gray-900 leading-tight">
            {name}
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">{role}</p>
        </div>

        {/* Balloon */}
        <div className="flex gap-0">
          <div className="text-4xl select-none">🎈</div>
          <div className="text-4xl select-none">🎈</div>
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-gray-100 mx-6" />

      {/* Message */}
      <div className="px-6 py-4 flex-1">
        <p className="text-sm text-gray-500 italic leading-relaxed">
          {message}
        </p>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-6 pb-5">
        {/* Date badge */}
        <div className="flex items-center gap-2 border border-gray-200 rounded-full px-3 py-1.5">
          <Calendar className="w-3.5 h-3.5 text-gray-400" />
          <span className="text-xs font-medium text-gray-700">{date}</span>
          {daysAway && (
            <>
              <span className="text-gray-300 text-xs">•</span>
              <span className="text-xs text-gray-500">{daysAway}</span>
            </>
          )}
        </div>

        {/* CTA */}
        <Button
          variant="outline"
          size="sm"
          className="rounded-xl px-5 text-xs font-semibold border-gray-300 text-gray-700 hover:bg-gray-50 h-8"
        >
          Send wishes
        </Button>
      </div>
    </Card>
  );
}
