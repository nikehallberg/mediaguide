import "./Books.css";
import { books } from "../../data/books";
import { useState, useRef, useEffect } from "react";
import { genres1 } from "../../data/genres";
import Rating from '@mui/material/Rating';


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

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

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

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="books-page">
      {/* Search and filter row */}
      <div className="show-search-filter-row">
        <div className="book-search-container">
          <input
            type="text"
            placeholder="Search book name..."
            value={bookSearch}
            onChange={e => setBookSearch(e.target.value)}
            className="book-search-input"
          />
        </div>
        <div className="dropdown" ref={dropdownRef}>
          <button
            className="dropbtn"
            onClick={() => setDropdownOpen((open) => !open)}
          >
            Filter by Genre
          </button>
          {dropdownOpen && (
            <div className="dropdown-content">
              {genres1.map((genre) => (
                <button
                  key={genre}
                  className={`dropdown-genre-btn${selectedGenres.includes(genre) ? " selected" : ""}`}
                  onClick={() => handleGenreClick(genre)}
                  type="button"
                >
                  {genre}
                </button>
              ))}
              {selectedGenres.length > 0 && (
                <button className="dropdown-clear-btn" onClick={clearGenres} type="button">
                  Clear
                </button>
              )}
            </div>
          )}
        </div>
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
                <Rating name="half-rating-read" value={book.review} precision={0.5} readOnly />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Books;