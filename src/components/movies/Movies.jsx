import "./Movies.css";
import { movies } from "../../data/movies";
import { useState, useRef, useEffect } from "react";
import { genres1 } from "../../data/genres";
import Rating from '@mui/material/Rating';

// Filters movies by selected genres
function getGenres(selectedGenres) {
  if (!selectedGenres || selectedGenres.length === 0) {
    return movies; // No genres selected, return all movies
  } else {
    // Return movies that include all selected genres
    return movies.filter((movie) =>
      selectedGenres.every((genre) => movie.genre.includes(genre))
    );
  }
}

const Movies = () => {
  // State for which cards are flipped (for card flip animation)
  const [flipped, setFlipped] = useState({});
  // State for selected genres (array of strings)
  const [selectedGenres, setSelectedGenres] = useState([]);
  // State for the movie search input
  const [movieSearch, setMovieSearch] = useState("");

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const [visibleCount, setVisibleCount] = useState(12);

  // Filter movies by selected genres
  const filteredByGenre = getGenres(selectedGenres);
  // Further filter movies by search input (case-insensitive)
  const filteredMovies = filteredByGenre.filter(movie =>
    movie.title.toLowerCase().includes(movieSearch.toLowerCase())
  );

  // Toggles the flipped state for a movie card
  const handleFlip = (title) => {
    setFlipped((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  // Handles clicking a genre button (select/deselect)
  const handleGenreClick = (genre) => {
    setSelectedGenres((prev) => {
      if (prev.includes(genre)) {
        return prev.filter((g) => g !== genre); // Remove if already selected
      } else if (prev.length < 3) {
        return [...prev, genre]; // Add if not selected and under limit
      } else {
        return prev; // Do not add more than 3
      }
    });
  };
  // Clears all selected genres
  const clearGenres = () => setSelectedGenres([]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  
  useEffect(() => {
  // Reset all flipped cards when genres change
  setFlipped({});
}, [selectedGenres]);

  useEffect(() => {
  function handleScroll() {
    if (
      window.innerHeight + window.scrollY >= document.body.offsetHeight - 200 &&
      visibleCount < filteredMovies.length
    ) {
      setVisibleCount((prev) => prev + 9); // Load 9 more movies
    }
  }
  window.addEventListener("scroll", handleScroll);
  return () => window.removeEventListener("scroll", handleScroll);
}, [visibleCount, filteredMovies.length]);

  useEffect(() => {
  setVisibleCount(12); // Reset to initial count when filters/search change
  }, [selectedGenres, movieSearch]);


  return (
    <div className="movies-page">
      {/* Search and filter row */}
      <div className="show-search-filter-row">
        <div className="movie-search-container">
          <input
            type="text"
            placeholder="Search movie name..."
            value={movieSearch}
            onChange={e => setMovieSearch(e.target.value)}
            className="movie-search-input"
          />
        </div>
        <div className="dropdown" ref={dropdownRef}>
          <button
            className="dropbtn"
            onClick={() => setDropdownOpen((open) => !open)}
          >
            Filter by Genre
          </button>
          {dropdownOpen && (
            <div className="dropdown-content">
              {genres1.map((genre) => (
              <button
                  key={genre}
                  className={`dropdown-genre-btn${selectedGenres.includes(genre) ? " selected" : ""}`}
                  onClick={() => handleGenreClick(genre)}
                  type="button"
                  disabled={
                    !selectedGenres.includes(genre) && selectedGenres.length >= 3
                  }
                  style={
                    !selectedGenres.includes(genre) && selectedGenres.length >= 3
                      ? { opacity: 0.5, cursor: "not-allowed" }
                      : {}
                  }
                >
                  {genre}
                </button>
              ))}
              {selectedGenres.length > 0 && (
                <button className="dropdown-clear-btn" onClick={clearGenres} type="button">
                  Clear
                </button>
              )}
              {selectedGenres.length >= 3 && (
                <div style={{ color: "#b00", fontSize: "0.9em", marginTop: "6px" }}>
                  You can select up to 3 genres.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      {/* Movie cards grid */}
      <div className="movies-container">
        {filteredMovies.slice(0, visibleCount).map((movie) => (
          <div
            className={`movie-card${flipped[movie.title] ? " flipped" : ""}`}
            key={movie.title}
            onClick={() => handleFlip(movie.title)}
          >
            <div className="card-inner">
              {/* Front of the card: shows title, image, and genre */}
              <div className="card-front">
                <h3>{movie.title}</h3>
                <img src={movie.image} alt="" />
                <p>{movie.genre}</p>
              </div>
              {/* Back of the card: shows about and review */}
              <div className="card-back">
                <p>{movie.about}</p>
                <Rating name="half-rating-read" value={movie.review} precision={0.5} readOnly />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Movies;