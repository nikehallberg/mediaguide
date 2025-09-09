import "./Shows.css";
import { shows } from "../../data/shows";
import { useState, useRef, useEffect } from "react";
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

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

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

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="shows-page">
      {/* Search and filter row */}
      <div className="show-search-filter-row">
        <div className="show-search-container">
          <input
            type="text"
            placeholder="Search show name..."
            value={showSearch}
            onChange={e => setShowSearch(e.target.value)}
            className="show-search-input"
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
                >
                  {genre}
                </button>
              ))}
              {selectedGenres.length > 0 && (
                <button className="dropdown-clear-btn" onClick={clearGenres} type="button">
                  Clear
                </button>
              )}
            </div>
          )}
        </div>
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
              </div> 
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Shows;