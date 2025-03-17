import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

/**
 * Adds a course to the user's schedule for a specific semester
 * Updates localStorage via UserContext immediately
 * Updates database asynchronously in the background
 * 
 * @param {Object} course - The course object to add
 * @param {string} semester - The semester code to add the course to (e.g., "FA25", "SP26")
 * @param {Object} user - The user object from UserContext
 * @param {Function} setUser - The setUser function from UserContext
 * @param {Function} openSidebar - The openSidebar function from SidebarContext
 * @returns {boolean} - Success status for localStorage update
 */
export const addCourseToSchedule = (course, semester, user, setUser, openSidebar) => {
  if (!user) {
    console.error("User not logged in");
    return false;
  }

  try {
    // Create a course object with necessary fields
    const courseObject = {
      code: course.id,
      title: course.ttl || course.tts || course.id, // Use appropriate title
      credits: course.creditsTotal && Array.isArray(course.creditsTotal) && course.creditsTotal.length > 0 
        ? course.creditsTotal[0] 
        : null
    };

    // Create deep copy of current scheduleData or initialize if doesn't exist
    const scheduleData = user.scheduleData ? 
      JSON.parse(JSON.stringify(user.scheduleData)) : 
      {
        planned: {
          "SP27": [],
          "FA26": [],
          "SP26": [],
          "FA25": [],
        },
        taken: {
          "SP25": [],
          "FA24": [],
          "SP24": [],
          "FA23": [],
          "Ungrouped Courses": []
        }
      };

    // Add course to the selected semester
    if (!scheduleData.planned[semester]) {
      scheduleData.planned[semester] = [];
    }
    
    // Check if course already exists in the semester
    const courseExists = scheduleData.planned[semester].some(
      existingCourse => existingCourse.code === courseObject.code
    );
    
    if (!courseExists) {
      scheduleData.planned[semester].push(courseObject);
    } else {
      // Course already exists, no need to update
      return true;
    }

    // Update user context (which will update localStorage)
    // This happens immediately, so the sidebar will see the changes right away
    setUser({
      ...user,
      scheduleData: scheduleData
    });

    // Open sidebar and show the semester
    if (openSidebar) {
      openSidebar(semester);
    }

    // Update database in the background (async)
    // This doesn't block the UI or affect the sidebar
    if (user.netId) {
      const userRef = doc(db, 'users', user.netId);
      updateDoc(userRef, {
        scheduleData: scheduleData,
        lastUpdated: new Date()
      }).catch(error => {
        console.error("Error updating database:", error);
        // Could implement retry logic or user notification here
      });
    }

    return true;
  } catch (error) {
    console.error("Error adding course to schedule:", error);
    return false;
  }
};

/**
 * Marks a course as taken by adding it to the "Ungrouped Courses" section
 * Updates localStorage via UserContext immediately
 * Updates database asynchronously in the background
 * 
 * @param {Object} course - The course object to mark as taken
 * @param {Object} user - The user object from UserContext
 * @param {Function} setUser - The setUser function from UserContext
 * @param {Function} openSidebar - The openSidebar function from SidebarContext
 * @returns {boolean} - Success status for localStorage update
 */
export const markCourseAsTaken = (course, user, setUser, openSidebar) => {
  if (!user) {
    console.error("User not logged in");
    return false;
  }

  try {
    // Create a course object with necessary fields
    const courseObject = {
      code: course.id,
      tts: course.tts || course.ttl || course.id, // Use short title for taken courses
      credits: course.creditsTotal && Array.isArray(course.creditsTotal) && course.creditsTotal.length > 0 
        ? course.creditsTotal[0] 
        : null
    };

    // Create deep copy of current scheduleData or initialize if doesn't exist
    const scheduleData = user.scheduleData ? 
      JSON.parse(JSON.stringify(user.scheduleData)) : 
      {
        planned: {
          "SP27": [],
          "FA26": [],
          "SP26": [],
          "FA25": [],
        },
        taken: {
          "SP25": [],
          "FA24": [],
          "SP24": [],
          "FA23": [],
          "Ungrouped Courses": []
        }
      };

    // Ensure "Ungrouped Courses" exists
    if (!scheduleData.taken["Ungrouped Courses"]) {
      scheduleData.taken["Ungrouped Courses"] = [];
    }
    
    // Check if course already exists in Ungrouped Courses
    const courseExists = scheduleData.taken["Ungrouped Courses"].some(
      existingCourse => existingCourse.code === courseObject.code
    );
    
    if (!courseExists) {
      scheduleData.taken["Ungrouped Courses"].push(courseObject);
    } else {
      // Course already exists, no need to update
      return true;
    }

    // Update user context (which will update localStorage)
    // This happens immediately, so the sidebar will see the changes right away
    setUser({
      ...user,
      scheduleData: scheduleData
    });

    // Open sidebar and show "Ungrouped Courses"
    if (openSidebar) {
      openSidebar("Ungrouped Courses");
    }

    // Update database in the background (async)
    // This doesn't block the UI or affect the sidebar
    if (user.netId) {
      const userRef = doc(db, 'users', user.netId);
      updateDoc(userRef, {
        scheduleData: scheduleData,
        lastUpdated: new Date()
      }).catch(error => {
        console.error("Error updating database:", error);
        // Could implement retry logic or user notification here
      });
    }

    return true;
  } catch (error) {
    console.error("Error marking course as taken:", error);
    return false;
  }
};

