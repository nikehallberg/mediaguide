import "./Shows.css";
import "../shared/MediaShared.css"


import { shows } from "../../data/shows";
import { useState, useEffect } from "react";
import { genres1 } from "../../data/genres";
import Rating from '@mui/material/Rating';
import FilterBar, { LikeDislike, scrollToContainer, getSearchModes } from "../shared/MediaShared";

// Filters shows by selected genres
// Helper to normalize strings: remove periods and lowercase
function normalize(str) {
  return (str || "").replace(/\./g, '').toLowerCase();
}

function filterShows(shows, selectedGenres, searchTerm, searchMode) {
  let filtered = shows;
  if (selectedGenres.length > 0) {
    filtered = filtered.filter((show) =>
      selectedGenres.every((genre) => show.genre.includes(genre))
    );
  }
  if (searchTerm) {
    const normSearch = normalize(searchTerm);
    filtered = filtered.filter((show) => {
      if (searchMode === "actors") {
        return normalize(show.actors).includes(normSearch);
      } else {
        return normalize(show.title).includes(normSearch);
      }
    });
  }
  return filtered;
}

const SHOWS_PER_PAGE = 9;
const sortOptions = [
  { value: "alphabetical", label: "Alphabetical (A-Z)" },
  { value: "rating-asc", label: "Rating (Lowest First)" },
  { value: "rating-desc", label: "Rating (Highest First)" },
];

const Shows = () => {
  const [flipped, setFlipped] = useState({});
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [showSearch, setShowSearch] = useState("");
  const [sortOption, setSortOption] = useState("");
  const [visibleCount, setVisibleCount] = useState(SHOWS_PER_PAGE);

  const [searchMode, setSearchMode] = useState("title");
  let filteredShows = filterShows(shows, selectedGenres, showSearch, searchMode);
  const searchModes = getSearchModes(shows);
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

  // Reset flipped cards and visible count when genres/search/sort changes
  useEffect(() => {
    setFlipped({});
    setVisibleCount(SHOWS_PER_PAGE);
    // Auto scroll to shows container when a genre is selected
    if (selectedGenres.length > 0) {
      scrollToContainer('shows-container');
    }
  }, [selectedGenres, showSearch, sortOption]);

  return (
    <div className="shows-page">
      <div className="show-search-filter-row">
        <FilterBar
          genres={genres1}
          searchTerm={showSearch}
          setSearchTerm={setShowSearch}
          selectedGenres={selectedGenres}
          setSelectedGenres={setSelectedGenres}
          maxGenres={3}
          visibleCount={visibleCount}
          setVisibleCount={setVisibleCount}
          totalCount={filteredShows.length}
          perPage={SHOWS_PER_PAGE}
          sortOption={sortOption}
          setSortOption={setSortOption}
          sortOptions={sortOptions}
          searchPlaceholder={searchMode === "actors" ? "Search actors/voice-actors..." : "Search show name..."}
          inputClass="show-search-input"
          searchMode={searchMode}
          setSearchMode={setSearchMode}
          searchModes={searchModes}
          data={shows}
        />
      </div>
      <div className="shows-container">
        {filteredShows.slice(0, visibleCount).map((show) => (
          <div
            className={`show-card${flipped[show.title] ? " flipped" : ""}`}
            key={show.title}
            onClick={() => handleFlip(show.title)}
          >
            <div className="card-inner">
              <div className="card-front">
                <h3>{show.title}</h3>
                <img src={show.image} alt="A show cover" />
                <p>{show.genre}</p>
              </div>
              <div className="card-back">
                <p>{show.about}</p>
                <Rating name="half-rating-read" value={show.review} precision={0.5} readOnly />
                <LikeDislike id={show.title} />
              </div> 
            </div>
          </div>
        ))}
      </div>
      {/* Show More/Less buttons below the card grid */}
      {!selectedGenres.length && filteredShows.length > SHOWS_PER_PAGE && (
        <div style={{ textAlign: "center", margin: "24px 0" }}>
          {visibleCount < filteredShows.length && (
            <button className="show-more-btn" onClick={() => setVisibleCount((prev) => prev + SHOWS_PER_PAGE)}>
              Show More
            </button>
          )}
          {visibleCount > SHOWS_PER_PAGE && (
            <button
              className="show-more-btn"
              style={{ marginLeft: "1rem", background: "linear-gradient(90deg, #f4e285, #f7c948)" }}
              onClick={() => setVisibleCount((prev) => Math.max(SHOWS_PER_PAGE, prev - SHOWS_PER_PAGE))}
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