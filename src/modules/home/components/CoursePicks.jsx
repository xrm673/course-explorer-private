import React, { useState, useEffect } from 'react';
import HomeCourseCard from './HomeCourseCard';
import FilterModal from '../../core/components/FilterModal';
import { useSidebar } from '../../core/MainLayout'; // Correct import path

export default function CoursePicks() {
  // Get the sidebar context functions
  const { openSidebar, addCourseToSchedule, removeCourseFromSchedule } = useSidebar();
  
  // Mock semester data
  const currentSemester = "Fall 2025";
  
  // Mock course data
  const [courses, setCourses] = useState([
    {
      id: 1,
      code: "CS 1110",
      title: "Introduction to Computing Using Python",
      tags: ["FWS", "Distribution I", "4 Credits", "In-Person", "High-Rate Instructor"],
      state: "normal",
    },
    {
      id: 2,
      code: "INFO 1200",
      title: "Information Ethics, Law, and Policy",
      tags: ["Distribution II", "3 Credits", "In-Person", "Light Workload"],
      state: "normal",
    },
    {
      id: 3,
      code: "CS 2110",
      title: "Object-Oriented Programming and Data Structures",
      tags: ["4 Credits", "In-Person", "Moderate Workload", "Two Prelims"],
      state: "ineligible",
      ineligibleReason: "Prerequisite: CS 1110 or equivalent",
    },
    {
      id: 4,
      code: "MATH 1120",
      title: "Calculus II",
      tags: ["Distribution I", "4 Credits", "In-Person", "Moderate Workload"],
      state: "normal",
    },
    {
      id: 5,
      code: "PHYS 1112",
      title: "Physics I: Mechanics and Heat",
      tags: ["PBS", "4 Credits", "Lab", "Moderate Difficulty"],
      state: "normal",
    },
    {
      id: 6,
      code: "ECON 1110",
      title: "Introductory Microeconomics",
      tags: ["Distribution III", "3 Credits", "Large Lecture", "Easy"],
      state: "normal",
    },
  ]);
  
  // Listen for course removal events from the sidebar
  useEffect(() => {
    const handleCourseRemoved = (event) => {
      const { courseCode } = event.detail;
      
      // Find the course in our state and reset it to 'normal'
      setCourses(prevCourses => 
        prevCourses.map(course => 
          course.code === courseCode 
            ? { ...course, state: 'normal' } 
            : course
        )
      );
    };
    
    // Add event listener
    document.addEventListener('courseRemoved', handleCourseRemoved);
    
    // Clean up event listener on unmount
    return () => {
      document.removeEventListener('courseRemoved', handleCourseRemoved);
    };
  }, []);
  
  // Mock filter state
  const [showFilterModal, setShowFilterModal] = useState(false);
  
  // Mock filter categories and options based on the design spec
  const filterCategories = [
    {
      name: "Distribution Categories",
      options: ["Distribution I", "Distribution II", "Distribution III"]
    },
    {
      name: "Level",
      options: ["1000", "2000", "3000", "4000", "5000"]
    },
    {
      name: "Enrollment Requirements",
      options: ["Eligible", "Ineligible"]
    },
    {
      name: "Section Components",
      options: ["LEC", "DIS", "SEM", "LAB", "Others"]
    },
    {
      name: "Instruction Mode",
      options: ["In-Person", "Online (Recording)", "Online (Live)", "Hybrid", "Others"]
    },
    {
      name: "Difficulty",
      options: ["Hard", "Moderate", "Easy"]
    },
    {
      name: "Workload",
      options: ["Heavy Workload", "Moderate Workload", "Light Workload"]
    },
    {
      name: "Instructor Quality",
      options: ["High-Rate Instructor"]
    }
  ];
  
  // Handle planning a course
  const handlePlanCourse = (course) => {
    console.log(`Planning course: ${course.code}`);
    
    // Update the local state to show the course as planned
    setCourses(prevCourses => 
      prevCourses.map(c => 
        c.id === course.id ? {...c, state: 'planned'} : c
      )
    );
    
    // Add the course to the schedule
    if (addCourseToSchedule) {
      addCourseToSchedule(course, currentSemester, 'planned');
    }
    
    // Open the Schedule Sidebar automatically with the current semester expanded
    if (openSidebar) {
      openSidebar(currentSemester);
    } else {
      console.log('Schedule sidebar function not provided. Would open sidebar for:', currentSemester);
    }
  };
  
  // Handle marking a course as taken
  const handleTakenCourse = (course) => {
    console.log(`Marking course as taken: ${course.code}`);
    
    // Update the local state to show the course as taken
    setCourses(prevCourses => 
      prevCourses.map(c => 
        c.id === course.id ? {...c, state: 'taken'} : c
      )
    );
    
    // Add the course to the taken list
    if (addCourseToSchedule) {
      addCourseToSchedule(course, "Ungrouped Courses", 'taken');
    }
  };
  
  // Handle removing a course
  const handleRemoveCourse = (course) => {
    console.log(`Removing course: ${course.code}`);
    
    // Update the local state to show the course as normal
    setCourses(prevCourses => 
      prevCourses.map(c => 
        c.id === course.id ? {...c, state: 'normal'} : c
      )
    );
    
    // Remove the course from the schedule
    if (removeCourseFromSchedule) {
      removeCourseFromSchedule(course.code);
    }
  };
  
  // Toggle filter modal
  const toggleFilterModal = () => {
    setShowFilterModal(!showFilterModal);
  };
  
  // Handler for applying filters
  const handleApplyFilters = (filters) => {
    console.log("Applied filters:", filters);
    // In a real implementation, this would filter the courses based on the selected filters
    setShowFilterModal(false);
  };
  
  // Container styles
  const containerStyles = {
    marginBottom: '48px',
    padding: '24px',
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
  };
  
  // Header styles
  const headerContainerStyles = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
    paddingBottom: '16px',
    borderBottom: '1px solid #e5e7eb'
  };
  
  const headerTitleStyles = {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#1f2937'
  };
  
  const filterButtonStyles = {
    display: 'flex',
    alignItems: 'center',
    padding: '10px 16px',
    backgroundColor: '#3b82f6', // blue
    color: 'white',
    borderRadius: '8px',
    border: 'none',
    fontWeight: '500',
    cursor: 'pointer',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
  };
  
  // Grid container styles
  const gridContainerStyles = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '24px'
  };

  return (
    <div style={containerStyles}>
      {/* Section header */}
      <div style={headerContainerStyles}>
        <h2 style={headerTitleStyles}>
          Courses You May Want to Take in {currentSemester}
        </h2>
        <button
          onClick={toggleFilterModal}
          style={filterButtonStyles}
          aria-label="Filter courses"
        >
          <span style={{ marginRight: '8px' }}>Filter</span>
          <svg xmlns="http://www.w3.org/2000/svg" style={{ width: '20px', height: '20px' }} viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
      
      {/* Course grid */}
      <div style={gridContainerStyles}>
        {courses.map((course) => (
          <HomeCourseCard
            key={course.id}
            course={course}
            initialState={course.state}
            onPlan={handlePlanCourse}
            onTaken={handleTakenCourse}
            onRemove={handleRemoveCourse}
          />
        ))}
      </div>
      
      {/* Filter modal */}
      {showFilterModal && (
        <FilterModal
          show={showFilterModal}
          onClose={() => setShowFilterModal(false)}
          onApply={handleApplyFilters}
          categories={filterCategories}
        />
      )}
    </div>
  );
}