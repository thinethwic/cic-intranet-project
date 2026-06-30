import { Card } from "@/components/ui/card";
import { CalendarDays } from "lucide-react";
import logo from "@/assets/Logo.jpg";

interface Props {
  name: string;
  role: string;
  joinedDate: string;
  department?: string;
}

export default function WelcomeCard({
  name,
  role,
  joinedDate,
  department,
}: Props) {
  const formattedDate = new Date(joinedDate).toLocaleDateString("en-GB", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  return (
    <Card className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-0 shadow-card">
      {/* ── Curved blue avatar panel ── */}
      <div className="relative h-28 overflow-hidden">
        <div className="absolute -left-1 -top-1 h-40 w-40 rounded-br-full bg-cic-800" />
        <div className="relative z-10 flex h-full items-center pl-5">
          {/* Simple illustrated avatar, matching the reference badge style */}
          <svg viewBox="0 0 64 64" className="h-14 w-14" aria-hidden="true">
            <circle cx="32" cy="24" r="13" fill="#FBCFA0" />
            <path d="M19 23c0-8 6-13 13-13s13 5 13 13" fill="#C2511F" />
            <rect x="10" y="46" width="44" height="18" rx="9" fill="#5B8DEF" />
          </svg>
        </div>

        {/* Department label, top right */}
        {department && (
          <span className="absolute right-5 top-5 text-sm font-semibold text-slate-700">
            {department}
          </span>
        )}
      </div>

      {/* ── Details ── */}
      <div className="space-y-2 px-5 pb-5 pt-4">
        <h3 className="text-base font-bold leading-tight text-cic-900">
          {name}
        </h3>
        <p className="text-sm font-semibold text-slate-700">{role}</p>

        <div className="flex items-center justify-between pt-1 gap-2">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <CalendarDays className="h-3.5 w-3.5" />
            <span>Joined Date : {formattedDate}</span>
          </div>
          <img
            src={logo}
            alt="CIC Livestock Solutions"
            className="h-10 w-auto object-contain"
          />
        </div>
      </div>
    </Card>
  );
}
