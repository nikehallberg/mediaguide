import Navbar from "./components/navbar/Navbar";
import Home from "./components/home/Home";
import Books from "./components/books/Books";
import Movies from "./components/movies/Movies";
import Shows from "./components/shows/Shows";
import Songs from "./components/songs/Songs";
import Profile from "./components/profile/Profile";
import { Route, Routes } from "react-router-dom";
import Register from "./components/register/Register";
import { useState, useEffect } from "react";
import { getMe, logout as logoutApi } from "./services/authService";
import { AlertProvider } from "./components/shared/AlertProvider";
 
const App = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
 
  // Function to handle authentication check
  const checkAuth = async () => {
    try {
      const { user } = await getMe();
      setUser(user);
      if (loading) setLoading(false);
    } catch (error) {
      // If auth check fails, ensure user is logged out
      setUser(null);
      if (loading) setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
    
    // Set up periodic auth validation every 5 minutes
    const authCheckInterval = setInterval(checkAuth, 5 * 60 * 1000);
    
    // Listen for auth events from other parts of the app
    const handleAuthEvent = (event) => {
      if (event.type === 'auth-logout' || event.type === 'auth-expired') {
        setUser(null);
        // Optional: Show a message to user about session expiration
        if (event.type === 'auth-expired') {
          console.log('Session expired - user logged out');
          // You could show a toast notification here if you want
        }
      } else if (event.type === 'auth-login' || event.type === 'auth-register') {
        setUser(event.detail);
      }
    };
    
    // Set up event listeners for authentication changes
    window.addEventListener('auth-login', handleAuthEvent);
    window.addEventListener('auth-register', handleAuthEvent);
    window.addEventListener('auth-logout', handleAuthEvent);
    window.addEventListener('auth-expired', handleAuthEvent);
    
    return () => {
      clearInterval(authCheckInterval);
      window.removeEventListener('auth-login', handleAuthEvent);
      window.removeEventListener('auth-register', handleAuthEvent);
      window.removeEventListener('auth-logout', handleAuthEvent);
      window.removeEventListener('auth-expired', handleAuthEvent);
    };
  }, []);
 
  const handleLogin = (userData) => {
    setUser(userData);
  };
 
  const handleLogout = async () => {
    await logoutApi();
    setUser(null);
  };
 
  if (loading) {
    return <div>Loading...</div>;
  }
 
  return (
    <AlertProvider>
      <div>
        <Navbar user={user} onLogout={handleLogout} onLogin={handleLogin} />
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/books' element={<Books />} />
          <Route path='/movies' element={<Movies />} />
          <Route path='/shows' element={<Shows />} />
          <Route path='/songs' element={<Songs />} />
          <Route path='/register' element={<Register />} />
          <Route path='/profile' element={<Profile />} />
        </Routes>
      </div>
    </AlertProvider>
  );
};
 
export default App;