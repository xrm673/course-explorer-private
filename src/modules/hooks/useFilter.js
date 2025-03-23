import { useState, useEffect } from "react";

export function useFilter(showFilterModal, user, academicData) {
  const [filters, setFilters] = useState({
    level: {
      1000: { only: false, prefer: false },
      2000: { only: false, prefer: false },
      3000: { only: false, prefer: false },
      4000: { only: false, prefer: false },
      5000: { only: false, prefer: false }
    },
    overallScore: {
        "High Overall Score": { only: false, prefer: false}
    },
    enrollment: {
      "Eligible": { only: false, prefer: false },
    },
    collegeDistributions: {
        "ALC-AS": {only: false, prefer: false},
        "BIO-AS": {only: false, prefer: false},
        "ETM-AS": {only: false, prefer: false},
        "GLC-AS": {only: false, prefer: false},
        "HST-AS": {only: false, prefer: false},
        "PHS-AS": {only: false, prefer: false},
        "SCD-AS": {only: false, prefer: false},
        "SSC-AS": {only: false, prefer: false},
        "SDS-AS": {only: false, prefer: false},
        "SMR-AS": {only: false, prefer: false}
    },
    majorRequirements: {}
  });

    // Map of internal keys to display names
    const categoryNames = {
      level: "Level",
      overallScore: "Overall Score",
      enrollment: "Enrollment",
      collegeDistributions: "College Distributions",
      majorRequirements: "Major Requirements"
    };

  // Process requirements for all user's majors when modal opens
  useEffect(() => {
    if (!showFilterModal || !user?.majors || !academicData?.majors || !academicData?.requirements) {
      return;
    }

    const majorRequirements = {};

    // Process each major the user has selected
    user.majors.forEach(userMajor => {
      const majorId = userMajor.id;
      const collegeId = userMajor.collegeId;
      const majorData = academicData.majors[majorId];
      
      if (!majorData) return;
      
      // Get basic requirements for this major + college combination
      const basicReqs = majorData.basicRequirements?.find(req => 
        req.college === collegeId
      )?.requirements || [];
      
      // Process basic requirements
      basicReqs.forEach(reqId => {
        const requirement = academicData.requirements[reqId];
        if (requirement) {
          // Use reqId directly as the key since it already includes the major prefix
          majorRequirements[reqId] = { 
            only: filters?.majorRequirements?.[reqId]?.only || false, 
            prefer: filters?.majorRequirements?.[reqId]?.prefer || false,
            // Use the requirement's name instead of ID
            displayName: requirement.name || reqId,
            majorId, // Store majorId to group by major in UI
            majorName: majorData.name || majorId
          };
        }
      });
      
      // Process concentration requirements (if any)
      const userConcentrations = userMajor.concentrations || [];
      
      if (userConcentrations.length > 0 && majorData.concentrations) {
        userConcentrations.forEach(concentrationName => {
          const concentrationData = majorData.concentrations.find(
            c => c.concentration === concentrationName
          );
          
          if (concentrationData && concentrationData.requirements) {
            concentrationData.requirements.forEach(reqId => {
              const requirement = academicData.requirements[reqId];
              if (requirement) {
                majorRequirements[reqId] = { 
                  only: filters?.majorRequirements?.[reqId]?.only || false, 
                  prefer: filters?.majorRequirements?.[reqId]?.prefer || false,
                  displayName: requirement.name || reqId,
                  majorId,
                  majorName: majorData.name || majorId,
                  concentrationName // Include concentration name for better organization
                };
              }
            });
          }
        });
      }
    });
    
    // Update filter state with the processed requirements
    setFilters(prev => ({
      ...prev,
      majorRequirements: majorRequirements
    }));
  }, [user, academicData, showFilterModal]); // Added showFilterModal to dependencies
  
  const applyFilters = (newFilters) => {
    setFilters(newFilters);
  };

  return { filters, categoryNames, applyFilters }
}