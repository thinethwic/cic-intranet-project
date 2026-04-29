import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import logo from "../../assets/Logo.jpg";

export default function Navbar() {
  const [visible, setVisible] = useState(false);
  const [pinned, setPinned] = useState(false);
  const isScrolled = useRef(false);
  const hoverZoneRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        isScrolled.current = true;
        setVisible(true);
      } else {
        isScrolled.current = false;
        setPinned(false); // reset pin when back at top
        setVisible(false); // always close at top
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <div className="flex-shrink-0">
              <Link
                to="/"
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              >
                <img
                  src={logo}
                  alt="CIC Livestock Solutions"
                  className="h-14 w-auto object-contain"
                />
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Bare hamburger toggle — visible only when navbar is hidden */}
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
