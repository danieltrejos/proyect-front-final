"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";

// Componente que maneja los search params
function WelcomeMessage() {
  const searchParams = useSearchParams();
  const welcome = searchParams.get("welcome");

  if (!welcome) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="flex items-center justify-center gap-3 text-green-600 dark:text-green-400"
    >
      <CheckCircle className="w-6 h-6" />
      <span className="text-lg font-semibold">¡Sesión iniciada correctamente!</span>
    </motion.div>
  );
}

// Componente principal de carga
function SplashContent() {
  const [progress, setProgress] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          router.push("/overview");
          return 100;
        }
        return prev + 2;
      });
    }, 80);

    return () => clearInterval(interval);
  }, [router]);
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="text-center space-y-8">
        {/* Logo */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="flex justify-center"
        >
          <div className="w-24 h-24 rounded-2xl shadow-2xl overflow-hidden">
            <img
              src="/logo_oficial.png"
              alt="Brewsy Logo"
              className="w-full h-full object-cover"
            />
          </div>
        </motion.div>

        {/* Mensaje de bienvenida */}
        <Suspense fallback={null}>
          <WelcomeMessage />
        </Suspense>

        {/* Título */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Bienvenido a Brewsy
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Cargando tu dashboard...
          </p>
        </motion.div>

        {/* Barra de progreso */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="w-80 max-w-full mx-auto"
        >
          <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-amber-500 to-orange-600 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.1 }}
            />
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            {progress}% completado
          </p>
        </motion.div>
      </div>
    </div>
  );
}

export default function SplashPage() {
  return <SplashContent />;
}
