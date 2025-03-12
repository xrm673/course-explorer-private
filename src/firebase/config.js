// src/firebase/config.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDEbaNvt-NNIWicPir44oPL2pm1nNnSPrs",
  authDomain: "cornell-course-explorer.firebaseapp.com",
  projectId: "cornell-course-explorer",
  storageBucket: "cornell-course-explorer.firebasestorage.app",
  messagingSenderId: "388923330213",
  appId: "1:388923330213:web:050750c40d0506022f874c",
  measurementId: "G-DWDBGSZTYJ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
const db = getFirestore(app);
const auth = getAuth(app);

export { app, db, auth };