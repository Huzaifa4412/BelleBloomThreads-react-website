import {TagIcon} from '@sanity/icons/Tag'
import {defineArrayMember, defineField, defineType} from 'sanity'

export const product = defineType({
  name: 'product',
  title: 'Pattern',
  type: 'document',
  icon: TagIcon,
  groups: [
    {name: 'listing', title: 'Listing', default: true},
    {name: 'media', title: 'Photos & video'},
    {name: 'pattern', title: 'Pattern details'},
    {name: 'etsy', title: 'Etsy'},
  ],
  fields: [
    defineField({
      name: 'name',
      title: 'Website name',
      type: 'string',
      group: 'listing',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      type: 'slug',
      group: 'listing',
      description: 'Identifies the pattern on the website, including in visitors’ saved projects.',
      options: {source: 'name'},
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'category',
      type: 'string',
      group: 'listing',
      options: {list: ['Sweaters', 'Cardigans'], layout: 'radio'},
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'motif',
      type: 'string',
      group: 'listing',
      description: 'Short label shown above the name, such as “Floral granny squares”.',
    }),
    defineField({
      name: 'description',
      type: 'text',
      rows: 4,
      group: 'listing',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'price',
      title: 'Sale price',
      type: 'number',
      group: 'listing',
      description: 'In the shop currency, such as 6.90. Shown until the sale end date in Shop settings.',
      validation: (rule) => rule.required().positive().precision(2),
    }),
    defineField({
      name: 'regularPrice',
      type: 'number',
      group: 'listing',
      validation: (rule) =>
        rule
          .required()
          .positive()
          .precision(2)
          .custom((regularPrice, context) => {
            const price = context.document?.price
            if (typeof regularPrice === 'number' && typeof price === 'number' && regularPrice < price) {
              return 'Regular price cannot be lower than the sale price'
            }
            return true
          }),
    }),
    defineField({
      name: 'sortOrder',
      title: 'Studio pick order',
      type: 'number',
      group: 'listing',
      description: 'Lower numbers appear first in the default “Studio picks” order.',
      validation: (rule) => rule.required().integer(),
    }),
    defineField({
      name: 'status',
      type: 'string',
      group: 'listing',
      description:
        'Optional. Replaces the level and sizes line on the card and marks the listing as a design guide.',
    }),
    defineField({
      name: 'note',
      title: 'Designer note',
      type: 'text',
      rows: 4,
      group: 'listing',
      description: 'Optional notice shown above the Etsy button.',
    }),
    defineField({
      name: 'images',
      title: 'Photos',
      type: 'array',
      group: 'media',
      of: [
        defineArrayMember({
          type: 'image',
          options: {hotspot: true},
          fields: [
            defineField({
              name: 'alt',
              title: 'Alternative text',
              type: 'string',
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'sourceUrl',
              title: 'Original Etsy photo URL',
              type: 'url',
            }),
          ],
        }),
      ],
      validation: (rule) => rule.required().min(1),
    }),
    defineField({
      name: 'video',
      type: 'object',
      group: 'media',
      description: 'Short, silent listing clip. Shown after the first photo.',
      fields: [
        defineField({
          name: 'file',
          title: 'Video file',
          type: 'file',
          options: {accept: 'video/mp4'},
        }),
        defineField({
          name: 'poster',
          title: 'Poster image',
          type: 'image',
          description: 'Shown as the thumbnail and before the video plays.',
        }),
        defineField({
          name: 'alt',
          title: 'Description',
          type: 'string',
          description: 'Describes the video for visitors using a screen reader.',
        }),
      ],
    }),
    defineField({name: 'sizes', type: 'string', group: 'pattern', validation: (rule) => rule.required()}),
    defineField({name: 'level', title: 'Skill level', type: 'string', group: 'pattern'}),
    defineField({
      name: 'pages',
      title: 'PDF pages',
      type: 'number',
      group: 'pattern',
      validation: (rule) => rule.integer().positive(),
    }),
    defineField({name: 'terms', title: 'Terminology', type: 'string', group: 'pattern'}),
    defineField({name: 'language', type: 'string', group: 'pattern'}),
    defineField({name: 'yarn', type: 'string', group: 'pattern', validation: (rule) => rule.required()}),
    defineField({name: 'hook', type: 'string', group: 'pattern', validation: (rule) => rule.required()}),
    defineField({name: 'techniques', type: 'string', group: 'pattern', validation: (rule) => rule.required()}),
    defineField({
      name: 'features',
      type: 'array',
      group: 'pattern',
      of: [defineArrayMember({type: 'string'})],
    }),
    defineField({
      name: 'included',
      title: 'Inside the pattern',
      type: 'array',
      group: 'pattern',
      of: [defineArrayMember({type: 'string'})],
      validation: (rule) => rule.required().min(1),
    }),
    defineField({
      name: 'etsyUrl',
      title: 'Etsy listing URL',
      type: 'url',
      group: 'etsy',
      validation: (rule) => rule.required().uri({scheme: ['https']}),
    }),
    defineField({
      name: 'etsyListingId',
      title: 'Etsy listing ID',
      type: 'string',
      group: 'etsy',
      validation: (rule) => rule.required(),
    }),
    defineField({name: 'etsyTitle', title: 'Etsy listing title', type: 'string', group: 'etsy'}),
    defineField({
      name: 'etsyOrder',
      title: 'Etsy “Most recent” position',
      type: 'number',
      group: 'etsy',
      description: 'Used by the “Newest first” sort. 1 is the newest listing.',
      validation: (rule) => rule.required().integer().positive(),
    }),
  ],
  orderings: [
    {title: 'Studio pick order', name: 'sortOrder', by: [{field: 'sortOrder', direction: 'asc'}]},
  ],
  preview: {
    select: {title: 'name', subtitle: 'category', media: 'images.0'},
  },
})
