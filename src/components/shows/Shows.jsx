import "./Shows.css";
import { shows } from "../../data/shows";
import { useState } from "react";
import { genres1 } from "../../data/genres";

// Filters shows by selected genres
function getGenres(selectedGenres) {
  if (!selectedGenres || selectedGenres.length === 0) {
    return shows; // No genres selected, return all shows
  } else {
    // Return shows that include all selected genres
    return shows.filter((show) =>
      selectedGenres.every((genre) => show.genre.includes(genre))
    );
  }
}

const Shows = () => {
  // State for which cards are flipped (for card flip animation)
  const [flipped, setFlipped] = useState({});
  // State for selected genres (array of strings)
  const [selectedGenres, setSelectedGenres] = useState([]);
  // State for the show search input
  const [showSearch, setShowSearch] = useState("");

  // Filter shows by selected genres
  const filteredByGenre = getGenres(selectedGenres);
  // Further filter shows by search input (case-insensitive)
  const filteredShows = filteredByGenre.filter(show =>
    show.title.toLowerCase().includes(showSearch.toLowerCase())
  );
  
  // Toggles the flipped state for a show card
  const handleFlip = (title) => {
    setFlipped((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  // Handles clicking a genre button (select/deselect)
  const handleGenreClick = (genre) => {
    setSelectedGenres((prev) =>
      prev.includes(genre)
        ? prev.filter((g) => g !== genre) // Remove if already selected
        : [...prev, genre] // Add if not selected
    );
  };

  // Clears all selected genres
  const clearGenres = () => setSelectedGenres([]);

  return (
    <div className="shows-page">
      {/* Search input for show titles */}
      <div className="show-search-container">
        <input
          type="text"
          placeholder="Search show name..."
          value={showSearch}
          onChange={e => setShowSearch(e.target.value)}
          className="show-search-input"
        />
      </div>
      {/* Genre filter buttons */}
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
      {/* Show cards grid */}
      <div className="shows-container">
        {filteredShows.map((show) => (
          <div
            className={`show-card${flipped[show.title] ? " flipped" : ""}`}
            key={show.title}
            onClick={() => handleFlip(show.title)}
          >
            <div className="card-inner">
              {/* Front of the card: shows title, image, and genre */}
              <div className="card-front">
                <h3>{show.title}</h3>
                <img src={show.image} alt="" />
                <p>{show.genre}</p>
              </div>
              {/* Back of the card: shows about and review */}
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