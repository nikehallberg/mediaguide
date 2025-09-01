import "./Movies.css";
import { movies } from "../../data/movies";
import { useState } from "react";
import { genres1 } from "../../data/genres";

function getGenres(selectedGenre) {
  if (!selectedGenre) {
    return movies 
  } else {
    return movies.filter((movie) => movie.genre.includes(selectedGenre))
  }
}
const Movies = () => {
  const [flipped, setFlipped] = useState(Array(movies.length).fill(false));
  const [selectedGenre, setSelectedGenre] = useState(null)
  const filteredMovies = getGenres(selectedGenre)

  const handleFlip = title => {
  setFlipped(f =>
    movies.map((movie, i) =>
      movie.title === title ? !f[i] : f[i]
    )
  );
};
  return (
    <div className="movies-page">
      <div className="movies-header">
        <h1>Movies</h1>
      </div>
      <div className="genre-btn-container">
              <button onClick={() => setSelectedGenre(null)}>All</button>
              {genres1.map((genre) => (
                <button key={genre} onClick={() => setSelectedGenre(genre)}>{genre}</button>
              ))}
            </div>
      <div className="movies-container">
        {filteredMovies.map((movie) => (
      <div className={`movie-card${flipped[movies.findIndex(m => m.title === movie.title)] ? " flipped" : ""}`}
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