// src/firebase/services/collegeService.js
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
const collegesRef = collection(db, "colleges");

/**
 * Fetch all colleges from Firestore
 * @returns {Promise<Array>} Array of college objects
 */
export const getAllColleges = async () => {
  try {
    // Query colleges ordered alphabetically by code (which is the doc ID)
    const q = query(collegesRef, orderBy("code"));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id, // This is the college code
      ...doc.data()
    }));
  } catch (error) {
    console.error("Error fetching colleges:", error);
    throw error;
  }
};