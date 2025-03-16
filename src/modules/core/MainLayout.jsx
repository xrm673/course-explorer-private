import { useState, createContext, useContext } from 'react'
import { Outlet } from 'react-router-dom'
import TopBar from './components/TopBar'
import NavigationMenu from './components/NavigationMenu'
import ScheduleSidebar from '../schedule/ScheduleSidebar'

// Create context for sidebar functionality
export const SidebarContext = createContext();

export function useSidebar() {
  return useContext(SidebarContext);
}

export default function MainLayout() {
  const [isNavOpen, setIsNavOpen] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [activeSemester, setActiveSemester] = useState(null)
  
  // Function to open sidebar with a specific semester
  const openSidebar = (semester) => {
    setActiveSemester(semester);
    setIsSidebarOpen(true);
  };
  
  // Listen for course update events (optional)
  // This allows components to respond to course changes if needed
  const courseUpdated = () => {
    // Dispatch an event that other components can listen for
    const event = new CustomEvent('courseUpdated');
    document.dispatchEvent(event);
  };
  
  // Value to provide to the context
  const sidebarContextValue = {
    openSidebar,
    isSidebarOpen,
    activeSemester,
    courseUpdated
  };

  return (
    <SidebarContext.Provider value={sidebarContextValue}>
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
          <ScheduleSidebar 
            onClose={() => setIsSidebarOpen(false)} 
            activeSemester={activeSemester}
          />
        )}
      </div>
    </SidebarContext.Provider>
  )
}