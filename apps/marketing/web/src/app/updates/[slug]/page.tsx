import { sanityFetch } from "@/lib/sanity/live";
import { client } from "@/lib/sanity/client";
import { CHANGELOG_INDEX, CHANGELOG_BY_SLUG } from "@/lib/sanity/queries";
import type { CHANGELOG_BY_SLUG_RESULT } from "@/lib/sanity/queries";
import { ChangelogBadge } from "@/components/ChangelogBadge";
import { PortableText } from "@portabletext/react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

type ChangelogDoc = NonNullable<CHANGELOG_BY_SLUG_RESULT>;
type Feature = NonNullable<ChangelogDoc["features"]>[number];

function formatMonth(dateStr: string | null | undefined): string {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

function FeatureRow({ feature }: { feature: Feature }) {
  return (
    <div className="py-6 border-b border-neutral-800/60 last:border-0">
      <div className="flex items-start justify-between gap-4 mb-3">
        <h3 className="text-sm font-semibold text-white">{feature.title}</h3>
        {feature.badge && (
          <ChangelogBadge
            badge={
              feature.badge as
                | "new"
                | "improved"
                | "studio"
                | "api"
                | "developer"
            }
          />
        )}
      </div>

      {feature.description && (
        <div className="prose prose-sm prose-invert max-w-none text-neutral-400 mb-3 [&_p]:my-1 [&_code]:bg-neutral-800 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-neutral-200 [&_code]:text-xs">
          <PortableText
            value={
              feature.description as Parameters<typeof PortableText>[0]["value"]
            }
          />
        </div>
      )}

      {feature.docsUrl && (
        <a
          href={feature.docsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-neutral-500 hover:text-white transition-colors"
        >
          Docs →
        </a>
      )}
    </div>
  );
}

export default async function ChangelogDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const fullSlug = `updates/${slug}`;

  const { data: entry } = await sanityFetch({
    query: CHANGELOG_BY_SLUG,
    params: { slug: fullSlug },
  });

  if (!entry) notFound();

  const features = entry.features ?? [];

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-4xl px-6 lg:px-8 pt-16 pb-24">
        {/* Back */}
        <div className="pt-4 mb-10">
          <Link
            href="/updates"
            className="text-xs text-neutral-600 hover:text-white transition-colors uppercase tracking-widest"
          >
            ← Platform Updates
          </Link>
        </div>

        {/* Header */}
        <div className="mb-10">
          <p className="text-xs font-medium text-neutral-500 uppercase tracking-widest mb-3">
            {formatMonth(entry.releaseMonth)}
          </p>
          <h1 className="text-3xl font-semibold text-white mb-4 tracking-tight">
            {entry.title}
          </h1>
          {entry.summary && (
            <p className="text-neutral-400 leading-relaxed max-w-2xl">
              {entry.summary}
            </p>
          )}
        </div>

        <div className="h-px bg-neutral-800 mb-2" />

        {/* Features */}
        {features.length === 0 ? (
          <p className="py-8 text-sm text-neutral-600">
            No features listed for this release.
          </p>
        ) : (
          <div>
            {features.map((feature, i) => (
              <FeatureRow key={feature._key ?? i} feature={feature} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export async function generateStaticParams() {
  const entries = await client.fetch(CHANGELOG_INDEX);
  return (entries ?? [])
    .filter((e: { slug?: string | null }) => e.slug)
    .map((e: { slug: string }) => ({
      slug: e.slug.replace("updates/", ""),
    }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const fullSlug = `updates/${slug}`;
  const { data: entry } = await sanityFetch({
    query: CHANGELOG_BY_SLUG,
    params: { slug: fullSlug },
    stega: false,
  });

  if (!entry) return { title: "Not Found" };

  const title = entry.seo?.title || entry.title || "Platform Update";
  const description = entry.seo?.description || entry.summary || "";

  return {
    title,
    description,
    openGraph: { title, description, type: "article" },
  };
}
