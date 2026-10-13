import assert from 'node:assert/strict';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const catalog = JSON.parse(readFileSync(new URL('../src/data/catalog.json', import.meta.url), 'utf8'));
const expectedListings = new Set(['4592754411', '4591327304', '4592047488', '4593217171']);
const ids = new Set();
for (const product of catalog.products) {
  assert(!ids.has(product.id), `Duplicate product ID: ${product.id}`);
  ids.add(product.id);
  assert(expectedListings.delete(product.listingId), `Unexpected or duplicate Etsy listing: ${product.listingId}`);
  const url = new URL(product.url);
  assert.equal(url.hostname, 'www.etsy.com');
  assert(url.pathname.includes(`/listing/${product.listingId}/`), `Listing URL mismatch: ${product.id}`);
  assert(Number.isInteger(product.price) && product.price > 0 && product.regularPrice >= product.price);
  assert.equal(product.images.length, 3, `Missing imported gallery photos: ${product.id}`);
  for (const image of product.images) {
    const path = fileURLToPath(new URL(`../public/images/${image.src}`, import.meta.url));
    assert(existsSync(path) && statSync(path).size > 1000, `Missing/empty photo: ${image.src}`);
    const bytes = readFileSync(path);
    assert.equal(bytes.toString('ascii', 0, 4), 'RIFF', `Invalid WebP: ${image.src}`);
    assert.equal(bytes.toString('ascii', 8, 12), 'WEBP');
    assert(image.alt.length > 20 && new URL(image.source).hostname === 'i.etsystatic.com');
  }
  assert(product.video, `Missing listing video: ${product.id}`);
  const videoPath = fileURLToPath(new URL(`../public/video/${product.video.src}`, import.meta.url));
  assert(existsSync(videoPath) && statSync(videoPath).size > 10000, `Missing/empty video: ${product.video.src}`);
  assert.equal(readFileSync(videoPath).toString('ascii', 4, 8), 'ftyp', `Invalid MP4: ${product.video.src}`);
  const posterPath = fileURLToPath(new URL(`../public/images/${product.video.poster}`, import.meta.url));
  assert(existsSync(posterPath) && readFileSync(posterPath).toString('ascii', 8, 12) === 'WEBP', `Missing/invalid video poster: ${product.video.poster}`);
  assert(product.video.alt.length > 20);
  if (product.listingId === '4593217171') {
    assert(product.note.includes('unverified sizing') && product.status.includes('unverified'), 'Golden Chevron disclosure is required.');
  }
}
assert.equal(expectedListings.size, 0, 'A confirmed Etsy listing was omitted.');
console.log(`Catalog verified: ${ids.size} confirmed Etsy listings, 12 original photos, ${ids.size} listing videos, and designer disclosures.`);
