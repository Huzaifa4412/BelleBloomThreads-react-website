import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { filterCatalog, isSaleActive } from '../src/data/collection.js';

const { products, shop } = JSON.parse(readFileSync(new URL('../src/data/catalog.json', import.meta.url), 'utf8'));
const ids = result => result.map(product => product.id);

test('all four actual Etsy listings are discoverable in their correct categories', () => {
  assert.equal(filterCatalog(products, {}).length, 4);
  assert.deepEqual(ids(filterCatalog(products, { category: 'Sweaters' })), ['purple-blossom', 'golden-chevron']);
  assert.deepEqual(ids(filterCatalog(products, { category: 'Cardigans' })), ['violet-bloom', 'autumn-mosaic']);
});
test('search tolerates case and spaces and searches construction details', () => {
  assert.deepEqual(ids(filterCatalog(products, { query: '  CHEVRON  ' })), ['golden-chevron']);
  assert.deepEqual(ids(filterCatalog(products, { query: 'half double' })), ['violet-bloom']);
  assert.deepEqual(ids(filterCatalog(products, { query: 'a pattern that does not exist' })), []);
});
test('saved-only search intersects favorites, category, and query', () => {
  const options = { savedOnly: true, favorites: ['violet-bloom', 'purple-blossom', 'not-a-product'] };
  assert.deepEqual(ids(filterCatalog(products, options)), ['purple-blossom', 'violet-bloom']);
  assert.deepEqual(ids(filterCatalog(products, { ...options, category: 'Cardigans', query: 'flowers' })), ['violet-bloom']);
  assert.equal(filterCatalog(products, { savedOnly: true, favorites: [] }).length, 0);
});
test('newest follows the observed Etsy order and sorting does not mutate studio picks', () => {
  const before = ids(products);
  assert.deepEqual(ids(filterCatalog(products, { sort: 'newest' })), ['golden-chevron', 'purple-blossom', 'autumn-mosaic', 'violet-bloom']);
  assert.deepEqual(ids(filterCatalog(products, { sort: 'name' })), ['autumn-mosaic', 'golden-chevron', 'purple-blossom', 'violet-bloom']);
  assert.deepEqual(ids(products), before);
});
test('price sorting uses the current effective price, including regular prices', () => {
  const fixtures = [{ ...products[0], price: 900, regularPrice: 1800 }, { ...products[1], price: 1100, regularPrice: 1200 }];
  assert.deepEqual(ids(filterCatalog(fixtures, { sort: 'price-low' })), ['purple-blossom', 'violet-bloom']);
  assert.deepEqual(ids(filterCatalog(fixtures, { sort: 'price-low' }, product => product.regularPrice)), ['violet-bloom', 'purple-blossom']);
  assert.deepEqual(ids(filterCatalog(fixtures, { sort: 'price-high' })), ['violet-bloom', 'purple-blossom']);
});
test('the imported sale stops after its published end date', () => {
  assert(isSaleActive(shop.saleEnds, new Date('2026-10-12T12:00:00Z')));
  assert(isSaleActive(shop.saleEnds, new Date('2026-11-09T23:59:59Z')));
  assert(!isSaleActive(shop.saleEnds, new Date('2026-11-10T00:00:00Z')));
});
