
import { motion } from "framer-motion";
import { ThumbsUp } from "lucide-react";

interface TestimonialCardProps {
  text: string;
  name: string;
  role: string;
  delay?: number;
}

export const TestimonialCard = ({ text, name, role, delay = 0 }: TestimonialCardProps) => {
  return (
    <motion.div 
      className="bg-netflix-background/50 backdrop-blur-sm p-8 rounded-xl border border-white/10 relative"
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
    >
      <div className="absolute -top-4 -left-4 text-netflix-accent">
        <ThumbsUp className="h-8 w-8" />
      </div>
      <p className="mb-6 text-gray-300">{text}</p>
      <div>
        <p className="font-semibold">{name}</p>
        <p className="text-netflix-accent text-sm">{role}</p>
      </div>
    </motion.div>
  );
};
