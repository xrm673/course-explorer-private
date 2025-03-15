import { useEffect, useState } from 'react' 
import { useParams } from "react-router"
import { useContext } from 'react';
import { UserContext } from '../../context/UserContext';

import { getMajorById } from '../../firebase/services/majorService'
import MajorRequirement from './MajorRequirement';

export default function SingleMajorPage() {
    const { user, isLoggedIn } = useContext(UserContext);
    const [major, setMajor] = useState(null);
    const [selectedCollegeId, setSelectedCollegeId] = useState('');
    const { majorId } = useParams();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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

    // Handler for college selection change
    const handleCollegeChange = (e) => {
        setSelectedCollegeId(e.target.value);
    };

    // Find requirements for the selected college
    const getSelectedCollegeRequirements = () => {
        if (!major || !major.basicRequirements) return [];
        
        const collegeReq = major.basicRequirements.find(
            req => req.college === selectedCollegeId
        );
        
        return collegeReq ? collegeReq.requirements : [];
    };

    // Get the college name for the selected college ID
    const getSelectedCollegeName = () => {
        if (!major || !major.colleges) return '';
        
        const college = major.colleges.find(c => c.id === selectedCollegeId);
        return college ? college.name : '';
    };

    if (loading) return <h1>Loading...</h1>;
    if (error) return <h1>{error}</h1>;
    if (!major) return <h1>Major not found</h1>;

    return (
        <>
            <h1>{major.name}</h1>
            <h2>Colleges</h2>
            {
                major.colleges.map((college, i) => (
                    <p key={i}>{college.name}</p>
                ))
            }
            <section>
                <h2>Select Your College:</h2>
                <select 
                    value={selectedCollegeId} 
                    onChange={handleCollegeChange}
                    className="college-selector"
                >
                    {major.colleges.map((college, i) => (
                        <option key={i} value={college.id}>
                            {college.name}
                        </option>
                    ))}
                </select>
            </section>

            <section>
                <h2>{getSelectedCollegeName()} Requirements:</h2>
                {getSelectedCollegeRequirements().map((reqId, i) => (
                    <MajorRequirement key={i} reqId={reqId} />
                ))}
            </section>
        </>
    );
}