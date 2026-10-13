import { renderToStaticMarkup } from 'react-dom/server';
import { loadBlog } from './data';
import { BlogIndex, BlogPost } from './pages';

const INDEX_TITLE = 'Crochet journal: yarn, stitches & pattern guides — BelleBloomThreads';
const INDEX_DESCRIPTION = 'Plain-spoken crochet guides from BelleBloomThreads: how to read a pattern, choose your yarn, and get the most from your digital crochet patterns.';
const SITE_SUMMARY = 'BelleBloomThreads is an Etsy shop of digital crochet patterns (PDF downloads) for sweaters and cardigans. This website presents the patterns and publishes crochet guides; purchases and downloads are handled by Etsy.';
// Search and answer-engine crawlers that are named explicitly in robots.txt.
const AI_CRAWLERS = ['GPTBot', 'OAI-SearchBot', 'ChatGPT-User', 'ClaudeBot', 'Claude-SearchBot', 'Claude-User', 'PerplexityBot', 'Perplexity-User', 'Google-Extended', 'Bingbot', 'Applebot-Extended'];

const escapeHtml = (value) => String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const jsonLd = (data) => `<script type="application/ld+json">${JSON.stringify(data).replace(/</g, '\\u003c')}</script>`;

function page({ root, stylesheet, title, description, canonical, image, type, noIndex, structuredData, extraHead = [], body }) {
  const head = [
    '<meta charset="UTF-8" />',
    '<meta name="viewport" content="width=device-width, initial-scale=1" />',
    '<meta name="theme-color" content="#fcfaf6" />',
    `<title>${escapeHtml(title)}</title>`,
    `<meta name="description" content="${escapeHtml(description)}" />`,
    `<meta name="robots" content="${noIndex ? 'noindex' : 'index, follow, max-image-preview:large, max-snippet:-1'}" />`,
    canonical && `<link rel="canonical" href="${escapeHtml(canonical)}" />`,
    `<meta property="og:type" content="${type}" />`,
    '<meta property="og:site_name" content="BelleBloomThreads" />',
    `<meta property="og:title" content="${escapeHtml(title)}" />`,
    `<meta property="og:description" content="${escapeHtml(description)}" />`,
    canonical && `<meta property="og:url" content="${escapeHtml(canonical)}" />`,
    image && `<meta property="og:image" content="${escapeHtml(image)}" />`,
    `<meta name="twitter:card" content="${image ? 'summary_large_image' : 'summary'}" />`,
    ...extraHead,
    `<link rel="alternate" type="application/rss+xml" title="The BelleBloomThreads journal" href="${root}blog/feed.xml" />`,
    `<link rel="icon" type="image/svg+xml" href="${root}favicon.svg" />`,
    `<link rel="stylesheet" href="${root}${stylesheet}" />`,
    ...structuredData.map(jsonLd),
  ].filter(Boolean).join('\n    ');
  return `<!doctype html>\n<html lang="en">\n  <head>\n    ${head}\n  </head>\n  <body>\n    ${body}\n  </body>\n</html>\n`;
}

