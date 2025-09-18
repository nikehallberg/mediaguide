import "./Books.css";
import "../shared/MediaShared.css";

// Import styles and dependencies
import { books } from "../../data/books";
import { useState, useRef, useEffect, useCallback } from "react";
import { genres1 } from "../../data/genres";
import Rating from '@mui/material/Rating';
import FilterBar from "../shared/MediaShared";

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
      {/* Search, filter, and sort row using FilterBar */}
      <div className="show-search-filter-row" style={{ display: "flex", gap: "1rem", alignItems: "center", flexWrap: "wrap" }}>
        <FilterBar
          genres={genres1}
          searchTerm={bookSearch}
          setSearchTerm={setBookSearch}
          selectedGenres={selectedGenres}
          setSelectedGenres={setSelectedGenres}
          maxGenres={3}
          visibleCount={visibleCount}
          setVisibleCount={setVisibleCount}
          totalCount={filteredBooks.length}
          perPage={BOOKS_PER_PAGE}
          infiniteScroll={selectedGenres.length > 0}
        />
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
      {/* Show More/Less buttons and infinite scroll are now handled by FilterBar */}
    </div>
  );
};


export default Books;