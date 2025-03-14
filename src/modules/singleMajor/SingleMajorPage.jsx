import { useEffect, useState } from 'react' 
import { useParams } from "react-router"

import { getMajorById } from '../../firebase/services/majorService'

export default function singleMajorPage() {
    const [major, setMajor] = useState(null);
    const { majorId } = useParams();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    useEffect(() => {
        const fetchMajor = async () => {
            try {
                const majorData = await getMajorById(majorId);
                setMajor(majorData);
                setLoading(false);
            } catch (err) {
                console.error(`Error fetching major ${majorId}:`, err);
                setError("Failed to load major data");
                setLoading(false);
            }
        };
        
        fetchMajor();
    }, [majorId]); // Add majorId to dependency array

    if (loading) return <h1>Loading...</h1>;
    if (error) return <h1>{error}</h1>;
    if (!major) return <h1>Major not found</h1>;

    return (
        <>
            <h1>{ major.name }</h1>
            {/* Add more major details as needed */}
        </>
    );
}