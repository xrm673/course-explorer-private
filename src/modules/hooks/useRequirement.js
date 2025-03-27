import { useState, useEffect } from "react";
import { getRequirementById } from "../../firebase/services/requirementService";

export function useRequirement(reqId) {
  const [req, setReq] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchRequirement = async () => {
      try {
        const reqData = await getRequirementById(reqId);
        setReq(reqData);
        setLoading(false);
      } catch (err) {
        setError("Failed to load");
        setLoading(false);
      }
    };
    fetchRequirement();
  }, [reqId]);

  return { req, loading, error };
}

export function useBasicRequirements(major, selectedCollegeId, takenCourses) {
  const [requirements, setRequirements] = useState([]);
  const [usedCourses, setUsedCourses] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!major || !selectedCollegeId) {
        setRequirements([]);
        setLoading(false);
        return;
    }
    
    // Find the requirements for the selected college
    const basicReqs = major.basicRequirements?.find(
        req => req.college === selectedCollegeId
    );
    
    if (!basicReqs || !basicReqs.requirements) {
        setRequirements([]);
        setLoading(false);
        return;
    }
    
    const reqIds = basicReqs.requirements;
    setLoading(true);

    // This is better done with Promise.all
    const fetchBasicRequirements = async () => {
        try {
            let usedCoursesSet = new Set();
            
            // Create an array of promises
            const requirementPromises = reqIds.map(async (reqId) => {
                try {
                    const reqData = await getRequirementById(reqId);
                    let completedCount = 0;
                    let completedCourses = [];
                    let remainingNumber = reqData.number;
                    let completed = false;
                    
                    if (!takenCourses) {
                      return {
                        ...reqData,
                        completedCount,
                        completedCourses,
                        remainingNumber,
                        completed
                      };
                    }
        
                    // If this is a core requirement with course groups
                    if (reqData.courseGrps) {
                        reqData.courseGrps.forEach(group => {
                            let foundTakenCourse = false;
                            // Check if any course in the group is taken
                            for (const courseId of group.courses) {
                                if (takenCourses.has(courseId) && !foundTakenCourse) {
                                    usedCoursesSet.add(courseId);
                                    completedCourses.push(courseId);
                                    completedCount++;
                                    foundTakenCourse = true;
                                    break;
                                }
                            }
                        });
                        remainingNumber = Math.max(reqData.number - completedCount, 0);
                        completed = remainingNumber === 0;
                        return {
                            ...reqData,
                            completedCount,
                            completedCourses,
                            completed,
                            remainingNumber
                        };
                    }
                    // For elective requirements with individual courses
                    else if (reqData.courses) {
                        const coursesCopy = [...reqData.courses];
                        const filteredCourses = coursesCopy.filter(courseId => {
                            if (takenCourses.has(courseId) && !usedCoursesSet.has(courseId)) {
                                // Course is taken and not already used in another requirement
                                usedCoursesSet.add(courseId);
                                completedCourses.push(courseId);
                                completedCount++;
                                return false; // Remove from courses array
                            }
                            return !takenCourses.has(courseId); // Keep only untaken courses
                        });
                        remainingNumber = Math.max(reqData.number - completedCount, 0);
                        completed = remainingNumber === 0;
                        return {
                            ...reqData,
                            courses: filteredCourses,
                            completedCount,
                            completedCourses,
                            completed,
                            remainingNumber
                        };
                    }
                    
                    // Default return for other types of requirements
                    return reqData;
                } catch (err) {
                    console.error(`Error fetching requirement ${reqId}:`, err);
                    return null;
                }
            });
            
            // Wait for all promises - CORRECTLY POSITIONED outside the map callback
            const results = await Promise.all(requirementPromises);
            const requirementsData = results.filter(req => req !== null);
            
            setRequirements(requirementsData);
            setUsedCourses(usedCoursesSet);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching basic requirements:", error);
            setError("Failed to load basic requirements");
            setLoading(false);
        }
    };
    
    fetchBasicRequirements();
  }, [major, selectedCollegeId, takenCourses]);

  return { requirements, usedCourses, loading, error };
}