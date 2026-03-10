import { sanityFetch } from "@/lib/sanity/live";
import { CHANGELOG_INDEX, BLOG_POSTS } from "@/lib/sanity/queries";
import type { CHANGELOG_INDEX_RESULT, BLOG_POSTS_RESULT } from "@/lib/sanity/queries";
import { ChangelogBadge } from "@/components/ChangelogBadge";
import Link from "next/link";
import type { Metadata } from "next";

function formatMonth(dateStr: string | null | undefined): string {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

function SectionHeader({
  title,
  href,
  hrefLabel,
}: {
  title: string;
  href?: string;
  hrefLabel?: string;
}) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <h2 className="text-xs font-medium text-neutral-500 uppercase tracking-widest shrink-0">
        {title}
      </h2>
      <div className="flex-1 h-px bg-neutral-800" />
      {href && hrefLabel && (
        <Link
          href={href}
          className="text-xs text-neutral-600 hover:text-white transition-colors shrink-0"
        >
          {hrefLabel}
        </Link>
      )}
    </div>
  );
}

export default async function Home() {
  const [{ data: changelogs }, { data: allPosts }] = await Promise.all([
    sanityFetch({ query: CHANGELOG_INDEX }),
    sanityFetch({ query: BLOG_POSTS }),
  ]);

  const latestUpdate = (changelogs as CHANGELOG_INDEX_RESULT)?.[0];
  const recentPosts = ((allPosts as BLOG_POSTS_RESULT) ?? []).slice(0, 5);

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-4xl px-6 lg:px-8 pt-16 pb-24">

        {/* Header */}
        <div className="mb-16 pt-4">
          <p className="text-xs font-medium text-neutral-600 uppercase tracking-widest mb-4">
            Sanity Playground
          </p>
          <h1 className="text-3xl font-semibold text-white mb-3 tracking-tight">
            What we&rsquo;ve been building
          </h1>
          <p className="text-neutral-500 leading-relaxed max-w-lg">
            A running log of platform updates, demos, and experiments — updated
            each month.
          </p>
        </div>

        {/* Latest Update */}
        {latestUpdate && (
          <section className="mb-16">
            <SectionHeader title="Latest update" />
            <Link
              href={`/updates/${(latestUpdate.slug ?? "").replace("updates/", "")}`}
              className="group block rounded-lg bg-neutral-900 ring-1 ring-neutral-800 hover:ring-neutral-700 transition-all duration-200 p-6 overflow-hidden relative"
            >
              {/* Subtle glow */}
              <div className="absolute -top-12 -right-12 w-48 h-48 bg-indigo-600/8 rounded-full blur-3xl pointer-events-none" />
              <div className="relative">
                <p className="text-xs font-medium text-neutral-500 uppercase tracking-widest mb-2">
                  Platform Updates &middot; {formatMonth(latestUpdate.releaseMonth)}
                </p>
                <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-neutral-200 transition-colors">
                  {latestUpdate.title}
                </h3>
                {latestUpdate.summary && (
                  <p className="text-neutral-500 text-sm leading-relaxed mb-5 max-w-2xl line-clamp-2">
                    {latestUpdate.summary}
                  </p>
                )}
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center flex-wrap gap-2">
                    {(latestUpdate.badges ?? [])
                      .filter(Boolean)
                      .slice(0, 5)
                      .map((badge) => (
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
                      ))}
                    <span className="text-xs text-neutral-600">
                      {latestUpdate.featureCount} features
                    </span>
                  </div>
                  <span className="text-sm text-neutral-600 group-hover:text-neutral-300 group-hover:translate-x-0.5 transition-all shrink-0">
                    Read more →
                  </span>
                </div>
              </div>
            </Link>
            <div className="mt-2.5 text-right">
              <Link
                href="/updates"
                className="text-xs text-neutral-700 hover:text-neutral-400 transition-colors"
              >
                All updates →
              </Link>
            </div>
          </section>
        )}

        {/* Recent Blog Posts */}
        {recentPosts.length > 0 && (
          <section className="mb-16">
            <SectionHeader
              title="From the blog"
              href="/blog"
              hrefLabel="All posts →"
            />
            <div className="divide-y divide-neutral-800/60">
              {recentPosts.map((post) => (
                <Link
                  key={post._id}
                  href={`/blog/${(post.slug ?? "").replace("blog/", "")}`}
                  className="group flex items-center justify-between py-3.5 first:pt-0 last:pb-0"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-neutral-300 group-hover:text-white transition-colors truncate pr-6">
                      {post.title}
                    </p>
                    <p className="text-xs text-neutral-600 mt-0.5">
                      {new Date(post.publishedAt).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <span className="text-neutral-700 group-hover:text-neutral-400 group-hover:translate-x-0.5 transition-all text-sm shrink-0">
                    →
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Demos */}
        <section>
          <SectionHeader
            title="Interactive demos"
            href="/demos"
            hrefLabel="All demos →"
          />
          <div className="divide-y divide-neutral-800/60">
            {[
              {
                href: "/demos/search",
                title: "Semantic Search",
                desc: "GROQ keyword vs. text::semanticSimilarity over blog content",
              },
              {
                href: "/demos/agent",
                title: "Agent Context",
                desc: "Claude retrieves Sanity documents as context before answering",
              },
            ].map((demo) => (
              <Link
                key={demo.href}
                href={demo.href}
                className="group flex items-center justify-between py-3.5 first:pt-0 last:pb-0"
              >
                <div>
                  <p className="text-sm text-neutral-300 group-hover:text-white transition-colors">
                    {demo.title}
                  </p>
                  <p className="text-xs text-neutral-600 mt-0.5">{demo.desc}</p>
                </div>
                <span className="text-neutral-700 group-hover:text-neutral-400 group-hover:translate-x-0.5 transition-all text-sm shrink-0">
                  →
                </span>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

export const metadata: Metadata = {
  title: "Sanity Playground",
  description:
    "A running log of platform updates, demos, and experiments built with Sanity.",
};
