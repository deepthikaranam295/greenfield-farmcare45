import { motion } from 'framer-motion'

export default function WhatsAppButton() {
  return (
    <motion.a
      href="https://wa.me/919945100567?text=Hi%2C%20I%20want%20to%20know%20more%20about%20GreenField%20Farm%20Care"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-[#25D366] rounded-full flex items-center justify-center shadow-xl hover:scale-110 active:scale-95 transition-transform duration-200"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 1, type: 'spring', stiffness: 260, damping: 20 }}
    >
      <svg viewBox="0 0 32 32" className="w-8 h-8 fill-white">
        <path d="M16 2C8.28 2 2 8.28 2 16c0 2.44.65 4.73 1.78 6.72L2 30l7.5-1.74A13.93 13.93 0 0 0 16 30c7.72 0 14-6.28 14-14S23.72 2 16 2zm0 25.5c-2.18 0-4.23-.6-5.99-1.64l-.43-.26-4.45 1.03 1.06-4.33-.28-.45A11.45 11.45 0 0 1 4.5 16c0-6.34 5.16-11.5 11.5-11.5S27.5 9.66 27.5 16 22.34 27.5 16 27.5zM22.5 19.1c-.34-.17-2-.98-2.31-1.09-.31-.11-.54-.17-.77.17-.22.34-.87 1.09-1.07 1.31-.2.22-.39.25-.73.08-.34-.17-1.43-.53-2.73-1.68-1.01-.9-1.69-2.01-1.89-2.35-.2-.34-.02-.52.15-.69.15-.15.34-.39.51-.59.17-.2.22-.34.34-.56.11-.22.06-.42-.03-.59-.08-.17-.77-1.85-1.05-2.53-.28-.67-.56-.58-.77-.59H10.9c-.22 0-.59.08-.9.42-.31.34-1.17 1.14-1.17 2.79s1.2 3.23 1.37 3.46c.17.22 2.36 3.6 5.72 5.05.8.34 1.42.55 1.91.7.8.25 1.53.22 2.11.13.64-.1 2-.82 2.28-1.61.28-.79.28-1.47.2-1.61-.08-.14-.3-.22-.64-.39z"/>
      </svg>
    </motion.a>
  )
}
