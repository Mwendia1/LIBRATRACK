import { useState } from "react";

export default function BookCard({ book, remote, onSave, onLike, onToggleFavorite, onRate, savedBooks }) {
  const [rating, setRating] = useState(book.rating || 0);
  const [isFavorite, setIsFavorite] = useState(book.is_favorite || false);
  const isSaved = savedBooks?.some(b => b.title === book.title);

  const coverUrl = book.cover_id 
    ? `https://covers.openlibrary.org/b/id/${book.cover_id}-M.jpg`
    : "https://via.placeholder.com/150x200?text=No+Cover";

  const handleRate = (value) => {
    setRating(value);
    if (onRate && book.id) {
      onRate(book.id, value);
    }
  };

  const handleToggleFavorite = () => {
    setIsFavorite(!isFavorite);
    if (onToggleFavorite && book.id) {
      onToggleFavorite(book.id);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition mb-4">
      <div className="md:flex">
        <div className="md:flex-shrink-0">
          <img 
            className="h-48 w-full object-cover md:w-48" 
            src={coverUrl} 
            alt={book.title}
          />
        </div>
        <div className="p-6 flex-1">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">{book.title}</h3>
              <p className="text-gray-600 mt-1">by {book.author}</p>
              {book.published_year && (
                <p className="text-gray-500 text-sm mt-1">Published: {book.published_year}</p>
              )}
            </div>
            {!remote && (
              <button
                onClick={handleToggleFavorite}
                className={`p-2 rounded-full ${isFavorite ? 'text-red-500 bg-red-50' : 'text-gray-400 hover:text-red-500'}`}
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" />
                </svg>
              </button>
            )}
          </div>

          {!remote && (
            <div className="mt-4 flex items-center space-x-4">
              <div className="flex items-center">
                <button
                  onClick={() => onLike(book.id)}
                  className="flex items-center text-gray-600 hover:text-blue-600"
                >
                  <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                  </svg>
                  {book.likes || 0}
                </button>
              </div>

              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => handleRate(star)}
                    className={`${star <= rating ? 'text-yellow-400' : 'text-gray-400'} hover:text-yellow-500`}
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </button>
                ))}
                <span className="ml-2 text-sm text-gray-600">
                  {book.rating ? book.rating.toFixed(1) : '0.0'} ({book.rating_count || 0})
                </span>
              </div>

              <div className="flex items-center">
                <span className={`px-2 py-1 text-xs rounded-full ${book.available_copies > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {book.available_copies || 0} available
                </span>
              </div>
            </div>
          )}

          <div className="mt-6 flex space-x-3">
            {remote && !isSaved && (
              <button
                onClick={() => onSave(book)}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
              >
                Add to Library
              </button>
            )}
            {!remote && (
              <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition">
                Borrow
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}