// src/firebase/services/requirementService.js

import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../config'; // Assuming you have a config file that initializes Firebase

/**
 * Fetches a single requirement by its ID
 * @param {string} requirementId - The ID of the requirement to fetch
 * @returns {Promise<object|null>} - The requirement data or null if not found
 */
export const getRequirementById = async (requirementId) => {
  try {
    const requirementRef = doc(db, 'requirements', requirementId);
    const requirementSnap = await getDoc(requirementRef);
    
    if (requirementSnap.exists()) {
      return {
        id: requirementSnap.id,
        ...requirementSnap.data()
      };
    } else {
      console.log(`No requirement found with ID: ${requirementId}`);
      return null;
    }
  } catch (error) {
    console.error(`Error fetching requirement ${requirementId}:`, error);
    throw error;
  }
};

/**
 * Fetches multiple requirements by their IDs
 * @param {string[]} requirementIds - Array of requirement IDs to fetch
 * @returns {Promise<object[]>} - Array of requirement objects
 */
export const getRequirementsByIds = async (requirementIds) => {
  try {
    if (!requirementIds || requirementIds.length === 0) {
      return [];
    }
    
    const requirements = [];
    
    // Firebase doesn't support fetching multiple documents by ID in one query
    // So we need to fetch them one by one
    const promises = requirementIds.map(id => getRequirementById(id));
    const results = await Promise.all(promises);
    
    // Filter out any null results (requirements that weren't found)
    return results.filter(req => req !== null);
  } catch (error) {
    console.error('Error fetching multiple requirements:', error);
    throw error;
  }
};

/**
 * Fetches all requirements for a specific major
 * @param {string} majorId - The ID of the major
 * @returns {Promise<object[]>} - Array of requirement objects
 */
export const getRequirementsByMajor = async (majorId) => {
  try {
    const q = query(collection(db, 'requirements'), where('major', '==', majorId));
    const querySnapshot = await getDocs(q);
    
    const requirements = [];
    querySnapshot.forEach((doc) => {
      requirements.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return requirements;
  } catch (error) {
    console.error(`Error fetching requirements for major ${majorId}:`, error);
    throw error;
  }
};

export default {
  getRequirementById,
  getRequirementsByIds,
  getRequirementsByMajor
};