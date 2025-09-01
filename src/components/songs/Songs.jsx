import "./Songs.css";
import { songs } from "../../data/songs";
import { genres2 } from "../../data/genres";
import { useState } from "react";

function getGenres(selectedGenre) {
  if (!selectedGenre) {
    return songs 
  } else {
    return songs.filter((song) => song.genre.includes(selectedGenre))
  }
}

const Songs = () => {
  const [flipped, setFlipped] = useState({});
  const [selectedGenre, setSelectedGenre] = useState(null)
  const filteredSongs = getGenres(selectedGenre)

  const handleFlip = title => {
      setFlipped(f =>
        songs.map((song, i) =>
          song.title === title ? !f[i] : f[i]
        )
      );
    };
  return (
    <div className="songs-page">
      <div className="songs-header">
        <h1>Songs</h1>
      </div>
      <div className="genre-btn-container">
          <button onClick={() => setSelectedGenre(null)}>All</button>
          {genres2.map((genre) => (
            <button key={genre} onClick={() => setSelectedGenre(genre)}>{genre}</button>
          ))}
          </div>
      <div className="songs-container">
        {filteredSongs.map((song) => (
          <div className={`song-card${flipped[songs.findIndex(s => s.title === song.title)] ? " flipped" :""}`}
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
          </div>
          </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Songs;
