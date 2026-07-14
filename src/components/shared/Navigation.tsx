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
        className={`fixed top-0 left-0 right-0 z-50 bg-white shadow-sm border-b border-slate-200
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
                    className="text-slate-600 font-medium hover:text-cic-800 hover:bg-cic-50 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                  >
                    {dept}
                    <ChevronDown size={16} className="opacity-60" />
                  </Link>
                ))}

                {/* Settings Icon */}
                <button
                  aria-label="Settings"
                  className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                >
                  <Plus size={20} className="text-slate-600" />
                </button>
              </div>
            </div>

            {/* Right: Company Selector */}
            <div className="relative">
              <button
                onClick={() => setCompanyOpen(!companyOpen)}
                className="hidden sm:flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-full shadow-sm hover:bg-slate-50 transition-colors"
              >
                <span className="text-sm font-medium text-slate-700">
                  {selectedCompany}
                </span>
                <ChevronDown
                  size={18}
                  className={`text-slate-500 transition-transform ${
                    companyOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Dropdown */}
              {companyOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-2xl shadow-lg overflow-hidden z-50">
                  {COMPANIES.map((company) => (
                    <button
                      key={company}
                      onClick={() => {
                        setSelectedCompany(company);
                        setCompanyOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 hover:bg-cic-50 transition-colors ${
                        selectedCompany === company
                          ? "text-cic-800 font-medium bg-cic-50"
                          : "text-slate-700"
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
        className={`fixed top-4 right-4 z-70 w-10 h-10 rounded-full bg-white border border-slate-200 shadow-md
          flex flex-col justify-center items-center gap-1.25
          transition-all duration-300 ease-in-out hover:scale-105
          ${!visible ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}
        `}
      >
        <span className="block w-4 h-[2px] bg-cic-900 rounded-full" />
        <span className="block w-4 h-[2px] bg-cic-900 rounded-full" />
        <span className="block w-4 h-[2px] bg-cic-900 rounded-full" />
      </button>
    </>
  );
}
