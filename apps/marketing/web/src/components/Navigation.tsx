"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { clsx } from "clsx";
import { Menu, X } from "lucide-react";

const navigation = [
  { name: "Updates", href: "/updates" },
  { name: "Blog", href: "/blog" },
  { name: "Demos", href: "/demos" },
];

export function Navigation() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const studioUrl = process.env.NEXT_PUBLIC_SANITY_STUDIO_URL ?? "http://localhost:3333";

  return (
    <header className="border-b border-neutral-800 bg-neutral-950/90 backdrop-blur-sm">
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-6 lg:px-8 h-12">
        {/* Logo */}
        <Link
          href="/"
          className="text-sm font-semibold text-white hover:text-neutral-300 transition-colors"
        >
          Sanity Playground
        </Link>

        {/* Mobile menu button */}
        <button
          type="button"
          className="lg:hidden text-neutral-500 hover:text-white transition-colors"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>

        {/* Desktop navigation */}
        <div className="hidden lg:flex items-center gap-6">
          {navigation.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.name}
                href={item.href}
                className={clsx(
                  "text-sm transition-colors",
                  isActive
                    ? "text-white"
                    : "text-neutral-500 hover:text-white"
                )}
              >
                {item.name}
              </Link>
            );
          })}
          <a
            href={studioUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-neutral-500 hover:text-white transition-colors"
          >
            Studio ↗
          </a>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-neutral-800 bg-neutral-950 px-6 py-4">
          <div className="space-y-1">
            {navigation.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={clsx(
                    "block py-2 text-sm",
                    isActive ? "text-white" : "text-neutral-500"
                  )}
                >
                  {item.name}
                </Link>
              );
            })}
            <a
              href={studioUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block py-2 text-sm text-neutral-500"
            >
              Studio ↗
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
