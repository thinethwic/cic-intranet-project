import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ceoMessage, type CEOMessageConfig } from "@/Mock-data";

interface CEOMessageProps {
  name?: string;
  messages: string[];
  image?: string;
}

const CEO_MESSAGE_STORAGE_KEY = "admin-ceo-message";

function getStoredCEOMessage(fallback: CEOMessageConfig) {
  try {
    const stored = localStorage.getItem(CEO_MESSAGE_STORAGE_KEY);
    return stored ? (JSON.parse(stored) as CEOMessageConfig) : fallback;
  } catch {
    return fallback;
  }
}

export function CEOMessageCard({ name, messages, image }: CEOMessageProps) {
  const fallback = {
    name: name ?? ceoMessage.name,
    image: image ?? ceoMessage.image,
    messages: messages.length ? messages : ceoMessage.messages,
  };
  const [content, setContent] = useState<CEOMessageConfig>(() =>
    getStoredCEOMessage(fallback),
  );
  const [index, setIndex] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % content.messages.length);
        setFade(true);
      }, 150);
    }, 5000);

    return () => clearInterval(interval);
  }, [content.messages.length]);

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key === CEO_MESSAGE_STORAGE_KEY) {
        const nextContent = getStoredCEOMessage(fallback);
        setContent(nextContent);
        setIndex((prev) => Math.min(prev, nextContent.messages.length - 1));
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [fallback]);

  return (
    <Card className="w-full p-6 md:p-10 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-center gap-2 mb-5">
        <Avatar className="w-24 h-24 md:w-28 md:h-28 flex-shrink-0">
          <AvatarImage src={content.image} alt={content.name} />
          <AvatarFallback className="bg-gray-200 text-gray-700 font-semibold">
            {content.name ? content.name.charAt(0) : "C"}
          </AvatarFallback>
        </Avatar>

        <div className="text-left min-w-0">
          <h3 className="text-xs md:text-sm font-semibold text-gray-500 uppercase tracking-wide">
            CEO Message
          </h3>
          <h4 className="text-base md:text-lg font-semibold text-gray-900 truncate">
            {content.name || "Chief Executive Officer"}
          </h4>
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-gray-200 mb-5" />

      {/* Message */}
      <p
        className={`text-blue-800 text-sm md:text-[15px] font-semibold italic leading-relaxed transition-opacity duration-400 ${
          fade ? "opacity-100" : "opacity-0"
        }`}
      >
        {content.messages[index]}
      </p>

      {/* Footer line */}
      <div className="mt-5 h-[2px] w-12 bg-blue-900" />
    </Card>
  );
}
