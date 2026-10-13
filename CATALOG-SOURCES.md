# Catalog sources

Fetched in Chrome from the public Etsy shop on **12 October 2026**. In-app browsing was blocked by Etsy; the normal Chrome page loaded successfully. TinyFish tools were not exposed in this session. Generic Etsy keyword search returned unrelated shops; those results were discarded.

## Shop

https://www.etsy.com/shop/BelleBloomThreads

Observed: four digital listings, the shop owner Olivia, the shop story, original shop logo/banner, and United States shop location. The shop showed no reviews; the website includes no fabricated testimonials, review scores, sales totals, or customer claims.

## Listings

| Website name | Etsy listing | Source details retained |
| --- | --- | --- |
| Purple Blossom sweater | https://www.etsy.com/listing/4592754411/purple-granny-square-crochet-sweater | Floral granny squares; oversized pullover; ribbed edging; XS–3XL in the title; one PDF. No invented page count, terminology, yarn, hook, or skill level. |
| Violet Bloom cardigan | https://www.etsy.com/listing/4591327304/purple-floral-crochet-cardigan-pattern | 16-page PDF; intermediate; US terms; XS–3XL; half double crochet; appliqués and seamed panels; ivory ribbing. |
| Autumn Mosaic cardigan | https://www.etsy.com/listing/4592047488/autumn-mosaic-cardigan-crochet-pattern | 18-page A4 PDF; intermediate; US terms; XS–3XL; worsted yarn; 5.0 mm hook adjusted for gauge; granny stripes and tassels. |
| Golden Chevron sweater | https://www.etsy.com/listing/4593217171/off-shoulder-crochet-sweater-pattern | 18-page English PDF design guide; intermediate; US terms; proposed XS–3XL sizing; worsted/Aran yarn; explicit unfinished/unverified pattern disclosure. |

The shortened product names come from the names in the listing descriptions. Full source titles, listing IDs, URLs, image provenance, and retained designer notes are in `src/data/catalog.json`. Studio-pick order is curated; “Newest first” follows Etsy’s observed Most Recent ordering without inventing publication dates.

All listings showed USD 6.90 / USD 11.50, 40% off, with a sale end date of 9 November. This is a dated snapshot. Checkout on Etsy determines live prices and terms.

## Media

`public/images/` contains copied original assets, without redrawing or generated substitutes. Each gallery image has its original Etsy URL in the catalog. Three representative photos per listing were imported; the complete Etsy galleries remain available on Etsy.

`public/video/` contains one listing video per product (`<product-id>.mp4`), supplied by the shop owner on **13 October 2026** and added to each product gallery after the first photo. Etsy served a CAPTCHA to automated browsing that day, so the files were not fetched from Etsy and no Etsy video URLs are recorded. Each file was matched to its listing by the garment shown in the footage. The `*-video-poster.webp` images in `public/images/` are frames taken from these videos at the one-second mark.

The shop banner and thumbnail assets are preserved locally as references. The active storefront uses the original shop logo and the larger gallery photographs.

## Sanity

On **13 October 2026** this snapshot (shop details, four listings, 12 photos, four videos and their posters) was imported into the Sanity project `s67pid7z`, dataset `production`, with `studio/scripts/import-catalog.ts`. The website now reads the catalog from Sanity; later edits made in the Studio are not reflected in `src/data/catalog.json`. Each photo keeps its original Etsy URL in Sanity.

## Product boundaries

No PDF pattern files were purchased or retrieved. PDF page counts and included features are seller-provided listing descriptions, not independently tested crochet instructions. Digital download and commercial-use information is drawn from these listings. The Golden Chevron warning is preserved before purchase; no claim of a tested pattern is made.

## Remaining verification

Rendered local-browser QA was blocked by a browser permission decline. Catalog tests, source lint, asset integrity, and production compilation passed; viewport layout, interactions, persistence, dialogs, reduced-motion behavior, and console errors still need to be checked in the rendered site.
