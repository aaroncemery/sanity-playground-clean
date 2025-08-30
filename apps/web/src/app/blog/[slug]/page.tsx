import { sanityFetch } from '@/lib/sanity/live';
import { PortableText } from '@portabletext/react';
import { notFound } from 'next/navigation';
import { Border } from '@/components/Border';
import { Button } from '@/components/Button';
import { BLOG_POST } from '@/lib/sanity/queries';
import { BLOG_POSTResult } from '@/lib/sanity/sanity.types';
import { urlFor } from '@/lib/sanity/image';

// Portable Text components for rich content rendering
const portableTextComponents = {
  block: {
    h1: ({ children }: any) => (
      <h1 className='text-4xl font-bold tracking-tight text-neutral-950 mt-12 mb-6'>
        {children}
      </h1>
    ),
    h2: ({ children }: any) => (
      <h2 className='text-3xl font-semibold tracking-tight text-neutral-950 mt-10 mb-4'>
        {children}
      </h2>
    ),
    h3: ({ children }: any) => (
      <h3 className='text-2xl font-semibold tracking-tight text-neutral-950 mt-8 mb-3'>
        {children}
      </h3>
    ),
    normal: ({ children }: any) => (
      <p className='text-lg leading-8 text-neutral-600 mb-6'>{children}</p>
    ),
    blockquote: ({ children }: any) => (
      <blockquote className='border-l-4 border-neutral-200 pl-6 italic text-neutral-700 my-8'>
        {children}
      </blockquote>
    ),
  },
  marks: {
    link: ({ children, value }: any) => (
      <a
        href={value.href}
        className='text-neutral-950 underline decoration-1 underline-offset-4 hover:decoration-2'
        target={value.blank ? '_blank' : undefined}
        rel={value.blank ? 'noopener noreferrer' : undefined}
      >
        {children}
      </a>
    ),
    strong: ({ children }: any) => (
      <strong className='font-semibold text-neutral-950'>{children}</strong>
    ),
  },
  list: {
    bullet: ({ children }: any) => (
      <ul className='list-disc list-inside space-y-2 mb-6 text-neutral-600'>
        {children}
      </ul>
    ),
    number: ({ children }: any) => (
      <ol className='list-decimal list-inside space-y-2 mb-6 text-neutral-600'>
        {children}
      </ol>
    ),
  },
  listItem: {
    bullet: ({ children }: any) => <li className='leading-7'>{children}</li>,
    number: ({ children }: any) => <li className='leading-7'>{children}</li>,
  },
};

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
    console.error('Error fetching blog post:', error);
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

  const publishedDate = new Date(post.publishedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <article className='min-h-screen bg-white'>
      {/* Header section */}
      <div className='mx-auto max-w-7xl px-6 lg:px-8 pt-24 pb-16'>
        <div className='mx-auto max-w-4xl'>
          <Border className='pb-8' />

          {/* Back button */}
          <div className='mb-8'>
            <Button href='/blog' className='text-sm'>
              ← Back to Blog
            </Button>
          </div>

          {/* Title */}
          <h1 className='text-5xl font-bold tracking-tight text-neutral-950 sm:text-6xl mb-6'>
            {post.title}
          </h1>

          {/* Description */}
          {post.description && (
            <p className='text-xl leading-8 text-neutral-600 mb-8'>
              {post.description}
            </p>
          )}

          {/* Meta information */}
          <div className='flex items-center gap-6 text-sm text-neutral-500 mb-12'>
            <time dateTime={post.publishedAt}>{publishedDate}</time>
          </div>

          {/* Hero image */}
          {post.image && (
            <div className='relative mb-12'>
              <img
                src={urlFor(post.image).width(1200).height(675).url()}
                alt={post.title || 'Blog post image'}
                className='w-full rounded-2xl object-cover shadow-lg'
                style={{ aspectRatio: '16/9' }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Content section */}
      <div className='mx-auto max-w-7xl px-6 lg:px-8 pb-24'>
        <div className='mx-auto max-w-3xl'>
          <div className='prose prose-lg prose-neutral max-w-none'>
            <PortableText
              value={post.content || []}
              components={portableTextComponents}
            />
          </div>
        </div>
      </div>

      {/* Footer CTA */}
      <div className='bg-neutral-50 py-16'>
        <div className='mx-auto max-w-7xl px-6 lg:px-8'>
          <div className='mx-auto max-w-2xl text-center'>
            <Border className='pb-8' />
            <h2 className='text-3xl font-bold tracking-tight text-neutral-950 mb-4'>
              Want to read more?
            </h2>
            <p className='text-lg text-neutral-600 mb-8'>
              Discover more insights and stories from our blog.
            </p>
            <Button href='/blog'>View All Posts</Button>
          </div>
        </div>
      </div>
    </article>
  );
}

// Generate metadata for the page
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getBlogPost(slug);

  if (!post) {
    return {
      title: 'Post Not Found',
    };
  }

  return {
    title: post.title,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      type: 'article',
      publishedTime: post.publishedAt,
      images: post.image
        ? [
            {
              url: urlFor(post.image).width(1200).height(630).url(),
              alt: post.title || 'Blog post image',
            },
          ]
        : [],
    },
  };
}