/** A post as plain Markdown, for AI assistants and other readers that prefer text over HTML. */
function toMarkdown(post, { shop, link }) {
  const inline = (block) => (block.children ?? []).map(child => {
    let text = child.text ?? '';
    for (const mark of child.marks ?? []) {
      const definition = (block.markDefs ?? []).find(item => item._key === mark);
      if (mark === 'strong') text = `**${text}**`;
      else if (mark === 'em') text = `*${text}*`;
      else if (definition?.href) text = `[${text}](${definition.href.startsWith('/') ? link(definition.href.slice(1)) : definition.href})`;
    }
    return text;
  }).join('');
  const lines = [`# ${post.title}`, '', `By ${shop.owner ?? shop.name} · Published ${post.date}${post.updated ? ` · Updated ${post.updated}` : ''}`, '', post.excerpt, ''];
  if (post.quickAnswer) lines.push('## At a glance', '', post.quickAnswer, '');
  if (post.keyTakeaways.length) lines.push(...post.keyTakeaways.map(item => `- ${item}`), '');
  let numbered = 0;
  for (const block of post.body) {
    if (block._type === 'table') {
      const [header = [], ...rows] = (block.rows ?? []).map(row => row.cells ?? []);
      lines.push(`**${block.caption}**`, '', `| ${header.join(' | ')} |`, `| ${header.map(() => '---').join(' | ')} |`, ...rows.map(cells => `| ${cells.join(' | ')} |`), '');
    } else if (block._type === 'image') {
      if (block.alt) lines.push(`_Image: ${block.alt}_`, '');
    } else if (block._type === 'block') {
      numbered = block.listItem === 'number' ? numbered + 1 : 0;
      const text = inline(block);
      if (block.listItem) lines.push(`${block.listItem === 'number' ? `${numbered}.` : '-'} ${text}`);
      else lines.push('', `${{ h2: '## ', h3: '### ', blockquote: '> ' }[block.style] ?? ''}${text}`, '');
    }
  }
  if (post.faqs.length) lines.push('', '## Questions & answers', '', ...post.faqs.flatMap(faq => [`### ${faq.question}`, '', faq.answer, '']));
  if (post.patterns.length) lines.push('## Related patterns', '', ...post.patterns.map(pattern => `- [${pattern.name}](${pattern.url}): digital PDF crochet pattern on Etsy`), '');
  return `${lines.join('\n').replace(/\n{3,}/g, '\n\n').trim()}\n`;
}

/**
 * Builds every static blog file. `siteUrl` is the public address of the website without a trailing
 * slash; when it is unknown, canonical links, absolute structured-data URLs and the sitemap are left out.
 */
