import "./Songs.css";
import { songs } from "../../data/songs";
import { genres2 } from "../../data/genres";
import { useState, useRef, useEffect, useCallback } from "react";
import Rating from '@mui/material/Rating';

// Filters songs by selected genres
function getGenres(selectedGenres) {
  if (!selectedGenres || selectedGenres.length === 0) {
    return songs;
  } else {
    return songs.filter((song) =>
      selectedGenres.every((genre) => song.genre.includes(genre))
    );
  }
}



const SONGS_PER_PAGE = 9;

const Songs = () => {
  const [flipped, setFlipped] = useState({});
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [songSearch, setSongSearch] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [sortOption, setSortOption] = useState("");
  const [visibleCount, setVisibleCount] = useState(SONGS_PER_PAGE);
  const debounceRef = useRef(null);

  // Filter songs by selected genres
  const filteredByGenre = getGenres(selectedGenres);
  // Further filter songs by search input (case-insensitive)
  let filteredSongs = filteredByGenre.filter(song =>
    song.title.toLowerCase().includes(songSearch.toLowerCase())
  );

  // Debounced infinite scroll handler: loads more songs when scrolled near bottom (only if genres are selected)
  const handleScroll = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (selectedGenres.length === 0) return;
      if (
        window.innerHeight + window.scrollY >=
        document.body.offsetHeight - 100
      ) {
        setVisibleCount((prev) => {
          if (prev >= filteredSongs.length) return prev;
          return prev + SONGS_PER_PAGE;
        });
      }
    }, 150);
  }, [selectedGenres, filteredSongs.length]);

  // Sort songs based on sortOption
  if (sortOption === "alphabetical") {
    filteredSongs = [...filteredSongs].sort((a, b) => a.title.localeCompare(b.title));
  } else if (sortOption === "rating-asc") {
    filteredSongs = [...filteredSongs].sort((a, b) => a.review - b.review);
  } else if (sortOption === "rating-desc") {
    filteredSongs = [...filteredSongs].sort((a, b) => b.review - a.review);
  }

  // Handles flipping a song card
  const handleFlip = (title) => {
    setFlipped((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  // Handler for "Show Less" button
  const handleShowLess = () => {
    setVisibleCount((prev) => Math.max(SONGS_PER_PAGE, prev - SONGS_PER_PAGE));
  };

  // Handles selecting/deselecting a genre
  const handleGenreClick = (genre) => {
    setSelectedGenres((prev) => {
      if (prev.includes(genre)) {
        return prev.filter((g) => g !== genre);
      } else if (prev.length < 3) {
        return [...prev, genre];
      } else {
        return prev;
      }
    });
  };

  // Clears all selected genres
  const clearGenres = () => setSelectedGenres([]);

  // Effect: closes dropdown if clicking outside of it
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Effect: reset flipped cards and visible count when genres or search changes
  useEffect(() => {
    setFlipped({});
    setVisibleCount(SONGS_PER_PAGE);
  }, [selectedGenres, songSearch]);

  // Effect: add/remove scroll event listener for infinite scroll (only if genres selected)
  useEffect(() => {
    if (selectedGenres.length > 0) {
      window.addEventListener("scroll", handleScroll);
      return () => window.removeEventListener("scroll", handleScroll);
    }
  }, [selectedGenres, handleScroll]);

  // Only show up to visibleCount songs
  const songsToShow = filteredSongs.slice(0, visibleCount);

  // Handler for "Show More" button
  const handleShowMore = () => {
    setVisibleCount((prev) => prev + SONGS_PER_PAGE);
  };

  return (
    <div className="songs-page">
      {/* Search, filter, and sort row */}
      <div className="show-search-filter-row" style={{ display: "flex", gap: "1rem", alignItems: "center", flexWrap: "wrap" }}>
        {/* Song search input */}
        <div className="song-search-container">
          <input
            type="text"
            placeholder="Search song name..."
            value={songSearch}
            onChange={e => setSongSearch(e.target.value)}
            className="song-search-input"
          />
        </div>
        {/* Genre filter dropdown */}
        <div className="dropdown" ref={dropdownRef}>
          <button
            className="dropbtn"
            onClick={() => setDropdownOpen((open) => !open)}
          >
            Filter by Genre
          </button>
          {dropdownOpen && (
            <div className="dropdown-content">
              {/* List of genre buttons */}
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
              {/* Clear genres button */}
              {selectedGenres.length > 0 && (
                <button className="dropdown-clear-btn" onClick={clearGenres} type="button">
                  Clear
                </button>
              )}
              {/* Genre selection limit message */}
              {selectedGenres.length >= 3 && (
                <div style={{ color: "#b00", fontSize: "0.9em", marginTop: "6px" }}>
                  You can select up to 3 genres.
                </div>
              )}
            </div>
          )}
        </div>
        {/* Sort dropdown */}
        <div className="sort-dropdown" style={{ minWidth: 180 }}>
          <select
            value={sortOption}
            onChange={e => setSortOption(e.target.value)}
            className="song-search-input"
            style={{ minWidth: 180 }}
          >
            <option value="">Sort by...</option>
            <option value="alphabetical">Alphabetical (A-Z)</option>
            <option value="rating-asc">Rating (Lowest First)</option>
            <option value="rating-desc">Rating (Highest First)</option>
          </select>
        </div>
      </div>
      {/* Song cards grid */}
      <div className="songs-container">
        {songsToShow.map((song) => (
          <div
            className={`song-card${flipped[song.title] ? " flipped" : ""}`}
            key={song.title}
            onClick={() => handleFlip(song.title)}
          >
            <div className="card-inner">
              {/* Front of the card: shows title, image, and genre */}
              <div className="card-front">
                <h3>{song.title}</h3>
                <img src={song.image} alt="A song cover" />
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
      {/* Show More/Less buttons only if no genre is selected */}
      {filteredSongs.length > SONGS_PER_PAGE && selectedGenres.length === 0 && (
        <div style={{ textAlign: "center", margin: "24px 0" }}>
          {/* Show More button */}
          {visibleCount < filteredSongs.length && (
            <button className="show-more-btn" onClick={handleShowMore}>
              Show More
            </button>
          )}
          {/* Show Less button */}
          {visibleCount > SONGS_PER_PAGE && (
            <button
              className="show-more-btn"
              style={{ marginLeft: "1rem", background: "linear-gradient(90deg, #f4e285, #f7c948)" }}
              onClick={handleShowLess}
            >
              Show Less
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default Songs;