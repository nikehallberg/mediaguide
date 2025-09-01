import "./Shows.css";
import { shows } from "../../data/shows";
import { genres1 } from "../../data/genres";
import { useState } from "react";

function getGenres(selectedGenre) {
  if (!selectedGenre) {
    return shows 
  } else {
    return shows.filter((show) => show.genre.includes(selectedGenre))
  }
}
const Shows = () => {
  const [flipped, setFlipped] = useState({});
  const [selectedGenre, setSelectedGenre] = useState(null)
  const filteredShows = getGenres(selectedGenre)

  const handleFlip = title => {
    setFlipped(f =>
      shows.map((show, i) =>
        show.title === title ? !f[i] : f[i]
      )
    );
  };
  return (
    <div className="shows-page">
      <div className="shows-header">
        <h1>Shows</h1>
        </div>
        <div className="genre-btn-container">
          <button onClick={() => setSelectedGenre(null)}>All</button>
          {genres1.map((genre) => (
            <button key={genre} onClick={() => setSelectedGenre(genre)}>{genre}</button>
          ))}
        </div>
      <div className="shows-container">
        {filteredShows.map((show) => (
          <div className={`show-card${flipped[shows.findIndex(s => s.title === show.title)] ? " flipped" :""}`}
            key={show.title}
            onClick={() => handleFlip(show.title)}
          >
          <div className="card-inner">
            <div className="card-front">
            <h3>{show.title}</h3>
            <img src={show.image} alt="" />
            <p>{show.genre}</p>
            </div>
            <div className="card-back">
            <p>{show.about}</p>
            <p>{show.review}</p>
            </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Shows;
