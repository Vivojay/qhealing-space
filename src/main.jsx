import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from '@/Layout'
import Home from '@/pages/Home'
import Healings from '@/pages/Healings'
import GlobalPractices from '@/pages/GlobalPractices'
import Retreats from '@/pages/Retreats'
import HinduRituals from '@/pages/HinduRituals'
import TranscendenceRituals from '@/pages/TranscendenceRituals'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/healings" element={<Healings />} />
          <Route path="/global-practices" element={<GlobalPractices />} />
          <Route path="/retreats" element={<Retreats />} />
          <Route path="/hindu-rituals" element={<HinduRituals />} />
          <Route path="/transcendence-rituals" element={<TranscendenceRituals />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  </React.StrictMode>,
)
