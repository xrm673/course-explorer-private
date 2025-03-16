// src/firebase/services/majorService.js
import { db } from "../config";
import { 
  collection, 
  getDocs,
  getDoc,
  doc,
  query,
  orderBy
} from "firebase/firestore";

// Import functions from requirementService
import { 
  getRequirementById, 
  getRequirementsByIds,
  getRequirementsByMajor
} from "./requirementService";

// Collection reference
const majorsRef = collection(db, "majors");

// Get all majors
export const getAllMajors = async () => {
  try {
    const q = query(majorsRef, orderBy("name"));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Error getting majors:", error);
    throw error;
  }
};

// Get major by ID
export const getMajorById = async (majorId) => {
  try {
    const majorDoc = await getDoc(doc(db, "majors", majorId));
    
    if (majorDoc.exists()) {
      return {
        id: majorDoc.id,
        ...majorDoc.data()
      };
    } else {
      throw new Error(`Major with ID ${majorId} not found`);
    }
  } catch (error) {
    console.error(`Error getting major ${majorId}:`, error);
    throw error;
  }
};

// Get majors by college
export const getMajorsByCollege = async (collegeId) => {
  try {
    const querySnapshot = await getDocs(majorsRef);
    
    // Filter majors that belong to the specified college
    const majorsByCollege = querySnapshot.docs
      .map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      .filter(major => major.colleges.includes(collegeId))
      .sort((a, b) => a.name.localeCompare(b.name));
    
    return majorsByCollege;
  } catch (error) {
    console.error(`Error getting majors for college ${collegeId}:`, error);
    throw error;
  }
};

// Get requirements for a major by college
export const getMajorRequirements = async (majorId, collegeId) => {
  try {
    const majorDoc = await getDoc(doc(db, "majors", majorId));
    
    if (majorDoc.exists()) {
      const majorData = majorDoc.data();
      
      // Find the basic requirements for the specified college
      const collegeRequirements = majorData.basicRequirements.find(
        req => req.college === collegeId
      );
      
      if (collegeRequirements) {
        return collegeRequirements.requirements;
      } else {
        throw new Error(`No requirements found for major ${majorId} in college ${collegeId}`);
      }
    } else {
      throw new Error(`Major with ID ${majorId} not found`);
    }
  } catch (error) {
    console.error(`Error getting requirements for major ${majorId} in college ${collegeId}:`, error);
    throw error;
  }
};

// Get concentrations for a major
export const getMajorConcentrations = async (majorId) => {
  try {
    const majorDoc = await getDoc(doc(db, "majors", majorId));
    
    if (majorDoc.exists()) {
      const majorData = majorDoc.data();
      return majorData.concentrations || [];
    } else {
      throw new Error(`Major with ID ${majorId} not found`);
    }
  } catch (error) {
    console.error(`Error getting concentrations for major ${majorId}:`, error);
    throw error;
  }
};

// Get requirements for a specific concentration
export const getConcentrationRequirements = async (majorId, concentrationName) => {
  try {
    const majorDoc = await getDoc(doc(db, "majors", majorId));
    
    if (majorDoc.exists()) {
      const majorData = majorDoc.data();
      
      // Find the concentration by name
      const concentration = majorData.concentrations?.find(
        conc => conc.concentration === concentrationName
      );
      
      if (concentration) {
        return concentration.requirements;
      } else {
        throw new Error(`No concentration named ${concentrationName} found for major ${majorId}`);
      }
    } else {
      throw new Error(`Major with ID ${majorId} not found`);
    }
  } catch (error) {
    console.error(`Error getting requirements for concentration ${concentrationName} in major ${majorId}:`, error);
    throw error;
  }
};

// Get recommended initial courses for a major
export const getInitialCourses = async (majorId) => {
  try {
    const majorDoc = await getDoc(doc(db, "majors", majorId));
    
    if (majorDoc.exists()) {
      const majorData = majorDoc.data();
      return majorData.init || [];
    } else {
      throw new Error(`Major with ID ${majorId} not found`);
    }
  } catch (error) {
    console.error(`Error getting initial courses for major ${majorId}:`, error);
    throw error;
  }
};

// NEW FUNCTION: Comprehensive function to fetch a major with all its requirements
export const fetchMajorWithRequirements = async (majorId) => {
  try {
    // Get the major data
    const major = await getMajorById(majorId);
    
    // Create a structure to hold all requirements
    const requirementsData = {};
    
    // 1. Get requirements from the major document (by college)
    if (major.basicRequirements) {
      for (const collegeReq of major.basicRequirements) {
        const college = collegeReq.college;
        requirementsData[college] = { basic: [] };
        
        if (collegeReq.requirements && collegeReq.requirements.length > 0) {
          // Use the imported getRequirementsByIds function
          const requirementDetails = await getRequirementsByIds(collegeReq.requirements);
          requirementsData[college].basic = requirementDetails;
        }
      }
    }
    
    // 2. Get concentration requirements if they exist
    if (major.concentrations) {
      requirementsData.concentrations = {};
      
      for (const concentration of major.concentrations) {
        const concentrationName = concentration.concentration;
        
        if (concentration.requirements && concentration.requirements.length > 0) {
          // Use the imported getRequirementsByIds function
          const requirementDetails = await getRequirementsByIds(concentration.requirements);
          requirementsData.concentrations[concentrationName] = requirementDetails;
        } else {
          requirementsData.concentrations[concentrationName] = [];
        }
      }
    }
    
    // 3. Get requirements from the requirements collection with majorId
    // Use the imported getRequirementsByMajor function
    const collectionRequirements = await getRequirementsByMajor(majorId);
    if (collectionRequirements.length > 0) {
      requirementsData.linkedRequirements = collectionRequirements;
    }
    
    return {
      major,
      requirements: requirementsData
    };
  } catch (error) {
    console.error(`Error fetching major with requirements for ${majorId}:`, error);
    throw error;
  }
};

// NEW FUNCTION: Fetch data for all user majors
export const fetchUserMajorsData = async (userMajors) => {
  try {
    const majorsData = {};
    const requirementsData = {};
    
    for (const major of userMajors) {
      const majorId = major.id;
      const result = await fetchMajorWithRequirements(majorId);
      
      if (result) {
        majorsData[majorId] = result.major;
        requirementsData[majorId] = result.requirements;
      }
    }
    
    return {
      majors: majorsData,
      requirements: requirementsData
    };
  } catch (error) {
    console.error("Error fetching user majors data:", error);
    throw error;
  }
};