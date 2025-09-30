import "./Movies.css";
import "../shared/MediaShared.css"

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

const MOVIES_PER_PAGE = 12;

const sortOptions = [
  { value: "alphabetical", label: "Alphabetical (A-Z)" },
  { value: "rating-asc", label: "Rating (Lowest First)" },
  { value: "rating-desc", label: "Rating (Highest First)" },
];

const Movies = () => {
  const [flipped, setFlipped] = useState({});
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [movieSearch, setMovieSearch] = useState("");
  const [sortOption, setSortOption] = useState("");
  const [visibleCount, setVisibleCount] = useState(MOVIES_PER_PAGE);

  // Filter and sort movies
  let filteredMovies = filterMovies(movies, selectedGenres, movieSearch);
  if (sortOption === "alphabetical") {
    filteredMovies = [...filteredMovies].sort((a, b) => a.title.localeCompare(b.title));
  } else if (sortOption === "rating-asc") {
    filteredMovies = [...filteredMovies].sort((a, b) => a.review - b.review);
  } else if (sortOption === "rating-desc") {
    filteredMovies = [...filteredMovies].sort((a, b) => b.review - a.review);
  }

  // Card flip handler
  const handleFlip = (title) => {
    setFlipped((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  // Reset visible movies and flips on filter/search/sort change
  useEffect(() => {
    setVisibleCount(MOVIES_PER_PAGE);
    setFlipped({});
  }, [selectedGenres, movieSearch, sortOption]);

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
          sortOption={sortOption}
          setSortOption={setSortOption}
          sortOptions={sortOptions}
          searchPlaceholder="Search movie name..."
          inputClass="movie-search-input"
        />
      </div>
      <div className='movies-container'>
        {filteredMovies.slice(0, visibleCount).map((movie) => (
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
    </div>
  );
};

export default Movies;
