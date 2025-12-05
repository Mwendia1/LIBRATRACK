import { useEffect, useState } from "react";

export default function Borrow() {
  const [books, setBooks] = useState([]);
  const [members, setMembers] = useState([]);
  const [selectedBook, setSelectedBook] = useState("");
  const [selectedMember, setSelectedMember] = useState("");
  const [borrows, setBorrows] = useState([]);

  const fetchBooks = () => {
    fetch("https://openlibrary.org/search.json?q=the+hobbit")
      .then((res) => res.json())
      .then((data) => setBooks(data.docs))
      .catch((err) => console.error("Error fetching books:", err));
  };

  const fetchMembers = () => {
    fetch("http://localhost:8000/members")
      .then((res) => res.json())
      .then((data) => setMembers(data))
      .catch((err) => console.error("Error fetching members:", err));
  };

  useEffect(() => {
    fetchBooks();
    fetchMembers();
  }, []);

  const handleBorrow = (e) => {
    e.preventDefault();
    if (!selectedBook || !selectedMember) return;

    const bookObj = books.find((b) => b.key === selectedBook);
    const memberObj = members.find((m) => m.id === parseInt(selectedMember));

    setBorrows([
      ...borrows,
      { book: bookObj, member: memberObj, borrowed_at: new Date() },
    ]);

    alert(`"${bookObj.title}" borrowed by ${memberObj.name}!`);
    setSelectedBook("");
    setSelectedMember("");
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>📚 Borrow Book</h2>

      <form onSubmit={handleBorrow} style={styles.form}>
        <select
          value={selectedBook}
          onChange={(e) => setSelectedBook(e.target.value)}
        >
          <option value="">Select Book</option>
          {books.map((b) => (
            <option key={b.key} value={b.key}>
              {b.title} by {b.author_name?.[0] || "Unknown"}
            </option>
          ))}
        </select>

        <select
          value={selectedMember}
          onChange={(e) => setSelectedMember(e.target.value)}
        >
          <option value="">Select Member</option>
          {members.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </select>

        <button type="submit">Borrow</button>
      </form>

      <h3>📖 Borrowed Books</h3>
      <ul>
        {borrows.map((b, idx) => (
          <li key={idx}>
            {b.book.title} — borrowed by {b.member.name} at{" "}
            {b.borrowed_at.toLocaleString()}
          </li>
        ))}
      </ul>
    </div>
  );
}

const styles = {
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    width: "300px",
    marginBottom: "20px",
  },
};
