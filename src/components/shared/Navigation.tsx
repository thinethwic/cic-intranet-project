import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import logo from "../../assets/Logo.jpg";

export default function Navbar() {
  const [visible, setVisible] = useState(false);
  const hoverZoneRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setVisible(true);
      } else {
        setVisible(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      {/* Invisible hover trigger zone at the top */}
      <div
        ref={hoverZoneRef}
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
        className="fixed top-0 left-0 right-0 h-4 z-50"
      />

      {/* Navbar */}
      <nav
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => window.scrollY <= 10 && setVisible(false)}
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
    </>
  );
}
