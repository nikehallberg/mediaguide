import "./Home.css";
import { books } from "../../data/books";
import { movies } from "../../data/movies";
import { shows } from "../../data/shows";
import { songs } from "../../data/songs";


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


const Home = () => {
  return (
    <div className="home-page">
  <div className="home-header">
    <p className="home-welcome">Welcome to MediaGuide</p>
    <p className="home-info">
      Explore reviews and ratings for books, movies, songs, and shows.
      Use the navigation above to choose a category and start discovering new favorites!
    </p>
  </div>
  <div className="home-recent-section">
    <h2>Recently Added</h2>
    <div className="home-recent-lists">
      <div className="home-recent-card">
        <h3>Books</h3>
        <ul>
          {recentBooks.map(book => (
            <li key={book.title}>
              <img src={book.image} alt={book.title} width={40} />
              {book.title}
            </li>
          ))}
        </ul>
      </div>
      <div className="home-recent-card">
        <h3>Movies</h3>
        <ul>
          {recentMovies.map(movie => (
            <li key={movie.title}>
              <img src={movie.image} alt={movie.title} width={40} />
              {movie.title}
            </li>
          ))}
        </ul>
      </div>
      <div className="home-recent-card">
        <h3>Shows</h3>
        <ul>
          {recentShows.map(show => (
            <li key={show.title}>
              <img src={show.image} alt={show.title} width={40} />
              {show.title}
            </li>
          ))}
        </ul>
      </div>
      <div className="home-recent-card">
        <h3>Songs</h3>
        <ul>
          {recentSongs.map(song => (
            <li key={song.title}>
              <img src={song.image} alt={song.title} width={40} />
              {song.title}
            </li>
          ))}
        </ul>
      </div>
    </div>
  </div>
  {/* <div className="home-bottom"></div> */}
</div>
  );
};

export default Home;
 