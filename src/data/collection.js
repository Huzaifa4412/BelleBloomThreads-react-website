export function filterCatalog(products, { category = 'All patterns', query = '', sort = 'studio', favorites = [], savedOnly = false }, priceFor = product => product.price) {
  const search = query.trim().toLowerCase();
  const result = products.filter(product =>
    (category === 'All patterns' || product.category === category) &&
    (!savedOnly || favorites.includes(product.id)) &&
    (!search || [product.name, product.title, product.description, product.category, product.motif, product.level, product.techniques].join(' ').toLowerCase().includes(search))
  );
  if (sort === 'newest') result.sort((a, b) => a.sourceOrder - b.sourceOrder);
  if (sort === 'name') result.sort((a, b) => a.name.localeCompare(b.name));
  if (sort === 'price-low') result.sort((a, b) => priceFor(a) - priceFor(b));
  if (sort === 'price-high') result.sort((a, b) => priceFor(b) - priceFor(a));
  return result;
}

export function isSaleActive(saleEnds, date = new Date()) {
  return date.toISOString().slice(0, 10) <= saleEnds;
}
