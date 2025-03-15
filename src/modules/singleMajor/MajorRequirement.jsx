import { useState, useEffect } from "react";
import { getRequirementById } from "../../firebase/services/requirementService";

import ElectiveCourseCard from "./ElectiveCourseCard";
import CoreCourseGroup from "./CoreCourseGroup";

export default function MajorRequirement({ reqId }) {
    const [req, setReq] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
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

    if (loading) return <h1>Loading...</h1>;
    if (error) return <h1>{error}</h1>;
    if (!req) return <h1>Not found</h1>;

    const isCoreReq = !(req.courses && Array.isArray(req.courses) && req.courses.length > 0);

    // Pagination logic for elective courses
    const totalCourses = isCoreReq ? 0 : req.courses.length;
    const totalPages = Math.ceil(totalCourses / coursesPerPage);
    
    // Get current courses for the page
    const indexOfLastCourse = currentPage * coursesPerPage;
    const indexOfFirstCourse = indexOfLastCourse - coursesPerPage;
    const currentCourses = isCoreReq ? [] : req.courses.slice(indexOfFirstCourse, indexOfLastCourse);

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
        <div className="requirement-section" style={{
            "width": "94%", // Making the entire section a bit narrower
            "margin": "0 auto",
            "maxWidth": "1200px" // Setting a max width
        }}>
            <div style={{
                "display": "flex",
                "justifyContent": "space-between",
                "alignItems": "center",
                "marginBottom": "16px"
            }}>
                <h3 style={{
                    "fontSize": "20px",
                    "fontWeight": "600",
                    "margin": "0"
                }}>
                    {req.name}
                </h3>
                
                {!isCoreReq && totalPages > 1 && (
                    <div style={{
                        "display": "flex",
                        "alignItems": "center",
                        "gap": "10px"
                    }}>
                        <button 
                            onClick={prevPage} 
                            disabled={currentPage === 1}
                            style={{
                                "padding": "5px 10px",
                                "border": "none",
                                "background": "none",
                                "cursor": currentPage === 1 ? "default" : "pointer",
                                "opacity": currentPage === 1 ? "0.5" : "1"
                            }}
                            aria-label="Previous page"
                        >
                            &lt;
                        </button>
                        <span style={{ "fontSize": "14px" }}>
                            Page {currentPage} of {totalPages}
                        </span>
                        <button 
                            onClick={nextPage} 
                            disabled={currentPage === totalPages}
                            style={{
                                "padding": "5px 10px",
                                "border": "none",
                                "background": "none",
                                "cursor": currentPage === totalPages ? "default" : "pointer",
                                "opacity": currentPage === totalPages ? "0.5" : "1"
                            }}
                            aria-label="Next page"
                        >
                            &gt;
                        </button>
                    </div>
                )}
            </div>
            
            {isCoreReq ? (
                <div style={{
                    "display": "grid",
                    "gridTemplateColumns": "minmax(0, 1fr) minmax(0, 1fr)", // This ensures columns can shrink
                    "gap": "40px", // Gap between columns
                    "width": "100%",
                    "boxSizing": "border-box" // Important for accurate sizing
                }}>
                    {req.courseGrps.map((grp, i) => (
                        <CoreCourseGroup key={i} courseGrp={grp} />
                    ))}
                </div>
            ) : (
                <div style={{
                    "display": "grid",
                    "gridTemplateColumns": "repeat(3, 1fr)", // Fixed 3-column layout
                    "gap": "30px", // Maintained gap
                    "width": "100%"
                }}>
                    {currentCourses.map((courseId, i) => (
                        <ElectiveCourseCard key={i} courseId={courseId} />
                    ))}
                </div>
            )}
            
            {!isCoreReq && totalPages > 1 && (
                <div style={{
                    "display": "flex",
                    "justifyContent": "center",
                    "marginTop": "20px",
                    "gap": "5px"
                }}>
                    {Array.from({ length: totalPages }).map((_, index) => (
                        <button
                            key={index}
                            onClick={() => paginate(index + 1)}
                            style={{
                                "width": "30px",
                                "height": "30px",
                                "border": "1px solid #ccc",
                                "borderRadius": "50%",
                                "display": "flex",
                                "justifyContent": "center",
                                "alignItems": "center",
                                "cursor": "pointer",
                                "background": currentPage === index + 1 ? "#4a82e3" : "white",
                                "color": currentPage === index + 1 ? "white" : "black"
                            }}
                        >
                            {index + 1}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}