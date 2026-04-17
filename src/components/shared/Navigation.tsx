import { useState } from "react";
import { Link, useLocation } from "react-router-dom";

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
import { ChevronDown, Menu } from "lucide-react";

import logo from "../../assets/Logo.jpg";

const navLinks = [
  { NavKey: "Home", Link: "/" },
  { NavKey: "---", Link: "" },
  { NavKey: "---", Link: "" },
  { NavKey: "---", Link: "" },
];

const segments = [
  { SegKey: "CIC Feeds", Link: "/our-segments/cic-feeds" },
  { SegKey: "CIC Vetcare", Link: "/our-segments/cic-vetcare" },
  { SegKey: "CIC Poultry", Link: "/our-segments/cic-poulry" },
  { SegKey: "Asia Vet", Link: "/our-segments/asia-vet" },
];

const customColor = "oklch(37.9% 0.146 265.522)";

export default function Navbar() {
  // ✅ FIX 1: Derive active state from the real URL instead of manual state
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  // ✅ FIX 2: Track mobile segments accordion open/closed
  const [segmentsOpen, setSegmentsOpen] = useState(false);

  const isSegmentActive = segments.some((s) => s.Link === location.pathname);

  const isActive = (path: string) => location.pathname === path;
  const isSegmentsActive = isSegmentActive;

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50 border-b border-blue-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/">
              <img
                src={logo}
                alt="CIC Livestock Solutions"
                className="h-14 w-auto object-contain"
              />
            </Link>
          </div>

          {/* ===== Desktop Navigation ===== */}
          <div className="hidden md:flex items-center">
            <NavigationMenu>
              <NavigationMenuList className="gap-1">
                {navLinks.map(({ NavKey: label, Link: path }) => (
                  // ✅ FIX 3: key goes on the outermost element
                  <NavigationMenuItem key={label}>
                    <Link to={path}>
                      <button
                        style={
                          isActive(path)
                            ? { backgroundColor: customColor, color: "white" }
                            : {}
                        }
                        className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                          isActive(path)
                            ? "shadow-md"
                            : "text-gray-600 hover:bg-blue-50 hover:text-[oklch(37.9%_0.146_265.522)]"
                        }`}
                      >
                        {label}
                      </button>
                    </Link>
                  </NavigationMenuItem>
                ))}

                {/* Our Segments Dropdown */}
                <NavigationMenuItem>
                  <NavigationMenuTrigger
                    // ✅ FIX 4: Use className for hover color — avoids inline style conflicts with shadcn internals
                    style={
                      isSegmentsActive
                        ? { backgroundColor: customColor, color: "white" }
                        : {}
                    }
                    className={`px-4 py-2 rounded-lg text-sm font-semibold ${
                      isSegmentsActive
                        ? ""
                        : "text-gray-600 hover:bg-blue-50 hover:text-[oklch(37.9%_0.146_265.522)]"
                    }`}
                  >
                    Our Segments
                  </NavigationMenuTrigger>

                  <NavigationMenuContent>
                    <div className="w-[200px] p-2 space-y-1">
                      {segments.map(({ SegKey: label, Link: path }) => (
                        // ✅ FIX 5: key on the Link wrapper, not the button
                        <Link key={label} to={path}>
                          <button className="w-full text-left px-3 py-2 rounded-md text-sm text-gray-600 hover:bg-blue-50 hover:text-[oklch(37.9%_0.146_265.522)] transition">
                            {label}
                          </button>
                        </Link>
                      ))}
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          {/* ===== Desktop Actions ===== */}
          <div className="hidden md:flex items-center gap-3">
            <Button
              variant="ghost"
              style={{ color: customColor }}
              className="font-semibold hover:bg-blue-50"
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

          {/* ===== Mobile Menu ===== */}
          <div className="md:hidden">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger>
                <Button
                  variant="ghost"
                  size="icon"
                  style={{ color: customColor }}
                  className="hover:bg-blue-50"
                >
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>

              <SheetContent side="right" className="w-72 p-0 flex flex-col">
                {/* Logo */}
                <div className="px-6 py-5 border-b border-blue-100 flex-shrink-0">
                  <img
                    src={logo}
                    alt="CIC Livestock Solutions"
                    className="h-9 w-auto object-contain"
                  />
                </div>

                {/* Scrollable link area */}
                <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
                  {navLinks.map(({ NavKey: label, Link: path }) => (
                    // ✅ FIX 6: key on Link, not the button
                    <Link key={label} to={path}>
                      <button
                        onClick={() => setMobileOpen(false)}
                        style={
                          isActive(path)
                            ? { backgroundColor: customColor, color: "white" }
                            : {}
                        }
                        className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                          isActive(path)
                            ? ""
                            : "text-gray-600 hover:bg-blue-50 hover:text-[oklch(37.9%_0.146_265.522)]"
                        }`}
                      >
                        {label}
                      </button>
                    </Link>
                  ))}

                  {/* ✅ FIX 7: Mobile segments accordion — was broken (rendered [object Object]) */}
                  <div className="mt-2">
                    <button
                      onClick={() => setSegmentsOpen((prev) => !prev)}
                      style={isSegmentsActive ? { color: customColor } : {}}
                      className="w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-sm font-semibold text-gray-600 hover:bg-blue-50 hover:text-[oklch(37.9%_0.146_265.522)] transition-all duration-200"
                    >
                      <span>Our Segments</span>
                      <ChevronDown
                        className={`w-4 h-4 transition-transform duration-200 ${
                          segmentsOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {segmentsOpen && (
                      <div className="mt-1 ml-3 space-y-1 border-l-2 border-blue-100 pl-3">
                        {segments.map(({ SegKey: label, Link: path }) => (
                          <Link key={label} to={path}>
                            <button
                              onClick={() => {
                                setMobileOpen(false);
                                setSegmentsOpen(false);
                              }}
                              style={
                                isActive(path)
                                  ? { color: customColor, fontWeight: 600 }
                                  : {}
                              }
                              className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-blue-50 hover:text-[oklch(37.9%_0.146_265.522)] rounded-md transition"
                            >
                              {label}
                            </button>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Actions */}
                <div className="px-4 py-4 flex flex-col gap-2 flex-shrink-0">
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
