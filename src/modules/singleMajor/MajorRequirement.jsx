import { useState, useEffect, useContext } from "react";
import { getRequirementById } from "../../firebase/services/requirementService";
import { getCourseById } from "../../firebase/services/courseService";
import { isCourseAvailableInSemester } from "../../utils/semesterUtils";
import { checkCourseEligibility } from "../../utils/courseUtils";
import { UserContext } from "../../context/UserContext";
import styles from "./MajorRequirement.module.css";

import ElectiveCourseCard from "./ElectiveCourseCard";
import CoreCourseGroup from "./CoreCourseGroup";
import FilterModal from "../filterModal/FilterModal";
import filterIcon from "../../assets/filterIcon.svg";

export default function MajorRequirement({ reqId, selectedSemester }) {
    const { user } = useContext(UserContext);
    const [req, setReq] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [filteredCourses, setFilteredCourses] = useState([]);
    const [coursesWithData, setCoursesWithData] = useState([]);
    const [completedCourses, setCompletedCourses] = useState([]);
    const [isFiltering, setIsFiltering] = useState(true);
    const [completionStatus, setCompletionStatus] = useState("");
    const coursesPerPage = 9;

    const [showFilterModal, setShowFilterModal] = useState(false);
    const [activeFilters, setActiveFilters] = useState({
        level: {
          1000: { only: false, prefer: true },
          2000: { only: false, prefer: true },
          3000: { only: false, prefer: true },
          4000: { only: false, prefer: true },
          5000: { only: false, prefer: false }
        },
        enrollment: {
          eligible: { only: false, prefer: true },
        },
        instructionMode: {
          inPerson: { only: false, prefer: false },
          onlineRecording: { only: false, prefer: false },
          onlineLive: { only: false, prefer: false },
          hybrid: { only: false, prefer: false },
          others: { only: false, prefer: false }
        },
        majorRequirements: {}
    });

    // Fetch requirement data
    useEffect(() => {
        const fetchRequirement = async () => {
            try {
                const reqData = await getRequirementById(reqId);
                setReq(reqData);
                setLoading(false);
            } catch (err) {
                setError("Failed to load");
                setLoading(false);
            }
        };
        fetchRequirement();
    }, [reqId]);

    // Calculate completion status whenever user or requirement data changes
    useEffect(() => {
        if (!req || !user || !user.scheduleData || !user.scheduleData.taken) {
            setCompletionStatus("");
            return;
        }
        
        // Get the number of courses required (from the requirement data)
        const requiredCount = req.number || 0;
        
        if (requiredCount === 0) {
            setCompletionStatus("");
            return;
        }
        
        // Count how many courses in this requirement the user has taken
        let completedCount = 0;
        
        // Get all courses the user has taken (from all semesters)
        const takenCourses = [];
        Object.values(user.scheduleData.taken).forEach(semester => {
            semester.forEach(course => {
                if (course && course.code) {
                    takenCourses.push(course.code);
                }
            });
        });
        
        // If this is a core requirement with course groups
        if (req.courseGrps) {
            // For core requirements, check if any course in each group has been taken
            req.courseGrps.forEach(group => {
                // For each group, if any course in the group is taken, count the group as completed
                const hasCompletedInGroup = group.courses.some(courseId => 
                    takenCourses.includes(courseId)
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
                if (takenCourses.includes(courseId)) {
                    completedCount++;
                }
            });
        }
        
        // Format the completion status
        setCompletionStatus(`(${completedCount}/${requiredCount})`);
    }, [req, user]);

    // Filter courses based on selected semester and filters
    useEffect(() => {
        if (!req || !req.courses || !selectedSemester) return;

        setIsFiltering(true);
        setCurrentPage(1);

        const filterCourses = async () => {
            try {
                const availableCourses = [];
                const courseDataList = [];
                const completedCoursesList = [];
                
                // Get all courses the user has taken
                const takenCourses = [];
                if (user && user.scheduleData && user.scheduleData.taken) {
                    Object.values(user.scheduleData.taken).forEach(semester => {
                        semester.forEach(course => {
                            if (course && course.code) {
                                takenCourses.push(course.code);
                            }
                        });
                    });
                }
                
                // Step 1: Filter by semester availability and separate completed courses
                for (const courseId of req.courses) {
                    try {
                        const courseData = await getCourseById(courseId);
                        
                        // Check if the course has been completed
                        if (takenCourses.includes(courseId)) {
                            completedCoursesList.push(courseData);
                        }
                        // Otherwise, check if it's available this semester
                        else if (isCourseAvailableInSemester(courseData, selectedSemester)) {
                            availableCourses.push(courseId);
                            courseDataList.push(courseData);
                        }
                    } catch (err) {
                        console.error(`Error checking course ${courseId}:`, err);
                    }
                }
                
                // Update state with completed courses
                setCompletedCourses(completedCoursesList);
                
                // Update available courses
                setCoursesWithData(courseDataList);
                
                // Step 2: Apply user preference filters to available courses
                const filteredIds = processCourseFilters(courseDataList, activeFilters, user);
                setFilteredCourses(filteredIds);
                
                setIsFiltering(false);
            } catch (err) {
                console.error("Error filtering courses:", err);
                setIsFiltering(false);
            }
        };

        filterCourses();
    }, [req, selectedSemester, user]);
    
    // Reapply filters when activeFilters change
    useEffect(() => {
        if (coursesWithData.length === 0 || isFiltering) return;
        
        const filteredIds = processCourseFilters(coursesWithData, activeFilters, user);
        setFilteredCourses(filteredIds);
        setCurrentPage(1);
    }, [activeFilters, coursesWithData, user, isFiltering]);

    // Process filter preferences and score courses
    const processCourseFilters = (courses, filters, user) => {
        // Calculate score and filter courses based on filter preferences
        const scoredCourses = courses.map(course => {
            let score = 0;
            let shouldKeep = true;
            
            // Check course level filters
            if (course.lvl) {
                const levelKey = (Math.floor(course.lvl / 1000) * 1000).toString();
                
                // Apply "only" filter
                const hasLevelOnlyFilter = Object.values(filters.level).some(level => level.only);
                if (hasLevelOnlyFilter && !filters.level[levelKey]?.only) {
                    shouldKeep = false;
                }
                
                // Apply "prefer" filter
                if (filters.level[levelKey]?.prefer) {
                    score += 5;
                }
            }
            
            // Check eligibility filters
            if (user) {
                const eligibility = checkCourseEligibility(course, user);
                
                // Apply "only" filter
                if (filters.enrollment.eligible?.only && !eligibility.isEligible) {
                    shouldKeep = false;
                }
                
                // Apply "prefer" filter
                if (filters.enrollment.eligible?.prefer && eligibility.isEligible) {
                    score += 5;
                }
            }
            
            // Check instruction mode filters
            if (course.instructionMode) {
                const modeKey = getModeKey(course.instructionMode);
                
                // Apply "only" filter
                const hasModeOnlyFilter = Object.values(filters.instructionMode).some(mode => mode.only);
                if (hasModeOnlyFilter && !filters.instructionMode[modeKey]?.only) {
                    shouldKeep = false;
                }
                
                // Apply "prefer" filter
                if (filters.instructionMode[modeKey]?.prefer) {
                    score += 3;
                }
            }
            
            return { course, score, shouldKeep };
        });
        
        // Filter out courses that should be excluded
        const filteredAndScoredCourses = scoredCourses
            .filter(item => item.shouldKeep)
            .sort((a, b) => b.score - a.score); // Sort by score (highest first)
            
        return filteredAndScoredCourses.map(item => item.course.id);
    };
    
    // Helper function to map instruction mode to filter key
    const getModeKey = (mode) => {
        if (!mode) return 'others';
        
        const modeStr = mode.toLowerCase();
        if (modeStr.includes('in-person')) return 'inPerson';
        if (modeStr.includes('online') && modeStr.includes('recording')) return 'onlineRecording';
        if (modeStr.includes('online') && modeStr.includes('live')) return 'onlineLive';
        if (modeStr.includes('hybrid')) return 'hybrid';
        return 'others';
    };

    // Handle filter icon click
    const handleFilterClick = () => {
        setShowFilterModal(true);
    };

    // Handle applying filters
    const handleApplyFilters = (filters) => {
        setActiveFilters(filters);
        setShowFilterModal(false);
    };

    if (loading) return <h1>Loading...</h1>;
    if (error) return <h1>{error}</h1>;
    if (!req) return <h1>Not found</h1>;

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
                    <img 
                        src={filterIcon} 
                        alt="Filter courses"
                        className={styles.filterIcon}
                        onClick={handleFilterClick}
                    />
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
            
            {/* Display completed courses for elective requirements */}
            {!isCoreReq && completedCourses.length > 0 && (
                <div className={styles.completedCoursesSection}>
                    <h4 className={styles.completedCoursesTitle}>Completed Courses:</h4>
                    <div className={styles.completedCoursesList}>
                        {completedCourses.map((course, index) => (
                            <span key={index} className={styles.completedCourseItem}>
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
                    {currentCourses.map((courseId, i) => (
                        <ElectiveCourseCard 
                            key={i} 
                            courseId={courseId} 
                            selectedSemester={selectedSemester}
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
                        >
                            {index + 1}
                        </button>
                    ))}
                </div>
            )}
            
            <FilterModal 
                isOpen={showFilterModal}
                onClose={() => setShowFilterModal(false)}
                activeFilters={activeFilters}
                onApplyFilters={handleApplyFilters} 
            />
        </div>
    );
}