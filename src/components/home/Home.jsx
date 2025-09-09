import "./Home.css";
import { books } from "../../data/books";
import { movies } from "../../data/movies";
import { shows } from "../../data/shows";
import { songs } from "../../data/songs";
import { useState } from "react";

//sorts array for most recent, takes the top 3 to display
const recentBooks = [...books]
  .sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded))
  .slice(0, 3);

const recentMovies = [...movies]
  .sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded))
  .slice(0, 3);

const recentShows = [...shows]
  .sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded))
  .slice(0, 3);

const recentSongs = [...songs]
  .sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded))
  .slice(0, 3);


  //state variables
const Home = () => {
  const [bookIdx, setBookIdx] = useState(0);
  const [movieIdx, setMovieIdx] = useState(0);
  const [showIdx, setShowIdx] = useState(0);
  const [songIdx, setSongIdx] = useState(0);
//carousel navigation
  const prev = (idx, setIdx, arr) =>
    setIdx(idx === 0 ? arr.length - 1 : idx - 1);
  const next = (idx, setIdx, arr) =>
    setIdx(idx === arr.length - 1 ? 0 : idx + 1);

  return (
    <div className="home-page">
      <div className="home-header">
        <p className="home-welcome">Welcome to MediaGuide</p>
        <p className="home-info">
          Explore reviews and ratings for books, movies, songs, and shows.
          Use the navigation above to choose a category and start discovering new favorites!
        </p>
      </div>
      <div className="recent-section">
        <h2>Recently Added</h2>
        <div className="recent-grid">
          <div className="recent-category">
            <h3>Books</h3>
            <div className="carousel-container">
              <button
                className="carousel-btn"
                onClick={() => prev(bookIdx, setBookIdx, recentBooks)}
                aria-label="Previous Book"
              >
                &#8592;
              </button>
              <div className="carousel-slide">
                {recentBooks.length > 0 && (
                  <>
                    <img
                      src={recentBooks[bookIdx]?.image}
                      alt={recentBooks[bookIdx]?.title}
                      className="recent-thumb large"
                    />
                    <span>{recentBooks[bookIdx]?.title}</span>
                  </>
                )}
              </div>
              <button
                className="carousel-btn"
                onClick={() => next(bookIdx, setBookIdx, recentBooks)}
                aria-label="Next Book"
              >
                &#8594;
              </button>
            </div>
          </div>
          <div className="recent-category">
            <h3>Movies</h3>
            <div className="carousel-container">
              <button
                className="carousel-btn"
                onClick={() => prev(movieIdx, setMovieIdx, recentMovies)}
                aria-label="Previous Movie"
              >
                &#8592;
              </button>
              <div className="carousel-slide">
                {recentMovies.length > 0 && (
                  <>
                    <img
                      src={recentMovies[movieIdx]?.image}
                      alt={recentMovies[movieIdx]?.title}
                      className="recent-thumb large"
                    />
                    <span>{recentMovies[movieIdx]?.title}</span>
                  </>
                )}
              </div>
              <button
                className="carousel-btn"
                onClick={() => next(movieIdx, setMovieIdx, recentMovies)}
                aria-label="Next Movie"
              >
                &#8594;
              </button>
            </div>
          </div>
          <div className="recent-category">
            <h3>Shows</h3>
            <div className="carousel-container">
              <button
                className="carousel-btn"
                onClick={() => prev(showIdx, setShowIdx, recentShows)}
                aria-label="Previous Show"
              >
                &#8592;
              </button>
              <div className="carousel-slide">
                {recentShows.length > 0 && (
                  <>
                    <img
                      src={recentShows[showIdx]?.image}
                      alt={recentShows[showIdx]?.title}
                      className="recent-thumb large"
                    />
                    <span>{recentShows[showIdx]?.title}</span>
                  </>
                )}
              </div>
              <button
                className="carousel-btn"
                onClick={() => next(showIdx, setShowIdx, recentShows)}
                aria-label="Next Show"
              >
                &#8594;
              </button>
            </div>
          </div>
          <div className="recent-category">
            <h3>Songs</h3>
            <div className="carousel-container">
              <button
                className="carousel-btn"
                onClick={() => prev(songIdx, setSongIdx, recentSongs)}
                aria-label="Previous Song"
              >
                &#8592;
              </button>
              <div className="carousel-slide">
                {recentSongs.length > 0 && (
                  <>
                    <img
                      src={recentSongs[songIdx]?.image}
                      alt={recentSongs[songIdx]?.title}
                      className="recent-thumb large"
                    />
                    <span>{recentSongs[songIdx]?.title}</span>
                  </>
                )}
              </div>
              <button
                className="carousel-btn"
                onClick={() => next(songIdx, setSongIdx, recentSongs)}
                aria-label="Next Song"
              >
                &#8594;
              </button>
            </div>
          </div>
        </div>
      </div>
      <footer className="home-footer">
        <div>
          <span>Contact: </span>
          <a href="mailto:info@mediaguide.com">info@mediaguide.com</a>
        </div>
        <div>
          <span>© {new Date().getFullYear()} MediaGuide</span>
        </div>
      </footer>
    </div>
  );
};

export default Home;