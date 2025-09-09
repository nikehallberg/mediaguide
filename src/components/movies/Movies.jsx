import "./Movies.css";
import { movies } from "../../data/movies";
import { useState } from "react";
import { genres1 } from "../../data/genres";

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

  // Handles clearing all selected genres
  const clearGenres = () => setSelectedGenres([]);

  return (
    <div className="movies-page">
      {/* Search input for movie titles */}
      <div className="movie-search-container">
        <input
          type="text"
          placeholder="Search movie name..."
          value={movieSearch}
          onChange={e => setMovieSearch(e.target.value)}
          className="movie-search-input"
        />
      </div>
      {/* Genre filter dropdown (multi-select) */}
      <div className="genre-dropdown-container">
        <select
          multiple
          value={selectedGenres}
          onChange={e =>
            setSelectedGenres(
              Array.from(e.target.selectedOptions, option => option.value)
            )
          }
          className="genre-dropdown"
        >
          {genres1.map((genre) => (
            <option key={genre} value={genre}>
              {genre}
            </option>
          ))}
        </select>
        <button className="clear-btn" onClick={clearGenres}>Clear genres</button>
      </div>
      {/* Movie cards grid */}
      <div className="movies-container">
        {filteredMovies.map((movie) => (
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
                <p>{movie.review}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Movies;