// src/firebase/services/subjectService.js
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
const subjectsRef = collection(db, "subjects");

/**
 * Fetch all subjects from Firestore
 * @returns {Promise<Array>} Array of subject objects
 */
export const getAllSubjects = async () => {
  try {
    // Query subjects ordered alphabetically by code (which is the doc ID)
    const q = query(subjectsRef, orderBy("code"));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id, // This is the subject code
      ...doc.data()
    }));
  } catch (error) {
    console.error("Error fetching subjects:", error);
    throw error;
  }
};

/**
 * Fetch a subject by its code (which is also its document ID)
 * @param {string} code - Subject code (e.g., "CS", "MATH")
 * @returns {Promise<Object|null>} Subject object or null if not found
 */
export const getSubjectByCode = async (code) => {
  try {
    // Since code is the document ID, we can use getDoc directly
    const docRef = doc(db, "subjects", code);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id, // This is the subject code
        ...docSnap.data()
      };
    }
    return null;
  } catch (error) {
    console.error(`Error fetching subject with code ${code}:`, error);
    throw error;
  }
};

/**
 * Search subjects by name or formal name
 * @param {string} searchTerm - The search term
 * @returns {Promise<Array>} Array of matching subject objects
 */
export const searchSubjects = async (searchTerm) => {
  try {
    const snapshot = await getDocs(subjectsRef);
    const subjects = snapshot.docs.map(doc => ({
      id: doc.id, // This is the subject code
      ...doc.data()
    }));
    
    // Convert search term to lowercase for case-insensitive matching
    const term = searchTerm.toLowerCase();
    
    return subjects.filter(subject => 
      subject.id.toLowerCase().includes(term) || // Search by code (doc ID)
      subject.name.toLowerCase().includes(term) ||
      (subject.formalName && subject.formalName.toLowerCase().includes(term))
    );
  } catch (error) {
    console.error(`Error searching subjects with term "${searchTerm}":`, error);
    throw error;
  }
};

/**
 * Get subjects sorted alphabetically by name
 * @returns {Promise<Array>} Array of subjects sorted alphabetically
 */
export const getAlphabeticalSubjects = async () => {
  try {
    // Query subjects ordered alphabetically by name
    const q = query(subjectsRef, orderBy("name"));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id, // This is the subject code
      ...doc.data()
    }));
  } catch (error) {
    console.error("Error fetching alphabetical subjects:", error);
    throw error;
  }
};