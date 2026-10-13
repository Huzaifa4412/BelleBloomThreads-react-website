import { motion, useReducedMotion } from 'motion/react';

export default function Reveal({ children, className = '', delay = 0, ...props }) {
  const reduced = useReducedMotion();
  return <motion.div className={className} initial={{ opacity: reduced ? 1 : 0, y: reduced ? 0 : 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.12 }} transition={{ duration: reduced ? 0 : 0.65, delay, ease: [0.22, 1, 0.36, 1] }} {...props}>{children}</motion.div>;
}
