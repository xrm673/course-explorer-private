import { useState, createContext, useContext } from 'react'
import { Outlet } from 'react-router-dom'
import TopBar from './components/TopBar'
import NavigationMenu from './components/NavigationMenu'
import PersonalInfoModal from '../personalInfo/PersonalInfoModal'
import ScheduleSidebar from '../schedule/ScheduleSidebar'
import './MainLayout.css' // We'll create this CSS file

// Create context for sidebar functionality
export const SidebarContext = createContext();

export function useSidebar() {
  return useContext(SidebarContext);
}

export default function MainLayout() {
  const [activeSidebar, setActiveSidebar] = useState(null);
  const [activeSemester, setActiveSemester] = useState(null);
  
  const toggleSidebar = (sidebarName) => {
    setActiveSidebar(prev => prev === sidebarName ? null : sidebarName);
  };
  
  const openSidebar = (semester) => {
    setActiveSemester(semester);
    setActiveSidebar('schedule');
  };
  
  const closeSidebar = () => {
    setActiveSidebar(null);
  };
  
  const courseUpdated = () => {
    const event = new CustomEvent('courseUpdated');
    document.dispatchEvent(event);
  };
  
  const sidebarContextValue = {
    activeSidebar,
    toggleSidebar,
    openSidebar,
    closeSidebar,
    activeSemester,
    courseUpdated,
    isSidebarOpen: activeSidebar === 'schedule'
  };

  return (
    <SidebarContext.Provider value={sidebarContextValue}>
      {/* TopBar remains full width */}
      <TopBar />
      
      {/* Content container that adjusts width */}
      <div className={`content-container ${activeSidebar ? 'sidebar-open' : ''}`}>
        <main>
          <Outlet />
        </main>
      </div>
      
      {/* Sidebars remain fixed */}
      {activeSidebar === 'navigation' && (
        <NavigationMenu onClose={closeSidebar} />
      )}
      
      {activeSidebar === 'profile' && (
        <PersonalInfoModal onClose={closeSidebar} />
      )}
      
      {activeSidebar === 'schedule' && (
        <ScheduleSidebar 
          onClose={closeSidebar} 
          activeSemester={activeSemester}
        />
      )}
    </SidebarContext.Provider>
  )
}