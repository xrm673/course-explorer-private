import { useState, useEffect } from "react";

import { getRequirementById } from "../../firebase/services/requirementService";

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


    return(
        <>
            <p>{ req.name }</p>
        </>
    )
}