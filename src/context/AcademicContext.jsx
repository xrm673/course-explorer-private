// src/context/AcademicContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';

export const AcademicContext = createContext();

export const AcademicProvider = ({ children }) => {
  // Initialize state from localStorage
  const [academicData, setAcademicData] = useState(() => {
    const savedData = localStorage.getItem('academicData');
    return savedData ? JSON.parse(savedData) : {
      majors: {},
      requirements: {}
    };
  });
  
  const [dataLoaded, setDataLoaded] = useState(() => {
    // Check if we have any data already in localStorage
    const savedData = localStorage.getItem('academicData');
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      return Object.keys(parsedData.majors).length > 0;
    }
    return false;
  });
  
  // Update localStorage when academicData changes
  useEffect(() => {
    localStorage.setItem('academicData', JSON.stringify(academicData));
  }, [academicData]);

  // This function will update the academic data and set dataLoaded to true
  const updateAcademicData = (newData) => {
    console.log('Updating Academic Context with:', newData);
    
    setAcademicData(prev => {
      const updated = {
        ...prev,
        ...newData
      };
      
      // Log the data size to help debug
      const majorsCount = Object.keys(updated.majors || {}).length;
      const requirementsCount = Object.keys(updated.requirements || {}).length;
      
      console.log(`Academic Context updated: ${majorsCount} majors, ${requirementsCount} requirements collections`);
      
      return updated;
    });
    
    setDataLoaded(true);
  };
  
  // Function to clear academic data (useful when user logs out)
  const clearAcademicData = () => {
    setAcademicData({
      majors: {},
      requirements: {}
    });
    setDataLoaded(false);
    localStorage.removeItem('academicData');
  };

  return (
    <AcademicContext.Provider value={{ 
      academicData, 
      updateAcademicData, 
      clearAcademicData,
      dataLoaded 
    }}>
      {children}
    </AcademicContext.Provider>
  );
};

// Custom hook to check if specific data exists
export const useAcademicDataCheck = () => {
  const { academicData, dataLoaded } = useContext(AcademicContext);
  
  const hasMajor = (majorId) => {
    return Boolean(academicData.majors && academicData.majors[majorId]);
  };
  
  const hasMajorRequirements = (majorId) => {
    return Boolean(academicData.requirements && academicData.requirements[majorId]);
  };
  
  const getMajorColleges = (majorId) => {
    if (!hasMajor(majorId)) return [];
    return academicData.majors[majorId].colleges || [];
  };
  
  const getCollegeRequirements = (majorId, collegeId) => {
    if (!hasMajorRequirements(majorId)) return null;
    return academicData.requirements[majorId][collegeId]?.basic || null;
  };
  
  return {
    isLoaded: dataLoaded,
    hasMajor,
    hasMajorRequirements,
    getMajorColleges,
    getCollegeRequirements,
    allMajorsIds: Object.keys(academicData.majors || {}),
    majorsCount: Object.keys(academicData.majors || {}).length,
    requirementsCount: Object.keys(academicData.requirements || {}).length
  };
};

// The main hook to access the context
export const useAcademic = () => useContext(AcademicContext);