import { useState, useRef, useEffect } from "react";
import { Send, MessageCircle, X, Bot, Minimize2 } from "lucide-react";

interface Message {
  text: string;
  sender: "user" | "bot";
  timestamp: string;
}

const SUGGESTIONS = [
  "What documents are available?",
  "Show HR policies",
  "Upcoming events",
  "Finance reports",
];

function getTime() {
  return new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ChatBot() {
  const [messages, setMessages] = useState<Message[]>([
    {
      text: "Hello! I'm your AI Assistant. How can I help you today?",
      sender: "bot",
      timestamp: getTime(),
    },
  ]);
  const [input, setInput] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async (text?: string) => {
    const messageText = text ?? input;
    if (!messageText.trim()) return;

    const userMessage: Message = {
      text: messageText,
      sender: "user",
      timestamp: getTime(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:8080/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: messageText }),
      });

      const data = await res.text();
      setMessages((prev) => [
        ...prev,
        { text: data, sender: "bot", timestamp: getTime() },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          text: "Sorry, I couldn't connect to the server. Please try again.",
          sender: "bot",
          timestamp: getTime(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-5 right-5 z-50 bg-blue-900 text-white w-14 h-14 rounded-full shadow-lg hover:bg-blue-800 active:scale-95 transition flex items-center justify-center"
      >
        {open ? <X size={22} /> : <MessageCircle size={22} />}
      </button>

      {/* Chat Window */}
      {open && (
        <div
          className="fixed bottom-24 right-5 z-50 w-[340px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden"
          style={{ height: "480px" }}
        >
          {/* Header */}
          <div className="bg-blue-900 px-4 py-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
              <Bot size={18} className="text-white" />
            </div>
            <div className="flex-1">
              <p className="text-white text-sm font-semibold">AI Assistant</p>
              <p className="text-blue-300 text-[11px] flex items-center gap-1 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
                Online · Replies instantly
              </p>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="text-blue-300 hover:text-white transition"
            >
              <Minimize2 size={16} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-slate-50">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex items-end gap-2 ${msg.sender === "user" ? "flex-row-reverse" : ""}`}
              >
                {msg.sender === "bot" && (
                  <div className="w-7 h-7 rounded-full bg-blue-900 flex items-center justify-center flex-shrink-0">
                    <Bot size={13} className="text-white" />
                  </div>
                )}
                <div
                  className={
                    msg.sender === "user"
                      ? "items-end flex flex-col"
                      : "items-start flex flex-col"
                  }
                >
                  <div
                    className={`px-3 py-2.5 rounded-2xl text-sm leading-relaxed max-w-[230px] ${
                      msg.sender === "user"
                        ? "bg-blue-900 text-white rounded-br-sm"
                        : "bg-white text-slate-800 border border-gray-200 rounded-bl-sm"
                    }`}
                  >
                    {msg.text}
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 px-1">
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {loading && (
              <div className="flex items-end gap-2">
                <div className="w-7 h-7 rounded-full bg-blue-900 flex items-center justify-center flex-shrink-0">
                  <Bot size={13} className="text-white" />
                </div>
                <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1 items-center">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce"
                      style={{ animationDelay: `${i * 0.15}s` }}
                    />
                  ))}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Quick Suggestions */}
          {messages.length === 1 && (
            <div className="px-3 pb-2 pt-1 flex gap-2 flex-wrap bg-slate-50 border-t border-gray-100">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => sendMessage(s)}
                  className="text-[11px] bg-blue-50 text-blue-800 border border-blue-200 rounded-full px-3 py-1.5 hover:bg-blue-100 transition"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="px-3 py-3 border-t border-gray-200 bg-white flex items-center gap-2">
            <input
              className="flex-1 bg-slate-100 border border-gray-200 rounded-full px-4 py-2 text-sm text-slate-800 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-200 placeholder:text-slate-400 transition"
              placeholder="Type a message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || loading}
              className="w-9 h-9 rounded-full bg-blue-900 flex items-center justify-center hover:bg-blue-800 disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 transition flex-shrink-0"
            >
              <Send size={15} className="text-white" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
