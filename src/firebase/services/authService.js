// src/services/authService.js
import { getFirestore, doc, getDoc } from 'firebase/firestore';

// Function to fetch user data from Firestore by NetID
export const loginWithNetID = async (netId) => {
  try {
    const db = getFirestore();
    
    // Query the users collection where netId matches
    const userDoc = await getDoc(doc(db, "users", netId));
    
    if (userDoc.exists()) {
      // Return the user data if found
      return {
        netId,
        ...userDoc.data()
      };
    } else {
      // User not found
      throw new Error("User not found");
    }
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
};