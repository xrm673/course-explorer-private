import { useState, useEffect } from 'react';
import { getAllColleges } from '../../firebase/services/collegeService';
import MajorsInCollege from './MajorsInCollege';

export default function MajorListPage() {
    const [colleges, setColleges] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchColleges = async () => {
            try {
                const collegesData = await getAllColleges()
                setColleges(collegesData)
                setLoading(false);
            } catch (err) {
              console.error("Error fetching colleges:", err);
              setError("Failed to load colleges. Please try again later.");
              setLoading(false);
            }
          };
      
          fetchColleges();
        }, []);

        if (loading) return <div>Loading majors...</div>;
        if (error) return <div>Error: {error}</div>;

    return (
        <>
          {
            colleges.map((college,i) => (
                <MajorsInCollege key={i} college={college} />
            ))}
        </>
    )
}