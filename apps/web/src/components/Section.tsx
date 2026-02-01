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
        variant === "default" && "bg-white dark:bg-neutral-950",
        variant === "muted" && "bg-neutral-50 dark:bg-neutral-900",
        variant === "dark" && "bg-neutral-900 dark:bg-neutral-950 text-white",
        variant === "gradient" &&
          "bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white",
        className,
      )}
    >
      {children}
    </section>
  );
}
