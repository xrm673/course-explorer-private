import React, { useState, useContext, useEffect } from 'react';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { UserContext } from '../../context/UserContext';
import { useAcademic } from '../../context/AcademicContext';
import { getAllColleges } from '../../firebase/services/collegeService';
import { fetchUserMajorsData } from '../../firebase/services/majorService';
import MajorSearchInSignUp from './MajorSearchInSignUp';
import { useNavigate } from 'react-router-dom';
import './SignUp.css';

export default function SignUp() {
  const { setUser } = useContext(UserContext);
  const { updateAcademicData } = useAcademic();
  const [colleges, setColleges] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  // Main form data - will store only IDs in the database
  const [formData, setFormData] = useState({
    name: '',
    netId: '',
    college: 'CAS',
    majors: [],
    minors: []
  });
  
  // Display data - only used for UI, not stored
  const [displayData, setDisplayData] = useState({
    majorNames: {}, // { majorId: majorName }
    minorNames: {}  // { minorId: minorName }
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [academicDataLoading, setAcademicDataLoading] = useState(false);

  useEffect(() => {
    const fetchColleges = async () => {
      try {
        const collegeData = await getAllColleges();
        setColleges(collegeData);
        setLoading(false);
      } catch (err) {
        console.error("Failed to load colleges:", err);
        setLoading(false);
      }
    };
    
    fetchColleges();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddMajor = (major) => {
    // Check if major is already added
    if (!formData.majors.some(m => m.id === major.id)) {
      // Only store id and collegeId in form data
      const majorForStorage = {
        id: major.id,
        collegeId: major.collegeId
      };
      
      // Update the form data
      setFormData(prev => ({
        ...prev,
        majors: [...prev.majors, majorForStorage]
      }));
      
      // Update display data separately (only for UI)
      if (major.__displayName) {
        setDisplayData(prev => ({
          ...prev,
          majorNames: {
            ...prev.majorNames,
            [major.id]: major.__displayName
          }
        }));
      }
    }
  };

  const handleRemoveMajor = (majorId) => {
    setFormData(prev => ({
      ...prev,
      majors: prev.majors.filter(major => major.id !== majorId)
    }));
    
    // Also clean up display data
    setDisplayData(prev => {
      const updatedNames = { ...prev.majorNames };
      delete updatedNames[majorId];
      return {
        ...prev,
        majorNames: updatedNames
      };
    });
  };

  const handleAddMinor = (minor) => {
    // Check if minor is already added
    if (!formData.minors.some(m => m.id === minor.id)) {
      // Only store id and collegeId in form data
      const minorForStorage = {
        id: minor.id,
        collegeId: minor.collegeId
      };
      
      // Update the form data
      setFormData(prev => ({
        ...prev,
        minors: [...prev.minors, minorForStorage]
      }));
      
      // Update display data separately (only for UI)
      if (minor.__displayName) {
        setDisplayData(prev => ({
          ...prev,
          minorNames: {
            ...prev.minorNames,
            [minor.id]: minor.__displayName
          }
        }));
      }
    }
  };

  const handleRemoveMinor = (minorId) => {
    setFormData(prev => ({
      ...prev,
      minors: prev.minors.filter(minor => minor.id !== minorId)
    }));
    
    // Also clean up display data
    setDisplayData(prev => {
      const updatedNames = { ...prev.minorNames };
      delete updatedNames[minorId];
      return {
        ...prev,
        minorNames: updatedNames
      };
    });
  };

  // Fetch major IDs for academic data
  const fetchAcademicData = async (majors) => {
    if (!majors || majors.length === 0) {
      return { hasConcentrations: false, academicData: null };
    }
    
    setAcademicDataLoading(true);
    try {
      // Use the fetchUserMajorsData function to get major and requirement data
      const academicData = await fetchUserMajorsData(majors);
      
      // Update context with the fetched data
      updateAcademicData(academicData);
      
      console.log('Academic data loaded successfully:', academicData);
      
      // Check if any major has concentrations
      let hasConcentrations = false;
      
      for (const majorId in academicData.majors) {
        const major = academicData.majors[majorId];
        if (major.concentrations && major.concentrations.length > 0) {
          hasConcentrations = true;
          break;
        }
      }
      
      return { hasConcentrations, academicData };
    } catch (error) {
      console.error('Error fetching academic data:', error);
      throw error;
    } finally {
      setAcademicDataLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage('');

    try {
      // Validate NetID
      if (!formData.netId || formData.netId.trim() === '') {
        throw new Error('NetID is required');
      }
      
      // Prepare clean data for storage - ensure only IDs are stored
      const dataForStorage = {
        name: formData.name,
        netId: formData.netId,
        college: formData.college,
        // Ensure only id and collegeId are stored for majors
        majors: formData.majors.map(({ id, collegeId }) => ({ id, collegeId })),
        // Ensure only id and collegeId are stored for minors
        minors: formData.minors.map(({ id, collegeId }) => ({ id, collegeId })),
        createdAt: new Date(),
        lastUpdated: new Date()
      };
      
      // Use NetID as the document ID
      const docRef = doc(db, 'users', formData.netId);
      
      // Set the document with the NetID as ID
      await setDoc(docRef, dataForStorage);
      
      // Update the user context with the clean data
      setUser(dataForStorage);
      
      // Fetch and store major data and requirements
      // Also check if any major has concentrations
      try {
        const { hasConcentrations } = await fetchAcademicData(dataForStorage.majors);
        
        // Decide where to navigate based on concentrations
        if (hasConcentrations) {
          // Navigate to concentration selection page
          navigate('/select-concentration');
        } else {
          // Navigate to course selection page
          navigate('/select-course');
        }
      } catch (academicError) {
        console.error('Error with academic data:', academicError);
        setSubmitMessage(`Your account was created, but there was an issue loading academic data. Please try logging in again.`);
        
        // Even if there's an error, we'll still navigate to the course selection page
        // since we can't determine if concentrations exist
        setTimeout(() => navigate('/select-course'), 3000);
      }
      
    } catch (error) {
      console.error('Error saving user info:', error);
      setSubmitMessage(`Error: ${error.message}`);
      setIsSubmitting(false);
    }
  };

  // Function to get major/minor display name from our local state
  const getDisplayName = (id, type) => {
    return type === 'majors' 
      ? displayData.majorNames[id] || id
      : displayData.minorNames[id] || id;
  };

  return (
    <div className="user-form-container">
      <h2>Sign Up</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Full Name:</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="netId">NetID:</label>
          <input
            type="text"
            id="netId"
            name="netId"
            value={formData.netId}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="college">College:</label>
          <select
            id="college"
            name="college"
            value={formData.college}
            onChange={handleChange}
            required
          >
            {loading ? (
              <option value="">Loading colleges...</option>
            ) : (
              colleges.map(college => (
                <option key={college.id} value={college.id}>
                  {college.name}
                </option>
              ))
            )}
          </select>
        </div>
        
        <div className="form-group">
          <label>Majors:</label>
          <MajorSearchInSignUp onAddMajor={handleAddMajor} />
          
          <div className="selected-items">
            {formData.majors.map(major => (
              <div key={major.id} className="selected-item">
                <span>{getDisplayName(major.id, 'majors')}</span>
                <button 
                  type="button" 
                  className="remove-button" 
                  onClick={() => handleRemoveMajor(major.id)}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
        
        <div className="form-group">
          <label>Minors:</label>
          <MajorSearchInSignUp onAddMajor={handleAddMinor} />
          
          <div className="selected-items">
            {formData.minors.map(minor => (
              <div key={minor.id} className="selected-item">
                <span>{getDisplayName(minor.id, 'minors')}</span>
                <button 
                  type="button" 
                  className="remove-button" 
                  onClick={() => handleRemoveMinor(minor.id)}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
        
        <button 
          type="submit" 
          disabled={isSubmitting || academicDataLoading}
        >
          {isSubmitting ? 'Processing...' : academicDataLoading ? 'Loading academic data...' : 'Continue'}
        </button>
      </form>
      
      {submitMessage && (
        <div className={submitMessage.includes('Error') ? 'error-message' : 'success-message'}>
          {submitMessage}
        </div>
      )}
    </div>
  );
}