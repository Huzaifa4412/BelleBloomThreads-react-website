# BelleBloomThreads

A React storefront for the BelleBloomThreads Etsy crochet-pattern shop. The catalog was read from the actual public shop and individual listings on **12 October 2026**.

## Run locally

Requires a current Node.js installation compatible with Vite 8 (Node 20.19+ or 22.12+).

```sh
npm install
npm run dev
```

Open http://127.0.0.1:4173 in your browser. The Sanity project ID and dataset the site reads from are set in `.env`.

```sh
npm run check     # catalog integrity, six behavior tests, ESLint, production build
npm run build     # output: dist/
npm run preview   # production preview on port 4174
```

## Stack and design

- React 19 with reusable JSX components and Vite 8.
- Tailwind CSS 4, using the official Vite plugin and CSS theme tokens.
- Motion for React: scroll reveals, product entry/layout transitions, a spring hover accent, gallery transitions, mobile menu transitions, and saved-project notifications.
- System reduced-motion preferences are respected.
- Catalog content, original Etsy photography, and listing videos are loaded from Sanity; the shop logo is served locally. The old generated sample-photo sprite is no longer used.
- Cream, floral blush, muted olive, and purple tones take their direction from the real shop banner and product collection.
- Fraunces and DM Sans fonts are self-hosted through Fontsource. No Google Fonts request is required.

## Real catalog

All four active listings were imported:

1. Purple Blossom sweater — listing 4592754411
2. Violet Bloom cardigan — listing 4591327304
3. Autumn Mosaic cardigan — listing 4592047488
4. Golden Chevron sweater design guide — listing 4593217171

Each has three original gallery photos, one listing video, its direct Etsy URL, source title, description, and available specifications. The website adds search, sweater/cardigan filtering, saved projects with optional local storage, sorting, native product dialogs, a photo and video gallery, mobile navigation, download guidance, FAQs, and privacy information.

Prices were USD 6.90, reduced from USD 11.50, when fetched. Etsy showed a 40% sale ending 9 November 2026. The sale display expires automatically after that date (UTC). Etsy confirms the final price at checkout. These are imported catalog snapshots, not an automatic Etsy inventory or price feed.

**Golden Chevron:** the source listing says some measurements and stitch counts require completion/testing and that sizing is unverified. That information is preserved on its card and in the product details before the purchase link. Purple Blossom does not publish a precise skill level or page count; these are not invented.

## Purchases and downloads

The purchase links open the corresponding Etsy listing. Payments, orders, digital PDF delivery, messages, and purchase policies are handled by Etsy. There is no separate payment processor, account system, newsletter backend, or direct pattern-file download on this website.

The old sample cart and newsletter were replaced with actual Etsy purchase links and saved projects. Original static source files are preserved under `archive/original-static/`.

## Update the catalog

The catalog lives in Sanity (project `s67pid7z`, dataset `production`) and the website loads it in the browser each time it opens, so published changes appear without rebuilding the site. Edit it in the Studio in `studio/`:

```sh
npm run studio    # Sanity Studio on http://localhost:3333
```

- **Shop settings** holds the Etsy shop URL, currency, and the sale end date that controls the sale prices and 40% off label.
- **Patterns** holds each listing: name, prices, photos, video, pattern details, Etsy link, and both sort orders. Changes go live when you publish.
- The hero, featured, and story sections look up the patterns with the slugs `purple-blossom`, `violet-bloom`, and `autumn-mosaic`; keep those slugs unless you also update `src/App.jsx`. Their headlines, the FAQ, and the search-engine list in `index.html` are written in the code.
- After changing the schema in `studio/schemaTypes/`, run `npx sanity schemas deploy` from `studio/`.

`src/data/catalog.json`, `public/images/`, and `public/video/` are the original Etsy snapshot that was imported into Sanity with `studio/scripts/import-catalog.ts`. They are still checked by `npm run check` and the tests, but the website no longer reads them (apart from the shop logo). Read `CATALOG-SOURCES.md` for source and verification notes.

## The blog

Blog posts ("The journal") are written in the Studio under **Blog posts** and appear at `/blog/` and `/blog/<slug>/`. The three newest also show in the "From the journal" section of the home page.

**Writing a post that can rank and be quoted**

- **Title** — lead with the words people search for; under 70 characters.
- **Excerpt** — one or two sentences, about 160 characters; also the search description.
- **Category** — shown as a tag and in the topic list.
- **Quick answer** — the direct answer to the title's question in 40–60 words. It opens the "At a glance" card, and search and AI answer engines often quote it.
- **Key takeaways** — three to five short points.
- **Body** — use question-style Heading 2 sections (they become the "In this guide" contents list), numbered lists for steps, and the **Table** block for comparisons. Link to the source when you state a fact or figure. Links that start with `/` (such as `/#patterns`) point inside this website.
- **Questions & answers** — real reader questions with short, complete answers; shown at the end and marked up as FAQ data.
- **Related patterns** — up to four, shown with links to their Etsy listings.
- **About the owner** (in Shop settings) — the author note under every post.

**What the build produces**

`npm run build` fetches the published posts from Sanity and writes into `dist/`:

- `blog/index.html` and `blog/<slug>/index.html` — complete HTML pages with title, description, social tags, and structured data (BlogPosting, FAQPage, BreadcrumbList), readable without JavaScript.
- `blog/<slug>/index.md` and `llms.txt` — plain-text versions and a site map for AI assistants.
- `blog/feed.xml` — RSS feed.
- `robots.txt`, and `sitemap.xml` when the site address is set.

**A new or edited post goes live after the site is rebuilt and redeployed.**

Set `VITE_SITE_URL` in `.env` to the website's public address (for example `https://www.example.com`, no trailing slash). The build then adds canonical links and writes `sitemap.xml`; submit that sitemap in Google Search Console and Bing Webmaster Tools. Without it the build prints a warning and skips both.

In `npm run dev`, the same pages render in the browser at `/blog/` for previewing. The page templates are in `src/blog/`, and the build step is `scripts/prerender-blog.mjs`. The three starter posts come from `studio/scripts/seed-blog.ts`; edit or delete them in the Studio.

## Deploy

Run `npm run build` and deploy the contents of `dist/` to a static host that serves `index.html` for folder addresses such as `/blog/`. The relative asset base supports serving the build from a subdirectory. The app uses native dialogs and section anchors, so no server-side routing is required.

The browser reads the catalog directly from Sanity, so the deployed site's address must be an allowed CORS origin: run `npx sanity cors add https://your-domain --no-credentials` from `studio/`. The local dev and preview addresses are already allowed. To host the Studio, run `npx sanity deploy` from `studio/`.

The source ZIP includes the React project, lockfile, local images, instructions, and tests. The built-site ZIP contains the ready-to-host production files. `node_modules` is not included.

## Verification and remaining QA

Completed on 12 October 2026:

- Confirmed all four listing IDs and direct Etsy URLs against the rendered shop.
- Downloaded 12 gallery photos and verified their local WebP files and source URLs.
- Inspected the primary and editorial product photos directly.
- Six Node behavior tests passed: categories, search, saved-only intersections, listing ordering, effective-price sorting, and sale expiration.
- ESLint passed.
- Production build passed.
- Dependency installation reported zero vulnerabilities.

**Visual browser QA remains pending.** The browser tool reported that access to the local preview was declined. No rendered website screenshots, viewport/overflow measurements, browser console verification, or interactive keyboard/mobile checks are claimed. The responsive CSS and accessible native dialogs are implemented but still need that rendered-browser pass.
