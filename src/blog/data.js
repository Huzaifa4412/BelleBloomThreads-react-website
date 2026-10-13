import { client, imageSize, imageUrl } from '../data/sanity';

const PATTERN = `{ "id": slug.current, name, motif, category, description, sizes, level, "url": etsyUrl, "image": images[0]{ alt, asset, hotspot, crop } }`;

const BLOG_QUERY = `{
  "shop": *[_id == "shopSettings"][0]{ name, owner, ownerBio, "url": etsyUrl },
  "patterns": *[_type == "product" && defined(slug.current) && count(images) > 0] | order(sortOrder asc)${PATTERN},
  "posts": *[_type == "post" && defined(slug.current) && defined(publishedAt)] | order(publishedAt desc){
    title, "slug": slug.current, category, excerpt, publishedAt, _updatedAt, quickAnswer, keyTakeaways, body,
    faqs[]{ _key, question, answer },
    mainImage{ alt, asset, hotspot, crop },
    "text": pt::text(body),
    "patterns": relatedPatterns[]->${PATTERN},
    "seoTitle": coalesce(seo.title, title),
    "seoDescription": coalesce(seo.description, excerpt),
    "noIndex": seo.noIndex == true
  }
}`;

const WORDS_PER_MINUTE = 200;
const dateFormat = new Intl.DateTimeFormat('en-US', { dateStyle: 'long', timeZone: 'UTC' });

export const blockText = (block) => (block.children ?? []).map(child => child.text ?? '').join('');
export const headingId = (text) => text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const toPattern = ({ image, ...pattern }) => ({ ...pattern, image: { alt: image.alt ?? '', src: imageUrl(image, { width: 480, height: 480 }) } });

const toPost = ({ text, mainImage, patterns, body, faqs, keyTakeaways, ...post }) => {
  const words = (text ?? '').split(/\s+/).filter(Boolean).length;
  const updated = dateFormat.format(new Date(post._updatedAt));
  const date = dateFormat.format(new Date(post.publishedAt));
  return {
    ...post,
    body: body ?? [],
    faqs: faqs ?? [],
    keyTakeaways: keyTakeaways ?? [],
    words,
    date,
    updated: updated !== date && post._updatedAt > post.publishedAt ? updated : null,
    minutes: Math.max(1, Math.round(words / WORDS_PER_MINUTE)),
    // The sections of the post, for the table of contents.
    headings: (body ?? []).filter(block => block._type === 'block' && block.style === 'h2').map(block => ({ id: headingId(blockText(block)), text: blockText(block) })),
    cover: mainImage?.asset ? { alt: mainImage.alt ?? '', src: imageUrl(mainImage, { width: 1200, height: 900 }), card: imageUrl(mainImage, { width: 720, height: 540 }), feature: imageUrl(mainImage, { width: 1000, height: 1000 }) } : null,
    patterns: (patterns ?? []).filter(pattern => pattern?.image?.asset).map(toPattern),
  };
};

export function bodyImage(image) {
  const { width, height } = imageSize(image);
  const displayWidth = Math.min(width ?? 1200, 1200);
  return { src: imageUrl(image, { width: displayWidth }), width: displayWidth, height: width ? Math.round(displayWidth * height / width) : undefined };
}

export async function loadBlog() {
  const { shop, patterns, posts } = await client.fetch(BLOG_QUERY);
  if (!shop) throw new Error('Shop settings have not been published in Sanity.');
  return { shop, patterns: patterns.map(toPattern), posts: posts.map(toPost) };
}
