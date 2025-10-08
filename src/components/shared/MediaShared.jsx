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
  searchMode = "title",
  setSearchMode = () => {},
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

  const [searchMenuOpen, setSearchMenuOpen] = useState(false);
  return (
    <div className='filter-bar'>
      <div className='media-search-container' style={{ position: "relative", display: "flex", alignItems: "center" }}>
        <input
          type='text'
          placeholder={searchMode === "author" ? "Search author..." : "Search book name..."}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={inputClass}
          style={{ flex: 1, minWidth: '180px', paddingLeft: '28px' }}
        />
        {/* Hamburger menu for search mode */}
        <button
          type="button"
          onClick={() => setSearchMenuOpen(open => !open)}
          style={{
            position: "absolute",
            left: "8px",
            top: "50%",
            transform: "translateY(-50%)",
            background: "none",
            border: "none",
            fontSize: "1.5rem",
            cursor: "pointer",
            color: "#b48a00",
            zIndex: 2
          }}
          aria-label="Search by menu"
        >
          <span style={{ fontSize: "1.5rem" }}>&#9776;</span>
        </button>
        {searchMenuOpen && (
          <div style={{
            position: "absolute",
            left: "40px",
            top: "50%",
            transform: "translateY(-50%)",
            background: "#fffbe6",
            border: "1px solid #b48a00",
            borderRadius: "8px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
            zIndex: 9999,
            minWidth: "120px",
          }}>
            <button
              type="button"
              className={`search-mode-btn${searchMode === "title" ? "" : ""}`}
              style={{ color: searchMode === "title" ? "#b48a00" : undefined, fontWeight: searchMode === "title" ? "bold" : undefined }}
              onClick={() => { setSearchMode("title"); setSearchMenuOpen(false); }}
            >
              Book Name
            </button>
            <button
              type="button"
              className={`search-mode-btn${searchMode === "author" ? "" : ""}`}
              style={{ color: searchMode === "author" ? "#b48a00" : undefined, fontWeight: searchMode === "author" ? "bold" : undefined }}
              onClick={() => { setSearchMode("author"); setSearchMenuOpen(false); }}
            >
              Author
            </button>
          </div>
        )}
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
