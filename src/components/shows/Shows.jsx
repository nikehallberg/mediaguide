import "./Shows.css";
import { shows } from "../../data/shows";
import { useState, useRef, useEffect, useCallback } from "react";
import { genres1 } from "../../data/genres";
import Rating from '@mui/material/Rating';

// Filters shows by selected genres
function getGenres(selectedGenres) {
  if (!selectedGenres || selectedGenres.length === 0) {
    return shows;
  } else {
    return shows.filter((show) =>
      selectedGenres.every((genre) => show.genre.includes(genre))
    );
  }
}



const SHOWS_PER_PAGE = 9;

const Shows = () => {
  const [flipped, setFlipped] = useState({});
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [showSearch, setShowSearch] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [sortOption, setSortOption] = useState("");
  const [visibleCount, setVisibleCount] = useState(SHOWS_PER_PAGE);
  const debounceRef = useRef(null);

  // Filter shows by selected genres
  const filteredByGenre = getGenres(selectedGenres);
  // Further filter shows by search input (case-insensitive)
  let filteredShows = filteredByGenre.filter(show =>
    show.title.toLowerCase().includes(showSearch.toLowerCase())
  );

  // Debounced infinite scroll handler: loads more shows when scrolled near bottom (only if genres are selected)
  const handleScroll = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (selectedGenres.length === 0) return;
      if (
        window.innerHeight + window.scrollY >=
        document.body.offsetHeight - 100
      ) {
        setVisibleCount((prev) => {
          if (prev >= filteredShows.length) return prev;
          return prev + SHOWS_PER_PAGE;
        });
      }
    }, 150);
  }, [selectedGenres, filteredShows.length]);

  // Sort shows based on sortOption
  if (sortOption === "alphabetical") {
    filteredShows = [...filteredShows].sort((a, b) => a.title.localeCompare(b.title));
  } else if (sortOption === "rating-asc") {
    filteredShows = [...filteredShows].sort((a, b) => a.review - b.review);
  } else if (sortOption === "rating-desc") {
    filteredShows = [...filteredShows].sort((a, b) => b.review - a.review);
  }

  // Handles flipping a show card
  const handleFlip = (title) => {
    setFlipped((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  // Handler for "Show Less" button
  const handleShowLess = () => {
    setVisibleCount((prev) => Math.max(SHOWS_PER_PAGE, prev - SHOWS_PER_PAGE));
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
    setVisibleCount(SHOWS_PER_PAGE);
  }, [selectedGenres, showSearch]);

  // Effect: add/remove scroll event listener for infinite scroll (only if genres selected)
  useEffect(() => {
    if (selectedGenres.length > 0) {
      window.addEventListener("scroll", handleScroll);
      return () => window.removeEventListener("scroll", handleScroll);
    }
  }, [selectedGenres, handleScroll]);

  // Only show up to visibleCount shows
  const showsToShow = filteredShows.slice(0, visibleCount);

  // Handler for "Show More" button
  const handleShowMore = () => {
    setVisibleCount((prev) => prev + SHOWS_PER_PAGE);
  };

  return (
    <div className="shows-page">
      {/* Search, filter, and sort row */}
      <div className="show-search-filter-row" style={{ display: "flex", gap: "1rem", alignItems: "center", flexWrap: "wrap" }}>
        {/* Show search input */}
        <div className="show-search-container">
          <input
            type="text"
            placeholder="Search show name..."
            value={showSearch}
            onChange={e => setShowSearch(e.target.value)}
            className="show-search-input"
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
              {genres1.map((genre) => (
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
            className="show-search-input"
            style={{ minWidth: 180 }}
          >
            <option value="">Sort by...</option>
            <option value="alphabetical">Alphabetical (A-Z)</option>
            <option value="rating-asc">Rating (Lowest First)</option>
            <option value="rating-desc">Rating (Highest First)</option>
          </select>
        </div>
      </div>
      {/* Show cards grid */}
      <div className="shows-container">
        {showsToShow.map((show) => (
          <div
            className={`show-card${flipped[show.title] ? " flipped" : ""}`}
            key={show.title}
            onClick={() => handleFlip(show.title)}
          >
            <div className="card-inner">
              {/* Front of the card: shows title, image, and genre */}
              <div className="card-front">
                <h3>{show.title}</h3>
                <img src={show.image} alt="A show cover" />
                <p>{show.genre}</p>
              </div>
              {/* Back of the card: shows about and review */}
              <div className="card-back">
                <p>{show.about}</p>
                <Rating name="half-rating-read" value={show.review} precision={0.5} readOnly />
              </div> 
            </div>
          </div>
        ))}
      </div>
      {/* Show More/Less buttons only if no genre is selected */}
      {filteredShows.length > SHOWS_PER_PAGE && selectedGenres.length === 0 && (
        <div style={{ textAlign: "center", margin: "24px 0" }}>
          {/* Show More button */}
          {visibleCount < filteredShows.length && (
            <button className="show-more-btn" onClick={handleShowMore}>
              Show More
            </button>
          )}
          {/* Show Less button */}
          {visibleCount > SHOWS_PER_PAGE && (
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

export default Shows;