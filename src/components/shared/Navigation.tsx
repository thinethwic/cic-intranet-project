import { useState } from "react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuContent,
} from "@/components/ui/navigation-menu";
import { Separator } from "@/components/ui/separator";
import { Menu } from "lucide-react";

import logo from "../../assets/Logo.jpg";

const navLinks = ["Home", "About Us", "News", "Contact"];

const segments = ["CIC Feeds", "CIC Vetcare", "CIC Poultry", "Asia Vet"];

export default function Navbar() {
  const [activeNav, setActiveNav] = useState("Home");
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50 border-b border-green-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <img
              src={logo}
              alt="CIC Livestock Solutions"
              className="h-10 w-auto object-contain"
            />
          </div>

          {/* ================= Desktop Navigation ================= */}
          <div className="hidden md:flex items-center">
            <NavigationMenu>
              <NavigationMenuList className="gap-1">
                {/* Normal Links */}
                {navLinks.map((link) => (
                  <NavigationMenuItem key={link}>
                    <button
                      onClick={() => setActiveNav(link)}
                      className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                        activeNav === link
                          ? "bg-green-700 text-white shadow-md"
                          : "text-gray-600 hover:bg-green-50 hover:text-green-800"
                      }`}
                    >
                      {link}
                    </button>
                  </NavigationMenuItem>
                ))}

                {/* 🔽 Our Segments Dropdown */}
                <NavigationMenuItem>
                  <NavigationMenuTrigger
                    className={`px-4 py-2 rounded-lg text-sm font-semibold ${
                      activeNav === "Our Segments"
                        ? "bg-green-700 text-white"
                        : "text-gray-600 hover:bg-green-50 hover:text-green-800"
                    }`}
                  >
                    Our Segments
                  </NavigationMenuTrigger>

                  <NavigationMenuContent>
                    <div className="w-[200px] p-2 space-y-1">
                      {segments.map((item) => (
                        <button
                          key={item}
                          onClick={() => setActiveNav("Our Segments")}
                          className="w-full text-left px-3 py-2 rounded-md text-sm text-gray-600 hover:bg-green-50 hover:text-green-800 transition"
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          {/* ================= Desktop Actions ================= */}
          <div className="hidden md:flex items-center gap-3">
            <Button
              variant="ghost"
              className="text-green-700 font-semibold hover:text-green-900 hover:bg-green-50"
            >
              Login
            </Button>

            <Button className="bg-green-700 hover:bg-green-800 text-white font-bold shadow-sm">
              Get Started
            </Button>
          </div>

          {/* ================= Mobile Menu ================= */}
          <div className="md:hidden">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-green-700 hover:bg-green-50"
                >
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>

              <SheetContent side="right" className="w-72 p-0">
                {/* Logo */}
                <div className="px-6 py-5 border-b border-green-100">
                  <img src={logo} className="h-9" />
                </div>

                {/* Links */}
                <div className="px-4 py-4 space-y-1">
                  {navLinks.map((link) => (
                    <button
                      key={link}
                      onClick={() => {
                        setActiveNav(link);
                        setMobileOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-semibold ${
                        activeNav === link
                          ? "bg-green-700 text-white"
                          : "text-gray-600 hover:bg-green-50 hover:text-green-800"
                      }`}
                    >
                      {link}
                    </button>
                  ))}

                  {/* 🔽 Mobile Segments */}
                  <div className="mt-3">
                    <p className="px-4 text-xs text-gray-400 uppercase mb-2">
                      Our Segments
                    </p>

                    {segments.map((item) => (
                      <button
                        key={item}
                        onClick={() => setMobileOpen(false)}
                        className="w-full text-left px-6 py-2 text-sm text-gray-600 hover:bg-green-50 hover:text-green-800 rounded-md"
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>

                <Separator className="mx-4" />

                {/* Actions */}
                <div className="px-4 py-4 flex flex-col gap-2">
                  <Button
                    variant="outline"
                    className="w-full border-green-700 text-green-700 hover:bg-green-50"
                  >
                    Login
                  </Button>

                  <Button className="w-full bg-green-700 hover:bg-green-800 text-white">
                    Get Started
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}
