// Runs after `vite build`: fetches the published blog posts from Sanity and writes them into dist/
// as plain HTML pages, together with robots.txt and (when VITE_SITE_URL is set) sitemap.xml.
// Search engines can then read every post without running JavaScript.
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer, loadEnv } from 'vite';

const projectRoot = fileURLToPath(new URL('..', import.meta.url));
const dist = join(projectRoot, 'dist');
const siteUrl = (loadEnv('production', projectRoot, 'VITE_').VITE_SITE_URL ?? '').trim().replace(/\/+$/, '');

const homePath = join(dist, 'index.html');
let home = await readFile(homePath, 'utf8');
const stylesheet = /<link rel="stylesheet"[^>]*href="\.?\/?(assets\/[^"]+\.css)"/.exec(home)?.[1];
if (!stylesheet) throw new Error('Could not find the built stylesheet in dist/index.html. Run `vite build` first.');

const vite = await createServer({ root: projectRoot, mode: 'production', appType: 'custom', logLevel: 'error', server: { middlewareMode: true, hmr: false, ws: false } });
let blog;
try {
  const { buildBlog } = await vite.ssrLoadModule('/src/blog/static.jsx');
  blog = await buildBlog({ siteUrl, stylesheet });
} finally {
  await vite.close();
}

for (const file of blog.files) {
  const target = join(dist, file.path);
  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, file.contents);
}

if (siteUrl) {
  home = home.replace('</head>', `  <link rel="canonical" href="${siteUrl}/" />\n    <meta property="og:url" content="${siteUrl}/" />\n  </head>`);
  await writeFile(homePath, home);
} else {
  console.warn('VITE_SITE_URL is not set in .env: canonical links and sitemap.xml were skipped. Set it to the website’s public address and rebuild.');
}
console.log(`Blog pre-built: ${blog.posts} posts, ${blog.files.length} files written to dist/.`);
