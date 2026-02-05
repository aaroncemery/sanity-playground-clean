"use client";

import { useState } from "react";
import { clsx } from "clsx";
import { ChevronDown } from "lucide-react";

type AccordionProps = {
  items: Array<{
    question: string;
    answer: React.ReactNode;
  }>;
};

export function Accordion({ items }: AccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="divide-y divide-border">
      {items.map((item, index) => (
        <div
          key={index}
          className={clsx(
            "py-6 transition-colors duration-200",
            openIndex === index && "bg-surface/50 -mx-6 px-6 rounded-lg",
          )}
        >
          <button
            className="group flex w-full items-center justify-between text-left transition-all duration-200 hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 rounded-lg"
            onClick={() => setOpenIndex(openIndex === index ? null : index)}
            aria-expanded={openIndex === index}
          >
            <span className="text-lg font-medium text-foreground group-hover:text-accent transition-colors">
              {item.question}
            </span>
            <ChevronDown
              className={clsx(
                "h-5 w-5 text-text-secondary transition-all duration-300 group-hover:text-accent",
                openIndex === index && "rotate-180 text-accent",
              )}
            />
          </button>
          <div
            className={clsx(
              "overflow-hidden transition-all duration-300 ease-in-out",
              openIndex === index
                ? "mt-4 max-h-96 opacity-100"
                : "max-h-0 opacity-0",
            )}
          >
            <div className="text-text-secondary prose prose-neutral dark:prose-invert max-w-none">
              {item.answer}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
