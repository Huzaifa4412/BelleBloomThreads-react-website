import { useEffect, useRef } from 'react';
import { X } from '@phosphor-icons/react';

export default function InfoDialog({ onClose }) {
  const ref = useRef(null);
  useEffect(() => {
    const dialog = ref.current;
    dialog.showModal();
    return () => dialog.close();
  }, []);
  return <dialog ref={ref} className="info-dialog" aria-labelledby="privacy-heading" onCancel={onClose} onClick={event => { if (event.target === event.currentTarget) onClose(); }}>
    <button className="icon-button dialog-close" onClick={onClose} aria-label="Close privacy information" autoFocus><X size={22} /></button>
    <p className="eyebrow">A little transparency</p><h2 id="privacy-heading" className="font-display text-4xl">Your privacy</h2>
    <p>This website stores your saved pattern IDs in your browser so you can come back to them. Use “Clear saved patterns” below to remove them.</p>
    <p>Your payments, purchases, account, and digital downloads are handled by Etsy. This website does not collect payment details or email addresses.</p>
    <p>Pattern details, photographs and videos are loaded from Sanity, the content service this website uses. Fonts are served locally. No analytics or advertising trackers are included.</p>
    <a className="text-link" href="https://www.etsy.com/legal/privacy/" target="_blank" rel="noopener noreferrer">Read Etsy’s privacy policy ↗</a>
  </dialog>;
}
