import "./Songs.css";
import { songs } from "../../data/songs";
import { genres2 } from "../../data/genres";
import { useState } from "react";

function getGenres(selectedGenres) {
  if (!selectedGenres || selectedGenres.length === 0) {
    return songs;
  } else {
    return songs.filter((song) =>
      selectedGenres.every((genre) => song.genre.includes(genre))
    );
  }
}

const Songs = () => {
  const [flipped, setFlipped] = useState({});
  const [selectedGenres, setSelectedGenres] = useState([])
  const [songSearch, setSongSearch] = useState("")

  const filteredByGenre = getGenres(selectedGenres);
  const filteredSongs = filteredByGenre.filter(song =>
    song.title.toLowerCase().includes(songSearch.toLowerCase())
  );
  
  const handleFlip = (title) => {
    setFlipped((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  const handleGenreClick = (genre) => {
    setSelectedGenres((prev) =>
      prev.includes(genre)
        ? prev.filter((g) => g !== genre)
        : [...prev, genre]
    );
  };

  const clearGenres = () => setSelectedGenres([]);

  return (
    <div className="songs-page">
      <div className="song-search-container">
        <input
          type="text"
          placeholder="Search song name..."
          value={songSearch}
          onChange={e => setSongSearch(e.target.value)}
          className="song-search-input"
        />
      </div>
      <div className="genre-btn-container">
        <button className="clear-btn" onClick={clearGenres}>Clear genres</button>
        {genres2.map((genre) => (
          <button
            key={genre}
            onClick={() => handleGenreClick(genre)}
            className={selectedGenres.includes(genre) ? "selected" : ""}
          >
            {genre}
          </button>
        ))}
      </div>
      <div className="songs-container">
        {filteredSongs.map((song) => (
          <div
            className={`song-card${flipped[song.title] ? " flipped" : ""}`}
            key={song.title}
            onClick={() => handleFlip(song.title)}
          >
            <div className="card-inner">
            <div className="card-front">
            <h3>{song.title}</h3>
            <img src={song.image} alt="" />
            <p>{song.genre}</p>
            </div>
            <div className="card-back">
            <p>{song.about}</p>
            <p>{song.review}</p>
            {/* <div className="songs-bottom"></div> */}
          </div> 
          </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Songs;
