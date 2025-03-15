import { useState, useEffect } from "react";
import { getRequirementById } from "../../firebase/services/requirementService";

import ElectiveCourseCard from "./ElectiveCourseCard";
import CoreCourseGroup from "./CoreCourseGroup";

export default function MajorRequirement({ reqId }) {
    const [req, setReq] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect (() => {
        const fetchRequirement = async () => {
            try {
                const reqData = await getRequirementById(reqId)
                setReq(reqData)
                setLoading(false)
            } catch (err) {
                setError("Faled to load")
                setLoading(false)
            }
        }
        fetchRequirement()
    }, [])

    if (loading) return <h1>Loading...</h1>;
    if (error) return <h1>{error}</h1>;
    if (!req) return <h1>Not found</h1>;

    const coreReq = !(req.courses && Array.isArray(req.courses) && req.courses.length > 0);


    return(
        <div className="requirement-section">
        <h3 style={{
            "fontSize": "20px",
            "marginBottom": "16px",
            "fontWeight": "600"
        }}>
            {req.name}
        </h3>
        
        {coreReq ? (
            <div>
                {req.courseGrps.map((grp, i) => (
                    <CoreCourseGroup key={i} courseGrp={grp}/>
                ))}
            </div>
        ) : (
            <div style={{
            "display": "grid",
            "gridTemplateColumns": "repeat(auto-fill, minmax(400px, 1fr))",
            "gap": "20px",
            "width": "100%"
            }}>
            {req.courses.map((courseId, i) => (
                <ElectiveCourseCard key={i} courseId={courseId} />
            ))}
            </div>
        )}
        </div>
    )
}