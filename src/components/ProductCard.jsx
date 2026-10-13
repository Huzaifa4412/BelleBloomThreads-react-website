import { ArrowUpRight, Heart, FilePdf } from '@phosphor-icons/react';
import { motion, useReducedMotion } from 'motion/react';
import { money, priceFor, saleActive } from '../data/catalog';

export default function ProductCard({ product, saved, onSave, onOpen, index }) {
  const reduced = useReducedMotion();
  return <motion.article layout={!reduced} className="product-card min-w-0" initial={{ opacity: reduced ? 1 : 0, y: reduced ? 0 : 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.08 }} exit={{ opacity: 0 }} transition={{ duration: reduced ? 0 : 0.4, delay: index * 0.04 }}>
    <div className="product-photo group relative overflow-hidden">
      <button onClick={() => onOpen(product)} className="block h-full w-full" aria-label={`View ${product.name} details`}>
        <img src={product.images[0].src} alt={product.images[0].alt} loading="lazy" width="794" height="794" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.035]" />
        <span className="photo-cta">Explore this pattern <ArrowUpRight size={18} /></span>
      </button>
      <span className="product-format absolute left-3 top-3 inline-flex items-center gap-1.5"><FilePdf size={14} /> PDF pattern</span>
      <motion.button whileTap={{ scale: reduced ? 1 : 0.85 }} className={`save-button absolute right-3 top-3 ${saved ? 'is-saved' : ''}`} onClick={() => onSave(product.id)} aria-label={`${saved ? 'Unsave' : 'Save'} ${product.name}`} aria-pressed={saved}><Heart size={18} weight={saved ? 'fill' : 'regular'} /></motion.button>
    </div>
    <div className="pt-4">
      <p className="product-motif">{product.motif}</p>
      <button onClick={() => onOpen(product)} className="product-name text-left">{product.name}<ArrowUpRight className="shrink-0" size={18} /></button>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-muted"><span>{product.status || `${product.level || 'Granny-square project'} · ${product.sizes}`}</span></div>
      <div className="mt-3 flex flex-wrap items-center gap-2"><strong className="text-sm font-semibold">{money(priceFor(product))}</strong>{saleActive() && <><s className="text-xs text-muted">{money(product.regularPrice)}</s><span className="sale-label">40% off</span></>}</div>
    </div>
  </motion.article>;
}
