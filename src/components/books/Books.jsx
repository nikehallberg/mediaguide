import "./Books.css";
import "../shared/MediaShared.css"


// Import styles and dependencies
import { books } from "../../data/books";
import { useState, useEffect } from "react";
import { genres1 } from "../../data/genres";
import Rating from '@mui/material/Rating';
import FilterBar from "../shared/MediaShared";

// Filters books by selected genres
function filterBooks(books, selectedGenres, searchTerm) {
  let filtered = books;
  if (selectedGenres.length > 0) {
    filtered = filtered.filter((book) =>
      selectedGenres.every((genre) => book.genre.includes(genre))
    );
  }
  if (searchTerm) {
    filtered = filtered.filter((book) =>
      book.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }
  return filtered;
}

// Number of books to show per page/load
const BOOKS_PER_PAGE = 9;
const sortOptions = [
  { value: "alphabetical", label: "Alphabetical (A-Z)" },
  { value: "rating-asc", label: "Rating (Lowest First)" },
  { value: "rating-desc", label: "Rating (Highest First)" },
];


const Books = () => {
  const [flipped, setFlipped] = useState({});
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [bookSearch, setBookSearch] = useState("");
  const [sortOption, setSortOption] = useState("");
  const [visibleCount, setVisibleCount] = useState(BOOKS_PER_PAGE);

  let filteredBooks = filterBooks(books, selectedGenres, bookSearch);
  if (sortOption === "alphabetical") {
    filteredBooks = [...filteredBooks].sort((a, b) => a.title.localeCompare(b.title));
  } else if (sortOption === "rating-asc") {
    filteredBooks = [...filteredBooks].sort((a, b) => a.review - b.review);
  } else if (sortOption === "rating-desc") {
    filteredBooks = [...filteredBooks].sort((a, b) => b.review - a.review);
  }

  // Handles flipping a book card (toggles front/back)
  const handleFlip = (title) => {
    setFlipped((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  // Reset flipped cards and visible count when genres/search/sort changes
  useEffect(() => {
    setFlipped({});
    setVisibleCount(BOOKS_PER_PAGE);
  }, [selectedGenres, bookSearch, sortOption]);

  return (
    <div className="books-page">
      <div className="show-search-filter-row">
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
          sortOption={sortOption}
          setSortOption={setSortOption}
          sortOptions={sortOptions}
          searchPlaceholder="Search book name..."
          inputClass="book-search-input"
        />
      </div>
      <div className="books-container">
        {filteredBooks.slice(0, visibleCount).map((book) => (
          <div
            className={`book-card${flipped[book.title] ? " flipped" : ""}`}
            key={book.title}
            onClick={() => handleFlip(book.title)}
          >
            <div className="card-inner">
              <div className="card-front">
                <h3>{book.title}</h3>
                <img src={book.image} alt="A book cover" />
                <p>{book.genre}</p>
              </div>
              <div className="card-back">
                <p>{book.about}</p>
                <Rating name="half-rating-read" value={book.review} precision={0.5} readOnly />
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* Show More/Less buttons below the card grid */}
      {!selectedGenres.length && filteredBooks.length > BOOKS_PER_PAGE && (
        <div style={{ textAlign: "center", margin: "24px 0" }}>
          {visibleCount < filteredBooks.length && (
            <button className="show-more-btn" onClick={() => setVisibleCount((prev) => prev + BOOKS_PER_PAGE)}>
              Show More
            </button>
          )}
          {visibleCount > BOOKS_PER_PAGE && (
            <button
              className="show-more-btn"
              style={{ marginLeft: "1rem", background: "linear-gradient(90deg, #f4e285, #f7c948)" }}
              onClick={() => setVisibleCount((prev) => Math.max(BOOKS_PER_PAGE, prev - BOOKS_PER_PAGE))}
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