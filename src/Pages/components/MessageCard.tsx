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
    <Card className="max-w-xl mx-auto p-8 md:p-10 bg-white border border-gray-200 rounded-xl shadow-sm transition-shadow hover:shadow-md">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Avatar className="w-16 h-16">
          <AvatarImage src={image} alt={name} />
          <AvatarFallback className="bg-gray-200 text-gray-700 font-semibold">
            {name ? name.charAt(0) : "C"}
          </AvatarFallback>
        </Avatar>

        <div className="text-left">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
            CEO Message
          </h3>
          <h4 className="text-lg font-semibold text-gray-900">
            {name || "Chief Executive Officer"}
          </h4>
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-gray-200 mb-6"></div>

      {/* Message */}
      <p
        className={`text-blue-800 text-[15px] font-semibold italic leading-relaxed transition-all duration-400 ${
          fade ? "opacity-100" : "opacity-0"
        }`}
      >
        {messages[index]}
      </p>

      {/* Footer line */}
      <div className="mt-6 h-[2px] w-12 bg-blue-900"></div>
    </Card>
  );
}
