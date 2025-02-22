import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from "react-router";

import Home from './pages/Home.jsx'
import Activities from './pages/Activities.jsx'
import Traditions from './pages/Traditions.jsx'
import Vendors from './pages/Vendors.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/activities" element={<Activities />} />
        <Route path="/traditions" element={<Traditions />} />
        <Route path="/vendors" element={<Vendors />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
