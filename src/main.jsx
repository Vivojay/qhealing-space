import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import Lenis from 'lenis'
import { ThemeProvider } from '@/context/ThemeContext'
import Layout from '@/Layout'
import ScrollToTop from '@/components/ScrollToTop'
import Home from '@/pages/Home'
import Healings from '@/pages/Healings'
import GlobalPractices from '@/pages/GlobalPractices'
import Retreats from '@/pages/Retreats'
import RetreatCheckout from '@/pages/RetreatCheckout'
import HinduRituals from '@/pages/HinduRituals'
import TranscendenceRituals from '@/pages/TranscendenceRituals'
import Booking from '@/pages/Booking'
import './index.css'

const lenis = new Lenis({
  lerp: 0.07,
  wheelMultiplier: 0.8,
  touchMultiplier: 1.5,
})
if (typeof window !== 'undefined') window.__lenis = lenis

function raf(time) {
  lenis.raf(time)
  requestAnimationFrame(raf)
}
requestAnimationFrame(raf)

function AppRoutes() {
  const location = useLocation()
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      >
        <Routes location={location}>
          <Route path="/" element={<Home />} />
          <Route path="/healings" element={<Healings />} />
          <Route path="/global-practices" element={<GlobalPractices />} />
          <Route path="/retreats" element={<Retreats />} />
          <Route path="/retreats/:slug/book" element={<RetreatCheckout />} />
          <Route path="/hindu-rituals" element={<HinduRituals />} />
          <Route path="/transcendence-rituals" element={<TranscendenceRituals />} />
          <Route path="/booking" element={<Booking />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <BrowserRouter>
        <ScrollToTop />
        <Layout>
          <AppRoutes />
        </Layout>
      </BrowserRouter>
    </ThemeProvider>
  </React.StrictMode>,
)
