import Link from "next/link";
import clsx from "clsx";

type ButtonProps = {
  invert?: boolean;
} & (
  | React.ComponentPropsWithoutRef<typeof Link>
  | (React.ComponentPropsWithoutRef<"button"> & { href?: undefined })
);

export function Button({
  invert = false,
  className,
  children,
  ...props
}: ButtonProps) {
  className = clsx(
    className,
    "inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold transition-all duration-300 shadow-md hover:shadow-xl hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
    invert
      ? "bg-white text-neutral-950 hover:bg-neutral-100 focus-visible:ring-neutral-950 dark:bg-neutral-800 dark:text-white dark:hover:bg-neutral-700"
      : "bg-neutral-950 text-white hover:bg-neutral-800 focus-visible:ring-neutral-950 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200",
  );

  let inner = <span className="relative top-px">{children}</span>;

  if (typeof props.href === "undefined") {
    return (
      <button className={className} {...props}>
        {inner}
      </button>
    );
  }

  return (
    <Link className={className} {...props}>
      {inner}
    </Link>
  );
}
