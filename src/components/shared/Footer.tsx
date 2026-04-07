import { Separator } from "@/components/ui/separator";
import logo from "../../assets/Logo.jpg";
import { X } from "lucide-react";

const companyLinks: string[] = ["Home", "About Us", "Our Segments"];

const segmentLinks: string[] = [
  "CIC Feeds",
  "CIC Vet care",
  "CIC Poultry",
  "Asia Vet",
];

export default function Footer() {
  return (
    <footer className="bg-[#3a3a3a] text-gray-300">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Logo */}
          <div className="flex items-start">
            <div className="bg-white rounded-md p-3">
              <img
                src={logo}
                alt="CIC Livestock Solutions"
                className="h-14 w-auto object-contain"
              />
            </div>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-white font-black text-sm uppercase tracking-widest mb-4">
              Company
            </h3>
            <ul className="space-y-2">
              {companyLinks.map((link) => (
                <li key={link}>
                  <a
                    href="#"
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
              {segmentLinks.map((seg) => (
                <li key={seg}>
                  <a
                    href="#"
                    className="text-sm text-gray-300 hover:text-white transition-colors duration-200"
                  >
                    {seg}
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
            Design by Thineth Wic | Copyright © 2026 CIC Feeds Group
          </p>

          {/* Social Icons */}
          <div className="flex items-center gap-4">
            {/* Facebook */}
            <a
              href="#"
              aria-label="Facebook"
              className="text-gray-400 hover:text-white transition-colors duration-200"
            >
              <X className="w-5 h-5" />
            </a>

            {/* X / Twitter */}
            <a
              href="#"
              aria-label="X"
              className="text-gray-400 hover:text-white transition-colors duration-200"
            >
              <X className="w-5 h-5" />
            </a>

            {/* Google — lucide doesn't have Google icon, using a simple G SVG */}
            <a
              href="#"
              aria-label="Google"
              className="text-gray-400 hover:text-white transition-colors duration-200"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-5 h-5"
              >
                <path d="M21.805 10.023H12v3.977h5.617C16.973 16.21 14.745 17.5 12 17.5c-3.038 0-5.5-2.462-5.5-5.5s2.462-5.5 5.5-5.5c1.395 0 2.663.522 3.627 1.373l2.828-2.828C16.557 3.49 14.392 2.5 12 2.5 6.753 2.5 2.5 6.753 2.5 12S6.753 21.5 12 21.5c5.523 0 9.5-3.977 9.5-9.5 0-.651-.07-1.286-.195-1.977z" />
              </svg>
            </a>

            {/* LinkedIn */}
            <a
              href="#"
              aria-label="LinkedIn"
              className="text-gray-400 hover:text-white transition-colors duration-200"
            >
              <X className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
