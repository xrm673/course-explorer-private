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
  
  // Sample schedule data - in a real app, this would come from a database
  const [scheduleData, setScheduleData] = useState({
    planned: {
      "Fall 2025": [],
      "Spring 2026": []
    },
    taken: {
      "Fall 2024": [],
      "Spring 2024": [],
      "Ungrouped Courses": []
    }
  });
  
  // Function to open sidebar with a specific semester
  const openSidebar = (semester) => {
    setActiveSemester(semester);
    setIsSidebarOpen(true);
  };
  
  // Function to add a course to the schedule
  const addCourseToSchedule = (course, semester, type = 'planned') => {
    setScheduleData(prevData => {
      const newData = {...prevData};
      
      // If the semester doesn't exist, create it
      if (!newData[type][semester]) {
        newData[type][semester] = [];
      }
      
      // Add the course if it doesn't already exist
      const exists = newData[type][semester].some(c => c.code === course.code);
      if (!exists) {
        newData[type][semester] = [...newData[type][semester], {
          code: course.code,
          title: course.title
        }];
      }
      
      return newData;
    });
  };
  
  // Function to remove a course from the schedule
  const removeCourseFromSchedule = (courseCode) => {
    setScheduleData(prevData => {
      const newData = {...prevData};
      
      // Check both planned and taken sections
      ['planned', 'taken'].forEach(type => {
        Object.keys(newData[type]).forEach(semester => {
          newData[type][semester] = newData[type][semester].filter(
            course => course.code !== courseCode
          );
        });
      });
      
      return newData;
    });
  };
  
  // Event handler for course removal - emits an event when a course is removed
  const handleCourseRemoval = (courseCode) => {
    // First, remove from the schedule data
    removeCourseFromSchedule(courseCode);
    
    // Then dispatch a custom event for components to listen for
    const event = new CustomEvent('courseRemoved', { 
      detail: { courseCode } 
    });
    document.dispatchEvent(event);
  };
  
  // Value to provide to the context
  const sidebarContextValue = {
    openSidebar,
    isSidebarOpen,
    activeSemester,
    scheduleData,
    addCourseToSchedule,
    removeCourseFromSchedule,
    handleCourseRemoval
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
            scheduleData={scheduleData}
            onRemoveCourse={handleCourseRemoval}
          />
        )}
      </div>
    </SidebarContext.Provider>
  )
}