import { motion } from 'framer-motion'
import React from 'react'

interface Props {
  children: React.ReactNode
  delay?: number
  y?: number
  className?: string
}

export default function FadeIn({ children, delay = 0, y = 24, className = '' }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
