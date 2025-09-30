import "./Shows.css";
import "../shared/MediaShared.css"


import { shows } from "../../data/shows";
import { useState, useEffect } from "react";
import { genres1 } from "../../data/genres";
import Rating from '@mui/material/Rating';
import FilterBar from "../shared/MediaShared";

// Filters shows by selected genres
function filterShows(shows, selectedGenres, searchTerm) {
  let filtered = shows;
  if (selectedGenres.length > 0) {
    filtered = filtered.filter((show) =>
      selectedGenres.every((genre) => show.genre.includes(genre))
    );
  }
  if (searchTerm) {
    filtered = filtered.filter((show) =>
      show.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
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

  let filteredShows = filterShows(shows, selectedGenres, showSearch);
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
          searchPlaceholder="Search show name..."
          inputClass="show-search-input"
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
              </div> 
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Shows;