import React, { useState, useContext, useEffect } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { UserContext } from '../../context/UserContext';
import { getAllColleges } from '../../firebase/services/collegeService';
import MajorSearchInSignUp from './MajorSearchInSignUp'
import './SignUp.css';

export default function SignUp() {
  const { setUser } = useContext(UserContext);
  const [colleges, setColleges] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    name: '',
    netId: '',
    college: 'CAS',
    majors: [],
    minors: []
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

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
      setFormData(prev => ({
        ...prev,
        majors: [...prev.majors, major]
      }));
    }
  };

  const handleRemoveMajor = (majorId) => {
    setFormData(prev => ({
      ...prev,
      majors: prev.majors.filter(major => major.id !== majorId)
    }));
  };

  const handleAddMinor = (minor) => {
    // Check if minor is already added
    if (!formData.minors.some(m => m.id === minor.id)) {
      setFormData(prev => ({
        ...prev,
        minors: [...prev.minors, minor]
      }));
    }
  };

  const handleRemoveMinor = (minorId) => {
    setFormData(prev => ({
      ...prev,
      minors: prev.minors.filter(minor => minor.id !== minorId)
    }));
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
      
      // Use NetID as the document ID
      const docRef = doc(db, 'users', formData.netId);
      
      // Add timestamp
      const userData = {
        ...formData,
        createdAt: new Date(),
        lastUpdated: new Date()
      };
      
      // Set the document with the NetID as ID
      await setDoc(docRef, userData);
      
      // Update the user context
      setUser(userData);
      
      setSubmitMessage('Success! Your information has been saved.');
      
      // Clear form
      setFormData({
        name: '',
        netId: '',
        college: 'CAS',
        majors: [],
        minors: []
      });
    } catch (error) {
      console.error('Error saving user info:', error);
      setSubmitMessage(`Error: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
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
                <span>{major.name}</span>
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
                <span>{minor.name}</span>
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
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Saving...' : 'Save Information'}
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