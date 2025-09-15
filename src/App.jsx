import Navbar from "./components/navbar/Navbar";
import Home from "./components/home/Home";
import Books from "./components/books/Books";
import Movies from "./components/movies/Movies";
import Shows from "./components/shows/Shows";
import Songs from "./components/songs/Songs";
import { Route, Routes, useNavigate } from "react-router-dom";
import Login from "./components/login/Login";
import Register from "./components/register/Register";
import { useState } from "react";

const App = () => {
  const [user, setUser] = useState(localStorage.getItem("loggedInUser") || null);
  const handleLogin = (username) => {
    setUser(username);
    localStorage.setItem("loggedInUser", username);
  };
  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("loggedInUser");
  };

  return (
    <div>
      <Navbar user={user} onLogout={handleLogout} onLogin={handleLogin} />
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