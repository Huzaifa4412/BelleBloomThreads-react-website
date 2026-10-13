import {CogIcon} from '@sanity/icons/Cog'
import type {StructureResolver} from 'sanity/structure'

const SINGLETONS = ['shopSettings']

export const structure: StructureResolver = (S) =>
  S.list()
    .title('Content')
    .items([
      S.listItem()
        .title('Shop settings')
        .icon(CogIcon)
        .child(S.document().schemaType('shopSettings').documentId('shopSettings')),
      S.divider(),
      S.documentTypeListItem('product')
        .title('Patterns')
        .child(
          S.documentTypeList('product')
            .title('Patterns')
            .defaultOrdering([{field: 'sortOrder', direction: 'asc'}]),
        ),
      S.documentTypeListItem('post')
        .title('Blog posts')
        .child(
          S.documentTypeList('post')
            .title('Blog posts')
            .defaultOrdering([{field: 'publishedAt', direction: 'desc'}]),
        ),
      ...S.documentTypeListItems().filter(
        (listItem) => ![...SINGLETONS, 'product', 'post'].includes(listItem.getId() as string),
      ),
    ])
