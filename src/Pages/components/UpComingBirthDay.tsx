import { Card } from "@/components/ui/card";
import { CalendarDays } from "lucide-react";

interface Item {
  name: string;
  role: string;
  date: string;
}

interface Props {
  list: Item[];
}

export default function UpcomingBirthdays({ list }: Props) {
  return (
    <Card className="p-4 rounded-2xl bg-gray-50 border shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <CalendarDays className="w-4 h-4 text-blue-600" />
        <h3 className="text-sm font-semibold text-gray-700 tracking-wide">
          Upcoming Birthdays
        </h3>
      </div>

      {/* List */}
      <div className="space-y-2 max-h-[12.5rem] overflow-y-auto pr-1">
        {list.map((item, i) => (
          <div
            key={i}
            className="flex items-center justify-between bg-white rounded-xl px-3 py-2 hover:shadow-sm transition"
          >
            {/* Left */}
            <div className="flex items-center gap-3 min-w-0">
              {/* Avatar */}
              <div className="w-9 h-9 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-[11px] font-semibold">
                {item.name.substring(0, 2).toUpperCase()}
              </div>

              {/* Info */}
              <div className="min-w-0">
                <p className="text-xs font-medium truncate">{item.name}</p>
                <p className="text-[10px] text-gray-500 truncate">
                  {item.role}
                </p>
              </div>
            </div>

            {/* Date Badge */}
            <span className="text-[10px] bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full whitespace-nowrap">
              {item.date}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}
