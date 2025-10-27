import { useRef, useEffect, useState } from "react";
export const LikeDislike = ({ id, onVote }) => {
  // votes: map id -> 1 (like) | -1 (dislike) | 0/undefined (none)
  const [votes, setVotes] = useState({});
  const [counts, setCounts] = useState({});
  const votesRef = useRef(votes);
  const countsRef = useRef(counts);

  // keep refs in sync
  useEffect(() => { votesRef.current = votes; }, [votes]);
  useEffect(() => { countsRef.current = counts; }, [counts]);

  // Persist/load votes+counts from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(`likeDislikeState:${id}`);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === "object") {
          const storedVote = parsed.vote ?? undefined;
          const storedCounts = typeof parsed.likes === 'number' || typeof parsed.dislikes === 'number'
            ? { likes: parsed.likes || 0, dislikes: parsed.dislikes || 0 }
            : parsed.counts;
          // merge into refs/state maps so multiple items can coexist
          if (typeof storedVote !== 'undefined') {
            const newVotes = { ...votesRef.current, [id]: storedVote };
            votesRef.current = newVotes;
            setVotes(newVotes);
          }
          if (storedCounts) {
            const newCounts = { ...countsRef.current, [id]: storedCounts };
            countsRef.current = newCounts;
            setCounts(newCounts);
          }
        }
      }
    } catch (e) {
      // ignore parse errors
    }
  }, []);

  // Note: per-item persistence is handled in changeVote to avoid different component
  // instances overwriting a single global localStorage object.

  const changeVote = (newVote) => {
    const prevVote = votesRef.current[id] || 0;
    const finalVote = prevVote === newVote ? 0 : newVote;

    // compute new counts deterministically using the refs
    const prevCounts = countsRef.current[id] || { likes: 0, dislikes: 0 };
    let likes = prevCounts.likes;
    let dislikes = prevCounts.dislikes;

    if (prevVote === 1) likes = Math.max(0, likes - 1);
    if (prevVote === -1) dislikes = Math.max(0, dislikes - 1);
    if (finalVote === 1) likes = likes + 1;
    if (finalVote === -1) dislikes = dislikes + 1;

    const newVotes = { ...votesRef.current, [id]: finalVote };
    const newCounts = { ...countsRef.current, [id]: { likes, dislikes } };

    // update refs and states once
    votesRef.current = newVotes;
    countsRef.current = newCounts;
    setVotes(newVotes);
    setCounts(newCounts);

    // notify parent (optional) with the final vote and updated counts for this id
    try {
      if (typeof onVote === "function") onVote(id, finalVote, { likes, dislikes });
    } catch (e) {
      // ignore handler errors
    }
    // persist only this item's state to avoid races between instances
    try {
      const payload = { vote: finalVote, likes, dislikes };
      localStorage.setItem(`likeDislikeState:${id}`, JSON.stringify(payload));
    } catch (e) {
      // ignore storage errors
    }
  };

  const likeCount = counts[id]?.likes || 0;
  const dislikeCount = counts[id]?.dislikes || 0;
  const selected = votes[id] || 0;

  return (
    <div className="like-dislike-container" style={{ display: "flex", gap: "1rem", justifyContent: "center", marginTop: "1rem" }}>
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); changeVote(1); }}
        className={`thumb-btn like-btn ${selected === 1 ? "selected" : ""}`}
        aria-pressed={selected === 1}
      >
        <span aria-hidden>👍</span>
        <span className="count"> {likeCount}</span>
      </button>
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); changeVote(-1); }}
        className={`thumb-btn dislike-btn ${selected === -1 ? "selected" : ""}`}
        aria-pressed={selected === -1}
      >
        <span aria-hidden>👎</span>
        <span className="count"> {dislikeCount}</span>
      </button>
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
