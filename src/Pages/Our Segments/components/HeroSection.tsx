import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Slide {
  title: string;
  subtitle: string;
  image: string;
}

interface Props {
  slides: Slide[];
}

const AUTO_SLIDE_INTERVAL = 8000;

export default function HeroSectionSegments({ slides }: Props) {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, AUTO_SLIDE_INTERVAL);

    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative w-full h-105 md:h-150 overflow-hidden">
      {/* Background */}
      {slides.map((slide, i) => (
        <div
          key={i}
          className="absolute inset-0 transition-opacity duration-700"
          style={{ opacity: i === currentSlide ? 1 : 0 }}
        >
          <img
            src={slide.image}
            alt={slide.title}
            className="w-full h-full object-cover scale-105"
          />
          <div className="absolute inset-0 bg-black/30" />
        </div>
      ))}

      {/* Gradient */}
      <div className="absolute inset-0 bg-linear-to-r from-black/50 via-black/20 to-transparent z-10" />

      {/* Content */}
      <div className="relative z-20 flex flex-col items-center justify-center text-center h-full px-6">
        {/* Title */}
        <h1
          key={currentSlide}
          className="text-3xl md:text-6xl font-bold text-white mb-4 animate-fade-in"
        >
          {slides[currentSlide].title}
        </h1>
        {/* Subtitle */}
        <p
          key={`sub-${currentSlide}`}
          className="text-gray-300 text-base md:text-lg mb-10 animate-fade-in"
        >
          {slides[currentSlide].subtitle}
        </p>
      </div>

      {/* Navigation */}
      <Button
        size="icon"
        variant="secondary"
        onClick={() =>
          setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
        }
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 backdrop-blur hover:bg-white/40"
      >
        <ChevronLeft className="w-5 h-5" />
      </Button>

      <Button
        size="icon"
        variant="secondary"
        onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 backdrop-blur hover:bg-white/40"
      >
        <ChevronRight className="w-5 h-5" />
      </Button>

      {/* Dots */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentSlide(i)}
            className={`transition-all rounded-full ${
              i === currentSlide ? "w-6 h-2 bg-white" : "w-2 h-2 bg-white/40"
            }`}
          />
        ))}
      </div>

      {/* Animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.5s ease forwards;
        }
      `}</style>
    </section>
  );
}
