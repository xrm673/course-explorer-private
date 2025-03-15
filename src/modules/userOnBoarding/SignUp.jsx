// src/components/UserOnBoarding.jsx
import React, { useState, useContext } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { UserContext } from '../../context/UserContext';

export default function SignUp() {
  const { setUser } = useContext(UserContext);
  
  const [formData, setFormData] = useState({
    name: '',
    netId: '',
    college: 'CAS',
    majors: [], // Changed to plural for clarity
    minors: []
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle major input (comma-separated list)
  const handleMajorChange = (e) => {
    // Split by comma and trim whitespace
    const majorsArray = e.target.value.split(',').map(item => item.trim()).filter(item => item);
    setFormData(prev => ({ ...prev, majors: majorsArray }));
  };
  
  // Handle minor input (comma-separated list)
  const handleMinorChange = (e) => {
    const minorsArray = e.target.value.split(',').map(item => item.trim()).filter(item => item);
    setFormData(prev => ({ ...prev, minors: minorsArray }));
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
            <option value="CAS">College of Arts & Sciences</option>
            <option value="CALS">College of Agriculture & Life Sciences</option>
            <option value="COE">College of Engineering</option>
            <option value="AAP">Architecture, Art & Planning</option>
            <option value="ILR">School of Industrial & Labor Relations</option>
            <option value="CHE">College of Human Ecology</option>
            <option value="SHA">School of Hotel Administration</option>
            <option value="Dyson">Dyson School of Applied Economics & Management</option>
          </select>
        </div>
        
        <div className="form-group">
          <label htmlFor="majors">Majors (comma-separated):</label>
          <input
            type="text"
            id="majors"
            name="majors"
            value={formData.majors.join(', ')}
            onChange={handleMajorChange}
            placeholder="e.g. CS, INFO"
          />
          <small>Enter major codes separated by commas</small>
        </div>
        
        <div className="form-group">
          <label htmlFor="minors">Minors (comma-separated):</label>
          <input
            type="text"
            id="minors"
            name="minors"
            value={formData.minors.join(', ')}
            onChange={handleMinorChange}
            placeholder="e.g. MATH, ECON"
          />
          <small>Enter minor codes separated by commas</small>
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
};