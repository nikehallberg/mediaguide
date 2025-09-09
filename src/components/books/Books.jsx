import "./Books.css";
import { books } from "../../data/books";
import { useState } from "react";
import { genres1 } from "../../data/genres";

// Filters books by selected genres
function getGenres(selectedGenres) {
  if (!selectedGenres || selectedGenres.length === 0) {
    // If no genres selected, return all books
    return books;
  } else {
    // Return books that include all selected genres
    return books.filter((book) =>
      selectedGenres.every((genre) => book.genre.includes(genre))
    );
  }
}

const Books = () => {
  // State for tracking which cards are flipped
  const [flipped, setFlipped] = useState({});
  // State for selected genres
  const [selectedGenres, setSelectedGenres] = useState([]);
  // State for book search input
  const [bookSearch, setBookSearch] = useState("");

  // Filter books by selected genres
  const filteredByGenre = getGenres(selectedGenres);
  // Further filter books by search input (case-insensitive)
  const filteredBooks = filteredByGenre.filter(book =>
    book.title.toLowerCase().includes(bookSearch.toLowerCase())
  );

  // Handles flipping a book card
  const handleFlip = (title) => {
    setFlipped((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  // Handles selecting/deselecting a genre
  const handleGenreClick = (genre) => {
    setSelectedGenres((prev) =>
      prev.includes(genre)
        ? prev.filter((g) => g !== genre) // Remove genre if already selected
        : [...prev, genre] // Add genre if not selected
    );
  };

  // Clears all selected genres
  const clearGenres = () => setSelectedGenres([]);

  return (
    <div className="books-page">
      {/* Search input for book titles */}
      <div className="book-search-container">
        <input
          type="text"
          placeholder="Search book name..."
          value={bookSearch}
          onChange={e => setBookSearch(e.target.value)}
          className="book-search-input"
        />
      </div>
      {/* Genre filter buttons */}
      <div className="genre-btn-container">
        <button className="clear-btn" onClick={clearGenres}>Clear genres</button>
        {genres1.map((genre) => (
          <button
            key={genre}
            onClick={() => handleGenreClick(genre)}
            className={selectedGenres.includes(genre) ? "selected" : ""}
          >
            {genre}
          </button>
        ))}
      </div>
      {/* Book cards grid */}
      <div className="books-container">
        {filteredBooks.map((book) => (
          <div
            className={`book-card${flipped[book.title] ? " flipped" : ""}`}
            key={book.title}
            onClick={() => handleFlip(book.title)}
          >
            <div className="card-inner">
              {/* Front of the card: title, image, genres */}
              <div className="card-front">
                <h3>{book.title}</h3>
                <img src={book.image} alt="A book cover" />
                <p>{book.genre}</p>
              </div>
              {/* Back of the card: about and review */}
              <div className="card-back">
                <p>{book.about}</p>
                <p>{book.review}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Books;