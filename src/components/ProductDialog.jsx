import { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { ArrowLeft, ArrowRight, ArrowUpRight, Check, DownloadSimple, Heart, Play, X, FilePdf } from '@phosphor-icons/react';
import { money, priceFor, saleActive } from '../data/catalog';

export default function ProductDialog({ product, onClose, saved, onSave }) {
  const dialogRef = useRef(null);
  const [photo, setPhoto] = useState(0);
  const reduced = useReducedMotion();
  useEffect(() => {
    const dialog = dialogRef.current;
    const previousOverflow = document.body.style.overflow;
    dialog.showModal();
    document.body.style.overflow = 'hidden';
    return () => { dialog.close(); document.body.style.overflow = previousOverflow; };
  }, []);
  const media = product.video ? [product.images[0], { ...product.video, isVideo: true }, ...product.images.slice(1)] : product.images;
  const current = media[photo];
  const changePhoto = (direction) => setPhoto(index => (index + direction + media.length) % media.length);
  return <dialog ref={dialogRef} className="pattern-dialog" aria-labelledby="pattern-title" onCancel={event => { event.preventDefault(); onClose(); }} onClick={event => { if (event.target === event.currentTarget) onClose(); }}>
    <motion.div className="dialog-content" initial={{ opacity: reduced ? 1 : 0, y: reduced ? 0 : 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: reduced ? 0 : 10 }} transition={{ duration: reduced ? 0 : 0.2 }}>
      <button className="icon-button dialog-close" onClick={onClose} aria-label="Close pattern details" autoFocus><X size={22} /></button>
      <div className="dialog-gallery">
        <div className="relative overflow-hidden rounded-sm bg-linen">
          {current.isVideo
            ? <video key={photo} src={current.src} poster={current.poster} aria-label={current.alt} className="aspect-square w-full object-contain" controls muted loop playsInline autoPlay={!reduced} preload="metadata" />
            : <motion.img key={photo} src={current.src} alt={current.alt} width="794" height="794" className="aspect-square w-full object-contain" initial={{ opacity: reduced ? 1 : 0.5 }} animate={{ opacity: 1 }} />}
          <div className={`gallery-arrows ${current.isVideo ? 'above-controls' : ''}`}><button className="icon-button" onClick={() => changePhoto(-1)} aria-label={product.video ? 'Previous photo or video' : 'Previous product photo'}><ArrowLeft size={20} /></button><span aria-live="polite">{photo + 1} / {media.length}</span><button className="icon-button" onClick={() => changePhoto(1)} aria-label={product.video ? 'Next photo or video' : 'Next product photo'}><ArrowRight size={20} /></button></div>
        </div>
        <div className="mt-3 flex gap-2" aria-label="Product gallery thumbnails">{media.map((item, index) => <button key={item.src} className={`gallery-thumb ${photo === index ? 'selected' : ''}`} onClick={() => setPhoto(index)} aria-label={item.isVideo ? `Play video of ${product.name}` : `Show photo ${product.images.indexOf(item) + 1} of ${product.name}`} aria-pressed={photo === index}>{item.thumb && <img src={item.thumb} alt="" width="72" height="72" />}{item.isVideo && <span className="thumb-play"><Play size={18} weight="fill" /></span>}</button>)}</div>
        <p className="mt-4 flex items-center gap-2 text-xs text-muted"><FilePdf size={16} /> Digital crochet pattern. Finished garment shown for inspiration.</p>
      </div>
      <div className="dialog-copy">
        <p className="eyebrow">BelleBloomThreads / {product.category}</p>
        <h2 id="pattern-title" className="font-display text-4xl leading-tight md:text-5xl">{product.name}</h2>
        <p className="mt-4 text-sm leading-relaxed text-muted">{product.description}</p>
        <div className="my-5 flex items-center gap-3"><strong className="font-display text-3xl">{money(priceFor(product))}</strong>{saleActive() && <><s className="text-sm text-muted">{money(product.regularPrice)}</s><span className="sale-label">40% off</span></>}</div>
        <dl className="pattern-specs"><div><dt>Skill level</dt><dd>{product.level || 'Check listing / PDF'}</dd></div><div><dt>Sizes</dt><dd>{product.sizes}</dd></div><div><dt>Format</dt><dd>{product.pages ? `${product.pages}-page PDF` : '1 digital PDF'}</dd></div><div><dt>Terminology</dt><dd>{product.terms || 'Check listing / PDF'}</dd></div></dl>
        {product.note && <p className={`pattern-note ${product.status ? 'guide-note' : ''}`}>{product.note}</p>}
        <a className="button button-primary w-full" href={product.url} target="_blank" rel="noopener noreferrer">{product.status ? 'View design guide on Etsy' : 'Get this pattern on Etsy'}<ArrowUpRight size={20} /></a>
        <button className="dialog-save" onClick={() => onSave(product.id)} aria-pressed={saved}><Heart size={17} weight={saved ? 'fill' : 'regular'} />{saved ? 'Saved to your projects' : 'Save for a later project'}</button>
        <p className="mt-3 text-center text-xs leading-relaxed text-muted">Purchase securely on Etsy. Final price is confirmed at checkout.<br />No finished garment or physical materials are included.</p>
        <section className="detail-section"><h3>Inside your pattern</h3><ul>{product.included.map(item => <li key={item}><Check size={16} />{item}</li>)}</ul></section>
        <section className="detail-section"><h3>Before you begin</h3><p><strong>Yarn:</strong> {product.yarn}</p><p><strong>Hook:</strong> {product.hook}</p><p><strong>Techniques:</strong> {product.techniques}</p><p>Check the finished measurements and make a gauge swatch before choosing your size.</p></section>
        <div className="digital-note"><DownloadSimple size={20} /><p>Your PDF is available through Etsy after payment is confirmed. Open Etsy in a browser and select Purchases → Download Files.</p></div>
      </div>
    </motion.div>
  </dialog>;
}
