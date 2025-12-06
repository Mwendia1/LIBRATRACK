export default function BookCard({ book, remote=false, onSave, onLike, onToggleFavorite, onRate, savedBooks=[] }) {
  const saved = savedBooks.some(b => b.title === book.title && b.author === book.author);

  return (
    <div style={{ border: "1px solid #f3ededff", padding: 12, margin: 8, borderRadius: 6, background: "#5b5d5eff" }}>
      <h4>{book.title}</h4>
      <p style={{ margin: 0 }}>{book.author || "Unknown"}</p>
      {book.published_year ? <small>Year: {book.published_year}</small> : null}
      <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
        {remote ? (
          <button onClick={() => onSave && onSave(book)} disabled={saved}>
            {saved ? "Saved" : "Save"}
          </button>
        ) : null}

      
        {book.id ? (
          <>
            <button onClick={() => onLike && onLike(book.id)}>❤️ {book.likes ?? 0}</button>
            <button onClick={() => onToggleFavorite && onToggleFavorite(book.id)}>
              {book.is_favorite ? "💛 Unfav" : "🤍 Fav"}
            </button>
            <div>
              {[1,2,3,4,5].map(n => (
                <span key={n} onClick={() => onRate && onRate(book.id, n)} style={{ cursor: "pointer", marginLeft: 6 }}>
                  {n <= Math.round(book.rating || 0) ? "★" : "☆"}
                </span>
              ))}
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
