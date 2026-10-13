import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './schemaTypes'
import {structure} from './structure'

// Shop settings is a single document: it cannot be created again, duplicated or deleted.
const SINGLETONS = new Set(['shopSettings'])

export default defineConfig({
  name: 'default',
  title: 'BelleBloomThreads',

  projectId: 's67pid7z',
  dataset: 'production',

  plugins: [structureTool({structure}), visionTool()],

  schema: {
    types: schemaTypes,
    templates: (templates) => templates.filter(({schemaType}) => !SINGLETONS.has(schemaType)),
  },

  document: {
    actions: (actions, {schemaType}) =>
      SINGLETONS.has(schemaType)
        ? actions.filter(({action}) => action !== 'duplicate' && action !== 'delete' && action !== 'unpublish')
        : actions,
  },
})
