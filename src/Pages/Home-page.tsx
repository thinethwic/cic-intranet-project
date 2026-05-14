import HeroSection from "./components/Hero-section";
import MembersGrid from "./components/MembersGrid";
import StatsSection from "./components/StatesSection";
import UpcomingBirthdays from "./components/UpComingBirthDay";
import { Card } from "@/components/ui/card";
import { Flame, Newspaper, Calendar } from "lucide-react";
import visionImg from "@/assets/vision.jpg"; // eye image
import missionImg from "@/assets/mission.jpg";
import GallerySection from "./components/GallerySection";
import { useRef, useState, useMemo } from "react";
import VideoCard, { VideoModal } from "./components/VideoCard";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import FaqCalendarSection from "@/components/shared/FaqCalendarSection";
import NewsSlider from "./components/NewsSlider";
import WelcomeCarousel from "./components/WelcomeMembers";
import { useMembers } from "@/hooks/useMembers";
import type { Member as BirthdayMember } from "@/utils/birthday";
import EventsSlider from "./components/EventsSlider";
import OurPeopleCard from "./components/OurPeople";
import NoBirthdayCard from "./components/NoBirthdayCard";
import { getTodayBirthdays, getUpcomingBirthdays } from "@/utils/birthday";
import BirthdayCarousel from "./components/BirthdayCarousel";
import { useVideos } from "@/hooks/useVideos";
import { useNews } from "@/hooks/useNews";
import { useEvents } from "@/hooks/useEvents";
import { AlertOrCEOCard } from "./components/Alertorceocard";
import { Skeleton } from "@/components/ui/skeleton";
import InlineErrorAlert from "@/components/shared/InlineErrorAlert";

