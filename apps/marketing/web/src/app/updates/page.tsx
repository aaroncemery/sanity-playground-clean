import { sanityFetch } from "@/lib/sanity/live";
import { CHANGELOG_INDEX } from "@/lib/sanity/queries";
import type { CHANGELOG_INDEX_RESULT } from "@/lib/sanity/queries";
import { ChangelogBadge } from "@/components/ChangelogBadge";
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

function ChangelogRow({ entry }: { entry: ChangelogEntry }) {
  const slugPath = (entry.slug ?? "").replace("updates/", "");
  const badges = (entry.badges ?? []).filter(Boolean).slice(0, 5);

  return (
    <Link
      href={`/updates/${slugPath}`}
      className="group block py-8 border-b border-neutral-800/60 last:border-0"
    >
      <div className="flex items-start justify-between gap-6">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-neutral-500 uppercase tracking-widest mb-2">
            {formatMonth(entry.releaseMonth)}
          </p>
          <h2 className="text-base font-semibold text-neutral-200 group-hover:text-white transition-colors mb-2">
            {entry.title}
          </h2>
          {entry.summary && (
            <p className="text-sm text-neutral-500 leading-relaxed line-clamp-2 mb-4 max-w-2xl">
              {entry.summary}
            </p>
          )}
          <div className="flex items-center gap-2 flex-wrap">
            {badges.map(
              (badge) =>
                badge && (
                  <ChangelogBadge
                    key={badge}
                    badge={
                      badge as
                        | "new"
                        | "improved"
                        | "studio"
                        | "api"
                        | "developer"
                    }
                  />
                )
            )}
            <span className="text-xs text-neutral-600">
              {entry.featureCount ?? 0}{" "}
              {entry.featureCount === 1 ? "feature" : "features"}
            </span>
          </div>
        </div>
        <span className="text-neutral-600 group-hover:text-neutral-300 group-hover:translate-x-0.5 transition-all text-sm shrink-0 mt-1">
          →
        </span>
      </div>
    </Link>
  );
}

export default async function UpdatesPage() {
  const { data: entries } = await sanityFetch({ query: CHANGELOG_INDEX });
  const changelogs: CHANGELOG_INDEX_RESULT = entries ?? [];

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-4xl px-6 lg:px-8 pt-16 pb-24">
        {/* Header */}
        <div className="mb-12 pt-4">
          <p className="text-xs font-medium text-neutral-600 uppercase tracking-widest mb-4">
            Platform Updates
          </p>
          <h1 className="text-3xl font-semibold text-white mb-3 tracking-tight">
            What&rsquo;s new
          </h1>
          <p className="text-neutral-500 leading-relaxed max-w-lg">
            New features, improvements, and developer tools — shipped every
            month.
          </p>
        </div>

        <div className="h-px bg-neutral-800 mb-2" />

        {/* Entries */}
        {changelogs.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-sm text-neutral-600">
              No updates yet. Check back soon.
            </p>
          </div>
        ) : (
          <div>
            {changelogs.map((entry) => (
              <ChangelogRow key={entry._id} entry={entry} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export const metadata: Metadata = {
  title: "Platform Updates",
  description:
    "New features, improvements, and developer tools shipped every month.",
};
