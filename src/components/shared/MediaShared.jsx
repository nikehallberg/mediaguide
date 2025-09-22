import { movies } from "../../data/movies";
import { books } from "../../data/books";
import { shows } from "../../data/shows";
import { songs } from "../../data/songs";
import "../movies/Movies.css";
import "../shared/MediaShared.css";
import { genres1 } from "../../data/genres";
import Rating from "@mui/material/Rating";

import { useRef, useState, useEffect } from "react";

const FilterBar = ({
  genres = [],
  searchTerm,
  setSearchTerm,
  selectedGenres,
  setSelectedGenres,
  maxGenres = 3,
  visibleCount,
  setVisibleCount,
  totalCount,
  perPage = 12,
  infiniteScroll = false,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const debounceRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownOpen]);

  // Infinite scroll handler (if enabled)
  useEffect(() => {
    if (!infiniteScroll) return;
    function handleScroll() {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        if (
          window.innerHeight + window.scrollY >=
          document.body.offsetHeight - 100
        ) {
          setVisibleCount((prev) => {
            if (prev >= totalCount) return prev;
            return prev + perPage;
          });
        }
      }, 150);
    }
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [infiniteScroll, setVisibleCount, totalCount, perPage]);

  const handleGenreClick = (genre) => {
    if (selectedGenres.includes(genre)) {
      setSelectedGenres(selectedGenres.filter((g) => g !== genre));
    } else if (selectedGenres.length < maxGenres) {
      setSelectedGenres([...selectedGenres, genre]);
    }
  };

  const clearGenres = () => setSelectedGenres([]);

  // Show More/Less handlers (for non-infinite scroll)
  const handleShowMore = () => {
    setVisibleCount((prev) => prev + perPage);
  };
  const handleShowLess = () => {
    setVisibleCount((prev) => Math.max(perPage, prev - perPage));
  };

  return (
    <div className='filter-bar'>
      <div className='movie-search-container'>
        <input
          type='text'
          placeholder='Search movie name...'
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className='movie-search-input'
        />
      </div>
      <div className='dropdown' ref={dropdownRef}>
        <button
          className='dropbtn'
          onClick={() => setDropdownOpen((open) => !open)}
          type='button'
        >
          Filter by Genre
        </button>
        {dropdownOpen && (
          <div className='dropdown-content'>
            {genres.map((genre) => (
              <button
                key={genre}
                className={`dropdown-genre-btn${
                  selectedGenres.includes(genre) ? " selected" : ""
                }`}
                onClick={() => handleGenreClick(genre)}
                type='button'
                disabled={
                  !selectedGenres.includes(genre) &&
                  selectedGenres.length >= maxGenres
                }
                style={
                  !selectedGenres.includes(genre) &&
                  selectedGenres.length >= maxGenres
                    ? { opacity: 0.5, cursor: "not-allowed" }
                    : {}
                }
              >
                {genre}
              </button>
            ))}
            {selectedGenres.length > 0 && (
              <button
                className='dropdown-clear-btn'
                onClick={clearGenres}
                type='button'
              >
                Clear
              </button>
            )}
            {selectedGenres.length >= maxGenres && (
              <div
                style={{ color: "#b00", fontSize: "0.9em", marginTop: "6px" }}
              >
                You can select up to {maxGenres} genres.
              </div>
            )}
          </div>
        )}
      </div>
      {/* Show More/Less buttons only if not infinite scroll and enough items */}
      {!infiniteScroll && totalCount > perPage && (
        <div style={{ textAlign: "center", margin: "24px 0" }}>
          {visibleCount < totalCount && (
            <button className="show-more-btn" onClick={handleShowMore}>
              Show More
            </button>
          )}
          {visibleCount > perPage && (
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

export default FilterBar;
