import {defineLocations} from 'sanity/presentation'

export const locations = {
  blog: defineLocations({
    select: {
      title: 'title',
      slug: 'slug.current',
    },
    resolve: (doc) => {
      // Remove 'blog/' prefix if it exists in the slug
      const slugWithoutPrefix = doc?.slug?.replace('blog/', '') || ''

      return {
        locations: [
          {
            title: doc?.title || 'Untitled',
            href: `/blog/${slugWithoutPrefix}`,
          },
          {
            title: 'Blog Index',
            href: '/blog',
          },
        ],
      }
    },
  }),
  home: defineLocations({
    select: {
      title: 'title',
      slug: 'slug.current',
    },
    resolve: () => {
      return {
        locations: [
          {
            title: 'Home',
            href: '/',
          },
        ],
      }
    },
  }),
  page: defineLocations({
    select: {
      title: 'title',
      slug: 'slug.current',
    },
    resolve: (doc) => {
      return {
        locations: [
          {
            title: doc?.title || 'Untitled',
            href: `/${doc?.slug || ''}`,
          },
        ],
      }
    },
  }),
}
