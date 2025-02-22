import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from "react-router";

import Home from './pages/Home.jsx'
import DisplayCourse from './pages/DisplayCourse.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/:courseCode" element={<DisplayCourse />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
