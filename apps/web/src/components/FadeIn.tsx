"use client";

import { useEffect, useRef, useState } from "react";
import { clsx } from "clsx";

type FadeInProps = {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  threshold?: number;
  as?: "div" | "section" | "article";
};

export function FadeIn({
  children,
  className,
  delay = 0,
  threshold = 0.1,
  as: Component = "div",
}: FadeInProps) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (delay > 0) {
            setTimeout(() => {
              setIsVisible(true);
            }, delay);
          } else {
            setIsVisible(true);
          }
          observer.disconnect();
        }
      },
      {
        threshold,
        rootMargin: "0px 0px -50px 0px",
      },
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [delay, threshold]);

  return (
    <Component
      ref={ref as any}
      className={clsx(
        "transition-all duration-700 ease-out",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8",
        className,
      )}
    >
      {children}
    </Component>
  );
}
