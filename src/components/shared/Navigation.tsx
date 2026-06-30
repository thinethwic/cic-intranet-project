import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, Plus } from "lucide-react";
import logo from "../../assets/Logo.jpg";

const DEPARTMENTS = ["HR", "Finance", "IT", "Sales", "Stores"];
const COMPANIES = [
  "CIC Feeds",
  "CIC Poulry",
  "CIC Vetcare",
  "Asiavet",
  "All Companies",
];

export default function Navbar() {
  const [visible, setVisible] = useState(false);
  const [pinned, setPinned] = useState(false);
  const [companyOpen, setCompanyOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState("All Companies");
  const isScrolled = useRef(false);
  const hoverZoneRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        isScrolled.current = true;
        setVisible(true);
      } else {
        isScrolled.current = false;
        setPinned(false);
        setVisible(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleToggle = () => {
    setPinned((prev) => {
      const next = !prev;
      setVisible(next || isScrolled.current);
      return next;
    });
  };

  return (
    <>
      {/* Invisible hover trigger zone */}
      <div
        ref={hoverZoneRef}
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => !pinned && !isScrolled.current && setVisible(false)}
        className="fixed top-0 left-0 right-0 h-4 z-50"
      />

      {/* Navbar */}
      <nav
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => !pinned && !isScrolled.current && setVisible(false)}
        className={`fixed top-0 left-0 right-0 z-50 bg-white shadow-md border-b border-blue-100
          transition-transform duration-300 ease-in-out
          ${visible ? "translate-y-0" : "-translate-y-full"}
        `}
      >
        <div className="max-w-full mx-auto px-6 sm:px-8 lg:px-10">
          <div className="flex items-center justify-between h-16">
            {/* Left: Logo + Departments */}
            <div className="flex items-center gap-12">
              {/* Logo */}
              <Link
                to="/"
                onClick={(e) => {
                  e.preventDefault();
                  window.scrollTo({ top: 0, behavior: "smooth" });
                  const onScrollEnd = () => {
                    window.removeEventListener("scrollend", onScrollEnd);
                    window.location.href = "/";
                  };
                  window.addEventListener("scrollend", onScrollEnd);
                  setTimeout(() => {
                    window.removeEventListener("scrollend", onScrollEnd);
                    window.location.href = "/";
                  }, 600);
                }}
              >
                <img
                  src={logo}
                  alt="CIC Livestock Solutions"
                  className="h-14 w-auto object-contain"
                />
              </Link>

              {/* Departments */}
              <div className="hidden md:flex items-center gap-8">
                {DEPARTMENTS.map((dept) => (
                  <Link
                    key={dept}
                    to={`/${dept.toLowerCase()}`}
                    className="text-gray-700 font-medium hover:text-blue-600 transition-colors flex items-center gap-1"
                  >
                    {dept}
                    <ChevronDown size={16} className="opacity-60" />
                  </Link>
                ))}

                {/* Settings Icon */}
                <button
                  aria-label="Settings"
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <Plus size={20} className="text-gray-600" />
                </button>
              </div>
            </div>

            {/* Right: Company Selector */}
            <div className="relative">
              <button
                onClick={() => setCompanyOpen(!companyOpen)}
                className="hidden sm:flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-full hover:bg-gray-50 transition-colors"
              >
                <span className="text-sm font-medium text-gray-700">
                  {selectedCompany}
                </span>
                <ChevronDown
                  size={18}
                  className={`text-gray-600 transition-transform ${
                    companyOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Dropdown */}
              {companyOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                  {COMPANIES.map((company) => (
                    <button
                      key={company}
                      onClick={() => {
                        setSelectedCompany(company);
                        setCompanyOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 hover:bg-blue-50 transition-colors ${
                        selectedCompany === company
                          ? "text-blue-600 font-medium bg-blue-50"
                          : "text-gray-700"
                      }`}
                    >
                      {company}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hamburger toggle */}
      <button
        onClick={handleToggle}
        aria-label="Show navigation"
        className={`fixed top-4 right-5 z-50 flex flex-col justify-center items-center gap-[5px]
          p-1 transition-all duration-300 ease-in-out
          ${!visible ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}
        `}
      >
        <span className="block w-6 h-[2px] bg-white rounded-full" />
        <span className="block w-6 h-[2px] bg-white rounded-full" />
        <span className="block w-6 h-[2px] bg-white rounded-full" />
      </button>
    </>
  );
}
