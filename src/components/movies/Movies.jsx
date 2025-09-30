import "./Movies.css";
import "../shared/MediaShared.css"

import { movies } from "../../data/movies";
import { useState, useRef, useEffect, useCallback } from "react";
import { genres1 } from "../../data/genres";
import Rating from "@mui/material/Rating";


// Filters movies by selected genres
function getGenres(selectedGenres) {
  if (!selectedGenres || selectedGenres.length === 0) {
    return movies;
  } else {
    return movies.filter((movie) =>
      selectedGenres.every((genre) => movie.genre.includes(genre))
    );
  }
}

const MOVIES_PER_PAGE = 9;

const Movies = () => {
  const [flipped, setFlipped] = useState({});
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [movieSearch, setMovieSearch] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [sortOption, setSortOption] = useState("");
  const [visibleCount, setVisibleCount] = useState(MOVIES_PER_PAGE);
  const debounceRef = useRef(null);

  // Filter movies by selected genres
  const filteredByGenre = getGenres(selectedGenres);
  // Further filter movies by search input (case-insensitive)
  let filteredMovies = filteredByGenre.filter((movie) =>
    movie.title.toLowerCase().includes(movieSearch.toLowerCase())
  );

  // Debounced infinite scroll handler: loads more movies when scrolled near bottom (only if genres are selected)
  const handleScroll = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (selectedGenres.length === 0) return;
      if (
        window.innerHeight + window.scrollY >=
        document.body.offsetHeight - 100
      ) {
        setVisibleCount((prev) => {
          if (prev >= filteredMovies.length) return prev;
          return prev + MOVIES_PER_PAGE;
        });
      }
    }, 150);
  }, [selectedGenres, filteredMovies.length]);

  // Sort movies based on sortOption
  if (sortOption === "alphabetical") {
    filteredMovies = [...filteredMovies].sort((a, b) =>
      a.title.localeCompare(b.title)
    );
  } else if (sortOption === "rating-asc") {
    filteredMovies = [...filteredMovies].sort((a, b) => a.review - b.review);
  } else if (sortOption === "rating-desc") {
    filteredMovies = [...filteredMovies].sort((a, b) => b.review - a.review);
  }

  // Handles flipping a movie card
  const handleFlip = (title) => {
    setFlipped((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  // Handler for "Show Less" button
  const handleShowLess = () => {
    setVisibleCount((prev) => Math.max(MOVIES_PER_PAGE, prev - MOVIES_PER_PAGE));
  };

  // Handles selecting/deselecting a genre
  const handleGenreClick = (genre) => {
    setSelectedGenres((prev) => {
      if (prev.includes(genre)) {
        return prev.filter((g) => g !== genre);
      } else if (prev.length < 3) {
        return [...prev, genre];
      } else {
        return prev;
      }
    });
  };

  // Clears all selected genres
  const clearGenres = () => setSelectedGenres([]);

  // Effect: closes dropdown if clicking outside of it
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Effect: reset flipped cards and visible count when genres or search changes
  useEffect(() => {
    setFlipped({});
    setVisibleCount(MOVIES_PER_PAGE);
  }, [selectedGenres, movieSearch]);

  // Effect: add/remove scroll event listener for infinite scroll (only if genres selected)
  useEffect(() => {
    if (selectedGenres.length > 0) {
      window.addEventListener("scroll", handleScroll);
      return () => window.removeEventListener("scroll", handleScroll);
    }
  }, [selectedGenres, handleScroll]);

  // Only show up to visibleCount movies
  const moviesToShow = filteredMovies.slice(0, visibleCount);

  // Handler for "Show More" button
  const handleShowMore = () => {
    setVisibleCount((prev) => prev + MOVIES_PER_PAGE);
  };

  return (
    <div className="movies-page">
      {/* Search, filter, and sort row */}
      <div className="show-search-filter-row" style={{ display: "flex", gap: "1rem", alignItems: "center", flexWrap: "wrap" }}>
        {/* Movie search input */}
        <div className="movie-search-container">
          <input
            type="text"
            placeholder="Search movie name..."
            value={movieSearch}
            onChange={e => setMovieSearch(e.target.value)}
            className="movie-search-input"
          />
        </div>
        {/* Genre filter dropdown */}
        <div className="dropdown" ref={dropdownRef}>
          <button
            className="dropbtn"
            onClick={() => setDropdownOpen((open) => !open)}
          >
            Filter by Genre
          </button>
          {dropdownOpen && (
            <div className="dropdown-content">
              {/* List of genre buttons */}
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
              {/* Clear genres button */}
              {selectedGenres.length > 0 && (
                <button className="dropdown-clear-btn" onClick={clearGenres} type="button">
                  Clear
                </button>
              )}
              {/* Genre selection limit message */}
              {selectedGenres.length >= 3 && (
                <div style={{ color: "#b00", fontSize: "0.9em", marginTop: "6px" }}>
                  You can select up to 3 genres.
                </div>
              )}
            </div>
          )}
        </div>
        {/* Sort dropdown */}
        <div className="sort-dropdown" style={{ minWidth: 180 }}>
          <select
            value={sortOption}
            onChange={e => setSortOption(e.target.value)}
            className="movie-search-input"
            style={{ minWidth: 180 }}
          >
            <option value="">Sort by...</option>
            <option value="alphabetical">Alphabetical (A-Z)</option>
            <option value="rating-asc">Rating (Lowest First)</option>
            <option value="rating-desc">Rating (Highest First)</option>
          </select>
        </div>
      </div>
      {/* Movie cards grid */}
      <div className="movies-container">
        {moviesToShow.map((movie) => (
          <div
            className={`movie-card${flipped[movie.title] ? " flipped" : ""}`}
            key={movie.title}
            onClick={() => handleFlip(movie.title)}
          >
            <div className="card-inner">
              {/* Front of the card: title, image, genres */}
              <div className="card-front">
                <h3>{movie.title}</h3>
                <img src={movie.image} alt="A movie cover" />
                <p>{movie.genre}</p>
              </div>
              {/* Back of the card: about and review */}
              <div className="card-back">
                <p>{movie.about}</p>
                <Rating name="half-rating-read" value={movie.review} precision={0.5} readOnly />
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* Show More/Less buttons only if no genre is selected */}
      {filteredMovies.length > MOVIES_PER_PAGE && selectedGenres.length === 0 && (
        <div style={{ textAlign: "center", margin: "24px 0" }}>
          {/* Show More button */}
          {visibleCount < filteredMovies.length && (
            <button className="show-more-btn" onClick={handleShowMore}>
              Show More
            </button>
          )}
          {/* Show Less button */}
          {visibleCount > MOVIES_PER_PAGE && (
            <button
              className="show-more-btn"
              style={{ marginLeft: "1rem", background: "linear-gradient(90deg, #f4e285, #f7c948)" }}
              onClick={handleShowLess}
            >
              Show Less
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default Movies;