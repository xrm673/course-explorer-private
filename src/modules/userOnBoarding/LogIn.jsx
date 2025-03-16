import { useState, useContext } from 'react';
import { UserContext } from '../../context/UserContext';
import { useAcademic } from '../../context/AcademicContext';
import { loginWithNetID } from '../../firebase/services/authService';
import { fetchUserMajorsData } from '../../firebase/services/majorService';

const LogIn = () => {
  const [netId, setNetId] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [academicDataLoading, setAcademicDataLoading] = useState(false);
  
  // Get the user context and academic context
  const { user, setUser } = useContext(UserContext);
  const { updateAcademicData, clearAcademicData } = useAcademic();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    
    try {
      // Call the login function with the entered NetID
      const userData = await loginWithNetID(netId);
      
      // Update the user context with the fetched data
      setUser(userData);
      
      // Show initial success message
      setSuccess(`Welcome back, ${userData.name || userData.netId}!`);
      
      // If user has majors, load academic data
      if (userData.majors && userData.majors.length > 0) {
        try {
          setAcademicDataLoading(true);
          setSuccess(`Welcome back, ${userData.name || userData.netId}! Loading your academic data...`);
          
          // Fetch academic data for the user's majors
          const academicData = await fetchUserMajorsData(userData.majors);
          
          // Store the academic data in context (and localStorage)
          updateAcademicData(academicData);
          
          // Update success message
          setSuccess(`Welcome back, ${userData.name || userData.netId}! Your academic data has been loaded.`);
          
          console.log('Academic data loaded successfully:', academicData);
        } catch (academicError) {
          console.error('Failed to load academic data:', academicError);
          setError(`Logged in successfully, but couldn't load academic data: ${academicError.message}`);
        } finally {
          setAcademicDataLoading(false);
        }
      }
      
      // Clear the input field
      setNetId('');
    } catch (error) {
      setError(error.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setUser(null);
    clearAcademicData(); // Clear academic data when logging out
  };
  
  // If user is already logged in, show different content
  if (user) {
    return (
      <div>
        <h2>You are logged in</h2>
        <p>Welcome, {user.name || user.netId}!</p>
        <button 
            onClick={handleLogout}
            className="logout-button"
        >
            Log Out
        </button>
      </div>
    );
  }
  
  return (
    <form onSubmit={handleSubmit} className="login-form">
      <h2>Login with NetID</h2>
      
      {error && <p className="error-message">{error}</p>}
      {success && <p className="success-message">{success}</p>}
      
      <div className="form-group">
        <label htmlFor="netId">NetID:</label>
        <input
          id="netId"
          type="text"
          value={netId}
          onChange={(e) => setNetId(e.target.value)}
          disabled={loading || academicDataLoading}
          required
        />
      </div>
      
      <button 
        type="submit" 
        disabled={loading || academicDataLoading}
        className="login-button"
      >
        {loading ? 'Logging in...' : 
         academicDataLoading ? 'Loading academic data...' : 
         'Login'}
      </button>
    </form>
  );
};

export default LogIn;