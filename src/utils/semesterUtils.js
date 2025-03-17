/**
 * Maps a future semester to its corresponding available data semester
 * @param {string} futureSemester - The future semester code (e.g., "FA25", "SP26")
 * @returns {string} - The corresponding semester code to check availability
 */
export const mapToAvailableSemester = (futureSemester) => {
    // Extract the semester type (FA or SP)
    const semesterType = futureSemester.substring(0, 2);
    
    // Map to the current academic year data
    if (semesterType === "FA") {
      return "FA24"; // Check Fall 2024 data for any Fall semester
    } else if (semesterType === "SP") {
      return "SP25"; // Check Spring 2025 data for any Spring semester
    }
    
    // Default fallback
    return "";
  };
  
  /**
   * Checks if a course is available in the given semester
   * @param {Object} course - The course object
   * @param {string} futureSemester - The future semester code (e.g., "FA25", "SP26")
   * @returns {boolean} - Whether the course is available in the mapped semester
   */
  export const isCourseAvailableInSemester = (course, futureSemester) => {
    if (!course || !course.smst || !Array.isArray(course.smst)) {
      return false;
    }
    
    const semesterToCheck = mapToAvailableSemester(futureSemester);
    
    return course.smst.includes(semesterToCheck);
  };
  
  /**
   * Gets information about course season availability
   * @param {Object} course - The course object
   * @returns {Object} - Object containing availability info for Fall and Spring
   */
  export const getCourseSeasonAvailability = (course) => {
    if (!course || !course.smst || !Array.isArray(course.smst)) {
      return { availableInFall: false, availableInSpring: false };
    }
    
    const availableInFall = course.smst.some(semester => semester.startsWith("FA"));
    const availableInSpring = course.smst.some(semester => semester.startsWith("SP"));
    
    return { availableInFall, availableInSpring };
  };