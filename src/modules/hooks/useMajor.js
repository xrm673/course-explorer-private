import { useState, useEffect } from "react";
import { getMajorById } from "../../firebase/services/majorService";

export function useMajor(majorId) {
    const [major, setMajor] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedCollegeId, setSelectedCollegeId] = useState('');

    useEffect(() => {
        const fetchMajor = async () => {
            try {
                const majorData = await getMajorById(majorId);
                setMajor(majorData);
                
                if (majorData.colleges && majorData.colleges.length > 0) {
                    setSelectedCollegeId(majorData.colleges[0].id);
                }
                
                setLoading(false);
            } catch (err) {
                console.error(`Error fetching major ${majorId}:`, err);
                setError("Failed to load major data");
                setLoading(false);
            }
        };
        
        fetchMajor();
    }, [majorId]);
    return { major, selectedCollegeId, setSelectedCollegeId, loading, error };
}