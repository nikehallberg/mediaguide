import "./Shows.css";
import "../shared/MediaShared.css";
import { shows } from "../../data/shows";
import { useState, useRef, useEffect, useCallback } from "react";
import FilterBar from "../shared/MediaShared";
import { genres1 } from "../../data/genres";
import Rating from '@mui/material/Rating';

// Filters shows by selected genres
function getGenres(selectedGenres) {
  if (!selectedGenres || selectedGenres.length === 0) {
    return shows; // No genres selected, return all shows
  } else {
    // Return shows that include all selected genres
    return shows.filter((show) =>
      selectedGenres.every((genre) => show.genre.includes(genre))
    );
  }
}


const SHOWS_PER_PAGE = 9;

const Shows = () => {
  // State for which cards are flipped (for card flip animation)
  const [flipped, setFlipped] = useState({});
  // State for selected genres (array of strings)
  const [selectedGenres, setSelectedGenres] = useState([]);
  // State for the show search input
  const [showSearch, setShowSearch] = useState("");
  // Removed dropdown state/refs (handled by FilterBar)
  // State for how many shows to show (pagination/infinite scroll)
  const [visibleCount, setVisibleCount] = useState(SHOWS_PER_PAGE);
  // Ref for debouncing the scroll handler (for infinite scroll)
  const debounceRef = useRef(null);

  // Filter shows by selected genres
  const filteredByGenre = getGenres(selectedGenres);
  // Further filter shows by search input (case-insensitive)
  const filteredShows = filteredByGenre.filter(show =>
    show.title.toLowerCase().includes(showSearch.toLowerCase())
  );

  // Infinite scroll is now handled by FilterBar

  // Dropdown close handled by FilterBar

  // Effect: reset flipped cards and visible count when genres or search changes
  useEffect(() => {
    setFlipped({});
    setVisibleCount(SHOWS_PER_PAGE);
  }, [selectedGenres, showSearch]);

  // Infinite scroll handled by FilterBar

  // Only show up to visibleCount shows (for pagination/infinite scroll)
  const showsToShow = filteredShows.slice(0, visibleCount);

  // Show More/Less handled by FilterBar

  return (
    <div className="shows-page">
      {/* Search and filter row using FilterBar */}
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
          infiniteScroll={selectedGenres.length > 0}
        />
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
                <img src={show.image} alt="" />
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
      {/* Show More/Less buttons and infinite scroll are now handled by FilterBar */}
    </div>
  );
};

export default Shows;