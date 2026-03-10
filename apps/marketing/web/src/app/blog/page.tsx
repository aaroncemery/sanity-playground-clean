import { BLOG_POSTS } from "@/lib/sanity/queries";
import { sanityFetch } from "@/lib/sanity/live";
import { urlFor, getImageBlurData } from "@/lib/sanity/image";
import Link from "next/link";
import Image from "next/image";
import { Metadata } from "next";
import type { BLOG_POSTS_RESULT } from "@/lib/sanity/sanity.types";

type BlogPost = BLOG_POSTS_RESULT[number];

export default async function BlogPage() {
  const response = await sanityFetch({ query: BLOG_POSTS });
  const posts: BlogPost[] = response.data || [];

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-4xl px-6 lg:px-8 pt-16 pb-24">
        {/* Header */}
        <div className="mb-12 pt-4">
          <p className="text-xs font-medium text-neutral-600 uppercase tracking-widest mb-4">
            Blog
          </p>
          <h1 className="text-3xl font-semibold text-white mb-3 tracking-tight">
            From the team
          </h1>
          <p className="text-neutral-500 leading-relaxed max-w-lg">
            Insights, experiments, and thoughts on building with Sanity.
          </p>
        </div>

        <div className="h-px bg-neutral-800 mb-2" />

        {/* Posts */}
        {posts.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-sm text-neutral-600">
              No posts yet. Check back soon.
            </p>
          </div>
        ) : (
          <div>
            {posts.map((post) => (
              <BlogPostRow key={post._id} post={post} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function BlogPostRow({ post }: { post: BlogPost }) {
  const slugWithoutPrefix = (post.slug ?? "").replace("blog/", "");
  const publishedDate = new Date(post.publishedAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const blurData = getImageBlurData(post.image);

  return (
    <Link
      href={`/blog/${slugWithoutPrefix}`}
      className="group flex items-start gap-5 py-6 border-b border-neutral-800/60 last:border-0"
    >
      {/* Thumbnail */}
      {post.image?.asset?._ref && (
        <div className="shrink-0 w-20 h-14 rounded overflow-hidden bg-neutral-800">
          <Image
            src={urlFor(post.image).width(160).height(112).url()}
            alt={post.image?.alt || post.title || ""}
            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
            width={160}
            height={112}
            placeholder={blurData ? "blur" : "empty"}
            blurDataURL={blurData}
          />
        </div>
      )}

      {/* Content */}
      <div className="flex-1 min-w-0">
        <h2 className="text-sm font-semibold text-neutral-200 group-hover:text-white transition-colors mb-1 truncate pr-6">
          {post.title}
        </h2>
        {post.description && (
          <p className="text-xs text-neutral-500 line-clamp-2 leading-relaxed mb-2">
            {post.description}
          </p>
        )}
        <time className="text-xs text-neutral-600" dateTime={post.publishedAt}>
          {publishedDate}
        </time>
      </div>

      <span className="text-neutral-700 group-hover:text-neutral-400 group-hover:translate-x-0.5 transition-all text-sm shrink-0 mt-0.5">
        →
      </span>
    </Link>
  );
}

export const metadata: Metadata = {
  title: "Blog",
  description: "Insights, experiments, and thoughts on building with Sanity.",
};
