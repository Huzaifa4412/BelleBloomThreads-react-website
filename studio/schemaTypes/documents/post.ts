import {DocumentTextIcon} from '@sanity/icons/DocumentText'
import {ThListIcon} from '@sanity/icons/ThList'
import {defineArrayMember, defineField, defineType} from 'sanity'

export const post = defineType({
  name: 'post',
  title: 'Blog post',
  type: 'document',
  icon: DocumentTextIcon,
  groups: [
    {name: 'content', title: 'Content', default: true},
    {name: 'seo', title: 'Search & sharing'},
  ],
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      group: 'content',
      description: 'The headline. Lead with the words people would search for.',
      validation: (rule) => rule.required().max(70).warning('Titles over 70 characters are cut off in search results'),
    }),
    defineField({
      name: 'slug',
      type: 'slug',
      group: 'content',
      description: 'The page address: /blog/your-slug/. Avoid changing it after publishing.',
      options: {source: 'title', maxLength: 80},
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'excerpt',
      type: 'text',
      rows: 3,
      group: 'content',
      description: 'One or two sentences shown on the blog page and in search results.',
      validation: (rule) => [
        rule.required(),
        rule.max(160).warning('Search engines usually show about 160 characters'),
      ],
    }),
    defineField({
      name: 'category',
      type: 'string',
      group: 'content',
      options: {list: ['Crochet basics', 'Yarn & materials', 'Pattern help', 'Studio notes']},
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'mainImage',
      type: 'image',
      group: 'content',
      options: {hotspot: true},
      fields: [
        defineField({
          name: 'alt',
          title: 'Alternative text',
          type: 'string',
          validation: (rule) => rule.required(),
        }),
      ],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'publishedAt',
      title: 'Published on',
      type: 'datetime',
      group: 'content',
      initialValue: () => new Date().toISOString(),
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'quickAnswer',
      type: 'text',
      rows: 3,
      group: 'content',
      description:
        'The direct answer to the question in the title, in 40–60 words. Shown in the “At a glance” card; search and AI answer engines often quote this passage.',
      validation: (rule) => rule.max(400).warning('Keep the quick answer to two or three sentences'),
    }),
    defineField({
      name: 'keyTakeaways',
      type: 'array',
      group: 'content',
      description: 'Three to five short points a reader should remember.',
      of: [defineArrayMember({type: 'string'})],
      validation: (rule) => rule.max(5),
    }),
    defineField({
      name: 'body',
      type: 'array',
      group: 'content',
      of: [
        defineArrayMember({
          type: 'block',
          styles: [
            {title: 'Normal', value: 'normal'},
            {title: 'Heading 2', value: 'h2'},
            {title: 'Heading 3', value: 'h3'},
            {title: 'Quote', value: 'blockquote'},
          ],
          lists: [
            {title: 'Bulleted list', value: 'bullet'},
            {title: 'Numbered list', value: 'number'},
          ],
          marks: {
            decorators: [
              {title: 'Bold', value: 'strong'},
              {title: 'Italic', value: 'em'},
            ],
            annotations: [
              defineArrayMember({
                name: 'link',
                title: 'Link',
                type: 'object',
                fields: [
                  defineField({
                    name: 'href',
                    title: 'URL',
                    type: 'url',
                    validation: (rule) =>
                      rule.required().uri({scheme: ['http', 'https', 'mailto'], allowRelative: true}),
                  }),
                ],
              }),
            ],
          },
        }),
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
            defineField({name: 'caption', type: 'string'}),
          ],
        }),
        defineArrayMember({
          name: 'table',
          title: 'Table',
          type: 'object',
          icon: ThListIcon,
          fields: [
            defineField({
              name: 'caption',
              type: 'string',
              description: 'Says what the table compares, such as “US and UK crochet terms”.',
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'rows',
              type: 'array',
              description: 'The first row is the header row.',
              of: [
                defineArrayMember({
                  name: 'row',
                  type: 'object',
                  fields: [
                    defineField({
                      name: 'cells',
                      type: 'array',
                      of: [defineArrayMember({type: 'string'})],
                      validation: (rule) => rule.required().min(2),
                    }),
                  ],
                  preview: {
                    select: {cells: 'cells'},
                    prepare: ({cells}) => ({title: (cells ?? []).join('  |  ')}),
                  },
                }),
              ],
              validation: (rule) => rule.required().min(2),
            }),
          ],
          preview: {
            select: {title: 'caption', rows: 'rows'},
            prepare: ({title, rows}) => ({title, subtitle: `Table · ${(rows ?? []).length} rows`}),
          },
        }),
      ],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'faqs',
      title: 'Questions & answers',
      type: 'array',
      group: 'content',
      description:
        'Questions readers actually ask about this topic, each with a short, complete answer. Shown at the end of the post and marked up for search engines.',
      of: [
        defineArrayMember({
          name: 'faq',
          title: 'Question',
          type: 'object',
          fields: [
            defineField({name: 'question', type: 'string', validation: (rule) => rule.required()}),
            defineField({name: 'answer', type: 'text', rows: 3, validation: (rule) => rule.required()}),
          ],
          preview: {select: {title: 'question', subtitle: 'answer'}},
        }),
      ],
    }),
    defineField({
      name: 'relatedPatterns',
      type: 'array',
      group: 'content',
      description: 'Patterns shown at the end of the post, each linking to its Etsy listing.',
      of: [defineArrayMember({type: 'reference', to: [{type: 'product'}]})],
      validation: (rule) => rule.unique().max(4),
    }),
    defineField({
      name: 'seo',
      title: 'Search & sharing overrides',
      type: 'object',
      group: 'seo',
      description: 'Optional. Leave empty to use the title and excerpt.',
      fields: [
        defineField({name: 'title', title: 'Search title', type: 'string'}),
        defineField({name: 'description', title: 'Search description', type: 'text', rows: 3}),
        defineField({
          name: 'noIndex',
          title: 'Hide from search engines',
          type: 'boolean',
          initialValue: false,
        }),
      ],
    }),
  ],
  orderings: [
    {title: 'Newest first', name: 'publishedAtDesc', by: [{field: 'publishedAt', direction: 'desc'}]},
  ],
  preview: {
    select: {title: 'title', publishedAt: 'publishedAt', media: 'mainImage'},
    prepare: ({title, publishedAt, media}) => ({
      title,
      subtitle: publishedAt ? new Date(publishedAt).toLocaleDateString('en-US', {dateStyle: 'medium'}) : 'No date',
      media,
    }),
  },
})
