import { PortableText } from '@portabletext/react';
import { ArrowLeft, ArrowRight, ArrowUpRight, Check, Flower } from '@phosphor-icons/react';
import Brand from '../components/Brand';
import { blockText, bodyImage, headingId } from './data';

// `root` is the path from the current page back to the site root ("/" in development, "../" style
// paths in the pre-built pages), so every page works from any folder the site is hosted in.

function Layout({ root, shop, children }) {
  const logo = `${root}images/shop-logo.webp`;
  return <>
    <a className="skip-link" href="#main">Skip to content</a>
    <header className="site-header">
      <div className="shell header-inner flex items-center justify-between gap-3">
        <Brand href={root} logo={logo} />
        <nav className="flex items-center gap-7" aria-label="Main navigation"><a className="hidden sm:inline" href={`${root}#patterns`}>The patterns</a><a href={`${root}blog/`}>The journal</a></nav>
        <a href={shop.url} target="_blank" rel="noopener noreferrer" className="etsy-header hidden md:inline-flex">Visit our Etsy<ArrowUpRight size={17} /></a>
      </div>
    </header>
    <main id="main">{children}</main>
    <footer className="site-footer"><div className="shell"><div className="footer-top"><div><Brand footer href={root} logo={logo} /><p>Beautiful crochet patterns, made to bloom.</p></div><nav aria-label="Footer navigation"><a href={`${root}#patterns`}>The patterns</a><a href={`${root}blog/`}>The journal</a><a href={`${root}#help`}>Pattern help</a><a href={`${shop.url}#policies`} target="_blank" rel="noopener noreferrer">Shop policies<ArrowUpRight size={12} /></a></nav><a className="footer-etsy" href={shop.url} target="_blank" rel="noopener noreferrer">Find us on <span>Etsy<ArrowUpRight size={21} /></span></a></div><div className="footer-bottom"><span>© {new Date().getFullYear()} BelleBloomThreads</span><span>Digital patterns · Purchases & downloads through Etsy</span></div></div></footer>
  </>;
}

function PostMeta({ post }) {
  return <p className="post-meta"><time dateTime={post.publishedAt}>{post.date}</time><span aria-hidden="true">·</span>{post.minutes} min read</p>;
}

function PostCard({ root, post, eager = false }) {
  const href = `${root}blog/${post.slug}/`;
  return <article className="post-card">
    {post.cover && <a className="post-card-photo" href={href} tabIndex={-1} aria-hidden="true"><img src={post.cover.card} alt="" width="720" height="540" loading={eager ? 'eager' : 'lazy'} /></a>}
    {post.category && <p className="post-tag">{post.category}</p>}
    <h3><a href={href}>{post.title}</a></h3>
    <p>{post.excerpt}</p>
    <PostMeta post={post} />
  </article>;
}

function PatternBand({ root, patterns, heading, children }) {
  if (patterns.length === 0) return null;
  return <section className="pattern-band" aria-labelledby="pattern-band-heading">
    <div className="shell">
      <div className="pattern-band-heading"><div><p className="eyebrow">From the pattern shelf</p><h2 id="pattern-band-heading">{heading}</h2></div>{children}</div>
      <div className="pattern-row">{patterns.map(pattern => <a key={pattern.id} className="post-pattern" href={pattern.url} target="_blank" rel="noopener noreferrer"><img src={pattern.image.src} alt={pattern.image.alt} width="480" height="480" loading="lazy" /><span className="product-motif">{pattern.motif}</span><span className="product-name">{pattern.name}<ArrowUpRight className="shrink-0" size={18} /></span><span className="post-pattern-note">Digital PDF pattern on Etsy</span></a>)}</div>
      <a className="button button-outline" href={`${root}#patterns`}>See every pattern<ArrowRight size={18} /></a>
    </div>
  </section>;
}

