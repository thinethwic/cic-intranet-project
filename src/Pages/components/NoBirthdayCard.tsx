import { Card } from "@/components/ui/card";

export default function NoBirthdayCard() {
  return (
    <Card className="rounded-2xl bg-white border shadow-sm flex flex-col items-center justify-center gap-3 min-h-[220px] text-center p-8">
      <div className="text-5xl animate-bounce select-none">🎂</div>
      <p className="font-semibold text-gray-700">No birthdays today</p>
      <p className="text-sm text-gray-400 max-w-xs">
        Check back tomorrow — the next celebration is coming up soon!
      </p>
    </Card>
  );
}
