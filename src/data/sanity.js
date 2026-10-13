import { createClient } from '@sanity/client';
import { createImageUrlBuilder } from '@sanity/image-url';

export const client = createClient({
  projectId: import.meta.env.VITE_SANITY_PROJECT_ID,
  dataset: import.meta.env.VITE_SANITY_DATASET,
  apiVersion: '2026-10-13',
  useCdn: true,
});

const imageBuilder = createImageUrlBuilder(client);

export function imageUrl(image, { width, height } = {}) {
  let builder = imageBuilder.image(image).auto('format');
  if (width) builder = builder.width(width);
  if (height) builder = builder.height(height).fit('crop');
  return builder.url();
}

// Sanity image asset IDs end in "-<width>x<height>-<format>".
export function imageSize(image) {
  const [, width, height] = /-(\d+)x(\d+)-\w+$/.exec(image?.asset?._ref ?? '') ?? [];
  return width ? { width: Number(width), height: Number(height) } : {};
}
