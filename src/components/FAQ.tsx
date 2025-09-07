import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";
import { HomeButton } from "./HomeButton";

const faqs = [
  {
    question: "What is your return policy?",
    answer: "We offer a 30-day return policy for all unworn items with original tags."
  },
  {
    question: "How long does shipping take?",
    answer: "Standard shipping takes 3-5 business days within the continental US."
  },
  {
    question: "Do you offer international shipping?",
    answer: "Yes, we ship to most countries worldwide. Shipping times vary by location."
  },
  {
    question: "Can I track my order?",
    answer: "Yes, you'll receive a tracking number via email once your order ships."
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept all major credit cards, PayPal, and Apple Pay."
  }
];

export const FAQ = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-fashion-neutral-dark to-black text-white p-6">
      <div className="container max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold fashion-hero-text mb-8">Frequently Asked Questions</h1>
        
        <Accordion type="single" collapsible className="space-y-4">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger className="text-left">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent>
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
      <HomeButton />
    </div>
  );
};