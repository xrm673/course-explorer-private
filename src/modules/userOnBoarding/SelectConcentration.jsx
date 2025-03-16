import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../../context/UserContext';
import { useAcademic } from '../../context/AcademicContext';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';

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
            name: majorObj.name || majorData.name,
            concentrations: majorData.concentrations
          });
          
          // Initialize selected concentration for this major (with the first concentration)
          setSelectedConcentrations(prev => ({
            ...prev, 
            [majorId]: majorData.concentrations[0].concentration
          }));
        }
      }
    }
    
    setMajorConcentrations(majorsWithConcentrations);
    setLoading(false);
  }, [user, academicData, navigate]);
  
  const handleConcentrationChange = (majorId, concentration) => {
    setSelectedConcentrations(prev => ({
      ...prev,
      [majorId]: concentration
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    
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
            ...major,
            concentration: selectedConcentrations[major.id]
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
      <p>Please select a concentration for each of your majors:</p>
      
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        {majorConcentrations.map(major => (
          <div key={major.id} className="concentration-group">
            <h3>{major.name}</h3>
            
            <div className="concentration-options">
              <label>Select concentration:</label>
              <select 
                value={selectedConcentrations[major.id] || ''}
                onChange={(e) => handleConcentrationChange(major.id, e.target.value)}
                required
              >
                {major.concentrations.map(conc => (
                  <option key={conc.concentration} value={conc.concentration}>
                    {conc.concentration}
                  </option>
                ))}
              </select>
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