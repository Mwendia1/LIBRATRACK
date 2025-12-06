import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

const BACKEND = "http://localhost:8000/api";  // CHANGED

export default function Borrow() {
  const location = useLocation();
  const [members, setMembers] = useState([]);
  const [books, setBooks] = useState([]);
  const [memberId, setMemberId] = useState("");
  const [bookId, setBookId] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);

  useEffect(() => {
    // Check if book was passed from Books page
    const state = location.state;
    if (state?.book) {
      setSelectedBook(state.book);
      setBookId(state.book.id);
    }

    fetchMembers();
    fetchAvailableBooks();
  }, [location]);

  const fetchMembers = () => {
    fetch(`${BACKEND}/members`)
      .then(r => {
        if (!r.ok) throw new Error(`HTTP error! status: ${r.status}`);
        return r.json();
      })
      .then(setMembers)
      .catch(error => {
        console.error("Error fetching members:", error);
        alert("Failed to fetch members. Make sure backend is running.");
      });
  };

  const fetchAvailableBooks = () => {
    fetch(`${BACKEND}/books`)
      .then(r => {
        if (!r.ok) throw new Error(`HTTP error! status: ${r.status}`);
        return r.json();
      })
      .then(data => {
        const availableBooks = data.filter(book => book.available_copies > 0);
        setBooks(availableBooks);
      })
      .catch(error => {
        console.error("Error fetching books:", error);
        alert("Failed to fetch books.");
      });
  };

  const handleBorrow = async (e) => {
    e.preventDefault();
    if (!memberId || !bookId) {
      alert("Please select both a member and a book");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${BACKEND}/borrow`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          member_id: parseInt(memberId), 
          book_id: parseInt(bookId) 
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || "Failed to borrow book");
      }

      const result = await response.json();
      alert(`Book borrowed successfully! Due date: ${new Date(result.due_date).toLocaleDateString()}`);
      
      // Reset form
      setMemberId("");
      setBookId("");
      setSelectedBook(null);
      
      // Refresh available books
      fetchAvailableBooks();
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">Borrow a Book</h2>

      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow p-6">
          {selectedBook && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="font-medium text-blue-800 mb-2">Pre-selected Book</h3>
              <p className="text-blue-700">
                <span className="font-semibold">{selectedBook.title}</span> by {selectedBook.author}
              </p>
            </div>
          )}

          <form onSubmit={handleBorrow}>
            <div className="space-y-6">
              {/* Member Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Member *
                </label>
                <select
                  value={memberId}
                  onChange={(e) => setMemberId(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                >
                  <option value="">Choose a member</option>
                  {members.map(member => (
                    <option key={member.id} value={member.id}>
                      {member.name} {member.email && `(${member.email})`}
                    </option>
                  ))}
                </select>
              </div>

              {/* Book Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Book *
                </label>
                <select
                  value={bookId}
                  onChange={(e) => {
                    const selected = books.find(b => b.id === parseInt(e.target.value));
                    setBookId(e.target.value);
                    setSelectedBook(selected);
                  }}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                >
                  <option value="">Choose a book</option>
                  {books.map(book => (
                    <option 
                      key={book.id} 
                      value={book.id}
                      disabled={book.available_copies === 0}
                    >
                      {book.title} by {book.author} 
                      {book.available_copies > 0 
                        ? ` (${book.available_copies} available)` 
                        : ' (Out of stock)'}
                    </option>
                  ))}
                </select>
              </div>

              {/* Book Details (if selected) */}
              {selectedBook && (
                <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <h4 className="font-medium text-gray-800 mb-2">Selected Book Details</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-600">Title:</span>
                      <p className="font-medium">{selectedBook.title}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Author:</span>
                      <p className="font-medium">{selectedBook.author}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Available Copies:</span>
                      <p className="font-medium">{selectedBook.available_copies}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Published:</span>
                      <p className="font-medium">{selectedBook.published_year || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || !memberId || !bookId}
                className="w-full py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Processing...
                  </span>
                ) : (
                  "Borrow Book"
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Available Books List */}
        <div className="mt-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Available Books</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {books.slice(0, 6).map(book => (
              <div key={book.id} className="bg-white rounded-lg shadow p-4 border border-gray-200">
                <h4 className="font-medium text-gray-900">{book.title}</h4>
                <p className="text-sm text-gray-600">{book.author}</p>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-sm px-2 py-1 bg-green-100 text-green-800 rounded-full">
                    {book.available_copies} available
                  </span>
                  <button
                    onClick={() => {
                      setBookId(book.id.toString());
                      setSelectedBook(book);
                    }}
                    className="text-sm px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition"
                  >
                    Select
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}