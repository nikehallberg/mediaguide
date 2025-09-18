import "./Songs.css";
import "../shared/MediaShared.css";
import { songs } from "../../data/songs";
import { genres2 } from "../../data/genres";
import { useState, useRef, useEffect, useCallback } from "react";
import FilterBar from "../shared/MediaShared";
import Rating from '@mui/material/Rating';

// Filters songs by selected genres
function getGenres(selectedGenres) {
  if (!selectedGenres || selectedGenres.length === 0) {
    return songs; // No genres selected, return all songs
  } else {
    // Return songs that include all selected genres
    return songs.filter((song) =>
      selectedGenres.every((genre) => song.genre.includes(genre))
    );
  }
}


const SONGS_PER_PAGE = 9;

const Songs = () => {
  // State for which cards are flipped (for card flip animation)
  const [flipped, setFlipped] = useState({});
  // State for selected genres (array of strings)
  const [selectedGenres, setSelectedGenres] = useState([]);
  // State for the song search input
  const [songSearch, setSongSearch] = useState("");
  // Removed dropdown state/refs (handled by FilterBar)
  // State for how many songs to show (pagination/infinite scroll)
  const [visibleCount, setVisibleCount] = useState(SONGS_PER_PAGE);
  // Ref for debouncing the scroll handler (for infinite scroll)
  const debounceRef = useRef(null);

  // Filter songs by selected genres
  const filteredByGenre = getGenres(selectedGenres);
  // Further filter songs by search input (case-insensitive)
  const filteredSongs = filteredByGenre.filter(song =>
    song.title.toLowerCase().includes(songSearch.toLowerCase())
  );

  // Infinite scroll is now handled by FilterBar

  // Dropdown close handled by FilterBar

  // Effect: reset flipped cards and visible count when genres or search changes
  useEffect(() => {
    setFlipped({});
    setVisibleCount(SONGS_PER_PAGE);
  }, [selectedGenres, songSearch]);

  // Infinite scroll handled by FilterBar

  // Only show up to visibleCount songs (for pagination/infinite scroll)
  const songsToShow = filteredSongs.slice(0, visibleCount);

  // Show More/Less handled by FilterBar

  // Toggles the flipped state for a song card
  const handleFlip = (title) => {
    setFlipped((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  // Genre click/clear handled by FilterBar

  return (
    <div className="songs-page">
      {/* Search and filter row using FilterBar */}
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
          infiniteScroll={selectedGenres.length > 0}
        />
      </div>
      {/* Song cards grid */}
      <div className="songs-container">
        {songsToShow.map((song) => (
          <div
            className={`song-card${flipped[song.title] ? " flipped" : ""}`}
            key={song.title}
            onClick={() => handleFlip(song.title)}
          >
            <div className="card-inner">
              {/* Front of the card: shows title, image, and genre */}
              <div className="card-front">
                <h3>{song.title}</h3>
                <img src={song.image} alt="" />
                <p>{song.genre}</p>
              </div>
              {/* Back of the card: shows about and review */}
              <div className="card-back">
                <p>{song.about}</p>
                <Rating name="half-rating-read" value={song.review} precision={0.5} readOnly />
              </div> 
            </div>
          </div>
        ))}
      </div>
      {/* Show More/Less buttons and infinite scroll are now handled by FilterBar */}
    </div>
  );
};

export default Songs;