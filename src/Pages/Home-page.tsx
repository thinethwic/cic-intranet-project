import HeroSection from "./components/Hero-section";
import { CEOMessageCard } from "./components/MessageCard";
import MembersGrid from "./components/MembersGrid";
import StatsSection from "./components/StatesSection";
import UpcomingBirthdays from "./components/UpComingBirthDay";
import { Card } from "@/components/ui/card";
import { Flame, Newspaper, Calendar } from "lucide-react";

import visionImg from "@/assets/vision.jpg"; // eye image
import missionImg from "@/assets/mission.jpg";
import GallerySection from "./components/GallerySection";
import { useRef, useState, useMemo } from "react";
import VideoCard from "./components/VideoCard";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import FaqCalendarSection from "@/components/shared/FaqCalendarSection";
import NewsSlider from "./components/NewsSlider";
import WelcomeCarousel from "./components/WelcomeMembers";
import {
  newsList,
  members,
  people,
  ceoMessage,
  events,
  videos,
  images,
} from "@/Mock-data";
import EventsSlider from "./components/EventsSlider";
import OurPeopleCard from "./components/OurPeople";

import NoBirthdayCard from "./components/NoBirthdayCard";
import { getTodayBirthdays, getUpcomingBirthdays } from "@/utils/birthday";
import BirthdayCarousel from "./components/BirthdayCarousel";

function HomePage() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeVideo, setActiveVideo] = useState<string | null>(null);

  const hotNews = newsList.filter((n) => n.isHot);
  const standardNews = newsList.filter((n) => !n.isHot);

  const todayBirthdays = useMemo(() => getTodayBirthdays(members), []);
  const upcomingList = useMemo(() => getUpcomingBirthdays(members, 5), []);

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
      {/* Hot News */}

      <section className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center gap-3 mb-6">
          <h2 className="text-2xl md:text-4xl font-bold text-blue-900">
            Hot News
          </h2>
        </div>

        <div className="flex flex-col md:grid md:grid-cols-4 gap-6">
          {/* News Slider */}
          <div className="w-full md:col-span-3">
            {hotNews.length > 0 ? (
              <NewsSlider
                items={hotNews}
                visibleCount={3}
                autoInterval={4000}
              />
            ) : (
              <div className="w-full min-h-55 flex flex-col items-center justify-center gap-3 border border-dashed border-slate-200 rounded-2xl bg-slate-50">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
                  <Flame className="w-5 h-5 text-slate-300" />
                </div>
                <p className="text-sm font-medium text-slate-400">
                  No hot news available
                </p>
                <p className="text-xs text-slate-300">
                  Articles marked as hot will appear here
                </p>
              </div>
            )}
          </div>

          {/* CEO Card */}
          <div className="w-full md:col-span-1">
            <CEOMessageCard
              name={ceoMessage.name}
              image={ceoMessage.image}
              messages={ceoMessage.messages}
            />
          </div>
        </div>
      </section>

      {/* News Events */}
      <section className="max-w-7xl mx-auto px-2 py-4">
        <div className="flex items-center gap-3 mb-6">
          <h2 className="text-4xl font-bold text-blue-900">News Events</h2>
        </div>

        {standardNews.length > 0 ? (
          <div className="md:col-span-3">
            <NewsSlider
              items={standardNews}
              visibleCount={3}
              autoInterval={4000}
            />
          </div>
        ) : (
          <div className="w-full min-h-55 flex flex-col items-center justify-center gap-3 border border-dashed border-slate-200 rounded-2xl bg-slate-50">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
              <Newspaper className="w-5 h-5 text-slate-300" />
            </div>
            <p className="text-sm font-medium text-slate-400">
              No news events available
            </p>
            <p className="text-xs text-slate-300">
              Published articles will appear here
            </p>
          </div>
        )}
      </section>

      <section className="max-w-7xl mx-auto px-2 py-4">
        <div className="flex items-center gap-3 mb-6">
          <h2 className="text-4xl font-bold text-blue-900">Upcoming Events</h2>
        </div>

        {/* ✅ FIX: On mobile, stack vertically. OurPeopleCard goes below and is centered. */}
        <div className="flex flex-col md:grid md:grid-cols-4 gap-6">
          <div className="md:col-span-3 order-1">
            {events.length > 0 ? (
              <EventsSlider />
            ) : (
              <div className="w-full min-h-55 flex flex-col items-center justify-center gap-3 border border-dashed border-slate-200 rounded-2xl bg-slate-50">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-slate-300" />
                </div>
                <p className="text-sm font-medium text-slate-400">
                  No upcoming events
                </p>
                <p className="text-xs text-slate-300">
                  Scheduled events will appear here
                </p>
              </div>
            )}
          </div>

          {/* ✅ order-2 keeps it below the slider on mobile */}
          <div className="order-2 flex justify-center md:block">
            <OurPeopleCard />
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-2 py-4">
        <h2 className="text-4xl font-bold text-blue-900 mb-6">Top Manegment</h2>

        {/* 👇 Reusable Grid */}
        <MembersGrid members={members} />
      </section>

      <StatsSection />

      <section className="max-w-7xl mx-auto px-2 py-4">
        <h2 className="text-4xl font-bold text-blue-900 mb-6">
          Welcome to CIC Feeds Group
        </h2>
        <WelcomeCarousel people={people} />
      </section>
      <section className="max-w-7xl mx-auto px-2 py-4">
        <h2 className="text-4xl font-bold text-blue-900 mb-6">Birthdays</h2>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 flex flex-col gap-4">
            {todayBirthdays.length === 0 ? (
              <NoBirthdayCard />
            ) : (
              <BirthdayCarousel members={todayBirthdays} />
            )}
          </div>

          <UpcomingBirthdays list={upcomingList} />
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
              className="w-[90%] md:w-200 h-75 md:h-112.5 rounded-lg"
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
