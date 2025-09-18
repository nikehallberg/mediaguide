
import "./Movies.css";
import "../shared/MediaShared.css";
import { movies } from "../../data/movies";
import { useState, useEffect } from "react";
import { genres1 } from "../../data/genres";
import Rating from "@mui/material/Rating";
import FilterBar from "../shared/MediaShared";

// Utility: Filter movies by selected genres and search term
function filterMovies(movies, selectedGenres, searchTerm) {
  let filtered = movies;
  if (selectedGenres.length > 0) {
    filtered = filtered.filter((movie) =>
      selectedGenres.every((genre) => movie.genre.includes(genre))
    );
  }
  if (searchTerm) {
    filtered = filtered.filter((movie) =>
      movie.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }
  return filtered;
}

const Movies = () => {
  const [flipped, setFlipped] = useState({});
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [movieSearch, setMovieSearch] = useState("");
  // Constants for pagination
  const MOVIES_PER_PAGE = 9;
  const [visibleCount, setVisibleCount] = useState(MOVIES_PER_PAGE);

  // Filtered movies
  const filteredMovies = filterMovies(movies, selectedGenres, movieSearch);

  // Card flip handler
  const handleFlip = (title) => {
    setFlipped((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };



  // Reset visible movies and flips on filter/search change
  useEffect(() => {
    setVisibleCount(MOVIES_PER_PAGE);
    setFlipped({});
  }, [selectedGenres, movieSearch]);

  // Only show up to visibleCount movies (for pagination/infinite scroll)
  const moviesToShow = filteredMovies.slice(0, visibleCount);

  return (
    <div className='movies-page'>
      <div className='show-search-filter-row'>
        <FilterBar
          genres={genres1}
          searchTerm={movieSearch}
          setSearchTerm={setMovieSearch}
          selectedGenres={selectedGenres}
          setSelectedGenres={setSelectedGenres}
          maxGenres={3}
          visibleCount={visibleCount}
          setVisibleCount={setVisibleCount}
          totalCount={filteredMovies.length}
          perPage={MOVIES_PER_PAGE}
          infiniteScroll={selectedGenres.length > 0}
        />
      </div>
      <div className='movies-container'>
        {moviesToShow.map((movie) => (
          <div
            className={`movie-card${flipped[movie.title] ? " flipped" : ""}`}
            key={movie.title}
            onClick={() => handleFlip(movie.title)}
          >
            <div className='card-inner'>
              <div className='card-front'>
                <h3>{movie.title}</h3>
                <img src={movie.image} alt='' />
                <p>{movie.genre}</p>
              </div>
              <div className='card-back'>
                <p>{movie.about}</p>
                <Rating
                  name='half-rating-read'
                  value={movie.review}
                  precision={0.5}
                  readOnly
                />
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* Show More/Less buttons and infinite scroll are now handled by FilterBar */}
    </div>
  );
};

export default Movies;