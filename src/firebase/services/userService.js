// src/firebase/services/userService.js
import { db, auth } from "../config";
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc 
} from "firebase/firestore";
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut
} from "firebase/auth";

// Register a new user
export const registerUser = async (email, password, userData) => {
  try {
    // Create user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Save additional user data to Firestore
    await setDoc(doc(db, "users", user.uid), {
      email,
      college: userData.college || "",
      majors: userData.majors || [],
      minors: userData.minors || [],
      schedule: {
        planned: {},
        taken: {}
      },
      createdAt: new Date()
    });
    
    return user;
  } catch (error) {
    console.error("Error registering user:", error);
    throw error;
  }
};

// Login user
export const loginUser = async (email, password) => {
  return signInWithEmailAndPassword(auth, email, password);
};

// Logout user
export const logoutUser = async () => {
  return signOut(auth);
};

// Get user data
export const getUserData = async (userId) => {
  const docRef = doc(db, "users", userId);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    return {
      id: docSnap.id,
      ...docSnap.data()
    };
  }
  return null;
};

// Update user data
export const updateUserData = async (userId, data) => {
  const userRef = doc(db, "users", userId);
  await updateDoc(userRef, data);
};