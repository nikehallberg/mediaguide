import "./Songs.css";
import { songs } from "../../data/songs";
import { genres2 } from "../../data/genres";
import { useState } from "react";

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
    setSelectedGenres((prev) =>
      prev.includes(genre)
        ? prev.filter((g) => g !== genre) // Remove if already selected
        : [...prev, genre] // Add if not selected
    );
  };

  // Clears all selected genres
  const clearGenres = () => setSelectedGenres([]);

  return (
    <div className="songs-page">
      {/* Search input for song titles */}
      <div className="song-search-container">
        <input
          type="text"
          placeholder="Search song name..."
          value={songSearch}
          onChange={e => setSongSearch(e.target.value)}
          className="song-search-input"
        />
      </div>
      {/* Genre filter buttons */}
      <div className="genre-btn-container">
        <button className="clear-btn" onClick={clearGenres}>Clear genres</button>
        {genres2.map((genre) => (
          <button
            key={genre}
            onClick={() => handleGenreClick(genre)}
            className={selectedGenres.includes(genre) ? "selected" : ""}
          >
            {genre}
          </button>
        ))}
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
                <p>{song.review}</p>
                {/* <div className="songs-bottom"></div> */}
              </div> 
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Songs;