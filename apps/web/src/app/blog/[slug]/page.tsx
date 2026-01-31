import { sanityFetch } from "@/lib/sanity/live";
import { PortableText } from "@portabletext/react";
import { notFound } from "next/navigation";
import { Border } from "@/components/Border";
import { Button } from "@/components/Button";
import { BLOG_POST } from "@/lib/sanity/queries";
import { BLOG_POSTResult } from "@/lib/sanity/sanity.types";
import {
  urlFor,
  getImageBlurData,
  getImageDimensions,
} from "@/lib/sanity/image";
import { portableTextComponents } from "@/lib/utils/ptRender";
import Image from "next/image";
import { Metadata } from "next";

// Function to fetch blog post data
async function getBlogPost(slug: string): Promise<BLOG_POSTResult> {
  try {
    // Add blog/ prefix to match the slug format in Sanity
    const fullSlug = `blog/${slug}`;
    const response = await sanityFetch({
      query: BLOG_POST,
      params: { slug: fullSlug },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching blog post:", error);
    return null;
  }
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getBlogPost(slug);

  if (!post) {
    notFound();
  }

  const publishedDate = new Date(post.publishedAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const dimensions = getImageDimensions(post.image);
  const blurData = getImageBlurData(post.image);

  return (
    <>
      <article className="min-h-screen bg-white">
        {/* Header section */}
        <div className="mx-auto max-w-7xl px-6 lg:px-8 pt-24 pb-16">
          <div className="mx-auto max-w-4xl">
            <Border className="pb-8" />

            {/* Back button */}
            <div className="mb-8">
              <Button href="/blog" className="text-sm">
                ← Back to Blog
              </Button>
            </div>

            {/* Title */}
            <h1 className="text-5xl font-bold tracking-tight text-neutral-950 sm:text-6xl mb-6">
              {post.title}
            </h1>

            {/* Description */}
            {post.description && (
              <p className="text-xl leading-8 text-neutral-600 mb-8">
                {post.description}
              </p>
            )}

            {/* Meta information */}
            <div className="flex items-center gap-6 text-sm text-neutral-500 mb-12">
              <time dateTime={post.publishedAt}>{publishedDate}</time>
            </div>

            {/* Hero image */}
            {post.image && (
              <div className="relative mb-12">
                <Image
                  src={urlFor(post.image).width(2400).height(1260).url()}
                  alt={
                    (post.image as any)?.alt || post.title || "Blog post image"
                  }
                  className="w-full rounded-2xl object-cover shadow-lg"
                  width={dimensions.width}
                  height={dimensions.height}
                  placeholder={blurData ? "blur" : "empty"}
                  blurDataURL={blurData}
                  priority
                />
              </div>
            )}
          </div>
        </div>

        {/* Content section */}
        <div className="mx-auto max-w-7xl px-6 lg:px-8 pb-24">
          <div className="mx-auto max-w-3xl">
            <div className="prose prose-lg prose-neutral max-w-none">
              <PortableText
                value={post.content || []}
                components={portableTextComponents}
              />
            </div>
          </div>
        </div>

        {/* Footer CTA */}
        <div className="bg-neutral-50 py-16">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <Border className="pb-8" />
              <h2 className="text-3xl font-bold tracking-tight text-neutral-950 mb-4">
                Want to read more?
              </h2>
              <p className="text-lg text-neutral-600 mb-8">
                Discover more insights and stories from our blog.
              </p>
              <Button href="/blog">View All Posts</Button>
            </div>
          </div>
        </div>
      </article>
    </>
  );
}

// Generate metadata for the page
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPost(slug);

  if (!post) {
    return {
      title: "Post Not Found",
    };
  }

  const ogImage = post.image
    ? urlFor(post.image).width(1200).height(630).url()
    : null;

  return {
    title: post.title,
    description: post.description,
    openGraph: {
      title: post.title || "Blog Post",
      description: post.description || "Blog Post",
      type: "article",
      publishedTime: post.publishedAt,
      images: ogImage
        ? [
            {
              url: ogImage,
              alt: post.title || "Blog post image",
            },
          ]
        : [],
    },
  };
}
