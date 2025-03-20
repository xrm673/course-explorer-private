import { useEffect, useState, useContext } from "react"
import { Link } from "react-router"
import { 
  addCourseToSchedule, 
  markCourseAsTaken, 
  removeCourseFromSchedule, 
  getCourseStatus,
  checkCourseEligibility
} from "../../utils/courseUtils"
import { isCourseAvailableInSemester } from "../../utils/semesterUtils";
import { UserContext } from "../../context/UserContext"
import { useSidebar } from "../../modules/core/MainLayout"
import add from "../../assets/add.svg"
import checkMark from "../../assets/checkMark.svg"
import styles from "./ElectiveCourseCard.module.css"

// Updated to receive course object directly instead of courseId
export default function ElectiveCourseCard({ course, selectedSemester, onStatusChange, tags }) {
    // No longer need to fetch or store course data
    const [error, setError] = useState(null);
    const [courseStatus, setCourseStatus] = useState({ isPlanned: false, isTaken: false, semester: null });
    const [eligibility, setEligibility] = useState({ isEligible: true, missingPrereqs: [] });
    
    // Get user context and sidebar context
    const { user, setUser } = useContext(UserContext);
    const { openSidebar } = useSidebar();

    useEffect(() => {
        try {
            // Check if the course is already in the schedule
            if (user && course) {
                const status = getCourseStatus(course.id, user);
                setCourseStatus(status);
                
                // Check course eligibility
                const eligibilityCheck = checkCourseEligibility(course, user);
                setEligibility(eligibilityCheck);
            }
        } catch (err) {
            setError("Failed to check course status");
        }
    }, [course, user]);

    // Handle adding course to schedule
    const handleAddCourse = (e) => {
        e.stopPropagation(); // Prevent event bubbling
        
        if (!course || !user) return;
        
        // Pass the semester code directly to the utility function
        const success = addCourseToSchedule(course, selectedSemester, user, setUser, openSidebar);
        
        if (success) {
            // Update local status
            setCourseStatus({ isPlanned: true, isTaken: false, semester: selectedSemester });
            
            // Notify parent if needed
            if (onStatusChange) {
                onStatusChange({ courseId: course.id, isPlanned: true, isTaken: false });
            }
        }
    };
    
    // Handle marking course as taken
    const handleMarkAsTaken = (e) => {
        e.stopPropagation(); // Prevent event bubbling
        
        if (!course || !user) return;
        
        // Mark the course as taken using the utility function
        const success = markCourseAsTaken(course, user, setUser, openSidebar);
        
        if (success) {
            // Update local status
            setCourseStatus({ isPlanned: false, isTaken: true, semester: "Ungrouped Courses" });
            
            // Notify parent if needed
            if (onStatusChange) {
                onStatusChange({ courseId: course.id, isPlanned: false, isTaken: true });
            }
        }
    };
    
    // Handle removing course from schedule
    const handleRemoveCourse = (e) => {
        e.stopPropagation(); // Prevent event bubbling
        
        if (!course || !user) return;
        
        // Remove the course from the schedule
        const success = removeCourseFromSchedule(course.id, user, setUser);
        
        if (success) {
            // Update local status
            setCourseStatus({ isPlanned: false, isTaken: false, semester: null });
            
            // Notify parent if needed
            if (onStatusChange) {
                onStatusChange({ courseId: course.id, isPlanned: false, isTaken: false });
            }
        }
    };

    // Error handling - now there's no loading state
    if (error) return <div className={styles.error}>{error}</div>;
    if (!course) return <div className={styles.error}>Course data missing</div>;
    
    // Apply different card style based on status and eligibility
    // Note the priority: taken > planned > ineligible > default
    let cardClassName = styles.courseCard;
    let semesterAvailable = isCourseAvailableInSemester(course, selectedSemester)
    
    if (courseStatus.isTaken) {
        cardClassName = `${cardClassName} ${styles.takenCourse}`;
    } else if (courseStatus.isPlanned) {
        cardClassName = `${cardClassName} ${styles.plannedCourse}`;
    } else if (!eligibility.isEligible) {
        cardClassName = `${cardClassName} ${styles.ineligibleCourse}`;
    } else if (!semesterAvailable) {
        cardClassName = `${cardClassName} ${styles.notProvidedCourse}`
    }
    
    // Format missing prerequisites for display
    const formatMissingPrereqs = () => {
      if (!eligibility.missingPrereqs || eligibility.missingPrereqs.length === 0) {
          return '';
      }
      
      // Process each prerequisite group
      const formattedPrereqs = eligibility.missingPrereqs.map(prereq => {
          // If the prereq contains " or " - it's a group of alternative courses
          if (prereq.includes(' or ')) {
              const courses = prereq.split(' or ');
              // If there's more than one course in the group, show just the first one
              // followed by "alternatives"
              if (courses.length > 1) {
                  return `${courses[0]} or equivalent`;
              }
              return prereq;
          }
          // Otherwise return as is
          return prereq;
      });
      
      // Join the processed prereqs with ", "
      return `Need: ${formattedPrereqs.join(', ')}`;
    };

    return(
      <div className={cardClassName}>
        {/* Eligibility Warning */}
        {!courseStatus.isTaken && !courseStatus.isPlanned && !eligibility.isEligible && (
            <div className={styles.eligibilityWarning}>
                {formatMissingPrereqs()}
            </div>
        )}

        {/* Semester Warning */}
        {!courseStatus.isTaken && !semesterAvailable && (
            <div className={styles.seasonWarning}>
                May not be provided in this semester
            </div>
        )}        
        
        {/* Header Section */}
        <div className={styles.header}>
          {/* Course Info */}
          <div className={styles.courseInfo}>
            <p className={styles.courseCode}>
              {course.sbj} {course.nbr}
            </p>
            <h3 className={styles.courseTitle}>
                <Link 
                  to={`/courses/${course.id}`}
                  className={styles["course-title-link"]}
                >
                  {course.ttl}
                </Link>
            </h3>
          </div>
  
          {/* Action Buttons */}
          <div className={styles.actionButtons}>
            {courseStatus.isPlanned || courseStatus.isTaken ? (
                <button 
                    className={styles.removeButton}
                    onClick={handleRemoveCourse}
                    aria-label="Remove course from schedule"
                >
                    ×
                </button>
            ) : (
                <>
                    <img 
                      src={add} 
                      alt="Add the course to my schedule" 
                      className={styles.addButton}
                      onClick={handleAddCourse}
                    />
                    <img 
                      src={checkMark} 
                      alt="Have taken this course" 
                      className={styles.checkButton}
                      onClick={handleMarkAsTaken}
                    />
                </>
            )}
          </div>
        </div>
  
        {/* Tags Section */}
        {tags.length > 0 && (
          <div className={styles.tagsContainer}> 
            {tags.map((tag, i) => (
              <span 
                key={i}
                className={styles.tag}
              >
                {tag}
              </span>
            ))}
          </div>
        )}
  
        {/* Review Score */}
        {course.ov && (
          <div className={styles.reviewScore}>
            <span className={styles.score}>
              {course.ov}
            </span>
            <span className={styles.ratingLabel}>
              Course Rating
            </span>
          </div>
        )}
      </div>
    );
}