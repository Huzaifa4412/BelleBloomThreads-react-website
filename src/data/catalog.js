import { isSaleActive } from './collection';
import { client, imageUrl } from './sanity';

const photo = (image) => imageUrl(image, { width: 794 });
const thumb = (image) => imageUrl(image, { width: 160, height: 160 });

const CATALOG_QUERY = `{
  "shop": *[_id == "shopSettings"][0]{ name, owner, "url": etsyUrl, location, since, fetchedOn, currency, saleEnds },
  "products": *[_type == "product" && defined(slug.current) && count(images) > 0] | order(sortOrder asc){
    "id": slug.current, "listingId": etsyListingId, name, "title": etsyTitle, category, motif, price, regularPrice,
    "sourceOrder": etsyOrder, "url": etsyUrl, description, sizes, level, pages, terms, language, yarn, hook,
    features, included, techniques, note, status,
    images[]{ _key, alt, asset, hotspot, crop },
    video{ alt, "src": file.asset->url, poster }
  },
  "posts": *[_type == "post" && defined(slug.current) && defined(publishedAt)] | order(publishedAt desc)[0...3]{
    title, "slug": slug.current, category, excerpt, publishedAt, mainImage{ asset, hotspot, crop }
  }
}`;

const postDate = new Intl.DateTimeFormat('en-US', { dateStyle: 'long', timeZone: 'UTC' });

// Sanity stores prices in the shop currency; the storefront works in cents.
const toProduct = ({ price, regularPrice, features, included, images, video, ...product }) => ({
  ...product,
  price: Math.round(price * 100),
  regularPrice: Math.round(regularPrice * 100),
  features: features ?? [],
  included: included ?? [],
  images: images.map(image => ({ key: image._key, alt: image.alt ?? '', src: photo(image), thumb: thumb(image) })),
  video: video?.src ? { src: video.src, alt: video.alt ?? `Video of ${product.name}`, poster: video.poster?.asset && photo(video.poster), thumb: video.poster?.asset && thumb(video.poster) } : null,
});

// Filled by loadCatalog() before the app renders.
export let shop = {};
export let products = [];
export let latestPosts = [];

export async function loadCatalog() {
  const data = await client.fetch(CATALOG_QUERY);
  if (!data.shop || !data.products.length) throw new Error('The Sanity catalog has no published shop settings or patterns.');
  shop = data.shop;
  products = data.products.map(toProduct);
  latestPosts = data.posts.map(({ mainImage, ...post }) => ({ ...post, date: postDate.format(new Date(post.publishedAt)), image: mainImage?.asset ? imageUrl(mainImage, { width: 720, height: 540 }) : null }));
}

export const asset = (filename) => `${import.meta.env.BASE_URL}images/${filename}`;
export const money = (cents) => new Intl.NumberFormat('en-US', { style: 'currency', currency: shop.currency }).format(cents / 100);
export function saleActive(date = new Date()) {
  return isSaleActive(shop.saleEnds, date);
}
export const priceFor = (product) => saleActive() ? product.price : product.regularPrice;

export function loadFavorites() {
  try {
    const ids = JSON.parse(localStorage.getItem('belle-bloom-favorites') || '[]');
    return Array.isArray(ids) ? ids.filter(id => products.some(p => p.id === id)) : [];
  } catch { return []; }
}
