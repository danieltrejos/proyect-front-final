"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

interface SplashScreenProps {
  duration?: number;
  logoSrc?: string;
  redirectPath?: string;
  welcomeMessage?: boolean;
}

export default function SplashScreen({
  duration = 3000,
  logoSrc = "/logo.svg",
  redirectPath = "/dashboard",
  welcomeMessage = false,
}: SplashScreenProps) {
  const [showSplash, setShowSplash] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    // Mostrar el mensaje de bienvenida al inicio del splash screen
    if (welcomeMessage) {
      toast({
        title: "¡Bienvenido!",
        description: "Has iniciado sesión correctamente.",
        duration: duration, // El toast durará lo mismo que el splash screen
      });
    }

    const timer = setTimeout(() => {
      setShowSplash(false);
      router.replace(redirectPath);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, redirectPath, router, welcomeMessage, toast]);
  return (
    <AnimatePresence mode="wait">
      {showSplash && (
        <motion.div
          className="fixed inset-0 flex items-center justify-center bg-gradient-to-b from-black to-zinc-900 z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="relative w-full max-w-screen-xl mx-auto px-4 flex flex-col items-center">
            {/* Logo Container con efecto de brillo */}
            <motion.div
              className="relative"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              {/* Efecto de brillo detrás del logo */}
              <motion.div
                className="absolute inset-0 bg-gradient-radial from-zinc-400/20 to-transparent rounded-full blur-xl"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 0.8, 0.5],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatType: "reverse",
                  ease: "easeInOut",
                }}
              />
              {/* Logo con contenedor esférico */}
              <motion.div
                className="relative z-10 w-40 h-40 rounded-full bg-gradient-to-br from-zinc-900 to-black backdrop-blur-lg 
                         border border-zinc-800/50 shadow-[0_0_30px_rgba(255,255,255,0.1)] 
                         flex items-center justify-center overflow-hidden
                         before:content-[''] before:absolute before:inset-0 before:bg-gradient-to-tr before:from-zinc-500/10 before:to-transparent before:rounded-full"
                animate={{
                  boxShadow: [
                    "0 0 30px rgba(255,255,255,0.1)",
                    "0 0 50px rgba(255,255,255,0.2)",
                    "0 0 30px rgba(255,255,255,0.1)",
                  ],
                }}
                transition={{
                  boxShadow: {
                    duration: 2,
                    repeat: Infinity,
                    repeatType: "reverse",
                  },
                }}
              >
                {/* Borde decorativo estático */}
                <div className="absolute w-[calc(100%+4px)] h-[calc(100%+4px)] rounded-full border-t border-l border-zinc-600/20" />

                {/* Logo */}
                <motion.div
                  className="relative z-10 w-28 h-28 rounded-full flex items-center justify-center
                           bg-gradient-to-br from-zinc-800/50 to-black/50 backdrop-blur-sm"
                  animate={{
                    scale: [0.95, 1.05, 0.95],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <motion.img
                    src={logoSrc}
                    alt="Logo"
                    className="w-24 h-24 object-contain"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                  />
                </motion.div>
              </motion.div>
            </motion.div>

            {/* Barra de progreso */}
            <motion.div
              className="w-48 h-1 bg-zinc-800 rounded-full mt-8 overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <motion.div
                className="h-full bg-gradient-to-r from-zinc-500 to-zinc-300"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: duration / 1000, ease: "linear" }}
              />
            </motion.div>

            {/* Texto de carga */}
            <motion.p
              className="text-zinc-400 text-sm mt-4 font-light tracking-wider"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              Cargando...
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
