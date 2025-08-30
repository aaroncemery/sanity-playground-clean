import { defineQuery } from 'next-sanity';

export const BLOG_POSTS = defineQuery(`
  *[_type == "blog"] | order(publishedAt desc) {
    _id,
    title,
    description,
    slug,
    image,
    publishedAt,
  }
`);

export const BLOG_POST = defineQuery(`*[
  _type == "blog"
  && slug.current == $slug
][0]{
  _id,
  title,
  description,
  slug,
  image,
  publishedAt,
  content
}`);
