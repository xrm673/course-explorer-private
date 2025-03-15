import React, { useState, useEffect } from 'react';
import CoreCourseCard from "./CoreCourseCard";
import { getCourseById } from "../../firebase/services/courseService";

export default function CoreCourseGroup({ courseGrp }) {
  const [expanded, setExpanded] = useState(false);
  const [additionalCourses, setAdditionalCourses] = useState([]);
  const [loading, setLoading] = useState(false);

  // Early return with error handling if courseGrp is undefined
  if (!courseGrp || !courseGrp.courses || courseGrp.courses.length === 0) {
    return <div>Missing course group data</div>;
  }

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

  const toggleExpand = () => {
    setExpanded(!expanded);
  };

  return (
    <div className="course-group-container" style={{
      backgroundColor: '#f5f5f5',
      borderRadius: '8px',
      padding: '12px',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      width: '100%',
      height: '100%',
      boxSizing: 'border-box',
      overflow: 'hidden'
    }}>
      <div className="course-cards-container" style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        width: '100%',
        maxWidth: '100%'
      }}>
        {/* First course always shown */}
        <CoreCourseCard courseId={courseGrp.courses[0]} />
        
        {/* Additional courses section */}
        {courseGrp.courses.length > 1 && !expanded && (
          <div className="additional-courses" style={{
            borderTop: '1px solid #ddd',
            marginTop: '10px',
            paddingTop: '10px'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <strong>Also: </strong> 
                {loading ? "Loading..." : (
                  <span>
                    {additionalCourses.map((course, i) => (
                      <span key={i} style={{ marginRight: '5px' }}>
                        {course.id}
                      </span>
                    ))}
                  </span>
                )}
              </div>
              <button 
                onClick={toggleExpand}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#0066cc',
                  cursor: 'pointer',
                  fontSize: '14px',
                  padding: '5px'
                }}
              >
                Show All
              </button>
            </div>
          </div>
        )}
        
        {/* Show all courses when expanded */}
        {expanded && courseGrp.courses.slice(1).map((courseId, i) => (
          <CoreCourseCard key={i} courseId={courseId} />
        ))}
        
        {/* Show collapse button when expanded */}
        {expanded && courseGrp.courses.length > 1 && (
          <button 
            onClick={toggleExpand}
            style={{
              background: 'none',
              border: 'none',
              color: '#0066cc',
              cursor: 'pointer',
              fontSize: '14px',
              textAlign: 'center',
              padding: '5px',
              borderTop: '1px solid #ddd',
              marginTop: '5px'
            }}
          >
            Collapse
          </button>
        )}
      </div>
    </div>
  );
}