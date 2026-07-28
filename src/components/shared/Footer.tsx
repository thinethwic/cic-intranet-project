import { Separator } from "@/components/ui/separator";
import logo from "../../assets/Logo.jpg";
import { Link } from "react-router-dom";
import { FaFacebook, FaLinkedin, FaYoutube } from "react-icons/fa";
import { Mail, MapPin, Phone, Globe } from "lucide-react";
import { Label } from "../ui/label";

const companyLinks = [
  { key: "Home", Link: "/" },
  { key: "Our Segments", Link: "/" },
];

const segments = [
  { SegKey: "CIC Feeds" },
  { SegKey: "CIC Poultry" },
  { SegKey: "CIC Vetcare" },
  { SegKey: "Asia Vet" },
];

export default function Footer() {
  return (
    <footer className="bg-slate-800 text-slate-300">
      <div className="max-w-full mx-auto px-6 sm:px-8 py-4 sm:py-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
                    className="text-sm text-slate-300 hover:text-white transition-colors duration-200"
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
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-0.5 text-slate-400 shrink-0" />
                <p className="text-sm text-gray-300">
                  No. 252, Kurunduwatte Road, Ekala
                </p>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                <a
                  href="mailto:info@cicfeeds.lk"
                  className="text-sm text-cic-300 hover:text-cic-100 underline underline-offset-2 transition-colors duration-200"
                >
                  info@cicfeeds.lk
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                <p className="text-sm text-gray-300">
                  011-5389800 | 011-4830990-3
                </p>
              </li>
              <li className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-slate-400 shrink-0" />
                <a
                  href="https://www.cic.lk/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-slate-300 hover:text-white transition-colors duration-200"
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
              {segments.map(({ SegKey: label }) => (
                <li key={label}>
                  <Label className="text-sm text-slate-300 hover:text-white transition-colors duration-200">
                    {label}
                  </Label>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Divider */}
        <Separator className="my-8 bg-slate-600/50" />

        {/* Bottom Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-400 text-center sm:text-left">
            Design by CIC Feeds Group IT | Copyright © 2026 CIC Feeds Group
          </p>

          {/* Social Icons */}
          <div className="flex items-center gap-4">
            {/* Facebook */}
            <a
              href="https://web.facebook.com/cicfeedsgrp"
              aria-label="Facebook"
              className="text-slate-400 hover:text-white transition-colors duration-200"
            >
              <FaFacebook className="w-7 h-7" />
            </a>

            {/* X / YouTube */}
            <a
              href="https://youtube.com/@cicfeedsgroup"
              aria-label="X"
              className="text-slate-400 hover:text-white transition-colors duration-200"
            >
              <FaYoutube className="w-7 h-7" />
            </a>

            {/* LinkedIn */}
            <a
              href="https://www.linkedin.com/company/cic-feeds-group"
              aria-label="LinkedIn"
              className="text-slate-400 hover:text-white transition-colors duration-200"
            >
              <FaLinkedin className="w-7 h-7" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
