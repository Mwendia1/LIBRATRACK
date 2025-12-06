import { useState } from "react";
const BACKEND = "http://localhost:8000/api";  // CHANGED

export default function AddBook({ onAdded }) {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [year, setYear] = useState("");

  function submit(e) {
    e.preventDefault();
    const payload = {
      title,
      author,
      published_year: year ? Number(year) : null,
      copies: 1,
      likes: 0,
      rating: 0,
      rating_count: 0,
      is_favorite: false
    };
    fetch(`${BACKEND}/books`, {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify(payload)
    }).then(r => r.json()).then(() => {
      setTitle(""); setAuthor(""); setYear("");
      onAdded && onAdded();
    }).catch(console.error);
  }

  return (
    <form onSubmit={submit} className="flex gap-2 mb-6">
      <input 
        className="flex-1 px-3 py-2 border border-gray-300 rounded"
        placeholder="Title" 
        value={title} 
        onChange={e=>setTitle(e.target.value)} 
        required 
      />
      <input 
        className="flex-1 px-3 py-2 border border-gray-300 rounded"
        placeholder="Author" 
        value={author} 
        onChange={e=>setAuthor(e.target.value)} 
      />
      <input 
        className="w-24 px-3 py-2 border border-gray-300 rounded"
        placeholder="Year" 
        value={year} 
        onChange={e=>setYear(e.target.value)} 
      />
      <button 
        type="submit"
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Add Book
      </button>
    </form>
  );
}