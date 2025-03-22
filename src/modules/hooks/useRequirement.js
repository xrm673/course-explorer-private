import { useState, useEffect } from "react";
import { getRequirementById } from "../../firebase/services/requirementService";

export function useRequirement(reqId) {
  const [req, setReq] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
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

  return { req, loading, error };
}