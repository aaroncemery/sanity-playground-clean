import { clsx } from "clsx";

type SectionProps = {
  children: React.ReactNode;
  variant?: "default" | "muted" | "dark" | "gradient";
  className?: string;
};

export function Section({
  children,
  variant = "default",
  className,
}: SectionProps) {
  return (
    <section
      className={clsx(
        "py-16 md:py-24 lg:py-32",
        variant === "default" && "bg-background",
        variant === "muted" && "bg-surface",
        variant === "dark" && "bg-neutral-900 dark:bg-neutral-950 text-white",
        variant === "gradient" &&
          "bg-gradient-to-b from-background via-surface to-background",
        className
      )}
    >
      {children}
    </section>
  );
}
