import HeroSection from "./components/Hero-section";
import news1 from "@/assets/slide1.png";
import news2 from "@/assets/slide2.png";
import { CEOMessageCard } from "./components/MessageCard";
import HotNewsCard from "@/components/HotnewsCrad";
import MembersGrid from "./components/MembersGrid";
import type { Member } from "./components/MembersGrid";
import EventCard from "./components/EventCard";
import OurPeopleCard from "./components/OurPeople";
import WelcomeCard from "./components/WelcomeCard";
import StatsSection from "./components/StatesSection";
import BirthdayCard from "./components/BirthdayCard";
import UpcomingBirthdays from "./components/UpComingBirthDay";
import { Card } from "@/components/ui/card";

import visionImg from "@/assets/vision.jpg"; // eye image
import missionImg from "@/assets/mission.jpg";

import img1 from "@/assets/slide1.png";
import img2 from "@/assets/slide2.png";
import img3 from "@/assets/slide3.png";
import GallerySection from "./components/GallerySection";

function HomePage() {
  const newsList = [
    {
      title:
        "Poultry Production Sri Lanka | Poultry Feed Additives | CIC Holdings",
      description:
        "Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum",
      image: news1,
    },
    {
      title:
        "Poultry Production Sri Lanka | Poultry Feed Additives | CIC Holdings",
      description:
        "Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum",
      image: news1,
    },
    {
      title:
        "Poultry Production Sri Lanka | Poultry Feed Additives | CIC Holdings",
      description:
        "Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum",
      image: news2,
    },
  ];

  const members: Member[] = [
    {
      name: "John Silva",
      role: "Chief Executive Officer",
    },
    {
      name: "Nimal Perera",
      role: "Chief Operating Officer",
    },
    {
      name: "Kasun Fernando",
      role: "Head of Agriculture",
    },
    {
      name: "Saman Jayasinghe",
      role: "Finance Director",
    },
    {
      name: "John Silva",
      role: "Chief Executive Officer",
    },
    {
      name: "Nimal Perera",
      role: "Chief Operating Officer",
    },
    {
      name: "Kasun Fernando",
      role: "Head of Agriculture",
    },
    {
      name: "Saman Jayasinghe",
      role: "Finance Director",
    },
  ];

  const events = [
    {
      image: news1,
      title: "Tech Conference 2026",
      date: "Aug 25, 2026",
      time: "6:00 PM",
      location: "Colombo",
    },
    {
      image: news1,
      title: "Startup Meetup",
      date: "Sep 02, 2026",
      time: "4:30 PM",
      location: "Negombo",
    },
    {
      image: news1,
      title: "AI Workshop",
      date: "Sep 10, 2026",
      time: "10:00 AM",
      location: "Colombo",
    },
  ];

  const people = [
    "Thineth Wickramarachchi",
    "John Silva",
    "Nimal Perera",
    "Kasun Fernando",
  ];

  const upcoming = [
    {
      name: "Thineth Wickramarachchi",
      role: "Intern - IT",
      date: "Apr 30",
    },
    {
      name: "John Silva",
      role: "Manager",
      date: "May 02",
    },
    {
      name: "Nimal Perera",
      role: "Engineer",
      date: "May 05",
    },
  ];

  const images = [img1, img2, img3, img1, img2, img1, img3, img2, img1, img3];

  return (
    <div>
      <HeroSection />
      <section className="max-w-7xl mx-auto px-2 py-4">
        <h2 className="text-4xl font-bold text-blue-900 mb-6">Hot News</h2>

        <div className="grid md:grid-cols-4 gap-6">
          {/* Dynamic News Cards */}
          {newsList.map((item, i) => (
            <HotNewsCard
              key={i}
              title={item.title}
              description={item.description}
              image={item.image}
              onClick={() => console.log("Clicked:", item.title)}
            />
          ))}

          {/* CEO Message */}
          <CEOMessageCard message="Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum" />
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-2 py-4">
        <h2 className="text-4xl font-bold text-blue-900 mb-6">News Events </h2>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Dynamic News Cards */}
          {newsList.map((item, i) => (
            <HotNewsCard
              key={i}
              title={item.title}
              description={item.description}
              image={item.image}
              onClick={() => console.log("Clicked:", item.title)}
            />
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-2 py-4">
        <h2 className="text-4xl font-bold text-blue-900 mb-6">Top Manegment</h2>

        {/* 👇 Reusable Grid */}
        <MembersGrid members={members} />
      </section>

      <section className="max-w-7xl mx-auto px-2 py-4">
        <h2 className="text-4xl font-bold text-blue-900 mb-6">
          Upcoming Events{" "}
        </h2>

        <div className="grid md:grid-cols-4 gap-6">
          {events.map((event, i) => (
            <EventCard key={i} {...event} />
          ))}

          <OurPeopleCard />
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-2 py-4">
        <h2 className="text-4xl font-bold text-blue-900 mb-6">
          Welcome to CIC{" "}
        </h2>

        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
          {people.map((name, i) => (
            <WelcomeCard
              key={i}
              name={name}
              description="Lorem Ipsum Lorem Ipsum Lorem Ipsum"
            />
          ))}
        </div>
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
    </div>
  );
}

export default HomePage;
