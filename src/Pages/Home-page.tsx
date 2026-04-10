import HeroSection from "./components/Hero-section";
import { CEOMessageCard } from "./components/MessageCard";
import MembersGrid from "./components/MembersGrid";
import StatsSection from "./components/StatesSection";
import BirthdayCard from "./components/BirthdayCard";
import UpcomingBirthdays from "./components/UpComingBirthDay";
import { Card } from "@/components/ui/card";

import visionImg from "@/assets/vision.jpg"; // eye image
import missionImg from "@/assets/mission.jpg";

import img1 from "@/assets/cic feeds.jpg";
import img2 from "@/assets/slide2.png";
import img3 from "@/assets/slide3.png";
import GallerySection from "./components/GallerySection";
import { useRef, useState } from "react";
import VideoCard from "./components/VideoCard";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import FaqCalendarSection from "@/components/shared/FaqCalendarSection";
import NewsSlider from "./components/NewsSlider";
import WelcomeCarousel from "./components/WelcomeMembers";
import { newsList } from "@/Mock-data";
import { HotnewsList } from "@/Mock-data";
import { members } from "@/Mock-data";
import { people } from "@/Mock-data";
import { upcoming } from "@/Mock-data";
import { videos } from "@/Mock-data";
import EventsSlider from "./components/EventsSlider";
import OurPeopleCard from "./components/OurPeople";

function HomePage() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeVideo, setActiveVideo] = useState<string | null>(null);

  const isYouTube =
    activeVideo &&
    !activeVideo.includes("facebook") &&
    !activeVideo.includes("fb");

  const getEmbedUrl = (url: string) => {
    if (isYouTube) {
      const regExp = /(?:youtube\.com\/.*v=|youtu\.be\/)([^&]+)/;
      const match = url.match(regExp);
      const id = match ? match[1] : url;

      return `https://www.youtube.com/embed/${id}`;
    } else {
      return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(
        url,
      )}&show_text=false&width=800`;
    }
  };

  const images = [img1, img2, img3, img1, img2, img1, img3, img2, img1, img3];

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;

    scrollRef.current.scrollBy({
      left: dir === "left" ? -300 : 300,
      behavior: "smooth",
    });
  };

  return (
    <div>
      <HeroSection />
      <section className="max-w-7xl mx-auto px-2 py-4">
        <h2 className="text-4xl font-bold text-blue-900 mb-6">Hot News</h2>

        <div className="grid md:grid-cols-4 gap-6 items-stretch">
          <div className="md:col-span-3">
            <NewsSlider
              items={HotnewsList}
              visibleCount={3}
              autoInterval={4000}
            />
          </div>

          {/* CEO Message */}
          <CEOMessageCard message="Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum" />
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-2 py-4">
        <h2 className="text-4xl font-bold text-blue-900 mb-6">News Events </h2>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Dynamic News Cards */}
          <div className="md:col-span-3">
            <NewsSlider items={newsList} visibleCount={3} autoInterval={4000} />
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-2 py-4">
        <h2 className="text-4xl font-bold text-blue-900 mb-6">Top Manegment</h2>

        {/* 👇 Reusable Grid */}
        <MembersGrid members={members} />
      </section>

      <section className="max-w-7xl mx-auto px-2 py-4">
        <h2 className="text-4xl font-bold text-blue-900 mb-6">
          Up Coming Events
        </h2>
        <div className="grid md:grid-cols-4 gap-6">
          <div className="md:col-span-3">
            <EventsSlider />
          </div>
          <OurPeopleCard />
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-2 py-4">
        <h2 className="text-4xl font-bold text-blue-900 mb-6">
          Welcome to CIC
        </h2>
        <WelcomeCarousel people={people} />
      </section>
      <StatsSection />
      <section className="max-w-7xl mx-auto px-2 py-4">
        <h2 className="text-4xl font-bold text-blue-900 mb-6">Birthdays </h2>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Left Main Card */}
          <div className="md:col-span-2">
            <BirthdayCard
              name="Thineth Wickramarachchi"
              role="Intern - IT Department"
              message="Your dedication to excellence and commitment to quality continue to inspire us all. Here's to many more years of success and progress."
              date="April 20, 2026 · 14 days away"
            />
          </div>

          {/* Right List */}
          <UpcomingBirthdays list={upcoming} />
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-2 py-4 space-y-20">
        {/* 🔷 Vision */}
        <div className="grid md:grid-cols-2 gap-10 items-center">
          {/* Text */}
          <div>
            <h2 className="text-4xl font-bold text-blue-900 mb-6"> Vision </h2>

            <p className="text-gray-600 leading-relaxed">
              Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem
              Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum
              Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum
            </p>
          </div>

          {/* Image Stack */}
          <div className="relative flex justify-center">
            <Card className="absolute top-6 right-6 w-64 h-40 overflow-hidden shadow-lg">
              <img src={visionImg} className="w-full h-full object-cover" />
            </Card>

            <Card className="w-75 h-55 overflow-hidden shadow-xl">
              <img src={visionImg} className="w-full h-full object-cover" />
            </Card>
          </div>
        </div>

        {/* 🔷 Mission */}
        <div className="grid md:grid-cols-2 gap-10 items-center">
          {/* Image Stack */}
          <div className="relative flex justify-center order-2 md:order-1">
            <Card className="absolute bottom-6 left-6 w-64 h-40 overflow-hidden shadow-lg">
              <img src={missionImg} className="w-full h-full object-cover" />
            </Card>

            <Card className="w-75 h-55 overflow-hidden shadow-xl">
              <img src={missionImg} className="w-full h-full object-cover" />
            </Card>
          </div>

          {/* Text */}
          <div className="order-1 md:order-2">
            <h2 className="text-4xl font-bold text-blue-900 mb-6"> Mission </h2>

            <p className="text-gray-600 leading-relaxed">
              Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem
              Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum
              Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum
            </p>
          </div>
        </div>
      </section>
      <GallerySection images={images} />

      <section className="max-w-7xl mx-auto px-2 py-4">
        {/* Header */}
        <h2 className="text-4xl font-bold text-blue-900 mb-6">Video</h2>

        <div className="relative">
          {/* Left Button */}
          <Button
            size="icon"
            variant="secondary"
            onClick={() => scroll("left")}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10"
          >
            <ChevronLeft />
          </Button>

          {/* Slider */}
          <div
            ref={scrollRef}
            className="flex gap-6 overflow-x-auto no-scrollbar px-10"
          >
            {videos.map((video, i) => (
              <VideoCard
                key={i}
                {...video}
                onClick={() => setActiveVideo(`${video.videoLink}`)}
              />
            ))}
          </div>

          {/* Right Button */}
          <Button
            size="icon"
            variant="secondary"
            onClick={() => scroll("right")}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10"
          >
            <ChevronRight />
          </Button>
        </div>

        {/* 🎬 Modal */}
        {activeVideo && (
          <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50">
            <button
              onClick={() => setActiveVideo(null)}
              className="absolute top-6 right-6 text-white text-2xl"
            >
              ✕
            </button>

            <iframe
              src={getEmbedUrl(activeVideo)}
              className="w-[90%] md:w-[800px] h-[300px] md:h-[450px] rounded-lg"
              allowFullScreen
            />
          </div>
        )}
      </section>
      <FaqCalendarSection />
    </div>
  );
}

export default HomePage;
