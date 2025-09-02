import "./Books.css";
import { books } from "../../data/books";
import { useState } from "react";
import { genres1 } from "../../data/genres";

function getGenres(selectedGenres) {
  if (!selectedGenres || selectedGenres.length === 0) {
    return books;
  } else {
    return books.filter((book) =>
      selectedGenres.every((genre) => book.genre.includes(genre))
    );
  }
}

const Books = () => {
  const [flipped, setFlipped] = useState({});
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [bookSearch, setBookSearch] = useState("");

  const filteredByGenre = getGenres(selectedGenres);
  const filteredBooks = filteredByGenre.filter(book =>
    book.title.toLowerCase().includes(bookSearch.toLowerCase())
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
    <div className="books-page">
      <div className="book-search-container">
        <input
          type="text"
          placeholder="Search book name..."
          value={bookSearch}
          onChange={e => setBookSearch(e.target.value)}
          className="book-search-input"
        />
      </div>
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
      <div className="books-container">
        {filteredBooks.map((book) => (
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