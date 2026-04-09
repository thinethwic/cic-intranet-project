import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

export default function FaqCalendarSection() {
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
        {/* ================= FAQ ================= */}
        <div>
          <h2 className="text-4xl font-bold text-blue-900 mb-6">FAQ</h2>

          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((faq, i) => (
              <AccordionItem
                key={i}
                value={`item-${i}`}
                className="border rounded-lg px-4"
              >
                <AccordionTrigger className="text-left font-medium text-lg md:text-lg">
                  {faq.question}
                </AccordionTrigger>

                <AccordionContent className="text-gray-600">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
