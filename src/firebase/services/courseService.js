// src/firebase/services/courseService.js
import { db } from "../config";
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  getDoc, 
  doc 
} from "firebase/firestore";

// Collection reference
const coursesRef = collection(db, "courses");

// Get course by ID
export const getCourseById = async (id) => {
  const docRef = doc(db, "courses", id);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    return {
      id: docSnap.id,
      ...docSnap.data()
    };
  }
  return null;
};

// Get courses by subject code
export const getCoursesBySubject = async (subjectCode) => {
  const q = query(coursesRef, where("sbj", "==", subjectCode));
  const snapshot = await getDocs(q);
  
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};

// Get filtered courses
export const getFilteredCourses = async (filters = {}) => {
  let q = coursesRef;
  
  // Apply filters dynamically
  if (filters.subject) {
    q = query(q, where("subject", "==", filters.subject));
  }
  
  if (filters.level) {
    const levelNum = parseInt(filters.level);
    const lowerBound = levelNum * 1000;
    const upperBound = lowerBound + 999;
    q = query(q, where("number", ">=", lowerBound), where("number", "<=", upperBound));
  }
  
  // Add more filters as needed
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};