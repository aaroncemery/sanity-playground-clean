import { sanityFetch } from "@/lib/sanity/live";
import { CHANGELOG_INDEX } from "@/lib/sanity/queries";
import type { CHANGELOG_INDEX_RESULT } from "@/lib/sanity/queries";
import { ChangelogBadge } from "@/components/ChangelogBadge";
import { Border } from "@/components/Border";
import Link from "next/link";
import type { Metadata } from "next";

type ChangelogEntry = CHANGELOG_INDEX_RESULT[number];

function formatMonth(dateStr: string | null | undefined): string {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

function BadgePill({ badge }: { badge: string }) {
  return (
    <ChangelogBadge
      badge={badge as "new" | "improved" | "studio" | "api" | "developer"}
    />
  );
}

function ChangelogCard({ entry }: { entry: ChangelogEntry }) {
  const slugPath = entry.slug?.replace("updates/", "") ?? "";
  const badges = (entry.badges ?? []).filter(Boolean).slice(0, 4);

  return (
    <article className="group relative flex flex-col rounded-2xl bg-white shadow-sm ring-1 ring-neutral-200 hover:shadow-md transition-all duration-200 p-6">
      <div className="flex items-start justify-between gap-4 mb-3">
        <time className="text-sm font-medium text-neutral-500">
          {formatMonth(entry.releaseMonth)}
        </time>
        <span className="text-sm text-neutral-400">
          {entry.featureCount ?? 0}{" "}
          {entry.featureCount === 1 ? "feature" : "features"}
        </span>
      </div>

      <h2 className="text-xl font-semibold text-neutral-950 mb-3 group-hover:text-neutral-700 transition-colors">
        <Link
          href={`/updates/${slugPath}`}
          className="before:absolute before:inset-0"
        >
          {entry.title}
        </Link>
      </h2>

      {entry.summary && (
        <p className="text-neutral-600 line-clamp-2 flex-1 mb-4 text-sm leading-relaxed">
          {entry.summary}
        </p>
      )}

      {badges.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {badges.map((badge) => badge && <BadgePill key={badge} badge={badge} />)}
        </div>
      )}
    </article>
  );
}

export default async function UpdatesPage() {
  const { data: entries } = await sanityFetch({ query: CHANGELOG_INDEX });
  const changelogs: CHANGELOG_INDEX_RESULT = entries ?? [];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <div className="mx-auto max-w-7xl px-6 lg:px-8 pt-24 pb-16">
        <div className="mx-auto max-w-4xl text-center">
          <Border className="mb-8" />
          <h1 className="text-5xl font-bold tracking-tight text-neutral-950 sm:text-6xl mb-6">
            Platform Updates
          </h1>
          <p className="text-xl leading-8 text-neutral-600 mb-12">
            New features, improvements, and developer tools — shipped every
            month.
          </p>
        </div>
      </div>

      {/* Entries */}
      <div className="mx-auto max-w-7xl px-6 lg:px-8 pb-24">
        {changelogs.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-lg text-neutral-600">No updates yet. Check back soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {changelogs.map((entry) => (
              <ChangelogCard key={entry._id} entry={entry} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export const metadata: Metadata = {
  title: "Platform Updates",
  description: "New features, improvements, and developer tools shipped every month.",
};
