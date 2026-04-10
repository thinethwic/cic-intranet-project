import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface CEOMessageProps {
  name?: string;
  messages: string[];
  image?: string;
}

export function CEOMessageCard({ name, messages, image }: CEOMessageProps) {
  const [index, setIndex] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % messages.length);
        setFade(true);
      }, 150);
    }, 5000);

    return () => clearInterval(interval);
  }, [messages.length]);

  return (
    <Card className="w-full p-6 md:p-8 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <Avatar className="w-12 h-12 md:w-16 md:h-16 flex-shrink-0">
          <AvatarImage src={image} alt={name} />
          <AvatarFallback className="bg-gray-200 text-gray-700 font-semibold">
            {name ? name.charAt(0) : "C"}
          </AvatarFallback>
        </Avatar>

        <div className="text-left min-w-0">
          <h3 className="text-xs md:text-sm font-semibold text-gray-500 uppercase tracking-wide">
            CEO Message
          </h3>
          <h4 className="text-base md:text-lg font-semibold text-gray-900 truncate">
            {name || "Chief Executive Officer"}
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
        {messages[index]}
      </p>

      {/* Footer line */}
      <div className="mt-5 h-[2px] w-12 bg-blue-900" />
    </Card>
  );
}