export async function buildBlog({ siteUrl, stylesheet }) {
  const { shop, patterns, posts } = await loadBlog();
  const absolute = (path) => siteUrl ? `${siteUrl}/${path}` : undefined;
  const link = (path) => absolute(path) ?? `/${path}`;
  const publisher = { '@type': 'Organization', name: shop.name, url: siteUrl || shop.url, sameAs: [shop.url] };
  const author = shop.owner ? { '@type': 'Person', name: shop.owner, description: shop.ownerBio ?? undefined, url: shop.url, worksFor: { '@type': 'Organization', name: shop.name } } : publisher;
  const indexable = posts.filter(post => !post.noIndex);
  const files = [];

  files.push({
    path: 'blog/index.html',
    contents: page({
      root: '../', stylesheet, title: INDEX_TITLE, description: INDEX_DESCRIPTION, canonical: absolute('blog/'), image: posts[0]?.cover?.src, type: 'website',
      structuredData: [{
        '@context': 'https://schema.org', '@type': 'Blog', name: 'The BelleBloomThreads journal', description: INDEX_DESCRIPTION, url: absolute('blog/'), inLanguage: 'en', publisher,
        blogPost: indexable.map(post => ({ '@type': 'BlogPosting', headline: post.title, description: post.excerpt, datePublished: post.publishedAt, dateModified: post._updatedAt, articleSection: post.category ?? undefined, author, url: absolute(`blog/${post.slug}/`) })),
      }],
      body: renderToStaticMarkup(<BlogIndex root="../" shop={shop} posts={posts} patterns={patterns} />),
    }),
  });

  for (const post of posts) {
    const canonical = absolute(`blog/${post.slug}/`);
    const structuredData = [{
      '@context': 'https://schema.org', '@type': 'BlogPosting', headline: post.title, description: post.seoDescription, abstract: post.quickAnswer ?? undefined, image: post.cover ? [post.cover.src] : undefined,
      datePublished: post.publishedAt, dateModified: post._updatedAt, articleSection: post.category ?? undefined, wordCount: post.words, inLanguage: 'en', author, publisher, mainEntityOfPage: canonical,
    }];
    if (post.faqs.length) structuredData.push({
      '@context': 'https://schema.org', '@type': 'FAQPage',
      mainEntity: post.faqs.map(faq => ({ '@type': 'Question', name: faq.question, acceptedAnswer: { '@type': 'Answer', text: faq.answer } })),
    });
    if (siteUrl) structuredData.push({
      '@context': 'https://schema.org', '@type': 'BreadcrumbList',
      itemListElement: [['Home', `${siteUrl}/`], ['The journal', absolute('blog/')], [post.title, canonical]].map(([name, item], index) => ({ '@type': 'ListItem', position: index + 1, name, item })),
    });
    files.push({
      path: `blog/${post.slug}/index.html`,
      contents: page({
        root: '../../', stylesheet, title: `${post.seoTitle} — BelleBloomThreads`, description: post.seoDescription, canonical, image: post.cover?.src, type: 'article', noIndex: post.noIndex, structuredData,
        extraHead: [
          `<meta property="article:published_time" content="${escapeHtml(post.publishedAt)}" />`,
          `<meta property="article:modified_time" content="${escapeHtml(post._updatedAt)}" />`,
          post.category && `<meta property="article:section" content="${escapeHtml(post.category)}" />`,
          shop.owner && `<meta name="author" content="${escapeHtml(shop.owner)}" />`,
          '<link rel="alternate" type="text/markdown" href="index.md" />',
        ],
        body: renderToStaticMarkup(<BlogPost root="../../" shop={shop} post={post} posts={posts} />),
      }),
    });
    files.push({ path: `blog/${post.slug}/index.md`, contents: toMarkdown(post, { shop, link }) });
  }

  // RSS feed, for feed readers and crawlers that discover new posts through it.
  files.push({
    path: 'blog/feed.xml',
    contents: `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0">\n  <channel>\n    <title>The BelleBloomThreads journal</title>\n    <link>${escapeHtml(link('blog/'))}</link>\n    <description>${escapeHtml(INDEX_DESCRIPTION)}</description>\n    <language>en</language>\n${indexable.map(post => `    <item>\n      <title>${escapeHtml(post.title)}</title>\n      <link>${escapeHtml(link(`blog/${post.slug}/`))}</link>\n      <guid isPermaLink="${siteUrl ? 'true' : 'false'}">${escapeHtml(link(`blog/${post.slug}/`))}</guid>\n      <pubDate>${new Date(post.publishedAt).toUTCString()}</pubDate>\n      ${post.category ? `<category>${escapeHtml(post.category)}</category>\n      ` : ''}<description>${escapeHtml(post.quickAnswer || post.excerpt)}</description>\n    </item>`).join('\n')}\n  </channel>\n</rss>\n`,
  });

  // llms.txt (llmstxt.org): a short map of the site for AI assistants.
  files.push({
    path: 'llms.txt',
    contents: [
      `# ${shop.name}`, '', `> ${SITE_SUMMARY}`, '',
      '## Crochet guides', '',
      ...indexable.map(post => `- [${post.title}](${link(`blog/${post.slug}/index.md`)}): ${post.excerpt}`), '',
      '## Crochet patterns', '',
      ...patterns.map(pattern => `- [${pattern.name}](${pattern.url}): ${[pattern.category && `${pattern.category.replace(/s$/, '')} pattern`, pattern.motif, pattern.sizes && `sizes ${pattern.sizes}`, pattern.level && `${pattern.level.toLowerCase()} level`].filter(Boolean).join(', ')}. ${pattern.description}`), '',
      '## Shop', '',
      `- [${shop.name} on Etsy](${shop.url}): where every pattern is purchased and downloaded`,
      `- [All guides](${link('blog/')})`, '',
    ].join('\n'),
  });

  if (siteUrl) {
    const latest = posts.map(post => post._updatedAt).sort().at(-1);
    const urls = [
      { loc: `${siteUrl}/` },
      { loc: absolute('blog/'), lastmod: latest },
      ...indexable.map(post => ({ loc: absolute(`blog/${post.slug}/`), lastmod: post._updatedAt })),
    ];
    files.push({
      path: 'sitemap.xml',
      contents: `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(({ loc, lastmod }) => `  <url><loc>${escapeHtml(loc)}</loc>${lastmod ? `<lastmod>${lastmod.slice(0, 10)}</lastmod>` : ''}</url>`).join('\n')}\n</urlset>\n`,
    });
  }
  files.push({
    path: 'robots.txt',
    contents: `User-agent: *\nAllow: /\n\n# Search and AI answer engines are welcome to read and cite this site.\n${AI_CRAWLERS.map(bot => `User-agent: ${bot}`).join('\n')}\nAllow: /\n${siteUrl ? `\nSitemap: ${siteUrl}/sitemap.xml\n` : ''}`,
  });

  return { files, posts: posts.length };
}
