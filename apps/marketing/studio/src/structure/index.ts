// ./apps/marketing/studio/src/structure/index.ts

import type {StructureResolver} from 'sanity/structure'
import {ContentChecklistPane} from '../components/ContentChecklistPane'
import {IncomingReferencesPane} from '../components/IncomingReferencesPane'
import {ReleaseInfoPane} from '../components/ReleaseInfoPane'

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

      // Singleton Homepage
      S.listItem()
        .title('Homepage')
        .icon(() => '🏠')
        .child(S.document().schemaType('home').documentId('home')),

      S.divider(),

      // Platform Updates (changelog)
      // DEMO: S.document().defaultPanes() — changelog opens with editor + Release Info side panel
      S.listItem()
        .title('Platform Updates')
        .icon(() => '📋')
        .child(
          S.documentTypeList('changelog')
            .title('Platform Updates')
            .child((docId) =>
              S.document()
                .schemaType('changelog')
                .documentId(docId)
                .views([
                  S.view.form().title('Editor'),
                  // DEMO: S.document().defaultPanes() — custom Release Info pane
                  S.view.component(ReleaseInfoPane).title('Release Info'),
                  // DEMO: incoming references view
                  S.view.component(IncomingReferencesPane).title('Incoming Refs'),
                ]),
            ),
        ),

      S.divider(),

      // Blog with Content Checklist pane
      // DEMO: S.document().defaultPanes() — blog opens with editor + Content Checklist panel
      S.listItem()
        .title('Blog')
        .icon(() => '📝')
        .child(
          S.documentTypeList('blog')
            .title('Blog Posts')
            .child((docId) =>
              S.document()
                .schemaType('blog')
                .documentId(docId)
                .views([
                  S.view.form().title('Editor'),
                  // DEMO: S.document().defaultPanes() — content checklist beside the editor
                  S.view.component(ContentChecklistPane).title('Checklist'),
                  // DEMO: incoming references view
                  S.view.component(IncomingReferencesPane).title('Incoming Refs'),
                ]),
            ),
        ),

      // Products with incoming references view
      S.listItem()
        .title('Products')
        .icon(() => '🛍️')
        .child(
          S.documentTypeList('product')
            .title('Products')
            .child((docId) =>
              S.document()
                .schemaType('product')
                .documentId(docId)
                .views([
                  S.view.form().title('Editor'),
                  // DEMO: incoming references view
                  S.view.component(IncomingReferencesPane).title('Incoming Refs'),
                ]),
            ),
        ),

      S.divider(),

      // All other document types (auto-listed, excluding managed ones above)
      ...S.documentTypeListItems().filter(
        (item: any) =>
          !['home', 'navigation', 'footer', 'changelog', 'blog', 'product'].includes(
            item.getId() || '',
          ),
      ),
    ])

export default structure
