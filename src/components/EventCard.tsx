import { Card, CardContent } from "@/components/ui/card";
import { Clock, MapPin } from "lucide-react";

interface Props {
  image: string;
  title: string;
  date: string;
  time?: string;
  location?: string;
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  const day = date.getDate();
  const month = date.toLocaleString("en-US", { month: "short" });
  return { day, month };
}

function formatTime(timeStr: string) {
  const [hourStr, minuteStr] = timeStr.split(":");
  const hour = parseInt(hourStr, 10);
  const minute = minuteStr || "00";
  const period = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
  return `${displayHour}:${minute} ${period}`;
}

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

export default function EventCard({
  image,
  title,
  date,
  time,
  location,
}: Props) {
  const { day, month } = formatDate(date);
  const imageSrc = image?.startsWith("http") ? image : `${BASE_URL}${image}`;

  return (
    <Card className="group overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer">
      <div className="relative">
        <img
          src={imageSrc}
          alt={title}
          className="h-48 w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        <div className="absolute top-4 left-4 bg-white rounded-lg shadow-sm border border-gray-200 w-14 text-center">
          <div className="text-sm font-bold text-gray-900 leading-tight pt-2">
            {day}
          </div>
          <div className="text-[10px] uppercase text-gray-500 pb-2">
            {month}
          </div>
        </div>
        <div className="absolute bottom-4 left-4 right-4">
          <h3 className="text-white font-semibold text-base leading-snug line-clamp-2">
            {title}
          </h3>
        </div>
      </div>

      <CardContent className="p-4">
        <div className="flex flex-col gap-2 text-sm text-gray-600">
          {time && (
            <div className="flex items-center gap-2">
              <Clock size={14} className="text-gray-400" />
              <span>{formatTime(time)}</span> {/* ✅ AM/PM formatted */}
            </div>
          )}
          {location && (
            <div className="flex items-center gap-2">
              <MapPin size={14} className="text-gray-400" />
              <span className="line-clamp-1">{location}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
