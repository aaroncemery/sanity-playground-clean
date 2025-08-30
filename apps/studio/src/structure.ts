import {StructureResolver} from 'sanity/structure'

export const structure: StructureResolver = (S) =>
  S.list()
    .title('Content')
    .items([
      // Filter out translation.metadata documents from the main structure
      ...S.documentTypeListItems().filter(
        (listItem) => !['translation.metadata'].includes(listItem.getId() || '')
      ),
    ])
