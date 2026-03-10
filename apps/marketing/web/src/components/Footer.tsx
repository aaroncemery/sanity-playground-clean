import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-neutral-800 bg-neutral-950">
      <div className="mx-auto max-w-5xl px-6 lg:px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-sm text-neutral-600">
          Built with{" "}
          <a
            href="https://sanity.io"
            target="_blank"
            rel="noopener noreferrer"
            className="text-neutral-400 hover:text-white transition-colors"
          >
            Sanity
          </a>
        </p>
        <nav className="flex items-center gap-6">
          <Link
            href="/updates"
            className="text-sm text-neutral-600 hover:text-white transition-colors"
          >
            Updates
          </Link>
          <Link
            href="/blog"
            className="text-sm text-neutral-600 hover:text-white transition-colors"
          >
            Blog
          </Link>
          <Link
            href="/demos"
            className="text-sm text-neutral-600 hover:text-white transition-colors"
          >
            Demos
          </Link>
        </nav>
      </div>
    </footer>
  );
}
