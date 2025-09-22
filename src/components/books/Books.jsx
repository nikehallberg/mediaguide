import "./Books.css";

// Import styles and dependencies
import { books } from "../../data/books";
import { useState, useRef, useEffect, useCallback } from "react";
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

// Number of books to show per page/load
const BOOKS_PER_PAGE = 9; // Limit for how many books to show at once


const Books = () => {
  // State for tracking which cards are flipped (for card flip animation)
  const [flipped, setFlipped] = useState({});
  // State for selected genres (array of selected genre strings)
  const [selectedGenres, setSelectedGenres] = useState([]);
  // State for book search input (search bar value)
  const [bookSearch, setBookSearch] = useState("");
  // State for genre dropdown open/close
  const [dropdownOpen, setDropdownOpen] = useState(false);
  // Ref for dropdown element to detect outside clicks
  const dropdownRef = useRef(null);
  // State for sort option (e.g. alphabetical, rating)
  const [sortOption, setSortOption] = useState("");
  // State for how many books to show (pagination/infinite scroll)
  const [visibleCount, setVisibleCount] = useState(BOOKS_PER_PAGE);

  // Ref for debouncing the scroll handler
  const debounceRef = useRef(null);


  // Filter books by selected genres
  const filteredByGenre = getGenres(selectedGenres);
  // Further filter books by search input (case-insensitive)
  let filteredBooks = filteredByGenre.filter(book =>
    book.title.toLowerCase().includes(bookSearch.toLowerCase())
  );


  // Debounced infinite scroll handler: loads more books when scrolled near bottom (only if genres are selected)
  const handleScroll = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (selectedGenres.length === 0) return;
      // Check if user is near the bottom of the page
      if (
        window.innerHeight + window.scrollY >=
        document.body.offsetHeight - 100
      ) {
        setVisibleCount((prev) => {
          if (prev >= filteredBooks.length) return prev;
          return prev + BOOKS_PER_PAGE;
        });
      }
    }, 150); // 150ms debounce delay
  }, [selectedGenres, filteredBooks.length]);


  // Sort books based on sortOption
  if (sortOption === "alphabetical") {
    // Sort alphabetically by title
    filteredBooks = [...filteredBooks].sort((a, b) => a.title.localeCompare(b.title));
  } else if (sortOption === "rating-asc") {
    // Sort by rating, lowest first
    filteredBooks = [...filteredBooks].sort((a, b) => a.review - b.review);
  } else if (sortOption === "rating-desc") {
    // Sort by rating, highest first
    filteredBooks = [...filteredBooks].sort((a, b) => b.review - a.review);
  }


  // Handles flipping a book card (toggles front/back)
  const handleFlip = (title) => {
    setFlipped((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };


    // Handler for "Show Less" button (decreases visible books, but not below 1 page)
    const handleShowLess = () => {
      setVisibleCount((prev) => Math.max(BOOKS_PER_PAGE, prev - BOOKS_PER_PAGE));
    };


  // Handles selecting/deselecting a genre (max 3 genres)
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


  // Effect: closes dropdown if clicking outside of it
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  
  // Effect: reset flipped cards and visible count when genres or search changes
  useEffect(() => {
    setFlipped({});
    setVisibleCount(BOOKS_PER_PAGE);
  }, [selectedGenres, bookSearch]);

  // Effect: add/remove scroll event listener for infinite scroll (only if genres selected)
  useEffect(() => {
    if (selectedGenres.length > 0) {
      window.addEventListener("scroll", handleScroll);
      return () => window.removeEventListener("scroll", handleScroll);
    }
  }, [selectedGenres, handleScroll]);


  // Only show up to visibleCount books (for pagination/infinite scroll)
  const booksToShow = filteredBooks.slice(0, visibleCount);


  // Handler for "Show More" button (increases visible books by one page)
  const handleShowMore = () => {
    setVisibleCount((prev) => prev + BOOKS_PER_PAGE);
  };


  return (
    <div className="books-page">
      {/* Search, filter, and sort row */}
      <div className="show-search-filter-row" style={{ display: "flex", gap: "1rem", alignItems: "center", flexWrap: "wrap" }}>
        {/* Book search input */}
        <div className="book-search-container">
          <input
            type="text"
            placeholder="Search book name..."
            value={bookSearch}
            onChange={e => setBookSearch(e.target.value)}
            className="book-search-input"
          />
        </div>
        {/* Genre filter dropdown */}
        <div className="dropdown" ref={dropdownRef}>
          <button
            className="dropbtn"
            onClick={() => setDropdownOpen((open) => !open)}
          >
            Filter by Genre
          </button>
          {dropdownOpen && (
            <div className="dropdown-content">
              {/* List of genre buttons */}
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
              {/* Clear genres button */}
              {selectedGenres.length > 0 && (
                <button className="dropdown-clear-btn" onClick={clearGenres} type="button">
                  Clear
                </button>
              )}
              {/* Genre selection limit message */}
              {selectedGenres.length >= 3 && (
                <div style={{ color: "#b00", fontSize: "0.9em", marginTop: "6px" }}>
                  You can select up to 3 genres.
                </div>
              )}
            </div>
          )}
        </div>
        {/* Sort dropdown */}
        <div className="sort-dropdown" style={{ minWidth: 180 }}>
          <select
            value={sortOption}
            onChange={e => setSortOption(e.target.value)}
            className="book-search-input"
            style={{ minWidth: 180 }}
          >
            <option value="">Sort by...</option>
            <option value="alphabetical">Alphabetical (A-Z)</option>
            <option value="rating-asc">Rating (Lowest First)</option>
            <option value="rating-desc">Rating (Highest First)</option>
          </select>
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
      {/* Show More/Less buttons only if no genre is selected */}
      {filteredBooks.length > BOOKS_PER_PAGE && selectedGenres.length === 0 && (
        <div style={{ textAlign: "center", margin: "24px 0" }}>
          {/* Show More button */}
          {visibleCount < filteredBooks.length && (
            <button className="show-more-btn" onClick={handleShowMore}>
              Show More
            </button>
          )}
          {/* Show Less button */}
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