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
 
const App = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
 
  useEffect(() => {
    const checkAuth = async () => {
      const { user } = await getMe();
      setUser(user);
      setLoading(false);
    };
    checkAuth();
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
    <div>
      <Navbar user={user} onLogout={handleLogout} onLogin={handleLogin} />
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/books' element={<Books />} />
        <Route path='/movies' element={<Movies />} />
        <Route path='/shows' element={<Shows />} />
        <Route path='/songs' element={<Songs />} />
        <Route path='/register' element={<Register />} />
        <Route path='/profile' element={<Profile user={user} />} />
      </Routes>
    </div>
  );
};
 
export default App;