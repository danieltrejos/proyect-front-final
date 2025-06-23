"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"

interface SplashScreenProps {
  duration?: number
  logoSrc?: string
  redirectPath?: string
}

export default function SplashScreen({
  duration = 5000,
  logoSrc = "/logo.svg",
  redirectPath = "/home",
}: SplashScreenProps) {
  const [showSplash, setShowSplash] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false)

      // Add a small delay before redirecting to allow exit animation to complete
      setTimeout(() => {
        router.push(redirectPath)
      }, 1000)
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, redirectPath, router])

  return (<AnimatePresence mode="wait">
    {showSplash && (
      <motion.div
        className="fixed inset-0 flex items-center justify-center bg-background z-50"
        initial={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 1, ease: "easeInOut" }}
      >        <motion.div
        className="relative flex items-center justify-center w-32 h-32 rounded-full bg-background shadow-[0_0_30px_rgba(255,255,255,0.2)]"
        animate={{
          scale: [1, 1.1, 1],
          boxShadow: [
            "0 0 30px rgba(255,255,255,0.2)",
            "0 0 40px rgba(255,255,255,0.4)",
            "0 0 30px rgba(255,255,255,0.2)",
          ],
        }}
        transition={{
          duration: 1.5,
          repeat: Number.POSITIVE_INFINITY,
          repeatType: "loop",
          ease: "easeInOut",
        }}
      >
          <motion.img
            src={logoSrc}
            alt="Logo"
            className="w-full h-auto object-contain"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          />
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
  )
}