export function BlogIndex({ root, shop, posts, patterns }) {
  const [latest, ...rest] = posts;
  const topics = [...new Set(posts.map(post => post.category).filter(Boolean))].map(name => ({ name, count: posts.filter(post => post.category === name).length }));
  return <Layout root={root} shop={shop}>
    <section className="blog-hero shell">
      <div>
        <p className="eyebrow flex items-center gap-2"><span className="little-star">✳</span> The journal</p>
        <h1>Notes on yarn, stitches, <em>and making your own.</em></h1>
      </div>
      <div className="blog-hero-aside">
        <p>Plain-spoken crochet guides from BelleBloomThreads: how to read a pattern, choose your yarn, and get the most from your digital patterns.</p>
        {topics.length > 0 && <ul className="topic-list" aria-label="Topics">{topics.map(topic => <li key={topic.name}>{topic.name}<span>{topic.count} {topic.count === 1 ? 'guide' : 'guides'}</span></li>)}</ul>}
      </div>
    </section>

    {!latest && <p className="blog-empty shell">The first guides are on their way. In the meantime, <a href={`${root}#patterns`}>browse the patterns</a>.</p>}

    {latest && <section className="featured-post shell" aria-labelledby="featured-post-heading">
      {latest.cover && <a className="featured-post-photo" href={`${root}blog/${latest.slug}/`} tabIndex={-1} aria-hidden="true"><img src={latest.cover.feature} alt="" width="1000" height="1000" fetchPriority="high" /><span className="editorial-tag">The latest guide</span></a>}
      <div className="featured-post-copy">
        {latest.category && <p className="post-tag">{latest.category}</p>}
        <h2 id="featured-post-heading"><a href={`${root}blog/${latest.slug}/`}>{latest.title}</a></h2>
        <p>{latest.quickAnswer || latest.excerpt}</p>
        <PostMeta post={latest} />
        <a className="button button-primary" href={`${root}blog/${latest.slug}/`} aria-label={`Read ${latest.title}`}>Read the guide<ArrowRight size={18} /></a>
      </div>
    </section>}

    {rest.length > 0 && <section className="blog-list shell" aria-labelledby="more-guides-heading">
      <h2 id="more-guides-heading" className="blog-section-title">More from the journal</h2>
      <div className="post-grid">{rest.map((post, index) => <PostCard key={post.slug} root={root} post={post} eager={index < 3} />)}</div>
    </section>}

    <PatternBand root={root} patterns={patterns.slice(0, 4)} heading={<>Found a project <em>you’d love to make?</em></>} />
  </Layout>;
}

const bodyComponents = (root) => ({
  block: {
    h2: ({ children, value }) => <h2 id={headingId(blockText(value))}>{children}</h2>,
  },
  types: {
    image: ({ value }) => {
      if (!value?.asset) return null;
      const image = bodyImage(value);
      return <figure><img src={image.src} alt={value.alt ?? ''} width={image.width} height={image.height} loading="lazy" />{value.caption && <figcaption>{value.caption}</figcaption>}</figure>;
    },
    table: ({ value }) => {
      const [header, ...rows] = (value?.rows ?? []).map(row => row.cells ?? []);
      if (!header) return null;
      return <div className="post-table"><table>
        <caption>{value.caption}</caption>
        <thead><tr>{header.map((cell, index) => <th key={index} scope="col">{cell}</th>)}</tr></thead>
        <tbody>{rows.map((cells, rowIndex) => <tr key={rowIndex}>{cells.map((cell, index) => index === 0 ? <th key={index} scope="row">{cell}</th> : <td key={index}>{cell}</td>)}</tr>)}</tbody>
      </table></div>;
    },
  },
  marks: {
    link: ({ children, value }) => {
      const href = value?.href ?? '';
      // Links written as "/blog/…" or "/#patterns" in the Studio point inside this website.
      if (href.startsWith('/')) return <a href={`${root}${href.slice(1)}`}>{children}</a>;
      return <a href={href} target="_blank" rel="noopener noreferrer">{children}</a>;
    },
  },
});

