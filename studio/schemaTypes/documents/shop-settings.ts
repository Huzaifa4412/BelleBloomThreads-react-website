import {CogIcon} from '@sanity/icons/Cog'
import {defineField, defineType} from 'sanity'

export const shopSettings = defineType({
  name: 'shopSettings',
  title: 'Shop settings',
  type: 'document',
  icon: CogIcon,
  fields: [
    defineField({name: 'name', title: 'Shop name', type: 'string', validation: (rule) => rule.required()}),
    defineField({name: 'owner', type: 'string'}),
    defineField({
      name: 'ownerBio',
      title: 'About the owner',
      type: 'text',
      rows: 3,
      description: 'Shown under every blog post, next to the owner’s name.',
    }),
    defineField({
      name: 'etsyUrl',
      title: 'Etsy shop URL',
      type: 'url',
      validation: (rule) => rule.required().uri({scheme: ['https']}),
    }),
    defineField({name: 'location', type: 'string'}),
    defineField({name: 'since', title: 'On Etsy since (year)', type: 'number'}),
    defineField({
      name: 'currency',
      type: 'string',
      description: 'Three-letter currency code used for every price, such as USD.',
      validation: (rule) => rule.required().length(3).uppercase(),
    }),
    defineField({
      name: 'saleEnds',
      title: 'Sale end date',
      type: 'date',
      description: 'Sale prices and the 40% off label are shown up to and including this date.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'fetchedOn',
      title: 'Etsy details last checked on',
      type: 'date',
    }),
  ],
  preview: {
    select: {title: 'name'},
    prepare: ({title}) => ({title: title || 'Shop settings'}),
  },
})
