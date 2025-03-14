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