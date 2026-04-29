import { Separator } from "@/components/ui/separator";
import logo from "../../assets/Logo.jpg";
import { Link } from "react-router-dom";
import { FaFacebook, FaLinkedin, FaYoutube } from "react-icons/fa";

const companyLinks = [
  { key: "Home", Link: "/" },
  { key: "Our Segments", Link: "/" },
];

const segments = [
  { SegKey: "CIC Feeds", Link: "/our-segments/cic-feeds" },
  { SegKey: "CIC Vetcare", Link: "/our-segments/cic-vetcare" },
  { SegKey: "CIC Poultry", Link: "/our-segments/cic-poulry" },
  { SegKey: "Asia Vet", Link: "/our-segments/asia-vet" },
];

export default function Footer() {
  return (
    <footer className="bg-[#3a3a3a] text-gray-300">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Logo */}
          <div className="flex items-start">
            <div className="bg-white rounded-md p-3">
              <Link
                to="/"
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              >
                <img
                  src={logo}
                  alt="CIC Livestock Solutions"
                  className="h-20 w-auto object-contain"
                />
              </Link>
            </div>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-white font-black text-sm uppercase tracking-widest mb-4">
              Company
            </h3>
            <ul className="space-y-2">
              {companyLinks.map(({ key: link, Link: path }) => (
                <li key={link}>
                  <a
                    href={path}
                    className="text-sm text-gray-300 hover:text-white transition-colors duration-200"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Get In Touch */}
          <div>
            <h3 className="text-white font-black text-sm uppercase tracking-widest mb-4">
              Get In Touch
            </h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="mailto:info@cicfeeds.lk"
                  className="text-sm text-blue-400 hover:text-blue-300 underline underline-offset-2 transition-colors duration-200"
                >
                  info@cicfeeds.lk
                </a>
              </li>
              <li>
                <a
                  href="tel:0115389800"
                  className="text-sm text-gray-300 hover:text-white transition-colors duration-200"
                >
                  0115 389 800
                </a>
              </li>
              <li>
                <a
                  href="tel:0115389800"
                  className="text-sm text-gray-300 hover:text-white transition-colors duration-200"
                >
                  0115 389 800
                </a>
              </li>
              <li>
                <a
                  href="https://www.cic.lk/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-gray-300 hover:text-white transition-colors duration-200"
                >
                  www.cicfeeds.lk
                </a>
              </li>
            </ul>
          </div>

          {/* Our Segments */}
          <div>
            <h3 className="text-white font-black text-sm uppercase tracking-widest mb-4">
              Our Segments
            </h3>
            <ul className="space-y-2">
              {segments.map(({ SegKey: label, Link: path }) => (
                <li key={label}>
                  <a
                    href={path}
                    className="text-sm text-gray-300 hover:text-white transition-colors duration-200"
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Divider */}
        <Separator className="my-8 bg-gray-500/50" />

        {/* Bottom Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-400 text-center sm:text-left">
            Design by CIC Feeds Group IT | Copyright © 2026 CIC Feeds Group
          </p>

          {/* Social Icons */}
          <div className="flex items-center gap-4">
            {/* Facebook */}
            <a
              href="https://web.facebook.com/cicfeedsgrp"
              aria-label="Facebook"
              className="text-gray-400 hover:text-white transition-colors duration-200"
            >
              <FaFacebook className="w-7 h-7" />
            </a>

            {/* X / YouTube */}
            <a
              href="https://youtube.com/@cicfeedsgroup"
              aria-label="X"
              className="text-gray-400 hover:text-white transition-colors duration-200"
            >
              <FaYoutube className="w-7 h-7" />
            </a>

            {/* LinkedIn */}
            <a
              href="https://www.linkedin.com/company/cic-feeds-group"
              aria-label="LinkedIn"
              className="text-gray-400 hover:text-white transition-colors duration-200"
            >
              <FaLinkedin className="w-7 h-7" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
