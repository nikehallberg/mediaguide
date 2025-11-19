/* eslint-disable no-unused-vars */
import "./Movies.css";
import "../shared/MediaShared.css";

import { movies } from "../../data/movies";
import { useState, useEffect } from "react";
import { genres1 } from "../../data/genres";
import Rating from "@mui/material/Rating";
import FilterBar, { LikeDislike } from "../shared/MediaShared";
import { scrollToContainer, getSearchModes } from "../shared/mediaUtils";
import WatchlistButton from "./watchlist/WatchlistButton"; // reusable button
import ReviewButton from "../reviews/ReviewButton"; // reusable review button

// Utility: Filter movies by selected genres and search term/mode
function normalize(str) {
  return (str || "").replace(/\./g, "").toLowerCase();
}

function filterMovies(movies, selectedGenres, searchTerm, searchMode) {
  let filtered = movies;
  if (selectedGenres.length > 0) {
    filtered = filtered.filter((movie) =>
      selectedGenres.every((genre) => movie.genre.includes(genre))
    );
  }
  if (searchTerm) {
    const normSearch = normalize(searchTerm);
    filtered = filtered.filter((movie) => {
      if (searchMode === "title") {
        return normalize(movie.title).includes(normSearch);
      } else if (searchMode === "director") {
        return normalize(movie.director).includes(normSearch);
      } else if (searchMode === "actor") {
        return normalize(movie.actor).includes(normSearch);
      }
      return false;
    });
  }
  return filtered;
}

const MOVIES_PER_PAGE = 9;

const sortOptions = [
  { value: "alphabetical", label: "Alphabetical (A-Z)" },
  { value: "rating-asc", label: "Rating (Lowest First)" },
  { value: "rating-desc", label: "Rating (Highest First)" },
];

const Movies = () => {
  const [flipped, setFlipped] = useState({});
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [movieSearch, setMovieSearch] = useState("");
  const [sortOption, setSortOption] = useState("");
  const [visibleCount, setVisibleCount] = useState(MOVIES_PER_PAGE);
  const [searchMode, setSearchMode] = useState("title");

  // Parent cache: key -> watchlist item id (or true)
  const [watchMap, setWatchMap] = useState({});

  // Filter and sort movies
  let filteredMovies = filterMovies(
    movies,
    selectedGenres,
    movieSearch,
    searchMode
  );
  const searchModes = getSearchModes(movies);
  if (sortOption === "alphabetical") {
    filteredMovies = [...filteredMovies].sort((a, b) =>
      a.title.localeCompare(b.title)
    );
  } else if (sortOption === "rating-asc") {
    filteredMovies = [...filteredMovies].sort((a, b) => a.review - b.review);
  } else if (sortOption === "rating-desc") {
    filteredMovies = [...filteredMovies].sort((a, b) => b.review - a.review);
  }

  // Card flip
  const handleFlip = (title) => {
    setFlipped((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  // Reset visual state when filters/search change
  useEffect(() => {
    setVisibleCount(MOVIES_PER_PAGE);
    setFlipped({});
    if (selectedGenres.length > 0) {
      scrollToContainer("movies-container");
    }
  }, [selectedGenres, movieSearch, sortOption]);

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

  // Called when user saves a review (optional: could update local UI)
  const handleReviewSaved = ({ id, key, review }) => {
    // no-op for now; keep for future sync if you want to show review snippets on cards
    // e.g. setReviewMap(prev => ({ ...prev, [key]: review }));
  };

  // Called when user removes a review
  const handleReviewRemoved = ({ id, key }) => {
    // no-op for now
  };

  return (
    <div className='movies-page'>
      <div className='show-search-filter-row'>
        <FilterBar
          genres={genres1}
          searchTerm={movieSearch}
          setSearchTerm={setMovieSearch}
          selectedGenres={selectedGenres}
          setSelectedGenres={setSelectedGenres}
          maxGenres={3}
          visibleCount={visibleCount}
          setVisibleCount={setVisibleCount}
          totalCount={filteredMovies.length}
          perPage={MOVIES_PER_PAGE}
          sortOption={sortOption}
          setSortOption={setSortOption}
          sortOptions={sortOptions}
          searchPlaceholder={
            searchMode === "title"
              ? "Search movie title..."
              : searchMode === "director"
              ? "Search director..."
              : searchMode === "actor"
              ? "Search actor..."
              : "Search..."
          }
          inputClass='movie-search-input'
          searchMode={searchMode}
          setSearchMode={setSearchMode}
          searchModes={searchModes}
          data={movies}
        />
      </div>

      <div className='movies-container' id='movies-container'>
        {filteredMovies.slice(0, visibleCount).map((movie) => {
          const initialId = watchMap[movie.title] || null;
          return (
            <div
              className={`movie-card${flipped[movie.title] ? " flipped" : ""}`}
              key={movie.title}
              onClick={() => handleFlip(movie.title)}
            >
              <div className='card-inner'>
                <div className='card-front'>
                  <h3>{movie.title}</h3>
                  <img src={movie.image} alt={movie.title} />
                  <p>{movie.genre}</p>
                </div>

                <div className='card-back'>
                  <p>{movie.about}</p>
                  <Rating
                    name='half-rating-read'
                    value={movie.review}
                    precision={0.5}
                    readOnly
                  />
                  <LikeDislike id={movie.title} />

                  <div className='card-actions'>
                    <WatchlistButton
                      itemKey={movie.title}
                      itemType='movie'
                      itemTitle={movie.title}
                      initialId={initialId}
                      onAdd={handleAdded}
                      onRemove={handleRemoved}
                    />

                    <ReviewButton
                      itemKey={movie.title}
                      itemType='movie'
                      itemTitle={movie.title}
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

      {!selectedGenres.length && filteredMovies.length > MOVIES_PER_PAGE && (
        <div className='show-more-area'>
          {visibleCount < filteredMovies.length && (
            <button
              className='show-more-btn'
              onClick={() => setVisibleCount((prev) => prev + MOVIES_PER_PAGE)}
            >
              Show More
            </button>
          )}
          {visibleCount > MOVIES_PER_PAGE && (
            <button
              className='show-more-btn show-less-btn'
              onClick={() =>
                setVisibleCount((prev) =>
                  Math.max(MOVIES_PER_PAGE, prev - MOVIES_PER_PAGE)
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

export default Movies;