/**
 * Removes a course from a user's schedule (planned or taken)
 * Updates localStorage via UserContext immediately
 * Updates database asynchronously in the background
 * 
 * @param {string} courseCode - The course code to remove
 * @param {Object} user - The user object from UserContext
 * @param {Function} setUser - The setUser function from UserContext
 * @returns {boolean} - Success status for localStorage update
 */
export const removeCourseFromSchedule = (courseCode, user, setUser) => {
  if (!user) {
    console.error("User not logged in");
    return false;
  }

  try {
    // If there's no scheduleData, nothing to remove
    if (!user.scheduleData) {
      return false;
    }

    // Create deep copy of current scheduleData
    const scheduleData = JSON.parse(JSON.stringify(user.scheduleData));
    let courseRemoved = false;

    // Check planned courses
    if (scheduleData.planned) {
      for (const semester in scheduleData.planned) {
        const courses = scheduleData.planned[semester];
        const initialLength = courses.length;
        
        scheduleData.planned[semester] = courses.filter(course => course.code !== courseCode);
        
        if (initialLength !== scheduleData.planned[semester].length) {
          courseRemoved = true;
        }
      }
    }

    // Check taken courses
    if (scheduleData.taken) {
      for (const semester in scheduleData.taken) {
        const courses = scheduleData.taken[semester];
        const initialLength = courses.length;
        
        scheduleData.taken[semester] = courses.filter(course => course.code !== courseCode);
        
        if (initialLength !== scheduleData.taken[semester].length) {
          courseRemoved = true;
        }
      }
    }

    if (!courseRemoved) {
      return false; // No course was removed
    }

    // Update user context (which will update localStorage)
    setUser({
      ...user,
      scheduleData: scheduleData
    });

    // Update database in the background (async)
    if (user.netId) {
      const userRef = doc(db, 'users', user.netId);
      updateDoc(userRef, {
        scheduleData: scheduleData,
        lastUpdated: new Date()
      }).catch(error => {
        console.error("Error updating database:", error);
      });
    }

    return true;
  } catch (error) {
    console.error("Error removing course from schedule:", error);
    return false;
  }
};

/**
 * Checks if a course is in a user's schedule (either planned or taken)
 * 
 * @param {string} courseCode - The course code to check
 * @param {Object} user - The user object from UserContext
 * @returns {Object} - Status object: { isPlanned: boolean, isTaken: boolean, semester: string | null }
 */
export const getCourseStatus = (courseCode, user) => {
  if (!user || !user.scheduleData) {
    return { isPlanned: false, isTaken: false, semester: null };
  }

  const status = { isPlanned: false, isTaken: false, semester: null };
  
  // Check planned courses
  if (user.scheduleData.planned) {
    for (const semester in user.scheduleData.planned) {
      const found = user.scheduleData.planned[semester].some(
        course => course.code === courseCode
      );
      
      if (found) {
        status.isPlanned = true;
        status.semester = semester;
        break;
      }
    }
  }
  
  // Check taken courses
  if (!status.isPlanned && user.scheduleData.taken) {
    for (const semester in user.scheduleData.taken) {
      const found = user.scheduleData.taken[semester].some(
        course => course.code === courseCode
      );
      
      if (found) {
        status.isTaken = true;
        status.semester = semester;
        break;
      }
    }
  }
  
  return status;
};