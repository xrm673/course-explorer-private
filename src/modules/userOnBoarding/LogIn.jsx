import { useState, useContext } from 'react';
import { UserContext } from '../../context/UserContext';
import { loginWithNetID } from '../../firebase/services/authService';

const LogIn = () => {
  const [netId, setNetId] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Get the user context
  const { user, setUser } = useContext(UserContext);
  
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
      
      // Show success message
      setSuccess(`Welcome back, ${userData.name || userData.netId}!`);
      
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
    localStorage.removeItem('user');
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
          disabled={loading}
          required
        />
      </div>
      
      <button 
        type="submit" 
        disabled={loading}
        className="login-button"
      >
        {loading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
};

export default LogIn;