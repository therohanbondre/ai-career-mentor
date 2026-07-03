'use client';

import { motion, type MotionProps } from 'framer-motion';

type FadeInProps = MotionProps & {
  children: React.ReactNode;
  className?: string;
};

export function FadeIn({ children, className, ...props }: FadeInProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export { motion };
