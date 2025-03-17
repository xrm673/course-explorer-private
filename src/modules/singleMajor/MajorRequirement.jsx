import { useState, useEffect } from "react";
import { getRequirementById } from "../../firebase/services/requirementService";
import { getCourseById } from "../../firebase/services/courseService";
import { isCourseAvailableInSemester } from "../../utils/semesterUtils";
import styles from "./MajorRequirement.module.css";

import ElectiveCourseCard from "./ElectiveCourseCard";
import CoreCourseGroup from "./CoreCourseGroup";

export default function MajorRequirement({ reqId, selectedSemester }) {
    const [req, setReq] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [filteredCourses, setFilteredCourses] = useState([]);
    const [isFiltering, setIsFiltering] = useState(true);
    const coursesPerPage = 9;

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

    // Filter courses based on selected semester
    useEffect(() => {
        if (!req || !req.courses || !selectedSemester) return;

        setIsFiltering(true);
        // Reset to first page when changing semester
        setCurrentPage(1);

        const filterCourses = async () => {
            try {
                const availableCourses = [];
                
                // Check each course for availability in the selected semester
                for (const courseId of req.courses) {
                    try {
                        const courseData = await getCourseById(courseId);
                        if (isCourseAvailableInSemester(courseData, selectedSemester)) {
                            availableCourses.push(courseId);
                        }
                    } catch (err) {
                        console.error(`Error checking course ${courseId}:`, err);
                    }
                }
                
                setFilteredCourses(availableCourses);
                setIsFiltering(false);
            } catch (err) {
                console.error("Error filtering courses:", err);
                setIsFiltering(false);
            }
        };

        filterCourses();
    }, [req, selectedSemester]);

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

    // Change page
    const paginate = (pageNumber) => setCurrentPage(pageNumber);
    
    // Go to next page
    const nextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };
    
    // Go to previous page
    const prevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    return (
        <div className={styles.requirementSection}>
            <div className={styles.header}>
                <h3 className={styles.requirementTitle}>
                    {req.name}
                </h3>
                
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
        </div>
    );
}