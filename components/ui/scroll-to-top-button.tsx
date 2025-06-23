'use client'

import { ChevronUp } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useScrollToTop } from '@/hooks/use-scroll-to-top'

interface ScrollToTopButtonProps {
  threshold?: number
  className?: string
}

export function ScrollToTopButton({ threshold = 400, className = '' }: ScrollToTopButtonProps) {
  const { showScrollToTop, scrollToTop } = useScrollToTop(threshold)

  return (
    <AnimatePresence>
      {showScrollToTop && (
        <motion.button
          onClick={scrollToTop}
          className={`fixed bottom-6 right-6 z-50 bg-primary text-primary-foreground p-3 rounded-full shadow-lg hover:bg-primary/90 transition-colors ${className}`}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          aria-label="Volver arriba"
        >
          <ChevronUp className="w-6 h-6" />
        </motion.button>
      )}
    </AnimatePresence>
  )
}
