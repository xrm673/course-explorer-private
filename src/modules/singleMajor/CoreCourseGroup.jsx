import React, { useState, useEffect, useContext } from 'react';
import CoreCourseCard from "./CoreCourseCard";
import { getCourseById } from "../../firebase/services/courseService";
import { getCourseStatus } from "../../utils/courseUtils";
import { UserContext } from "../../context/UserContext";
import styles from './CoreCourseGroup.module.css';

export default function CoreCourseGroup({ courseGrp, selectedSemester }) {
  const [expanded, setExpanded] = useState(false);
  const [additionalCourses, setAdditionalCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [courseAvailability, setCourseAvailability] = useState({});
  const [hasTakenCourse, setHasTakenCourse] = useState(false);
  
  // Get user context
  const { user } = useContext(UserContext);

  // Early return with error handling if courseGrp is undefined
  if (!courseGrp || !courseGrp.courses || courseGrp.courses.length === 0) {
    return <div>Missing course group data</div>;
  }

  // Check if any course in the group is marked as taken
  useEffect(() => {
    if (user && courseGrp && courseGrp.courses) {
      let taken = false;
      
      for (const courseId of courseGrp.courses) {
        const status = getCourseStatus(courseId, user);
        if (status.isTaken) {
          taken = true;
          break;
        }
      }
      
      setHasTakenCourse(taken);
    }
  }, [user, courseGrp]);

  // Get additional courses data if there are more than one course
  useEffect(() => {
    if (courseGrp.courses.length > 1 && !expanded && additionalCourses.length === 0) {
      const fetchAdditionalCourses = async () => {
        setLoading(true);
        try {
          const coursesData = await Promise.all(
            courseGrp.courses.slice(1).map(async (courseId) => {
              const courseData = await getCourseById(courseId);
              return { id: courseId, ...courseData };
            })
          );
          setAdditionalCourses(coursesData);
        } catch (err) {
          console.error("Failed to load additional courses", err);
        } finally {
          setLoading(false);
        }
      };
      
      fetchAdditionalCourses();
    }
  }, [courseGrp.courses, expanded, additionalCourses]);

  // Get course availability information
  useEffect(() => {
    const fetchCourseAvailability = async () => {
      try {
        const availabilityData = {};
        
        for (const courseId of courseGrp.courses) {
          const courseData = await getCourseById(courseId);
          const status = user ? getCourseStatus(courseId, user) : { isTaken: false, isPlanned: false };
          availabilityData[courseId] = status;
        }
        
        setCourseAvailability(availabilityData);
      } catch (err) {
        console.error("Failed to check course availability", err);
      }
    };
    
    fetchCourseAvailability();
  }, [courseGrp.courses, user]);

  const toggleExpand = () => {
    setExpanded(!expanded);
  };

  // Handle status changes of individual courses
  const handleCourseStatusChange = ({ courseId, isTaken }) => {
    if (isTaken) {
      setHasTakenCourse(true);
    } else {
      // Re-check if any course is still taken
      let stillHasTaken = false;
      for (const id of courseGrp.courses) {
        if (id !== courseId) {
          const status = getCourseStatus(id, user);
          if (status.isTaken) {
            stillHasTaken = true;
            break;
          }
        }
      }
      setHasTakenCourse(stillHasTaken);
    }
  };

  // Apply different container style based on taken status
  const containerClassName = hasTakenCourse 
    ? `${styles.courseGroupContainer} ${styles.takenCourseGroup}` 
    : styles.courseGroupContainer;

  return (
    <div className={containerClassName}>
      <div className={styles.courseCardsContainer}>
        {/* First course always shown */}
        <CoreCourseCard 
          courseId={courseGrp.courses[0]} 
          selectedSemester={selectedSemester}
          onStatusChange={handleCourseStatusChange}
        />
        
        {/* Additional courses section */}
        {courseGrp.courses.length > 1 && !expanded && (
          <div className={styles.additionalCourses}>
            <div className={styles.additionalCoursesHeader}>
              <div>
                <strong>Also: </strong> 
                {loading ? "Loading..." : (
                  <span>
                    {additionalCourses.map((course, i) => (
                      <span key={i} className={styles.courseIdSpan}>
                        {course.sbj} {course.nbr};
                      </span>
                    ))}
                  </span>
                )}
              </div>
              <button 
                onClick={toggleExpand}
                className={styles.actionButton}
              >
                Show All
              </button>
            </div>
          </div>
        )}
        
        {/* Show all courses when expanded */}
        {expanded && courseGrp.courses.slice(1).map((courseId, i) => (
          <CoreCourseCard 
            key={i} 
            courseId={courseId} 
            selectedSemester={selectedSemester}
            onStatusChange={handleCourseStatusChange}
          />
        ))}
        
        {/* Show collapse button when expanded */}
        {expanded && courseGrp.courses.length > 1 && (
          <button 
            onClick={toggleExpand}
            className={styles.collapseButton}
          >
            Collapse
          </button>
        )}
      </div>
    </div>
  );
}