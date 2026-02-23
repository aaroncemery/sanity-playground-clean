import type {StructureResolver} from 'sanity/structure'
import {
  Globe,
  Home,
  FileText,
  Pencil,
  Settings,
  Navigation,
  Footprints,
  ArrowRightLeft,
  Clock,
  AlertTriangle,
  Megaphone,
} from 'lucide-react'

export const structure: StructureResolver = (S) =>
  S.list()
    .title('Content')
    .items([
      // ========================================
      // WEBSITE CONTENT
      // ========================================
      S.listItem()
        .title('Website')
        .icon(Globe)
        .child(
          S.list()
            .title('Website Pages')
            .items([
              // Homepage singleton
              S.listItem()
                .title('Homepage')
                .icon(Home)
                .child(S.document().schemaType('home').documentId('home')),

              S.divider(),

              // All pages
              S.documentTypeListItem('page').title('Pages').icon(FileText),
            ]),
        ),

      // ========================================
      // BLOG
      // ========================================
      S.documentTypeListItem('blog').title('Blog Posts').icon(Pencil),

      S.divider(),

      // ========================================
      // SITE SETTINGS
      // ========================================
      S.listItem()
        .title('Site Settings')
        .icon(Settings)
        .child(
          S.list()
            .title('Site Settings')
            .items([
              S.documentTypeListItem('navigation').title('Navigation').icon(Navigation),
              S.documentTypeListItem('footer').title('Footer').icon(Footprints),
              S.documentTypeListItem('redirect').title('Redirects').icon(ArrowRightLeft),

              S.divider(),

              S.listItem()
                .title('Maintenance Banner')
                .icon(AlertTriangle)
                .child(
                  S.document().schemaType('maintenanceBanner').documentId('maintenanceBanner'),
                ),

              S.listItem()
                .title('Promo Banner')
                .icon(Megaphone)
                .child(S.document().schemaType('promoBanner').documentId('promoBanner')),
            ]),
        ),

      S.divider(),

      // ========================================
      // RECENTLY UPDATED
      // ========================================
      S.listItem()
        .title('Recently Updated')
        .icon(Clock)
        .child(
          S.list()
            .title('Recently Updated')
            .items([
              // Recently updated blog posts
              S.listItem()
                .title('Recent Blog Posts')
                .icon(Pencil)
                .child(
                  S.documentList()
                    .title('Recent Blog Posts')
                    .filter('_type == "blog" && _updatedAt > $fromDate')
                    .params({
                      fromDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                        .toISOString()
                        .split('T')[0],
                    })
                    .defaultOrdering([{field: '_updatedAt', direction: 'desc'}]),
                ),

              // Recently updated pages
              S.listItem()
                .title('Recent Pages')
                .icon(FileText)
                .child(
                  S.documentList()
                    .title('Recent Pages')
                    .filter('_type == "page" && _updatedAt > $fromDate')
                    .params({
                      fromDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                        .toISOString()
                        .split('T')[0],
                    })
                    .defaultOrdering([{field: '_updatedAt', direction: 'desc'}]),
                ),

              S.divider(),

              // All recently updated content
              S.listItem()
                .title('All Recent Content')
                .icon(Clock)
                .child(
                  S.documentList()
                    .title('All Recent Content')
                    .filter('_updatedAt > $fromDate')
                    .params({
                      fromDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                        .toISOString()
                        .split('T')[0],
                    })
                    .defaultOrdering([{field: '_updatedAt', direction: 'desc'}]),
                ),
            ]),
        ),
    ])

export default structure
