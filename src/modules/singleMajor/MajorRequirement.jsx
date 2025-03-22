import { useState, useEffect, useContext, useRef } from "react";
import { getRequirementById } from "../../firebase/services/requirementService";
import { getCourseById } from "../../firebase/services/courseService";
import { isCourseAvailableInSemester } from "../../utils/semesterUtils";
import { checkCourseEligibility, isCourseInRequirement } from "../../utils/courseUtils";
import { applyRequirementFilters, applyDistributionFilters } from "../../utils/filterUtils";
import { UserContext } from "../../context/UserContext";
import { useAcademic } from "../../context/AcademicContext";
import styles from "./MajorRequirement.module.css";

import { useRequirement } from "../hooks/useRequirement"
import { useFilter } from "../hooks/useFilter";

import ElectiveCourseCard from "./ElectiveCourseCard";
import CoreCourseGroup from "./CoreCourseGroup";
import { RequirementDescription } from "./RequirementDescription";
import FilterModal from "../filterModal/FilterModal";
import filterIcon from "../../assets/filterIcon.svg";
import refreshIcon from "../../assets/refresh.svg"

export default function MajorRequirement({ reqId, selectedSemester }) {
    const { user } = useContext(UserContext);
    const { academicData } = useAcademic(); // Added academicData
    const [currentPage, setCurrentPage] = useState(1);
    const [filteredCourses, setFilteredCourses] = useState([]);
    const [completedCourses, setCompletedCourses] = useState([]);
    const [isFiltering, setIsFiltering] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false); // State for refresh animation
    const [refreshTrigger, setRefreshTrigger] = useState(0); // New state to force refresh
    const [completionStatus, setCompletionStatus] = useState("");
    const coursesPerPage = 6;

    // Track when filtering should occur
    const filterTriggerRef = useRef({
        shouldFilter: true,  // true initially to run on first load
        initialLoadComplete: false
    });

    const [showFilterModal, setShowFilterModal] = useState(false);

    // Enhanced function to explicitly trigger filtering with visual feedback
    const triggerFiltering = () => {
        setIsRefreshing(true); // Start refresh animation
        filterTriggerRef.current.shouldFilter = true;
        
        // Increment the refresh trigger to force the effect to run
        setRefreshTrigger(prev => prev + 1);
    };

    // Fetch requirement data
    const { req, loading, error } = useRequirement(reqId);

    // Get filters data
    const { filters, applyFilters } = useFilter(showFilterModal, user, academicData);

    // Add this useEffect in MajorRequirement.jsx
    useEffect(() => {
        // When reqId changes (which happens during concentration change)
        if (filterTriggerRef.current.initialLoadComplete) {
            triggerFiltering();
        }
    }, [reqId]); // Depend on reqId changes

    // Calculate completion status
    useEffect(() => {
        if (!req || !user || !user.scheduleData || !user.scheduleData.taken) {
            setCompletionStatus("");
            return;
        }
        
        // Get the number of courses required
        const requiredCount = req.number || 0;
        
        if (requiredCount === 0) {
            setCompletionStatus("");
            return;
        }
        
        // Extract taken courses set for efficient lookups
        const takenCoursesSet = new Set();
        Object.values(user.scheduleData.taken).forEach(semester => {
            semester.forEach(course => {
                if (course && course.code) {
                    takenCoursesSet.add(course.code);
                }
            });
        });
        
        let completedCount = 0;
        
        // If this is a core requirement with course groups
        if (req.courseGrps) {
            // For core requirements, check if any course in each group has been taken
            req.courseGrps.forEach(group => {
                // Check if any course in the group is taken
                const hasCompletedInGroup = group.courses.some(courseId => 
                    takenCoursesSet.has(courseId)
                );
                
                if (hasCompletedInGroup) {
                    completedCount++;
                }
            });
        } 
        // For elective requirements with individual courses
        else if (req.courses) {
            // Count individual completed courses
            req.courses.forEach(courseId => {
                if (takenCoursesSet.has(courseId)) {
                    completedCount++;
                }
            });
        }
        
        // Format the completion status
        setCompletionStatus(`(${completedCount}/${requiredCount})`);
    }, [req, user]);

    // Load and filter courses - modified to only run when explicitly triggered
    useEffect(() => {
        if (!req || !req.courses || !selectedSemester || !academicData) return;

        // Only filter if explicitly triggered or on initial load
        if (filterTriggerRef.current.shouldFilter) {
            setIsFiltering(true);
            setCurrentPage(1);

            const filterCourses = async () => {
                try {
                    // Create an efficient lookup for taken courses
                    const takenCoursesSet = new Set();
                    if (user && user.scheduleData && user.scheduleData.taken) {
                        Object.values(user.scheduleData.taken).forEach(semester => {
                            semester.forEach(course => {
                                if (course && course.code) {
                                    takenCoursesSet.add(course.code);
                                }
                            });
                        });
                    }
                    
                    // Load all courses at once for better performance
                    const coursePromises = req.courses.map(courseId => getCourseById(courseId));
                    const allCourseData = await Promise.all(coursePromises);
                    
                    // Filter out null results
                    const validCourseData = allCourseData.filter(course => course !== null);
                    
                    // Separate completed courses and filter/score available courses
                    const completedCoursesList = [];
                    const courseResults = [];
                    
                    for (const course of validCourseData) {
                        // Check if already taken
                        if (takenCoursesSet.has(course.id)) {
                            completedCoursesList.push(course);
                            continue;
                        }
                        
                        let score = 0;
                        let shouldKeep = true;
                        let tags = [];
                        let status = "Normal";
                        
                        // Check semester availability
                        if (!isCourseAvailableInSemester(course, selectedSemester)) {
                            score -= 50;
                            status = "Not Provided"
                        }
                        
                        // Apply level filters
                        if (course.lvl) {
                            const levelKey = (course.lvl * 1000).toString();
                            
                            // Apply "only" filter
                            const hasLevelOnlyFilter = Object.values(filters.level).some(level => level.only);
                            if (hasLevelOnlyFilter && !filters.level[levelKey]?.only) {
                                shouldKeep = false;
                                continue;
                            }
                            
                            // Apply "prefer" filter
                            if (filters.level[levelKey]?.prefer) {
                                score += 5;
                            }
                        }

                        // Apply Overall Score filters
                        // Apply "only" filter
                        if (filters.overallScore["High Overall Score"]?.only) {
                            if (!course.ov || course.ov < 3.5) {
                                shouldKeep = false;
                                continue;
                            }
                        }
                        // Apply "prefer" filter
                        if (filters.overallScore["High Overall Score"]?.prefer) {
                            if (course.ov && course.ov >= 3.5) {
                                score += 5 * course.ov
                            } else if (course.ov && course.ov < 2.0) {
                                score -= (2-course.ov) * 10
                            }
                        }
                        
                        // Check eligibility filters
                        if (user) {
                            const eligibility = checkCourseEligibility(course, user);
                            
                            // Apply "only" filter
                            if (filters.enrollment.eligible?.only && !eligibility.isEligible) {
                                shouldKeep = false;
                                continue;
                            }
                            
                            // Apply "prefer" filter
                            if (filters.enrollment.eligible?.prefer && eligibility.isEligible) {
                                score += 20;
                            }
                        }

                        // Apply distribution filters
                        const { score: distrScore, shouldKeep: distrKeep, tags: distrTags } = 
                        applyDistributionFilters(course, filters);
                        score += distrScore;
                        if (!distrKeep) {
                            shouldKeep = false;
                            continue;
                        }
                        tags.push(...distrTags)

                        // Apply requirement filters
                        const { score: reqScore, shouldKeep: reqShouldKeep, tags: reqTags } = 
                        applyRequirementFilters(course, filters);
                        score += reqScore;
                        if (!reqShouldKeep) {
                            shouldKeep = false;
                            continue;
                        }
                        tags.push(...reqTags)
                        
                        // If course passed all filters, add it to results
                        if (shouldKeep) {
                            courseResults.push({
                                course: course,
                                score: score,
                                requirementTags: tags
                            });
                        }
                    }
                    
                    // Sort courses by score (highest first)
                    courseResults.sort((a, b) => b.score - a.score);
                    
                    // Store completed courses
                    setCompletedCourses(completedCoursesList);
                    
                    // Store the sorted array directly to ensure order is preserved
                    // Store full course objects in sorted order
                    const sortedCourses = courseResults.map(result => result.course);
                    
                    // Store the entire object with course and tags:
                    setFilteredCourses(courseResults);
                    
                    // Reset trigger flag and set initial load as complete
                    filterTriggerRef.current.shouldFilter = false;
                    filterTriggerRef.current.initialLoadComplete = true;
                    setIsFiltering(false);
                    setIsRefreshing(false); // Stop refresh animation
                } catch (err) {
                    console.error("Error filtering courses:", err);
                    filterTriggerRef.current.shouldFilter = false;
                    setIsFiltering(false);
                    setIsRefreshing(false); // Stop refresh animation even on error
                }
            };

            filterCourses();
        }
    }, [req, selectedSemester, filters, user, refreshTrigger, academicData]); // Added academicData to dependencies

    // Re-trigger filtering when semester changes
    useEffect(() => {
        if (filterTriggerRef.current.initialLoadComplete) {
            triggerFiltering();
        }
    }, [selectedSemester]);

    // Handle filter icon click
    const handleFilterClick = () => {
        setShowFilterModal(true);
    };

    // Handle refresh icon click
    const handleRefreshClick = () => {
        // If already refreshing, don't trigger again
        if (isRefreshing) return;
        triggerFiltering();
    };

    // Handle applying filters - updated to trigger filtering
    const handleApplyFilters = (newFilters) => {
        applyFilters(newFilters);
        triggerFiltering();
        setShowFilterModal(false);
      };

    if (loading) return <div className={styles.loading}>Loading...</div>;
    if (error) return <div className={styles.error}>{error}</div>;
    if (!req) return <div className={styles.error}>Not found</div>;

    const isCoreReq = !(req.courses && Array.isArray(req.courses) && req.courses.length > 0);

    // Pagination logic for elective courses
    const totalCourses = isCoreReq ? 0 : filteredCourses.length;
    const totalPages = Math.ceil(totalCourses / coursesPerPage);
    
    // Get current courses for the page
    const indexOfLastCourse = currentPage * coursesPerPage;
    const indexOfFirstCourse = indexOfLastCourse - coursesPerPage;
    const currentCourses = isCoreReq ? [] : filteredCourses.slice(indexOfFirstCourse, indexOfLastCourse);

    // Pagination functions
    const paginate = (pageNumber) => setCurrentPage(pageNumber);
    const nextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };
    const prevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    return (
        <div className={styles.requirementSection}>
            <div className={styles.header}>
                <div className={styles.titleSection}>
                    <h3 className={styles.requirementTitle}>
                        {req.name}
                    </h3>
                    <span className={styles.requirementProgress}>
                        {completionStatus}
                    </span>
                </div>
                
                <div className={styles.headerControls}>
                    {!isCoreReq && (
                        <>
                            <img 
                                src={refreshIcon} 
                                alt="Refresh courses"
                                className={`${styles.filterIcon} ${isRefreshing ? styles.spinning : ''}`}
                                onClick={handleRefreshClick}
                                style={{ cursor: isRefreshing ? 'wait' : 'pointer' }}
                                title="Refresh course list"
                            />
                            <img 
                                src={filterIcon} 
                                alt="Filter courses"
                                className={`${styles.filterIcon} ${Object.values(filters).some(
                                    category => Object.values(category).some(
                                        option => option.only || option.prefer
                                    )
                                ) ? styles.filterActive : ''}`}
                                onClick={handleFilterClick}
                                title="Filter courses"
                            />
                        </>
                    )}
                    
                    {!isCoreReq && totalPages > 1 && (
                        <div className={styles.paginationControls}>
                            <button 
                                onClick={prevPage} 
                                disabled={currentPage === 1}
                                className={`${styles.paginationButton} ${currentPage === 1 ? styles.paginationButtonDisabled : ''}`}
                                aria-label="Previous page"
                            >
                                &lt;
                            </button>
                            <span className={styles.paginationText}>
                                Page {currentPage} of {totalPages}
                            </span>
                            <button 
                                onClick={nextPage} 
                                disabled={currentPage === totalPages}
                                className={`${styles.paginationButton} ${currentPage === totalPages ? styles.paginationButtonDisabled : ''}`}
                                aria-label="Next page"
                            >
                                &gt;
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {req.descr && <RequirementDescription descriptions={req.descr} />}
            
            {/* Display completed courses for elective requirements */}
            {!isCoreReq && completedCourses.length > 0 && (
                <div className={styles.completedCoursesSection}>
                    <h4 className={styles.completedCoursesTitle}>Completed Courses:</h4>
                    <div className={styles.completedCoursesList}>
                        {completedCourses.map((course, index) => (
                            <span key={course.id || index} className={styles.completedCourseItem}>
                                {course.id}: {course.tts || course.ttl || course.id}
                            </span>
                        ))}
                    </div>
                </div>
            )}
            
            {isCoreReq ? (
                <div className={styles.coreCoursesGrid}>
                    {req.courseGrps.map((grp, i) => (
                        <CoreCourseGroup 
                            key={i} 
                            courseGrp={grp} 
                            selectedSemester={selectedSemester}
                        />
                    ))}
                </div>
            ) : isFiltering ? (
                <div className={styles.loadingFilter}>Filtering courses...</div>
            ) : filteredCourses.length === 0 ? (
                <div className={styles.noCourses}>
                    No courses available for {selectedSemester}
                </div>
            ) : (
                <div className={styles.electiveCoursesGrid}>
                    {currentCourses.map((courseResult) => (
                        <ElectiveCourseCard 
                            key={courseResult.course.id} 
                            course={courseResult.course}  
                            selectedSemester={selectedSemester}
                            tags={courseResult.requirementTags}
                        />
                    ))}
                </div>
            )}
            
            {!isCoreReq && totalPages > 1 && (
                <div className={styles.paginationDots}>
                    {Array.from({ length: totalPages }).map((_, index) => (
                        <button
                            key={index}
                            onClick={() => paginate(index + 1)}
                            className={`${styles.paginationDot} ${currentPage === index + 1 ? styles.paginationDotActive : ''}`}
                            aria-label={`Page ${index + 1}`}
                        >
                            {index + 1}
                        </button>
                    ))}
                </div>
            )}
            
            <FilterModal 
                isOpen={showFilterModal}
                onClose={() => setShowFilterModal(false)}
                filters={filters}
                onApplyFilters={handleApplyFilters} 
            />
        </div>
    );
}