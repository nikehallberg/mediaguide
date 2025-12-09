import { useRef, useEffect, useState } from "react";
export const LikeDislike = ({ id, itemType = "movie", itemTitle, onVote }) => {
  const [userVote, setUserVote] = useState(null); // 'up', 'down', or null
  const [counts, setCounts] = useState({ thumbsUp: 0, thumbsDown: 0 });
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if user is authenticated
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me', { credentials: 'include' });
        const data = await response.json();
        setIsAuthenticated(!!data.user);
      } catch (error) {
        setIsAuthenticated(false);
      }
    };
    checkAuth();
  }, []);

  // Load initial data
  useEffect(() => {
    if (!id || !itemType) return;
    
    const loadData = async () => {
      setLoading(true);
      try {
        // Load vote counts (public)
        const countsResponse = await fetch(`/api/thumbs/${itemType}/${encodeURIComponent(id)}`);
        if (countsResponse.ok) {
          const countsData = await countsResponse.json();
          setCounts({
            thumbsUp: countsData.thumbsUp,
            thumbsDown: countsData.thumbsDown
          });
        }

        // Load user's vote (if authenticated)
        if (isAuthenticated) {
          const userResponse = await fetch(`/api/thumbs/${itemType}/${encodeURIComponent(id)}/user`, {
            credentials: 'include'
          });
          if (userResponse.ok) {
            const userData = await userResponse.json();
            setUserVote(userData.userVote);
          }
        }
      } catch (error) {
        console.error('Error loading thumbs data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id, itemType, isAuthenticated]);

  const changeVote = async (voteType) => {
    if (!isAuthenticated) {
      alert('Please log in to vote');
      return;
    }

    try {
      const response = await fetch('/api/thumbs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          itemType,
          itemId: id,
          itemTitle: itemTitle || id,
          voteType
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to vote');
      }

      const result = await response.json();
      
      // Update local state based on server response
      setUserVote(result.currentVote);
      
      // Refresh counts from server
      const countsResponse = await fetch(`/api/thumbs/${itemType}/${encodeURIComponent(id)}`);
      if (countsResponse.ok) {
        const countsData = await countsResponse.json();
        setCounts({
          thumbsUp: countsData.thumbsUp,
          thumbsDown: countsData.thumbsDown
        });
      }

      // Notify parent component if needed
      if (typeof onVote === "function") {
        onVote(id, result.currentVote, { 
          thumbsUp: countsData.thumbsUp, 
          thumbsDown: countsData.thumbsDown 
        });
      }

    } catch (error) {
      console.error('Error voting:', error);
      alert('Failed to record vote. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="like-dislike-container" style={{ display: "flex", gap: "1rem", justifyContent: "center", marginTop: "1rem" }}>
        <span style={{ fontSize: "0.8rem", color: "#666" }}>Loading...</span>
      </div>
    );
  }

  return (
    <div className="like-dislike-container" style={{ display: "flex", gap: "1rem", justifyContent: "center", marginTop: "1rem" }}>
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); changeVote('up'); }}
        className={`thumb-btn like-btn ${userVote === 'up' ? "selected" : ""}`}
        aria-pressed={userVote === 'up'}
        disabled={!isAuthenticated}
        title={!isAuthenticated ? "Login required to vote" : ""}
      >
        <span aria-hidden>👍</span>
        <span className="count"> {counts.thumbsUp}</span>
      </button>
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); changeVote('down'); }}
        className={`thumb-btn dislike-btn ${userVote === 'down' ? "selected" : ""}`}
        aria-pressed={userVote === 'down'}
        disabled={!isAuthenticated}
        title={!isAuthenticated ? "Login required to vote" : ""}
      >
        <span aria-hidden>👎</span>
        <span className="count"> {counts.thumbsDown}</span>
      </button>
      {!isAuthenticated && (
        <span style={{ fontSize: '0.8rem', color: '#666', alignSelf: 'center' }}>
          Login to vote
        </span>
      )}
    </div>
  );
};

import "./MediaShared.css";


