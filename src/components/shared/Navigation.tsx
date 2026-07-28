import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import logo from "../../assets/Logo.jpg";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useMembers } from "@/hooks/useMembers";
import { useNavItems } from "@/hooks/useNavItems";
import { segmentLabels } from "@/utils/segmentMapper";
import { useCompanyFilter, type CompanyFilter } from "@/contexts/CompanyFilterContext";
import type { NavItem } from "@/types";

// Hides items (and their whole subtree) whose segment doesn't match the
// selected company; segment-less items always show, applying to all companies.
function filterBySegment(items: NavItem[], selected: CompanyFilter): NavItem[] {
  return items
    .filter(
      (item) =>
        selected === "ALL" ||
        item.segment === null ||
        item.segment === selected,
    )
    .map((item) => ({
      ...item,
      children: filterBySegment(item.children, selected),
    }));
}

interface NavMenuItemProps {
  item: NavItem;
  depth: number;
}

function NavMenuItem({ item, depth }: NavMenuItemProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const hasChildren = item.children.length > 0;
  const rowClass =
    depth === 0
      ? "text-slate-600 font-medium hover:text-cic-800 hover:bg-cic-50 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
      : "text-slate-600 text-sm font-medium hover:text-cic-800 hover:bg-cic-50 px-3 py-2 rounded-xl transition-colors flex items-center justify-between gap-3 w-full whitespace-nowrap";

  if (!hasChildren) {
    if (!item.url) {
      return (
        <span className={`${rowClass} opacity-50 cursor-default`}>
          {item.label}
        </span>
      );
    }
    return (
      <Link to={item.url} className={rowClass}>
        {item.label}
      </Link>
    );
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className={rowClass}
      >
        {item.label}
        <ChevronDown
          size={16}
          className={`opacity-60 transition-transform ${
            depth === 0 ? (open ? "rotate-180" : "") : "-rotate-90"
          }`}
        />
      </button>

      {open && (
        <div
          className={`absolute bg-white border border-slate-200 rounded-2xl shadow-lg z-50 p-2 min-w-50 ${
            depth === 0 ? "left-0 top-full mt-2" : "left-full top-0 ml-1"
          }`}
        >
          <div className="flex flex-col gap-1">
            {item.children.map((child) => (
              <NavMenuItem key={child.id} item={child} depth={depth + 1} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const ROLE_ORDER = ["CEO", "COO", "CFO"];
const ROLE_LABELS: Record<string, string> = {
  CEO: "Chief Executive Officer",
  COO: "Chief Operating Officer",
  CFO: "Chief Financial Officer",
};

function getRoleFromEmail(email: string): string {
  const prefix = email.split("@")[0].toUpperCase();
  return ROLE_LABELS[prefix] ?? prefix;
}

export default function Navbar() {
  const [visible, setVisible] = useState(false);
  const [pinned, setPinned] = useState(false);
  const [companyOpen, setCompanyOpen] = useState(false);
  const { selectedCompany, setSelectedCompany } = useCompanyFilter();
  const [topMgmtOpen, setTopMgmtOpen] = useState(false);
  const isScrolled = useRef(false);
  const hoverZoneRef = useRef<HTMLDivElement>(null);
  const topMgmtRef = useRef<HTMLDivElement>(null);

  const { tree } = useNavItems();
  const visibleNavItems = filterBySegment(tree, selectedCompany);

  const { members } = useMembers();
  const topManagement = members
    .filter((m) => m.role === "TOP_MANAGEMENT")
    .sort((a, b) => {
      const aRole = a.email.split("@")[0].toUpperCase();
      const bRole = b.email.split("@")[0].toUpperCase();
      return ROLE_ORDER.indexOf(aRole) - ROLE_ORDER.indexOf(bRole);
    });

  useEffect(() => {
    if (!topMgmtOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (
        topMgmtRef.current &&
        !topMgmtRef.current.contains(e.target as Node)
      ) {
        setTopMgmtOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [topMgmtOpen]);

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

              {/* Navigation items (admin-managed) */}
              <div className="hidden md:flex items-center gap-8">
                {visibleNavItems.map((item) => (
                  <NavMenuItem key={item.id} item={item} depth={0} />
                ))}

                {/* Top Management dropdown */}
                <div className="relative" ref={topMgmtRef}>
                  <button
                    type="button"
                    onClick={() => setTopMgmtOpen((prev) => !prev)}
                    className="text-slate-600 font-medium hover:text-cic-800 hover:bg-cic-50 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                  >
                    Top Management
                    <ChevronDown
                      size={16}
                      className={`opacity-60 transition-transform ${
                        topMgmtOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {topMgmtOpen && (
                    <div className="absolute left-0 mt-2 w-72 bg-white border border-slate-200 rounded-2xl shadow-lg overflow-hidden z-50 p-2">
                      {topManagement.length === 0 ? (
                        <p className="text-sm text-slate-400 text-center py-4">
                          No top management members found.
                        </p>
                      ) : (
                        <div className="flex flex-col gap-1">
                          {topManagement.map((member) => (
                            <div
                              key={member.id}
                              className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-cic-50 transition-colors"
                            >
                              <Avatar className="w-10 h-10 shrink-0">
                                {member.imgeURL && (
                                  <AvatarImage
                                    src={member.imgeURL}
                                    alt={`${member.firstName} ${member.lastName}`}
                                    className="object-cover w-full h-full"
                                  />
                                )}
                                <AvatarFallback className="text-xs font-bold text-cic-800 bg-cic-100">
                                  {member.firstName[0]}
                                  {member.lastName[0]}
                                </AvatarFallback>
                              </Avatar>
                              <div className="min-w-0">
                                <p className="text-sm font-semibold text-slate-800 truncate">
                                  {member.title}. {member.firstName}{" "}
                                  {member.lastName}
                                </p>
                                <p className="text-xs text-slate-500 truncate">
                                  {getRoleFromEmail(member.email)}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Company Selector — filters nav items by segment */}
            <div className="relative">
              <button
                onClick={() => setCompanyOpen(!companyOpen)}
                className="hidden sm:flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-full shadow-sm hover:bg-slate-50 transition-colors"
              >
                <span className="text-sm font-medium text-slate-700">
                  {selectedCompany === "ALL"
                    ? "All Companies"
                    : segmentLabels[selectedCompany]}
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
                  {(
                    ["ALL", ...Object.keys(segmentLabels)] as CompanyFilter[]
                  ).map((company) => (
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
                      {company === "ALL"
                        ? "All Companies"
                        : segmentLabels[company]}
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
