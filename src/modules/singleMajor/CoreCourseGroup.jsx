import React, { useState, useEffect } from 'react';
import CoreCourseCard from "./CoreCourseCard";
import { getCourseById } from "../../firebase/services/courseService";
import { getCourseSeasonAvailability } from "../../utils/semesterUtils";
import styles from './CoreCourseGroup.module.css';

export default function CoreCourseGroup({ courseGrp, selectedSemester }) {
  const [expanded, setExpanded] = useState(false);
  const [additionalCourses, setAdditionalCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [courseAvailability, setCourseAvailability] = useState({});

  // Early return with error handling if courseGrp is undefined
  if (!courseGrp || !courseGrp.courses || courseGrp.courses.length === 0) {
    return <div>Missing course group data</div>;
  }

  // Determine if the selected semester is a Fall or Spring semester
  const isFallSemester = selectedSemester.startsWith('FA');
  const isSpringBySemester = selectedSemester.startsWith('SP');

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
          const availability = getCourseSeasonAvailability(courseData);
          availabilityData[courseId] = availability;
        }
        
        setCourseAvailability(availabilityData);
      } catch (err) {
        console.error("Failed to check course availability", err);
      }
    };
    
    fetchCourseAvailability();
  }, [courseGrp.courses]);

  const toggleExpand = () => {
    setExpanded(!expanded);
  };

  return (
    <div className={styles.courseGroupContainer}>
      <div className={styles.courseCardsContainer}>
        {/* First course always shown */}
        <CoreCourseCard 
          courseId={courseGrp.courses[0]} 
          selectedSemester={selectedSemester}
          availability={courseAvailability[courseGrp.courses[0]]}
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
                        {course.id}
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
            availability={courseAvailability[courseId]}
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