import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatBirthdayDate, daysUntilBirthday } from "@/utils/birthday";
import { roleLabels } from "@/utils/segmentMapper";

interface Props {
  name: string;
  role: string;
  message?: string;
  dob: string;
}

const DEFAULT_MESSAGES = [
  "Your dedication to excellence and commitment to quality continue to inspire us all. Here's to many more years of success and progress.",
  "Thank you for everything you bring to the team. Wishing you a wonderful day filled with joy!",
  "Your energy and passion make this a better place to work. Here's to celebrating you today!",
];

export default function BirthdayCard({ name, role, message, dob }: Props) {
  const initials = name.substring(0, 2).toUpperCase();
  const days = daysUntilBirthday(dob);
  const dateLabel = formatBirthdayDate(dob);
  const daysLabel =
    days === 0 ? "Today" : days === 1 ? "Tomorrow" : `${days} days away`;
  const displayMessage = message ?? DEFAULT_MESSAGES[0];

  return (
    <Card className="rounded-2xl bg-white border border-slate-100 shadow-card p-5 flex flex-col gap-4">
      {/* Top section */}
      <div className="flex items-start gap-3">
        <Avatar className="w-14 h-14 border-2 border-orange-200 shrink-0">
          <AvatarFallback className="bg-orange-100 text-orange-600 font-bold text-lg">
            {initials}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold tracking-widest text-cic-700 uppercase mb-0.5">
            Today's Birthday
          </p>
          <h2 className="text-lg font-bold text-slate-900 leading-tight wrap-break-word">
            {name}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {roleLabels[role] ?? role}
          </p>
        </div>

        <div className="text-2xl select-none shrink-0">🎈</div>
      </div>

      <div className="h-px bg-slate-100" />

      <div className="flex-1">
        <p className="text-sm text-slate-500 italic leading-relaxed">
          {displayMessage}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-2 border border-slate-200 rounded-full px-3 py-1.5">
          <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="text-xs font-medium text-slate-700 whitespace-nowrap">
            {dateLabel}
          </span>
          <span className="text-slate-300 text-xs">•</span>
          <span className="text-xs text-slate-500 whitespace-nowrap">
            {daysLabel}
          </span>
        </div>

        <Button
          variant="outline"
          size="sm"
          className="rounded-lg px-5 text-xs font-semibold border-slate-200 text-slate-700 hover:bg-surface-muted h-8"
        >
          Send wishes
        </Button>
      </div>
    </Card>
  );
}
