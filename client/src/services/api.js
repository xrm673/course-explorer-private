import axios from 'axios'

const API_URL = process.env.REACT_APP_API_URL;

export const getDisplayCourse = async (courseCode) => {
    try {
        const response = await axios.get(`${API_URL}/api/course/${courseCode}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching course data", error);
        return null;
    }
};