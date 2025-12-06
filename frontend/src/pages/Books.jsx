import { useEffect, useState } from "react";
import BookList from "../components/BookList";
import AddBook from "../components/AddBook";

const OPENLIB_BASE = "https://openlibrary.org/search.json?q=";
const BACKEND = "http://localhost:8000/api";  // CHANGED

function Books() {
  const [query, setQuery] = useState("");
  const [remoteBooks, setRemoteBooks] = useState([]);
  const [savedBooks, setSavedBooks] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSaved();
  }, []);

  const fetchSaved = () => {
    setLoading(true);
    fetch(`${BACKEND}/books`)
      .then(r => {
        if (!r.ok) throw new Error(`HTTP error! status: ${r.status}`);
        return r.json();
      })
      .then(data => {
        setSavedBooks(data);
        setLoading(false);
      })
      .catch(error => {
        console.error("Error fetching books:", error);
        setLoading(false);
        alert("Failed to fetch books. Make sure backend is running on http://localhost:8000");
      });
  };

  const searchOpenLibrary = (q) => {
    if (!q.trim()) {
      setRemoteBooks([]);
      return;
    }
    setLoading(true);
    fetch(`${OPENLIB_BASE}${encodeURIComponent(q)}`)
      .then(r => r.json())
      .then(data => {
        const docs = data.docs || [];
        const mapped = docs.slice(0, 10).map(d => ({
          key: d.key || d.cover_edition_key || d.seed?.[0] || Math.random().toString(36).slice(2),
          title: d.title,
          author: d.author_name ? d.author_name[0] : "Unknown",
          published_year: d.first_publish_year || null,
          cover_id: d.cover_i || null,
        }));
        setRemoteBooks(mapped);
        setLoading(false);
      })
      .catch(error => {
        console.error("Error searching OpenLibrary:", error);
        setLoading(false);
      });
  };

  const saveBook = (book) => {
    const payload = {
      title: book.title,
      author: book.author,
      published_year: book.published_year,
      cover_id: book.cover_id,
      copies: 1
    };
    fetch(`${BACKEND}/books`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })
      .then(r => {
        if (!r.ok) throw new Error(`HTTP error! status: ${r.status}`);
        return r.json();
      })
      .then(() => {
        fetchSaved();
        alert("Book added to library!");
      })
      .catch(error => {
        console.error("Error saving book:", error);
        alert("Failed to save book");
      });
  };

  const handleLike = (id) => {
    fetch(`${BACKEND}/books/${id}/like`, { method: "PATCH" })
      .then(fetchSaved)
      .catch(console.error);
  };

  const handleToggleFavorite = (id) => {
    fetch(`${BACKEND}/books/${id}/favorite`, { method: "PATCH" })
      .then(fetchSaved)
      .catch(console.error);
  };

  const handleRate = (id, value) => {
    fetch(`${BACKEND}/books/${id}/rate/${value}`, { method: "PATCH" })
      .then(fetchSaved)
      .catch(console.error);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    searchOpenLibrary(query);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Books Management</h2>

      {/* Search Section */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h3 className="text-xl font-semibold mb-4">Search OpenLibrary</h3>
        <form onSubmit={handleSearch} className="flex gap-3 mb-4">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for books by title or author..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            disabled={loading}
          >
            {loading ? "Searching..." : "Search"}
          </button>
        </form>

        {remoteBooks.length > 0 && (
          <div>
            <h4 className="text-lg font-medium mb-3">Search Results</h4>
            <BookList
              books={remoteBooks}
              remote={true}
              onSave={saveBook}
              savedBooks={savedBooks}
            />
          </div>
        )}
      </div>

      {/* Library Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold">Your Library</h3>
          <button
            onClick={fetchSaved}
            className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
          >
            Refresh
          </button>
        </div>

        <AddBook onAdded={fetchSaved} />

        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Loading books...</p>
          </div>
        ) : savedBooks.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No books in library yet. Add some books from search results!
          </div>
        ) : (
          <BookList
            books={savedBooks}
            remote={false}
            onLike={handleLike}
            onToggleFavorite={handleToggleFavorite}
            onRate={handleRate}
          />
        )}
      </div>
    </div>
  );
}

export default Books;