// Add sort dropdown logic and props
const FilterBar = ({
  genres = [],
  searchTerm,
  setSearchTerm,
  selectedGenres,
  setSelectedGenres,
  maxGenres = 3,
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
  searchModes = ["title", "author"],
  data = [],
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

  // Note: pagination controls (show more/less) are implemented in page components; FilterBar exposes setVisibleCount for that purpose.

  const [searchMenuOpen, setSearchMenuOpen] = useState(false);
  const [autocompleteOptions, setAutocompleteOptions] = useState([]);
  const [showAutocomplete, setShowAutocomplete] = useState(false);

  useEffect(() => {
    if (!searchTerm || !data || !searchMode) {
      setAutocompleteOptions([]);
      setShowAutocomplete(false);
      return;
    }
    // Autocomplete using current search mode field, only those starting with input
    const lowerInput = searchTerm.toLowerCase();
    const options = Array.from(new Set(
      data
        .map(item => item[searchMode])
        .filter(val => typeof val === 'string' && val.toLowerCase().startsWith(lowerInput))
    ));
    setAutocompleteOptions(options.length > 0 ? [options[0]] : []);
    setShowAutocomplete(options.length > 0);
  }, [searchTerm, data, searchMode]);
  return (
    <div className='filter-bar'>
      <div className='media-search-container' style={{ position: "relative", display: "flex", alignItems: "center" }}>
        <input
          type='text'
          autoComplete='off'
          placeholder={(() => {
            if (searchMode === "title") return searchPlaceholder || "Search title...";
            if (searchMode === "director") return searchPlaceholder || "Search director...";
            if (searchMode === "actor") return searchPlaceholder || "Search actor...";
            if (searchMode === "actors") return searchPlaceholder || "Search actors/voice-actors...";
            if (searchMode === "author") return searchPlaceholder || "Search author...";
            if (searchMode === "artist") return searchPlaceholder || "Search artist...";
            return searchPlaceholder || "Search...";
          })()}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={inputClass}
          style={{ flex: 1, minWidth: '180px', paddingLeft: '28px' }}
          onFocus={() => setShowAutocomplete(autocompleteOptions.length > 0)}
          onBlur={() => setTimeout(() => setShowAutocomplete(false), 150)}
        />
        {showAutocomplete && (
          <div className='autocomplete-dropdown' style={{
            position: 'absolute',
            left: '0',
            top: '100%',
            background: '#fffbe6',
            border: '1px solid #b48a00',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(33,33,33,0.08)',
            zIndex: 9999,
            minWidth: '180px',
            maxHeight: '180px',
            overflowY: 'auto',
          }}>
            {autocompleteOptions.map(option => (
              <button
                key={option}
                type='button'
                style={{
                  display: 'block',
                  width: '100%',
                  textAlign: 'left',
                  background: 'none',
                  border: 'none',
                  padding: '8px 12px',
                  cursor: 'pointer',
                  color: '#b48a00',
                  fontSize: '1rem',
                }}
                onMouseDown={() => { setSearchTerm(option); setShowAutocomplete(false); }}
              >
                {option}
              </button>
            ))}
          </div>
        )}
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
            boxShadow: "0 2px 8px rgba(33,33,33,0.08)",
            zIndex: 9999,
            minWidth: "120px",
          }}>
            {searchModes.map(mode => (
              <button
                key={mode}
                type="button"
                className={`search-mode-btn${searchMode === mode ? " selected" : ""}`}
                style={{ color: searchMode === mode ? "#b48a00" : undefined, fontWeight: searchMode === mode ? "bold" : undefined }}
                onClick={() => { setSearchMode(mode); setSearchMenuOpen(false); }}
              >
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </button>
            ))}
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
          aria-expanded={dropdownOpen}
        >
          Filter by Genre
        </button>
        {/* Render selected genre chips next to the filter button for visibility */}
        <div className="selected-genres-row" aria-live="polite">
          {selectedGenres.map(g => (
            <button
              key={g}
              type="button"
              className="genre-chip"
              onClick={() => handleGenreClick(g)}
              aria-pressed={true}
              title={`Remove ${g}`}
            >
              <span className="chip-label">{g}</span>
              <span className="chip-remove">×</span>
            </button>
          ))}
        </div>
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
                aria-pressed={selectedGenres.includes(genre)}
              >
                <span className="genre-name">{genre}</span>
                {selectedGenres.includes(genre) && (
                  <span className="genre-checked" aria-hidden>✓</span>
                )}
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
