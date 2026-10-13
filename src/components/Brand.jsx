import { asset } from '../data/catalog';

export default function Brand({ footer = false, href = '#home', logo = asset('shop-logo.webp') }) {
  return <a href={href} className={`brand flex shrink-0 items-center gap-2.5 ${footer ? 'brand-footer' : ''}`} aria-label="BelleBloomThreads home">
    <img src={logo} width="44" height="44" alt="" className="size-11 rounded-full" />
    <span className="brand-type">Belle Bloom<span className="brand-subtitle">T H R E A D S</span></span>
  </a>;
}
