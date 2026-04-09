import { useState } from "react";

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
import { Link } from "react-router-dom";

const navLinks = [
  { NavKey: "Home", Link: "/" },
  { NavKey: "About Us", Link: "/Abouts" },
  { NavKey: "News", Link: "/News" },
  { NavKey: "Contact", Link: "/Contact" },
];

const segments = [
  { SegKey: "CIC Feeds", Link: "/our-segments/cic-feeds" },
  { SegKey: "CIC Vetcare", Link: "/our-segments/cic-vetcare" },
  { SegKey: "CIC Poultry", Link: "/our-segments/cic-poulry" },
  { SegKey: "Asia Vet", Link: "/our-segments/asia-vet" },
];

const customColor = "oklch(37.9% 0.146 265.522)";

export default function Navbar() {
  const [activeNav, setActiveNav] = useState("Home");
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50 border-b border-blue-100">
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
                {navLinks.map(({ NavKey: link, Link: navigation }) => (
                  <NavigationMenuItem key={link}>
                    <Link to={navigation}>
                      <button
                        onClick={() => setActiveNav(link)}
                        style={
                          activeNav === link
                            ? { backgroundColor: customColor, color: "white" }
                            : {}
                        }
                        className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                          activeNav === link
                            ? "shadow-md"
                            : "text-gray-600 hover:bg-blue-50"
                        }`}
                        onMouseEnter={(e) => {
                          if (activeNav !== link)
                            e.currentTarget.style.color = customColor;
                        }}
                        onMouseLeave={(e) => {
                          if (activeNav !== link)
                            e.currentTarget.style.color = "";
                        }}
                      >
                        {link}
                      </button>
                    </Link>
                  </NavigationMenuItem>
                ))}

                {/* 🔽 Our Segments Dropdown */}
                <NavigationMenuItem>
                  <NavigationMenuTrigger
                    style={
                      activeNav === "Our Segments"
                        ? { backgroundColor: customColor, color: "white" }
                        : { color: "rgb(75 85 99)" }
                    }
                    className={`px-4 py-2 rounded-lg text-sm font-semibold ${
                      activeNav === "Our Segments" ? "" : "hover:bg-blue-50"
                    }`}
                    onMouseEnter={(e) => {
                      if (activeNav !== "Our Segments")
                        e.currentTarget.style.color = customColor;
                    }}
                    onMouseLeave={(e) => {
                      if (activeNav !== "Our Segments")
                        e.currentTarget.style.color = "rgb(75 85 99)";
                    }}
                  >
                    Our Segments
                  </NavigationMenuTrigger>

                  <NavigationMenuContent>
                    <div className="w-[200px] p-2 space-y-1">
                      {segments.map(({ SegKey: item, Link: navigation }) => (
                        <Link to={navigation}>
                          <button
                            key={item}
                            onClick={() => setActiveNav("Our Segments")}
                            className="w-full text-left px-3 py-2 rounded-md text-sm text-gray-600 hover:bg-blue-50 transition"
                            onMouseEnter={(e) =>
                              (e.currentTarget.style.color = customColor)
                            }
                            onMouseLeave={(e) =>
                              (e.currentTarget.style.color = "")
                            }
                          >
                            {item}
                          </button>
                        </Link>
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
              style={{ color: customColor }}
              className="font-semibold hover:bg-blue-50"
              onMouseEnter={(e) => (e.currentTarget.style.color = customColor)}
            >
              Login
            </Button>

            <Button
              style={{ backgroundColor: customColor }}
              className="text-white font-bold shadow-sm hover:opacity-90"
            >
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
                  style={{ color: customColor }}
                  className="hover:bg-blue-50"
                >
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>

              <SheetContent side="right" className="w-72 p-0">
                {/* Logo */}
                <div className="px-6 py-5 border-b border-blue-100">
                  <img src={logo} className="h-9" />
                </div>

                {/* Links */}
                <div className="px-4 py-4 space-y-1">
                  {navLinks.map(({ NavKey: link, Link: navigation }) => (
                    <Link to={navigation}>
                      <button
                        key={link}
                        onClick={() => {
                          setActiveNav(link);
                          setMobileOpen(false);
                        }}
                        style={
                          activeNav === link
                            ? { backgroundColor: customColor, color: "white" }
                            : {}
                        }
                        className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-semibold ${
                          activeNav === link
                            ? ""
                            : "text-gray-600 hover:bg-blue-50"
                        }`}
                        onMouseEnter={(e) => {
                          if (activeNav !== link)
                            e.currentTarget.style.color = customColor;
                        }}
                        onMouseLeave={(e) => {
                          if (activeNav !== link)
                            e.currentTarget.style.color = "";
                        }}
                      >
                        {link}
                      </button>
                    </Link>
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
                        className="w-full text-left px-6 py-2 text-sm text-gray-600 hover:bg-blue-50 rounded-md"
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.color = customColor)
                        }
                        onMouseLeave={(e) => (e.currentTarget.style.color = "")}
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
                    style={{ color: customColor, borderColor: customColor }}
                    className="w-full hover:bg-blue-50"
                  >
                    Login
                  </Button>

                  <Button
                    style={{ backgroundColor: customColor }}
                    className="w-full text-white hover:opacity-90"
                  >
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
