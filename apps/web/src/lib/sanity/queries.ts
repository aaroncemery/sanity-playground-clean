import { defineQuery } from "next-sanity";

/**
 * Query all blog posts with optimized projections
 * Filters out posts marked as noIndex (hidden from search engines)
 */
export const BLOG_POSTS = defineQuery(`
  *[_type == "blog" && !seo.noIndex] | order(publishedAt desc) {
    _id,
    _type,
    _createdAt,
    _updatedAt,
    title,
    description,
    "slug": slug.current,
    image {
      asset->{
        _ref,
        metadata {
          dimensions,
          lqip,
          blurHash,
          palette
        }
      },
      hotspot,
      crop,
      alt
    },
    publishedAt,
    "seoNoIndex": seo.noIndex,
    "seoHideFromLists": seo.hideFromLists
  }
`);

/**
 * Query a single blog post by slug with full content
 */
export const BLOG_POST = defineQuery(`
  *[_type == "blog" && slug.current == $slug][0]{
    _id,
    _type,
    _createdAt,
    _updatedAt,
    title,
    description,
    "slug": slug.current,
    image {
      asset->{
        _ref,
        metadata {
          dimensions,
          lqip,
          blurHash,
          palette
        }
      },
      hotspot,
      crop,
      alt
    },
    publishedAt,
    content,
    seo {
      title,
      description,
      image {
        asset->{
          _ref,
          metadata {
            dimensions,
            blurHash
          }
        }
      },
      noIndex,
      hideFromLists
    },
    openGraph {
      title,
      description,
      image {
        asset->{
          _ref,
          metadata {
            dimensions,
            blurHash
          }
        }
      }
    }
  }
`);

/**
 * Query for redirect matching a pathname
 */
export const REDIRECT_BY_PATH = defineQuery(`
  *[_type == "redirect" && from == $pathname][0]{
    _id,
    from,
    to,
    type,
    permanent
  }
`);
