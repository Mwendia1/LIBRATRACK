import { useEffect, useState } from "react";
import BookCard from "../components/BookCard";

export default function Books() {
  const [books, setBooks] = useState([]);

  useEffect(() => {
    fetch("https://openlibrary.org/search.json?q=the+hobbit")
      .then((res) => res.json())
      .then((data) => {
        setBooks(data.docs); // <-- fix here
      })
      .catch((err) => console.error("Error fetching books:", err));
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h2>📘 All Books</h2>
      <div style={styles.grid}>
        {books.map((book, index) => (
          <BookCard key={book.key || index} book={book} />
        ))}

      </div>
    </div>
  );
}

const styles = {
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
    gap: "20px",
  },
};
