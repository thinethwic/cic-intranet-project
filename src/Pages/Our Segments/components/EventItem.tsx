// components/home/EventItem.tsx

interface Props {
  day: string;
  month: string;
  title: string;
  time: string;
  location: string;
}

export default function EventItem({
  day,
  month,
  title,
  time,
  location,
}: Props) {
  return (
    <div className="flex items-center gap-4 border rounded-xl p-4 bg-white">
      {/* Date */}
      <div className="text-center w-12">
        <p className="text-xl font-bold text-blue-900">{day}</p>
        <p className="text-xs text-gray-500">{month}</p>
      </div>

      {/* Content */}
      <div>
        <h3 className="text-sm font-semibold">{title}</h3>
        <p className="text-xs text-gray-500">{time}</p>
        <p className="text-xs text-gray-500">Location : {location}</p>
      </div>
    </div>
  );
}
