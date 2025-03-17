import { useEffect, useState } from "react"
import { Link } from "react-router"
import { getCourseById } from "../../firebase/services/courseService"
import { getCourseSeasonAvailability } from "../../utils/semesterUtils"
import add from "../../assets/add.svg"
import checkMark from "../../assets/checkMark.svg"
import styles from './CoreCourseCard.module.css'

export default function CoreCourseCard({ courseId, selectedSemester, availability }) {
    const [course, setCourse] = useState(null)
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [courseAvailability, setCourseAvailability] = useState(null);
    
    // Determine if the selected semester is a Fall or Spring semester
    const isFallSemester = selectedSemester && selectedSemester.startsWith('FA');
    const isSpringBySemester = selectedSemester && selectedSemester.startsWith('SP');

    useEffect(() => {
        const fetchCourse = async () => {
            try {
                const courseData = await getCourseById(courseId)
                setCourse(courseData)
                
                // If availability is not provided as prop, fetch it
                if (!availability) {
                    const availabilityInfo = getCourseSeasonAvailability(courseData);
                    setCourseAvailability(availabilityInfo);
                } else {
                    setCourseAvailability(availability);
                }
                
                setLoading(false)
            } catch (err) {
                setError("Failed to load")
                setLoading(false)
            }
        } 
        fetchCourse()
    }, [courseId, availability])

    if (loading) return <div className={styles.loading}>Loading...</div>;
    if (error) return <div className={styles.error}>{error}</div>;

    const tags = ["Tag 1", "Tag 2", "Tag 3", "Tag 4", "Tag 5"];
    
    // Determine availability based on selected semester
    const { availableInFall, availableInSpring } = courseAvailability || {};
    const isAvailableInSelectedSeason = isFallSemester ? availableInFall : isSpringBySemester ? availableInSpring : true;
    const availabilityMessage = !isAvailableInSelectedSeason ? 
        `Only offered in ${availableInFall ? 'Fall' : 'Spring'} semester` : '';

    // Determine if we need to show a warning for this course
    const showSeasonWarning = !isAvailableInSelectedSeason;
    
    // Apply different card style based on availability
    const cardClassName = `${styles.cardContainer} ${showSeasonWarning ? styles.unavailableCourse : ''}`;

    return (
        <div className={cardClassName}>
            {/* Season Availability Warning */}
            {showSeasonWarning && (
                <div className={styles.seasonWarning}>
                    {availabilityMessage}
                </div>
            )}
            
            {/* Header Section */}
            <div className={styles.header}>
                {/* Course Info */}
                <div className={styles.courseInfo}>
                    <div className={styles.courseCodeContainer}>
                        <p className={styles.courseCode}>
                            {course.id}
                        </p>
                        {/* Review Score */}
                        <div className={styles.reviewScore}>
                            <span className={styles.score}>
                                4.2
                            </span>
                            <span className={styles.ratingLabel}>
                                Rating
                            </span>
                        </div>
                    </div>
                    <Link to={`/courses/${course.id}`} className={styles.courseTitle}>
                        {course.ttl}
                    </Link>
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
                {tags.map((tag, index) => (
                    <span key={index} className={styles.tag}>
                        {tag}
                    </span>
                ))}
            </div>
        </div>
    )
}