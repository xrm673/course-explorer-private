import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../../context/UserContext';
import { useAcademic } from '../../context/AcademicContext';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import './SelectConcentration.css';

const SelectConcentration = () => {
  const { user, setUser } = useContext(UserContext);
  const { academicData } = useAcademic();
  const navigate = useNavigate();
  
  const [majorConcentrations, setMajorConcentrations] = useState([]);
  const [selectedConcentrations, setSelectedConcentrations] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  useEffect(() => {
    // Redirect if user isn't logged in
    if (!user) {
      navigate('/login');
      return;
    }
    
    // Extract majors with concentrations
    const majorsWithConcentrations = [];
    
    if (user.majors && academicData.majors) {
      for (const majorObj of user.majors) {
        const majorId = majorObj.id;
        const majorData = academicData.majors[majorId];
        
        if (majorData && majorData.concentrations && majorData.concentrations.length > 0) {
          majorsWithConcentrations.push({
            id: majorId,
            collegeId: majorObj.collegeId,
            name: majorData.name || majorId,
            concentrations: majorData.concentrations
          });
          
          // Initialize selected concentrations for this major with an empty array
          // Or use existing concentrations if the user already has them
          if (majorObj.concentrations && Array.isArray(majorObj.concentrations)) {
            setSelectedConcentrations(prev => ({
              ...prev, 
              [majorId]: majorObj.concentrations
            }));
          } else {
            setSelectedConcentrations(prev => ({
              ...prev, 
              [majorId]: []
            }));
          }
        }
      }
    }
    
    setMajorConcentrations(majorsWithConcentrations);
    setLoading(false);
  }, [user, academicData, navigate]);
  
  const handleConcentrationToggle = (majorId, concentration) => {
    setSelectedConcentrations(prev => {
      const currentConcentrations = prev[majorId] || [];
      
      // Check if the concentration is already selected
      if (currentConcentrations.includes(concentration)) {
        // Remove it
        return {
          ...prev,
          [majorId]: currentConcentrations.filter(c => c !== concentration)
        };
      } else {
        // Add it
        return {
          ...prev,
          [majorId]: [...currentConcentrations, concentration]
        };
      }
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    
    // Validate that at least one concentration is selected for each major
    for (const major of majorConcentrations) {
      if (!selectedConcentrations[major.id] || selectedConcentrations[major.id].length === 0) {
        setError(`Please select at least one concentration for ${major.name}`);
        setSubmitting(false);
        return;
      }
    }
    
    try {
      if (!user || !user.netId) {
        throw new Error('User information not available');
      }
      
      // Update user document in Firestore
      const userRef = doc(db, 'users', user.netId);
      
      // Create new majors array with concentration information
      const updatedMajors = user.majors.map(major => {
        if (selectedConcentrations[major.id]) {
          return {
            id: major.id,
            collegeId: major.collegeId,
            concentrations: selectedConcentrations[major.id]
          };
        }
        return major;
      });
      
      // Update the document
      await updateDoc(userRef, {
        majors: updatedMajors,
        lastUpdated: new Date()
      });
      
      // Update user context
      setUser({
        ...user,
        majors: updatedMajors
      });
      
      // Navigate to the course selection page
      navigate('/select-courses');
      
    } catch (error) {
      console.error('Error saving concentrations:', error);
      setError(error.message || 'Failed to save your concentrations');
      setSubmitting(false);
    }
  };
  
  if (loading) {
    return <div>Loading concentration options...</div>;
  }
  
  // If no majors with concentrations, redirect to course selection
  if (majorConcentrations.length === 0) {
    navigate('/select-courses');
    return null;
  }
  
  return (
    <div className="concentration-selection-container">
      <h2>Select Your Concentrations</h2>
      <p>Please select one or more concentrations for each of your majors:</p>
      
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        {majorConcentrations.map(major => (
          <div key={major.id} className="concentration-group">
            <h3>{major.name}</h3>
            
            <div className="concentration-options">
              <label className="options-label">Select all concentrations that you are interested in:</label>
              <div className="checkbox-list">
                {major.concentrations.map(conc => (
                  <div key={conc.concentration} className="concentration-checkbox">
                    <input 
                      type="checkbox" 
                      id={`${major.id}-${conc.concentration}`}
                      checked={selectedConcentrations[major.id]?.includes(conc.concentration) || false}
                      onChange={() => handleConcentrationToggle(major.id, conc.concentration)}
                    />
                    <label htmlFor={`${major.id}-${conc.concentration}`}>
                      {conc.concentration}
                    </label>
                  </div>
                ))}
              </div>
              {selectedConcentrations[major.id]?.length === 0 && (
                <div className="validation-message">Please select at least one concentration</div>
              )}
            </div>
          </div>
        ))}
        
        <div className="action-buttons">
          <button 
            type="submit"
            disabled={submitting}
            className="continue-button"
          >
            {submitting ? 'Saving...' : 'Continue'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SelectConcentration;