export function BlogPost({ root, shop, post, posts = [] }) {
  const logo = `${root}images/shop-logo.webp`;
  const more = posts.filter(item => item.slug !== post.slug).slice(0, 3);
  const hasGlance = post.quickAnswer || post.keyTakeaways.length > 0;
  return <Layout root={root} shop={shop}>
    <div className="read-progress" aria-hidden="true" />
    <article className="post">
      <div className="shell">
        <nav className="breadcrumb" aria-label="Breadcrumb"><a href={root}>Home</a><span aria-hidden="true">/</span><a href={`${root}blog/`}>The journal</a>{post.category && <><span aria-hidden="true">/</span><span>{post.category}</span></>}</nav>
        <header className="post-header">
          <div>
            {post.category && <p className="post-tag">{post.category}</p>}
            <h1>{post.title}</h1>
            <p className="post-excerpt">{post.excerpt}</p>
            <div className="post-byline">
              <img src={logo} alt="" width="40" height="40" />
              <p>{shop.owner && <span>By <strong>{shop.owner}</strong>, {shop.name}</span>}<span><time dateTime={post.publishedAt}>{post.date}</time>{post.updated && <> · Updated <time dateTime={post._updatedAt}>{post.updated}</time></>} · {post.minutes} min read</span></p>
            </div>
          </div>
          {post.cover && <div className="post-cover"><img src={post.cover.src} alt={post.cover.alt} width="1200" height="900" fetchPriority="high" /></div>}
        </header>

        <div className="post-layout">
          {post.headings.length > 1 && <nav className="post-toc" aria-label="In this guide">
            <p className="eyebrow">In this guide</p>
            <ol>{post.headings.map(heading => <li key={heading.id}><a href={`#${heading.id}`}>{heading.text}</a></li>)}{post.faqs.length > 0 && <li><a href="#questions">Questions &amp; answers</a></li>}</ol>
          </nav>}
          <div className="post-main">
            {hasGlance && <section className="at-a-glance" aria-labelledby="glance-heading">
              <h2 id="glance-heading"><Flower size={22} weight="light" />At a glance</h2>
              {post.quickAnswer && <p>{post.quickAnswer}</p>}
              {post.keyTakeaways.length > 0 && <ul>{post.keyTakeaways.map(item => <li key={item}><Check size={16} />{item}</li>)}</ul>}
            </section>}
            <div className="post-body"><PortableText value={post.body} components={bodyComponents(root)} /></div>
            {post.faqs.length > 0 && <section className="post-faqs" id="questions" aria-labelledby="questions-heading">
              <h2 id="questions-heading">Questions &amp; answers</h2>
              {post.faqs.map(faq => <div key={faq._key} className="post-faq"><h3>{faq.question}</h3><p>{faq.answer}</p></div>)}
            </section>}
            {shop.owner && <aside className="author-card" aria-label="About the author">
              <img src={logo} alt="" width="64" height="64" />
              <div><p className="eyebrow">Written by</p><p className="author-name">{shop.owner}</p>{shop.ownerBio && <p>{shop.ownerBio}</p>}<a className="text-link" href={shop.url} target="_blank" rel="noopener noreferrer">Visit {shop.name} on Etsy<ArrowUpRight size={15} /></a></div>
            </aside>}
          </div>
        </div>
      </div>

      <PatternBand root={root} patterns={post.patterns} heading={<>Patterns to <em>try next.</em></>} />

      {more.length > 0 && <section className="keep-reading shell" aria-labelledby="keep-reading-heading">
        <h2 id="keep-reading-heading" className="blog-section-title">Keep reading</h2>
        <div className="post-grid">{more.map(item => <PostCard key={item.slug} root={root} post={item} />)}</div>
        <a className="text-link" href={`${root}blog/`}><ArrowLeft size={15} />All journal guides</a>
      </section>}
    </article>
  </Layout>;
}

export function BlogNotFound({ root, shop }) {
  return <Layout root={root} shop={shop}>
    <section className="blog-hero shell"><div><p className="eyebrow">The journal</p><h1>We couldn’t find <em>that guide.</em></h1></div><div className="blog-hero-aside"><p>It may have been moved or renamed. <a href={`${root}blog/`}>See all journal guides</a>.</p></div></section>
  </Layout>;
}
