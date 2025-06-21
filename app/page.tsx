'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, BarChart3, Package, ShieldCheck, Users, Zap, Globe, CheckCircle, Star, ChevronUp } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'

// Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: "easeOut" }
}

const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { duration: 0.6 }
}

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
}

const scaleOnHover = {
  whileHover: { scale: 1.05 },
  whileTap: { scale: 0.95 },
  transition: { type: "spring", stiffness: 300, damping: 20 }
}

const slideInLeft = {
  initial: { opacity: 0, x: -60 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.6, ease: "easeOut" }
}

const slideInRight = {
  initial: { opacity: 0, x: 60 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.6, ease: "easeOut" }
}

export default function LandingPage() {
  const [showScrollToTop, setShowScrollToTop] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollToTop(window.scrollY > 400)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }

  return (
    <div id="top" className="min-h-screen bg-background scroll-smooth">{/* Header */}
      <motion.header
        className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">          <motion.a
            href="#top"
            className="flex items-center space-x-2 cursor-pointer"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo_oficial-46D02wUcP1RDrjJLGq04ZPBB4PSlQ5.png"
              alt="Brewsy Logo"
              width={64}
              height={64}
              className="w-14 h-14"
            />
            <span className="text-2xl font-bold text-foreground">Brewsy</span>
          </motion.a><nav className="hidden md:flex items-center space-x-8">
            {[
              { name: 'Características', id: 'features' },
              { name: 'Beneficios', id: 'benefits' },
              { name: 'Contacto', id: 'contact' }
            ].map((item, index) => (
              <motion.a
                key={item.name}
                href={`#${item.id}`}
                className="text-muted-foreground hover:text-foreground transition-colors"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                whileHover={{ y: -2 }}
              >
                {item.name}
              </motion.a>
            ))}
          </nav><motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link
              href="/login"
              className="bg-primary text-primary-foreground px-6 py-2 rounded-md font-medium hover:bg-primary/90 transition-colors inline-flex items-center gap-2"
            >
              Iniciar Sesión
              <motion.div
                animate={{ x: [0, 4, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              >
                <ArrowRight className="w-4 h-4" />
              </motion.div>
            </Link>
          </motion.div>
        </div>
      </motion.header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center max-w-5xl">
          <motion.h1
            className="text-5xl md:text-7xl font-bold text-foreground mb-6 leading-tight"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Gestiona tu inventario de
            <motion.span
              className="text-primary block"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              bebidas
            </motion.span>
            de forma inteligente
          </motion.h1>

          <motion.p
            className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto"
            {...fadeInUp}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            Brewsy es una solución SaaS  para bares, licorerías y restaurantes.
            Controla stock, optimiza tus procesos y toma decisiones basadas en datos en tiempo real.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >            <motion.div
            whileHover={{ scale: 1.05, boxShadow: "0 10px 25px rgba(0,0,0,0.1)" }}
            whileTap={{ scale: 0.95 }}
          >
              <Link
                href="/login"
                className="bg-primary text-primary-foreground px-8 py-4 rounded-lg font-semibold text-lg hover:bg-primary/90 transition-colors inline-flex items-center gap-2 shadow-lg"
              >
                Comenzar
                <motion.div
                  animate={{ x: [0, 4, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                  <ArrowRight className="w-5 h-5" />
                </motion.div>
              </Link>
            </motion.div>

            <motion.button
              className="border border-border text-foreground px-8 py-4 rounded-lg font-semibold text-lg hover:bg-accent transition-colors"
              whileHover={{ scale: 1.05, borderColor: "hsl(var(--primary))" }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                href="https://drive.google.com/drive/folders/1SFxybBPXwc_j2yadmy4M7jZpYtNsE5Re?usp=sharing"
                target="_blank"
              >
                Ver Manual
              </Link>

            </motion.button>
          </motion.div>

          <motion.p
            className="text-sm text-muted-foreground mt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            ✓ Prueba gratuita de 7 días • ✓ No requiere tarjeta de crédito
          </motion.p>
        </div>
      </section>

      {/* Dashboard Preview */}
      <motion.section
        className="py-16 px-4 bg-accent/50"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8 }}
      >
        <div className="container mx-auto text-center">
          <motion.h2
            className="text-3xl font-bold text-foreground mb-4"
            {...fadeInUp}
            viewport={{ once: true }}
          >
            Interfaz intuitiva y fluida
          </motion.h2>
          <motion.p
            className="text-muted-foreground mb-8"
            {...fadeInUp}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            Diseñada específicamente para la gestión de inventarios de bebidas para bares y licoreras.
          </motion.p>          <motion.div
            className="bg-card rounded-lg shadow-2xl overflow-hidden max-w-6xl mx-auto"
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
            whileHover={{ scale: 1.02 }}
          >
            <Image
              src="/Interfaz-fluida.png"
              alt="Dashboard de Brewsy mostrando lista de productos"
              width={1200}
              height={800}
              className="w-full h-auto"
              priority
            />
          </motion.div>
        </div>
      </motion.section>      {/* Features Section */}
      <motion.section
        id="features"
        className="py-20 px-4 scroll-mt-20"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8 }}
      >
        <div className="container mx-auto">
          <motion.div
            className="text-center mb-16"
            {...fadeInUp}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Todo lo que necesitas para gestionar tu inventario
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Funcionalidades diseñadas específicamente para el sector de bebidas
            </p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {[
              {
                icon: Package,
                title: "Gestión de Productos",
                description: "Registra, edita y organiza tu inventario de bebidas por tipos y precios."
              },
              {
                icon: BarChart3,
                title: "Control de Stock",
                description: "Monitorea niveles de inventario en tiempo real con alertas automáticas de stock bajo."
              },
              {
                icon: Zap,
                title: "Reabastecimiento Rápido",
                description: "Sistema de reabastecimiento intuitivo para mantener siempre el stock óptimo."
              },
              {
                icon: ShieldCheck,
                title: "Datos Seguros",
                description: "Tu información protegida con respaldos automáticos y seguridad de nivel empresarial."
              },
              {
                icon: Globe,
                title: "Acceso desde cualquier lugar",
                description: "Gestiona tu inventario desde cualquier dispositivo con conexión a internet."
              },
              {
                icon: Users,
                title: "Soporte Especializado",
                description: "Equipo de soporte técnico especializado en el sector de bebidas alcohólicas."
              }
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                className="bg-card p-6 rounded-lg border border-border"
                variants={fadeInUp}
                whileHover={{
                  y: -5,
                  boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                  borderColor: "hsl(var(--primary))"
                }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <motion.div
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <feature.icon className="w-12 h-12 text-primary mb-4" />
                </motion.div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>      {/* Benefits Section */}
      <motion.section
        id="benefits"
        className="py-20 px-4 bg-accent/30 scroll-mt-20"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8 }}
      >
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              variants={slideInLeft}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
            >
              <h2 className="text-4xl font-bold text-foreground mb-6">
                Optimiza tu negocio con Brewsy
              </h2>
              <motion.div
                className="space-y-6"
                variants={staggerContainer}
                initial="initial"
                whileInView="animate"
                viewport={{ once: true }}
              >
                {[
                  {
                    title: "Reduce pérdidas por stock",
                    description: "Evita el exceso o escasez de productos con alertas inteligentes"
                  },
                  {
                    title: "Mejora la toma de decisiones",
                    description: "Datos precisos y en tiempo real para decisiones informadas"
                  },
                  {
                    title: "Ahorra tiempo",
                    description: "Automatiza procesos manuales y dedica más tiempo a tu negocio"
                  },
                  {
                    title: "Gestiona ventas",
                    description: "Automatiza procesos de ventas, visualiza historial y pedidos por clientes"
                  },
                  {
                    title: "Interfaz intuitiva",
                    description: "Diseño simple y fácil de usar, sin curva de aprendizaje"
                  }
                ].map((benefit, index) => (
                  <motion.div
                    key={benefit.title}
                    className="flex items-start space-x-4"
                    variants={fadeInUp}
                    whileHover={{ x: 10 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      whileInView={{ scale: 1, rotate: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                      <CheckCircle className="w-6 h-6 text-primary mt-1 flex-shrink-0" />
                    </motion.div>
                    <div>
                      <h3 className="font-semibold text-foreground">{benefit.title}</h3>
                      <p className="text-muted-foreground">{benefit.description}</p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>            <motion.div
              className="bg-card rounded-lg shadow-lg overflow-hidden"
              variants={slideInRight}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              whileHover={{ scale: 1.02, rotateY: 5 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <Image
                src="/sistema-inventario.png"
                alt="Sistema de inventario de Brewsy"
                width={600}
                height={400}
                className="w-full h-auto"
              />
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section
        className="py-20 px-4 bg-primary"
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8 }}
      >
        <div className="container mx-auto text-center">
          <motion.h2
            className="text-4xl font-bold text-primary-foreground mb-4"
            {...fadeInUp}
            viewport={{ once: true }}
          >
            ¿Listo para transformar tu inventario?
          </motion.h2>
          <motion.p
            className="text-xl text-primary-foreground/80 mb-8 max-w-2xl mx-auto"
            {...fadeInUp}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            Únete a cientos de bares y licorerías que ya confían en Brewsy para gestionar su inventario
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >            <Link
            href="/login"
            className="bg-background text-foreground px-8 py-4 rounded-lg font-semibold text-lg hover:bg-accent transition-colors inline-flex items-center gap-2 shadow-lg"
          >
              Comenzar ahora gratis
              <motion.div
                animate={{ x: [0, 4, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                <ArrowRight className="w-5 h-5" />
              </motion.div>
            </Link>
          </motion.div>          <motion.p
            className="text-primary-foreground/80 mt-4"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            Credenciales de prueba: admin@brewsy.com / admin
          </motion.p>
        </div>
      </motion.section>      {/* Footer */}
      <motion.footer
        id="contact"
        className="py-12 px-4 bg-card border-t border-border scroll-mt-20"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.8 }}
      >
        <div className="container mx-auto">
          <motion.div
            className="grid md:grid-cols-4 gap-8"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            <motion.div variants={fadeInUp}>
              <motion.div
                className="flex items-center space-x-2 mb-4"
                whileHover={{ scale: 1.05 }}
              >
                <Image
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo_oficial-46D02wUcP1RDrjJLGq04ZPBB4PSlQ5.png"
                  alt="Brewsy Logo"
                  width={32}
                  height={32}
                  className="w-8 h-8"
                />
                <span className="text-xl font-bold text-foreground">Brewsy</span>
              </motion.div>
              <p className="text-muted-foreground">
                La solución SaaS para la gestión inteligente de inventarios de bebidas.
              </p>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <h3 className="font-semibold text-foreground mb-4">Producto</h3>
              <ul className="space-y-2 text-muted-foreground">
                {['Características', 'Precios', 'Demo'].map((item, index) => (
                  <motion.li
                    key={item}
                    whileHover={{ x: 5, color: "hsl(var(--foreground))" }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <a href="#" className="hover:text-foreground transition-colors">{item}</a>
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <h3 className="font-semibold text-foreground mb-4">Soporte</h3>
              <ul className="space-y-2 text-muted-foreground">
                {['Centro de ayuda', 'Documentación', 'Manual de usuario'].map((item, index) => (
                  <motion.li
                    key={item}
                    whileHover={{ x: 5, color: "hsl(var(--foreground))" }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <a href="#" className="hover:text-foreground transition-colors">{item}</a>
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <h3 className="font-semibold text-foreground mb-4">Contacto</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>soporte@brewsy.com</li>
                <li>+57 312 345 6789</li>
                <li>www.brewsy.com</li>
              </ul>
            </motion.div>
          </motion.div>

          <motion.div
            className="border-t border-border mt-8 pt-8 text-center text-muted-foreground"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <p>&copy; 2025 Brewsy. Todos los derechos reservados. Daniel Trejos - Armando Ledezma - José Ensuncho</p>          </motion.div>
        </div>
      </motion.footer>

      {/* Scroll to Top Button */}
      <AnimatePresence>
        {showScrollToTop && (
          <motion.button
            onClick={scrollToTop}
            className="fixed bottom-6 right-6 z-50 bg-primary text-primary-foreground p-3 rounded-full shadow-lg hover:bg-primary/90 transition-colors"
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
    </div>
  )
}