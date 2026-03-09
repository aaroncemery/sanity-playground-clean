import { sanityFetch } from "@/lib/sanity/live";
import { CHANGELOG_INDEX, CHANGELOG_BY_SLUG } from "@/lib/sanity/queries";
import type { CHANGELOG_BY_SLUG_RESULT } from "@/lib/sanity/queries";
import { ChangelogBadge } from "@/components/ChangelogBadge";
import { PortableText } from "@portabletext/react";
import { Border } from "@/components/Border";
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

function FeatureCard({ feature }: { feature: Feature }) {
  return (
    <div className="flex flex-col gap-3 p-6 rounded-xl bg-white shadow-sm ring-1 ring-neutral-200">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-lg font-semibold text-neutral-950">{feature.title}</h3>
        {feature.badge && (
          <ChangelogBadge
            badge={feature.badge as "new" | "improved" | "studio" | "api" | "developer"}
          />
        )}
      </div>

      {feature.description && (
        <div className="prose prose-sm prose-neutral max-w-none text-neutral-600">
          <PortableText value={feature.description as Parameters<typeof PortableText>[0]["value"]} />
        </div>
      )}

      {feature.docsUrl && (
        <a
          href={feature.docsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="self-start text-sm font-medium text-neutral-950 hover:text-neutral-600 transition-colors"
        >
          Learn more →
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
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <div className="mx-auto max-w-7xl px-6 lg:px-8 pt-24 pb-16">
        <div className="mx-auto max-w-3xl">
          <Link
            href="/updates"
            className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors mb-8 inline-block"
          >
            ← Platform Updates
          </Link>
          <Border className="mb-8" />
          <p className="text-base font-semibold text-neutral-500 mb-3">
            {formatMonth(entry.releaseMonth)}
          </p>
          <h1 className="text-4xl font-bold tracking-tight text-neutral-950 sm:text-5xl mb-6">
            {entry.title}
          </h1>
          {entry.summary && (
            <p className="text-lg leading-8 text-neutral-600">{entry.summary}</p>
          )}
        </div>
      </div>

      {/* Features */}
      <div className="mx-auto max-w-7xl px-6 lg:px-8 pb-24">
        <div className="mx-auto max-w-3xl">
          {features.length === 0 ? (
            <p className="text-neutral-600">No features listed for this release.</p>
          ) : (
            <div className="flex flex-col gap-4">
              {features.map((feature, i) => (
                <FeatureCard key={feature._key ?? i} feature={feature} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export async function generateStaticParams() {
  const { data: entries } = await sanityFetch({ query: CHANGELOG_INDEX });
  return (entries ?? [])
    .filter((e) => e.slug)
    .map((e) => ({
      slug: e.slug!.replace("updates/", ""),
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
  });

  if (!entry) return { title: "Not Found" };

  const title = entry.seo?.title || entry.title || "Platform Update";
  const description = entry.seo?.description || entry.summary || "";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
    },
  };
}
