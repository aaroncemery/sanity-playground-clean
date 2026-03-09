import { defineQuery } from "next-sanity";
import type {
  BLOG_POSTS_RESULT,
  BLOG_POST_RESULT,
  CHANGELOG_INDEX_RESULT,
  CHANGELOG_BY_SLUG_RESULT,
  SEMANTIC_SEARCH_RESULT,
  AGENT_CONTEXT_SEARCH_RESULT,
} from "./sanity.types";

// Re-export generated types for convenient use in components
// These give end-to-end TypeScript type safety from schema → GROQ → component props
export type {
  BLOG_POSTS_RESULT,
  BLOG_POST_RESULT,
  CHANGELOG_INDEX_RESULT,
  CHANGELOG_BY_SLUG_RESULT,
  SEMANTIC_SEARCH_RESULT,
  AGENT_CONTEXT_SEARCH_RESULT,
};

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
 * Query the singleton maintenance banner
 */
export const MAINTENANCE_BANNER = defineQuery(`
  *[_type == "maintenanceBanner" && _id == "maintenanceBanner"][0]{
    enabled,
    message,
    severity,
    scheduledStart,
    scheduledEnd
  }
`);

/**
 * Query the singleton promo banner
 */
export const PROMO_BANNER = defineQuery(`
  *[_type == "promoBanner" && _id == "promoBanner"][0]{
    enabled,
    headline,
    subtext,
    cta {
      text,
      linkType,
      internalLink->{
        _type,
        "slug": slug.current
      },
      externalUrl,
      openInNewTab
    },
    startDate,
    endDate
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

/**
 * Query all changelogs for the index page, ordered newest first
 */
export const CHANGELOG_INDEX = defineQuery(`
  *[_type == "changelog"] | order(releaseMonth desc) {
    _id,
    title,
    "slug": slug.current,
    releaseMonth,
    summary,
    "featureCount": count(features),
    "badges": array::unique(features[].badge)
  }
`);

/**
 * Query a single changelog by slug with full feature data
 */
export const CHANGELOG_BY_SLUG = defineQuery(`
  *[_type == "changelog" && slug.current == $slug][0]{
    _id,
    title,
    "slug": slug.current,
    releaseMonth,
    summary,
    features[] {
      _key,
      title,
      description,
      badge,
      docsUrl
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
      noIndex
    }
  }
`);

/**
 * Semantic search over blog content
 *
 * DEMO: requires embeddings index named 'blog-content' on project a09jbdjz
 * Toggle between semantic (text::semanticSimilarity) and keyword (match) modes
 * to demonstrate the difference in result quality.
 */
export const SEMANTIC_SEARCH = defineQuery(`
  *[_type == "blog" && !seo.noIndex
    && (title match $query || description match $query)
  ] | order(publishedAt desc) [0...10] {
    _id,
    title,
    description,
    "slug": slug.current,
    publishedAt,
    image {
      asset->{
        _ref,
        metadata {
          dimensions,
          lqip,
          blurHash
        }
      },
      alt
    }
  }
`);

/**
 * Fetch blog and changelog docs for agent context retrieval
 * Used by /demos/agent to provide relevant content to the LLM
 */
export const AGENT_CONTEXT_SEARCH = defineQuery(`
  {
    "blogs": *[_type == "blog" && (title match $query || description match $query)][0...5]{
      _id,
      _type,
      title,
      description,
      "slug": slug.current,
      publishedAt
    },
    "changelogs": *[_type == "changelog" && (title match $query || summary match $query)][0...3]{
      _id,
      _type,
      title,
      "slug": slug.current,
      releaseMonth,
      summary
    }
  }
`);
