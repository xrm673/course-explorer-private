import { useEffect, useState, useContext } from "react"
import { Link } from "react-router"
import { getCourseById } from "../../firebase/services/courseService"
import { getCourseSeasonAvailability } from "../../utils/semesterUtils"
import { addCourseToSchedule, markCourseAsTaken, removeCourseFromSchedule, getCourseStatus } from "../../utils/courseUtils" 
import { UserContext } from "../../context/UserContext"
import { useSidebar } from "../../modules/core/MainLayout"
import add from "../../assets/add.svg"
import checkMark from "../../assets/checkMark.svg"
import styles from './CoreCourseCard.module.css'

export default function CoreCourseCard({ courseId, selectedSemester, availability, onStatusChange }) {
    const [course, setCourse] = useState(null)
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [courseAvailability, setCourseAvailability] = useState(null);
    const [courseStatus, setCourseStatus] = useState({ isPlanned: false, isTaken: false, semester: null });
    
    // Get user context and sidebar context
    const { user, setUser } = useContext(UserContext);
    const { openSidebar } = useSidebar();
    
    // Determine if the selected semester is a Fall or Spring semester
    const isFallSemester = selectedSemester && selectedSemester.startsWith('FA');
    const isSpringBySemester = selectedSemester && selectedSemester.startsWith('SP');

    // Fetch course data and check course status
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
                
                // Check if the course is already in the schedule
                if (user) {
                    const status = getCourseStatus(courseId, user);
                    setCourseStatus(status);
                }
                
                setLoading(false)
            } catch (err) {
                setError("Failed to load")
                setLoading(false)
            }
        } 
        fetchCourse()
    }, [courseId, availability, user]);

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
                onStatusChange({ courseId, isPlanned: true, isTaken: false });
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
                onStatusChange({ courseId, isPlanned: false, isTaken: true });
            }
        }
    };
    
    // Handle removing course from schedule
    const handleRemoveCourse = (e) => {
        e.stopPropagation(); // Prevent event bubbling
        
        if (!course || !user) return;
        
        // Remove the course from the schedule
        const success = removeCourseFromSchedule(courseId, user, setUser);
        
        if (success) {
            // Update local status
            setCourseStatus({ isPlanned: false, isTaken: false, semester: null });
            
            // Notify parent if needed
            if (onStatusChange) {
                onStatusChange({ courseId, isPlanned: false, isTaken: false });
            }
        }
    };

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
    
    // Apply different card style based on availability and status
    let cardClassName = styles.cardContainer;
    
    if (courseStatus.isTaken) {
        cardClassName = `${cardClassName} ${styles.takenCourse}`;
    } else if (courseStatus.isPlanned) {
        cardClassName = `${cardClassName} ${styles.plannedCourse}`;
    }
    
    if (showSeasonWarning) {
        cardClassName = `${cardClassName} ${styles.unavailableCourse}`;
    }

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