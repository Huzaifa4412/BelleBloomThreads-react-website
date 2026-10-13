import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, MotionConfig, useReducedMotion } from 'motion/react';
import { ArrowRight, ArrowUpRight, Check, DownloadSimple, FilePdf, Flower, Heart, List, MagnifyingGlass, Needle, X } from '@phosphor-icons/react';
import Brand from './components/Brand';
import Reveal from './components/Reveal';
import ProductCard from './components/ProductCard';
import ProductDialog from './components/ProductDialog';
import InfoDialog from './components/InfoDialog';
import { latestPosts, loadFavorites, money, priceFor, products, saleActive, shop } from './data/catalog';
import { filterCatalog } from './data/collection';

const categories = ['All patterns', 'Sweaters', 'Cardigans'];
const featured = (id) => products.find(product => product.id === id) ?? products[0];
const faqs = [
  { question: 'Am I buying a finished sweater?', answer: 'You are buying a digital crochet pattern PDF to make the design yourself. No finished garment, yarn, hook, or physical kit will be shipped.' },
  { question: 'How do I receive my pattern?', answer: 'Complete your purchase on Etsy. Once payment is confirmed, open Etsy.com in a computer or mobile browser, go to Purchases, and choose Download Files. Use a browser rather than the Etsy shopping app to download your PDF.' },
  { question: 'Which skill level are these patterns for?', answer: 'Violet Bloom, Autumn Mosaic, and Golden Chevron are listed as intermediate projects. Purple Blossom does not state an exact skill level; check the PDF preview or contact Olivia. Golden Chevron is a design guide with unverified sizing and some unfinished stitch counts—read its product note before purchasing.' },
  { question: 'How do I choose a size and yarn?', answer: 'The listings show XS–3XL designs. Use the finished garment measurements and gauge in your PDF to choose a size. Golden Chevron sizing is proposed and unverified. Yarn and hook requirements vary by design; Autumn Mosaic lists #4 worsted yarn and a 5.0 mm hook, adjusted as needed for gauge.' },
  { question: 'Can I sell pieces I make from a pattern?', answer: 'Check the usage terms on the individual Etsy listing. Violet Bloom permits small quantities of finished handmade cardigans, with designer credit appreciated. For other designs, contact BelleBloomThreads to confirm permission. The PDF instructions and charts may not be shared or resold.' },
  { question: 'What if I need help with my download?', answer: 'Visit BelleBloomThreads on Etsy and use Contact to message Olivia. Purchase terms, digital download policies, and any order support are handled through the Etsy shop.' },
];

