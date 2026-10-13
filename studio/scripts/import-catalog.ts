/**
 * One-off import of the website's original catalog snapshot into Sanity.
 *
 * Run from the studio folder:
 *   npx sanity exec scripts/import-catalog.ts --with-user-token
 *
 * Safe to run again: patterns that already exist (matched by Etsy listing ID) and
 * existing shop settings are left untouched.
 */
import {createReadStream} from 'node:fs'
import {readFile} from 'node:fs/promises'
import path from 'node:path'
import {getCliClient} from 'sanity/cli'

type SourceImage = {src: string; alt: string; source: string}
type SourceProduct = {
  id: string
  listingId: string
  name: string
  title: string
  category: string
  motif: string
  price: number
  regularPrice: number
  sourceOrder: number
  url: string
  description: string
  sizes: string
  level: string | null
  pages: number | null
  terms: string | null
  language: string | null
  yarn: string
  hook: string
  features: string[]
  included: string[]
  techniques: string
  note: string | null
  status?: string
  images: SourceImage[]
  video?: {src: string; poster: string; alt: string}
}

const client = getCliClient({apiVersion: '2026-10-13'})
const websiteRoot = path.resolve(process.cwd(), '..')
const imageDir = path.join(websiteRoot, 'public/images')
const videoDir = path.join(websiteRoot, 'public/video')

const upload = async (type: 'image' | 'file', filePath: string) => {
  const asset = await client.assets.upload(type, createReadStream(filePath), {
    filename: path.basename(filePath),
  })
  return {_type: 'reference' as const, _ref: asset._id}
}

/** Drops empty values so optional fields stay unset instead of being stored as null. */
const defined = <T extends Record<string, unknown>>(fields: T) =>
  Object.fromEntries(Object.entries(fields).filter(([, value]) => value !== null && value !== undefined))

async function main() {
  const catalog = JSON.parse(
    await readFile(path.join(websiteRoot, 'src/data/catalog.json'), 'utf8'),
  ) as {shop: Record<string, string | number>; products: SourceProduct[]}

  const {url: etsyUrl, ...shop} = catalog.shop
  await client.createIfNotExists({_id: 'shopSettings', _type: 'shopSettings', ...shop, etsyUrl})
  console.log('Shop settings ready')

  for (const [index, source] of catalog.products.entries()) {
    const existing = await client.fetch<string | null>(
      `*[_type == "product" && etsyListingId == $listingId][0]._id`,
      {listingId: source.listingId},
    )
    if (existing) {
      console.log(`Skipped ${source.name}: already imported as ${existing}`)
      continue
    }

    const images = []
    for (const image of source.images) {
      images.push({
        _type: 'image',
        asset: await upload('image', path.join(imageDir, image.src)),
        alt: image.alt,
        sourceUrl: image.source,
      })
    }

    const video = source.video && {
      file: {_type: 'file', asset: await upload('file', path.join(videoDir, source.video.src))},
      poster: {_type: 'image', asset: await upload('image', path.join(imageDir, source.video.poster))},
      alt: source.video.alt,
    }

    const created = await client.create(
      {
        _type: 'product',
        ...defined({
          name: source.name,
          slug: {_type: 'slug', current: source.id},
          category: source.category,
          motif: source.motif,
          description: source.description,
          price: source.price / 100,
          regularPrice: source.regularPrice / 100,
          sortOrder: index + 1,
          status: source.status,
          note: source.note,
          images,
          video,
          sizes: source.sizes,
          level: source.level,
          pages: source.pages,
          terms: source.terms,
          language: source.language,
          yarn: source.yarn,
          hook: source.hook,
          techniques: source.techniques,
          features: source.features,
          included: source.included,
          etsyUrl: source.url,
          etsyListingId: source.listingId,
          etsyTitle: source.title,
          etsyOrder: source.sourceOrder,
        }),
      },
      {autoGenerateArrayKeys: true},
    )
    console.log(`Imported ${source.name} as ${created._id}`)
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
