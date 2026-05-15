import { useState } from "react";
import { ChevronDown } from "lucide-react";

export default function FaqCalendarSection() {
  const [openItem, setOpenItem] = useState<number | null>(null);

  const faqs = [
    {
      question: "What services does CIC provide?",
      answer:
        "We provide livestock solutions including feed, veterinary care, and agricultural support.",
    },
    {
      question: "How can I contact CIC?",
      answer:
        "You can contact us through our website or visit one of our offices.",
    },
    {
      question: "Do you offer veterinary services?",
      answer: "Yes, CIC Vetcare provides professional veterinary services.",
    },
    {
      question: "Where are your branches located?",
      answer: "We have multiple locations across Sri Lanka.",
    },
  ];

  return (
    <section className="max-w-7xl mx-auto px-2 py-4">
      <div>
        <h2 className="text-4xl font-bold text-blue-900 mb-6">FAQ</h2>
        <div className="w-12 h-0.5 bg-blue-900 rounded mb-5" />
        <div className="space-y-3">
          {faqs.map((faq, i) => {
            const isOpen = openItem === i;
            return (
              <div key={i} className="border rounded-lg px-4">
                <button
                  onClick={() => setOpenItem(isOpen ? null : i)}
                  className="flex w-full items-center justify-between py-4 text-left font-medium text-lg md:text-lg"
                >
                  {faq.question}
                  <ChevronDown
                    className={`h-5 w-5 shrink-0 transition-transform duration-200 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="pb-4 text-gray-600">{faq.answer}</div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
