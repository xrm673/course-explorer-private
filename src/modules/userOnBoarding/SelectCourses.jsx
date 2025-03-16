import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../../context/UserContext';
import { useAcademic } from '../../context/AcademicContext';
import { getCourseById } from '../../firebase/services/courseService';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import './SelectCourses.css';

const SelectCourses = () => {
  const { user, setUser } = useContext(UserContext);
  const { academicData } = useAcademic();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [courseDetails, setCourseDetails] = useState([]);
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [selectedCredits, setSelectedCredits] = useState({});
  const [creditModalOpen, setCreditModalOpen] = useState(false);
  const [currentCourse, setCurrentCourse] = useState(null);
  const [scheduleData, setScheduleData] = useState({
    planned: {
      "Spring 2027": [],
      "Fall 2026": [],
      "Spring 2026": [],
      "Fall 2025": [],
    },
    taken: {
      "Spring 2025": [],
      "Fall 2024": [],
      "Spring 2024": [],
      "Fall 2023": [],
      "Ungrouped Courses": []
    }
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Load initial courses from user's majors' init fields and existing schedule data
  useEffect(() => {
    const fetchInitialData = async () => {
      if (!user || !academicData?.majors) {
        return;
      }
      
      setLoading(true);
      
      try {
        // First check if user already has schedule data
        const userRef = doc(db, 'users', user.netId);
        const userDoc = await getDoc(userRef);
        
        if (userDoc.exists() && userDoc.data().scheduleData) {
          const existingScheduleData = userDoc.data().scheduleData;
          setScheduleData(existingScheduleData);
          
          // Initialize selected courses from Ungrouped Courses
          if (existingScheduleData.taken && 
              existingScheduleData.taken["Ungrouped Courses"] && 
              Array.isArray(existingScheduleData.taken["Ungrouped Courses"])) {
            
            // Extract course codes for selection state
            const courseCodes = [];
            const creditValues = {};
            
            existingScheduleData.taken["Ungrouped Courses"].forEach(course => {
              if (typeof course === 'object' && course.code) {
                courseCodes.push(course.code);
                if (course.credits !== undefined) {
                  creditValues[course.code] = course.credits;
                }
              } else if (typeof course === 'string') {
                courseCodes.push(course);
              }
            });
            
            setSelectedCourses(courseCodes);
            setSelectedCredits(creditValues);
          }
        }
        
        const initCourseIds = new Set();
        const courseDetailsPromises = [];
        
        // Collect all unique course IDs from all majors' init fields
        for (const majorObj of user.majors) {
          const majorId = majorObj.id;
          const majorData = academicData.majors[majorId];
          
          if (majorData && majorData.init && Array.isArray(majorData.init)) {
            // Add each course ID to the set (to avoid duplicates)
            majorData.init.forEach(courseId => {
              if (!initCourseIds.has(courseId)) {
                initCourseIds.add(courseId);
                // Create a promise to fetch course details
                courseDetailsPromises.push(
                  getCourseById(courseId)
                    .then(course => course)
                    .catch(err => {
                      console.error(`Error fetching course ${courseId}:`, err);
                      return null; // Return null for failed fetches
                    })
                );
              }
            });
          }
        }
        
        // Wait for all course detail promises to resolve
        const fetchedCourses = await Promise.all(courseDetailsPromises);
        
        // Filter out null values (failed fetches) and sort by course ID
        const validCourses = fetchedCourses
          .filter(course => course !== null)
          .sort((a, b) => a.id.localeCompare(b.id));
        
        setCourseDetails(validCourses);
      } catch (error) {
        console.error("Error fetching initial courses:", error);
        setError("Failed to load recommended courses. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchInitialData();
  }, [user, academicData]);
  
  // Check if a course has multiple credit options
  const hasMultipleCredits = (course) => {
    return course && course.creditsTotal && Array.isArray(course.creditsTotal) && course.creditsTotal.length > 1;
  };
  
  // Get the credit options for a course
  const getCreditOptions = (course) => {
    if (!course || !course.creditsTotal || !Array.isArray(course.creditsTotal)) {
      return [];
    }
    return course.creditsTotal;
  };
  
  // Get the selected or default credit value for a course
  const getCreditValue = (course) => {
    // If user has explicitly selected a credit value, use that
    if (course && course.id && selectedCredits[course.id] !== undefined) {
      return selectedCredits[course.id];
    }
    
    // Otherwise use last credit in the array as default
    if (course && course.creditsTotal && Array.isArray(course.creditsTotal) && course.creditsTotal.length > 0) {
      return course.creditsTotal[course.creditsTotal.length - 1];
    }
    
    return null;
  };
  
  // Toggle course as selected/not selected
  const toggleCourse = (course) => {
    const courseId = course.id;
    
    // If this is a multi-credit course and user is selecting it (not already selected)
    if (!selectedCourses.includes(courseId) && hasMultipleCredits(course)) {
      // Open the credit selection modal
      setCurrentCourse(course);
      setCreditModalOpen(true);
      return;
    }
    
    setSelectedCourses(prevCourses => {
      if (prevCourses.includes(courseId)) {
        // Remove course if already in the array
        return prevCourses.filter(id => id !== courseId);
      } else {
        // Add course if not in the array
        return [...prevCourses, courseId];
      }
    });
  };
  
  // Handle credit selection from the modal
  const handleCreditSelect = (creditValue) => {
    if (!currentCourse) return;
    
    // Save the selected credit value
    setSelectedCredits(prev => ({
      ...prev,
      [currentCourse.id]: creditValue
    }));
    
    // Add the course to selected courses
    setSelectedCourses(prev => {
      if (!prev.includes(currentCourse.id)) {
        return [...prev, currentCourse.id];
      }
      return prev;
    });
    
    // Close the modal
    setCreditModalOpen(false);
    setCurrentCourse(null);
  };
  
  // Create a course object with the required properties
  const createCourseObject = (course) => {
    return {
      code: course.id,
      tts: course.tts || course.ttl || course.id, // Short title or fallback to full title or ID
      credits: getCreditValue(course),
    };
  };
  
  // Save selected courses to database and localStorage
  const saveScheduleData = async () => {
    if (!user || !user.netId) {
      setError("User information not available. Please log in again.");
      return;
    }
    
    setSaving(true);
    setError('');
    setSuccess('');
    
    try {
      // Create course objects for selected courses
      const selectedCourseObjects = selectedCourses.map(courseId => {
        // Find the full course details
        const courseDetail = courseDetails.find(c => c.id === courseId);
        if (courseDetail) {
          return createCourseObject(courseDetail);
        }
        // Fallback if course details not found
        return { code: courseId };
      });
      
      // Update the scheduleData with selected courses as objects
      const updatedScheduleData = {
        ...scheduleData,
        taken: {
          ...scheduleData.taken,
          "Ungrouped Courses": selectedCourseObjects
        }
      };
      
      // Update user document in Firestore
      const userRef = doc(db, 'users', user.netId);
      
      await updateDoc(userRef, {
        scheduleData: updatedScheduleData,
        lastUpdated: new Date()
      });
      
      // Update user in context (which will also update localStorage via UserContext)
      setUser({
        ...user,
        scheduleData: updatedScheduleData
      });
      
      setSuccess("Your course selection has been saved successfully!");
      
      // Navigate to the home page after a brief delay to show the success message
      setTimeout(() => navigate('/'), 1500);
    } catch (error) {
      console.error("Error saving courses:", error);
      setError("Failed to save your course selection. Please try again.");
      setSaving(false);
    }
  };
  
  // Skip this step and navigate to home page
  const skipSelection = () => {
    navigate('/');
  };
  
  if (loading) {
    return <div className="loading-container">Loading recommended courses...</div>;
  }
  
  return (
    <div className="select-courses-container">
      <h2>Select Courses You've Already Taken</h2>
      <p>Please select all courses you have already completed:</p>
      
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}
      
      {courseDetails.length === 0 ? (
        <div className="no-courses-message">
          No recommended courses found for your majors. You can add courses later from your dashboard.
        </div>
      ) : (
        <div className="course-grid">
          {courseDetails.map(course => (
            <div 
              key={course.id} 
              className={`course-card ${selectedCourses.includes(course.id) ? 'selected' : ''}`}
              onClick={() => toggleCourse(course)}
            >
              <div className="course-header">
                <span className="course-id">{course.id}</span>
                <div className="checkbox-container">
                  <input 
                    type="checkbox" 
                    checked={selectedCourses.includes(course.id)} 
                    onChange={() => {}} // Handled by the card's onClick
                    className="course-checkbox"
                  />
                </div>
              </div>
              <div className="course-title">
                {course.ttl || 'No title available'}
                <div className="course-credits">
                  {hasMultipleCredits(course) ? (
                    <span className="variable-credits">
                      ({selectedCredits[course.id] || getCreditValue(course)} cr, variable)
                    </span>
                  ) : (
                    getCreditValue(course) && <span>({getCreditValue(course)} cr)</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Credit Selection Modal */}
      {creditModalOpen && currentCourse && (
        <div className="credit-modal-overlay">
          <div className="credit-modal">
            <h3>Select Credits for {currentCourse.id}</h3>
            <p>{currentCourse.ttl || 'No title available'}</p>
            <p>This course has variable credits. Please select how many credits you received:</p>
            
            <div className="credit-options">
              {getCreditOptions(currentCourse).map(credit => (
                <button 
                  key={credit} 
                  className="credit-option-button"
                  onClick={() => handleCreditSelect(credit)}
                >
                  {credit} Credits
                </button>
              ))}
            </div>
            
            <button 
              className="credit-modal-close"
              onClick={() => setCreditModalOpen(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      
      <div className="action-buttons">
        <button 
          className="save-button" 
          onClick={saveScheduleData} 
          disabled={saving}
        >
          {saving ? 'Saving...' : 'Save Selection'}
        </button>
        <button 
          className="skip-button" 
          onClick={skipSelection} 
          disabled={saving}
        >
          Skip for Now
        </button>
      </div>
    </div>
  );
};

export default SelectCourses;