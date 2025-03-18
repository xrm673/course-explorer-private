import React, { useState, useEffect, useContext, useRef } from 'react';
import { UserContext } from '../../../context/UserContext';
import { useAcademic } from '../../../context/AcademicContext';
import { getCourseById } from '../../../firebase/services/courseService';
import { checkCourseEligibility, getCourseStatus } from '../../../utils/courseUtils';
import { isCourseAvailableInSemester } from "../../../utils/semesterUtils";
import { useSidebar } from '../../core/MainLayout';
import { 
  addCourseToSchedule, 
  markCourseAsTaken, 
  removeCourseFromSchedule 
} from '../../../utils/courseUtils';
import refreshIcon from '../../../assets/refresh.svg';
import HomeCourseCard from './HomeCourseCard';
import styles from './CoursePicks.module.css';

export default function CoursePicks() {
    const { user, setUser } = useContext(UserContext);
    const { academicData } = useAcademic();
    const { openSidebar } = useSidebar();
    const [recommendedCourses, setRecommendedCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    
    // Current semester for planning
    const currentSemester = "FA25"; // Fall 2025
    
    // Track course statuses
    const [courseStatuses, setCourseStatuses] = useState({});
    
    // Ref to track whether we should refresh recommendations
    const refreshTriggerRef = useRef({
        shouldRefresh: true,
        initialLoadComplete: false
    });
    
    // Function to trigger refreshing of recommendations
    const triggerRefresh = () => {
        setIsRefreshing(true);
        refreshTriggerRef.current.shouldRefresh = true;
        setRefreshTrigger(prev => prev + 1);
    };
    
    // Update course status in our component state
    const updateCourseStatus = (courseId, newStatus) => {
        setCourseStatuses(prev => ({
            ...prev,
            [courseId]: newStatus
        }));
    };
    
    // Handle adding course to schedule
    const handleAddCourse = (course) => {
        if (!course || !user) return;
        
        const success = addCourseToSchedule(course, currentSemester, user, setUser, openSidebar);
        
        if (success) {
            updateCourseStatus(course.id, { isPlanned: true, isTaken: false, semester: currentSemester });
        }
    };
    
    // Handle marking course as taken
    const handleMarkAsTaken = (course) => {
        if (!course || !user) return;
        
        const success = markCourseAsTaken(course, user, setUser, openSidebar);
        
        if (success) {
            updateCourseStatus(course.id, { isPlanned: false, isTaken: true, semester: "Ungrouped Courses" });
        }
    };
    
    // Handle removing course from schedule
    const handleRemoveCourse = (course) => {
        if (!course || !user) return;
        
        const success = removeCourseFromSchedule(course.id, user, setUser);
        
        if (success) {
            updateCourseStatus(course.id, { isPlanned: false, isTaken: false, semester: null });
        }
    };
    
    // Main effect to fetch and process recommended courses
    useEffect(() => {
        if (!user || !academicData || !academicData.requirements) {
            setLoading(false);
            return;
        }
        
        // Only refresh if explicitly triggered or on initial load
        if (!refreshTriggerRef.current.shouldRefresh) {
            return;
        }
        
        setLoading(true);
        
        const fetchRecommendedCourses = async () => {
            try {
                // Get all taken courses for quick lookup
                const takenCoursesSet = new Set();
                if (user.scheduleData && user.scheduleData.taken) {
                    Object.values(user.scheduleData.taken).forEach(semester => {
                        semester.forEach(course => {
                            if (course && course.code) {
                                takenCoursesSet.add(course.code);
                            }
                        });
                    });
                }
                
                // Also include planned courses
                const plannedCoursesSet = new Set();
                if (user.scheduleData && user.scheduleData.planned) {
                    Object.values(user.scheduleData.planned).forEach(semester => {
                        semester.forEach(course => {
                            if (course && course.code) {
                                plannedCoursesSet.add(course.code);
                            }
                        });
                    });
                }
                
                // Find all core requirements
                const coreRequirementIds = [];
                Object.entries(academicData.requirements).forEach(([reqId, requirement]) => {
                    if (requirement.courseGrps && Array.isArray(requirement.courseGrps)) {
                        coreRequirementIds.push(reqId);
                    }
                });
                
                // Collect all course IDs from core requirements
                const coursePromises = [];
                const courseToRequirementMap = new Map(); // Maps course ID to requirement info
                
                for (const reqId of coreRequirementIds) {
                    const requirement = academicData.requirements[reqId];
                    if (!requirement || !requirement.courseGrps) continue;
                    
                    requirement.courseGrps.forEach(group => {
                        if (!group.courses || !Array.isArray(group.courses)) return;
                        
                        group.courses.forEach(courseId => {
                            // Skip if already taken or planned
                            if (takenCoursesSet.has(courseId) || plannedCoursesSet.has(courseId)) return;
                            
                            // Store mapping of course to requirement
                            if (!courseToRequirementMap.has(courseId)) {
                                courseToRequirementMap.set(courseId, {
                                    reqId,
                                    reqName: requirement.name,
                                    tag: requirement.tag || null
                                });
                                
                                // Add to fetch queue
                                coursePromises.push(getCourseById(courseId));
                            }
                        });
                    });
                }
                
                // Fetch all course data
                const coursesData = await Promise.all(coursePromises);
                
                // Filter out nulls and check eligibility
                const eligibleCourses = [];
                const newCourseStatuses = {};
                
                for (const course of coursesData) {
                    if (!course) continue;
                    
                    // Check if user is eligible for this course
                    const eligibility = checkCourseEligibility(course, user);
                    
                    // Get course status (planned/taken)
                    const status = getCourseStatus(course.id, user);
                    newCourseStatuses[course.id] = status;
                    let availableSemester = true
                    
                    // Check semester availability
                    if (!isCourseAvailableInSemester(course, currentSemester)) {
                        availableSemester = false 
                        continue
                    }
                    // Only include eligible courses that aren't already taken/planned
                    if (eligibility.isEligible && !status.isTaken 
                        && !status.isPlanned && availableSemester) {
                        // Get requirement info
                        const requirementInfo = courseToRequirementMap.get(course.id);
                        
                        // Generate tags based on requirement info
                        const tags = [];
                        if (requirementInfo && requirementInfo.tag) {
                            tags.push(requirementInfo.tag);
                        }
                        
                        // Add course to eligible list with tags
                        eligibleCourses.push({
                            course,
                            tags
                        });
                    }
                }
                
                // Sort by level (lower levels first) to help new students
                eligibleCourses.sort((a, b) => {
                    const levelA = a.course.lvl || 9; // Default to high level if not specified
                    const levelB = b.course.lvl || 9;
                    return levelA - levelB;
                });
                
                // Limit to exactly 6 courses for display
                const limitedCourses = eligibleCourses.slice(0, 6);
                
                // Update state
                setRecommendedCourses(limitedCourses);
                setCourseStatuses(prev => ({ ...prev, ...newCourseStatuses }));
                setLoading(false);
                setIsRefreshing(false);
                
                // Reset refresh flag
                refreshTriggerRef.current.shouldRefresh = false;
                refreshTriggerRef.current.initialLoadComplete = true;
                
            } catch (err) {
                console.error("Error fetching recommended courses:", err);
                setError("Failed to load course recommendations");
                setLoading(false);
                setIsRefreshing(false);
                refreshTriggerRef.current.shouldRefresh = false;
            }
        };
        
        fetchRecommendedCourses();
        
    }, [user, academicData, refreshTrigger]);
    
    // Handle refresh click
    const handleRefreshClick = () => {
        if (isRefreshing) return; // Prevent multiple clicks while refreshing
        triggerRefresh();
    };
    
    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.titleSection}>
                    <h2 className={styles.sectionTitle}>
                        Courses You May Want to Take in {currentSemester}
                    </h2>
                </div>
                
                <div className={styles.headerControls}>
                    <img 
                        src={refreshIcon} 
                        alt="Refresh recommendations"
                        className={`${styles.refreshIcon} ${isRefreshing ? styles.spinning : ''}`}
                        onClick={handleRefreshClick}
                        style={{ cursor: isRefreshing ? 'wait' : 'pointer' }}
                        title="Refresh recommendations"
                    />
                </div>
            </div>
            
            {loading ? (
                <div className={styles.loadingMessage}>Loading course recommendations...</div>
            ) : error ? (
                <div className={styles.errorMessage}>{error}</div>
            ) : recommendedCourses.length === 0 ? (
                <div className={styles.noCoursesMessage}>
                    No course recommendations available at this time. 
                    Please check your major requirements for suggested courses.
                </div>
            ) : (
                <div className={styles.courseGrid}>
                    {recommendedCourses.map(({ course, tags }) => (
                        <HomeCourseCard
                            key={course.id}
                            course={course}
                            tags={tags}
                            status={courseStatuses[course.id] || { isPlanned: false, isTaken: false }}
                            onAddCourse={handleAddCourse}
                            onMarkAsTaken={handleMarkAsTaken}
                            onRemoveCourse={handleRemoveCourse}
                            rating="4.2"
                        />
                    ))}
                </div>
            )}
        </div>
    );
}