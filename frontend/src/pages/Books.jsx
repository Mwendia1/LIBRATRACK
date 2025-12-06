import { useEffect, useState } from "react";
import BookList from "../components/BookList";
import AddBook from "../components/AddBook";

const OPENLIB_BASE = "https://openlibrary.org/search.json?q=";
const BACKEND = "http://127.0.0.1:8000";

function Books() {
  const [query, setQuery] = useState("the hobbit");
  const [remoteBooks, setRemoteBooks] = useState([]); 

  const [savedBooks, setSavedBooks] = useState([]);   

  useEffect(() => {
    fetchSaved();
  }, []);

  useEffect(() => {
    searchOpenLibrary(query);
  }, []);

  function fetchSaved() {
    fetch(`${BACKEND}/books`)
      .then(r => r.json())
      .then(data => setSavedBooks(data))
      .catch(console.error);
  }

  function searchOpenLibrary(q) {
    if (!q) return setRemoteBooks([]);
    fetch(`${OPENLIB_BASE}${encodeURIComponent(q)}`)
      .then(r => r.json())
      .then(data => {
        const docs = data.docs || [];
        const mapped = docs.map(d => ({
          key: d.key || d.cover_edition_key || d.seed?.[0] || Math.random().toString(36).slice(2),
          title: d.title,
          author: d.author_name ? d.author_name[0] : "Unknown",
          published_year: d.first_publish_year || null,
          cover_id: d.cover_i || null,
        }));
        setRemoteBooks(mapped);
      })
      .catch(console.error);
  }

  function saveBook(book) {
    const payload = {
      title: book.title,
      author: book.author,
      published_year: book.published_year,
      cover_id: book.cover_id,
      copies: 1,
      likes: 0,
      rating: 0,
      rating_count: 0,
      is_favorite: false
      
    };
    fetch(`${BACKEND}/books`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })
      .then(r => r.json())
      .then(() => fetchSaved())
      .catch(console.error);
  }

  
  function like(id) {
    fetch(`${BACKEND}/books/${id}/like`, { method: "PATCH" }).then(fetchSaved).catch(console.error);
  }
  function toggleFavorite(id) {
    fetch(`${BACKEND}/books/${id}/favorite`, { method: "PATCH" }).then(fetchSaved).catch(console.error);
  }
  function rate(id, value) {
    fetch(`${BACKEND}/books/${id}/rate/${value}`, { method: "PATCH" }).then(fetchSaved).catch(console.error);
  }

  return (
    <div style={{ padding: 20, 
     }}>
      <h2>Books</h2>

      <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
        <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search OpenLibrary..." />
        <button onClick={() => searchOpenLibrary(query)}>Search</button>
        <button onClick={fetchSaved}>Refresh Saved</button>
      </div>

      <section>
        <h3>Search results (OpenLibrary)</h3>
        <BookList
          books={remoteBooks}
          remote={true}
          onSave={saveBook}
          onLike={like}
          onToggleFavorite={toggleFavorite}
          onRate={rate}
          savedBooks={savedBooks}
        />
      </section>

      <section>
        <h3>Your Library</h3>
        <AddBook onAdded={fetchSaved} />
        <BookList
          books={savedBooks}
          remote={false}
          onSave={saveBook}
          onLike={like}
          onToggleFavorite={toggleFavorite}
          onRate={rate}
          savedBooks={savedBooks}
        />
      </section>
    </div>
  );
}

export default Books;

