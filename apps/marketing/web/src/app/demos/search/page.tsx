"use client";

// DEMO: Dataset Embeddings + keyword search toggle
// Semantic mode uses text::semanticSimilarity() inside score() — requires dataset embeddings enabled.
// Enable with: sanity dataset embeddings enable <dataset> --projection='{ title, description, "body": body }'
// Keyword mode uses standard GROQ match — no setup required.

import { useState } from "react";
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
    asset?: {
      _ref: string;
      metadata?: { lqip?: string; dimensions?: { width: number; height: number } };
    };
    alt?: string;
  };
}

function buildQuery(mode: SearchMode) {
  if (mode === "semantic") {
    return `*[_type == "blog" && !seo.noIndex]
      | score(text::semanticSimilarity($query))
      | order(_score desc) [0...10] {
        _id,
        title,
        description,
        "slug": slug.current,
        publishedAt,
        image { asset->{ _ref, metadata { lqip, dimensions } }, alt }
      }`;
  }
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
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async () => {
    if (!query.trim() || isSearching) return;
    setError(null);
    setIsSearching(true);
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const data = (await (client.fetch as any)(buildQuery(mode), {
        query: query.trim(),
      })) as SearchResult[];
      setResults(data ?? []);
      setHasSearched(true);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes("semanticSimilarity") || msg.includes("embeddings")) {
        setError(
          "Semantic search is not ready yet. Dataset embeddings may still be processing — try again in a few minutes."
        );
      } else {
        setError(`Search failed: ${msg}`);
      }
      setResults([]);
      setHasSearched(true);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-3xl px-6 lg:px-8 pt-10 pb-24">
        {/* Back */}
        <Link
          href="/demos"
          className="text-xs text-neutral-600 hover:text-white transition-colors uppercase tracking-widest mb-10 inline-block"
        >
          ← Demos
        </Link>

        {/* Header */}
        <div className="mb-10">
          <h1 className="text-2xl font-semibold text-white mb-3 tracking-tight">
            Semantic Search
          </h1>
          <p className="text-sm text-neutral-500 leading-relaxed max-w-lg">
            Compare keyword{" "}
            <code className="font-mono text-neutral-400 text-xs">match</code>{" "}
            with{" "}
            <code className="font-mono text-neutral-400 text-xs">
              text::semanticSimilarity()
            </code>{" "}
            over blog content.
          </p>
        </div>

        {/* Mode toggle — underline tabs */}
        <div className="flex gap-8 border-b border-neutral-800 mb-8">
          {(["keyword", "semantic"] as SearchMode[]).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`pb-3 text-sm transition-colors relative ${
                mode === m
                  ? "text-white"
                  : "text-neutral-600 hover:text-neutral-300"
              }`}
            >
              {m === "keyword" ? "Keyword" : "Semantic"}
              {mode === m && (
                <span className="absolute bottom-0 left-0 right-0 h-px bg-white" />
              )}
            </button>
          ))}
        </div>

        {/* Mode note */}
        <p className="text-xs font-mono text-neutral-600 mb-7">
          {mode === "semantic"
            ? "text::semanticSimilarity() — conceptual matching, requires dataset embeddings"
            : "match operator — keyword and stem matching, no setup required"}
        </p>

        {/* Search input */}
        <div className="flex gap-2 mb-10">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Search blog posts…"
            className="flex-1 bg-neutral-900 border border-neutral-800 focus:border-neutral-700 rounded-xl px-4 py-3 text-sm text-white placeholder:text-neutral-600 outline-none transition-colors"
          />
          <button
            onClick={handleSearch}
            disabled={isSearching || !query.trim()}
            className="px-5 py-3 rounded-xl bg-white text-neutral-950 text-sm font-medium hover:bg-neutral-200 disabled:opacity-20 disabled:cursor-not-allowed transition-all"
          >
            {isSearching ? "…" : "Search"}
          </button>
        </div>

        {/* Error */}
        {error && (
          <p className="text-sm text-amber-500 mb-8 leading-relaxed">{error}</p>
        )}

        {/* Results */}
        {hasSearched && !error && (
          <>
            <p className="text-xs text-neutral-600 uppercase tracking-widest mb-4">
              {results.length === 0
                ? "No results"
                : `${results.length} result${results.length !== 1 ? "s" : ""} · ${mode}`}
            </p>
            <div className="divide-y divide-neutral-800/60">
              {results.map((post) => (
                <BlogRow key={post._id} post={post} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function BlogRow({ post }: { post: SearchResult }) {
  const slugWithoutPrefix = post.slug?.replace("blog/", "") ?? "";
  const lqip = post.image?.asset?.metadata?.lqip;

  return (
    <Link
      href={`/blog/${slugWithoutPrefix}`}
      className="group flex items-start gap-4 py-4 first:pt-0 last:pb-0"
    >
      {/* Thumbnail */}
      {post.image?.asset?._ref && (
        <div className="relative w-14 h-10 flex-shrink-0 overflow-hidden rounded bg-neutral-800">
          <Image
            src={`https://cdn.sanity.io/images/${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}/production/${post.image.asset._ref
              .replace("image-", "")
              .replace(/-(\w+)$/, ".$1")}`}
            alt={post.image.alt || post.title}
            fill
            className="object-cover opacity-70 group-hover:opacity-100 transition-opacity"
            placeholder={lqip ? "blur" : "empty"}
            blurDataURL={lqip}
          />
        </div>
      )}

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-neutral-300 group-hover:text-white transition-colors truncate pr-4">
          {post.title}
        </p>
        {post.description && (
          <p className="text-xs text-neutral-600 line-clamp-1 mt-0.5">
            {post.description}
          </p>
        )}
        {post.publishedAt && (
          <time className="text-xs text-neutral-700 mt-0.5 block">
            {new Date(post.publishedAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </time>
        )}
      </div>

      <span className="text-neutral-700 group-hover:text-neutral-400 group-hover:translate-x-0.5 transition-all text-sm shrink-0 mt-0.5">
        →
      </span>
    </Link>
  );
}
