import "./Songs.css";
import { songs } from "../../data/songs";
import { genres2 } from "../../data/genres";
import { useState, useRef, useEffect } from "react";
import Rating from '@mui/material/Rating';

// Filters songs by selected genres
function getGenres(selectedGenres) {
  if (!selectedGenres || selectedGenres.length === 0) {
    return songs; // No genres selected, return all songs
  } else {
    // Return songs that include all selected genres
    return songs.filter((song) =>
      selectedGenres.every((genre) => song.genre.includes(genre))
    );
  }
}

const Songs = () => {
  // State for which cards are flipped (for card flip animation)
  const [flipped, setFlipped] = useState({});
  // State for selected genres (array of strings)
  const [selectedGenres, setSelectedGenres] = useState([]);
  // State for the song search input
  const [songSearch, setSongSearch] = useState("");

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Filter songs by selected genres
  const filteredByGenre = getGenres(selectedGenres);
  // Further filter songs by search input (case-insensitive)
  const filteredSongs = filteredByGenre.filter(song =>
    song.title.toLowerCase().includes(songSearch.toLowerCase())
  );
  
  // Toggles the flipped state for a song card
  const handleFlip = (title) => {
    setFlipped((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  // Handles clicking a genre button (select/deselect)
  const handleGenreClick = (genre) => {
    setSelectedGenres((prev) => {
      if (prev.includes(genre)) {
        return prev.filter((g) => g !== genre); // Remove if already selected
      } else if (prev.length < 3) {
        return [...prev, genre]; // Add if not selected and under limit
      } else {
        return prev; // Do not add more than 3
      }
    });
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

  useEffect(() => {
  // Reset all flipped cards when genres change
  setFlipped({});
}, [selectedGenres]);

  return (
    <div className="songs-page">
      {/* Search and filter row */}
      <div className="show-search-filter-row">
        <div className="song-search-container">
          <input
            type="text"
            placeholder="Search song name..."
            value={songSearch}
            onChange={e => setSongSearch(e.target.value)}
            className="song-search-input"
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
              {genres2.map((genre) => (
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
              {selectedGenres.length > 0 && (
                <button className="dropdown-clear-btn" onClick={clearGenres} type="button">
                  Clear
                </button>
              )}
              {selectedGenres.length >= 3 && (
                <div style={{ color: "#b00", fontSize: "0.9em", marginTop: "6px" }}>
                  You can select up to 3 genres.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      {/* Song cards grid */}
      <div className="songs-container">
        {filteredSongs.map((song) => (
          <div
            className={`song-card${flipped[song.title] ? " flipped" : ""}`}
            key={song.title}
            onClick={() => handleFlip(song.title)}
          >
            <div className="card-inner">
              {/* Front of the card: shows title, image, and genre */}
              <div className="card-front">
                <h3>{song.title}</h3>
                <img src={song.image} alt="" />
                <p>{song.genre}</p>
              </div>
              {/* Back of the card: shows about and review */}
              <div className="card-back">
                <p>{song.about}</p>
                <Rating name="half-rating-read" value={song.review} precision={0.5} readOnly />
              </div> 
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Songs;