import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../../context/UserContext';
import { useAcademic } from '../../context/AcademicContext';
import { getCourseById } from '../../firebase/services/courseService';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import './SelectCourses.css';

const SelectCourses = () => {
  const { user, setUser } = useContext(UserContext);
  const { academicData } = useAcademic();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [courseDetails, setCourseDetails] = useState([]);
  const [coursesTaken, setCoursesTaken] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Load initial courses from user's majors' init fields
  useEffect(() => {
    const fetchInitialCourses = async () => {
      if (!user || !academicData?.majors) {
        return;
      }
      
      setLoading(true);
      
      try {
        // Get courses_taken from user if it exists
        if (user.courses_taken && Array.isArray(user.courses_taken)) {
          setCoursesTaken(user.courses_taken);
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
    
    fetchInitialCourses();
  }, [user, academicData]);
  
  // Toggle course as taken/not taken
  const toggleCourseTaken = (courseId) => {
    setCoursesTaken(prevCourses => {
      if (prevCourses.includes(courseId)) {
        // Remove course if already in the array
        return prevCourses.filter(id => id !== courseId);
      } else {
        // Add course if not in the array
        return [...prevCourses, courseId];
      }
    });
  };
  
  // Save selected courses to database and localStorage
  const saveCoursesTaken = async () => {
    if (!user || !user.netId) {
      setError("User information not available. Please log in again.");
      return;
    }
    
    setSaving(true);
    setError('');
    setSuccess('');
    
    try {
      // Update user document in Firestore
      const userRef = doc(db, 'users', user.netId);
      
      await updateDoc(userRef, {
        courses_taken: coursesTaken,
        lastUpdated: new Date()
      });
      
      // Update user in context (which will also update localStorage via UserContext)
      setUser({
        ...user,
        courses_taken: coursesTaken
      });
      
      setSuccess("Your course selection has been saved successfully!");
      
      // Navigate to the home page after a brief delay to show the success message
      setTimeout(() => navigate('/'), 1500);
    } catch (error) {
      console.error("Error saving courses taken:", error);
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
              className={`course-card ${coursesTaken.includes(course.id) ? 'selected' : ''}`}
              onClick={() => toggleCourseTaken(course.id)}
            >
              <div className="course-header">
                <span className="course-id">{course.id}</span>
                <div className="checkbox-container">
                  <input 
                    type="checkbox" 
                    checked={coursesTaken.includes(course.id)} 
                    onChange={() => {}} // Handled by the card's onClick
                    className="course-checkbox"
                  />
                </div>
              </div>
              <div className="course-title">{course.tts || 'No title available'}</div>
            </div>
          ))}
        </div>
      )}
      
      <div className="action-buttons">
        <button 
          className="save-button" 
          onClick={saveCoursesTaken} 
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