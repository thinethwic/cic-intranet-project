import { useEffect, useRef, useState } from "react";

/* ✅ Counter Component */
function Counter({ end, start }: { end: number; start: boolean }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!start) return; // ⛔ only run when visible

    let current = 0;
    const duration = 1200;
    const step = end / (duration / 16);

    const timer = setInterval(() => {
      current += step;

      if (current >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [end, start]);

  return <>{count}</>;
}

/* ✅ Stats Section */
export default function StatsSection() {
  const stats = [
    { value: 20, suffix: "+", label: "Top Management" },
    { value: 200, suffix: "+", label: "Employees" },
    { value: 4, suffix: "+", label: "Companies" },
  ];

  const ref = useRef<HTMLDivElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  /* 👇 Detect when section is in viewport */
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }, // trigger when 30% visible
    );

    if (ref.current) observer.observe(ref.current);

    return () => observer.disconnect();
  }, []);

  return (
    <section ref={ref} className="max-w-7xl mx-auto px-6 py-10">
      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
        {stats.map((item, i) => (
          <div
            key={i}
            className="rounded-xl p-6 bg-white shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 text-center"
          >
            {/* Animated Number */}
            <h3 className="text-6xl font-bold text-[var(--custom-colour)]">
              <Counter end={item.value} start={isVisible} />
              {item.suffix}
            </h3>

            {/* Label */}
            <p className="text-gray-500 text-xl mt-2">{item.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
