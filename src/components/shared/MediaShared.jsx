// Utility: Enable endless scrolling for a container
export function endlessScroll({ enabled, containerClass, visibleCount, setVisibleCount, totalCount, perPage }) {
  useEffect(() => {
    if (!enabled) return;
    function handleScroll() {
      if (
        window.innerHeight + window.scrollY >=
        document.body.offsetHeight - 100
      ) {
        setVisibleCount((prev) => {
          if (prev >= totalCount) return prev;
          return prev + perPage;
        });
      }
    }
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [enabled, totalCount, perPage, setVisibleCount]);
}
// Utility: Smooth scroll to a container by class name
export function scrollToContainer(className) {
  setTimeout(() => {
    const container = document.querySelector(`.${className}`);
    if (container) {
      container.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, 100);
}
import { useRef, useEffect, useState } from "react";
export const LikeDislike = ({ id }) => {
  const [likes, setLikes] = useState({});
  const [dislikes, setDislikes] = useState({});
  const [voted, setVoted] = useState({});

  const handleLike = () => {
    if (voted[id]) return;
    setLikes((prev) => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
    setVoted((prev) => ({ ...prev, [id]: true }));
  };
  const handleDislike = () => {
    if (voted[id]) return;
    setDislikes((prev) => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
    setVoted((prev) => ({ ...prev, [id]: true }));
  };

  return (
    <div className="like-dislike-container" style={{ display: "flex", gap: "1rem", justifyContent: "center", marginTop: "1rem" }}>
      <button
        type="button"
        onClick={e => { e.stopPropagation(); handleLike(); }}
        disabled={!!voted[id]}
        style={{ fontSize: "1.2rem", border: "none", background: "#fffbe6", borderRadius: "10px", cursor: !!voted[id] ? "not-allowed" : "pointer", padding: "0.5rem 1rem", opacity: !!voted[id] ? 0.6 : 1 }}
      >
        👍 {likes[id] || 0}
      </button>
      <button
        type="button"
        onClick={e => { e.stopPropagation(); handleDislike(); }}
        disabled={!!voted[id]}
        style={{ fontSize: "1.2rem", border: "none", background: "#fffbe6", borderRadius: "10px", cursor: !!voted[id] ? "not-allowed" : "pointer", padding: "0.5rem 1rem", opacity: !!voted[id] ? 0.6 : 1 }}
      >
        👎 {dislikes[id] || 0}
      </button>
    </div>
  );
};

import "../shared/MediaShared.css";





// Add sort dropdown logic and props
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
  searchPlaceholder = "Search...",
  inputClass = "",
  sortOption = "",
  setSortOption,
  sortOptions = [],
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
<div className='media-search-container' style={{ position: "relative" }}>
  <input
    type='text'
    placeholder={searchPlaceholder}
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
    className={inputClass}
  />
  {searchTerm && (
    <button
      type="button"
      onClick={() => setSearchTerm("")}
      style={{
        position: "absolute",
        right: "12px",
        top: "50%",
        transform: "translateY(-50%)",
        background: "none",
        border: "none",
        fontSize: "1.2rem",
        cursor: "pointer",
        color: "#b48a00"
      }}
      aria-label="Clear search"
    >
      ×
    </button>
  )}
</div>
      <div className='dropdown' ref={dropdownRef} style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
        <button
          className='dropbtn'
          onClick={() => setDropdownOpen((open) => !open)}
          type='button'
        >
          Filter by Genre
        </button>
        {selectedGenres.length > 0 && (
          <button
            type="button"
            onClick={clearGenres}
            style={{
              marginLeft: '4px',
              background: 'none',
              border: 'none',
              fontSize: '1.2rem',
              cursor: 'pointer',
              color: '#b48a00',
              padding: 0
            }}
            aria-label="Clear selected genres"
          >
            ×
          </button>
        )}
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
      {/* Sort dropdown if options provided */}
      {sortOptions.length > 0 && setSortOption && (
        <div className="sort-dropdown" style={{ minWidth: 180 }}>
          <select
            value={sortOption}
            onChange={e => setSortOption(e.target.value)}
            className={inputClass}
            style={{ minWidth: 180 }}
          >
            <option value="">Sort by...</option>
            {sortOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
};

export default FilterBar;
