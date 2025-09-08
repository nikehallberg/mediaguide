import "./Movies.css";
import { movies } from "../../data/movies";
import { useState } from "react";
import { genres1 } from "../../data/genres";

function getGenres(selectedGenres) {
  if (!selectedGenres || selectedGenres.length === 0) {
    return movies;
  } else {
    return movies.filter((movie) =>
      selectedGenres.every((genre) => movie.genre.includes(genre))
    );
  }
}

const Movies = () => {
  const [flipped, setFlipped] = useState({});
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [movieSearch, setMovieSearch] = useState("");


  const filteredByGenre = getGenres(selectedGenres);
  const filteredMovies = filteredByGenre.filter(movie =>
    movie.title.toLowerCase().includes(movieSearch.toLowerCase())
  );

  const handleFlip = (title) => {
    setFlipped((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  // const handleGenreClick = (genre) => {
  //   setSelectedGenres((prev) =>
  //     prev.includes(genre)
  //       ? prev.filter((g) => g !== genre)
  //       : [...prev, genre]
  //   );
  // };

  const clearGenres = () => setSelectedGenres([]);

  return (
    <div className="movies-page">
      <div className="movie-search-container">
        <input
          type="text"
          placeholder="Search movie name..."
          value={movieSearch}
          onChange={e => setMovieSearch(e.target.value)}
          className="movie-search-input"
        />
      </div>
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
      <div className="movies-container">
        {filteredMovies.map((movie) => (
          <div
            className={`movie-card${flipped[movie.title] ? " flipped" : ""}`}
            key={movie.title}
            onClick={() => handleFlip(movie.title)}
          >
            <div className="card-inner">
              <div className="card-front">
                <h3>{movie.title}</h3>
                <img src={movie.image} alt="" />
                <p>{movie.genre}</p>
              </div>
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