import Navbar from "./components/navbar/Navbar";
import Home from "./components/home/Home";
import Books from "./components/books/Books";
import Movies from "./components/movies/Movies";
import Shows from "./components/shows/Shows";
import Songs from "./components/songs/Songs";
import { Route, Routes } from "react-router-dom";

const App = () => {
  return (
    <div>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/books" element={<Books />} />
        <Route path="/movies" element={<Movies />} />
        <Route path="/shows" element={<Shows />} />
        <Route path="/songs" element={<Songs />} />
      </Routes>
    </div>
  );
};

export default App;
