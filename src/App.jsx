import Navbar from "./components/navbar/Navbar";
import Home from "./components/home/Home";
import Books from "./components/books/Books";
import Movies from "./components/movies/Movies";
import Shows from "./components/shows/Shows";
import Songs from "./components/songs/Songs";
import { Route, Routes } from "react-router-dom";
import Register from "./components/register/Register";
import { useState } from "react";

// Main App component
const App = () => {
  // State to keep track of the logged-in user (from localStorage if available)
  const [user, setUser] = useState(localStorage.getItem("loggedInUser") || null);

  // Function to handle user login
  const handleLogin = (username) => {
    setUser(username); // Set user state
    localStorage.setItem("loggedInUser", username); // Persist user in localStorage
  };

  // Function to handle user logout
  const handleLogout = () => {
    setUser(null); // Clear user state
    localStorage.removeItem("loggedInUser"); // Remove user from localStorage
  };

  // Render the app UI
  return (
    <div>
      {/* Navbar receives user info and login/logout handlers as props */}
      <Navbar user={user} onLogout={handleLogout} onLogin={handleLogin} />
      {/* Define routes for different pages */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/books" element={<Books />} />
        <Route path="/movies" element={<Movies />} />
        <Route path="/shows" element={<Shows />} />
        <Route path="/songs" element={<Songs />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </div>
  );
};

export default App;