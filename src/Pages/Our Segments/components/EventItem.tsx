// components/home/EventItem.tsx

interface Props {
  day: string;
  month: string;
  title: string;
  time: string;
  location: string;
  image?: string;
}

export default function EventItem({
  day,
  month,
  title,
  time,
  location,
  image,
}: Props) {
  return (
    <div className="flex items-center gap-4 border rounded-xl p-4 bg-white">
      {image ? (
        /* Image on top, date below */
        <div className="flex flex-col items-center gap-1 w-12 shrink-0">
          <img
            src={image}
            alt={title}
            className="w-12 h-12 rounded-lg object-cover"
          />
          <div className="text-center">
            <p className="text-xl font-bold text-blue-900">{day}</p>
            <p className="text-xs text-gray-500">{month}</p>
          </div>
        </div>
      ) : (
        /* Date only */
        <div className="text-center w-12 shrink-0">
          <p className="text-xl font-bold text-blue-900">{day}</p>
          <p className="text-xs text-gray-500">{month}</p>
        </div>
      )}

      {/* Content */}
      <div className="min-w-0">
        <h3 className="text-sm font-semibold">{title}</h3>
        <p className="text-xs text-gray-500">{time}</p>
        <p className="text-xs text-gray-500">Location : {location}</p>
      </div>
    </div>
  );
}
