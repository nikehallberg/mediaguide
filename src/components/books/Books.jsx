import "./Books.css";
import { books } from "../../data/books";
import { useState } from "react";
import { genres1 } from "../../data/genres";

function getGenres(selectedGenre) {
  if (!selectedGenre) {
    return books 
  } else {
    return books.filter((book) => book.genre.includes(selectedGenre))
  }
}
const Books = () => {
  const [flipped, setFlipped] = useState({});
  const [selectedGenre, setSelectedGenre] = useState(null)
  const filteredBooks = getGenres(selectedGenre)
  
  const handleFlip = title => {
    setFlipped(f =>
      books.map((book, i) =>
        book.title === title ? !f[i] : f[i]
      )
    );
  };
  return (
    <div className="books-page">
      <div className="genre-btn-container">
        <button onClick={() => setSelectedGenre(null)}>All</button>
        {genres1.map((genre) => (
          <button key={genre} onClick={() => setSelectedGenre(genre)}>{genre}</button>
        ))}
      </div>
      <div className="books-container">
        {filteredBooks.map((book) => (
          <div className={`book-card${flipped[books.findIndex(b => b.title === book.title)] ? " flipped" :""}`}
                key={book.title}
                onClick={() => handleFlip(book.title)}
          >
            <div className="card-inner">
            <div className="card-front">
            <h3>{book.title}</h3>
            <img src={book.image} alt="" />
            <p>{book.genre}</p>
            </div>
            <div className="card-back">
            <p>{book.about}</p>
            <p>{book.review}</p>
            {/* <div className="books-bottom"></div> */}
          </div> 
          </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Books;
