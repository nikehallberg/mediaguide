import "./Songs.css";
import "../shared/MediaShared.css"

import { songs } from "../../data/songs";
import { genres2 } from "../../data/genres";
import { useState, useEffect } from "react";
import Rating from '@mui/material/Rating';
import FilterBar, { LikeDislike, scrollToContainer, getSearchModes } from "../shared/MediaShared";

// Filters songs by selected genres
// Helper to normalize strings: remove periods and lowercase
function normalize(str) {
  return (str || "").replace(/\./g, '').toLowerCase();
}

function filterSongs(songs, selectedGenres, searchTerm, searchMode) {
  let filtered = songs;
  if (selectedGenres.length > 0) {
    filtered = filtered.filter((song) =>
      selectedGenres.every((genre) => song.genre.includes(genre))
    );
  }
  if (searchTerm) {
    const normSearch = normalize(searchTerm);
    filtered = filtered.filter((song) => {
      if (searchMode === "artist") {
        return normalize(song.artist).includes(normSearch);
      } else {
        return normalize(song.title).includes(normSearch);
      }
    });
  }
  return filtered;
}

const SONGS_PER_PAGE = 9;
const sortOptions = [
  { value: "alphabetical", label: "Alphabetical (A-Z)" },
  { value: "rating-asc", label: "Rating (Lowest First)" },
  { value: "rating-desc", label: "Rating (Highest First)" },
];

const Songs = () => {
  const [flipped, setFlipped] = useState({});
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [songSearch, setSongSearch] = useState("");
  const [sortOption, setSortOption] = useState("");
  const [visibleCount, setVisibleCount] = useState(SONGS_PER_PAGE);

  const [searchMode, setSearchMode] = useState("title");
  let filteredSongs = filterSongs(songs, selectedGenres, songSearch, searchMode);
  const searchModes = getSearchModes(songs);
  if (sortOption === "alphabetical") {
    filteredSongs = [...filteredSongs].sort((a, b) => a.title.localeCompare(b.title));
  } else if (sortOption === "rating-asc") {
    filteredSongs = [...filteredSongs].sort((a, b) => a.review - b.review);
  } else if (sortOption === "rating-desc") {
    filteredSongs = [...filteredSongs].sort((a, b) => b.review - a.review);
  }

  // Handles flipping a song card
  const handleFlip = (title) => {
    setFlipped((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  // Reset flipped cards and visible count when genres/search/sort changes
  useEffect(() => {
    setFlipped({});
    setVisibleCount(SONGS_PER_PAGE);
    // Auto scroll to songs container when a genre is selected
    if (selectedGenres.length > 0) {
      scrollToContainer('songs-container');
    }
  }, [selectedGenres, songSearch, sortOption]);

  return (
    <div className="songs-page">
      <div className="show-search-filter-row">
        <FilterBar
          genres={genres2}
          searchTerm={songSearch}
          setSearchTerm={setSongSearch}
          selectedGenres={selectedGenres}
          setSelectedGenres={setSelectedGenres}
          maxGenres={3}
          visibleCount={visibleCount}
          setVisibleCount={setVisibleCount}
          totalCount={filteredSongs.length}
          perPage={SONGS_PER_PAGE}
          sortOption={sortOption}
          setSortOption={setSortOption}
          sortOptions={sortOptions}
          searchPlaceholder={searchMode === "artist" ? "Search artist..." : "Search song name..."}
          inputClass="song-search-input"
          searchMode={searchMode}
          setSearchMode={setSearchMode}
          searchModes={searchModes}
          data={songs}
        />
      </div>
      <div className="songs-container">
        {filteredSongs.slice(0, visibleCount).map((song) => (
          <div
            className={`song-card${flipped[song.title] ? " flipped" : ""}`}
            key={song.title}
            onClick={() => handleFlip(song.title)}
          >
            <div className="card-inner">
              <div className="card-front">
                <h3>{song.title}</h3>
                <img src={song.image} alt="A song cover" />
                <p>{song.genre}</p>
              </div>
              <div className="card-back">
                <p>{song.about}</p>
                <Rating name="half-rating-read" value={song.review} precision={0.5} readOnly />
                <LikeDislike id={song.title} />
              </div> 
            </div>
          </div>
        ))}
      </div>
      {/* Show More/Less buttons below the card grid */}
      {!selectedGenres.length && filteredSongs.length > SONGS_PER_PAGE && (
        <div style={{ textAlign: "center", margin: "24px 0" }}>
          {visibleCount < filteredSongs.length && (
            <button className="show-more-btn" onClick={() => setVisibleCount((prev) => prev + SONGS_PER_PAGE)}>
              Show More
            </button>
          )}
          {visibleCount > SONGS_PER_PAGE && (
            <button
              className="show-more-btn"
              style={{ marginLeft: "1rem", background: "linear-gradient(90deg, #f4e285, #f7c948)" }}
              onClick={() => setVisibleCount((prev) => Math.max(SONGS_PER_PAGE, prev - SONGS_PER_PAGE))}
            >
              Show Less
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default Songs;