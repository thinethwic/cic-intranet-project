import { Outlet } from "react-router-dom";
import Navbar from "./shared/Navigation";
import Footer from "./shared/Footer";
import ChatBot from "./shared/ChatBot";

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <ChatBot />
    </div>
  );
}
