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

const BLOG_CARD = defineQuery(`
  *[_type == "blog" && publishedAt < now() && !(_id in path("drafts.**"))]{
    _id,
    _type,
    title,
    slug,
    image {
      asset->{
        _ref,
        metadata {
          dimensions,
          blurHash
        }
      }
    },
    publishedAt,
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

/**
 * Query the singleton homepage
 */
export const HOME = defineQuery(`
  *[_type == "home" && _id == "home"][0]{
    _id,
    _type,
    title,
    pageSections[] {
      _type,
      _key,
      _type == "hero" => {
        headline,
        subtext,
        primaryCta {
          text,
          linkType,
          internalLink->{
            _type,
            "slug": slug.current
          },
          externalUrl,
          openInNewTab
        },
        secondaryCta {
          text,
          linkType,
          internalLink->{
            _type,
            "slug": slug.current
          },
          externalUrl,
          openInNewTab
        },
        media {
          ...,
          asset->
        },
        variant,
        backgroundVariant
      },
      _type == "features" => {
        title,
        description,
        layout,
        features[] {
          icon,
          title,
          description
        }
      },
      _type == "textMedia" => {
        heading,
        content,
        media {
          ...,
          asset->
        },
        mediaPosition,
        reverse
      },
      _type == "ctaSection" => {
        heading,
        description,
        primaryButton {
          text,
          linkType,
          internalLink->{
            _type,
            "slug": slug.current
          },
          externalUrl,
          openInNewTab
        },
        secondaryButton {
          text,
          linkType,
          internalLink->{
            _type,
            "slug": slug.current
          },
          externalUrl,
          openInNewTab
        },
        backgroundVariant
      },
      _type == "faqSection" => {
        title,
        faqs[] {
          question,
          answer
        }
      },
      _type == "statsSection" => {
        title,
        layout,
        stats[] {
          value,
          label,
          description
        }
      },
      _type == "testimonials" => {
        title,
        testimonials[] {
          quote,
          author,
          role,
          company,
          avatar {
            ...,
            asset->
          }
        }
      }
    },
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
 * Query a page by slug with all page sections
 */
export const PAGE_BY_SLUG = defineQuery(`
  *[_type == "page" && slug.current == $slug][0]{
    _id,
    _type,
    title,
    "slug": slug.current,
    pageSections[] {
      _type,
      _key,
      _type == "hero" => {
        headline,
        subtext,
        primaryCta {
          text,
          linkType,
          internalLink->{
            _type,
            "slug": slug.current
          },
          externalUrl,
          openInNewTab
        },
        secondaryCta {
          text,
          linkType,
          internalLink->{
            _type,
            "slug": slug.current
          },
          externalUrl,
          openInNewTab
        },
        media {
          ...,
          asset->
        },
        variant,
        backgroundVariant
      },
      _type == "features" => {
        title,
        description,
        layout,
        features[] {
          icon,
          title,
          description
        }
      },
      _type == "textMedia" => {
        heading,
        content,
        media {
          ...,
          asset->
        },
        mediaPosition,
        reverse
      },
      _type == "ctaSection" => {
        heading,
        description,
        primaryButton {
          text,
          linkType,
          internalLink->{
            _type,
            "slug": slug.current
          },
          externalUrl,
          openInNewTab
        },
        secondaryButton {
          text,
          linkType,
          internalLink->{
            _type,
            "slug": slug.current
          },
          externalUrl,
          openInNewTab
        },
        backgroundVariant
      },
      _type == "faqSection" => {
        title,
        faqs[] {
          question,
          answer
        }
      },
      _type == "statsSection" => {
        title,
        layout,
        stats[] {
          value,
          label,
          description
        }
      },
      _type == "testimonials" => {
        title,
        testimonials[] {
          quote,
          author,
          role,
          company,
          avatar {
            ...,
            asset->
          }
        }
      }
    },
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
