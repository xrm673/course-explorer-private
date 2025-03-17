import { useEffect, useState } from "react"
import { Link } from "react-router"
import { getCourseById } from "../../firebase/services/courseService"
import { isCourseAvailableInSemester } from "../../utils/semesterUtils"
import add from "../../assets/add.svg"
import checkMark from "../../assets/checkMark.svg"
import styles from "./ElectiveCourseCard.module.css"

export default function ElectiveCourseCard({ courseId, selectedSemester }) {
    const [course, setCourse] = useState(null)
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isAvailable, setIsAvailable] = useState(true);

    useEffect (() => {
        const fetchCourse = async () => {
            try {
                const courseData = await getCourseById(courseId)
                setCourse(courseData)
                
                // Check if the course is available in the selected semester
                if (selectedSemester) {
                    const available = isCourseAvailableInSemester(courseData, selectedSemester);
                    setIsAvailable(available);
                }
                
                setLoading(false)
            } catch (err) {
                setError("Failed to load")
                setLoading(false)
            }
        } 
        fetchCourse()
    }, [courseId, selectedSemester])

    if (loading) return <div className={styles.loading}>Loading...</div>;
    if (error) return <div className={styles.error}>{error}</div>;

    const tags = ["Tag 1", "Tag 2", "Tag 3"]
    
    // For elective courses, if it's not available in the selected semester,
    // it was already filtered out at the MajorRequirement level, so we just render normally

    return(
      <div className={styles.courseCard}>
        {/* Header Section */}
        <div className={styles.header}>
          {/* Course Info */}
          <div className={styles.courseInfo}>
            <p className={styles.courseCode}>
              {course.id}
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
            <img 
              src={add} 
              alt="Add the course to my schedule" 
              className={styles.addButton}
            />
            <img 
              src={checkMark} 
              alt="Have taken this course" 
              className={styles.checkButton}
            />
          </div>
        </div>
  
        {/* Tags Section */}
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
  
        {/* Review Score */}
        <div className={styles.reviewScore}>
          <span className={styles.score}>
            4.2
          </span>
          <span className={styles.ratingLabel}>
            Course Rating
          </span>
        </div>
      </div>
    );
}