function SliderSkeleton({ count }: { count: number }) {
  return (
    <div className={`grid gap-4 ${count > 2 ? "md:grid-cols-3" : "md:grid-cols-2"}`}>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
        >
          <Skeleton className="h-44 w-full rounded-xl" />
          <div className="mt-4 space-y-3">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-5 w-4/5" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

function EventSkeleton() {
  return (
    <div className="flex gap-4 px-0 sm:px-10">
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={index}
          className="flex-1 overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
        >
          <Skeleton className="h-40 w-full rounded-xl" />
          <div className="mt-4 space-y-3">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

function CarouselSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
        >
          <Skeleton className="mx-auto h-24 w-24 rounded-full" />
          <div className="mt-4 space-y-3 text-center">
            <Skeleton className="mx-auto h-5 w-3/4" />
            <Skeleton className="mx-auto h-4 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

function BirthdaySkeleton() {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      <div className="md:col-span-2 overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex gap-4">
          <Skeleton className="h-28 w-28 rounded-2xl" />
          <div className="flex-1 space-y-3">
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>
      </div>
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <Skeleton className="h-5 w-32" />
        <div className="mt-4 space-y-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function VideoSkeleton() {
  return (
    <div className="flex gap-4 sm:gap-6 overflow-hidden px-0 sm:px-10">
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={index}
          className="min-w-[280px] flex-1 overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
        >
          <Skeleton className="h-44 w-full rounded-xl" />
          <div className="mt-4 space-y-3">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

function HomePage() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeVideo, setActiveVideo] = useState<string | null>(null);

  // ✅ Replace mock data with real API
  const { videos, loading: videosLoading, error: videosError } = useVideos();
  const {
    events,
    loading: eventsLoading,
    error: eventsError,
  } = useEvents();
  const { news, loading: newsLoading, error: newsError } = useNews();

  const hotNews = news.filter((n) => n.isHot);
  const standardNews = news.filter((n) => !n.isHot);

  const {
    members = [],
    loading: membersLoading,
    error: membersError,
  } = useMembers();

  // fetch and setAlerts(...) from your API/mock data

  // ✅ Memoize the mapping first
  const birthdayMembers: BirthdayMember[] = useMemo(
    () =>
      members.map((m) => ({
        name: `${m.firstName} ${m.lastName}`,
        role: m.role,
        dob: m.dob,
      })),
    [members],
  );

  // ✅ Then depend on birthdayMembers — not members
  const todayBirthdays = useMemo(
    () => getTodayBirthdays(birthdayMembers),
    [birthdayMembers],
  );

  const upcomingList = useMemo(
    () => getUpcomingBirthdays(birthdayMembers, 5),
    [birthdayMembers],
  );

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

  const recentMembers = useMemo(() => {
    return [...members]
      .filter((m) => m.joinedDate) // ✅ only members with joinedDate
      .sort(
        (a, b) =>
          new Date(b.joinedDate).getTime() - new Date(a.joinedDate).getTime(), // ✅ newest first
      )
      .slice(0, 10); // ✅ limit to 10
  }, [members]);

  // ✅ Map to WelcomeCarousel shape
  const welcomePeople = recentMembers.map((m) => ({
    name: `${m.firstName} ${m.lastName}`,
    role: m.role,
    joinedDate: m.joinedDate,
    image: null, // no image on member
  }));

  const mapNewsItems = (list: typeof news) =>
    list.map((n) => ({
      id: n.id,
      title: n.title,
      description: n.description,
      image: n.image,
      category: n.category,
    }));

  return (
    <div>
      <HeroSection />
      {/* Hot News */}

      <section className="max-w-7xl mx-auto px-2 py-4">
        <div className="flex items-center gap-3 mb-6">
          <h2 className="text-2xl md:text-4xl font-bold text-blue-900">
            Hot News
          </h2>
        </div>

        <div className="flex flex-col md:grid md:grid-cols-3 gap-6">
          {/* News Slider */}
          <div className="w-full md:col-span-2">
            {newsLoading ? (
              <SliderSkeleton count={2} />
            ) : newsError ? (
              <InlineErrorAlert message={newsError} />
            ) : hotNews.length > 0 ? (
              <NewsSlider
                items={mapNewsItems(hotNews)}
                visibleCount={2}
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

          {/* CEO Card / Alert Card */}
          <div className="w-full md:col-span-1">
            <AlertOrCEOCard />
          </div>
        </div>
      </section>

      {/* News Events */}
      <section className="max-w-7xl mx-auto px-2 py-4">
        <div className="flex items-center gap-3 mb-6">
          <h2 className="text-4xl font-bold text-blue-900">News Events</h2>
        </div>

        {newsLoading ? (
          <SliderSkeleton count={3} />
        ) : newsError ? (
          <InlineErrorAlert message={newsError} />
        ) : standardNews.length > 0 ? (
          <div className="md:col-span-3">
            <NewsSlider
              items={mapNewsItems(standardNews)}
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
            <div className="md:col-span-3 order-1">
              {eventsLoading ? (
                // ✅ skeleton while fetching
                <EventSkeleton />
              ) : eventsError ? (
                <InlineErrorAlert message={eventsError} />
              ) : events.length > 0 ? (
                <EventsSlider events={events} /> // ✅ pass events as prop
              ) : (
                // ✅ your existing empty state
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
        <MembersGrid />
      </section>

      <StatsSection />

      <section className="max-w-7xl mx-auto px-2 py-4">
        <h2 className="text-4xl font-bold text-blue-900 mb-6">
          Welcome to CIC Feeds Group
        </h2>
        {membersLoading ? (
          <CarouselSkeleton />
        ) : membersError ? (
          <InlineErrorAlert message={membersError} />
        ) : recentMembers.length === 0 ? (
          <p className="text-sm text-gray-400 py-6 text-center">
            No new members
          </p>
        ) : (
          <WelcomeCarousel people={welcomePeople} />
        )}
      </section>

      <section className="max-w-7xl mx-auto px-2 py-4">
        <h2 className="text-4xl font-bold text-blue-900 mb-6">Birthdays</h2>

        {membersLoading ? (
          <BirthdaySkeleton />
        ) : membersError ? (
          <InlineErrorAlert message={membersError} />
        ) : (
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
        )}
      </section>

      <section className="max-w-7xl mx-auto px-2 py-4 space-y-20">
        {/* 🔷 Vision */}
        <div className="grid md:grid-cols-2 gap-10 items-center">
          {/* Text */}
          <div>
            <h2 className="text-4xl font-bold text-blue-900 mb-6"> Vision </h2>

            <p className="text-gray-600 leading-relaxed">
              To raise living standards around the country by delivering
              increased value to producers and consumers while optimizing
              benefits to our customers, shareholders, employees and other
              stakeholders.
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
              To become the national leader in providing products, services and
              expertise for the growth and care of livestock by understanding,
              creating and communicating superior value for our customers while
              prioritizing food safety technologies.
            </p>
          </div>
        </div>
      </section>
      <GallerySection />

      {/* ✅ Video Section */}
      <section className="max-w-7xl mx-auto px-2 py-4">
        <h2 className="text-4xl font-bold text-blue-900 mb-6">Video</h2>

        {videosLoading ? (
          <VideoSkeleton />
        ) : videosError ? (
          <InlineErrorAlert message={videosError} />
        ) : videos.length === 0 ? (
          <div className="w-full min-h-55 flex flex-col items-center justify-center gap-3 border border-dashed border-slate-200 rounded-2xl bg-slate-50">
            <p className="text-sm font-medium text-slate-400">
              No videos available
            </p>
          </div>
        ) : (
          <div className="relative">
            <Button
              size="icon"
              variant="secondary"
              onClick={() => scroll("left")}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 hidden sm:flex"
            >
              <ChevronLeft />
            </Button>

            <div
              ref={scrollRef}
              className="flex gap-4 sm:gap-6 overflow-x-auto no-scrollbar px-0 sm:px-10"
            >
              {videos
                .filter((v) => v.videoLink)
                .map((video) => (
                  <VideoCard
                    key={video.id}
                    title={video.title}
                    description={video.description}
                    videoLink={video.videoLink}
                    onClick={() => setActiveVideo(video.videoLink)}
                  />
                ))}
            </div>

            <Button
              size="icon"
              variant="secondary"
              onClick={() => scroll("right")}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 hidden sm:flex"
            >
              <ChevronRight />
            </Button>
          </div>
        )}

        {/* 🎬 Modal with keyboard support */}
        {activeVideo && (
          <VideoModal
            activeVideo={activeVideo}
            videos={videos.filter((v) => v.videoLink).map((v) => v.videoLink)}
            onClose={() => setActiveVideo(null)}
            onNavigate={setActiveVideo}
            getEmbedUrl={getEmbedUrl}
          />
        )}
      </section>
      <FaqCalendarSection />
    </div>
  );
}

export default HomePage;