function App() {
  const [category, setCategory] = useState('All patterns');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('studio');
  const [favorites, setFavorites] = useState(loadFavorites);
  const [savedOnly, setSavedOnly] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [activeProduct, setActiveProduct] = useState(null);
  const [privacy, setPrivacy] = useState(false);
  const [toast, setToast] = useState('');
  const toastTimer = useRef(null);
  const reduced = useReducedMotion();
  const blossom = featured('purple-blossom');
  const autumn = featured('autumn-mosaic');
  const violet = featured('violet-bloom');
  const violetDetail = violet.images[1] ?? violet.images[0];
  const autumnDetail = autumn.images[1] ?? autumn.images[0];

  useEffect(() => {
    try { localStorage.setItem('belle-bloom-favorites', JSON.stringify(favorites)); } catch { /* Saving is optional when browser storage is unavailable. */ }
  }, [favorites]);
  useEffect(() => () => clearTimeout(toastTimer.current), []);

  const visibleProducts = useMemo(() => filterCatalog(products, { category, query, sort, favorites, savedOnly }, priceFor), [category, query, sort, favorites, savedOnly]);

  function notify(message) {
    clearTimeout(toastTimer.current);
    setToast(message);
    toastTimer.current = setTimeout(() => setToast(''), 2800);
  }
  function toggleFavorite(id) {
    const exists = favorites.includes(id);
    setFavorites(current => exists ? current.filter(item => item !== id) : [...current, id]);
    notify(exists ? 'Pattern removed from your saved projects.' : 'A lovely project saved for later.');
  }
  function resetFilters() { setCategory('All patterns'); setQuery(''); setSavedOnly(false); setSort('studio'); }
  function showSaved() {
    setSavedOnly(current => !current); setCategory('All patterns'); setQuery(''); setMobileMenu(false);
    document.getElementById('patterns')?.scrollIntoView({ behavior: reduced ? 'instant' : 'smooth' });
  }
  function focusSearch() {
    setMobileMenu(false);
    document.getElementById('patterns')?.scrollIntoView({ behavior: reduced ? 'instant' : 'smooth' });
    document.getElementById('pattern-search')?.focus({ preventScroll: true });
  }
  const activeSale = saleActive();

  return <MotionConfig reducedMotion="user" transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}>
    <a className="skip-link" href="#main">Skip to content</a>
    <div className="announcement"><a href="#patterns">{activeSale ? 'A little treat: 40% off all patterns on Etsy' : 'Beautiful crochet patterns, ready for your next make'}<ArrowRight size={14} /></a><span className="hidden md:inline">Digital patterns. Handmade possibilities.</span></div>
    <header className="site-header">
      <div className="shell header-inner flex items-center justify-between gap-3">
        <Brand />
        <nav className="hidden items-center gap-7 lg:flex" aria-label="Main navigation"><a href="#patterns" onClick={resetFilters}>The patterns</a><a href="#story">Our little studio</a><a href="#how-it-works">How it works</a><a href="./blog/">The journal</a></nav>
        <div className="flex items-center gap-1 sm:gap-3">
          <button className="icon-button" aria-label="Search patterns" onClick={focusSearch}><MagnifyingGlass size={21} /></button>
          <button className={`icon-button saved-header ${savedOnly ? 'active' : ''}`} onClick={showSaved} aria-label={`Show saved patterns (${favorites.length})`} aria-pressed={savedOnly}><Heart size={21} weight={savedOnly ? 'fill' : 'regular'} />{favorites.length > 0 && <span className="saved-count">{favorites.length}</span>}</button>
          <a href={shop.url} target="_blank" rel="noopener noreferrer" className="etsy-header hidden sm:inline-flex">Visit our Etsy<ArrowUpRight size={17} /></a>
          <button className="icon-button lg:hidden" onClick={() => setMobileMenu(current => !current)} aria-label={mobileMenu ? 'Close navigation' : 'Open navigation'} aria-expanded={mobileMenu} aria-controls="mobile-menu">{mobileMenu ? <X size={22} /> : <List size={22} />}</button>
        </div>
      </div>
      <AnimatePresence>{mobileMenu && <motion.nav id="mobile-menu" aria-label="Mobile navigation" className="mobile-menu shell" initial={{ opacity: 0, y: reduced ? 0 : -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} onKeyDown={event => { if (event.key === 'Escape') setMobileMenu(false); }}>
        <a href="#patterns" onClick={() => { resetFilters(); setMobileMenu(false); }}>The patterns<ArrowUpRight size={18} /></a><a href="#story" onClick={() => setMobileMenu(false)}>Our little studio<ArrowUpRight size={18} /></a><a href="#how-it-works" onClick={() => setMobileMenu(false)}>How it works<ArrowUpRight size={18} /></a><a href="./blog/">The journal<ArrowUpRight size={18} /></a><a href={shop.url} target="_blank" rel="noopener noreferrer" onClick={() => setMobileMenu(false)}>Visit our Etsy shop<ArrowUpRight size={18} /></a>
      </motion.nav>}</AnimatePresence>
    </header>

    <main id="main">
      <section id="home" className="hero shell" aria-labelledby="hero-heading">
        <div className="hero-copy">
          <Reveal><p className="eyebrow flex items-center gap-2"><span className="little-star">✳</span> For the love of making</p></Reveal>
          <Reveal delay={0.08}><h1 id="hero-heading">Made to<br /><em>bloom.</em><br />Made by you.</h1></Reveal>
          <Reveal delay={0.16}><p className="hero-description">Beautiful crochet patterns for a wardrobe<br className="hidden xl:block" /> that feels a little more like you.</p><div className="hero-actions"><a href="#patterns" className="button button-primary">Find your next make<ArrowRight size={20} /></a><span className="hero-small-note"><FilePdf size={16} /> Instant PDF downloads</span></div></Reveal>
          <Reveal delay={0.24}><div className="hero-bottom"><div className="swatch-row"><span className="swatch swatch-purple" /><span className="swatch swatch-rose" /><span className="swatch swatch-linen" /><span className="swatch swatch-olive" /></div><span>Your colors. Your stitches. Your story.</span><svg className="thread-doodle" width="92" height="48" viewBox="0 0 92 48" fill="none" aria-hidden="true"><path d="M2 33c13 18 32 10 34-5 2-18-22-15-14-1 12 20 49 5 66-22M78 6l10-2-1 12" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" /></svg></div></Reveal>
        </div>
        <Reveal className="hero-art" delay={0.15}>
          <div className="hero-photo-frame"><img src={blossom.images[0].src} alt={blossom.images[0].alt} width="794" height="794" fetchPriority="high" className="hero-photo" /><div className="hero-photo-label"><span>Purple Blossom</span><button onClick={() => setActiveProduct(blossom)} aria-label="Explore Purple Blossom sweater"><ArrowUpRight size={22} /></button></div></div>
          <motion.div className="bloom-seal" whileHover={{ rotate: reduced ? 0 : 12 }} transition={{ type: 'spring', stiffness: 120, damping: 14 }}><span>A little yarn</span><Flower size={31} weight="light" /><span>A lot of joy</span></motion.div>
          <button className="hero-inset" onClick={() => setActiveProduct(autumn)} aria-label="Explore Autumn Mosaic cardigan"><img src={autumn.images[0].src} alt={autumn.images[0].alt} width="794" height="794" /><span>Another color story<ArrowUpRight size={15} /></span></button>
          <span className="hero-margin-note">THE HANDMADE WARDROBE COLLECTION / 01</span>
        </Reveal>
      </section>

      <div className="benefit-strip"><div className="shell flex flex-wrap items-center justify-between gap-x-6 gap-y-4"><span><DownloadSimple size={21} /> Instant digital downloads</span><span><Needle size={21} /> Made for your creative time</span><span><FilePdf size={21} /> Patterns to keep & revisit</span><span className="benefit-final"><Flower size={21} /> A wardrobe made by you</span></div></div>

      <section id="patterns" className="shop-section shell" aria-labelledby="collection-heading">
        <Reveal className="section-heading"><div><p className="eyebrow">Your next favorite project</p><h2 id="collection-heading">A little collection.<br className="sm:hidden" /> <em>So much possibility.</em></h2></div><p>Floral details. Statement sleeves.<br />Pieces you’ll love to make your own.</p></Reveal>
        <div className="shop-toolbar">
          <div className="category-tabs" role="group" aria-label="Filter patterns by category">{categories.map(item => <button key={item} onClick={() => { setCategory(item); setSavedOnly(false); }} aria-pressed={!savedOnly && category === item} className={!savedOnly && category === item ? 'selected' : ''}>{item}<span>{item === 'All patterns' ? products.length : products.filter(p => p.category === item).length}</span>{!savedOnly && category === item && <motion.span className="tab-underline" layoutId="category-underline" />}</button>)}<button onClick={showSaved} aria-pressed={savedOnly} className={savedOnly ? 'selected saved-tab' : 'saved-tab'}><Heart size={15} />Saved<span>{favorites.length}</span>{savedOnly && <motion.span className="tab-underline" layoutId="category-underline" />}</button></div>
          <div className="search-sort flex items-center gap-3"><label className="search-field"><MagnifyingGlass size={17} /><span className="sr-only">Search crochet patterns</span><input id="pattern-search" type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Find a pattern…" /></label><label className="sort-field"><span className="sr-only">Sort patterns</span><select value={sort} onChange={event => setSort(event.target.value)} aria-label="Sort patterns"><option value="studio">Studio picks</option><option value="newest">Newest first</option><option value="name">Name: A–Z</option><option value="price-low">Price: low to high</option><option value="price-high">Price: high to low</option></select></label></div>
        </div>
        <div className="collection-status"><p role="status" aria-live="polite">{visibleProducts.length} {visibleProducts.length === 1 ? 'pattern' : 'patterns'}{savedOnly ? ' saved for later' : ' to make your own'}{query.trim() && ` matching “${query.trim()}”`}</p>{(savedOnly || category !== 'All patterns' || query) && <button onClick={resetFilters}>Clear filters<X size={13} /></button>}</div>
        <motion.div className="product-grid grid grid-cols-2 gap-x-5 gap-y-9 lg:grid-cols-4 lg:gap-x-6" layout={!reduced}><AnimatePresence mode="popLayout">{visibleProducts.map((product, index) => <ProductCard key={product.id} product={product} index={index} saved={favorites.includes(product.id)} onSave={toggleFavorite} onOpen={setActiveProduct} />)}</AnimatePresence></motion.div>
        {visibleProducts.length === 0 && <div className="empty-state"><Flower size={43} weight="light" /><h3>{savedOnly && favorites.length === 0 ? 'Your next project is waiting.' : 'No patterns here just yet.'}</h3><p>{savedOnly && favorites.length === 0 ? 'Tap the little heart on any pattern to keep it close.' : 'Try another search, or browse the full collection.'}</p><button className="button button-outline" onClick={resetFilters}>Browse all patterns<ArrowRight size={18} /></button></div>}
        <div className="collection-bottom"><span><Check size={15} /> Every listing is a digital PDF, not a finished garment.</span><a href={shop.url} target="_blank" rel="noopener noreferrer" className="text-link">See the collection on Etsy<ArrowUpRight size={16} /></a></div>
      </section>

      <section className="featured-section" aria-labelledby="featured-heading"><div className="featured-inner shell">
        <Reveal className="featured-photo"><img src={violetDetail.src} alt={violetDetail.alt} width="794" height="794" loading="lazy" /><span className="editorial-tag">The art of the little details</span></Reveal>
        <Reveal className="featured-copy"><p className="eyebrow">In full bloom</p><h2 id="featured-heading">A garden.<br />A cardigan.<br /><em>All your own.</em></h2><p>Three-dimensional flowers, curling vines, and a rich violet backdrop. Meet Violet Bloom—a romantic little addition to your handmade wardrobe.</p><div className="featured-specs"><span>16-page PDF</span><span>Intermediate</span><span>XS–3XL</span></div><button className="button button-primary" onClick={() => setActiveProduct(violet)}>Meet Violet Bloom<ArrowUpRight size={19} /></button><span className="featured-price">Pattern from {money(priceFor(violet))} USD</span><Flower className="feature-flower" size={114} weight="thin" aria-hidden="true" /></Reveal>
      </div></section>

      <section id="how-it-works" className="how-section shell" aria-labelledby="how-heading"><Reveal className="how-heading"><p className="eyebrow">From inspiration to your first stitch</p><h2 id="how-heading">Find it. Download it.<br /><em>Make it yours.</em></h2><p>A lovely project is just a few stitches away.</p></Reveal><div className="steps-grid">{[
        { number: '01', title: 'Find your kind of lovely', copy: 'Choose the colors, details, and silhouette that speak to you. Check the skill level and pattern notes before you start.', icon: Heart },
        { number: '02', title: 'Your pattern, ready to keep', copy: 'Purchase on Etsy and download your PDF through your browser once payment is confirmed. It’s yours to revisit.', icon: DownloadSimple },
        { number: '03', title: 'A little creative time', copy: 'Gather your yarn, check your gauge, and settle in. One stitch at a time, something beautiful takes shape.', icon: Needle },
      ].map((step, index) => <Reveal key={step.number} delay={index * 0.08} className="step"><div className="step-top"><span>{step.number}</span><step.icon size={25} weight="light" /></div><h3>{step.title}</h3><p>{step.copy}</p></Reveal>)}</div></section>

      <section id="story" className="story-section shell" aria-labelledby="story-heading"><Reveal className="story-visual"><div className="story-photo"><img src={autumnDetail.src} alt={autumnDetail.alt} width="794" height="794" loading="lazy" /></div><div className="story-note"><Flower size={25} weight="light" /><span>Thoughtful details.<br />Joyful making.</span></div></Reveal><Reveal className="story-copy"><p className="eyebrow">Hello, from our little studio</p><h2 id="story-heading">Beautiful yarn.<br />Thoughtful details.<br /><em>A little Belle Bloom.</em></h2><p>I’m Olivia, the creative mind behind BelleBloomThreads. This is a little corner for crochet lovers, colorful ideas, and the joy of making something with your own hands.</p><p>From the first loop to the final stitch, every project is a chance to create something cozy and uniquely yours. I hope these patterns bring fresh inspiration to your creative time.</p><span className="signature">With love, Olivia</span><a className="text-link" href={`${shop.url}#about`} target="_blank" rel="noopener noreferrer">A little more about our shop<ArrowUpRight size={17} /></a></Reveal></section>

      {latestPosts.length > 0 && <section id="journal" className="journal-section shell" aria-labelledby="journal-heading">
        <Reveal className="section-heading"><div><p className="eyebrow">From the journal</p><h2 id="journal-heading">Guides for your <em>next make.</em></h2></div><a href="./blog/" className="text-link">Read all guides<ArrowRight size={15} /></a></Reveal>
        <div className="post-grid">{latestPosts.map(post => <Reveal key={post.slug}><article className="post-card">
          {post.image && <a className="post-card-photo" href={`./blog/${post.slug}/`} tabIndex={-1} aria-hidden="true"><img src={post.image} alt="" width="720" height="540" loading="lazy" /></a>}
          {post.category && <p className="post-tag">{post.category}</p>}
          <h3><a href={`./blog/${post.slug}/`}>{post.title}</a></h3>
          <p>{post.excerpt}</p>
          <p className="post-meta"><time dateTime={post.publishedAt}>{post.date}</time></p>
        </article></Reveal>)}</div>
      </section>}

      <section id="help" className="faq-section shell" aria-labelledby="faq-heading"><Reveal><p className="eyebrow">A few helpful things</p><h2 id="faq-heading">Before you<br /><em>pick up your hook.</em></h2><p>Have another question?</p><a href={shop.url} target="_blank" rel="noopener noreferrer" className="text-link">Contact Olivia on Etsy<ArrowUpRight size={16} /></a></Reveal><div className="faq-list">{faqs.map(faq => <details key={faq.question}><summary>{faq.question}<span className="faq-plus" aria-hidden="true">+</span></summary><p>{faq.answer}</p></details>)}</div></section>

      <section className="closing-note shell"><Reveal><Flower size={32} weight="light" /><p className="eyebrow">For the joy of making</p><h2>A pattern today.<br /><em>A favorite for years.</em></h2><a href={shop.url} target="_blank" rel="noopener noreferrer" className="button button-primary">Explore BelleBloomThreads on Etsy<ArrowUpRight size={18} /></a><p className="closing-small">A little inspiration. A little yarn. Something entirely yours.</p></Reveal></section>
    </main>

    <footer className="site-footer"><div className="shell"><div className="footer-top"><div><Brand footer /><p>Beautiful crochet patterns, made to bloom.</p></div><nav aria-label="Footer navigation"><a href="#patterns">The patterns</a><a href="#story">Our studio</a><a href="./blog/">The journal</a><a href="#help">Pattern help</a><a href={`${shop.url}#policies`} target="_blank" rel="noopener noreferrer">Shop policies<ArrowUpRight size={12} /></a><button onClick={() => setPrivacy(true)}>Privacy</button></nav><a className="footer-etsy" href={shop.url} target="_blank" rel="noopener noreferrer">Find us on <span>Etsy<ArrowUpRight size={21} /></span></a></div><div className="footer-bottom"><span>© {new Date().getFullYear()} BelleBloomThreads</span><span>Digital patterns · Purchases & downloads through Etsy</span><span>USD $</span></div>{favorites.length > 0 && <button className="clear-saved" onClick={() => { setFavorites([]); notify('Your saved patterns have been cleared.'); }}>Clear saved patterns ({favorites.length})</button>}</div></footer>
    <AnimatePresence>{activeProduct && <ProductDialog key={activeProduct.id} product={activeProduct} onClose={() => setActiveProduct(null)} saved={favorites.includes(activeProduct.id)} onSave={toggleFavorite} />}</AnimatePresence>
    {privacy && <InfoDialog onClose={() => setPrivacy(false)} />}
    <div className="toast-container" role="status" aria-live="polite"><AnimatePresence>{toast && <motion.div className="toast" initial={{ opacity: 0, y: reduced ? 0 : 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}><Heart size={16} />{toast}</motion.div>}</AnimatePresence></div>
  </MotionConfig>;
}

export default App;
