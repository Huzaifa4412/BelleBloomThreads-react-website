/**
 * Creates the three starter blog posts. Edit or delete them in the Studio afterwards.
 *
 * Run from the studio folder:
 *   npx sanity exec scripts/seed-blog.ts --with-user-token
 *
 * A post whose slug already exists is left untouched. To overwrite the starter posts with the
 * content in this file (discarding edits made to them in the Studio), add `-- --refresh`.
 */
import {randomUUID} from 'node:crypto'
import {getCliClient} from 'sanity/cli'

const client = getCliClient({apiVersion: '2026-10-13'})
const refresh = process.argv.includes('--refresh')
const key = () => randomUUID().slice(0, 12)

type Table = {table: {caption: string; rows: string[][]}}

/**
 * Turns one line of light markup into a Portable Text block.
 * Line prefixes: "## " and "### " headings, "- " bullets, "1. " numbered items, "> " quotes.
 * Inline: **bold** and [link text](url).
 */
function toBlock(line: string | Table) {
  if (typeof line !== 'string') {
    return {
      _type: 'table',
      _key: key(),
      caption: line.table.caption,
      rows: line.table.rows.map((cells) => ({_type: 'row', _key: key(), cells})),
    }
  }
  const [, prefix = '', text = ''] = /^(## |### |- |\d+\. |> )?(.*)$/.exec(line) ?? []
  const style = prefix === '## ' ? 'h2' : prefix === '### ' ? 'h3' : prefix === '> ' ? 'blockquote' : 'normal'
  const listItem = prefix === '- ' ? 'bullet' : /^\d/.test(prefix) ? 'number' : undefined
  const markDefs: {_type: 'link'; _key: string; href: string}[] = []
  const children = text
    .split(/(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/)
    .filter(Boolean)
    .map((part) => {
      const bold = /^\*\*(.+)\*\*$/.exec(part)
      const link = /^\[(.+)\]\((.+)\)$/.exec(part)
      if (bold) return {_type: 'span', _key: key(), text: bold[1], marks: ['strong']}
      if (link) {
        const linkKey = key()
        markDefs.push({_type: 'link', _key: linkKey, href: link[2]})
        return {_type: 'span', _key: key(), text: link[1], marks: [linkKey]}
      }
      return {_type: 'span', _key: key(), text: part, marks: []}
    })
  return {_type: 'block', _key: key(), style, ...(listItem ? {listItem, level: 1} : {}), markDefs, children}
}

type Seed = {
  title: string
  slug: string
  category: string
  excerpt: string
  publishedAt: string
  /** Pattern slug and photo position used for the cover image. */
  cover: [pattern: string, photo: number]
  relatedPatterns: string[]
  quickAnswer: string
  keyTakeaways: string[]
  body: (string | Table)[]
  faqs: [question: string, answer: string][]
}

const OWNER_BIO =
  'Olivia is the creative mind behind BelleBloomThreads, a United States–based Etsy shop of digital crochet patterns for sweaters and cardigans.'

const posts: Seed[] = [
  {
    title: 'US vs UK Crochet Terms: How to Read Any Pattern',
    slug: 'us-vs-uk-crochet-terms',
    category: 'Crochet basics',
    excerpt:
      'US and UK crochet patterns use the same words for different stitches. Here is how to tell them apart and convert between them.',
    publishedAt: '2026-10-13T09:00:00Z',
    cover: ['violet-bloom', 2],
    relatedPatterns: ['violet-bloom', 'autumn-mosaic'],
    quickAnswer:
      'US and UK crochet patterns use the same stitches under different names, shifted by one step. A US single crochet is a UK double crochet, a US double crochet is a UK treble, and a US treble is a UK double treble. A pattern that uses “sc” is written in US terms.',
    keyTakeaways: [
      'The stitches are identical; only the names change between US and UK patterns.',
      '“Double crochet” exists in both systems and means two different stitches.',
      'The abbreviation “sc” appears only in US terms, and “htr” only in UK terms.',
      'Swatch and compare with the pattern photo before starting a garment.',
    ],
    body: [
      'You follow a pattern exactly, work a row of double crochet, and the fabric comes out far taller or shorter than the photo. Most of the time your tension is fine. The pattern is simply written in the other set of crochet terms.',
      '## Why does the same word mean two different stitches?',
      'Crochet has two naming systems, US and UK. The stitches themselves are identical, but the names are shifted by one step. The stitch a US pattern calls a single crochet is called a double crochet in the UK, and every taller stitch moves up in the same way.',
      'That means “double crochet” exists in both systems and describes two different stitches. Reading a UK pattern with US habits makes every stitch one size too tall.',
      '## US to UK crochet terms conversion chart',
      'Use this chart to translate a pattern from one system to the other. The pairings follow the [Craft Yarn Council crochet abbreviations list](https://www.craftyarncouncil.com/standards/crochet-abbreviations), the yarn industry’s standard reference.',
      {
        table: {
          caption: 'US and UK crochet terms',
          rows: [
            ['US term', 'UK term'],
            ['Slip stitch (sl st)', 'Slip stitch (ss)'],
            ['Single crochet (sc)', 'Double crochet (dc)'],
            ['Half double crochet (hdc)', 'Half treble (htr)'],
            ['Double crochet (dc)', 'Treble (tr)'],
            ['Treble (tr)', 'Double treble (dtr)'],
            ['Double treble (dtr)', 'Triple treble (trtr)'],
            ['Gauge', 'Tension'],
            ['Skip', 'Miss'],
          ],
        },
      },
      'A chain (ch) is the same in both systems.',
      '## How can you tell which terms a pattern uses?',
      '1. Read the listing and the first page. A well-written pattern states its terminology.',
      '1. Look for single crochet. The abbreviation “sc” only exists in US terms, so a pattern that uses it is written in US terms.',
      '1. Look for half treble. The abbreviation “htr” only exists in UK terms.',
      '1. Compare the photo with the instructions. If the pattern says double crochet but the stitches in the photo are short and dense, it is probably written in UK terms.',
      '## Which crochet abbreviations will you see most often?',
      '- **st(s)**: stitch or stitches',
      '- **sk**: skip a stitch',
      '- **rep**: repeat',
      '- **inc** and **dec**: increase and decrease',
      '- **RS** and **WS**: right side and wrong side of the work',
      '## What should you do before starting a pattern in unfamiliar terms?',
      'Write the conversion chart at the top of the first page, or note the translated stitch next to each row. Then make a small swatch and compare it with the photo before you commit to the whole garment.',
      'The Violet Bloom and Autumn Mosaic cardigan patterns from BelleBloomThreads are written in US crochet terms, so keep the chart above beside you if you learned to crochet in the UK. You can [browse all of the patterns here](/#patterns).',
    ],
    faqs: [
      [
        'Is single crochet the same in US and UK terms?',
        'No. A US single crochet is the same stitch as a UK double crochet. UK terminology has no stitch called single crochet, so a pattern that uses “sc” is written in US terms.',
      ],
      [
        'What is a US double crochet called in the UK?',
        'A US double crochet (dc) is called a treble (tr) in UK terms. A UK double crochet is the shorter stitch that US patterns call a single crochet.',
      ],
      [
        'How do I know if a crochet pattern uses US or UK terms?',
        'Check the listing and the first page, where most designers state the terminology. If the pattern uses “sc” it is in US terms, and if it uses “htr” it is in UK terms.',
      ],
      [
        'Are BelleBloomThreads patterns written in US or UK terms?',
        'The Violet Bloom and Autumn Mosaic cardigan patterns are written in US crochet terms. Check the listing of any other pattern before you buy.',
      ],
    ],
  },
  {
    title: 'How to Choose Yarn for a Granny Square Sweater',
    slug: 'choose-yarn-for-a-granny-square-sweater',
    category: 'Yarn & materials',
    excerpt:
      'Yarn weight, fiber, color, and gauge decide how a granny square sweater fits and drapes. Here is what to check before you buy.',
    publishedAt: '2026-10-13T10:00:00Z',
    cover: ['autumn-mosaic', 0],
    relatedPatterns: ['purple-blossom', 'autumn-mosaic'],
    quickAnswer:
      'For a granny square sweater, use the yarn weight your pattern names, often #4 medium (worsted), in a soft fiber that is easy to wash, such as acrylic or a cotton blend. Choose one main color and two to four accents, then crochet one full square and measure it to check gauge before buying the rest.',
    keyTakeaways: [
      'Match the yarn weight in the pattern; a thinner yarn makes every square and the whole sweater smaller.',
      'Acrylic is light and easy to wash, cotton is cool but heavy, and wool is warm and elastic.',
      'One complete square is the simplest gauge swatch for a granny square garment.',
      'Buy all of your main color at once and match the dye lot.',
    ],
    body: [
      'A granny square sweater is made from many small pieces, so the yarn you choose is repeated across the whole garment. A choice that looks minor on one square can change the fit, the weight, and the look of the finished sweater.',
      '## What yarn weight should you use for a granny square sweater?',
      'Use the yarn weight named in your pattern. The weight is the thickness of the strand; it sets the size of each square, and the squares set the size of the sweater. Many granny square garments use a #4 medium yarn because it works up quickly and shows the stitches clearly.',
      'The [Craft Yarn Council’s Standard Yarn Weight System](https://www.craftyarncouncil.com/standards/yarn-weight-system) lists category 4 (Medium) as worsted, afghan, and aran yarn, with a typical crochet gauge of 11 to 14 single crochet stitches over 4 inches and a recommended hook of 5.5 to 6.5 mm.',
      'Individual patterns can differ. Our Autumn Mosaic cardigan pattern lists #4 worsted yarn with a 5.0 mm (US H/8) hook, adjusted as needed to match gauge, so always follow the pattern in front of you. If you swap in a thinner yarn, every square comes out smaller and so does the garment.',
      '## Which fiber is best: acrylic, cotton, or wool?',
      'For a sweater you plan to wear often, a soft yarn that is easy to wash is the practical choice. Each fiber behaves differently, and the yarn label has the final word on care.',
      {
        table: {
          caption: 'Yarn fibers for a granny square sweater',
          rows: [
            ['Fiber', 'How it feels', 'Care', 'Keep in mind'],
            ['Acrylic', 'Light and soft', 'Usually machine washable', 'Less breathable than natural fibers'],
            ['Cotton and cotton blends', 'Cool, with crisp stitches', 'Usually machine washable', 'Heavier and less stretchy, so a large sweater can lengthen'],
            ['Wool and wool blends', 'Warm and elastic', 'Often hand wash, unless labeled superwash', 'Can feel itchy on sensitive skin'],
          ],
        },
      },
      '## How do you choose colors for granny squares?',
      'Choose one main color for the borders and joining, because it ties the squares together, then add two to four accent colors.',
      'To check contrast, lay the yarns side by side and take a black-and-white photo on your phone. If two colors turn into the same grey, the motif will not stand out when they sit next to each other.',
      'Buy all of your main color at once and match the dye lot number on the labels. Shades can vary slightly from one lot to the next.',
      '## How do you check gauge for a granny square sweater?',
      'Gauge is the number of stitches and rows that fit into a given measurement. For a granny square sweater, the simplest swatch is one complete square.',
      '1. Make one square with the yarn and hook you plan to use.',
      '1. Wash and dry it the way you will care for the finished sweater.',
      '1. Lay it flat, measure it, and compare it with the size given in your pattern.',
      '1. If the square is too big, try a smaller hook. If it is too small, try a larger one.',
      'Small differences add up. A square that is half a centimeter too wide becomes four extra centimeters around a body that is eight squares wide.',
      '## How much yarn should you buy?',
      'Use the quantities your pattern gives for your size, and add a little extra of the main color to cover swatches, joining, and natural differences in tension.',
      'Before you shop, open your PDF and check the yarn, hook, and gauge details for your size. If you are still choosing a project, [take a look at the patterns](/#patterns).',
    ],
    faqs: [
      [
        'What yarn weight is best for a granny square sweater?',
        'Use the weight your pattern names. Many granny square sweaters are designed for #4 medium yarn, also sold as worsted or aran, which works up quickly and shows the stitches clearly.',
      ],
      [
        'Can I use cotton yarn for a granny square sweater?',
        'Yes. Cotton and cotton blends feel cool and give crisp stitches, but they are heavier and less stretchy than acrylic or wool, so a large sweater can lengthen as you wear it.',
      ],
      [
        'How do I check gauge when the pattern is made of squares?',
        'Make one complete square with your yarn and hook, wash and dry it as you would the finished sweater, then measure it flat and compare it with the square size in the pattern.',
      ],
      [
        'Does the dye lot matter?',
        'Yes. Shades can vary slightly between dye lots, so buy all of your main color at once and match the lot number printed on the labels.',
      ],
    ],
  },
  {
    title: 'How to Download Your Crochet Pattern PDF from Etsy',
    slug: 'download-crochet-pattern-pdf-from-etsy',
    category: 'Pattern help',
    excerpt:
      'Bought a digital crochet pattern on Etsy? Here is where to find your PDF, why it may not appear yet, and how to keep it safe.',
    publishedAt: '2026-10-13T11:00:00Z',
    cover: ['purple-blossom', 1],
    relatedPatterns: ['purple-blossom', 'violet-bloom', 'autumn-mosaic'],
    quickAnswer:
      'To download a crochet pattern PDF from Etsy, sign in at Etsy.com in a web browser, open Purchases and reviews from your account menu, find the order, and select Download Files. Guest buyers receive the download link by email. The file appears once Etsy has confirmed your payment.',
    keyTakeaways: [
      'A digital pattern is a PDF file; nothing is shipped.',
      'Download from Purchases and reviews at Etsy.com in a web browser.',
      'No button yet usually means the payment is still processing.',
      'Save a copy to cloud storage so the pattern is on every device.',
    ],
    body: [
      'A digital crochet pattern is a PDF file, so nothing is shipped to you. Etsy makes the file available once your payment has been confirmed. Here is where to find it.',
      '## How do you download a digital pattern from your Etsy account?',
      '1. Open Etsy.com in a web browser on your computer or phone and sign in.',
      '1. Select your account icon, then **Purchases and reviews**. You can also go straight to [your Purchases page](https://www.etsy.com/your/purchases).',
      '1. Find your order and select **Download Files**.',
      '1. Save the PDF to your device.',
      '## What if you checked out as a guest?',
      'Etsy sends the download link to the email address you used at checkout. If you cannot find the message, check your spam or promotions folder.',
      '## Why is there no Download Files button?',
      '- **Your payment is still processing.** The file appears only after payment is confirmed, and some payment methods take longer than others. Etsy emails you when it is ready.',
      '- **You are using the Etsy app.** If the download option is not shown in the app, open Etsy.com in your phone’s browser and download the file from there.',
      '- **You are signed in to a different account.** Sign in with the account or email address you used for the purchase.',
      '## How can you keep your pattern handy?',
      '- Save a copy to cloud storage or email it to yourself, so you can open it on any device.',
      '- On a tablet or phone, a PDF reader lets you zoom in on charts and mark the row you are working on.',
      '- Print only the pages you need, such as the charts and the size table.',
      '## What are you allowed to do with the PDF?',
      'A pattern PDF is for your own use. The instructions and charts may not be shared or resold. If you would like to sell pieces you make from a pattern, check the terms on its Etsy listing or ask the shop first.',
      '## Who do you contact if the download still does not work?',
      'Message BelleBloomThreads through Etsy from your order page. Orders, downloads, and purchase policies are all handled through the Etsy shop.',
      'Ready to choose your next project? [Browse the patterns](/#patterns).',
    ],
    faqs: [
      [
        'Where do I find my digital download on Etsy?',
        'Sign in at Etsy.com in a web browser, open Purchases and reviews from your account menu, and select Download Files next to the order.',
      ],
      [
        'Why can’t I see the Download Files button?',
        'The most common reason is that your payment is still processing; the file appears once payment is confirmed. Also check that you are signed in to the account you bought with, and try a web browser instead of the Etsy app.',
      ],
      [
        'Will a printed pattern be mailed to me?',
        'No. A digital crochet pattern is a PDF file that you download. No printed pattern, yarn, or finished garment is shipped.',
      ],
      [
        'Can I share my pattern PDF with a friend?',
        'No. The PDF is for your own use, and the instructions and charts may not be shared or resold.',
      ],
    ],
  },
]

async function main() {
  await client.patch('shopSettings').setIfMissing({ownerBio: OWNER_BIO}).commit()

  for (const seed of posts) {
    const existing = await client.fetch<string | null>(
      `*[_type == "post" && slug.current == $slug][0]._id`,
      {slug: seed.slug},
    )
    if (existing && !refresh) {
      console.log(`Skipped "${seed.title}": already exists as ${existing}`)
      continue
    }

    const [coverPattern, coverPhoto] = seed.cover
    const cover = await client.fetch<{alt: string; asset: {_ref: string}} | null>(
      `*[_type == "product" && slug.current == $slug][0].images[$photo]{alt, asset}`,
      {slug: coverPattern, photo: coverPhoto},
    )
    if (!cover) throw new Error(`Cover photo ${coverPhoto} of ${coverPattern} was not found`)

    const patternIds = await client.fetch<{slug: string; _id: string}[]>(
      `*[_type == "product" && slug.current in $slugs]{"slug": slug.current, _id}`,
      {slugs: seed.relatedPatterns},
    )
    const relatedPatterns = seed.relatedPatterns.map((slug) => {
      const pattern = patternIds.find((item) => item.slug === slug)
      if (!pattern) throw new Error(`Pattern ${slug} was not found`)
      return {_type: 'reference', _key: key(), _ref: pattern._id}
    })

    const content = {
      title: seed.title,
      slug: {_type: 'slug', current: seed.slug},
      category: seed.category,
      excerpt: seed.excerpt,
      publishedAt: seed.publishedAt,
      mainImage: {_type: 'image', asset: {_type: 'reference', _ref: cover.asset._ref}, alt: cover.alt},
      quickAnswer: seed.quickAnswer,
      keyTakeaways: seed.keyTakeaways,
      body: seed.body.map(toBlock),
      faqs: seed.faqs.map(([question, answer]) => ({_type: 'faq', _key: key(), question, answer})),
      relatedPatterns,
    }

    if (existing) {
      await client.patch(existing).set(content).commit()
      console.log(`Refreshed "${seed.title}" (${existing})`)
    } else {
      const created = await client.create({_type: 'post', ...content})
      console.log(`Created "${seed.title}" as ${created._id}`)
    }
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
