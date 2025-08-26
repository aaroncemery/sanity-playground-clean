import {SlugValidationContext} from 'sanity'

export async function isUnique(slug: string, context: SlugValidationContext): Promise<boolean> {
  const {document, getClient} = context
  const client = getClient({apiVersion: '2023-06-21'})
  const id = document?._id.replace(/^drafts\./, '')
  const params = {
    draft: `drafts.${id}`,
    published: id,
    slug,
  }
  const query = '*[!(_id in [$draft, $published]) && slug.current == $slug]'
  const result = await client.fetch(query, params)
  console.log('🚀 ~ isUnique:', result)
  return result.length === 0
}
