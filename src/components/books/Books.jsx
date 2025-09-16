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

const BOOKS_PER_PAGE = 8; // Limit for how many books to show at once

const Books = () => {
  // State for tracking which cards are flipped
  const [flipped, setFlipped] = useState({});
  // State for selected genres
  const [selectedGenres, setSelectedGenres] = useState([]);
  // State for book search input
  const [bookSearch, setBookSearch] = useState("");
  // State for dropdown open/close
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  // State for how many books to show
  const [visibleCount, setVisibleCount] = useState(BOOKS_PER_PAGE);

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

  // Handler for "Show Less" button
const handleShowLess = () => {
  setVisibleCount((prev) => Math.max(BOOKS_PER_PAGE, prev - BOOKS_PER_PAGE));
};

  // Handles selecting/deselecting a genre
  const handleGenreClick = (genre) => {
    setSelectedGenres((prev) => {
      if (prev.includes(genre)) {
        return prev.filter((g) => g !== genre); // Remove if already selected
      } else if (prev.length < 3) {
        return [...prev, genre]; // Add if not selected and under limit
      } else {
        return prev; // Do not add more than 3
      }
    });
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
  
  useEffect(() => {
    // Reset all flipped cards when genres change
    setFlipped({});
    // Reset visible count when filters/search change
    setVisibleCount(BOOKS_PER_PAGE);
  }, [selectedGenres, bookSearch]);

  // Show only a limited number of books
  const booksToShow = filteredBooks.slice(0, visibleCount);

  // Handler for "Show More" button
  const handleShowMore = () => {
    setVisibleCount((prev) => prev + BOOKS_PER_PAGE);
  };

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
                  disabled={
                    !selectedGenres.includes(genre) && selectedGenres.length >= 3
                  }
                  style={
                    !selectedGenres.includes(genre) && selectedGenres.length >= 3
                      ? { opacity: 0.5, cursor: "not-allowed" }
                      : {}
                  }
                >
                  {genre}
                </button>
              ))}
              {selectedGenres.length > 0 && (
                <button className="dropdown-clear-btn" onClick={clearGenres} type="button">
                  Clear
                </button>
              )}
              {selectedGenres.length >= 3 && (
                <div style={{ color: "#b00", fontSize: "0.9em", marginTop: "6px" }}>
                  You can select up to 3 genres.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      {/* Book cards grid */}
      <div className="books-container">
        {booksToShow.map((book) => (
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
      {/* Show More/Less button */}
      {filteredBooks.length > BOOKS_PER_PAGE && (
        <div style={{ textAlign: "center", margin: "24px 0" }}>
        {visibleCount < filteredBooks.length && (
          <button className="show-more-btn" onClick={handleShowMore}>
          Show More
          </button>
        )}
        {visibleCount > BOOKS_PER_PAGE && (
        <button
        className="show-more-btn"
        style={{ marginLeft: "1rem", background: "linear-gradient(90deg, #f4e285, #f7c948)" }}
        onClick={handleShowLess}
      >
        Show Less
      </button>
    )}
  </div>
)}
    </div>
  );
};

export default Books;