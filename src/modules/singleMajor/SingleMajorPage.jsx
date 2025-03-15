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
        <div style={{
            "maxWidth": "1200px",
            "margin": "0 auto",
            "padding": "20px"
        }}>
            <h1 style={{
                "fontSize": "32px",
                "marginBottom": "20px",
                "fontWeight": "700",
                "color": "#333"
            }}>{major.name}</h1>
            
            <section style={{
                "marginBottom": "30px",
                "padding": "20px",
                "backgroundColor": "#f8f9fa",
                "borderRadius": "8px"
            }}>
                <h2 style={{
                    "fontSize": "18px",
                    "marginBottom": "15px",
                    "fontWeight": "600"
                }}>Select Your College:</h2>
                <select 
                    value={selectedCollegeId} 
                    onChange={handleCollegeChange}
                    className="college-selector"
                    style={{
                        "padding": "8px 12px",
                        "borderRadius": "4px",
                        "border": "1px solid #ccc",
                        "fontSize": "16px",
                        "minWidth": "200px"
                    }}
                >
                    {major.colleges.map((college, i) => (
                        <option key={i} value={college.id}>
                            {college.name}
                        </option>
                    ))}
                </select>
            </section>

            <section>
                <h2 style={{
                    "fontSize": "24px",
                    "marginBottom": "20px",
                    "fontWeight": "600",
                    "borderBottom": "2px solid #4a82e3",
                    "paddingBottom": "10px"
                }}>{getSelectedCollegeName()} Requirements</h2>
                
                <div style={{
                    "display": "flex",
                    "flexDirection": "column",
                    "gap": "60px" // This adds significant space between each MajorRequirement
                }}>
                    {getSelectedCollegeRequirements().map((reqId, i) => (
                        <MajorRequirement key={i} reqId={reqId} />
                    ))}
                </div>
            </section>
        </div>
    );
}