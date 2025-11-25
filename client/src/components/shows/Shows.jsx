import "./Shows.css";
import "../shared/MediaShared.css";

import { shows } from "../../data/shows";
import { useState, useEffect } from "react";
import { genres1 } from "../../data/genres";
import Rating from "@mui/material/Rating";
import FilterBar, { LikeDislike } from "../shared/MediaShared";
import { scrollToContainer, getSearchModes } from "../shared/mediaUtils";
import WatchlistButton from "../watchList/WatchlistButton";
import ReviewButton from "../reviews/ReviewButton";

// Helper to normalize strings: remove periods and lowercase
function normalize(str = "") {
  return (str || "").replace(/\./g, "").toLowerCase();
}

function filterShows(showsList, selectedGenres, searchTerm, searchMode) {
  let filtered = showsList;
  if (selectedGenres.length > 0) {
    filtered = filtered.filter((show) =>
      selectedGenres.every((genre) => show.genre.includes(genre))
    );
  }
  if (searchTerm) {
    const normSearch = normalize(searchTerm);
    filtered = filtered.filter((show) => {
      if (searchMode === "actors") {
        return normalize(show.actors || "").includes(normSearch);
      } else {
        return normalize(show.title || "").includes(normSearch);
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

  // Parent cache: key -> watchlist item id (or true)
  const [watchMap, setWatchMap] = useState({});

  // Filter + sort
  let filteredShows = filterShows(
    shows,
    selectedGenres,
    showSearch,
    searchMode
  );
  const searchModes = getSearchModes(shows);
  if (sortOption === "alphabetical") {
    filteredShows = [...filteredShows].sort((a, b) =>
      a.title.localeCompare(b.title)
    );
  } else if (sortOption === "rating-asc") {
    filteredShows = [...filteredShows].sort((a, b) => a.review - b.review);
  } else if (sortOption === "rating-desc") {
    filteredShows = [...filteredShows].sort((a, b) => b.review - a.review);
  }

  // Card flip handler
  const handleFlip = (title) => {
    setFlipped((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  // Reset visual state on filters/search/sort
  useEffect(() => {
    setFlipped({});
    setVisibleCount(SHOWS_PER_PAGE);
    if (selectedGenres.length > 0) scrollToContainer("shows-container");
  }, [selectedGenres, showSearch, sortOption]);

  // Load user's watchlist once and build a map key -> _id
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch("/api/watchlist", { credentials: "include" });
        if (!mounted) return;
        if (!res.ok) {
          setWatchMap({});
          return;
        }
        const data = await res.json().catch(() => ({}));
        const items = data.items || data || [];
        const map = {};
        items.forEach((it) => {
          const key = it.itemId || it.itemTitle || it.title;
          if (key) map[key] = it._id || it.id || true;
        });
        if (mounted) setWatchMap(map);
      } catch (err) {
        console.error("Failed to load watchlist", err);
        if (mounted) setWatchMap({});
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const handleAdded = ({ id, key }) => {
    setWatchMap((prev) => ({ ...prev, [key]: id || true }));
  };

  const handleRemoved = ({ key }) => {
    setWatchMap((prev) => {
      const copy = { ...prev };
      delete copy[key];
      return copy;
    });
  };

  // Reviews callbacks placeholders
  const handleReviewSaved = ({ id, key, review }) => {
    /* optional sync */
  };
  const handleReviewRemoved = ({ id, key }) => {
    /* optional sync */
  };

  return (
    <div className='shows-page'>
      <div className='show-search-filter-row'>
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
          searchPlaceholder={
            searchMode === "actors"
              ? "Search actors/voice-actors..."
              : "Search show name..."
          }
          inputClass='show-search-input'
          searchMode={searchMode}
          setSearchMode={setSearchMode}
          searchModes={searchModes}
          data={shows}
        />
      </div>

      <div className='shows-container' id='shows-container'>
        {filteredShows.slice(0, visibleCount).map((show) => {
          const initialId = watchMap[show.title] || null;
          return (
            <div
              className={`show-card${flipped[show.title] ? " flipped" : ""}`}
              key={show.title}
              onClick={() => handleFlip(show.title)}
            >
              <div className='card-inner'>
                <div className='card-front'>
                  <h3>{show.title}</h3>
                  <img src={show.image} alt={show.title} />
                  <p>{show.genre}</p>
                </div>

                <div className='card-back'>
                  <p>{show.about}</p>
                  <Rating
                    name='half-rating-read'
                    value={show.review}
                    precision={0.5}
                    readOnly
                  />
                  <LikeDislike id={show.title} />

                  <div className='card-actions'>
                    <WatchlistButton
                      itemKey={show.title}
                      itemType='show'
                      itemTitle={show.title}
                      initialId={initialId}
                      onAdd={handleAdded}
                      onRemove={handleRemoved}
                    />

                    <ReviewButton
                      itemKey={show.title}
                      itemType='show'
                      itemTitle={show.title}
                      onSaved={handleReviewSaved}
                      onRemoved={handleReviewRemoved}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {!selectedGenres.length && filteredShows.length > SHOWS_PER_PAGE && (
        <div className='show-more-area'>
          {visibleCount < filteredShows.length && (
            <button
              className='show-more-btn'
              onClick={() => setVisibleCount((prev) => prev + SHOWS_PER_PAGE)}
            >
              Show More
            </button>
          )}
          {visibleCount > SHOWS_PER_PAGE && (
            <button
              className='show-more-btn show-less-btn'
              onClick={() =>
                setVisibleCount((prev) =>
                  Math.max(SHOWS_PER_PAGE, prev - SHOWS_PER_PAGE)
                )
              }
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