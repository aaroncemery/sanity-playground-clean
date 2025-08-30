import { BLOG_POSTS } from '@/lib/sanity/queries';
import { sanityFetch } from '@/lib/sanity/live';
import { BLOG_POSTSResult } from '@/lib/sanity/sanity.types';
import { urlFor } from '@/lib/sanity/image';
import { Border } from '@/components/Border';
import Link from 'next/link';

export default async function BlogPage() {
  const response = await sanityFetch({
    query: BLOG_POSTS,
  });
  const posts = response.data;

  return (
    <div className='min-h-screen bg-white'>
      {/* Hero Section */}
      <div className='mx-auto max-w-7xl px-6 lg:px-8 pt-24 pb-16'>
        <div className='mx-auto max-w-4xl text-center'>
          <Border className='mb-8' />
          <h1 className='text-5xl font-bold tracking-tight text-neutral-950 sm:text-6xl mb-6'>
            Blog
          </h1>
          <p className='text-xl leading-8 text-neutral-600 mb-12'>
            Insights, stories, and thoughts from our team
          </p>
        </div>
      </div>

      {/* Blog Posts Grid */}
      <div className='mx-auto max-w-7xl px-6 lg:px-8 pb-24'>
        {posts.length === 0 ? (
          <div className='text-center py-16'>
            <p className='text-lg text-neutral-600'>No blog posts yet. Check back soon!</p>
          </div>
        ) : (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
            {posts.map((post) => (
              <BlogPostCard key={post._id} post={post} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Blog Post Card Component
function BlogPostCard({ post }: { post: BLOG_POSTSResult[0] }) {
  // Extract slug without blog/ prefix for the URL
  const slugWithoutPrefix = post.slug.current.replace('blog/', '');
  
  const publishedDate = new Date(post.publishedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <article className='group relative flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-neutral-200 hover:shadow-lg transition-all duration-300'>
      {/* Image */}
      {post.image && (
        <div className='relative aspect-[16/9] overflow-hidden'>
          <img
            src={urlFor(post.image).width(600).height(340).url()}
            alt={post.title || 'Blog post image'}
            className='h-full w-full object-cover transition-transform duration-300 group-hover:scale-105'
          />
        </div>
      )}
      
      {/* Content */}
      <div className='flex flex-1 flex-col p-6'>
        {/* Date */}
        <time className='text-sm text-neutral-500 mb-3' dateTime={post.publishedAt}>
          {publishedDate}
        </time>
        
        {/* Title */}
        <h2 className='text-xl font-semibold text-neutral-950 mb-3 group-hover:text-neutral-700 transition-colors'>
          <Link href={`/blog/${slugWithoutPrefix}`} className='before:absolute before:inset-0'>
            {post.title}
          </Link>
        </h2>
        
        {/* Description */}
        {post.description && (
          <p className='text-neutral-600 line-clamp-3 flex-1 mb-4'>
            {post.description}
          </p>
        )}
        
        {/* Read More Link */}
        <div className='flex items-center text-sm font-medium text-neutral-950'>
          Read more
          <svg
            className='ml-1 h-4 w-4 transition-transform group-hover:translate-x-1'
            fill='none'
            viewBox='0 0 24 24'
            stroke='currentColor'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M9 5l7 7-7 7'
            />
          </svg>
        </div>
      </div>
    </article>
  );
}

export const metadata = {
  title: 'Blog',
  description: 'Insights, stories, and thoughts from our team',
};
