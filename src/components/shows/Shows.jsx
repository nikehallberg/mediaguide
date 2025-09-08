import "./Shows.css";
import { shows } from "../../data/shows";
import { useState } from "react";
import { genres1 } from "../../data/genres";

function getGenres(selectedGenres) {
  if (!selectedGenres || selectedGenres.length === 0) {
    return shows;
  } else {
    return shows.filter((show) =>
      selectedGenres.every((genre) => show.genre.includes(genre))
    );
  }
}

const Shows = () => {
  const [flipped, setFlipped] = useState({});
  const [selectedGenres, setSelectedGenres] = useState([])
  const [showSearch, setShowSearch] = useState("")

  const filteredByGenre = getGenres(selectedGenres);
  const filteredShows = filteredByGenre.filter(show =>
    show.title.toLowerCase().includes(showSearch.toLowerCase())
  );
  
  const handleFlip = (title) => {
    setFlipped((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  const handleGenreClick = (genre) => {
    setSelectedGenres((prev) =>
      prev.includes(genre)
        ? prev.filter((g) => g !== genre)
        : [...prev, genre]
    );
  };

  const clearGenres = () => setSelectedGenres([]);

  return (
    <div className="shows-page">
      <div className="show-search-container">
        <input
          type="text"
          placeholder="Search show name..."
          value={showSearch}
          onChange={e => setShowSearch(e.target.value)}
          className="show-search-input"
        />
      </div>
      <div className="genre-btn-container">
        <button className="clear-btn" onClick={clearGenres}>Clear genres</button>
        {genres1.map((genre) => (
          <button
            key={genre}
            onClick={() => handleGenreClick(genre)}
            className={selectedGenres.includes(genre) ? "selected" : ""}
          >
            {genre}
          </button>
        ))}
      </div>
      <div className="shows-container">
        {filteredShows.map((show) => (
          <div
            className={`show-card${flipped[show.title] ? " flipped" : ""}`}
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
            {/* <div className="Shows-bottom"></div> */}
          </div> 
          </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Shows;
