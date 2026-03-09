import Link from "next/link";
import { Border } from "@/components/Border";
import type { Metadata } from "next";

interface DemoCard {
  href: string;
  title: string;
  description: string;
  emoji: string;
  tags: string[];
}

const demos: DemoCard[] = [
  {
    href: "/demos/search",
    title: "Semantic Search",
    emoji: "🧠",
    description:
      "Compare keyword (GROQ match) and semantic (text::semanticSimilarity) search over blog content. Toggle between modes to see how meaning-based retrieval finds relevant articles that keyword search misses.",
    tags: ["GROQ", "Embeddings", "Search"],
  },
  {
    href: "/demos/agent",
    title: "Agent Context",
    emoji: "🤖",
    description:
      "Ask questions about blog posts and platform updates. The agent uses GROQ to retrieve relevant Sanity documents as context before calling Claude, then surfaces a Sources panel showing exactly which documents were retrieved.",
    tags: ["Claude AI", "GROQ", "RAG"],
  },
];

export default function DemosPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <div className="mx-auto max-w-7xl px-6 lg:px-8 pt-24 pb-16">
        <div className="mx-auto max-w-4xl text-center">
          <Border className="mb-8" />
          <h1 className="text-5xl font-bold tracking-tight text-neutral-950 sm:text-6xl mb-6">
            Demos
          </h1>
          <p className="text-xl leading-8 text-neutral-600 mb-12">
            Interactive demos showing Sanity platform capabilities — semantic
            search, AI-assisted content retrieval, and more.
          </p>
        </div>
      </div>

      {/* Demo grid */}
      <div className="mx-auto max-w-7xl px-6 lg:px-8 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {demos.map((demo) => (
            <Link
              key={demo.href}
              href={demo.href}
              className="group relative flex flex-col rounded-2xl bg-white shadow-sm ring-1 ring-neutral-200 hover:shadow-lg hover:ring-neutral-300 transition-all duration-200 p-8 overflow-hidden"
            >
              {/* Background accent */}
              <div className="absolute inset-0 bg-gradient-to-br from-neutral-50 to-white opacity-0 group-hover:opacity-100 transition-opacity" />

              <div className="relative">
                <div className="text-4xl mb-4">{demo.emoji}</div>
                <h2 className="text-2xl font-bold text-neutral-950 mb-3 group-hover:text-neutral-700 transition-colors">
                  {demo.title}
                </h2>
                <p className="text-neutral-600 leading-relaxed mb-6">
                  {demo.description}
                </p>
                <div className="flex flex-wrap gap-2">
                  {demo.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-600"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="mt-6 flex items-center text-sm font-medium text-neutral-950 group-hover:translate-x-1 transition-transform">
                  Try the demo →
                </div>
              </div>
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
