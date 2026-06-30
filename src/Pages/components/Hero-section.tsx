import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  ToolCaseIcon,
  Globe,
} from "lucide-react";
import { FaFacebookF, FaHouseDamage, FaYoutube } from "react-icons/fa";
import { Link } from "react-router-dom";

import slide1 from "../../assets/chicken_farm.png";
import slide2 from "../../assets/Mask-group5.avif";
import slide3 from "../../assets/Mask-group3.avif";
import slide4 from "../../assets/poulry image.png";

interface Slide {
  image: string;
}

const slides: Slide[] = [
  {
    image: slide1,
  },
  {
    image: slide2,
  },
  {
    image: slide3,
  },
  {
    image: slide4,
  },
];

const categories = [
  { label: "Help Desk", icon: HelpCircle, Link: "/helpdesk" },
  {
    label: "Gallery HR",
    icon: FaHouseDamage,
    Link: "/",
  },
  {
    label: "Asset Tool",
    icon: ToolCaseIcon,
    Link: "https://cicinventory.netlify.app",
  },
  { label: "Official Website", icon: Globe, Link: "https://www.cic.lk/" },
  {
    label: "Facebook Page",
    icon: FaFacebookF,
    Link: "https://web.facebook.com/cicfeedsgrp",
  },
  {
    label: "Youtube Page",
    icon: FaYoutube,
    Link: "https://youtube.com/@cicfeedsgroup",
  },
];

const AUTO_SLIDE_INTERVAL = 8000;

export default function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [cardsVisible, setCardsVisible] = useState(false); // 👈 add this

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, AUTO_SLIDE_INTERVAL);
    return () => clearInterval(timer);
  }, []);

  // 👇 add this
  useEffect(() => {
    const timeout = setTimeout(() => setCardsVisible(true), 300);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <section className="relative w-full min-h-[480px] md:min-h-[400px] overflow-hidden flex flex-col">
      {/* Background slides — no overlays */}
      {slides.map((slide, i) => (
        <div
          key={i}
          className="absolute inset-0 transition-opacity duration-700"
          style={{ opacity: i === currentSlide ? 1 : 0 }}
        >
          <img src={slide.image} className="w-full h-full object-cover" />
        </div>
      ))}

      {/* Category cards — bottom center */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 grid grid-cols-3 sm:grid-cols-3 md:grid-cols-6 gap-4 w-max px-4">
        {categories.map(({ label, icon: Icon, Link: link }, i) => (
          <Link to={link} key={i}>
            {/* 👇 wrap Card in animated div */}
            <div
              style={{
                opacity: cardsVisible ? 1 : 0,
                transform: cardsVisible ? "translateY(0)" : "translateY(20px)",
                transition: `opacity 0.5s ease, transform 0.5s ease`,
                transitionDelay: `${300 + i * 120}ms`,
              }}
            >
              <Card className="bg-white/36 backdrop-blur-sm border border-white/60 hover:bg-white/60 transition-all cursor-pointer group shadow-md w-36 sm:w-44">
                <CardContent className="flex flex-col items-center justify-center py-6 px-3">
                  <div className="mb-3 p-3 rounded-2xl bg-blue-50 group-hover:bg-blue-100 transition-all group-hover:scale-110">
                    <Icon className="w-7 h-7 md:w-8 md:h-8 stroke-[1.5] text-[oklch(37.9%_0.146_265.522)]" />
                  </div>
                  <p className="text-sm sm:text-base font-semibold tracking-wide text-center leading-tight text-gray-700">
                    {label}
                  </p>
                </CardContent>
              </Card>
            </div>
          </Link>
        ))}
      </div>

      {/* Prev button */}
      <button
        onClick={() =>
          setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
        }
        className="absolute left-3 top-1/2 -translate-y-1/2 z-30 w-12 h-12 md:w-14 md:h-14 rounded-full bg-white/70 hover:bg-white border border-white/50 shadow-md backdrop-blur-sm flex items-center justify-center transition-all hover:scale-105"
      >
        <ChevronLeft className="w-6 h-6 md:w-7 md:h-7 text-gray-700" />
      </button>

      {/* Next button */}
      <button
        onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)}
        className="absolute right-3 top-1/2 -translate-y-1/2 z-30 w-12 h-12 md:w-14 md:h-14 rounded-full bg-white/70 hover:bg-white border border-white/50 shadow-md backdrop-blur-sm flex items-center justify-center transition-all hover:scale-105"
      >
        <ChevronRight className="w-6 h-6 md:w-7 md:h-7 text-gray-700" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentSlide(i)}
            className={`transition-all rounded-full ${
              i === currentSlide
                ? "w-5 h-2 bg-white shadow-sm"
                : "w-2 h-2 bg-white/50"
            }`}
          />
        ))}
      </div>

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
