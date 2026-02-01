// ./apps/studio/src/structure/index.ts

import type {StructureResolver} from 'sanity/structure'

export const structure: StructureResolver = (S) =>
  S.list()
    .title('Global')
    .items([
      // Settings section
      S.listItem()
        .title('Settings')
        .icon(() => '⚙️')
        .child(
          S.list()
            .title('Settings')
            .items([
              S.documentTypeListItem('navigation')
                .title('Navigation')
                .icon(() => '📱'),
              S.documentTypeListItem('footer')
                .title('Footer')
                .icon(() => '📄'),
            ]),
        ),
      S.divider(),
      // Singleton Homepage at the top
      S.listItem()
        .title('Homepage')
        .icon(() => '🏠')
        .child(S.document().schemaType('home').documentId('home')),
      S.divider(),
      // All other document types (excluding home, navigation, and footer)
      ...S.documentTypeListItems().filter(
        (item: any) => !['home', 'navigation', 'footer'].includes(item.getId() || ''),
      ),
    ])

export default structure
