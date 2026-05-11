import { useNavigate } from "react-router-dom";

interface HotNewsCardProps {
  id: number;
  title: string;
  description: string;
  image: string;
  date?: string;
  category?: string;
  onClick?: () => void;
}

export default function HotNewsCard({
  id,
  title,
  description,
  image,
  date,
  category,
  onClick,
}: HotNewsCardProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      navigate(`/news/${id}`);
    }
  };

  return (
    <div className="group flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-400 hover:shadow-md">
      {/* Image */}
      <div className="relative h-48 overflow-hidden" onClick={handleClick}>
        <img
          src={image}
          alt={title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {category && (
          <span className="absolute top-3 left-3 rounded text-[10px] font-medium uppercase tracking-widest bg-[#0C447C] text-[#E6F1FB] px-2.5 py-1">
            {category}
          </span>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col px-5 pt-4 pb-5">
        {date && (
          <p className="mb-2 text-[11px] tracking-wide text-slate-400">
            {date}
          </p>
        )}

        <h3
          className="mb-2.5 line-clamp-2 text-[17px] font-bold  text-blue-900"
          onClick={handleClick}
        >
          {title}
        </h3>

        <p className="mb-4 flex-1 line-clamp-3 text-sm  text-slate-500">
          {description}
        </p>

        {/* Divider */}
        <div className="mb-3.5 h-px bg-slate-100" />

        {/* CTA row */}
        <div className="flex items-center justify-between">
          <button
            onClick={handleClick}
            className="rounded text-[11px] font-medium uppercase bg-blue-900 text-[#ffffff] px-4 py-2 transition-colors hover:bg-[#0C447C]"
          >
            Learn More
          </button>

          <button
            onClick={handleClick}
            className="flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 transition-colors hover:bg-slate-100"
            aria-label="Read article"
          >
            <svg
              viewBox="0 0 14 14"
              fill="none"
              className="h-3.5 w-3.5"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M3 7h8M7.5 3.5L11 7l-3.5 3.5"
                stroke="#0f172a"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
