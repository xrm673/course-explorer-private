import { useEffect, useState } from 'react' 
import { useParams } from "react-router"
import { useContext } from 'react';
import { UserContext } from '../../context/UserContext';

import { getMajorById } from '../../firebase/services/majorService'
import MajorRequirement from './MajorRequirement';
import SemesterSelector from './SemesterSelector';
import styles from './SingleMajorPage.module.css';

export default function SingleMajorPage() {
    const { user, isLoggedIn } = useContext(UserContext);
    const [major, setMajor] = useState(null);
    const [selectedCollegeId, setSelectedCollegeId] = useState('');
    const [selectedSemester, setSelectedSemester] = useState('FA25'); // Default to Fall 2025
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

    // Handler for semester selection change
    const handleSemesterChange = (semester) => {
        setSelectedSemester(semester);
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
        <div className={styles.container}>
            <h1 className={styles.majorTitle}>{major.name}</h1>
            
            <section className={styles.collegeSelectionSection}>
                <h2 className={styles.collegeSelectionHeading}>Select Your College:</h2>
                <select 
                    value={selectedCollegeId} 
                    onChange={handleCollegeChange}
                    className={styles.collegeSelector}
                >
                    {major.colleges.map((college, i) => (
                        <option key={i} value={college.id}>
                            {college.name}
                        </option>
                    ))}
                </select>
            </section>
            
            {/* Semester Selector component */}
            <SemesterSelector 
                selectedSemester={selectedSemester}
                onSemesterChange={handleSemesterChange}
            />

            <section>
                <h2 className={styles.requirementsHeading}>
                    {getSelectedCollegeName()} Requirements
                </h2>
                
                <div className={styles.requirementsContainer}>
                    {getSelectedCollegeRequirements().map((reqId, i) => (
                        <MajorRequirement 
                            key={i} 
                            reqId={reqId} 
                            selectedSemester={selectedSemester}
                        />
                    ))}
                </div>
            </section>
        </div>
    );
}