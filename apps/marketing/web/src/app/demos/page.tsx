import Link from "next/link";
import type { Metadata } from "next";

interface DemoCard {
  href: string;
  title: string;
  description: string;
  tags: string[];
}

const demos: DemoCard[] = [
  {
    href: "/demos/search",
    title: "Semantic Search",
    description:
      "Compare keyword (GROQ match) and semantic (text::semanticSimilarity) search over blog content. Toggle between modes to see how meaning-based retrieval finds relevant articles that keyword search misses.",
    tags: ["GROQ", "Embeddings", "Search"],
  },
  {
    href: "/demos/agent",
    title: "Agent Context",
    description:
      "Ask questions about blog posts and platform updates. The agent uses GROQ to retrieve relevant Sanity documents as context before calling Claude, then surfaces a Sources panel showing exactly which documents were retrieved.",
    tags: ["Claude AI", "GROQ", "RAG"],
  },
];

export default function DemosPage() {
  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-4xl px-6 lg:px-8 pt-16 pb-24">
        {/* Header */}
        <div className="mb-12 pt-4">
          <p className="text-xs font-medium text-neutral-600 uppercase tracking-widest mb-4">
            Demos
          </p>
          <h1 className="text-3xl font-semibold text-white mb-3 tracking-tight">
            Interactive demos
          </h1>
          <p className="text-neutral-500 leading-relaxed max-w-lg">
            Live examples of Sanity platform capabilities — semantic search, AI
            content retrieval, and more.
          </p>
        </div>

        <div className="h-px bg-neutral-800 mb-2" />

        {/* Demo list */}
        <div>
          {demos.map((demo) => (
            <Link
              key={demo.href}
              href={demo.href}
              className="group flex items-start justify-between gap-6 py-7 border-b border-neutral-800/60 last:border-0"
            >
              <div className="flex-1 min-w-0">
                <h2 className="text-base font-semibold text-neutral-200 group-hover:text-white transition-colors mb-2">
                  {demo.title}
                </h2>
                <p className="text-sm text-neutral-500 leading-relaxed mb-4 max-w-xl">
                  {demo.description}
                </p>
                <div className="flex flex-wrap gap-2">
                  {demo.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center rounded px-2 py-0.5 text-xs font-medium bg-neutral-800 text-neutral-400 ring-1 ring-neutral-700"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <span className="text-neutral-600 group-hover:text-neutral-300 group-hover:translate-x-0.5 transition-all text-sm shrink-0 mt-1">
                →
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export const metadata: Metadata = {
  title: "Demos",
  description:
    "Interactive demos of Sanity platform capabilities including semantic search and AI-assisted content retrieval.",
};
