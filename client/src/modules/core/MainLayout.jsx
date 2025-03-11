import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import TopBar from './components/TopBar'
import NavigationMenu from './components/NavigationMenu'
import ScheduleSidebar from '../schedule/ScheduleSidebar'

export default function MainLayout() {
  const [isNavOpen, setIsNavOpen] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  return (
    <div>
      <TopBar 
        onMenuClick={() => setIsNavOpen(true)}
        onScheduleClick={() => setIsSidebarOpen(true)}
      />
      
      {isNavOpen && (
        <NavigationMenu onClose={() => setIsNavOpen(false)} />
      )}
      
      <main>
        <Outlet />
      </main>
      
      {isSidebarOpen && (
        <ScheduleSidebar onClose={() => setIsSidebarOpen(false)} />
      )}
    </div>
  )
}