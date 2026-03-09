"use client";

// DEMO: requires embeddings index named 'blog-content' on project a09jbdjz
// Toggle between semantic (text::semanticSimilarity) and keyword (match) search
// to show the difference in result quality.

import { useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@sanity/client";

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production",
  apiVersion: "2024-01-01",
  useCdn: true,
});

type SearchMode = "keyword" | "semantic";

interface SearchResult {
  _id: string;
  title: string;
  description?: string;
  slug: string;
  publishedAt?: string;
  image?: {
    asset?: { _ref: string; metadata?: { lqip?: string; dimensions?: { width: number; height: number } } };
    alt?: string;
  };
}

function buildQuery(mode: SearchMode) {
  if (mode === "semantic") {
    // DEMO: text::semanticSimilarity() — requires embeddings index on the dataset
    return `*[_type == "blog" && !seo.noIndex
      && text::semanticSimilarity("blog-content", $query) > 0.3
    ] | order(text::semanticSimilarity("blog-content", $query) desc) [0...10] {
      _id,
      title,
      description,
      "slug": slug.current,
      publishedAt,
      image { asset->{ _ref, metadata { lqip, dimensions } }, alt }
    }`;
  }
  // Keyword mode: standard GROQ match
  return `*[_type == "blog" && !seo.noIndex
    && (title match $query + "*" || description match $query + "*")
  ] | order(publishedAt desc) [0...10] {
    _id,
    title,
    description,
    "slug": slug.current,
    publishedAt,
    image { asset->{ _ref, metadata { lqip, dimensions } }, alt }
  }`;
}

export default function SearchDemoPage() {
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState<SearchMode>("keyword");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleSearch = () => {
    if (!query.trim()) return;
    setError(null);
    startTransition(async () => {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const data = await (client.fetch as any)(buildQuery(mode), {
          query: query.trim(),
        }) as SearchResult[];
        setResults(data ?? []);
        setHasSearched(true);
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        if (msg.includes("semanticSimilarity") || msg.includes("embeddings")) {
          setError(
            "Semantic search is not configured. Set up an embeddings index named 'blog-content' on project a09jbdjz to enable this mode.",
          );
        } else {
          setError(`Search failed: ${msg}`);
        }
        setResults([]);
        setHasSearched(true);
      }
    });
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-4xl px-6 lg:px-8 pt-24 pb-24">
        <h1 className="text-4xl font-bold tracking-tight text-neutral-950 mb-3">
          Semantic Search Demo
        </h1>
        <p className="text-neutral-600 mb-10">
          Compare keyword search with semantic similarity search over blog
          content.
        </p>

        {/* Mode toggle */}
        <div className="flex gap-2 mb-6">
          {(["keyword", "semantic"] as SearchMode[]).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                mode === m
                  ? "bg-neutral-950 text-white"
                  : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
              }`}
            >
              {m === "keyword" ? "🔤 Keyword (match)" : "🧠 Semantic (similarity)"}
            </button>
          ))}
        </div>

        {/* Search input */}
        <div className="flex gap-3 mb-8">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Search blog posts…"
            className="flex-1 rounded-lg border border-neutral-300 px-4 py-2.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-neutral-950 focus:border-transparent"
          />
          <button
            onClick={handleSearch}
            disabled={isPending || !query.trim()}
            className="px-5 py-2.5 rounded-lg bg-neutral-950 text-white text-sm font-medium hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isPending ? "Searching…" : "Search"}
          </button>
        </div>

        {/* Mode description */}
        <div
          className={`mb-8 p-4 rounded-lg text-sm ${
            mode === "semantic"
              ? "bg-purple-50 border border-purple-200 text-purple-800"
              : "bg-blue-50 border border-blue-200 text-blue-800"
          }`}
        >
          {mode === "semantic" ? (
            <>
              <strong>Semantic mode</strong> uses{" "}
              <code className="font-mono">text::semanticSimilarity()</code> to
              find conceptually similar content even when exact keywords don't
              match. Requires an embeddings index.
            </>
          ) : (
            <>
              <strong>Keyword mode</strong> uses GROQ{" "}
              <code className="font-mono">match</code> for fast full-text
              search. Results match on exact words and stems.
            </>
          )}
        </div>

        {/* Error state */}
        {error && (
          <div className="mb-8 p-4 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-sm">
            <strong>⚠️ Note:</strong> {error}
          </div>
        )}

        {/* Results */}
        {hasSearched && !error && (
          <>
            <p className="text-sm text-neutral-500 mb-4">
              {results.length === 0
                ? "No results found."
                : `${results.length} result${results.length !== 1 ? "s" : ""} for "${query}" (${mode} mode)`}
            </p>
            <div className="flex flex-col gap-4">
              {results.map((post) => (
                <BlogCard key={post._id} post={post} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function BlogCard({ post }: { post: SearchResult }) {
  const slugWithoutPrefix = post.slug?.replace("blog/", "") ?? "";
  return (
    <article className="flex gap-4 p-4 rounded-xl bg-white shadow-sm ring-1 ring-neutral-200 hover:shadow-md transition-shadow">
      {post.image?.asset && (
        <div className="relative w-20 h-20 flex-shrink-0 overflow-hidden rounded-lg bg-neutral-100">
          <Image
            src={`https://cdn.sanity.io/images/${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}/production/${post.image.asset._ref
              .replace("image-", "")
              .replace(/-(\w+)$/, ".$1")}`}
            alt={post.image.alt || post.title}
            fill
            className="object-cover"
            placeholder={post.image.asset.metadata?.lqip ? "blur" : "empty"}
            blurDataURL={post.image.asset.metadata?.lqip}
          />
        </div>
      )}
      <div className="flex flex-col gap-1 min-w-0">
        <Link
          href={`/blog/${slugWithoutPrefix}`}
          className="font-semibold text-neutral-950 hover:text-neutral-600 transition-colors line-clamp-1"
        >
          {post.title}
        </Link>
        {post.description && (
          <p className="text-sm text-neutral-600 line-clamp-2">{post.description}</p>
        )}
        {post.publishedAt && (
          <time className="text-xs text-neutral-400">
            {new Date(post.publishedAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </time>
        )}
      </div>
    </article>
  );
}
